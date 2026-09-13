(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let live = false;
  let listening = false;
  let speaking = false;
  let recognition = null;
  let stream = null;
  let audioContext = null;
  let analyser = null;
  let animation = null;
  let currentTranscript = '';
  let silenceTimer = null;
  let busy = false;

  const chat = () => document.getElementById('chat');
  const scrollChat = () => { const c = chat(); if (c) c.scrollTop = c.scrollHeight; };
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  function addMessage(text, type) {
    const c = chat(); if (!c) return;
    const row = document.createElement('div'); row.className = `message-row ${type}`;
    const bubble = document.createElement('div'); bubble.className = `bubble ${type}`;
    bubble.innerHTML = esc(text).replace(/\n/g,'<br>');
    row.appendChild(bubble); c.appendChild(row); scrollChat();
  }

  function ensureUI() {
    if (document.getElementById('liveButton')) return;
    const composer = document.querySelector('.composer');
    const send = document.getElementById('sendButton');
    if (!composer || !send) return;
    const btn = document.createElement('button');
    btn.id = 'liveButton'; btn.type = 'button'; btn.className = 'live-button';
    btn.textContent = '🔴'; btn.title = 'Démarrer le mode LIVE'; btn.setAttribute('aria-label','Démarrer le mode LIVE');
    btn.addEventListener('click', () => live ? stopLive() : startLive());
    composer.insertBefore(btn, send);

    const bar = document.createElement('div'); bar.id = 'liveBar'; bar.className = 'live-bar'; bar.hidden = true;
    bar.innerHTML = '<div class="live-status"><span class="live-dot"></span><strong id="liveStatusText">LIVE</strong></div><canvas id="liveTrail" width="520" height="54"></canvas><button id="liveStop" type="button">⏹ Arrêter</button>';
    const area = document.querySelector('.composer-area');
    area.insertBefore(bar, composer);
    document.getElementById('liveStop').addEventListener('click', stopLive);
  }

  function setStatus(text, mode='listen') {
    const label = document.getElementById('liveStatusText');
    const bar = document.getElementById('liveBar');
    if (label) label.textContent = text;
    if (bar) bar.dataset.mode = mode;
  }

  function drawTrail() {
    if (!analyser) return;
    const canvas = document.getElementById('liveTrail'); if (!canvas) return;
    const ctx = canvas.getContext('2d'); const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const t = performance.now() / 1000;
    const mid = canvas.height / 2;
    ctx.lineWidth = 3; ctx.lineCap = 'round';
    const gradient = ctx.createLinearGradient(0,0,canvas.width,0);
    gradient.addColorStop(0,'#ff2d55'); gradient.addColorStop(.2,'#ffcc00'); gradient.addColorStop(.4,'#34c759'); gradient.addColorStop(.6,'#00c7ff'); gradient.addColorStop(.8,'#5856d6'); gradient.addColorStop(1,'#ff2d55');
    ctx.strokeStyle = gradient; ctx.beginPath();
    const step = canvas.width / 70;
    for (let i=0;i<70;i++) {
      const amp = (data[i % data.length] / 255) * 22;
      const y = mid + Math.sin(i*.32 + t*5) * 4 + Math.sin(i*.11+t*2) * amp;
      if (i===0) ctx.moveTo(i*step,y); else ctx.lineTo(i*step,y);
    }
    ctx.stroke();
    animation = requestAnimationFrame(drawTrail);
  }

  async function setupMic() {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Le micro n’est pas disponible dans ce navigateur.');
    stream = await navigator.mediaDevices.getUserMedia({audio:true});
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser(); analyser.fftSize = 128; analyser.smoothingTimeConstant = .72;
    source.connect(analyser); drawTrail();
  }

  function cleanupMic() {
    if (animation) cancelAnimationFrame(animation); animation = null;
    if (stream) stream.getTracks().forEach(t=>t.stop()); stream=null;
    if (audioContext) audioContext.close().catch(()=>{}); audioContext=null; analyser=null;
  }

  function stopRecognition() {
    if (!recognition) return;
    try { recognition.onend = null; recognition.stop(); } catch (_) {}
    recognition = null; listening = false;
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return Promise.resolve();
    return new Promise(resolve => {
      speaking = true; setStatus('Nexus parle…','speak');
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'fr-FR'; utter.rate = 1; utter.pitch = 1;
      utter.onend = () => { speaking=false; resolve(); };
      utter.onerror = () => { speaking=false; resolve(); };
      window.speechSynthesis.speak(utter);
    });
  }

  async function ask(text) {
    if (!text.trim() || busy || !live) return;
    busy = true; stopRecognition(); setStatus('Nexus réfléchit…','think');
    try {
      const response = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history:[]})});
      const data = await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(data?.error || `Erreur serveur (${response.status}).`);
      const answer = data?.text || 'Je n’ai pas reçu de réponse.';
      addMessage(text,'user'); addMessage(answer,'nexus');
      await speak(answer);
    } catch (e) {
      addMessage(`⚠️ ${e.message || 'Le mode LIVE a rencontré une erreur.'}`,'nexus');
      await speak('Désolé, je rencontre un problème pour répondre.');
    } finally {
      busy=false;
      if (live) startRecognition();
    }
  }

  function startRecognition() {
    if (!live || speaking || busy || !SpeechRecognition || listening) return;
    recognition = new SpeechRecognition(); recognition.lang='fr-FR'; recognition.continuous=false; recognition.interimResults=true;
    currentTranscript=''; listening=true; setStatus('Je t’écoute…','listen');
    recognition.onresult = event => {
      let finalText='';
      for(let i=0;i<event.results.length;i++) { const r=event.results[i]; if(r.isFinal) finalText += r[0].transcript; else finalText += r[0].transcript; }
      currentTranscript=finalText.trim();
      clearTimeout(silenceTimer);
      if(currentTranscript) silenceTimer=setTimeout(()=>{ if(live && !busy) ask(currentTranscript); },900);
    };
    recognition.onerror = event => {
      listening=false;
      if(event.error==='not-allowed'||event.error==='service-not-allowed') { addMessage('⚠️ Autorise le micro dans le navigateur pour utiliser le LIVE.','nexus'); stopLive(); return; }
      if(live) setTimeout(startRecognition,400);
    };
    recognition.onend = () => { listening=false; if(live && !busy && !speaking) setTimeout(startRecognition,150); };
    try { recognition.start(); } catch (_) { listening=false; }
  }

  async function startLive() {
    if (!SpeechRecognition) { alert('Le mode LIVE utilise la reconnaissance vocale du navigateur. Essaie Chrome ou Edge.'); return; }
    try {
      await setupMic(); live=true;
      const bar=document.getElementById('liveBar'); if(bar) bar.hidden=false;
      const btn=document.getElementById('liveButton'); if(btn){btn.textContent='🟢';btn.title='Arrêter le mode LIVE';btn.classList.add('active');}
      setStatus('Je t’écoute…','listen'); startRecognition();
    } catch(e) {
      cleanupMic(); alert(e?.name==='NotAllowedError' ? 'Accès au micro refusé. Autorise le micro puis réessaie.' : (e.message||'Impossible de démarrer le LIVE.'));
    }
  }

  function stopLive() {
    live=false; clearTimeout(silenceTimer); silenceTimer=null; stopRecognition(); window.speechSynthesis?.cancel(); speaking=false; busy=false; cleanupMic();
    const bar=document.getElementById('liveBar'); if(bar) bar.hidden=true;
    const btn=document.getElementById('liveButton'); if(btn){btn.textContent='🔴';btn.title='Démarrer le mode LIVE';btn.classList.remove('active');}
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',ensureUI); else ensureUI();
})();
