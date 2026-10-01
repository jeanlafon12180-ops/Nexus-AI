const VERSION='4.9.0';
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
