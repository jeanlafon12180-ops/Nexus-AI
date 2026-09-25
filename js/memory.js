export const DEVICE_KEY='nexus_ia_profile_id_v11';
export const MEMORY_PREFIX='nexus_ia_memory_v11_';
export const CHAT_PREFIX='nexus_ia_conversation_v11_';

function read(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch{return fallback;}}
function createProfileId(){try{if(crypto.randomUUID)return crypto.randomUUID();}catch{}return 'profile-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);}
export function getDeviceId(){try{let id=localStorage.getItem(DEVICE_KEY);if(!id){id=createProfileId();localStorage.setItem(DEVICE_KEY,id);}return id;}catch{return 'session-profile';}}
const profileId=getDeviceId();
export const MEMORY_KEY=MEMORY_PREFIX+profileId;
export const CHAT_KEY=CHAT_PREFIX+profileId;
function migratePrivateLegacyData(){try{
  const oldId=localStorage.getItem('nexus_ia_device_id_v10')||localStorage.getItem('nexus_ia_device_id_v08')||localStorage.getItem('nexus_ia_device_id_v07');
  if(!oldId)return;
  const oldMemory='nexus_ia_memory_v10_'+oldId;
  const oldChat='nexus_ia_conversation_v10_'+oldId;
  if(!localStorage.getItem(MEMORY_KEY)){const value=localStorage.getItem(oldMemory);if(value)localStorage.setItem(MEMORY_KEY,value);}
  if(!localStorage.getItem(CHAT_KEY)){const value=localStorage.getItem(oldChat);if(value)localStorage.setItem(CHAT_KEY,value);}
}catch{}}
migratePrivateLegacyData();
export function createMemory(){return{prenom:'',ville:'',preferences:{},notes:[]};}
export function loadMemory(){const value=read(MEMORY_KEY,createMemory());return value&&typeof value==='object'?{...createMemory(),...value}:createMemory();}
export function saveMemory(memory){try{localStorage.setItem(MEMORY_KEY,JSON.stringify(memory));}catch{}}
export function loadConversation(){const value=read(CHAT_KEY,[]);return Array.isArray(value)?value:[];}
export function saveConversation(conversation){try{localStorage.setItem(CHAT_KEY,JSON.stringify(conversation.slice(-150)));}catch{}}
export function clearConversation(){try{localStorage.removeItem(CHAT_KEY);}catch{}}
export function clearMemory(){try{localStorage.removeItem(MEMORY_KEY);}catch{}}


export function buildMemoryContext(memory, history, message) {
  const source=memory&&typeof memory==='object'?memory:{};
  const notes=Array.isArray(source.notes)?source.notes:[];
  const query=String(message||'').toLowerCase();
  const tokens=new Set(query.split(/\W+/).filter(token=>token.length>2));
  const selected=notes.map((note,index)=>{const value=typeof note==='string'?note:JSON.stringify(note);const score=[...tokens].filter(token=>value.toLowerCase().includes(token)).length;return{index,value,score};}).sort((a,b)=>b.score-a.score||b.index-a.index).slice(0,18).map(item=>item.value);
  return {profile:{prenom:source.prenom||'',ville:source.ville||''},preferences:source.preferences||{},notes:selected,recentHistory:Array.isArray(history)?history.slice(-8):[]};
}

export function buildMemoryInstruction(){return 'MÉMOIRE AVANCÉE V3.5 : utilise uniquement les souvenirs fournis par l’application, privilégie ceux qui sont pertinents pour la demande actuelle, traite les préférences comme des indications et ne transforme jamais une supposition en souvenir certain. En cas de contradiction, privilégie l’information la plus récente ou demande une clarification.';}
