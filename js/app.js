import { createBrain } from './brain.js';
import { loadConversation, saveConversation, clearConversation, clearMemory, createMemory, saveMemory } from './memory.js';

const brain=createBrain();
const chat=document.getElementById('chat');
const input=document.getElementById('messageInput');
const send=document.getElementById('sendButton');
let history=loadConversation();

function html(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')}
function show(text,type,persist=true){const row=document.createElement('div');row.className='message-row '+type;const b=document.createElement('div');b.className='bubble '+type;b.innerHTML=html(text);row.appendChild(b);chat.appendChild(row);if(persist){history.push({text,type,time:Date.now()});history=history.slice(-150);saveConversation(history)}chat.scrollTop=chat.scrollHeight}
function render(){chat.innerHTML='';if(!history.length){show('Bonjour ! 👋\n\nJe suis **Nexus IA V0.7**. Pose-moi une question !','nexus',false)}else history.forEach(x=>show(x.text,x.type,false))}
function splitQuestions(text){return text.replace(/\r/g,'\n').split(/\n/).map(x=>x.trim()).map(x=>x.replace(/^[-•*]\s+/,'').replace(/^\d+[.)]\s+/,'').trim()).filter(Boolean)}
async function sendText(text){if(send.disabled)return;const qs=splitQuestions(text);if(!qs.length)return;input.value='';input.style.height='auto';send.disabled=true;qs.forEach(q=>show(q,'user'));for(const q of qs){await new Promise(r=>setTimeout(r,120));show(brain.reply(q),'nexus')}send.disabled=false;input.focus()}
function memoryView(){const m=brain.getMemory(),a=[];if(m.prenom)a.push('Prénom : '+m.prenom);if(m.ville)a.push('Ville : '+m.ville);return a.length?'🧠 Je retiens :\n\n'+a.join('\n'):'🧠 Ma mémoire est encore vide.'}

document.querySelectorAll('.suggestion').forEach(b=>b.addEventListener('click',()=>sendText(b.textContent)));
send.addEventListener('click',()=>sendText(input.value));
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendText(input.value)}});
input.addEventListener('input',()=>{input.style.height='auto';input.style.height=Math.min(input.scrollHeight,220)+'px'});
document.getElementById('memoryButton').addEventListener('click',()=>show(memoryView(),'nexus'));
document.getElementById('helpButton').addEventListener('click',()=>show(brain.reply('Que peux-tu faire ?'),'nexus'));
document.getElementById('clearButton').addEventListener('click',()=>{history=[];clearConversation();render()});
document.getElementById('clearMemoryButton').addEventListener('click',()=>{clearMemory();saveMemory(createMemory());show('🧹 Ma mémoire locale a été effacée.','nexus')});
render();
