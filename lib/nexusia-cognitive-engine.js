const VERSION='4.2.1';

function words(text=''){return String(text).trim().split(/\s+/).filter(Boolean);}
function normalize(text=''){return String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}

export function analyzeCognition({message='',history=[],memory='',documentText='',project=null}={}){
 const text=String(message||'').trim(), lower=normalize(text), tokens=words(text);
 const question=/[?]|\b(pourquoi|comment|quand|ou|quel|quelle|combien|est-ce que)\b/.test(lower);
 const action=/\b(creer|construire|developper|modifier|corriger|reparer|installer|integrer|deployer|automatiser|generer)\b/.test(lower);
 const analysis=/\b(analyse|analyser|compare|comparer|audit|diagnostic|raisonne|preuve|verifie)\b/.test(lower);
 const planning=/\b(plan|planifier|organiser|architecture|strategie|etapes|workflow|mission)\b/.test(lower);
 const contextRef=/\b(ca|cela|ceci|comme avant|reprends|continue|encore|le meme|ce projet|ce site|la derniere)\b/.test(lower);
 const complexity=Math.min(5,
   tokens.length>40?1:0,
   tokens.length>100?1:0,
   +(action||analysis||planning),
   +(contextRef||history.length>4||Boolean(project)),
   +(documentText.length>2000||memory.length>1000)
 );
 const evidence={conversation:history.length>0,memory:Boolean(memory),document:Boolean(documentText),project:Boolean(project)};
 const confidence=Math.min(1,0.45+(tokens.length>8?0.15:0)+(question?0.1:0)+(action||analysis||planning?0.1:0)+(contextRef?0.1:0)+(Object.values(evidence).filter(Boolean).length*0.025));
 const mode=analysis?'analysis':action?'execution':planning?'planning':question?'explanation':'direct';
 return{version:VERSION,intent:{question,action,analysis,planning,contextRef},complexity,confidence,mode,evidence,tokenCount:tokens.length};
}

export function buildCognitiveStrategy(cognition){
 const c=cognition||{}, depth=c.complexity>=4?'deep':c.complexity>=2?'balanced':'fast';
 const stages=depth==='deep'?['comprendre','extraire les contraintes','décomposer','sélectionner la stratégie','exécuter','contrôler','adapter']:depth==='balanced'?['comprendre','décomposer','répondre','contrôler']:['comprendre','répondre','contrôler'];
 return{version:VERSION,depth,stages,verification:c.complexity>=2?'strong':'standard',adaptation:c.complexity>=3,contextPriority:c.intent?.contextRef?'high':'normal'};
}

export function buildCognitivePrompt(cognition,strategy){
 return [
  'NEXUS COGNITIVE ENGINE 4.2.1',
  'Utilise cette couche comme contrôleur de qualité, pas comme une obligation de révéler ton raisonnement interne.',
  'Mode : '+strategy.depth+'. Complexité : '+cognition.complexity+'/5. Confiance de classification : '+Math.round(cognition.confidence*100)+'%.',
  'Stratégie : '+strategy.stages.join(' → ')+'.',
  'Règles : privilégie les informations réellement fournies ; distingue faits, hypothèses et incertitudes ; vérifie les calculs et les contraintes ; adapte la profondeur à la difficulté ; si une donnée essentielle manque, pose une question ciblée plutôt que d’inventer.',
  'Ne révèle jamais de chaîne de pensée privée. Donne uniquement les conclusions, vérifications et étapes utiles.'
 ].join('\n');
}

export function getCognitiveStatus(){
 return{version:VERSION,contextAnalysis:true,intentAnalysis:true,complexityScoring:true,adaptivePlanning:true,evidenceTracking:true,uncertaintyControl:true,verificationPolicy:true,privateReasoningProtected:true};
}
