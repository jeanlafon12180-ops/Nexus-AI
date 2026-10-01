const VERSION='5.3.0';

export function prioritizeContext({message='',history=[],memory='',project=null,documentText=''}={}){
 const entries=[
  {type:'immediate',priority:'critical',weight:1,text:String(message||'').slice(0,6000)},
  {type:'project',priority:project?'critical':'low',weight:project?0.95:0,text:project?JSON.stringify({name:project.name,goal:project.goal,constraints:project.constraints||[],decisions:project.decisions||[]}).slice(0,6000):''},
  {type:'document',priority:documentText?'important':'low',weight:documentText?0.9:0,text:String(documentText||'').slice(0,8000)},
  {type:'conversation',priority:history.length?'relevant':'low',weight:history.length?0.75:0,text:history.slice(-8)},
  {type:'memory',priority:memory?'relevant':'low',weight:memory?0.72:0,text:String(memory||'').slice(0,4000)}
 ];
 return{version:VERSION,entries:entries.filter(x=>x.weight>0).sort((a,b)=>b.weight-a.weight),rule:'priorité au contexte directement nécessaire à l’objectif'};
}

export function buildPrioritizedContextPrompt(context){
 return['NEXUS CONTEXT PRIORITY 5.3.0 :','Utilise d’abord le contexte au poids le plus élevé.',...(context?.entries||[]).map(e=>e.type+' ['+e.priority+']'), 'Ignore le contexte non pertinent et ne transforme jamais une hypothèse en fait.'].join('\n');
}


export function buildContextFingerprint(context={}){
 const entries=Array.isArray(context?.entries)?context.entries:[];
 return {version:VERSION,count:entries.length,types:[...new Set(entries.map(e=>e.type).filter(Boolean))],priorities:entries.map(e=>e.priority).slice(0,12)};
}
\n\nexport function buildContextFingerprint(context={}){const entries=Array.isArray(context?.entries)?context.entries:[];return{version:VERSION,count:entries.length,types:[...new Set(entries.map(e=>e.type).filter(Boolean))],priorities:entries.map(e=>e.priority).slice(0,12)};}\n
export function buildEvidenceContext({webResearch=null,memory='',documentText='',project=null}={}){return{version:VERSION,web:webResearch?.queried?{trustedCount:webResearch.trustedCount||0,verified:Boolean(webResearch.verified),sources:webResearch.sources||[]}:null,memory:Boolean(memory),document:Boolean(documentText),project:Boolean(project),rule:'les preuves externes sont séparées des souvenirs et du contexte utilisateur'}}
