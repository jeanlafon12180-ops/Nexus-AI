import { buildFutureEngineContract, buildNexusIdentity, buildReasoningPolicy, planMission, createMissionExecution, startMissionExecution, completeMissionExecution, failMissionExecution } from './nexus-core.js';
import { routeModel } from './model-router.js';
import { buildContextSupport, buildVerificationPrompt, buildCorrectionPrompt, isUsefulReview, selectSpecializedAgent } from './nexus-assist.js';

export const config = { api: { bodyParser: { sizeLimit: '15mb' } } };
const MAX_IMAGES = 20, MAX_HISTORY = 24, MAX_HISTORY_CHARS = 30000, MAX_MEMORY_CHARS = 6000, MAX_CONTEXT_MESSAGE_CHARS = 6000;
function cleanText(value,max=20000){return String(value||'').replace(/\u0000/g,'').trim().slice(0,max)}
function detectMode(message){const text=message.toLowerCase();if(/\b(code|programme|programmer|développe|developpe|html|css|javascript|typescript|python|react|next\.js|node\.js|sql|api|bug|erreur|corrige|debug|fonction|script|roblox|lua)\b/i.test(text))return'code';if(/\b(math|maths|calcul|équation|equation|pythagore|cosinus|sinus|géométrie|geometry)\b/i.test(text))return'maths';if(/\b(résume|resume|résumé|document|cours|histoire|géographie|exercice|devoir)\b/i.test(text))return'study';return'general'}

export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Méthode non autorisée.'});
 try{
  const body=req.body||{},message=cleanText(body.message,12000),imageData=typeof body.imageData==='string'?body.imageData.trim():'',imageDataList=Array.isArray(body.imageDataList)?body.imageDataList.filter(item=>typeof item==='string'&&/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(item.trim())).slice(0,MAX_IMAGES):[],documentText=cleanText(body.documentText,60000),documentName=cleanText(body.documentName,200),rawHistory=Array.isArray(body.history)?body.history:[],memory=cleanText(JSON.stringify(body.memory||{}),MAX_MEMORY_CHARS);
  if(!message)return res.status(400).json({error:'Message vide.'});
  const images=imageDataList.length?imageDataList:(imageData?[imageData]:[]),hasImage=images.length>0,hasDocument=documentText.length>0,mode=detectMode(message),missionPlan=planMission(message);let mission=createMissionExecution(message);if(missionPlan.isMission)mission=startMissionExecution(mission);
  const historyItems=rawHistory.filter(item=>item&&(item.type==='user'||item.type==='nexus')&&typeof item.text==='string').slice(-MAX_HISTORY),historyMessages=[];let historyChars=0;
  for(let i=historyItems.length-1;i>=0;i--){const item=historyItems[i],text=cleanText(item.text,MAX_CONTEXT_MESSAGE_CHARS);if(!text)continue;if(historyChars+text.length>MAX_HISTORY_CHARS)break;historyMessages.unshift({role:item.type==='user'?'user':'assistant',content:text});historyChars+=text.length}
  const contextSupport=buildContextSupport({message,mode,history:historyItems,memory,documentText,documentName});
  const specializedAgent=selectSpecializedAgent(message,mode);
  const history=historyMessages.map(item=>(item.role==='user'?'Utilisateur: ':'Nexus AI: ')+item.content).join('\n\n');
  const complexitySignals=[message.length>900,/\b(explique|compare|analyse|pourquoi|comment|détaille|raisonne|conçois|architecture|optimise|diagnostique|debug|planifie|vérifie)\b/i.test(message),mode==='code'||mode==='maths',hasImage||hasDocument,historyMessages.length>=8].filter(Boolean).length,isDeepTask=complexitySignals>=2;
  const adaptiveTemperature=mode==='code'||mode==='maths'?0.10:complexitySignals>=3?0.10:0.12,adaptiveMaxTokens=isDeepTask?20000:complexitySignals>=1?16000:12000;
  const modeInstructions={general:'MODE GÉNÉRAL :\n- Réponds naturellement et directement.\n- Adapte la profondeur à la demande.\n- Si plusieurs étapes sont utiles, structure-les clairement.',maths:'MODE MATHS / SCIENCES :\n- Montre les étapes importantes.\n- Vérifie unités, signes et résultats.\n- Donne le résultat final clairement.',study:'MODE ÉTUDES :\n- Explique comme un professeur patient.\n- Adapte le vocabulaire au niveau demandé.\n- Distingue faits, explications et exemples.\n- Pour un document fourni, utilise d’abord son contenu.',code:'MODE DÉVELOPPEMENT :\n- Produis du code réellement exploitable.\n- Respecte exactement les technologies demandées.\n- Vérifie syntaxe, imports, variables, événements, sélecteurs et dépendances.\n- Ne prétends jamais avoir exécuté ou testé du code si tu ne l’as pas réellement fait.\n- N’invente jamais une API, une bibliothèque ou une fonctionnalité.\n- Utilise des blocs Markdown avec le langage approprié.'}[mode];
  const systemPrompt=[
   'Tu es Nexus AI V3.6, le moteur central de Nexus Core, un assistant francophone généraliste qui orchestre des agents spécialisés.',
   'Nexus Core est la couche de pilotage : elle reste stable et indépendante du fournisseur de modèle. Le modèle principal actuel est GPT-5.6 Sol. Si ce moteur est indisponible, Nexus peut utiliser automatiquement un moteur de secours configuré.',
   'Ta priorité est d’être FIABLE, COHÉRENT, UTILE et HONNÊTE sur tes capacités.',buildNexusIdentity(),buildReasoningPolicy(),
   'RÈGLES DE QUALITÉ :\n- Réponds en français sauf demande contraire.\n- Comprends la demande avant de répondre.\n- Utilise le contexte récent.\n- Si une information est incertaine ou manque, dis-le.\n- Ne fabrique jamais de source, résultat de test, fichier ou action externe.\n- N’affirme jamais avoir effectué une action que tu n’as pas réellement effectuée.\n- Utilise Markdown de façon lisible.\n- Pour une demande complexe, commence par une réponse utile puis détaille progressivement.',
   contextSupport.support?'NEXUS CONTEXT ADVISOR V3.6 :\n'+contextSupport.support:'',mission.isMission?'MISSION ENGINE V3.6 : plan de mission : '+missionPlan.steps.join(' → ')+'. Utilise ce plan comme cadre de travail, puis vérifie le résultat avant de conclure.':'',
   'PROTOCOLE DE VÉRIFICATION INTERNE :\n- Identifie mentalement objectif, contraintes et contexte.\n- Vérifie silencieusement faits, calculs, code, noms, unités et contraintes.\n- Si plusieurs interprétations sont possibles, choisis celle qui correspond au contexte.\n- Fais une seconde passe silencieuse pour détecter oubli, contradiction ou erreur.\n- N’expose pas ton raisonnement interne privé ; donne seulement les conclusions et étapes utiles.',modeInstructions,
   specializedAgent?'AGENT SPÉCIALISÉ NEXUS V3.6 :\n'+specializedAgent.name+' ('+specializedAgent.id+')\n'+specializedAgent.instruction+'\nL’agent spécialisé travaille sous le contrôle de Nexus Core et ne possède aucun accès implicite à des données externes.':'',
   memory&&memory!=='{}'?'MÉMOIRE LOCALE FOURNIE PAR L’APPLICATION :\n'+memory+'\nUtilise-la uniquement lorsqu’elle est pertinente.':'',
   history?'CONTEXTE DE LA CONVERSATION :\n'+history+'\n\nContinue naturellement cette conversation.':'',
   hasImage?'IMAGES JOINTES : analyse réellement les images disponibles. Décris uniquement ce qui est visible ou raisonnablement déductible.':'',
   hasDocument?'DOCUMENT JOINT : le document « '+(documentName||'document')+' » est fourni sous forme de texte extrait. Base-toi d’abord sur ce contenu.':'',
   'Tu es maintenant Nexus AI V3.6. Ne prétends jamais avoir utilisé un outil ou vérifié une information externe si ce n’est pas réellement le cas.'
  ].filter(Boolean).join('\n\n');
  const userContent=hasImage?[{type:'text',text:message},...images.map(url=>({type:'image_url',image_url:{url}}) )]:hasDocument?message+'\n\n--- CONTENU DU DOCUMENT : '+(documentName||'document')+' ---\n'+documentText+'\n--- FIN DU DOCUMENT ---':message;
  let routed=await routeModel({messages:[{role:'system',content:systemPrompt},...historyMessages,{role:'user',content:userContent}],temperature:adaptiveTemperature,maxTokens:adaptiveMaxTokens});
  let text=routed.data?.choices?.[0]?.message?.content;
  if(!text)throw new Error('Le moteur IA n’a renvoyé aucune réponse.');

  let verification={enabled:isDeepTask||contextSupport.needed,performed:false,corrected:false};
  if(verification.enabled){
    const reviewPrompt=buildVerificationPrompt({userMessage:message,draft:text,mode});
    const review=await routeModel({messages:[{role:'system',content:'Vérificateur interne Nexus Core V3.4. Donne uniquement des corrections factuelles ou structurelles utiles. Si tout est correct, réponds OK.'},{role:'user',content:reviewPrompt}],temperature:0,maxTokens:2500});
    const reviewText=review.data?.choices?.[0]?.message?.content||'OK';
    verification.performed=true;
    if(isUsefulReview(reviewText)){
      const correctionPrompt=buildCorrectionPrompt({userMessage:message,draft:text,review:reviewText});
      routed=await routeModel({messages:[{role:'system',content:systemPrompt},{role:'user',content:correctionPrompt}],temperature:adaptiveTemperature,maxTokens:adaptiveMaxTokens});
      text=routed.data?.choices?.[0]?.message?.content||text;
      verification.corrected=true;
    }
  }
  mission=mission.isMission===false?mission:completeMissionExecution(mission);
  return res.status(200).json({text,version:'3.6',core:buildFutureEngineContract(),mode,mission,hasImage,hasDocument,provider:routed.provider,model:routed.model,fallbackUsed:Boolean(routed.fallbackUsed),fallbackReason:routed.fallbackReason||null,contextAdvisor:{used:contextSupport.needed,ambiguityScore:contextSupport.ambiguityScore},specializedAgent:{id:specializedAgent.id,name:specializedAgent.name},verification});
 }catch(error){console.error('Nexus AI V3.6 chat error:',error);return res.status(error.status===503?503:500).json({error:error.message||'Erreur du moteur IA.'});}
}
