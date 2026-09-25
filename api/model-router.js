const PRIMARY_MODEL = 'gpt-5.6-sol';
const PRIMARY_URL = 'https://api.openai.com/v1/chat/completions';

function timeoutSignal(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, timer };
}

function isRetryableStatus(status) {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

function configuredFallback() {
  return {
    url: process.env.NEXUS_FALLBACK_API_URL || '',
    key: process.env.NEXUS_FALLBACK_API_KEY || '',
    model: process.env.NEXUS_FALLBACK_MODEL || 'gpt-5.6-luna'
  };
}

function configuredLegacyProvider() {
  return {
    url: 'https://gen.pollinations.ai/v1/chat/completions',
    key: process.env.POLLINATIONS_API_KEY || '',
    model: 'gpt-5.6-sol'
  };
}

async function requestOpenAI({ apiKey, messages, temperature, maxTokens, timeoutMs }) {
  const { controller, timer } = timeoutSignal(timeoutMs);
  try {
    const response = await fetch(PRIMARY_URL, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: PRIMARY_MODEL, messages, temperature, max_tokens: maxTokens }),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error?.message || data?.error || 'OpenAI indisponible.');
      error.status = response.status;
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function requestCompatible({ provider, messages, temperature, maxTokens, timeoutMs }) {
  const { controller, timer } = timeoutSignal(timeoutMs);
  try {
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + provider.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: provider.model, messages, temperature, max_tokens: maxTokens }),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error?.message || data?.error || 'Moteur de secours indisponible.');
      error.status = response.status;
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export async function routeModel({ messages, temperature, maxTokens }) {
  const openAiKey = process.env.OPENAI_API_KEY || '';
  const fallback = configuredFallback();
  const legacy = configuredLegacyProvider();
  let primaryError = null;

  if (openAiKey) {
    try {
      const data = await requestOpenAI({ apiKey: openAiKey, messages, temperature, maxTokens, timeoutMs: 12000 });
      return { data, provider: 'openai', model: PRIMARY_MODEL, fallbackUsed: false };
    } catch (error) {
      primaryError = error;
    }
  } else {
    primaryError = new Error('OPENAI_API_KEY non configurée.');
  }

  if (fallback.url && fallback.key) {
    try {
      const data = await requestCompatible({ provider: fallback, messages, temperature, maxTokens, timeoutMs: 12000 });
      return {
        data,
        provider: 'nexus-fallback',
        model: fallback.model,
        fallbackUsed: true,
        fallbackReason: 'primary_unavailable'
      };
    } catch (error) {
      primaryError = error;
    }
  }

  // Compatibility bridge for the existing V3.2 deployment while the new
  // Nexus fallback endpoint is being configured. It is never presented as
  // an internal Nexus model.
  if (legacy.key) {
    try {
      const data = await requestCompatible({ provider: legacy, messages, temperature, maxTokens, timeoutMs: 12000 });
      return {
        data,
        provider: 'legacy-compatible-fallback',
        model: legacy.model,
        fallbackUsed: true,
        fallbackReason: 'primary_unavailable'
      };
    } catch (error) {
      primaryError = error;
    }
  }

  const finalError = new Error('Aucun moteur IA disponible actuellement.');
  finalError.cause = primaryError?.message || 'primary_unavailable';
  finalError.status = isRetryableStatus(primaryError?.status) ? primaryError.status : 503;
  throw finalError;
}

export function getModelRoutingStatus() {
  const fallback = configuredFallback();
  return {
    primary: { provider: 'openai', model: PRIMARY_MODEL, configured: Boolean(process.env.OPENAI_API_KEY) },
    fallback: { provider: 'nexus-fallback', model: fallback.model, configured: Boolean(fallback.url && fallback.key) },
    compatibilityFallback: { provider: 'legacy-compatible-fallback', configured: Boolean(process.env.POLLINATIONS_API_KEY) }
  };
}
