const VERSION='5.2.3';

const ENGINES=Object.freeze({
 text:{id:'text',env:'NEXUS_LOCAL_TEXT_URL',kind:'language',capabilities:['text','code','reasoning']},
 vision:{id:'vision',env:'NEXUS_LOCAL_VISION_URL',kind:'vision',capabilities:['vision']},
 image:{id:'image',env:'NEXUS_LOCAL_IMAGE_URL',kind:'image',capabilities:['image','image-edit']},
 video:{id:'video',env:'NEXUS_LOCAL_VIDEO_URL',kind:'video',capabilities:['video']},
 audio:{id:'audio',env:'NEXUS_LOCAL_AUDIO_URL',kind:'audio',capabilities:['audio','speech']},
 music:{id:'music',env:'NEXUS_LOCAL_MUSIC_URL',kind:'music',capabilities:['music']},
 files:{id:'files',env:'NEXUS_LOCAL_FILE_URL',kind:'files',capabilities:['files','documents']},
 live:{id:'live',env:'NEXUS_LOCAL_LIVE_URL',kind:'live',capabilities:['live','streaming']}
});
const ALIASES=Object.freeze({photo:'image',dessin:'image','image-editing':'image','vidéo':'video',musique:'music',son:'audio',fichier:'files',pdf:'files',document:'files',programmation:'text',programming:'text','temps-reel':'live','temps réel':'live'});

function normalizeCapability(value='text'){
 const key=String(value).toLowerCase().trim();
 return ALIASES[key]||key;
}
export function listNativeEngines(){
 return Object.values(ENGINES).map(x=>({id:x.id,kind:x.kind,capabilities:x.capabilities,configured:Boolean(process.env[x.env]),urlConfigured:Boolean(process.env[x.env])}));
}
export function getNativeEngine(id){return ENGINES[normalizeCapability(id)]||null;}
export function chooseNativeEngine({intent='',capability='text'}={}){
 const wanted=normalizeCapability(capability);
 const candidates=Object.values(ENGINES).filter(x=>x.id===wanted||x.kind===wanted||x.capabilities.includes(wanted));
 return candidates.find(x=>process.env[x.env])||candidates[0]||null;
}
export function buildNativeExecutionPlan({message='',capability='text'}={}){
 const normalized=normalizeCapability(capability),engine=chooseNativeEngine({intent:message,capability:normalized}),configured=Boolean(engine&&process.env[engine.env]);
 return{version:VERSION,mode:'local-first',engine:engine?.id||'text',capability:normalized,configured,available:configured,apiKeyRequired:false,externalFallbackOptional:true,execution:'native-engine'};
}
export function buildNativeCapabilityContract(){
 return{version:VERSION,localFirst:true,apiKeyRequired:false,engines:Object.keys(ENGINES),aliases:ALIASES,capabilities:[...new Set(Object.values(ENGINES).flatMap(x=>x.capabilities))],cloudFallback:'optional',note:'Une capacité est disponible uniquement si son moteur compatible est réellement configuré.'};
}
export function getNativeCapabilityStatus(){
 return listNativeEngines().reduce((acc,engine)=>{for(const capability of engine.capabilities)acc[capability]=Boolean(acc[capability]||engine.configured);return acc;},{});
}
export function getNativeCapabilityDetails(){
 return Object.fromEntries(listNativeEngines().map(engine=>[engine.id,{configured:engine.configured,capabilities:engine.capabilities,env:engine.id==='files'?'NEXUS_LOCAL_FILE_URL':ENGINES[engine.id].env}]));
}
