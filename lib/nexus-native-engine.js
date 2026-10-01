const VERSION='5.0.0';

const ENGINES=Object.freeze({
 text:{id:'text',env:'NEXUS_LOCAL_TEXT_URL',kind:'language'},
 vision:{id:'vision',env:'NEXUS_LOCAL_VISION_URL',kind:'vision'},
 image:{id:'image',env:'NEXUS_LOCAL_IMAGE_URL',kind:'image'},
 video:{id:'video',env:'NEXUS_LOCAL_VIDEO_URL',kind:'video'},
 audio:{id:'audio',env:'NEXUS_LOCAL_AUDIO_URL',kind:'audio'},
 music:{id:'music',env:'NEXUS_LOCAL_MUSIC_URL',kind:'music'},
 files:{id:'files',env:'NEXUS_LOCAL_FILE_URL',kind:'files'},
 live:{id:'live',env:'NEXUS_LOCAL_LIVE_URL',kind:'live'}
});

export function listNativeEngines(){
 return Object.values(ENGINES).map(x=>({id:x.id,kind:x.kind,configured:Boolean(process.env[x.env]),urlConfigured:Boolean(process.env[x.env])}));
}
export function getNativeEngine(id){return ENGINES[id]||null;}
export function chooseNativeEngine({intent='',capability='text'}={}){
 const candidates=Object.values(ENGINES).filter(x=>x.kind===capability||x.id===capability);
 return candidates.find(x=>process.env[x.env])||candidates[0]||null;
}
export function buildNativeExecutionPlan({message='',capability='text'}={}){
 const engine=chooseNativeEngine({intent:message,capability});
 return{version:VERSION,mode:'local-first',engine:engine?.id||'text',configured:Boolean(engine&&process.env[engine.env]),externalFallbackOptional:true};
}
export function buildNativeCapabilityContract(){
 return{version:VERSION,localFirst:true,apiKeyRequired:false,engines:Object.keys(ENGINES),cloudFallback:'optional',note:'Un moteur natif doit être réellement configuré et disponible avant d’être déclaré opérationnel.'};
}
