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
