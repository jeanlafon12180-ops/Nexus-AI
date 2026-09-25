(() => {
  /*
   * Nexus IA V1.9.3 — LIVE vocal
   * Priorité à MediaRecorder + transcription serveur pour fonctionner
   * aussi sur les navigateurs mobiles où SpeechRecognition est limité.
   */
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let live = false;
  let listening = false;
  let speaking = false;
  let busy = false;
  let recognition = null;
  let stream = null;
  let audioContext = null;
  let analyser = null;
  let source = null;
  let raf = null;
  let recorder = null;
  let recordedChunks = [];
  let speechStartedAt = 0;
  let lastVoiceAt = 0;
  let silenceTimer = null;
  let chunkTimer = null;
  let currentMime = 'audio/webm';

  const $ = id => document.getElementById(id);
  const chat = () => $('chat');
  const scrollChat = () => { const c = chat(); if (c) c.scrollTop = c.scrollHeight; };
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  function addMessage(text, type) {
    const c = chat(); if (!c) return;
    const row = document.createElement('div');
    row.className = `message-row ${type}`;
    const bubble = document.createElement('div');
    bubble.className = `bubble ${type}`;
    bubble.innerHTML = esc(text).replace(/\n/g,'<br>');
    row.appendChild(bubble); c.appendChild(row); scrollChat();
  }

  function ensureUI() {
    if ($('liveButton')) return;
    const composer = document.querySelector('.composer');
    const send = $('sendButton');
    if (!composer || !send) return;

    const btn = document.createElement('button');
    btn.id = 'liveButton';
    btn.type = 'button';
    btn.className = 'live-button';
    btn.textContent = '🔴';
    btn.title = 'Démarrer le mode LIVE';
    btn.setAttribute('aria-label','Démarrer le mode LIVE');
    btn.addEventListener('click', () => live ? stopLive() : startLive());
    composer.insertBefore(btn, send);

    const bar = document.createElement('div');
    bar.id = 'liveBar';
    bar.className = 'live-bar';
    bar.hidden = true;
    bar.innerHTML = '<div class="live-status"><span class="live-dot"></span><strong id="liveStatusText">LIVE</strong></div><canvas id="liveTrail" width="520" height="54"></canvas><button id="liveStop" type="button">⏹ Arrêter</button>';
    document.querySelector('.composer-area')?.insertBefore(bar, composer);
    $('liveStop')?.addEventListener('click', stopLive);
  }

  function setStatus(text, mode='listen') {
    const label = $('liveStatusText');
    const bar = $('liveBar');
    if (label) label.textContent = text;
    if (bar) bar.dataset.mode = mode;
  }

  function drawTrail() {
    if (!live) return;
    const canvas = $('liveTrail'); if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = Math.max(260, Math.floor(canvas.clientWidth * (window.devicePixelRatio || 1)));
    const h = canvas.height = Math.max(46, Math.floor(canvas.clientHeight * (window.devicePixelRatio || 1)));
    const data = analyser ? new Uint8Array(analyser.fftSize) : null;
    if (data && analyser) analyser.getByteTimeDomainData(data);

    let sum = 0;
    if (data) {
      for (const value of data) {
        const normalized = (value - 128) / 128;
        sum += normalized * normalized;
      }
    }
    const rms = data ? Math.sqrt(sum / data.length) : 0;
    const energy = Math.min(1, rms * 7.5);
    const t = performance.now() / 1000;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    // Gemini-inspired multicolor dust: many tiny luminous particles rise,
    // drift and gather around the center instead of drawing a simple wave.
    const colors = [
      [255, 55, 95], [255, 196, 0], [52, 199, 89],
      [0, 199, 255], [88, 86, 214], [255, 90, 200]
    ];
    const count = Math.floor(70 + energy * 120);
    const cx = w * 0.5;
    const cy = h * 0.57;

    for (let i = 0; i < count; i++) {
      const seed = i * 17.731;
      const phase = seed + t * (0.45 + (i % 7) * 0.035);
      const spread = (0.18 + ((i * 37) % 100) / 100 * 0.82) * w * (0.18 + energy * 0.35);
      const x = cx + Math.sin(phase * 0.83) * spread + Math.sin(phase * 1.7) * w * 0.035;
      const lift = ((t * (9 + (i % 5) * 2) + i * 3.7) % (h * 1.45));
      const y = cy + h * 0.62 - lift + Math.sin(phase * 1.3) * (4 + energy * 12);
      if (y < -8 || y > h + 8) continue;

      const size = (0.7 + ((i * 13) % 10) / 10 * 1.7) * (0.8 + energy * 1.7);
      const color = colors[i % colors.length];
      const alpha = Math.min(0.9, 0.12 + energy * 0.62 + 0.18 * Math.sin(phase));

      ctx.beginPath();
      ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${Math.max(0.04, alpha)})`;
      ctx.shadowBlur = 7 + energy * 12;
      ctx.shadowColor = ctx.fillStyle;
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Soft luminous core.
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(24, w * 0.24));
    glow.addColorStop(0, `rgba(255,255,255,${0.07 + energy * 0.22})`);
    glow.addColorStop(0.3, `rgba(0,199,255,${0.035 + energy * 0.09})`);
    glow.addColorStop(0.65, 'rgba(255,70,180,0.018)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';

    if (listening && recorder && recorder.state === 'recording') {
      const now = performance.now();
      const isVoice = rms > 0.018;
      if (isVoice) {
        if (!speechStartedAt) speechStartedAt = now;
        lastVoiceAt = now;
      } else if (speechStartedAt && lastVoiceAt && now-lastVoiceAt > 700 && now-speechStartedAt > 350) {
        finishRecording();
      }
    }
    raf = requestAnimationFrame(drawTrail);
  }

  async function setupMic() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Le micro n’est pas disponible dans ce navigateur.');
    }
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation:true, noiseSuppression:true, autoGainControl:true, channelCount:1 }
    });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.resume().catch(()=>{});
    source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.72;
    source.connect(analyser);

    const preferred = [
      'audio/webm;codecs=opus',
      'audio/mp4',
      'audio/webm',
      'audio/ogg;codecs=opus'
    ];
    currentMime = preferred.find(type => window.MediaRecorder?.isTypeSupported?.(type)) || '';
    if (!window.MediaRecorder) throw new Error('L’enregistrement audio n’est pas disponible dans ce navigateur.');
    recorder = null;
    drawTrail();
  }

  function cleanupMic() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    clearTimeout(silenceTimer);
    clearTimeout(chunkTimer);
    silenceTimer = null;
    chunkTimer = null;
    try { recorder?.stop(); } catch (_) {}
    recorder = null;
    if (source) { try { source.disconnect(); } catch (_) {} }
    source = null;
    if (stream) stream.getTracks().forEach(track => track.stop());
    stream = null;
    if (audioContext) audioContext.close().catch(()=>{});
    audioContext = null;
    analyser = null;
    recordedChunks = [];
    speechStartedAt = 0;
    lastVoiceAt = 0;
  }

  function startRecorder() {
    if (!live || busy || speaking || !stream || !window.MediaRecorder) return;
    if (recorder && recorder.state !== 'inactive') return;

    recordedChunks = [];
    speechStartedAt = 0;
    lastVoiceAt = 0;
    try {
      recorder = currentMime
        ? new MediaRecorder(stream, { mimeType: currentMime, audioBitsPerSecond: 64000 })
        : new MediaRecorder(stream);
    } catch (_) {
      recorder = new MediaRecorder(stream);
    }

    recorder.ondataavailable = event => {
      if (event.data?.size) recordedChunks.push(event.data);
    };

    recorder.onerror = () => {
      listening = false;
      if (live && !busy) setTimeout(startRecorder, 250);
    };

    recorder.onstop = async () => {
      const chunks = recordedChunks;
      recordedChunks = [];
      listening = false;
      const type = recorder?.mimeType || currentMime || 'audio/webm';
      if (!chunks.length || !live) {
        if (live && !busy && !speaking) setTimeout(startRecorder, 120);
        return;
      }

      const blob = new Blob(chunks, { type });
      if (blob.size < 1800) {
        if (live && !busy && !speaking) setTimeout(startRecorder, 120);
        return;
      }
      await transcribeBlob(blob, type);
    };

    recorder.start(150);
    listening = true;
    setStatus('Je t’écoute…','listen');

    // Safety cap: never keep one recording open forever.
    chunkTimer = setTimeout(() => {
      if (recorder?.state === 'recording') finishRecording();
    }, 12000);
  }

  function finishRecording() {
    clearTimeout(chunkTimer);
    chunkTimer = null;
    if (recorder?.state === 'recording') {
      try { recorder.stop(); } catch (_) {}
    }
  }

  async function transcribeBlob(blob, mimeType) {
    if (!live || busy) return;
    busy = true;
    setStatus('Je t’ai entendu…','think');
    try {
      const reader = new FileReader();
      const audioData = await new Promise((resolve,reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const extension = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('ogg') ? 'ogg' : 'webm';
      const response = await fetch('/api/transcribe-audio', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ audioData, filename:`live-${Date.now()}.${extension}`, mimeType })
      });
      const data = await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(data?.error || `Transcription impossible (${response.status}).`);
      const text = String(data?.text || '').trim();
      if (text && live) await ask(text); else if (live) setStatus('Je n’ai pas entendu de parole…','error');
    } catch (error) {
      if (live) {
        addMessage(`⚠️ ${error.message || 'Je n’ai pas réussi à comprendre le son.'}`,'nexus');
        setStatus('Réessaie…','error');
        await new Promise(resolve => setTimeout(resolve, 700));
      }
    } finally {
      busy = false;
      if (live && !speaking) startRecorder();
    }
  }

  function getHistory() {
    try {
      const deviceId = localStorage.getItem('nexus_ia_device_id_v10') || '';
      const raw = deviceId ? localStorage.getItem('nexus_ia_conversation_v10_'+deviceId) : null;
      const value = raw ? JSON.parse(raw) : [];
      return Array.isArray(value) ? value.slice(-16) : [];
    } catch (_) { return []; }
  }

  function getMemory() {
    try {
      const deviceId = localStorage.getItem('nexus_ia_device_id_v10') || '';
      const raw = deviceId ? localStorage.getItem('nexus_ia_memory_v10_'+deviceId) : null;
      return raw ? JSON.parse(raw) : {};
    } catch (_) { return {}; }
  }

  async function ask(text) {
    if (!text.trim() || !live) return;
    stopRecognition();
    if (speaking) {
      window.speechSynthesis?.cancel();
      speaking = false;
    }
    setStatus('Nexus réfléchit…','think');
    try {
      const response = await fetch('/api/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          message:text,
          history:getHistory(),
          memory:getMemory()
        })
      });
      const data = await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(data?.error || `Erreur serveur (${response.status}).`);
      const answer = String(data?.text || '').trim() || 'Je n’ai pas reçu de réponse.';
      addMessage(text,'user');
      addMessage(answer,'nexus');
      await speak(answer);
    } catch (error) {
      addMessage(`⚠️ ${error.message || 'Le mode LIVE a rencontré une erreur.'}`,'nexus');
      await speak('Désolé, je rencontre un problème pour répondre.');
    } finally {
      if (live && !speaking) startRecorder();
    }
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) {
      setStatus('Je t’écoute…','listen');
      return Promise.resolve();
    }
    return new Promise(resolve => {
      speaking = true;
      setStatus('Nexus parle…','speak');
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'fr-FR';
      utter.rate = 1;
      utter.pitch = 1;
      utter.volume = 1;
      const voices = window.speechSynthesis.getVoices?.() || [];
      const french = voices.find(v => /^fr(-|_)/i.test(v.lang));
      if (french) utter.voice = french;
      utter.onend = () => {
        speaking = false;
        if (live) startRecorder();
        resolve();
      };
      utter.onerror = () => {
        speaking = false;
        if (live) startRecorder();
        resolve();
      };
      window.speechSynthesis.speak(utter);
    });
  }

  function stopRecognition() {
    if (!recognition) return;
    try { recognition.onend = null; recognition.stop(); } catch (_) {}
    recognition = null;
  }

  // Keep a SpeechRecognition fallback for older desktop browsers where
  // MediaRecorder is unavailable. It is no longer the primary LIVE path.
  function startRecognitionFallback() {
    if (!SpeechRecognition || !live || listening || busy || speaking) return;
    recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = true;
    let transcript = '';
    listening = true;
    setStatus('Je t’écoute…','listen');
    recognition.onresult = event => {
      transcript = Array.from(event.results).map(r => r[0].transcript).join(' ').trim();
      if (event.results[event.results.length-1]?.isFinal && transcript) ask(transcript);
    };
    recognition.onerror = event => {
      listening = false;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        addMessage('⚠️ Autorise le micro dans le navigateur pour utiliser le LIVE.','nexus');
        stopLive();
      }
    };
    recognition.onend = () => {
      listening = false;
      if (live && !busy && !speaking) setTimeout(startRecognitionFallback, 180);
    };
    try { recognition.start(); } catch (_) { listening=false; }
  }

  async function startLive() {
    if (live) return;
    try {
      await setupMic();
      live = true;
      const bar = $('liveBar'); if (bar) bar.hidden = false;
      const btn = $('liveButton');
      if (btn) {
        btn.textContent='🟢';
        btn.title='Arrêter le mode LIVE';
        btn.classList.add('active');
      }
      setStatus('Je t’écoute…','listen');
      if (window.MediaRecorder) startRecorder();
      else if (SpeechRecognition) startRecognitionFallback();
      else throw new Error('Ce navigateur ne possède pas de système de reconnaissance vocale compatible.');
    } catch (error) {
      live = false;
      cleanupMic();
      const message = error?.name === 'NotAllowedError'
        ? 'Accès au micro refusé. Autorise le micro dans le navigateur puis réessaie.'
        : (error?.message || 'Impossible de démarrer le LIVE.');
      alert(message);
    }
  }

  function stopLive() {
    live = false;
    busy = false;
    stopRecognition();
    window.speechSynthesis?.cancel();
    speaking = false;
    cleanupMic();
    const bar = $('liveBar'); if (bar) bar.hidden = true;
    const btn = $('liveButton');
    if (btn) {
      btn.textContent='🔴';
      btn.title='Démarrer le mode LIVE';
      btn.classList.remove('active');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',ensureUI);
  else ensureUI();
})();