let installPrompt=null;
const installButtons=[...document.querySelectorAll("[data-pwa-install]")];
const shareButtons=[...document.querySelectorAll("[data-pwa-share]")];
const installed=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone===true||Boolean(window.Capacitor?.isNativePlatform?.());
const ios=()=>/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
function showInstallButtons(show){installButtons.forEach(button=>button.hidden=!show);}
function announce(message){let node=document.getElementById("pwaStatus");if(!node){node=document.createElement("div");node.id="pwaStatus";node.setAttribute("role","status");node.setAttribute("aria-live","polite");node.style.cssText="position:fixed;z-index:9999;left:50%;bottom:24px;transform:translateX(-50%);max-width:92vw;padding:12px 16px;border:1px solid #444;border-radius:12px;background:#171717;color:#fff;font:14px/1.5 system-ui,sans-serif";document.body.appendChild(node);}node.textContent=message;node.hidden=false;clearTimeout(node._timer);node._timer=setTimeout(()=>node.hidden=true,6000);}
async function install(){
 if(installPrompt){
  const prompt=installPrompt;installPrompt=null;
  try{
   await prompt.prompt();
   const result=await prompt.userChoice;
   showInstallButtons(result?.outcome!=="accepted");
   if(result?.outcome==="accepted")announce("Installation de Nexus IA lancée.");
  }catch{
   showInstallButtons(true);
   announce("Le navigateur n’a pas pu lancer l’installation. Utilise le menu du navigateur pour ajouter Nexus IA à l’écran d’accueil.");
  }
  return;
 }
 announce(ios()?"Sur iPhone ou iPad : dans Safari, touche Partager, puis « Sur l’écran d’accueil » et « Ajouter ».":"Dans le menu du navigateur, choisis « Installer Nexus IA » ou « Ajouter à l’écran d’accueil ».");
}
async function share(){const url=document.querySelector('link[rel="canonical"]')?.href||location.origin+"/";const data={title:"Nexus IA",text:"Découvre Nexus IA, un assistant IA en français disponible sur le Web et installable sur mobile.",url};if(navigator.share){try{await navigator.share(data);return;}catch(error){if(error?.name==="AbortError")return;}}try{await navigator.clipboard.writeText(url);announce("Lien Nexus IA copié. Partage-le sur YouTube, TikTok ou Instagram.");}catch{window.prompt("Copie le lien Nexus IA :",url);}}
if("serviceWorker" in navigator&&!window.Capacitor?.isNativePlatform?.())addEventListener("load",()=>navigator.serviceWorker.register("/sw.js",{scope:"/"}).catch(()=>{}));
if(!installed())showInstallButtons(true);
installButtons.forEach(button=>button.addEventListener("click",install));
shareButtons.forEach(button=>button.addEventListener("click",share));
addEventListener("beforeinstallprompt",event=>{event.preventDefault();installPrompt=event;showInstallButtons(true);});
addEventListener("appinstalled",()=>{installPrompt=null;showInstallButtons(false);announce("Nexus IA est installée sur cet appareil.");});
