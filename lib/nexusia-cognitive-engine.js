const VERSION='5.3.0';

function words(text=''){return String(text).trim().split(/\s+/).filter(Boolean);}
function normalize(text=''){return String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function has(re,text){return re.test(normalize(text));}

export function analyzeCognition({message='',history=[],memory='',documentText='',project=null}={}){
 const text=String(message||'').trim(), lower=normalize(text), tokens=words(text);
 const intent={
  question:/[?]|\b(pourquoi|comment|quand|ou|quel|quelle|combien|est-ce que)\b/.test(lower),
  action:/\b(creer|construire|developper|modifier|corriger|reparer|installer|integrer|deployer|automatiser|generer|ecrire|programmer)\b/.test(lower),
  analysis:/\b(analyse|analyser|compare|comparer|audit|diagnostic|preuve|verifie|examiner|evaluer)\b/.test(lower),
  planning:/\b(plan|planifier|organiser|architecture|strategie|etapes|workflow|mission|roadmap)\b/.test(lower),
  creation:/\b(image|photo|dessin|video|musique|audio|logo|design)\b/.test(lower),
  code:/\b(code|javascript|typescript|python|react|next|node|html|css|sql|api|script|github|roblox|lua)\b/.test(lower),
  files:/\b(fichier|pdf|document|piece jointe|archive|csv|json)\b/.test(lower),
  live:/\b(live|temps reel|streaming|flux)\b/.test(lower),
  contextRef:/\b(ca|cela|ceci|comme avant|reprends|continue|encore|le meme|ce projet|ce site|la derniere|plus haut)\b/.test(lower)
 };
 const evidence={conversation:history.length>0,memory:Boolean(memory),document:Boolean(documentText),project:Boolean(project)};
 const ambiguitySignals=[
  text.length<8,
  intent.contextRef&&!history.length,
  /\b(ceci|ca|cela|le truc|la chose|fait ca)\b/.test(lower)&&text.split(/\s+/).length<10,
  /\b(et|puis|aussi|encore)\b/.test(lower)&&text.split(/\s+/).length<5
 ].filter(Boolean).length;
 const contradictionSignals=[
  /\b(ne .* pas|sans)\b/.test(lower)&&/\b(avec|ajoute|active)\b/.test(lower),
  /\b(sans cle|sans api)\b/.test(lower)&&/\b(api key|cle api|cle)\b/.test(lower),
  /\b(exactement|strictement)\b/.test(lower)&&/\b(change|modifier)\b/.test(lower)
 ].filter(Boolean).length;
 const complexity=Math.min(5,
  +(tokens.length>35),
  +(tokens.length>90),
  +(intent.action||intent.analysis||intent.planning),
  +(intent.creation||intent.code||intent.files||intent.live),
  +(intent.contextRef||history.length>5||Boolean(project)||Boolean(documentText))
 );
 const evidenceCount=Object.values(evidence).filter(Boolean).length;
 const confidence=Math.max(0.2,Math.min(0.98,
  0.48+(tokens.length>8?0.12:0)+(Object.values(intent).filter(Boolean).length>1?0.10:0)+evidenceCount*0.04-ambiguitySignals*0.08-contradictionSignals*0.08
 ));
 const mode=intent.creation?'creative':intent.code?'engineering':intent.analysis?'analysis':intent.planning?'planning':intent.action?'execution':intent.question?'explanation':'direct';
 const modality=intent.creation?(intent.live?'live':has(/\b(video|vidéo)\b/,text)?'video':has(/\b(musique|audio)\b/,text)?'music':'image'):intent.files?'files':intent.live?'live':intent.code?'code':'text';
 const confidenceBand=confidence>=0.82?'high':confidence>=0.62?'medium':'low';
 return{version:VERSION,intent,complexity,confidence,confidenceBand,mode,modality,evidence,ambiguityScore:ambiguitySignals,contradictionScore:contradictionSignals,tokenCount:tokens.length,requiresClarification:Boolean(ambiguitySignals>=2||contradictionSignals>=2)};
}

export function buildCognitiveStrategy(cognition={}){
 const c=cognition||{}, depth=c.complexity>=4?'deep':c.complexity>=2?'balanced':'fast';
 const stages=depth==='deep'
  ?['comprendre','extraire objectif/contraintes','analyser contexte et preuves','décomposer','choisir outils/moteurs','exécuter','vérifier','corriger si nécessaire','adapter','livrer']
  :depth==='balanced'
   ?['comprendre','décomposer','exécuter','vérifier','adapter']
   :['comprendre','répondre','contrôler'];
 return{
  version:VERSION,depth,stages,
  verification:c.complexity>=4?'deep':c.complexity>=2?'strong':'standard',
  adaptation:c.complexity>=3,
  contextPriority:c.intent?.contextRef?'high':'normal',
  evidencePriority:c.evidence?.document||c.evidence?.project?'high':'normal',
  clarificationRequired:Boolean(c.ambiguityScore>=2||c.contradictionScore>=2),
  modality:c.modality||'text'
 };
}

export function buildCognitivePrompt(cognition={},strategy={}){
 return[
  'NEXUS COGNITIVE ENGINE V5.3.0',
  'Tu es le contrôleur cognitif de Nexus IA. Ne révèle jamais de chaîne de pensée privée.',
  'Mode : '+strategy.depth+'. Complexité : '+cognition.complexity+'/5. Confiance : '+Math.round((cognition.confidence||0)*100)+'%.',
  'Modalité détectée : '+(cognition.modality||'text')+'.',
  'Stratégie : '+strategy.stages.join(' → ')+'.',
  'RÈGLE 1 — OBJECTIF : identifie le résultat réellement demandé avant de produire du contenu.',
  'RÈGLE 2 — CONTRAINTES : respecte les contraintes explicites et signale les incompatibilités au lieu de les ignorer.',
  'RÈGLE 3 — PREUVES : donne priorité aux données fournies par l’utilisateur, aux documents et au projet actif. Sépare faits, hypothèses et inconnues.',
  'RÈGLE 4 — OUTILS : si une capacité spécialisée est nécessaire, choisis le moteur correspondant et ne prétends pas qu’il a fonctionné tant que son résultat n’existe pas.',
  'RÈGLE 5 — VÉRIFICATION : contrôle les points critiques, calculs, code, formats, cohérence et respect de la demande avant livraison.',
  'RÈGLE 6 — ADAPTATION : si le résultat ne satisfait pas l’objectif, corrige-le avant de répondre. Si une donnée essentielle manque, pose une question ciblée.',
  'RÈGLE 7 — EFFICACITÉ : ne fais pas dix étapes quand deux suffisent, mais ne simplifie pas artificiellement une tâche complexe.',
  strategy.clarificationRequired?'ATTENTION : ambiguïté ou contradiction détectée. Clarifie le point bloquant avant d’inventer.':''
 ].filter(Boolean).join('\n');
}

export function getCognitiveStatus(){
 return{
  version:VERSION,
  contextAnalysis:true,intentAnalysis:true,complexityScoring:true,
  adaptivePlanning:true,evidenceTracking:true,uncertaintyControl:true,
  contradictionDetection:true,ambiguityDetection:true,modalityRouting:true,
  toolSelectionPolicy:true,verificationPolicy:true,adaptiveCorrection:true,
  privateReasoningProtected:true,confidenceCalibration:true,modeResolution:true
 };
}


export function calibrateCognitiveConfidence({confidence=0,ambiguityScore=0,contradictionScore=0,evidenceCount=0}={}){
 const adjusted=Math.max(0.05,Math.min(0.98,Number(confidence||0)-Number(ambiguityScore||0)*0.08-Number(contradictionScore||0)*0.1+Math.min(0.12,Number(evidenceCount||0)*0.03)));
 return {confidence:adjusted,band:adjusted>=0.82?'high':adjusted>=0.62?'medium':'low',needsClarification:adjusted<0.5||Number(ambiguityScore||0)>=2||Number(contradictionScore||0)>=2};
}

export function resolveCognitiveMode({cognition={},hasImage=false,hasDocument=false}={}){
 if(hasImage&&cognition?.intent?.creation)return 'multimodal-creation';
 if(hasImage)return 'vision-analysis';
 if(hasDocument)return 'document-analysis';
 if(cognition?.intent?.code)return 'engineering';
 if(cognition?.intent?.analysis)return 'analysis';
 if(cognition?.intent?.planning)return 'planning';
 return cognition?.mode||'direct';
}

export function buildCognitiveDecisionMatrix({cognition={},goal=null,context=null}={}){
 const c=cognition||{}, ambiguity=Number(c.ambiguityScore||0), contradiction=Number(c.contradictionScore||0);
 const evidence=Object.values(c.evidence||{}).filter(Boolean).length;
 const complexity=Number(c.complexity||0);
 const needsClarification=ambiguity>=2||contradiction>=2||(Number(c.confidence||0)<0.5&&!evidence);
 const depth=complexity>=4?'deep':complexity>=2?'standard':'light';
 const verification=complexity>=4||contradiction>0||Boolean(goal)?'deep':complexity>=2?'strong':'standard';
 return {version:VERSION,depth,verification,needsClarification,evidenceLevel:evidence>=3?'rich':evidence>=1?'partial':'none',contextRequired:Boolean(context),next:needsClarification?'clarify':depth==='deep'?'orchestrate':'respond'};
}

export function buildEvidencePolicy({webRequired=false,webResearch=null}={}){return{version:VERSION,webRequired,sourceCount:webResearch?.results?.length||0,trustedSources:webResearch?.trustedCount||0,verification:webRequired?'multi-source':'context-only',rule:'ne pas présenter une information fraîche comme vérifiée sans recherche réelle'}}
