import { getProviderConfig } from "../config/provider-config.ts";
import { ProviderError, type GenerateInput, type GenerateOutput, type ProviderAdapter } from "./provider-adapter.ts";

export type CompatibleProviderId = "openai" | "grok" | "deepseek" | "mistral";

/** Adaptateur commun aux API compatibles avec le format OpenAI Chat Completions. */
export class OpenAICompatibleAdapter implements ProviderAdapter {
  constructor(readonly providerId: CompatibleProviderId) {}

  isConfigured(): boolean {
    const config = getProviderConfig()[this.providerId];
    return Boolean(config.apiKey && config.model);
  }

  async generate(input: GenerateInput): Promise<GenerateOutput> {
    const config = getProviderConfig()[this.providerId];
    if (!config.apiKey || !config.model) {
      throw new ProviderError("NOT_CONFIGURED", `Le fournisseur ${this.providerId} n'est pas configuré.`, false);
    }

    const startedAt = Date.now();
    let response: Response;
    try {
      response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { authorization: `Bearer ${config.apiKey}`, "content-type": "application/json" },
        body: JSON.stringify({
          model: config.model,
          messages: input.messages,
          max_tokens: input.maxOutputTokens ?? 1200,
          stream: false,
        }),
        signal: input.signal,
        cache: "no-store",
      });
    } catch (error) {
      if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
        throw new ProviderError("TIMEOUT", "La requête au fournisseur a expiré.", true);
      }
      throw new ProviderError("UNAVAILABLE", "Le fournisseur est inaccessible.", true);
    }

    if (response.status === 429) throw new ProviderError("RATE_LIMITED", "Limite du fournisseur atteinte.", true);
    if (response.status >= 500) throw new ProviderError("UNAVAILABLE", "Erreur serveur du fournisseur.", true);
    if (!response.ok) throw new ProviderError("INVALID_RESPONSE", `Le fournisseur a refusé la requête (${response.status}).`, false);

    const payload: unknown = await response.json().catch(() => undefined);
    const text = extractOpenAIText(payload);
    if (!text) throw new ProviderError("INVALID_RESPONSE", "Réponse du fournisseur invalide ou vide.", false);

    return { text, modelId: config.model, providerId: this.providerId, latencyMs: Date.now() - startedAt };
  }
}

function extractOpenAIText(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== "object") return undefined;
  const message = (choices[0] as { message?: unknown }).message;
  if (!message || typeof message !== "object") return undefined;
  const content = (message as { content?: unknown }).content;
  return typeof content === "string" && content.trim() ? content.trim() : undefined;
}
