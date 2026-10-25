/** Configuration côté serveur uniquement : ne jamais utiliser NEXT_PUBLIC_ pour les clés. */
export interface ProviderSettings {
  apiKey: string;
  model: string;
  baseUrl: string;
}

export interface ProviderConfig {
  openai: ProviderSettings;
  grok: ProviderSettings;
  deepseek: ProviderSettings;
  mistral: ProviderSettings;
  claude: ProviderSettings;
  gemini: ProviderSettings;
}

function settings(env: NodeJS.ProcessEnv, key: string, modelKey: string, defaultModel: string, baseUrl: string): ProviderSettings {
  return {
    apiKey: env[key]?.trim() ?? "",
    model: env[modelKey]?.trim() || defaultModel,
    baseUrl,
  };
}

export function getProviderConfig(env: NodeJS.ProcessEnv = process.env): ProviderConfig {
  return {
    openai: settings(env, "NEXUS_OPENAI_API_KEY", "NEXUS_OPENAI_MODEL", "gpt-4.1-mini", "https://api.openai.com/v1"),
    grok: settings(env, "NEXUS_GROK_API_KEY", "NEXUS_GROK_MODEL", "grok-3-mini", "https://api.x.ai/v1"),
    deepseek: settings(env, "NEXUS_DEEPSEEK_API_KEY", "NEXUS_DEEPSEEK_MODEL", "deepseek-chat", "https://api.deepseek.com"),
    mistral: settings(env, "NEXUS_MISTRAL_API_KEY", "NEXUS_MISTRAL_MODEL", "mistral-small-latest", "https://api.mistral.ai/v1"),
    claude: settings(env, "NEXUS_CLAUDE_API_KEY", "NEXUS_CLAUDE_MODEL", "claude-3-5-haiku-latest", "https://api.anthropic.com"),
    gemini: settings(env, "NEXUS_GEMINI_API_KEY", "NEXUS_GEMINI_MODEL", "gemini-2.5-flash", "https://generativelanguage.googleapis.com"),
  };
}
