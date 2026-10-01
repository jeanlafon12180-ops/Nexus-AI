const VERSION='4.2.1';

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

function normalizeCapability(value='text'){
 const key=String(value).toLowerCase().trim();
 return key==='photo'||key==='dessin'||key==='image-editing'?'image':
        key==='vidéo'?'video':
        key==='musique'?'music':
        key==='fichier'||key==='pdf'||key==='document'?'files':
        key==='code'||key==='programming'?'text':key;
}

export function listNativeEngines(){
 return Object.values(ENGINES).map(x=>({
  id:x.id,kind:x.kind,capabilities:x.capabilities,
  configured:Boolean(process.env[x.env]),urlConfigured:Boolean(process.env[x.env])
 }));
}

export function getNativeEngine(id){return ENGINES[id]||null;}

export function chooseNativeEngine({intent='',capability='text'}={}){
 const wanted=normalizeCapability(capability);
 const candidates=Object.values(ENGINES).filter(x=>x.id===wanted||x.kind===wanted||x.capabilities.includes(wanted));
 return candidates.find(x=>process.env[x.env])||candidates[0]||null;
}

export function buildNativeExecutionPlan({message='',capability='text'}={}){
 const engine=chooseNativeEngine({intent:message,capability});
 return{
  version:VERSION,mode:'local-first',engine:engine?.id||'text',
  capability:normalizeCapability(capability),
  configured:Boolean(engine&&process.env[engine.env]),
  apiKeyRequired:false,externalFallbackOptional:true
 };
}

export function buildNativeCapabilityContract(){
 return{
  version:VERSION,localFirst:true,apiKeyRequired:false,
  engines:Object.keys(ENGINES),
  capabilities:[...new Set(Object.values(ENGINES).flatMap(x=>x.capabilities))],
  cloudFallback:'optional',
  note:'Chaque capacité est déclarée opérationnelle uniquement lorsqu’un moteur compatible est réellement configuré.'
 };
}

export function getNativeCapabilityStatus(){
 return listNativeEngines().reduce((acc,engine)=>{
  for(const capability of engine.capabilities) acc[capability]=Boolean(acc[capability]||engine.configured);
  return acc;
 },{});
}
