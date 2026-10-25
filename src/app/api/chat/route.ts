import { apiError } from "../../../shared/errors.ts";
import { generateWithFallback } from "../../../server/chat/fallback-manager.ts";
import { ModelNotAllowedError, NoModelAvailableError } from "../../../server/chat/model-router.ts";
import { ProviderError } from "../../../server/providers/provider-adapter.ts";
import { validateChatRequest } from "../../../server/security/validate-request.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return json(apiError("INVALID_REQUEST", "Le contenu doit être au format JSON.", false, requestId), 415);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 100_000) {
    return json(apiError("REQUEST_TOO_LARGE", "La requête est trop volumineuse.", false, requestId), 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(apiError("INVALID_REQUEST", "Le JSON envoyé est invalide.", false, requestId), 400);
  }

  const validated = validateChatRequest(body);
  if (!validated.ok) {
    const status = validated.code === "REQUEST_TOO_LARGE" ? 413 : 400;
    return json(apiError(validated.code, validated.message, false, requestId), status);
  }

  try {
    const routed = await generateWithFallback({
      messages: validated.value.messages,
      modelId: validated.value.model,
      signal: AbortSignal.timeout(25_000),
    });

    return json({
      id: requestId,
      message: { role: "assistant", content: routed.result.text },
      model: { id: routed.result.modelId, provider: routed.result.providerId },
      fallbackUsed: routed.fallbackUsed,
    });
  } catch (error) {
    if (error instanceof NoModelAvailableError) {
      return json(apiError("NO_MODEL_AVAILABLE", "Aucun modèle n'est actuellement configuré. Réessayez plus tard.", true, requestId), 503);
    }
    if (error instanceof ModelNotAllowedError) {
      return json(apiError("MODEL_NOT_ALLOWED", "Le modèle demandé n'est pas autorisé ou disponible.", false, requestId), 400);
    }
    if (error instanceof ProviderError) {
      const mapping = {
        NOT_CONFIGURED: { code: "PROVIDER_NOT_CONFIGURED" as const, status: 503, message: "Le fournisseur n'est pas configuré." },
        RATE_LIMITED: { code: "PROVIDER_RATE_LIMITED" as const, status: 429, message: "La limite du fournisseur est atteinte." },
        TIMEOUT: { code: "PROVIDER_TIMEOUT" as const, status: 504, message: "Le fournisseur met trop de temps à répondre." },
        UNAVAILABLE: { code: "PROVIDER_UNAVAILABLE" as const, status: 503, message: "Le fournisseur est temporairement indisponible." },
        INVALID_RESPONSE: { code: "INVALID_PROVIDER_RESPONSE" as const, status: 502, message: "Le fournisseur a renvoyé une réponse invalide." },
      }[error.code];
      return json(apiError(mapping.code, mapping.message, error.retryable, requestId), mapping.status);
    }

    // Ne jamais retourner au client les détails internes ou les secrets d'une exception.
    return json(apiError("INTERNAL_ERROR", "Une erreur interne est survenue.", false, requestId), 500);
  }
}
