const PROVIDERS = Object.freeze({
  openai: {
    id: 'openai',
    kind: 'openai-compatible',
    url: 'https://api.openai.com/v1/chat/completions',
    keyEnv: 'OPENAI_API_KEY',
    modelEnv: 'NEXUS_OPENAI_MODEL',
    defaultModel: 'gpt-5.6-sol'
  },
  fallback: {
    id: 'nexus-fallback',
    kind: 'openai-compatible',
    urlEnv: 'NEXUS_FALLBACK_API_URL',
    keyEnv: 'NEXUS_FALLBACK_API_KEY',
    modelEnv: 'NEXUS_FALLBACK_MODEL',
    defaultModel: 'gpt-5.6-luna'
  },
  legacy: {
    id: 'legacy-compatible-fallback',
    kind: 'openai-compatible',
    url: 'https://gen.pollinations.ai/v1/chat/completions',
    keyEnv: 'POLLINATIONS_API_KEY',
    modelEnv: 'NEXUS_LEGACY_MODEL',
    defaultModel: 'gpt-5.6-sol'
  }
});

function timeoutSignal(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, timer };
}

function isRetryableStatus(status) {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

function resolveProvider(definition) {
  return {
    id: definition.id,
    kind: definition.kind,
    url: definition.url || process.env[definition.urlEnv] || '',
    key: process.env[definition.keyEnv] || '',
    model: process.env[definition.modelEnv] || definition.defaultModel
  };
}

async function requestOpenAICompatible({ provider, messages, temperature, maxTokens, timeoutMs = 12000 }) {
  const { controller, timer } = timeoutSignal(timeoutMs);
  try {
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + provider.key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        temperature,
        max_tokens: maxTokens
      }),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error?.message || data?.error || 'Fournisseur IA indisponible.');
      error.status = response.status;
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export function listConfiguredProviders() {
  return Object.values(PROVIDERS).map(resolveProvider).map(provider => ({
    id: provider.id,
    kind: provider.kind,
    model: provider.model,
    configured: Boolean(provider.url && provider.key)
  }));
}

export async function generateWithProvider({ providerId, messages, temperature, maxTokens }) {
  const definition = PROVIDERS[providerId];
  if (!definition) throw new Error('Fournisseur Nexus inconnu : ' + providerId);
  const provider = resolveProvider(definition);
  if (!provider.url || !provider.key) throw new Error('Fournisseur Nexus non configuré : ' + providerId);
  const data = await requestOpenAICompatible({ provider, messages, temperature, maxTokens });
  return { data, provider: provider.id, model: provider.model };
}

export async function generate({ messages, temperature, maxTokens, preferredProvider = 'openai' }) {
  const order = [...new Set([preferredProvider, 'openai', 'fallback', 'legacy'])].filter(id => PROVIDERS[id]);
  let lastError = null;

  for (const providerId of order) {
    try {
      const result = await generateWithProvider({ providerId, messages, temperature, maxTokens });
      return { ...result, fallbackUsed: providerId !== preferredProvider, fallbackReason: providerId === preferredProvider ? null : 'provider_unavailable' };
    } catch (error) {
      lastError = error;
    }
  }

  const error = new Error('Aucun fournisseur IA disponible actuellement.');
  error.cause = lastError?.message || 'no_provider';
  error.status = isRetryableStatus(lastError?.status) ? lastError.status : 503;
  throw error;
}

export function getGatewayStatus() {
  const providers = listConfiguredProviders();
  return {
    version: '4.6',
    abstraction: 'Nexus Model Gateway',
    providerIndependent: true,
    providers,
    configuredCount: providers.filter(provider => provider.configured).length
  };
}
