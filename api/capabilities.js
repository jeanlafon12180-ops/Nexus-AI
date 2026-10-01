import { getNativeCapabilityStatus, listNativeEngines } from '../lib/nexus-native-engine.js';
import { getGatewayStatus, getGatewayMode } from '../lib/nexus-model-gateway.js';

export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Méthode non autorisée.'});
 const native=listNativeEngines();
 const status=getNativeCapabilityStatus();
 return res.status(200).json({
  ok:true,
  version:'5.2.6',
  product:'Nexus IA',
  architecture:'Nexus Core → Nexusia Cognitive Engine → capability router → native engine',
  localFirst:true,
  apiKeyRequired:false,
  capabilities:{
   text:{available:Boolean(status.text),description:'conversation, raisonnement et rédaction'},
   code:{available:Boolean(status.code),description:'génération, correction et analyse de code'},
   vision:{available:Boolean(status.vision),description:'analyse d’images'},
   image:{available:Boolean(status.image),description:'génération et édition d’images'},
   video:{available:Boolean(status.video),description:'génération vidéo'},
   music:{available:Boolean(status.music),description:'génération musicale'},
   audio:{available:Boolean(status.audio),description:'audio et voix'},
   files:{available:Boolean(status.files),description:'prise en charge de fichiers et documents'},
   live:{available:Boolean(status.live),description:'flux temps réel / live'}
  },
  engines:native,
  gateway:getGatewayStatus(),
  mode:getGatewayMode()
 });
}
