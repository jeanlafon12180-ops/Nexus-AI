const ENVS=Object.freeze({
 image:'NEXUS_LOCAL_IMAGE_URL',
 video:'NEXUS_LOCAL_VIDEO_URL',
 music:'NEXUS_LOCAL_MUSIC_URL',
 audio:'NEXUS_LOCAL_AUDIO_URL',
 live:'NEXUS_LOCAL_LIVE_URL',
 vision:'NEXUS_LOCAL_VISION_URL',
 files:'NEXUS_LOCAL_FILE_URL'
});

function cleanCapability(value=''){return String(value).toLowerCase().trim().replace('vidéo','video').replace('musique','music');}

export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Méthode non autorisée.'});
 try{
  const body=req.body&&typeof req.body==='object'?req.body:{};
  const capability=cleanCapability(body.capability);
  const env=ENVS[capability];
  if(!env)return res.status(400).json({error:'Capacité non prise en charge.',capabilities:Object.keys(ENVS)});
  const url=process.env[env];
  if(!url)return res.status(503).json({
   error:'Moteur natif non configuré pour cette capacité.',
   capability,
   environmentVariable:env,
   apiKeyRequired:false,
   hint:'Configure un moteur local compatible puis redéploie Nexus IA.'
  });
  const payload=body.payload&&typeof body.payload==='object'?body.payload:{prompt:body.prompt||'',input:body.input||null};
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),capability==='live'?120000:60000);
  try{
   const upstream=await fetch(url,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({capability,payload}),
    signal:controller.signal
   });
   const raw=await upstream.text();
   let data;try{data=JSON.parse(raw);}catch{data={output:raw};}
   if(!upstream.ok)return res.status(upstream.status).json({error:data?.error||'Moteur natif indisponible.',capability});
   return res.status(200).json({ok:true,version:'4.2.1',capability,local:true,data});
  }finally{clearTimeout(timeout);}
 }catch(error){
  return res.status(502).json({error:error?.name==='AbortError'?'Le moteur natif a dépassé le délai.':error?.message||'Erreur du moteur natif.',capability:cleanCapability(req.body?.capability)});
 }
}
