import type { ProviderAdapter } from "../providers/provider-adapter";

export interface ModelDefinition {
  /** Identifiant logique public, par ex. "auto" ou "provider-model-a". */
  id: string;
  providerId: string;
  /** Capacités déclarées par le serveur. */
  capabilities: readonly ("chat" | "tools" | "vision")[];
  enabled: boolean;
  adapter: ProviderAdapter;
}

export class ModelRegistry {
  private readonly models = new Map<string, ModelDefinition>();

  register(model: ModelDefinition): void {
    if (!model.id.trim()) throw new Error("Model id is required");
    if (model.id === "auto") throw new Error('"auto" is reserved');
    if (this.models.has(model.id)) {
      throw new Error(`Duplicate model id: ${model.id}`);
    }
    this.models.set(model.id, model);
  }

  get(modelId: string): ModelDefinition | undefined {
    return this.models.get(modelId);
  }

  listAvailable(capability: ModelDefinition["capabilities"][number] = "chat"): ModelDefinition[] {
    return [...this.models.values()].filter(
      (model) =>
        model.enabled &&
        model.capabilities.includes(capability) &&
        model.adapter.isConfigured(),
    );
  }
}

/**
 * Registry vide volontairement : aucun fournisseur n'est configuré à l'étape 3.
 * Les adaptateurs réels seront enregistrés après validation du fournisseur et
 * configuration sécurisée des variables d'environnement à l'étape 4.
 */
export const modelRegistry = new ModelRegistry();
