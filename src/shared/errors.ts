export type ApiErrorCode =
  | "INVALID_REQUEST"
  | "REQUEST_TOO_LARGE"
  | "RATE_LIMITED"
  | "MODEL_NOT_ALLOWED"
  | "PROVIDER_NOT_CONFIGURED"
  | "PROVIDER_RATE_LIMITED"
  | "PROVIDER_TIMEOUT"
  | "PROVIDER_UNAVAILABLE"
  | "INVALID_PROVIDER_RESPONSE"
  | "NO_MODEL_AVAILABLE"
  | "INTERNAL_ERROR";

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    retryable: boolean;
    requestId: string;
  };
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  retryable: boolean,
  requestId: string,
): ApiErrorBody {
  return { error: { code, message, retryable, requestId } };
}
