import { generate, getGatewayStatus } from '../lib/nexus-model-gateway.js';

export async function routeModel({ messages, temperature, maxTokens, preferredProvider = 'openai' }) {
  return generate({ messages, temperature, maxTokens, preferredProvider });
}

export function getModelRoutingStatus() {
  const gateway = getGatewayStatus();
  const primary = gateway.providers.find(provider => provider.id === 'openai');
  const fallback = gateway.providers.find(provider => provider.id === 'nexus-fallback');
  const legacy = gateway.providers.find(provider => provider.id === 'legacy-compatible-fallback');
  return {
    gateway: gateway.abstraction,
    providerIndependent: gateway.providerIndependent,
    primary: { provider: 'openai', model: primary?.model || 'gpt-5.6-sol', configured: Boolean(primary?.configured) },
    fallback: { provider: 'nexus-fallback', model: fallback?.model || 'gpt-5.6-luna', configured: Boolean(fallback?.configured) },
    compatibilityFallback: { provider: 'legacy-compatible-fallback', model: legacy?.model || 'gpt-5.6-sol', configured: Boolean(legacy?.configured) }
  };
}
