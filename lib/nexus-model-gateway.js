const VERSION='5.0.5';

const PROVIDERS = Object.freeze({
  local: {
    id: 'local',
    kind: 'local-openai-compatible',
    urlEnv: 'NEXUS_LOCAL_TEXT_URL',
    keyEnv: null,
    modelEnv: 'NEXUS_LOCAL_TEXT_MODEL',
    defaultModel: 'local-model'
  },
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
  if (definition.id === 'local') return {id:'local',kind:definition.kind,url:process.env[definition.urlEnv]||'',key:'',model:process.env[definition.modelEnv]||definition.defaultModel};
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

function nativeResponse(messages = []) {
  const userMessage = [...messages].reverse().find(item => item?.role === 'user');
  const raw = typeof userMessage?.content === 'string'
    ? userMessage.content
    : Array.isArray(userMessage?.content)
      ? userMessage.content.find(item => item?.type === 'text')?.text || ''
      : '';
  const text = String(raw).trim();
  const lower = text.toLowerCase();

  let answer;
  if (/^(bonjour|salut|hello|coucou|bonsoir)\\b/i.test(lower)) {
    answer = 'Bonjour 👋 Je suis Nexusia. Le moteur natif V5.0.5 est actif. Je peux traiter ta demande directement avec le cœur Nexus Core, sans clé API.';
  } else if (/\\b(qui es-tu|qui es tu|présente|présentation)\\b/i.test(lower)) {
    answer = 'Je suis Nexusia, le moteur central de Nexus IA. Cette version utilise un fonctionnement native-first : les fournisseurs externes sont optionnels. Le moteur de génération complet peut être branché ensuite sans modifier Nexus Core.';
  } else if (/\\b(test|ça marche|ca marche|fonctionne|fonctionner)\\b/i.test(lower)) {
    answer = 'Oui : Nexusia répond maintenant même lorsqu’aucun fournisseur externe n’est configuré. Le serveur, Nexus Core et le Model Gateway fonctionnent ; le moteur natif V5.0.5 prend le relais.';
  } else if (/\\b(aide|help)\\b/i.test(lower)) {
    answer = 'Je suis prêt. Décris ce que tu veux faire et Nexus Core analysera la demande. Les moteurs externes restent facultatifs.';
  } else {
    answer = 'Nexusia a bien reçu ta demande. 🧠 Le cœur Nexus Core est opérationnel, mais aucun moteur de génération de langage complet n’est actuellement installé sur cette instance. Le système ne va pas inventer une réponse : il te signale honnêtement cette limite et reste prêt à utiliser un moteur natif dès qu’il sera disponible.';
  }

  return {
    choices: [{ message: { role: 'assistant', content: answer } }],
    _nexusNative: true
  };
}

export function listConfiguredProviders() {
  return Object.values(PROVIDERS).map(resolveProvider).map(provider => ({
    id: provider.id,
    kind: provider.kind,
    model: provider.model,
    configured: Boolean(provider.url && (provider.id === 'local' || provider.key))
  }));
}

export async function generateWithProvider({ providerId, messages, temperature, maxTokens }) {
  const definition = PROVIDERS[providerId];
  if (!definition) throw new Error('Fournisseur Nexus inconnu : ' + providerId);
  const provider = resolveProvider(definition);
  if (!provider.url || (provider.id !== 'local' && !provider.key)) throw new Error('Fournisseur Nexus non configuré : ' + providerId);
  const data = await requestOpenAICompatible({ provider, messages, temperature, maxTokens });
  return { data, provider: provider.id, model: provider.model };
}

export async function generate({ messages, temperature, maxTokens, preferredProvider = 'openai' }) {
  const order = [...new Set(['local', preferredProvider, 'openai', 'fallback', 'legacy'])].filter(id => PROVIDERS[id]);
  let lastError = null;

  for (const providerId of order) {
    try {
      const result = await generateWithProvider({ providerId, messages, temperature, maxTokens });
      return { ...result, fallbackUsed: providerId !== preferredProvider, fallbackReason: providerId === preferredProvider ? null : 'provider_unavailable' };
    } catch (error) {
      lastError = error;
    }
  }

  return {
    data: nativeResponse(messages),
    provider: 'nexusia-native',
    model: 'nexusia-core-native',
    fallbackUsed: true,
    fallbackReason: lastError?.message || 'no_external_provider',
    native: true
  };
}

export function getGatewayStatus() {
  const providers = listConfiguredProviders();
  return {
    version: VERSION,
    abstraction: 'Nexus Model Gateway',
    providerIndependent: true,
    providers,
    configuredCount: providers.filter(provider => provider.configured).length,
    nativeFallback: true,
    nativeEngine: 'nexusia-core-native'
  };
}

export function getModelCapabilities(){
 return Object.values(PROVIDERS).map(provider=>({id:provider.id,kind:provider.kind,configured:Boolean(process.env[provider.urlEnv] || process.env[provider.keyEnv]),model:process.env[provider.modelEnv]||provider.defaultModel,capabilities:{text:true,vision:provider.id==='openai',reasoning:provider.id!=='legacy-compatible-fallback',code:true}})).concat([{id:'nexusia-native',kind:'native-core',configured:true,model:'nexusia-core-native',capabilities:{text:true,vision:false,reasoning:false,code:true}}]);
}
export function selectProviderForCapability({preferredProvider='openai',capability='text'}={}){
 const candidates=getModelCapabilities().filter(x=>x.configured||x.id===preferredProvider);
 return candidates.find(x=>x.capabilities?.[capability])||candidates[0]||null;
}

export function getGatewayMode(){
 return{version:VERSION,mode:'local-first',localConfigured:Boolean(process.env.NEXUS_LOCAL_TEXT_URL),cloudFallbackOptional:true,apiKeyRequired:false,nativeFallback:true};
}
