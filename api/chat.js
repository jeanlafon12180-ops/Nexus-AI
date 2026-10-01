import { buildFutureEngineContract, buildNexusIdentity, buildReasoningPolicy, planMission, createMissionExecution, startMissionExecution, completeMissionExecution, recoverMissionExecution, resumeMissionExecution, getMissionProgress, analyzeIntent, buildAdaptiveResponseProfile, createProjectState, updateProjectState, addProjectCheckpoint, projectProgress, buildProjectBrief, createProjectFromMission } from './nexus-core.js';
import { routeModel } from './model-router.js';
import { buildGoal, evaluateGoal, buildQualitySignal, buildAdaptiveGoalPlan, buildProjectRisks } from './nexus-goal-engine.js';
import { createRuntimeMission, appendRuntimeEvent, getRuntimeStatus, checkpointRuntimeMission, recoverRuntimeMission, continueMission } from './nexus-runtime.js';
import { buildNativeExecutionPlan, buildNativeCapabilityContract } from './nexus-native-engine.js';
import { createMemoryStore, recordMemoryEvent, getMemorySnapshot } from './nexus-memory-engine.js';
import { prioritizeContext, buildPrioritizedContextPrompt } from './nexus-context-engine.js';
import { decideNextAction, buildDecisionPrompt, buildCognitiveLoop } from './nexus-decision-engine.js';
import { buildCognitiveContext, buildCognitivePlan } from './nexus-core.js';
import { buildContextSupport, buildVerificationPrompt, buildCorrectionPrompt, isUsefulReview, selectSpecializedAgent, selectAgentTeam, buildIntentPrompt, buildAdaptiveResponsePrompt, buildAdaptiveVerificationMode, buildGoalControlPrompt, buildQualityControlPrompt, buildRuntimeControlPrompt, buildContinuityPrompt } from './nexus-assist.js';

export const config={api:{bodyParser:{sizeLimit:'15mb'}}};
const MAX_IMAGES=20,MAX_HISTORY=24,MAX_HISTORY_CHARS=30000,MAX_MEMORY_CHARS=6000,MAX_CONTEXT_MESSAGE_CHARS=6000;
function cleanText(value,max=20000){return String(value||'').replace(/\u0000/g,'').trim().slice(0,max)}
function detectMode(message){const text=message.toLowerCase();if(/\b(code|programme|programmer|développe|developpe|html|css|javascript|typescript|python|react|next\.js|node\.js|sql|api|bug|erreur|corrige|debug|fonction|script|roblox|lua)\b/i.test(text))return'code';if(/\b(math|maths|calcul|équation|equation|pythagore|cosinus|sinus|géométrie|geometry)\b/i.test(text))return'maths';if(/\b(résume|resume|résumé|document|cours|histoire|géographie|exercice|devoir)\b/i.test(text))return'study';return'general'}

export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Méthode non autorisée.'});
 try{
  const body=req.body||{},message=cleanText(body.message,12000),imageData=typeof body.imageData==='string'?body.imageData.trim():'',imageDataList=Array.isArray(body.imageDataList)?body.imageDataList.filter(item=>typeof item==='string'&&/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(item.trim())).slice(0,MAX_IMAGES):[],documentText=cleanText(body.documentText,60000),documentName=cleanText(body.documentName,200),rawHistory=Array.isArray(body.history)?body.history:[],memory=cleanText(JSON.stringify(body.memory||{}),MAX_MEMORY_CHARS);
  if(!message)return res.status(400).json({error:'Message vide.'});
  const images=imageDataList.length?imageDataList:(imageData?[imageData]:[]),hasImage=images.length>0,hasDocument=documentText.length>0,mode=detectMode(message),missionPlan=planMission(message);
  const suppliedMission=body.mission&&typeof body.mission==='object'?body.mission:null;
  const suppliedProject=body.project&&typeof body.project==='object'?body.project:null;
  let mission=suppliedMission?.steps?resumeMissionExecution(suppliedMission):createMissionExecution(message);
  let project=suppliedProject||createProjectFromMission(message,mission);if(missionPlan.isMission&&!mission?.startedAt)mission=startMissionExecution(mission);
  const historyItems=rawHistory.filter(item=>item&&(item.type==='user'||item.type==='nexus')&&typeof item.text==='string').slice(-MAX_HISTORY),historyMessages=[];let historyChars=0;
  for(let i=historyItems.length-1;i>=0;i--){const item=historyItems[i],text=cleanText(item.text,MAX_CONTEXT_MESSAGE_CHARS);if(!text)continue;if(historyChars+text.length>MAX_HISTORY_CHARS)break;historyMessages.unshift({role:item.type==='user'?'user':'assistant',content:text});historyChars+=text.length}
  const contextSupport=buildContextSupport({message,mode,history:historyItems,memory,documentText,documentName,mission});
  const projectBrief=buildProjectBrief(project);
  const nativePlan=buildNativeExecutionPlan({message,capability:/\b(image|photo|photo|dessin)\b/i.test(message)?'image':/\b(vidéo|video)\b/i.test(message)?'video':/\b(musique|audio)\b/i.test(message)?'music':/\b(fichier|pdf|document)\b/i.test(message)?'files':'text'}),nativeCapabilities=buildNativeCapabilityContract(),intent=analyzeIntent(message,historyItems),responseProfile=buildAdaptiveResponseProfile(intent),decision=decideNextAction({message,intent,hasDocument,hasImage,project,historyLength:historyItems.length}),goal=buildGoal(message,{project,intent}),prioritizedContext=prioritizeContext({message,history:historyItems,memory,project,documentText}),cognitiveContext=buildCognitiveContext({message,history:historyItems,memory,project,documentText,intent}),cognitivePlan=buildCognitivePlan({intent,decision}),cognitiveLoop=buildCognitiveLoop({intent,decision,profile:responseProfile}),specializedAgent=selectSpecializedAgent(message,mode),agentTeam=selectAgentTeam(message,mode),verificationMode=buildAdaptiveVerificationMode({mode,intent});
  const history=historyMessages.map(item=>(item.role==='user'?'Utilisateur: ':'Nexus AI: ')+item.content).join('\n\n');
  const complexitySignals=[message.length>900,/\b(explique|compare|analyse|pourquoi|comment|détaille|raisonne|conçois|architecture|optimise|diagnostique|debug|planifie|vérifie)\b/i.test(message),mode==='code'||mode==='maths',hasImage||hasDocument,historyMessages.length>=8,intent.complexity>=3].filter(Boolean).length,isDeepTask=complexitySignals>=2;
  const adaptiveTemperature=mode==='code'||mode==='maths'?0.10:complexitySignals>=3?0.10:0.12,adaptiveMaxTokens=isDeepTask?20000:complexitySignals>=1?16000:12000;
  const autonomousStrategy=decision.action==='mission'?'plan → contexte projet → agent spécialisé → génération → vérification → adaptation':decision.action==='analyze'?'contexte → analyse → vérification → synthèse':decision.action==='correct'?'diagnostic → correction → vérification':isDeepTask?'comprendre → décider → exécuter → vérifier → adapter':'comprendre → décider → répondre → contrôle final';
  const modeInstructions={general:'MODE GÉNÉRAL :\n- Réponds naturellement et directement.\n- Adapte la profondeur à la demande.\n- Si plusieurs étapes sont utiles, structure-les clairement.',maths:'MODE MATHS / SCIENCES :\n- Montre les étapes importantes.\n- Vérifie unités, signes et résultats.\n- Donne le résultat final clairement.',study:'MODE ÉTUDES :\n- Explique comme un professeur patient.\n- Adapte le vocabulaire au niveau demandé.\n- Distingue faits, explications et exemples.\n- Pour un document fourni, utilise d’abord son contenu.',code:'MODE DÉVELOPPEMENT :\n- Produis du code réellement exploitable.\n- Respecte exactement les technologies demandées.\n- Vérifie syntaxe, imports, variables, événements, sélecteurs et dépendances.\n- Ne prétends jamais avoir exécuté ou testé du code si tu ne l’as pas réellement fait.\n- N’invente jamais une API, une bibliothèque ou une fonctionnalité.\n- Utilise des blocs Markdown avec le langage approprié.'}[mode];
  const missionProgress=getMissionProgress(mission);const projectRisks=buildProjectRisks(project);const qualityHint=goal?buildGoalControlPrompt(goal):'';
  const systemPrompt=[
   'Tu es Nexus AI V5.0, le moteur central de Nexus Core, un assistant francophone généraliste qui orchestre des agents spécialisés. V5.0 renforce la compréhension de l’intention, la gestion du contexte, la planification, l’adaptation des réponses et l’auto-vérification.',
   'Nexus Core est la couche de pilotage : elle reste stable et indépendante du fournisseur de modèle. Le modèle principal actuel est GPT-5.6 Sol. Si ce moteur est indisponible, Nexus peut utiliser automatiquement un moteur de secours configuré.',
   'Ta priorité est d’être FIABLE, COHÉRENT, UTILE et HONNÊTE sur tes capacités.',buildNexusIdentity(),buildReasoningPolicy(),buildDecisionPrompt(decision),buildCognitivePlan({intent,decision}),buildPrioritizedContextPrompt(prioritizedContext),qualityHint,buildRuntimeControlPrompt(runtimeStatus),buildContinuityPrompt(runtimeMission.checkpoint),
   'RÈGLES DE QUALITÉ :\n- Réponds en français sauf demande contraire.\n- Comprends la demande avant de répondre.\n- Utilise le contexte récent.\n- Si une information est incertaine ou manque, dis-le.\n- Ne fabrique jamais de source, résultat de test, fichier ou action externe.\n- N’affirme jamais avoir effectué une action que tu n’as pas réellement effectuée.\n- Utilise Markdown de façon lisible.\n- Pour les formules mathématiques, utilise \\(...\\) pour les expressions en ligne et \\[...\\] pour les formules affichées. Ne laisse pas de commandes LaTeX brutes sans leurs délimiteurs.\n- Pour une demande complexe, commence par une réponse utile puis détaille progressivement.',
   contextSupport.support?'NEXUS CONTEXT ADVISOR V5.0 :\n'+contextSupport.support:'',buildCognitiveContext({message,history:historyItems,memory,project,documentText,intent})?'NEXUS COGNITIVE CONTEXT V5.0 :\n'+JSON.stringify(cognitiveContext):'',
   buildIntentPrompt({intent,message,historyLength:historyItems.length}),
   buildAdaptiveResponsePrompt(responseProfile),
   mission.isMission?'MISSION ENGINE V5.0 : plan de mission : '+missionPlan.steps.join(' → ')+'. Les étapes sont ordonnées par dépendances ; utilise ce plan comme cadre et vérifie le résultat avant de conclure.':'',
   'ORCHESTRATION AUTONOME V5.0 :\n- Choisis automatiquement le niveau de planification adapté à la complexité.\n- Sélectionne l’agent spécialisé le plus pertinent quand cela apporte une valeur réelle.\n- Réévalue le plan après les étapes importantes et adapte la stratégie si nécessaire.\n- Pour une tâche simple, évite les étapes inutiles. Pour une tâche complexe, utilise la chaîne complète de planification, spécialisation et vérification.\n- Stratégie sélectionnée : '+autonomousStrategy+'\n\nPROTOCOLE DE VÉRIFICATION INTERNE :\n- Identifie mentalement objectif, contraintes et contexte.\n- Vérifie silencieusement faits, calculs, code, noms, unités et contraintes.\n- Si plusieurs interprétations sont possibles, choisis celle qui correspond au contexte.\n- Fais une seconde passe silencieuse pour détecter oubli, contradiction ou erreur.\n- N’expose pas ton raisonnement interne privé ; donne seulement les conclusions et étapes utiles.',
   projectBrief?'NEXUS PROJECT OS V5.0 :\n'+projectBrief+'\nMets à jour mentalement l’état du projet sans inventer de livrable terminé.':'',
   specializedAgent?'AGENT ROUTER NEXUS V5.0 :\nAgent principal : '+specializedAgent.name+' ('+specializedAgent.id+') score '+String(specializedAgent.score||0)+'.\n'+specializedAgent.instruction+'\nAgents complémentaires disponibles : '+(agentTeam.filter(a=>a.id!==specializedAgent.id).map(a=>a.name+' ('+a.score+')').join(', ')||'aucun')+'.\nTous les rôles restent sous le contrôle de Nexus Core et ne possèdent aucun accès implicite à des données externes.':'',
   memory&&memory!=='{}'?'MÉMOIRE LOCALE FOURNIE PAR L’APPLICATION :\n'+memory+'\nUtilise-la uniquement lorsqu’elle est pertinente.':'',
   history?'CONTEXTE DE LA CONVERSATION :\n'+history+'\n\nContinue naturellement cette conversation.':'',
   hasImage?'IMAGES JOINTES : analyse réellement les images disponibles. Décris uniquement ce qui est visible ou raisonnablement déductible.':'',
   hasDocument?'DOCUMENT JOINT : le document « '+(documentName||'document')+' » est fourni sous forme de texte extrait. Base-toi d’abord sur ce contenu.':'',
   'Tu es maintenant Nexus AI V5.0. Ne prétends jamais avoir utilisé un outil ou vérifié une information externe si ce n’est pas réellement le cas.'
  ].filter(Boolean).join('\n\n');
  const userContent=hasImage?[{type:'text',text:message},...images.map(url=>({type:'image_url',image_url:{url}}))]:hasDocument?message+'\n\n--- CONTENU DU DOCUMENT : '+(documentName||'document')+' ---\n'+documentText+'\n--- FIN DU DOCUMENT ---':message;
  let routed;
  try{
    routed=await routeModel({messages:[{role:'system',content:systemPrompt},...historyMessages,{role:'user',content:userContent}],temperature:adaptiveTemperature,maxTokens:adaptiveMaxTokens});
  }catch(firstError){
    if(!mission?.steps?.length||mission.status==='completed')throw firstError;
    mission=recoverMissionExecution(mission,firstError.message||'Échec du moteur principal.');
    mission=recoverMissionExecution(mission,'Nouvelle tentative après récupération.')||mission;
    routed=await routeModel({messages:[{role:'system',content:systemPrompt+'\n\nRECOVERY V5.0 : une première tentative a échoué. Reprends proprement avec une stratégie simplifiée et vérifie le résultat.'},{role:'user',content:userContent}],temperature:adaptiveTemperature,maxTokens:adaptiveMaxTokens});
  }
  let text=routed.data?.choices?.[0]?.message?.content;if(!text)throw new Error('Le moteur IA n’a renvoyé aucune réponse.');
  let verification={enabled:isDeepTask||contextSupport.needed||responseProfile.verification==='strong',performed:false,corrected:false,passes:cognitiveLoop.passes};
  if(verification.enabled){
    const reviewPrompt=buildVerificationPrompt({userMessage:message,draft:text,mode,mission});
    const review=await routeModel({messages:[{role:'system',content:'Vérificateur interne Nexus Core V5.0. Mode de contrôle : '+verificationMode+'. Passe 1/'+cognitiveLoop.passes+'. Donne uniquement des corrections factuelles ou structurelles utiles. Si tout est correct, réponds OK.'},{role:'user',content:reviewPrompt}],temperature:0,maxTokens:2500});
    const reviewText=review.data?.choices?.[0]?.message?.content||'OK';verification.performed=true;
    if(isUsefulReview(reviewText)){
      const correctionPrompt=buildCorrectionPrompt({userMessage:message,draft:text,review:reviewText});
      routed=await routeModel({messages:[{role:'system',content:systemPrompt},{role:'user',content:correctionPrompt}],temperature:adaptiveTemperature,maxTokens:adaptiveMaxTokens});
      text=routed.data?.choices?.[0]?.message?.content||text;verification.corrected=true;
    }
  }
  mission=mission.isMission===false?mission:completeMissionExecution(mission);
  const runtimeCheckpoint=checkpointRuntimeMission(continueMission(runtimeMission));
  const evaluation=evaluateGoal({goal,result:text,verification:verification.performed||!verification.enabled,contextComplete:Boolean(message)&&(hasDocument?documentText.length>0:true),consistent:true});
  const qualitySignal=buildQualitySignal(evaluation);
  if(qualitySignal.needsAdaptation&&goal){
    const adaptivePlan=buildAdaptiveGoalPlan({goal,evaluation});
    if(adaptivePlan.strategy.includes('adapt')){
      const adaptivePrompt=buildQualityControlPrompt(evaluation)+'\n\n'+buildCorrectionPrompt({userMessage:message,draft:text,review:'Le résultat doit être davantage aligné sur l’objectif : '+goal.objective});
      const adapted=await routeModel({messages:[{role:'system',content:systemPrompt+'\n\n'+adaptivePrompt},{role:'user',content:message+'\n\nRésultat actuel à améliorer :\n'+text}],temperature:adaptiveTemperature,maxTokens:adaptiveMaxTokens});
      text=adapted.data?.choices?.[0]?.message?.content||text;
      verification.adapted=true;
    }
  }

  if(project){
    const completedSteps=Array.isArray(mission.steps)?mission.steps.filter(s=>s.status==='completed').map(s=>s.id):[];
    const deliverables=(project.deliverables||[]).map(d=>completedSteps.includes(d.missionStep)?{...d,status:'completed'}:d);
    project=updateProjectState(project,{deliverables,activeMissionId:mission.id,risks:projectRisks});
    project=addProjectCheckpoint(project,{label:'Réponse Nexus V5.0',status:mission.status==='completed'?'completed':'in_progress',summary:text.slice(0,700),missionId:mission.id});
  }
  const finalMissionProgress=getMissionProgress(mission);
  return res.status(200).json({text,version:'4.5',core:buildFutureEngineContract(),autonomousCore:{enabled:true,strategy:autonomousStrategy,replanned:isDeepTask,responseProfile},mode,mission,hasImage,hasDocument,provider:routed.provider,model:routed.model,fallbackUsed:Boolean(routed.fallbackUsed),fallbackReason:routed.fallbackReason||null,contextAdvisor:{used:contextSupport.needed,ambiguityScore:contextSupport.ambiguityScore},intent:{goal:intent.goal,domain:intent.domain,complexity:intent.complexity,confidence:intent.confidence},specializedAgent:{id:specializedAgent.id,name:specializedAgent.name,score:specializedAgent.score||0,team:agentTeam.map(a=>({id:a.id,name:a.name,score:a.score}))},verification,verificationMode,missionProgress:finalMissionProgress,coreStatus:{version:'4.5.0',missionEngine:'4.5',projectOS:true,projectMemory:'4.5',checkpoints:true,autoRecovery:true,missionResume:true,agentRouter:'4.5'},project,projectProgress:projectProgress(project)});
 }catch(error){console.error('Nexus AI V5.0 chat error:',error);return res.status(error.status===503?503:500).json({error:error.message||'Erreur du moteur IA.'});}
}
