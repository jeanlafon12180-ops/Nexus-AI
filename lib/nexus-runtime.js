const VERSION='5.3.0';

const TASK_STATES=Object.freeze(['pending','ready','running','completed','failed','blocked']);
const EVENT_TYPES=Object.freeze(['mission.created','mission.started','task.started','task.completed','task.failed','task.blocked','goal.changed','context.updated','verification.failed','mission.recovered','mission.completed']);

function id(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}

export function createRuntimeMission({goal=null,tasks=[]}={}){
 const ids=tasks.map(t=>t.id||id('task')); const normalized=tasks.map((task,index)=>({id:ids[index],title:String(task.title||task.name||('Task '+(index+1))),dependsOn:(Array.isArray(task.dependsOn)?task.dependsOn:[]).map(dep=>dep==='task-placeholder'?ids[Math.max(0,index-1)]:dep==='task-placeholder-2'?ids[Math.max(0,index-1)]:dep),state:'pending',attempts:0,result:null,error:null}));
 return{version:VERSION,id:id('mission'),status:'created',goalId:goal?.id||null,tasks:normalized,events:[{id:id('evt'),type:'mission.created',at:new Date().toISOString()}],checkpoint:null,adaptations:0};
}
export function appendRuntimeEvent(mission,type,payload={}){
 if(!EVENT_TYPES.includes(type))type='context.updated';
 return{...mission,events:[...(mission.events||[]),{id:id('evt'),type,at:new Date().toISOString(),payload}].slice(-100)};
}
export function getReadyTasks(mission){
 const tasks=mission?.tasks||[];
 return tasks.filter(t=>t.state==='pending'&&(t.dependsOn||[]).every(dep=>tasks.find(x=>x.id===dep)?.state==='completed')).map(t=>t.id);
}
export function startRuntimeTask(mission,taskId){
 const ready=getReadyTasks(mission);
 if(!ready.includes(taskId))return appendRuntimeEvent(mission,'task.blocked',{taskId,reason:'dependencies'});
 return appendRuntimeEvent({...mission,tasks:mission.tasks.map(t=>t.id===taskId?{...t,state:'running',attempts:t.attempts+1}:t)},'task.started',{taskId});
}
export function completeRuntimeTask(mission,taskId,result=null){
 return appendRuntimeEvent({...mission,tasks:mission.tasks.map(t=>t.id===taskId?{...t,state:'completed',result}:t)},'task.completed',{taskId});
}
export function failRuntimeTask(mission,taskId,error='unknown'){
 return appendRuntimeEvent({...mission,tasks:mission.tasks.map(t=>t.id===taskId?{...t,state:'failed',error}:t)},'task.failed',{taskId,error});
}
export function checkpointRuntimeMission(mission){
 return{...mission,checkpoint:{at:new Date().toISOString(),completed:(mission.tasks||[]).filter(t=>t.state==='completed').map(t=>t.id),running:(mission.tasks||[]).filter(t=>t.state==='running').map(t=>t.id)}};
}
export function recoverRuntimeMission(mission){
 const recovered={...mission,status:'recovered',tasks:(mission.tasks||[]).map(t=>t.state==='running'?{...t,state:'ready'}:t)};
 return appendRuntimeEvent(recovered,'mission.recovered',{resumeFrom:mission.checkpoint||null});
}
export function getRuntimeStatus(mission){
 const tasks=mission?.tasks||[], completed=tasks.filter(t=>t.state==='completed').length;
 return{version:VERSION,status:mission?.status||'unknown',tasks:tasks.length,completed,progress:tasks.length?Math.round(completed/tasks.length*100):0,ready:getReadyTasks(mission),events:(mission?.events||[]).length,adaptations:mission?.adaptations||0};
}
export function continueMission(mission){
 const status=getRuntimeStatus(mission);
 if(status.tasks&&status.completed===status.tasks)return appendRuntimeEvent({...mission,status:'completed'},'mission.completed');
 return {...mission,status:'running'};
}


export function validateRuntimeMission(mission){
 const tasks=Array.isArray(mission?.tasks)?mission.tasks:[];
 const ids=new Set(tasks.map(t=>t.id));
 const broken=tasks.filter(t=>(t.dependsOn||[]).some(dep=>!ids.has(dep))).map(t=>t.id);
 return {version:VERSION,valid:broken.length===0,brokenDependencies:broken,cyclesDetected:false};
}

export function buildRuntimeCheckpoint(mission){
 const tasks=Array.isArray(mission?.tasks)?mission.tasks:[];
 return {version:VERSION,at:new Date().toISOString(),completed:tasks.filter(t=>t.state==='completed').map(t=>t.id),running:tasks.filter(t=>t.state==='running').map(t=>t.id),failed:tasks.filter(t=>t.state==='failed').map(t=>t.id)};
}
\n\nexport function validateRuntimeMission(mission){const tasks=Array.isArray(mission?.tasks)?mission.tasks:[];const ids=new Set(tasks.map(t=>t.id));const broken=tasks.filter(t=>(t.dependsOn||[]).some(dep=>!ids.has(dep))).map(t=>t.id);return{version:VERSION,valid:broken.length===0,brokenDependencies:broken,cyclesDetected:false};}\nexport function buildRuntimeCheckpoint(mission){const tasks=Array.isArray(mission?.tasks)?mission.tasks:[];return{version:VERSION,at:new Date().toISOString(),completed:tasks.filter(t=>t.state==='completed').map(t=>t.id),running:tasks.filter(t=>t.state==='running').map(t=>t.id),failed:tasks.filter(t=>t.state==='failed').map(t=>t.id)};}\n
export function buildRuntimeHealth(mission){const validation=validateRuntimeMission(mission);const status=getRuntimeStatus(mission);return{version:VERSION,valid:validation.valid,progress:status.progress,blocked:status.ready.length===0&&status.completed<status.tasks,events:status.events,recoverable:!validation.brokenDependencies.length}};
