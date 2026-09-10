import { loadMemory, saveMemory } from './memory.js';
import { findKnowledge, knowledgeCount } from './knowledge.js';

export const norm = text => String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,' ').replace(/[^a-z0-9+\-*/().%\s?]/g,' ').replace(/\s+/g,' ').trim();

const dist = (a,b) => { const row=Array.from({length:b.length+1},(_,i)=>i); for(let i=1;i<=a.length;i++){ let previous=row[0]; row[0]=i; for(let j=1;j<=b.length;j++){ const current=row[j]; row[j]=Math.min(row[j]+1,row[j-1]+1,previous+(a[i-1]===b[j-1]?0:1)); previous=current; } } return row[b.length]; };
const similar = (a,b) => a===b || (a.length>=3 && dist(a,b)<= (b.length<=5?1:2));
const phrase = (text,target) => { const a=norm(text).split(' ').filter(Boolean), b=norm(target).split(' ').filter(Boolean); if(a.length<b.length)return false; for(let i=0;i<=a.length-b.length;i++){let ok=true;for(let j=0;j<b.length;j++){if(!similar(a[i+j],b[j])){ok=false;break;}}if(ok)return true;}return false; };
const intent = (text,list) => list.some(item=>text.includes(item)||phrase(text,item));

const nums={zero:0,un:1,une:1,deux:2,trois:3,quatre:4,cinq:5,six:6,sept:7,huit:8,neuf:9,dix:10,onze:11,douze:12,treize:13,quatorze:14,quinze:15,seize:16,vingt:20,trente:30,quarante:40,cinquante:50,soixante:60,cent:100};
function words(text){return norm(text).split(' ').filter(Boolean).map(w=>Object.hasOwn(nums,w)?String(nums[w]):w).join(' ');}
function calc(text){let e=words(text).replace(/divise(?:e|es)?\s+par/g,'/').replace(/multiplie(?:e|es)?\s+par/g,'*').replace(/fois/g,'*').replace(/plus/g,'+').replace(/moins/g,'-').replace(/\bx\b/g,'*');if(!/^[0-9+\-*/().%\s]+$/.test(e))return null;const t=e.match(/\d+(?:\.\d+)?|[()+\-*/%]/g)||[];if(t.join('')!==e.replace(/\s+/g,''))return null;let p=0;const primary=()=>{const x=t[p++];if(x==='('){const v=expr();if(t[p++]!==')')throw Error();return v;}if(x==null||Number.isNaN(Number(x)))throw Error();return Number(x);};const factor=()=>{if(t[p]==='-'){p++;return-factor();}if(t[p]==='+'){p++;return factor();}return primary();};const term=()=>{let v=factor();while(['*','/','%'].includes(t[p])){const o=t[p++],r=factor();if(o==='*')v*=r;else if(o==='/'){if(r===0)throw Error();v/=r;}else v%=r;}return v;};function expr(){let v=term();while(['+','-'].includes(t[p])){const o=t[p++],r=term();v=o==='+'?v+r:v-r;}return v;}try{const r=expr();return p===t.length&&Number.isFinite(r)?Math.round(r*1e12)/1e12:null;}catch{return null;}}

const memoryText=m=>{const a=[];if(m.prenom)a.push(`Prénom : ${m.prenom}`);if(m.ville)a.push(`Ville : ${m.ville}`);if(m.preferences)Object.entries(m.preferences).forEach(([k,v])=>a.push(`${k.replaceAll('_',' ')} : ${v}`));return a.length?`🧠 Je retiens :\n\n${a.join('\n')}`:'🧠 Ma mémoire est encore vide.';};
const cap=t=>t?t.charAt(0).toUpperCase()+t.slice(1):t;

function learn(raw,memory){const text=norm(raw);let m=text.match(/^je m appelle (.+)$/)||text.match(/^mon prenom est (.+)$/)||text.match(/^moi c est (.+)$/);if(m){memory.prenom=cap(m[1].trim().split(' ')[0]);saveMemory(memory);return `Enchanté ${memory.prenom} ! 👋 Je m’en souviendrai.`;}m=text.match(/^j habite a (.+)$/)||text.match(/^ma ville est (.+)$/)||text.match(/^je vis a (.+)$/);if(m){memory.ville=cap(m[1].trim());saveMemory(memory);return `D’accord ! 🏠 Je retiens que tu habites à ${memory.ville}.`;}m=text.match(/^j aime (.+)$/)||text.match(/^j adore (.+)$/)||text.match(/^je prefere (.+)$/);if(m){memory.preferences=memory.preferences||{};memory.preferences.derniere_preference=m[1].trim();saveMemory(memory);return `Compris ! ❤️ Je retiens que tu aimes ${m[1].trim()}.`;}return null;}

function contextText(context){return context.slice(-6).filter(x=>x&&x.text).map(x=>x.text).join(' ');}
function contextualKnowledge(text,context){const direct=findKnowledge(text);if(direct)return direct;if(!context.length||!/^(et|mais|donc|du coup|pourquoi|comment|et pour|et concernant)\b/.test(text))return null;return findKnowledge(`${contextText(context)} ${text}`);}

function extractTopic(context){const users=context.filter(x=>x.role==='user').map(x=>x.text).slice(-4);return users.length?users[users.length-1]:'';}

function generateCode(raw){const text=norm(raw);const wantsCode=intent(text,['ecris du code','ecrit du code','genere du code','crée du code','cree du code','code moi','fais moi un code','programme moi','developpe un code','développe un code']);if(!wantsCode)return null;
  if(intent(text,['html','site','page web','site internet']))return "```html\n<!doctype html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Mon site</title>\n  <style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#111;color:#fff;font-family:system-ui,sans-serif}main{max-width:720px;padding:40px;text-align:center}button{padding:12px 18px;border:0;border-radius:10px;cursor:pointer}</style>\n</head>\n<body><main><h1>Mon site</h1><p>Bienvenue sur mon site.</p><button onclick=\"alert('Bonjour !')\">Tester</button></main></body>\n</html>\n```\n\nJe peux ensuite adapter le HTML au style et au contenu demandés. 💻";
  if(intent(text,['python']))return "```python\ndef main():\n    print('Bonjour depuis Nexus IA !')\n\nif __name__ == '__main__':\n    main()\n```\n\nTu peux me donner l’objectif exact et je peux structurer le programme en plusieurs fonctions. 🐍";
  if(intent(text,['javascript','js']))return "```javascript\nfunction bonjour(nom) {\n  return `Bonjour ${nom} !`;\n}\n\nconsole.log(bonjour('Nexus'));\n```\n\nDécris ensuite la fonctionnalité à ajouter. ⚙️";
  return "Je peux générer du code, mais j’ai besoin du langage ou du type de projet. Exemple : « écris-moi un site HTML avec une page d’accueil » ou « crée un script Python qui trie une liste ». 💻";
}

function imageRequest(raw){const t=norm(raw);return intent(t,['genere une image','genere moi une image','crée une image','cree une image','dessine moi','fais moi une image','image d un','cree moi une image']);}

function explainAnswer(text){if(intent(text,['bonjour','salut','hello','coucou','bonsoir']))return null;if(intent(text,['pourquoi']))return 'Pour répondre correctement à « pourquoi », j’ai besoin de savoir ce que tu veux expliquer. Donne-moi la phrase ou le phénomène précis. 🧠';if(intent(text,['c est quoi','c quoi','que signifie','ca veut dire quoi']))return 'Je peux expliquer le terme. Écris simplement le mot ou l’idée complète à définir. 📚';return null;}

export function createBrain(){const state={memory:loadMemory(),context:[]};const reply=raw=>{const original=String(raw);const learned=learn(original,state.memory);if(learned){state.context.push({role:'user',text:original},{role:'nexus',text:learned});state.context=state.context.slice(-16);return learned;}
  const text=norm(original);let answer=null;
  if(imageRequest(original)) answer='__IMAGE_REQUEST__';
  else if(generateCode(original)) answer=generateCode(original);
  else if(intent(text,['aide','que peux tu faire','que sais tu faire','tu peux faire quoi'])) answer=`🤖 Nexus IA V1.0\n\nJe peux tenir une conversation, mémoriser certaines informations, comprendre des formulations proches, utiliser un contexte récent, calculer, consulter ma base de connaissances et générer des exemples de code.\n\n🎨 Mode image : interface prête, génération réelle à connecter à un service d’image sécurisé.\n📚 Base de connaissances : ${knowledgeCount} notions.\n🧠 Mémoire : prénom, ville et préférences sur cet appareil.`;
  else if(intent(text,['bonjour','salut','hello','coucou','yo','bonsoir']))answer=state.memory.prenom?`Bonjour ${state.memory.prenom} ! 👋`:'Bonjour ! 👋';
  else if(intent(text,['qui suis je','quel est mon prenom','comment je m appelle']))answer=state.memory.prenom?`Tu es ${state.memory.prenom}. 🧠`:'Je ne connais pas encore ton prénom. 🧠';
  else if(intent(text,['qui es tu','presente toi','tu es quoi','qui est nexus']))answer='Je suis Nexus IA V1.0 🤖, un assistant Web en développement.';
  else if(intent(text,['quelle heure','il est quelle heure','donne moi l heure']))answer=`Il est ${new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit'}).format(new Date())} ⏰`;
  else if(intent(text,['quelle date','quel jour','date du jour']))answer=`Nous sommes ${new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date())}. 📅`;
  else if(intent(text,['memoire','montre ma memoire','que sais tu sur moi']))answer=memoryText(state.memory);
  else if(intent(text,['merci','merci beaucoup','thanks']))answer='Avec plaisir ! 😄';
  else if(intent(text,['au revoir','aurevoir','bye','quitter']))answer='À bientôt ! 🚀';
  else {const k=contextualKnowledge(text,state.context);if(k)answer=k;else {const c=explainAnswer(text);if(c)answer=c;else {const r=calc(text);if(r!==null&&/\d/.test(text))answer=`Le résultat est **${r}**. 🧮`;else if(imageRequest(original))answer='__IMAGE_REQUEST__';else answer='Je n’ai pas encore assez de connaissances pour répondre correctement. Reformule ta demande ou donne-moi plus de contexte. 🧠';}}}
  state.context.push({role:'user',text:original},{role:'nexus',text:answer});state.context=state.context.slice(-16);return answer;};return {reply,getMemory:()=>state.memory,getContext:()=>state.context};}
