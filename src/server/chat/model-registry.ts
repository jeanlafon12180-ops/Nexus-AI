import type { ProviderAdapter } from "../providers/provider-adapter.ts";
import { OpenAICompatibleAdapter } from "../providers/openai-compatible-adapter.ts";
import { ClaudeAdapter } from "../providers/claude-adapter.ts";
import { GeminiAdapter } from "../providers/gemini-adapter.ts";

export interface ModelDefinition {
  id: string;
  providerId: string;
  capabilities: readonly ("chat" | "tools" | "vision")[];
  enabled: boolean;
  adapter: ProviderAdapter;
}

export class ModelRegistry {
  private readonly models = new Map<string, ModelDefinition>();

  register(model: ModelDefinition): void {
    if (!model.id.trim()) throw new Error("Model id is required");
    if (model.id === "auto") throw new Error('"auto" is reserved');
    if (this.models.has(model.id)) throw new Error(`Duplicate model id: ${model.id}`);
    this.models.set(model.id, model);
  }

  get(modelId: string): ModelDefinition | undefined {
    return this.models.get(modelId);
  }

  listAvailable(capability: ModelDefinition["capabilities"][number] = "chat"): ModelDefinition[] {
    return [...this.models.values()].filter(
      (model) => model.enabled && model.capabilities.includes(capability) && model.adapter.isConfigured(),
    );
  }
}

/** Les six fournisseurs sont déclarés ; seuls ceux avec clé ET modèle configurés sont disponibles. */
export const modelRegistry = new ModelRegistry();
for (const [id, providerId, adapter] of [
  ["gpt", "openai", new OpenAICompatibleAdapter("openai")],
  ["grok", "grok", new OpenAICompatibleAdapter("grok")],
  ["deepseek", "deepseek", new OpenAICompatibleAdapter("deepseek")],
  ["mistral", "mistral", new OpenAICompatibleAdapter("mistral")],
  ["claude", "claude", new ClaudeAdapter()],
  ["gemini", "gemini", new GeminiAdapter()],
] as const) {
  modelRegistry.register({ id, providerId, capabilities: ["chat"], enabled: true, adapter });
}
