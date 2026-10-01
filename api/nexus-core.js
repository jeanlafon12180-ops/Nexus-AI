const VERSION='4.3.0';

export function buildNexusIdentity(){return[
'IDENTITÉ NEXUS CORE V4.3 : tu es le moteur central d’intelligence et d’orchestration de Nexus IA.',
'Tu analyses l’objectif réel, les contraintes, le contexte, la complexité et les capacités disponibles avant de choisir une stratégie.',
'Nexus Core reste indépendant du fournisseur de modèle et peut continuer avec un moteur de secours configuré si le modèle principal devient indisponible.',
'Tu restes honnête : aucune action, vérification, navigation, exécution ou observation ne doit être prétendue si elle n’a réellement eu lieu.'
].join('\n')}

export function buildReasoningPolicy(){return[
'POLITIQUE NEXUS CORE V4.3 :',
'- Décompose mentalement les tâches complexes en étapes utiles avant de répondre.',
'- Identifie objectif, résultat attendu, contraintes, contexte, dépendances et critères de réussite.',
'- Choisis la stratégie proportionnée : réponse directe, analyse, mission ou orchestration spécialisée.',
'- Utilise le contexte pertinent sans mélanger les sessions.',
'- Vérifie les résultats importants avant de les présenter.',
'- Sépare clairement faits, hypothèses, incertitudes et propositions.',
'- Si une information manque, demande une précision ciblée ou signale la limite.',
'- Ne révèle pas de raisonnement interne privé : expose uniquement les conclusions et les étapes utiles.',
'- Réévalue la stratégie après les étapes importantes et adapte la suite si le contexte change.',
'- Pour une tâche simple, évite les appels et étapes inutiles ; pour une tâche complexe, augmente la profondeur de contrôle.'
].join('\n')}

export function buildFutureEngineContract(){return{
version:VERSION,architecture:'nexus-core',orchestration:true,missionMode:true,missionEngine:'4.3',
modelResilience:true,primaryModel:'gpt-5.6-sol',fallbackReady:true,contextAdvisor:true,selfCorrection:true,
specializedAgents:true,agentOrchestration:true,autonomousCore:true,adaptivePlanning:true,adaptiveResponse:true,
intentEngine:'4.3',missionGraph:true,privacyBoundary:'session-scoped',verification:true,multimodalReady:true
}}

function uniqueSteps(steps){return[...new Set(steps)].slice(0,8)}
function makeStep(label,index,dependsOn=[]){return{id:'step-'+(index+1),order:index+1,label,status:'pending',dependsOn,startedAt:null,completedAt:null}}

export function planMission(message){
 const text=String(message||'').trim(),lower=text.toLowerCase();
 const isMission=text.length>300||/\b(site|application|projet|système|architecture|workflow|diagnostic|audit|comparaison|organise|planifie|construis|développe|réalise|crée|migration|déploiement)\b/i.test(text);
 if(!isMission)return{isMission:false,type:'simple',priority:'normal',steps:['Comprendre la demande','Répondre']};
 const labels=['Comprendre l’objectif et les contraintes'];
 if(/\b(site|application|projet|système|architecture|workflow|code|roblox|programme|développe|migration|déploiement)\b/i.test(lower)){
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
 activeStep:plan.isMission?steps[0]?.id||null:null,steps,graph:{type:'dependency-chain',root:steps[0]?.id||null}}
}

export function startMissionExecution(mission){
 if(!mission?.steps?.length)return mission;
 const first=mission.steps.find(s=>s.status==='pending'&&(!s.dependsOn?.length||s.dependsOn.every(id=>mission.steps.find(x=>x.id===id)?.status==='completed')));
 if(!first)return mission;
 const startedAt=new Date().toISOString();
 return{...mission,status:'running',startedAt:mission.startedAt||startedAt,activeStep:first.id,
 steps:mission.steps.map(s=>s.id===first.id?{...s,status:'running',startedAt:s.startedAt||startedAt}:s)}
}

export function completeMissionExecution(mission){
 const completedAt=new Date().toISOString();
 return{...mission,status:'completed',activeStep:null,completedAt,
 steps:mission.steps.map(s=>({...s,status:'completed',startedAt:s.startedAt||mission.startedAt||completedAt,completedAt:s.completedAt||completedAt}))}
}

export function failMissionExecution(mission,errorMessage=''){
 const failedAt=new Date().toISOString();
 return{...mission,status:'failed',activeStep:null,completedAt:failedAt,error:String(errorMessage||'Mission interrompue.').slice(0,500),
 steps:mission.steps.map(s=>s.status==='running'?{...s,status:'failed',completedAt:failedAt}:s)}
}

export function analyzeIntent(message,history=[]){
 const text=String(message||'').trim(),lower=text.toLowerCase(),words=text.split(/\s+/).filter(Boolean);
 const contextReference=/\b(ça|cela|ceci|celui-ci|celui-là|comme avant|comme tout à l'heure|la dernière fois|le même|continue|reprends|encore|ce projet|ce site)\b/i.test(lower);
 const explicitQuestion=/\?|\b(pourquoi|comment|quand|où|quel|quelle|combien|est-ce que)\b/i.test(lower);
 let goal='répondre';
 if(/\b(crée|créer|construis|construire|développe|développer|fais|faire|génère|générer|programme|ajoute|modifier|modifie)\b/i.test(lower))goal='créer';
 else if(/\b(corrige|corriger|répare|réparer|debug|dépanne|dépanner|améliore|améliorer|fix)\b/i.test(lower))goal='corriger';
 else if(/\b(explique|expliquer|apprendre|comprends|comprendre|définition|c'est quoi|apprends)\b/i.test(lower))goal='expliquer';
 else if(/\b(compare|comparer|différence|analyse|analyser|évalue|évaluer|audit)\b/i.test(lower))goal='analyser';
 else if(/\b(plan|planifie|planifier|organise|organiser|étapes|stratégie|prépare)\b/i.test(lower))goal='planifier';
 const complexity=Math.min(5,(text.length>500?1:0)+(text.length>1200?1:0)+(words.length>80?1:0)+(/\b(projet|architecture|système|workflow|mission|plusieurs|étapes|dépendance|déploiement)\b/i.test(lower)?2:0));
 const domain=/\b(code|javascript|python|html|css|react|next|github|api|bug|roblox)\b/i.test(lower)?'code':/\b(math|maths|calcul|équation|physique|chimie)\b/i.test(lower)?'science':/\b(cours|devoir|exercice|révision|collège|histoire|géographie)\b/i.test(lower)?'study':/\b(analyse|rapport|document|compare|comparaison)\b/i.test(lower)?'analysis':'general';
 const needsClarification=words.length<=2&&!contextReference&&!/^(salut|bonjour|hello|merci|ok|oui|non)$/i.test(text);
 return{goal,domain,complexity,contextReference,explicitQuestion,needsClarification,contextRequired:contextReference||history.length>0,confidence:Math.min(1,0.45+(words.length>5?0.2:0)+(explicitQuestion?0.1:0)+(contextReference?0.15:0)+(complexity>0?0.1:0))};
}

export function buildAdaptiveResponseProfile(intent){
 const complexity=Number(intent?.complexity||0);
 return{verbosity:complexity>=4?'detailed':complexity>=2?'balanced':'concise',structure:complexity>=2?'structured':'direct',verification:complexity>=3?'strong':'standard',agentMode:complexity>=3?'orchestrated':'single'};
}
