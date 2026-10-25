import type { ModelMessage } from "../providers/provider-adapter";

export const MAX_MESSAGES = 30;
export const MAX_MESSAGE_CHARS = 8_000;
export const MAX_TOTAL_CHARS = 24_000;
export const ALLOWED_ROLES = new Set(["system", "user", "assistant"]);

export interface ValidatedChatRequest {
  messages: ModelMessage[];
  model: string;
  conversationId?: string;
}

export type ValidationResult =
  | { ok: true; value: ValidatedChatRequest }
  | { ok: false; code: "INVALID_REQUEST" | "REQUEST_TOO_LARGE"; message: string };

export function validateChatRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, code: "INVALID_REQUEST", message: "Le corps JSON doit être un objet." };
  }

  const data = body as Record<string, unknown>;
  if (!Array.isArray(data.messages) || data.messages.length === 0) {
    return { ok: false, code: "INVALID_REQUEST", message: "Au moins un message est requis." };
  }
  if (data.messages.length > MAX_MESSAGES) {
    return { ok: false, code: "REQUEST_TOO_LARGE", message: "La conversation contient trop de messages." };
  }

  let total = 0;
  const messages: ModelMessage[] = [];
  for (const raw of data.messages) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return { ok: false, code: "INVALID_REQUEST", message: "Format de message invalide." };
    }
    const item = raw as Record<string, unknown>;
    if (
      typeof item.role !== "string" ||
      !ALLOWED_ROLES.has(item.role) ||
      typeof item.content !== "string" ||
      item.content.trim().length === 0
    ) {
      return { ok: false, code: "INVALID_REQUEST", message: "Chaque message doit avoir un rôle et un contenu valides." };
    }
    if (item.content.length > MAX_MESSAGE_CHARS) {
      return { ok: false, code: "REQUEST_TOO_LARGE", message: "Un message dépasse la taille autorisée." };
    }
    total += item.content.length;
    messages.push({ role: item.role as ModelMessage["role"], content: item.content });
  }

  if (total > MAX_TOTAL_CHARS) {
    return { ok: false, code: "REQUEST_TOO_LARGE", message: "La conversation dépasse la taille autorisée." };
  }

  const model = typeof data.model === "string" ? data.model : "auto";
  if (!/^[a-zA-Z0-9._:-]{1,100}$/.test(model)) {
    return { ok: false, code: "INVALID_REQUEST", message: "Identifiant de modèle invalide." };
  }

  let conversationId: string | undefined;
  if (data.conversationId !== undefined) {
    if (typeof data.conversationId !== "string" || data.conversationId.length > 100) {
      return { ok: false, code: "INVALID_REQUEST", message: "Identifiant de conversation invalide." };
    }
    conversationId = data.conversationId;
  }

  return { ok: true, value: { messages, model, conversationId } };
}
