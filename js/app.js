import { createBrain } from './brain.js';
import { loadConversation, saveConversation, clearConversation, clearMemory, createMemory, saveMemory, getDeviceId } from './memory.js';

const brain=createBrain();
const chat=document.getElementById('chat');
const input=document.getElementById('messageInput');
const send=document.getElementById('sendButton');
const deviceId=getDeviceId();
let history=loadConversation();
const API_BASE=window.NEXUS_API_BASE||'';

function html(text){
  let safe=String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  safe=safe.replace(/```([a-z0-9_-]+)?\n([\s\S]*?)```/gi,(_,lang,code)=>`<pre class="code-block"><code>${code.trim()}</code><button class="copy-code" type="button">Copier</button></pre>`);
  return safe.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
}

function show(text,type,persist=true){
  const row=document.createElement('div'); row.className=`message-row ${type}`;
  const bubble=document.createElement('div'); bubble.className=`bubble ${type}`; bubble.innerHTML=html(text); row.appendChild(bubble); chat.appendChild(row);
  if(persist){history.push({text:String(text),type,time:Date.now()});history=history.slice(-150);saveConversation(history);}
  bubble.querySelectorAll('.copy-code').forEach(button=>button.addEventListener('click',async()=>{const code=button.parentElement.querySelector('code')?.textContent||'';try{await navigator.clipboard.writeText(code);button.textContent='Copié';setTimeout(()=>button.textContent='Copier',1200);}catch{button.textContent='Erreur';}}));
  chat.scrollTop=chat.scrollHeight;
}

function render(){
  chat.innerHTML='';
  if(!history.length){
    const empty=document.createElement('div'); empty.className='empty-state';
    empty.innerHTML='<div class="empty-logo">N</div><h2>Que puis-je faire pour toi ?</h2><p>Je peux discuter, expliquer, écrire du code et lancer une vraie génération d’image quand le backend est configuré.</p><div class="quick-grid"><button class="quick-card suggestion">Explique-moi le théorème de Pythagore</button><button class="quick-card suggestion">Écris-moi un site HTML simple</button><button class="quick-card suggestion">12 × 8 + 5</button><button class="quick-card suggestion">Crée une image d’un chat réaliste</button></div>';
    chat.appendChild(empty);
  }else history.forEach(item=>{if(item&&typeof item.text==='string'&&(item.type==='user'||item.type==='nexus'))show(item.text,item.type,false);});
  bindSuggestions();
}

function bindSuggestions(){document.querySelectorAll('.suggestion').forEach(button=>button.addEventListener('click',()=>sendText(button.textContent)));}
function splitQuestions(text){return String(text).replace(/\r/g,'').split(/\n/).map(x=>x.trim()).map(x=>x.replace(/^[-•*]\s+/,'').replace(/^\d+[.)]\s+/,'').trim()).filter(Boolean);}
function setBusy(value){send.disabled=value;input.disabled=value;}
function isImagePrompt(text){return /\b(cr[ée]e|g[ée]n[èe]re|dessine|fais|produis)\b.*\bimage\b/i.test(text)||/\bimage d(?:e|u|es|un|une)\b/i.test(text);}

function showImageLoading(prompt){
  const row=document.createElement('div'); row.className='message-row nexus image-row';
  const bubble=document.createElement('div'); bubble.className='bubble nexus image-card loading-image';
  bubble.innerHTML='<div class="image-title">🎨 Génération d’image</div><div class="image-spinner" aria-hidden="true"></div><div class="image-status">Prompt reçu. Création de l’image…</div><div class="image-prompt"></div>';
  bubble.querySelector('.image-prompt').textContent=prompt;
  row.appendChild(bubble); chat.appendChild(row); chat.scrollTop=chat.scrollHeight; return row;
}

function showImageResult(prompt,data){
  const row=document.createElement('div'); row.className='message-row nexus image-row';
  const bubble=document.createElement('div'); bubble.className='bubble nexus image-card';
  const title=document.createElement('div'); title.className='image-title'; title.textContent='🖼️ Image prête';
  const image=document.createElement('img'); image.className='generated-image'; image.alt=prompt; image.loading='lazy'; image.src=data.url?data.url:`data:image/png;base64,${data.b64_json}`;
  const caption=document.createElement('div'); caption.className='image-prompt'; caption.textContent=`Prompt : ${prompt}`;
  bubble.append(title,image,caption); row.appendChild(bubble); chat.appendChild(row); chat.scrollTop=chat.scrollHeight;
}

async function generateImage(prompt){
  const loading=showImageLoading(prompt);
  try{
    const response=await fetch(`${API_BASE}/api/generate-image`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});
    const data=await response.json().catch(()=>({})); loading.remove();
    if(!response.ok)throw new Error(data.error||'Le moteur d’image n’est pas disponible.');
    showImageResult(prompt,data);
  }catch(error){loading.remove();show(`🎨 **Génération d’image**\n\n⚠️ ${error.message||'Erreur pendant la génération.'}\n\nLe code attend maintenant un backend sécurisé à l’adresse **/api/generate-image**.`,'nexus');}
}

async function sendText(text){
  if(send.disabled)return; const questions=splitQuestions(text); if(!questions.length)return;
  input.value=''; input.style.height='auto'; setBusy(true);
  try{
    questions.forEach(q=>show(q,'user'));
    for(const q of questions){
      if(isImagePrompt(q)){await generateImage(q.replace(/^(cr[ée]e|g[ée]n[èe]re|dessine|fais|produis)\s+/i,'').trim()||q);continue;}
      await new Promise(r=>setTimeout(r,120)); show(brain.reply(q),'nexus');
    }
  }catch(error){console.error('Nexus IA error:',error);show('⚠️ Une erreur est survenue. Recharge la page puis réessaie.','nexus');}
  finally{setBusy(false);input.focus();}
}

function memoryView(){const memory=brain.getMemory();const items=[];if(memory.prenom)items.push(`Prénom : ${memory.prenom}`);if(memory.ville)items.push(`Ville : ${memory.ville}`);if(memory.preferences)Object.entries(memory.preferences).forEach(([k,v])=>items.push(`${k.replaceAll('_',' ')} : ${v}`));return items.length?`🧠 **Mémoire de cet appareil**\n\n${items.join('\n')}\n\n🖥️ Appareil : ${deviceId.slice(0,8)}`:`🧠 **Mémoire de cet appareil**\n\nMa mémoire est encore vide.\n\n🖥️ Appareil : ${deviceId.slice(0,8)}`;}

document.getElementById('memoryButton')?.addEventListener('click',()=>show(memoryView(),'nexus'));
document.getElementById('helpButton')?.addEventListener('click',()=>show(brain.reply('Que peux-tu faire ?'),'nexus'));
document.getElementById('clearMemoryButton')?.addEventListener('click',()=>{clearMemory();saveMemory(createMemory());show('🧹 La mémoire de **cet appareil** a été effacée.','nexus');});
document.getElementById('newChatButton')?.addEventListener('click',()=>{history=[];clearConversation();render();input.focus();});
document.getElementById('imageButton')?.addEventListener('click',()=>{input.value='Crée une image de ';input.focus();});
document.getElementById('composerImageButton')?.addEventListener('click',()=>{input.value='Crée une image de ';input.focus();});
send.addEventListener('click',()=>sendText(input.value));
input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendText(input.value);}});
input.addEventListener('input',()=>{input.style.height='auto';input.style.height=`${Math.min(input.scrollHeight,200)}px`;});
window.addEventListener('error',event=>console.error('Nexus IA runtime error:',event.error||event.message));
render();
