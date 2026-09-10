export const DEVICE_KEY='nexus_ia_device_id_v10';
export const MEMORY_PREFIX='nexus_ia_memory_v10_';
export const CHAT_PREFIX='nexus_ia_conversation_v10_';

function read(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch{return fallback;}}
function createDeviceId(){try{if(crypto.randomUUID)return crypto.randomUUID();}catch{}return 'device-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);}
export function getDeviceId(){try{let id=localStorage.getItem(DEVICE_KEY);if(!id){const oldId=localStorage.getItem('nexus_ia_device_id_v08')||localStorage.getItem('nexus_ia_device_id_v07');id=oldId||createDeviceId();localStorage.setItem(DEVICE_KEY,id);}return id;}catch{return 'session-device';}}
const deviceId=getDeviceId();
export const MEMORY_KEY=MEMORY_PREFIX+deviceId;
export const CHAT_KEY=CHAT_PREFIX+deviceId;
const LEGACY_MEMORY_KEYS=['nexus_ia_memory_v08_'+deviceId,'nexus_ia_memory_v07_'+deviceId,'nexus_ia_memory_v07'];
const LEGACY_CHAT_KEYS=['nexus_ia_conversation_v08_'+deviceId,'nexus_ia_conversation_v07_'+deviceId,'nexus_ia_conversation_v07'];
function migrateLegacyData(){try{if(!localStorage.getItem(MEMORY_KEY)){for(const key of LEGACY_MEMORY_KEYS){const value=localStorage.getItem(key);if(value){localStorage.setItem(MEMORY_KEY,value);break;}}}if(!localStorage.getItem(CHAT_KEY)){for(const key of LEGACY_CHAT_KEYS){const value=localStorage.getItem(key);if(value){localStorage.setItem(CHAT_KEY,value);break;}}}}catch{}}
migrateLegacyData();
export function createMemory(){return{prenom:'',ville:'',preferences:{},notes:[]};}
export function loadMemory(){const value=read(MEMORY_KEY,createMemory());return value&&typeof value==='object'?{...createMemory(),...value}:createMemory();}
export function saveMemory(memory){try{localStorage.setItem(MEMORY_KEY,JSON.stringify(memory));}catch{}}
export function loadConversation(){const value=read(CHAT_KEY,[]);return Array.isArray(value)?value:[];}
export function saveConversation(conversation){try{localStorage.setItem(CHAT_KEY,JSON.stringify(conversation.slice(-150)));}catch{}}
export function clearConversation(){try{localStorage.removeItem(CHAT_KEY);}catch{}}
export function clearMemory(){try{localStorage.removeItem(MEMORY_KEY);}catch{}}
