/**
 * Nexus IA — contrat commun des adaptateurs de modèles.
 * Serveur uniquement : ne jamais importer ce module dans le navigateur.
 */

export type ProviderErrorCode =
  | "NOT_CONFIGURED"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "UNAVAILABLE"
  | "INVALID_RESPONSE";

export class ProviderError extends Error {
  constructor(
    public readonly code: ProviderErrorCode,
    message: string,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export interface ModelMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerateInput {
  messages: ModelMessage[];
  /** Identifiant de modèle contrôlé par le serveur, jamais une URL arbitraire. */
  modelId: string;
  maxOutputTokens?: number;
  signal?: AbortSignal;
}

export interface GenerateOutput {
  text: string;
  modelId: string;
  providerId: string;
  latencyMs: number;
}

export interface ProviderAdapter {
  readonly providerId: string;
  isConfigured(): boolean;
  generate(input: GenerateInput): Promise<GenerateOutput>;
}
