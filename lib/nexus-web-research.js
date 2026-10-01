const VERSION='5.3.0';

const TRUSTED_HOSTS=[
 ['gouv.fr',95,'institution officielle française'],
 ['service-public.fr',95,'service public français'],
 ['vie-publique.fr',92,'information publique française'],
 ['europa.eu',94,'institution européenne'],
 ['who.int',94,'organisation internationale de santé'],
 ['un.org',94,'organisation internationale'],
 ['oecd.org',92,'organisation internationale'],
 ['insee.fr',95,'statistiques officielles françaises'],
 ['cnil.fr',95,'autorité française'],
 ['anssi.gouv.fr',95,'cybersécurité officielle française'],
 ['developer.mozilla.org',94,'documentation technique de référence'],
 ['nodejs.org',96,'documentation officielle Node.js'],
 ['github.com',82,'plateforme de développement'],
 ['docs.github.com',94,'documentation officielle GitHub'],
 ['vercel.com',90,'documentation éditeur'],
 ['render.com',90,'documentation éditeur'],
 ['openai.com',94,'site officiel éditeur'],
 ['arxiv.org',82,'archive de recherche scientifique'],
 ['wikipedia.org',72,'encyclopédie secondaire']
];

function hostOf(url=''){try{return new URL(url).hostname.replace(/^www\./,'').toLowerCase()}catch{return''}}
function trust(url=''){
 const host=hostOf(url);
 const exact=TRUSTED_HOSTS.find(([domain])=>host===domain);
 const suffix=TRUSTED_HOSTS.find(([domain])=>host.endsWith('.'+domain));
 if(exact)return{score:exact[1],label:exact[2]};
 if(suffix)return{score:suffix[1],label:suffix[2]};
 if(/\.edu$|\.ac\./i.test(host))return{score:78,label:'domaine académique'};
 if(/\.gov$|\.gouv\./i.test(host))return{score:88,label:'domaine institutionnel'};
 if(/\.(org|net)$/i.test(host))return{score:55,label:'source secondaire'};
 return{score:45,label:'source Web générale'};
}
function cleanHtml(value=''){return String(value).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'\"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\\s+/g,' ').trim()}
function decode(value=''){return value.replace(/&#x([0-9a-f]+);/gi,(_,h)=>String.fromCodePoint(parseInt(h,16))).replace(/&#([0-9]+);/g,(_,n)=>String.fromCodePoint(Number(n)))}
function parseResults(html=''){
 const results=[],re=/<a[^>]+class=["'][^"']*result__a[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
 let match;
 while((match=re.exec(html))&&results.length<12){
  const href=decode(match[1]),title=cleanHtml(match[2]); if(!href||!title)continue;
  const url=href.startsWith('//')?'https:'+href:href;
  const absolute=url.startsWith('http')?url:'';
  if(!absolute)continue;
  const t=trust(absolute); results.push({title,url:absolute,trustScore:t.score,trustLabel:t.label});
 }
 return results;
}
function needsWeb(message=''){
 const text=String(message).toLowerCase();
 return /\b(aujourd'hui|aujourd’hui|actuel|actuelle|actuellement|dernier|dernière|derniere|latest|récent|recente|récentes|cette semaine|en ce moment|maintenant|prix|météo|meteo|actualité|actualités|news|2026|vérifie|verifie|source|sources|sur internet|internet|recherche|cherche|qui est le président|résultat|résultats)\b/i.test(text)
   || /\b(quelle est|quel est|combien|où en est|qu'est-ce qui s'est passé)\b/i.test(text)&&/\b(aujourd|actuel|récent|maintenant|2026|prix|résultat|internet)\b/i.test(text);
}
async function searchOne(query){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),7000);
 try{
  const url='https://html.duckduckgo.com/html/?q='+encodeURIComponent(query);
  const response=await fetch(url,{headers:{'User-Agent':'Nexus-IA/5.3.0'},signal:controller.signal});
  if(!response.ok)throw Object.assign(new Error('Moteur Web indisponible.'),{status:502});
  return parseResults(await response.text());
 }finally{clearTimeout(timer);}
}
export async function researchWeb({query='',maxResults=6}={}){
 const q=String(query).trim().slice(0,500); if(!q)return{version:VERSION,queried:false,results:[],sources:[],verified:false};
 const results=await searchOne(q);
 const sorted=[...new Map(results.map(r=>[r.url,r])).values()].sort((a,b)=>b.trustScore-a.trustScore).slice(0,Math.max(1,Math.min(8,maxResults)));
 const trusted=sorted.filter(r=>r.trustScore>=80);
 return{version:VERSION,queried:true,query:q,results:sorted,sources:sorted.map(r=>({title:r.title,url:r.url,trustScore:r.trustScore,trustLabel:r.trustLabel})),trustedCount:trusted.length,verified:trusted.length>=2,policy:'priorité aux sources officielles, institutionnelles, académiques et documentations éditeur; les sources secondaires restent explicitement signalées'};
}
export function buildWebResearchPrompt(research){
 if(!research?.queried||!research.results?.length)return'';
 return['NEXUS WEB RESEARCH 5.3.0 :','Recherche effectuée sur Internet. Utilise les sources ci-dessous comme preuves externes, distingue les faits des interprétations et ne cite jamais une source que tu n’as pas reçue.',...research.results.map((r,i)=>`${i+1}. ${r.title} — ${r.url} — fiabilité indicative ${r.trustScore}/100 (${r.trustLabel})`),'Si les sources fiables se contredisent, signale la contradiction. Si aucune source suffisamment fiable ne permet de conclure, dis-le clairement.'].join('\n');
}
export function getWebResearchStatus(){return{version:VERSION,search:true,sourceRanking:true,trustScoring:true,multiSourceCheck:true,noApiKeyProvider:'duckduckgo-html',requiresInternet:true};}
