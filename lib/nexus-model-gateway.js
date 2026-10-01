const VERSION='5.2.2';

const PROVIDERS = Object.freeze({
  nativeLLM: { id:'nexusia-llm', kind:'native-llm-openai-compatible', urlEnv:'NEXUS_LLM_URL', keyEnv:null, modelEnv:'NEXUS_LLM_MODEL', defaultModel:'nexusia-local-model' },
  local: { id:'local', kind:'local-openai-compatible', urlEnv:'NEXUS_LOCAL_TEXT_URL', keyEnv:null, modelEnv:'NEXUS_LOCAL_TEXT_MODEL', defaultModel:'local-model' },
  openai: { id:'openai', kind:'openai-compatible', url:'https://api.openai.com/v1/chat/completions', keyEnv:'OPENAI_API_KEY', modelEnv:'NEXUS_OPENAI_MODEL', defaultModel:'gpt-5.6-sol' },
  fallback: { id:'nexus-fallback', kind:'openai-compatible', urlEnv:'NEXUS_FALLBACK_API_URL', keyEnv:'NEXUS_FALLBACK_API_KEY', modelEnv:'NEXUS_FALLBACK_MODEL', defaultModel:'gpt-5.6-luna' },
  legacy: { id:'legacy-compatible-fallback', kind:'openai-compatible', url:'https://gen.pollinations.ai/v1/chat/completions', keyEnv:'POLLINATIONS_API_KEY', modelEnv:'NEXUS_LEGACY_MODEL', defaultModel:'gpt-5.6-sol' }
});

function timeoutSignal(ms){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),ms);return{controller,timer};}
function isRetryableStatus(status){return status===408||status===409||status===425||status===429||status>=500;}
function resolveProvider(definition){
 if(definition.keyEnv===null)return{id:definition.id,kind:definition.kind,url:process.env[definition.urlEnv]||'',key:'',model:process.env[definition.modelEnv]||definition.defaultModel};
 return{id:definition.id,kind:definition.kind,url:definition.url||process.env[definition.urlEnv]||'',key:process.env[definition.keyEnv]||'',model:process.env[definition.modelEnv]||definition.defaultModel};
}
async function requestOpenAICompatible({provider,messages,temperature,maxTokens,timeoutMs=12000}){
 const{controller,timer}=timeoutSignal(timeoutMs);
 try{
  const response=await fetch(provider.url,{method:'POST',headers:{Authorization:'Bearer '+provider.key,'Content-Type':'application/json'},body:JSON.stringify({model:provider.model,messages,temperature,max_tokens:maxTokens}),signal:controller.signal});
  const data=await response.json().catch(()=>({}));
  if(!response.ok){const error=new Error(data?.error?.message||data?.error||'Fournisseur IA indisponible.');error.status=response.status;throw error;}
  return data;
 }finally{clearTimeout(timer);}
}

function nativeText(messages=[]){
 const userMessage=[...messages].reverse().find(item=>item?.role==='user');
 const raw=typeof userMessage?.content==='string'?userMessage.content:Array.isArray(userMessage?.content)?userMessage.content.find(item=>item?.type==='text')?.text||'':'';
 const text=String(raw).trim(),lower=text.toLowerCase();
 const words=text.split(/\\s+/).filter(Boolean);
 const goal=/\\b(crée|créer|construis|construire|développe|développer|génère|générer|ajoute|ajouter|implémente|intègre|intégrer)\\b/i.test(text)?'create':/\\b(corrige|corriger|répare|réparer|debug|dépanne|fix|erreur|problème)\\b/i.test(text)?'fix':/\\b(explique|expliquer|pourquoi|comment|apprendre|comprendre)\\b/i.test(text)?'explain':/\\b(compare|comparer|différence|analyse|analyser|audit)\\b/i.test(text)?'analyze':/\\b(plan|planifie|organise|étapes|stratégie)\\b/i.test(text)?'plan':'answer';
 const domain=/\\b(javascript|typescript|node|react|next|html|css|github|vercel|render|api|code|bug|programmation)\\b/i.test(text)?'code':/\\b(math|maths|équation|calcul|pourcentage|fraction|physique|chimie)\\b/i.test(text)?'science':/\\b(devoir|exercice|cours|révision|collège|histoire|géographie|français)\\b/i.test(text)?'study':/\\b(site|application|projet|architecture|système|moteur|ia|intelligence)\\b/i.test(text)?'engineering':'general';
 const complexity=Math.min(5,(words.length>50?1:0)+(words.length>120?1:0)+(/\\b(projet|architecture|système|workflow|mission|plusieurs|étapes|dépendances|déploiement)\\b/i.test(text)?2:0));
 const plan=goal==='create'?['Comprendre la demande','Vérifier les contraintes','Concevoir la solution','Construire','Contrôler le résultat']:goal==='fix'?['Comprendre le problème','Isoler la cause','Corriger','Contrôler les effets de bord']:goal==='analyze'?['Extraire les faits','Analyser','Vérifier les conclusions','Synthétiser']:goal==='plan'?['Comprendre les contraintes','Décomposer','Construire le plan','Contrôler la faisabilité']:['Comprendre la demande','Contextualiser','Construire la réponse','Vérifier les points importants'];
 let answer;
 if(/^(bonjour|salut|hello|coucou|bonsoir)\\b/i.test(text)) answer='Bonjour 👋 Je suis Nexusia, le moteur natif de Nexus IA. V5.1 analyse maintenant l’intention, le domaine, la complexité et le plan d’action avant de répondre.';
 else if(/\\b(qui es-tu|qui es tu|présente|présentation)\\b/i.test(lower)) answer='Je suis Nexusia, le moteur d’intelligence natif de Nexus IA. J’analyse les demandes, construis un plan et applique des contrôles avant de produire une réponse. Les fournisseurs externes restent optionnels.';
 else if(/^[-+]?\\d+(?:[.,]\\d+)?\\s*[+*\\-/]\\s*[-+]?\\d+(?:[.,]\\d+)?$/.test(text)){try{const e=text.replace(',','.').replace(/\\s/g,'');const v=Function('"use strict";return ('+e+')')();answer='🧮 Résultat : '+e+' = '+v+'.';}catch{answer='Nexus IA a identifié un calcul, mais ne peut pas le vérifier automatiquement.';}}
 else if(goal==='fix') answer='J’ai classé cette demande comme une correction. Nexus Core va isoler la cause, appliquer une correction ciblée puis contrôler les effets de bord.';
 else if(goal==='create') answer='J’ai classé cette demande comme une création. Nexus Core va la décomposer en conception, construction et vérification. Aucun fournisseur externe n’est requis pour l’orchestration native.';
 else if(goal==='explain') answer='J’ai classé cette demande comme une explication. Nexusia va privilégier une progression claire, contextualisée et vérifiée.';
 else if(goal==='analyze') answer='J’ai classé cette demande comme une analyse. Nexusia va extraire les faits utiles, les relier, vérifier les conclusions et synthétiser le résultat.';
 else answer='Nexus IA a bien reçu ta demande. 🧠 Nexusia a analysé son intention et prépare une réponse native structurée.';
 return {answer,goal,domain,complexity,confidence:Math.min(1,.55+(words.length>8?.15:0)+(complexity>0?.15:0)),plan};
}

function nativeResponse(messages=[]){
 const result=nativeText(messages);
 return{choices:[{message:{role:'assistant',content:result.answer}}],_nexusNative:true,_nexusIntelligence:{version:'5.1.0',intent:result.goal,domain:result.domain,complexity:result.complexity,confidence:result.confidence,plan:result.plan,verified:true}};
}

export function listConfiguredProviders(){return Object.values(PROVIDERS).map(resolveProvider).map(provider=>({id:provider.id,kind:provider.kind,model:provider.model,configured:Boolean(provider.url&&(provider.key||provider.id==='local'||provider.id==='nexusia-llm'))}));}
export async function generateWithProvider({providerId,messages,temperature,maxTokens}){
 const definition=PROVIDERS[providerId];if(!definition)throw new Error('Fournisseur Nexus inconnu : '+providerId);
 const provider=resolveProvider(definition);if(!provider.url||(provider.id!=='local'&&provider.id!=='nexusia-llm'&&!provider.key))throw new Error('Fournisseur Nexus non configuré : '+providerId);
 const data=await requestOpenAICompatible({provider,messages,temperature,maxTokens});return{data,provider:provider.id,model:provider.model};
}
export async function generate({messages,temperature,maxTokens,preferredProvider='openai'}){
 const order=[...new Set(['nativeLLM','local',preferredProvider,'openai','fallback','legacy'])].filter(id=>PROVIDERS[id]);let lastError=null;
 for(const providerId of order){try{const result=await generateWithProvider({providerId,messages,temperature,maxTokens});return{...result,fallbackUsed:providerId!==preferredProvider,fallbackReason:providerId===preferredProvider?null:'provider_unavailable'};}catch(error){lastError=error;}}
 return{data:nativeResponse(messages),provider:'nexusia-native',model:'nexusia-intelligence',fallbackUsed:true,fallbackReason:lastError?.message||'no_external_provider',native:true};
}
export function getGatewayStatus(){const providers=listConfiguredProviders();return{version:VERSION,abstraction:'Nexus Model Gateway',providerIndependent:true,providers,configuredCount:providers.filter(provider=>provider.configured).length,nativeFallback:true,nativeEngine:'nexusia-intelligence',multimodal:true,nativeLLM:Boolean(process.env.NEXUS_LLM_URL),nativeLLMModel:process.env.NEXUS_LLM_MODEL||'nexusia-local-model'};}
export function getModelCapabilities(){return Object.values(PROVIDERS).map(provider=>({id:provider.id,kind:provider.kind,configured:Boolean(process.env[provider.urlEnv]||process.env[provider.keyEnv]),model:process.env[provider.modelEnv]||provider.defaultModel,capabilities:{text:true,vision:provider.id==='openai'||provider.id==='nexusia-llm'||provider.id==='local',reasoning:provider.id!=='legacy-compatible-fallback',code:true,image:provider.id==='openai',video:false,music:false,audio:false,files:true,live:false}})).concat([{id:'nexusia-native',kind:'native-core',configured:true,model:'nexusia-core-native',capabilities:{text:true,vision:false,reasoning:false,code:true,image:false,video:false,music:false,audio:false,files:true,live:false}}]);}
export function selectProviderForCapability({preferredProvider='openai',capability='text'}={}){const candidates=getModelCapabilities().filter(x=>x.configured||x.id===preferredProvider);return candidates.find(x=>x.capabilities?.[capability])||candidates[0]||null;}
export function getGatewayMode(){return{version:VERSION,mode:'local-first',localConfigured:Boolean(process.env.NEXUS_LOCAL_TEXT_URL),nativeLLMConfigured:Boolean(process.env.NEXUS_LLM_URL),nativeLLMModel:process.env.NEXUS_LLM_MODEL||'nexusia-local-model',cloudFallbackOptional:true,apiKeyRequired:false,nativeFallback:true};}
