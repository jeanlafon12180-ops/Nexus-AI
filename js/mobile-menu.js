const drawer=document.getElementById('mobileDrawer');
const backdrop=document.getElementById('mobileDrawerBackdrop');
const openButton=document.getElementById('mobileMenuButton');
const closeButton=document.getElementById('closeMobileMenu');
function setMobileMenu(open){
 if(!drawer||!backdrop)return;
 drawer.classList.toggle('open',open);
 drawer.setAttribute('aria-hidden',String(!open));
 backdrop.hidden=!open;
 document.body.classList.toggle('mobile-menu-open',open);
}
openButton?.addEventListener('click',()=>setMobileMenu(true));
closeButton?.addEventListener('click',()=>setMobileMenu(false));
backdrop?.addEventListener('click',()=>setMobileMenu(false));
document.addEventListener('keydown',event=>{if(event.key==='Escape')setMobileMenu(false);});
document.getElementById('mobileNewChatButton')?.addEventListener('click',()=>{
 document.getElementById('newChatButton')?.click();
 setMobileMenu(false);
});
document.querySelectorAll('.mobile-tool').forEach(button=>{
 button.addEventListener('click',()=>{
  const action=button.dataset.action;
  if(action==='memory')document.getElementById('memoryButton')?.click();
  if(action==='help')document.getElementById('helpButton')?.click();
  if(action==='clear-memory')document.getElementById('clearMemoryButton')?.click();
  setMobileMenu(false);
 });
});