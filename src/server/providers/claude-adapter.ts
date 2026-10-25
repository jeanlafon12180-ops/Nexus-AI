import { getProviderConfig } from "../config/provider-config.ts";
import { ProviderError, type GenerateInput, type GenerateOutput, type ProviderAdapter } from "./provider-adapter.ts";

export class ClaudeAdapter implements ProviderAdapter {
  readonly providerId = "claude";
  isConfigured(): boolean {
    const c = getProviderConfig().claude;
    return Boolean(c.apiKey && c.model);
  }

  async generate(input: GenerateInput): Promise<GenerateOutput> {
    const config = getProviderConfig().claude;
    if (!config.apiKey || !config.model) throw new ProviderError("NOT_CONFIGURED", "Claude n'est pas configuré.", false);
    const system = input.messages.filter(m => m.role === "system").map(m => m.content).join("\n\n");
    const messages = input.messages.filter(m => m.role !== "system").map(m => ({ role: m.role, content: m.content }));
    const startedAt = Date.now();
    let response: Response;
    try {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": config.apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: config.model, max_tokens: input.maxOutputTokens ?? 1200, ...(system ? { system } : {}), messages }),
        signal: input.signal,
        cache: "no-store",
      });
    } catch (error) {
      if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) throw new ProviderError("TIMEOUT", "La requête Claude a expiré.", true);
      throw new ProviderError("UNAVAILABLE", "Claude est inaccessible.", true);
    }
    if (response.status === 429) throw new ProviderError("RATE_LIMITED", "Limite Claude atteinte.", true);
    if (response.status >= 500) throw new ProviderError("UNAVAILABLE", "Erreur serveur Claude.", true);
    if (!response.ok) throw new ProviderError("INVALID_RESPONSE", `Claude a refusé la requête (${response.status}).`, false);
    const payload: unknown = await response.json().catch(() => undefined);
    const content = payload && typeof payload === "object" ? (payload as { content?: unknown }).content : undefined;
    const text = Array.isArray(content) ? content.filter(x => x && typeof x === "object" && (x as { type?: unknown }).type === "text").map(x => (x as { text?: unknown }).text).filter((x): x is string => typeof x === "string").join("\n").trim() : "";
    if (!text) throw new ProviderError("INVALID_RESPONSE", "Réponse Claude vide ou invalide.", false);
    return { text, modelId: config.model, providerId: this.providerId, latencyMs: Date.now() - startedAt };
  }
}
