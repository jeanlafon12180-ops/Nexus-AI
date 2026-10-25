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

function settings(env: NodeJS.ProcessEnv, key: string, model: string, baseUrl: string): ProviderSettings {
  return {
    apiKey: env[key]?.trim() ?? "",
    model: env[model]?.trim() || "",
    baseUrl,
  };
}

export function getProviderConfig(env: NodeJS.ProcessEnv = process.env): ProviderConfig {
  return {
    openai: settings(env, "NEXUS_OPENAI_API_KEY", "NEXUS_OPENAI_MODEL", "https://api.openai.com/v1"),
    grok: settings(env, "NEXUS_GROK_API_KEY", "NEXUS_GROK_MODEL", "https://api.x.ai/v1"),
    deepseek: settings(env, "NEXUS_DEEPSEEK_API_KEY", "NEXUS_DEEPSEEK_MODEL", "https://api.deepseek.com"),
    mistral: settings(env, "NEXUS_MISTRAL_API_KEY", "NEXUS_MISTRAL_MODEL", "https://api.mistral.ai/v1"),
    claude: settings(env, "NEXUS_CLAUDE_API_KEY", "NEXUS_CLAUDE_MODEL", "https://api.anthropic.com"),
    gemini: settings(env, "NEXUS_GEMINI_API_KEY", "NEXUS_GEMINI_MODEL", "https://generativelanguage.googleapis.com"),
  };
}
