const VERSION='5.4.0';
export function createMemoryStore({sessionId='default',projectId=null}={}){return{version:VERSION,sessionId,projectId,session:{},project:{},missions:{},decisions:{},events:[]};}
export function remember(store,scope,key,value){const target=store?.[scope]||{};return{...store,[scope]:{...target,[key]:value}};}
export function recordMemoryEvent(store,event){return{...store,events:[...(store?.events||[]),{...event,at:event.at||new Date().toISOString()}].slice(-200)};}
export function getMemorySnapshot(store){return{version:VERSION,session:store?.session||{},project:store?.project||{},missions:store?.missions||{},decisions:store?.decisions||{},events:(store?.events||[]).slice(-50)};}
export function summarizeMemoryScope(store,scope='session'){const value=store?.[scope];return{version:VERSION,scope,available:Boolean(value),keys:value&&typeof value==='object'?Object.keys(value).slice(0,50):[],eventCount:Array.isArray(store?.events)?store.events.length:0};}
export function pruneMemoryEvents(store,maxEvents=200){const limit=Math.max(20,Math.min(500,Number(maxEvents)||200));return{...store,version:VERSION,events:(store?.events||[]).slice(-limit)};}
function clean(v,max=300){return String(v||'').replace(/[\u0000]/g,'').trim().slice(0,max);}
export function learnFromInteraction({store,message='',assistantText='',explicitOnly=true}={}){
 let next=store||createMemoryStore(),notes=Array.isArray(next.session?.notes)?next.session.notes:[];
 const text=clean(message,2000),lower=text.toLowerCase(),learned=[];
 const push=(kind,value,source='user-explicit')=>{const v=clean(value);if(!v||v.length<2)return;if(!notes.some(n=>String(n.value||n).toLowerCase()===v.toLowerCase())){notes=[...notes,{kind,value:v,source,at:new Date().toISOString(),confidence:source==='user-explicit'?.96:.72}].slice(-100);learned.push({kind,value:v});}};
 let m=lower.match(/(?:je m'appelle|je m’appelle|appelle[- ]moi|mon prénom est)\s+([^.!?\n]{2,50})/i);if(m)push('identity.name',m[1]);
 m=lower.match(/(?:j'habite|j’habite|je vis à|je vis a|ma ville est)\s+([^.!?\n]{2,80})/i);if(m)push('identity.location',m[1]);
 m=text.match(/(?:je préfère|je prefere|je veux que tu|j'aime quand|j’aime quand)\s+([^.!?\n]{4,180})/i);if(m)push('preference',m[1]);
 m=text.match(/(?:souviens[- ]toi|rappelle[- ]toi|à retenir|a retenir)\s*[:,-]?\s*([^.!?\n]{4,220})/i);if(m)push('explicit-memory',m[1]);
 if(!explicitOnly&&/\b(mon projet|mon application|mon site)\b/i.test(text))push('project-context',text,'context-inferred');
 next={...next,version:VERSION,session:{...(next.session||{}),notes},events:[...(next.events||[]),...learned.map(item=>({type:'memory.learned',...item,at:new Date().toISOString()}))].slice(-200)};
 return{store:next,learned};
}
export function buildMemoryContext(memory,message=''){
 const notes=Array.isArray(memory?.session?.notes)?memory.session.notes:[];
 const q=String(message).toLowerCase(),tokens=new Set(q.split(/\W+/).filter(t=>t.length>2));
 return notes.map(n=>typeof n==='string'?n:n.value).map(value=>({value,score:[...tokens].filter(t=>value.toLowerCase().includes(t)).length})).sort((a,b)=>b.score-a.score).slice(0,12).map(x=>x.value);
}
export function getMemoryStatus(store){return{version:VERSION,learnedCount:Array.isArray(store?.session?.notes)?store.session.notes.length:0,scoped:true,userControlled:true,explicitLearning:true};}
