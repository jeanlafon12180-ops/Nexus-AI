const VERSION='5.0.0';

export function buildNexusIdentity(){return[
'IDENTITÉ NEXUS CORE V5.0 : tu es le moteur central d’intelligence, de planification, d’orchestration et de récupération de Nexus IA.',
'Tu analyses objectif, contraintes, contexte, complexité, dépendances et critères de réussite avant de choisir une stratégie.',
'Nexus Core privilégie les moteurs natifs/local-first et conserve les fournisseurs cloud comme fallback optionnel. et peut continuer avec un moteur de secours configuré si le modèle principal devient indisponible.',
'Tu restes honnête : aucune action, vérification, navigation, exécution ou observation ne doit être prétendue si elle n’a réellement eu lieu.'
].join('\n')}

export function buildReasoningPolicy(){return[
'POLITIQUE NEXUS CORE V5.0 :',
'- Décompose les tâches complexes en étapes utiles avant de répondre.',
'- Identifie objectif, résultat attendu, contraintes, contexte, dépendances et critères de réussite.',
'- Choisis une stratégie proportionnée : réponse directe, analyse, mission ou orchestration spécialisée.',
'- Utilise le contexte pertinent sans mélanger les sessions.',
'- Vérifie les résultats importants avant de les présenter.',
'- Sépare faits, hypothèses, incertitudes et propositions.',
'- Si une information manque, demande une précision ciblée ou signale la limite.',
'- Ne révèle pas de raisonnement interne privé : expose uniquement les conclusions et étapes utiles.',
'- Réévalue la stratégie après les étapes importantes et adapte la suite si le contexte change.',
'- Pour une tâche simple, évite les étapes inutiles ; pour une tâche complexe, augmente la profondeur de contrôle.',
'- En cas d’échec d’une étape, analyse la cause, propose une stratégie de récupération et évite les boucles infinies.'
].join('\n')}

export function buildFutureEngineContract(){return{
version:VERSION,architecture:'nexus-core',orchestration:true,missionMode:true,missionEngine:'5.0',projectOS:true,projectWorkspace:true,projectState:'5.0',modelGateway:'5.0',providerIndependent:true,decisionEngine:'5.0',cognitiveCore:'5.0',contextIntelligence:'5.0',goalEngine:'5.0',qualityEngine:'5.0',selfEvaluation:true,projectRiskEngine:'5.0',
modelResilience:true,primaryModel:'gpt-5.6-sol',fallbackReady:true,contextAdvisor:true,selfCorrection:true,
specializedAgents:true,agentOrchestration:true,autonomousCore:true,adaptivePlanning:true,adaptiveResponse:true,
intentEngine:'5.0',missionGraph:true,missionResume:true,autoRecovery:true,agentRouter:'5.0',projectMemory:'5.0',checkpointEngine:true,deliverableTracking:true,
verification:true,adaptiveVerification:true,multimodalReady:true,privacyBoundary:'session-scoped'
}}

function uniqueSteps(steps){return[...new Set(steps)].slice(0,8)}
function makeStep(label,index,dependsOn=[]){return{id:'step-'+(index+1),order:index+1,label,status:'pending',dependsOn,startedAt:null,completedAt:null,attempts:0,error:null}}

export function planMission(message){
 const text=String(message||'').trim(),lower=text.toLowerCase();
 const isMission=text.length>300||/\b(site|application|projet|système|architecture|workflow|diagnostic|audit|comparaison|organise|planifie|construis|développe|réalise|crée|migration|déploiement|automatise|intègre)\b/i.test(text);
 if(!isMission)return{isMission:false,type:'simple',priority:'normal',steps:['Comprendre la demande','Répondre']};
 const labels=['Comprendre l’objectif et les contraintes'];
 if(/\b(site|application|projet|système|architecture|workflow|code|roblox|programme|développe|migration|déploiement|intègre)\b/i.test(lower)){
   labels.push('Définir l’architecture et les composants');
   labels.push('Construire ou modifier les éléments nécessaires');
   labels.push('Contrôler la cohérence technique');
 }else if(/\b(compare|comparaison|choisir|différence|analyse|audit)\b/i.test(lower)){
   labels.push('Identifier les critères et informations utiles');
   labels.push('Comparer les éléments de façon structurée');
   labels.push('Vérifier les conclusions');
 }else if(/\b(plan|organise|planifie|voyage|programme|planning)\b/i.test(lower)){
   labels.push('Structurer les étapes, contraintes et dépendances');
   labels.push('Construire un plan exécutable');
   labels.push('Contrôler la faisabilité du plan');
 }else{
   labels.push('Décomposer le problème en sous-tâches');
   labels.push('Produire la solution étape par étape');
   labels.push('Vérifier la cohérence du résultat');
 }
 labels.push('Présenter le résultat et les prochaines actions utiles');
 return{isMission:true,type:'mission',priority:text.length>1200?'high':'normal',steps:uniqueSteps(labels)};
}

export function createMissionExecution(message){
 const plan=planMission(message),now=new Date().toISOString();
 const steps=plan.steps.map((label,index)=>makeStep(label,index,index===0?[]:['step-'+index]));
 return{id:'mission-'+Date.now().toString(36),version:VERSION,status:plan.isMission?'pending':'completed',
 priority:plan.priority,type:plan.type,createdAt:now,startedAt:null,completedAt:plan.isMission?null:now,
 activeStep:plan.isMission?steps[0]?.id||null:null,attempts:0,maxAttempts:2,
 steps,graph:{type:'dependency-chain',root:steps[0]?.id||null}}
}

function readyStep(mission){
 return mission?.steps?.find(s=>s.status==='pending'&&(!s.dependsOn?.length||s.dependsOn.every(id=>mission.steps.find(x=>x.id===id)?.status==='completed')));
}

export function startMissionExecution(mission){
 const first=readyStep(mission);if(!first)return mission;
 const startedAt=new Date().toISOString();
 return{...mission,status:'running',startedAt:mission.startedAt||startedAt,activeStep:first.id,
 steps:mission.steps.map(s=>s.id===first.id?{...s,status:'running',startedAt:s.startedAt||startedAt,attempts:(s.attempts||0)+1}:s)}
}

export function advanceMissionExecution(mission,{success=true,errorMessage=''}={}){
 if(!mission?.steps?.length)return mission;
 const current=mission.steps.find(s=>s.id===mission.activeStep);
 if(!current)return startMissionExecution(mission);
 if(!success)return recoverMissionExecution(mission,errorMessage);
 const completedAt=new Date().toISOString();
 const updated={...mission,steps:mission.steps.map(s=>s.id===current.id?{...s,status:'completed',completedAt,error:null}:s)};
 const next=readyStep(updated);
 if(!next)return{...updated,status:'completed',activeStep:null,completedAt};
 return{...updated,status:'running',activeStep:next.id};
}

export function completeMissionExecution(mission){
 let current=mission;
 for(let i=0;i<(current?.steps?.length||0)+1;i++){current=advanceMissionExecution(current,{success:true});if(current.status==='completed'||current.status==='failed')break}
 return current;
}

export function recoverMissionExecution(mission,errorMessage=''){
 if(!mission?.steps?.length)return mission;
 const failedAt=new Date().toISOString(),current=mission.steps.find(s=>s.id===mission.activeStep),attempts=current?.attempts||0,maxAttempts=mission.maxAttempts||2;
 if(!current)return mission;
 if(attempts<maxAttempts){
   return{...mission,status:'recovering',recoveryCount:(mission.recoveryCount||0)+1,recovery:{stepId:current.id,error:String(errorMessage||'Étape interrompue.').slice(0,500),at:failedAt},
   activeStep:current.id,steps:mission.steps.map(s=>s.id===current.id?{...s,status:'pending',error:String(errorMessage||'Étape interrompue.').slice(0,500),completedAt:null}:s)};
 }
 return{...mission,status:'failed',activeStep:null,completedAt:failedAt,error:String(errorMessage||'Mission interrompue après plusieurs tentatives.').slice(0,500),
 steps:mission.steps.map(s=>s.id===current.id?{...s,status:'failed',completedAt:failedAt,error:String(errorMessage||'Étape interrompue.').slice(0,500)}:s)};
}

export function failMissionExecution(mission,errorMessage=''){return recoverMissionExecution(mission,errorMessage)}

export function getMissionProgress(mission){
 const steps=Array.isArray(mission?.steps)?mission.steps:[],completed=steps.filter(s=>s.status==='completed').length;
 return{completed,total:steps.length,percent:steps.length?Math.round(completed/steps.length*100):0,activeStep:mission?.activeStep||null,status:mission?.status||'unknown',recoveryCount:mission?.recoveryCount||0};
}

export function resumeMissionExecution(mission){
 if(!mission||!Array.isArray(mission.steps)||!mission.steps.length)return null;
 if(mission.status==='completed'||mission.status==='failed')return mission;
 const normalized={...mission,version:VERSION,status:mission.status==='recovering'?'pending':mission.status};
 return startMissionExecution(normalized);
}

export function analyzeIntent(message,history=[]){
 const text=String(message||'').trim(),lower=text.toLowerCase(),words=text.split(/\s+/).filter(Boolean);
 const contextReference=/\b(ça|cela|ceci|celui-ci|celui-là|comme avant|comme tout à l'heure|la dernière fois|le même|continue|reprends|encore|ce projet|ce site)\b/i.test(lower);
 const explicitQuestion=/\?|\b(pourquoi|comment|quand|où|quel|quelle|combien|est-ce que)\b/i.test(lower);
 let goal='répondre';
 if(/\b(crée|créer|construis|construire|développe|développer|fais|faire|génère|générer|programme|ajoute|modifier|modifie|intègre|intégrer)\b/i.test(lower))goal='créer';
 else if(/\b(corrige|corriger|répare|réparer|debug|dépanne|dépanner|améliore|améliorer|fix)\b/i.test(lower))goal='corriger';
 else if(/\b(explique|expliquer|apprendre|comprends|comprendre|définition|c'est quoi|apprends)\b/i.test(lower))goal='expliquer';
 else if(/\b(compare|comparer|différence|analyse|analyser|évalue|évaluer|audit)\b/i.test(lower))goal='analyser';
 else if(/\b(plan|planifie|planifier|organise|organiser|étapes|stratégie|prépare)\b/i.test(lower))goal='planifier';
 const complexity=Math.min(5,(text.length>500?1:0)+(text.length>1200?1:0)+(words.length>80?1:0)+(\b(projet|architecture|système|workflow|mission|plusieurs|étapes|dépendance|déploiement|intégration)\b/i.test(lower)?2:0));
 const domain=/\b(code|javascript|python|html|css|react|next|github|api|bug|roblox)\b/i.test(lower)?'code':/\b(math|maths|calcul|équation|physique|chimie)\b/i.test(lower)?'science':/\b(cours|devoir|exercice|révision|collège|histoire|géographie)\b/i.test(lower)?'study':/\b(analyse|rapport|document|compare|comparaison)\b/i.test(lower)?'analysis':'general';
 const needsClarification=words.length<=2&&!contextReference&&!/^(salut|bonjour|hello|merci|ok|oui|non)$/i.test(text);
 return{goal,domain,complexity,contextReference,explicitQuestion,needsClarification,contextRequired:contextReference||history.length>0,confidence:Math.min(1,0.45+(words.length>5?0.2:0)+(explicitQuestion?0.1:0)+(contextReference?0.15:0)+(complexity>0?0.1:0))};
}

export function buildCognitiveContext({message='',history=[],memory='',project=null,documentText='',intent=null}={}){return{version:VERSION,immediate:String(message||'').slice(0,6000),conversation:history.slice(-12),memory:String(memory||'').slice(0,5000),project:project?{id:project.id,name:project.name,goal:project.goal,constraints:project.constraints||[],decisions:project.decisions||[],checkpoints:(project.checkpoints||[]).slice(-5)}:null,evidence:{document:Boolean(documentText),documentChars:String(documentText||'').length},intent:intent||null};}
export function buildRuntimeMissionContract({goal=null,mission=null}={}){return{version:VERSION,goalId:goal?.id||null,missionId:mission?.id||null,continuity:true,eventTrace:true,dependencyGraph:true,recovery:'bounded'};}

export function buildAdaptiveMissionState({mission,goal,evaluation=null}={}){return{version:VERSION,missionId:mission?.id||null,goalId:goal?.id||null,evaluation:evaluation||null,status:evaluation?.needsAdaptation?'adapting':mission?.status||'pending'};}

export function buildCognitivePlan({intent,decision}={}){const complexity=Number(intent?.complexity||0);return{version:VERSION,objective:intent?.goal||'répondre',complexity,mode:decision?.action||'direct',passes:complexity>=4?4:complexity>=2?3:2,stages:['comprendre','contextualiser','décider','exécuter','vérifier','adapter']};}

export function buildAdaptiveResponseProfile(intent){
 const complexity=Number(intent?.complexity||0);
 return{verbosity:complexity>=4?'detailed':complexity>=2?'balanced':'concise',structure:complexity>=2?'structured':'direct',verification:complexity>=3?'strong':'standard',agentMode:complexity>=3?'orchestrated':'single',recovery:complexity>=3,multiPass:complexity>=2,adaptation:complexity>=3};
}

function cleanProjectText(value,max=1200){return String(value||'').replace(/\u0000/g,'').trim().slice(0,max)}

export function createProjectState({name='',goal='',constraints=[],deliverables=[],decisions=[],context=''}={}){
 const now=new Date().toISOString();
 return{
  id:'project-'+Date.now().toString(36),version:VERSION,status:'active',name:cleanProjectText(name,120),
  goal:cleanProjectText(goal,4000),context:cleanProjectText(context,4000),
  constraints:Array.isArray(constraints)?constraints.map(x=>cleanProjectText(x,500)).filter(Boolean).slice(0,20):[],
  deliverables:Array.isArray(deliverables)?deliverables.map((x,i)=>typeof x==='string'?{id:'deliverable-'+(i+1),label:cleanProjectText(x,500),status:'pending'}:{...x}).slice(0,30):[],
  decisions:Array.isArray(decisions)?decisions.slice(0,30):[],
  checkpoints:[],activeMissionId:null,createdAt:now,updatedAt:now
 };
}

export function updateProjectState(project,patch={}){
 if(!project)return null;
 const updated={...project,...patch,version:VERSION,updatedAt:new Date().toISOString(),risks:Array.isArray(patch.risks)?patch.risks.slice(0,20):(project.risks||[])};
 if(Array.isArray(patch.constraints))updated.constraints=patch.constraints.map(x=>cleanProjectText(x,500)).filter(Boolean).slice(0,20);
 if(Array.isArray(patch.deliverables))updated.deliverables=patch.deliverables.slice(0,30);
 if(Array.isArray(patch.decisions))updated.decisions=patch.decisions.slice(0,30);
 return updated;
}

export function addProjectCheckpoint(project,{label='',status='completed',summary='',missionId=null}={}){
 if(!project)return null;
 const checkpoint={id:'checkpoint-'+Date.now().toString(36),label:cleanProjectText(label,300),status,summary:cleanProjectText(summary,1200),missionId,createdAt:new Date().toISOString()};
 return updateProjectState(project,{checkpoints:[...(project.checkpoints||[]),checkpoint].slice(-30)});
}

export function projectProgress(project){
 const items=Array.isArray(project?.deliverables)?project.deliverables:[];
 const completed=items.filter(x=>x?.status==='completed').length;
 return{completed,total:items.length,percent:items.length?Math.round(completed/items.length*100):0,checkpoints:Array.isArray(project?.checkpoints)?project.checkpoints.length:0,status:project?.status||'unknown'};
}

export function buildProjectBrief(project){
 if(!project)return'';
 return[
  'NEXUS PROJECT OS V5.0',
  'Projet : '+cleanProjectText(project.name,120),
  'Objectif : '+cleanProjectText(project.goal,2000),
  project.context?'Contexte : '+cleanProjectText(project.context,2000):'',
  project.constraints?.length?'Contraintes : '+project.constraints.join(' | '):'',
  project.deliverables?.length?'Livrables : '+project.deliverables.map(x=>x.label+' ['+(x.status||'pending')+']').join(' | '):'',
  project.decisions?.length?'Décisions : '+project.decisions.map(x=>typeof x==='string'?x:x.summary||x.label||'').join(' | '):'',
  project.checkpoints?.length?'Derniers checkpoints : '+project.checkpoints.slice(-5).map(x=>x.label+' ['+x.status+']').join(' | '):''
 ].filter(Boolean).join('\n');
}

export function createProjectFromMission(message,mission){
 const plan=planMission(message);
 if(!plan.isMission)return null;
 return createProjectState({
  name:'Mission Nexus — '+cleanProjectText(message,80),
  goal:message,
  deliverables:plan.steps.map((label,index)=>({id:'deliverable-'+(index+1),label,status:'pending',missionStep:'step-'+(index+1)}))
 });
}
