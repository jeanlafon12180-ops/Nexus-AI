import { createBrain } from './brain.js';
import { loadConversation, saveConversation, clearConversation, clearMemory, createMemory, saveMemory, getDeviceId } from './memory.js';

const brain=createBrain();
const chat=document.getElementById('chat');
const input=document.getElementById('messageInput');
const send=document.getElementById('sendButton');
const deviceId=getDeviceId();
let history=loadConversation();

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
    empty.innerHTML='<div class="empty-logo">N</div><h2>Que puis-je faire pour toi ?</h2><p>Je peux discuter, mémoriser certaines informations, calculer, expliquer des notions et générer du code.</p><div class="quick-grid"><button class="quick-card suggestion">Explique-moi le théorème de Pythagore</button><button class="quick-card suggestion">Écris-moi un site HTML simple</button><button class="quick-card suggestion">Crée une image d’un chat réaliste</button><button class="quick-card suggestion">Que sais-tu faire ?</button></div>';
    chat.appendChild(empty);
  }else history.forEach(item=>{if(item&&typeof item.text==='string'&&(item.type==='user'||item.type==='nexus'))show(item.text,item.type,false);});
  bindSuggestions();
}

function bindSuggestions(){document.querySelectorAll('.suggestion').forEach(button=>button.addEventListener('click',()=>sendText(button.textContent)));}
function splitQuestions(text){return String(text).replace(/\r/g,'').split(/\n/).map(x=>x.trim()).map(x=>x.replace(/^[-•*]\s+/,'').replace(/^\d+[.)]\s+/,'').trim()).filter(Boolean);}
function setBusy(value){send.disabled=value;input.disabled=value;}
function isImagePrompt(text){return /\b(cr[ée]e|g[ée]n[èe]re|dessine|fais|produis|fabrique)\b.*\bimage\b/i.test(text)||/\bimage d(?:e|u|des|un|une)\b/i.test(text);}

function showImageLoading(prompt){
  const row=document.createElement('div'); row.className='message-row nexus';
  const bubble=document.createElement('div'); bubble.className='bubble nexus image-card';
  bubble.innerHTML='<strong>🎨 Génération d’image</strong><p>Prompt reçu :</p><div class="image-prompt"></div><div class="image-loading"><span></span><span></span><span></span> Génération en cours…</div>';
  bubble.querySelector('.image-prompt').textContent=prompt;
  chat.appendChild(row); row.appendChild(bubble); chat.scrollTop=chat.scrollHeight;
  return bubble;
}

function showGeneratedImage(bubble,data,prompt){
  const loading=bubble.querySelector('.image-loading');
  if(loading)loading.remove();
  if(data?.url){
    const img=document.createElement('img'); img.className='generated-image'; img.src=data.url; img.alt=prompt; img.loading='lazy';
    bubble.appendChild(img);
  }else if(data?.b64_json){
    const img=document.createElement('img'); img.className='generated-image'; img.src=`data:image/png;base64,${data.b64_json}`; img.alt=prompt;
    bubble.appendChild(img);
  }
  const done=document.createElement('p'); done.className='image-status'; done.textContent='✅ Image générée.'; bubble.appendChild(done);
  history.push({text:`[Image générée] ${prompt}`,type:'nexus',time:Date.now()}); history=history.slice(-150); saveConversation(history);
  chat.scrollTop=chat.scrollHeight;
}

async function generateImage(prompt,bubble){
  try{
    const response=await fetch('/api/generate-image',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,model:'flux'})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data?.error||'Le moteur d’image est indisponible.');
    showGeneratedImage(bubble,data,prompt);
  }catch(error){
    const loading=bubble.querySelector('.image-loading'); if(loading)loading.remove();
    const errorBox=document.createElement('p'); errorBox.className='image-error'; errorBox.textContent=`⚠️ ${error.message}`; bubble.appendChild(errorBox);
  }
}

async function sendText(text){
  if(send.disabled)return; const questions=splitQuestions(text); if(!questions.length)return;
  input.value=''; input.style.height='auto'; setBusy(true);
  try{
    questions.forEach(q=>show(q,'user'));
    for(const q of questions){
      await new Promise(r=>setTimeout(r,120));
      if(isImagePrompt(q)){
        const bubble=showImageLoading(q);
        await generateImage(q,bubble);
      }else{
        show(brain.reply(q),'nexus');
      }
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
