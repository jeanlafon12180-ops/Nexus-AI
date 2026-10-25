import type {
  GenerateInput,
  GenerateOutput,
  ProviderAdapter,
} from "../providers/provider-adapter.ts";
import { modelRegistry } from "./model-registry.ts";
import { selectModel } from "./model-router.ts";

export interface RoutedGeneration {
  result: GenerateOutput;
  fallbackUsed: boolean;
}

/**
 * Exécute le modèle choisi et, si autorisé, essaie au maximum un modèle
 * secondaire. Ne tente pas de réessayer les erreurs non transitoires.
 */
export async function generateWithFallback(
  input: GenerateInput,
): Promise<RoutedGeneration> {
  const primary = selectModel(input.modelId);
  try {
    return {
      result: await primary.adapter.generate({ ...input, modelId: primary.id }),
      fallbackUsed: false,
    };
  } catch (primaryError) {
    const retryable = isRetryable(primaryError);
    if (!retryable) throw primaryError;

    const backup = modelRegistry
      .listAvailable("chat")
      .find((model) => model.id !== primary.id);

    if (!backup) throw primaryError;

    const result = await backup.adapter.generate({ ...input, modelId: backup.id });
    return { result, fallbackUsed: true };
  }
}

function isRetryable(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("retryable" in error)) {
    return false;
  }
  return (error as { retryable?: unknown }).retryable === true;
}
