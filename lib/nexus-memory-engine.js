const VERSION='5.2.5';
export function createMemoryStore({sessionId='default',projectId=null}={}){
 return{version:VERSION,sessionId,projectId,session:{},project:{},missions:{},decisions:{},events:[]};
}
export function remember(store,scope,key,value){
 const target=store?.[scope]||{};
 return{...store,[scope]:{...target,[key]:value}};
}
export function recordMemoryEvent(store,event){
 return{...store,events:[...(store?.events||[]),{...event,at:event.at||new Date().toISOString()}].slice(-200)};
}
export function getMemorySnapshot(store){
 return{version:VERSION,session:store?.session||{},project:store?.project||{},missions:store?.missions||{},decisions:store?.decisions||{},events:(store?.events||[]).slice(-50)};
}


export function summarizeMemoryScope(store,scope='session'){
 const value=store?.[scope];
 return {version:VERSION,scope,available:Boolean(value),keys:value&&typeof value==='object'?Object.keys(value).slice(0,50):[],eventCount:Array.isArray(store?.events)?store.events.length:0};
}

export function pruneMemoryEvents(store,maxEvents=200){
 const limit=Math.max(20,Math.min(500,Number(maxEvents)||200));
 return {...store,version:VERSION,events:(store?.events||[]).slice(-limit)};
}
\n\nexport function summarizeMemoryScope(store,scope='session'){const value=store?.[scope];return{version:VERSION,scope,available:Boolean(value),keys:value&&typeof value==='object'?Object.keys(value).slice(0,50):[],eventCount:Array.isArray(store?.events)?store.events.length:0};}\nexport function pruneMemoryEvents(store,maxEvents=200){const limit=Math.max(20,Math.min(500,Number(maxEvents)||200));return{...store,version:VERSION,events:(store?.events||[]).slice(-limit)};}\n