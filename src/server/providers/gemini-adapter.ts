import { getProviderConfig } from "../config/provider-config.ts";
import { ProviderError, type GenerateInput, type GenerateOutput, type ProviderAdapter } from "./provider-adapter.ts";

export class GeminiAdapter implements ProviderAdapter {
  readonly providerId = "gemini";
  isConfigured(): boolean {
    const c = getProviderConfig().gemini;
    return Boolean(c.apiKey && c.model);
  }

  async generate(input: GenerateInput): Promise<GenerateOutput> {
    const config = getProviderConfig().gemini;
    if (!config.apiKey || !config.model) throw new ProviderError("NOT_CONFIGURED", "Gemini n'est pas configuré.", false);
    const systemInstruction = input.messages.filter(m => m.role === "system").map(m => m.content).join("\n\n");
    const contents = input.messages.filter(m => m.role !== "system").map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const startedAt = Date.now();
    let response: Response;
    try {
      response = await fetch(`${config.baseUrl}/v1beta/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents,
          ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
          generationConfig: { maxOutputTokens: input.maxOutputTokens ?? 1200 },
        }),
        signal: input.signal,
        cache: "no-store",
      });
    } catch (error) {
      if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) throw new ProviderError("TIMEOUT", "La requête Gemini a expiré.", true);
      throw new ProviderError("UNAVAILABLE", "Gemini est inaccessible.", true);
    }
    if (response.status === 429) throw new ProviderError("RATE_LIMITED", "Limite Gemini atteinte.", true);
    if (response.status >= 500) throw new ProviderError("UNAVAILABLE", "Erreur serveur Gemini.", true);
    if (!response.ok) throw new ProviderError("INVALID_RESPONSE", `Gemini a refusé la requête (${response.status}).`, false);
    const payload: unknown = await response.json().catch(() => undefined);
    const candidates = payload && typeof payload === "object" ? (payload as { candidates?: unknown }).candidates : undefined;
    const parts = Array.isArray(candidates) && candidates[0] && typeof candidates[0] === "object"
      ? (candidates[0] as { content?: { parts?: unknown } }).content?.parts : undefined;
    const text = Array.isArray(parts) ? parts.map(p => p && typeof p === "object" ? (p as { text?: unknown }).text : undefined).filter((p): p is string => typeof p === "string").join("\n").trim() : "";
    if (!text) throw new ProviderError("INVALID_RESPONSE", "Réponse Gemini vide ou invalide.", false);
    return { text, modelId: config.model, providerId: this.providerId, latencyMs: Date.now() - startedAt };
  }
}
