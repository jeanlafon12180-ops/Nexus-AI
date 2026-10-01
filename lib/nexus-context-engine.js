const VERSION='5.2.4';

export function prioritizeContext({message='',history=[],memory='',project=null,documentText=''}={}){
 const entries=[
  {type:'immediate',priority:'critical',weight:1,text:String(message||'').slice(0,6000)},
  {type:'project',priority:project?'critical':'low',weight:project?0.95:0,text:project?JSON.stringify({name:project.name,goal:project.goal,constraints:project.constraints||[],decisions:project.decisions||[]}).slice(0,6000):''},
  {type:'document',priority:documentText?'important':'low',weight:documentText?0.9:0,text:String(documentText||'').slice(0,8000)},
  {type:'conversation',priority:history.length?'relevant':'low',weight:history.length?0.75:0,text:history.slice(-8)},
  {type:'memory',priority:memory?'relevant':'low',weight:memory?0.65:0,text:String(memory||'').slice(0,4000)}
 ];
 return{version:VERSION,entries:entries.filter(x=>x.weight>0).sort((a,b)=>b.weight-a.weight),rule:'priorité au contexte directement nécessaire à l’objectif'};
}

export function buildPrioritizedContextPrompt(context){
 return['NEXUS CONTEXT PRIORITY 5.2.4 :','Utilise d’abord le contexte au poids le plus élevé.',...(context?.entries||[]).map(e=>e.type+' ['+e.priority+']'), 'Ignore le contexte non pertinent et ne transforme jamais une hypothèse en fait.'].join('\n');
}
