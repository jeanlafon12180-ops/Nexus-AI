import { modelRegistry, type ModelDefinition } from "./model-registry.ts";

export class NoModelAvailableError extends Error {
  constructor() {
    super("Aucun modèle de chat n'est configuré et disponible.");
    this.name = "NoModelAvailableError";
  }
}

export class ModelNotAllowedError extends Error {
  constructor(modelId: string) {
    super(`Le modèle demandé n'est pas autorisé : ${modelId}`);
    this.name = "ModelNotAllowedError";
  }
}

/**
 * Sélection côté serveur uniquement. Le navigateur ne peut pas imposer
 * un fournisseur ni fournir son endpoint.
 */
export function selectModel(requestedModel: string = "auto"): ModelDefinition {
  const available = modelRegistry.listAvailable("chat");

  if (requestedModel === "auto") {
    const selected = available[0];
    if (!selected) throw new NoModelAvailableError();
    return selected;
  }

  const selected = modelRegistry.get(requestedModel);
  if (
    !selected ||
    !selected.enabled ||
    !selected.capabilities.includes("chat") ||
    !selected.adapter.isConfigured()
  ) {
    throw new ModelNotAllowedError(requestedModel);
  }

  return selected;
}
