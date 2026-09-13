(() => {
  const MAX_RECORDING_MS = 5 * 60 * 1000;
  let recorder = null;
  let stream = null;
  let chunks = [];
  let recognition = null;
  let transcript = '';
  let timer = null;
  let startedAt = 0;

  function getComposer() { return document.querySelector('.composer'); }
  function getInput() { return document.getElementById('messageInput'); }

  function ensureStyles() {
    if (document.getElementById('nexus-audio-styles')) return;
    const style = document.createElement('style');
    style.id = 'nexus-audio-styles';
    style.textContent = `
      .audio-record-btn{width:42px;height:42px;border:0;border-radius:12px;background:transparent;color:inherit;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center}
      .audio-record-btn:hover{background:rgba(255,255,255,.08)}
      .audio-record-btn.recording{background:#ff3b30;color:#fff;animation:nexusAudioPulse 1s infinite}
      .audio-recording-bar{display:flex;align-items:center;gap:10px;padding:9px 12px;margin:0 0 8px;border-radius:12px;background:rgba(255,59,48,.1);border:1px solid rgba(255,59,48,.25);font-size:13px}
      .audio-recording-dot{width:9px;height:9px;border-radius:50%;background:#ff3b30;animation:nexusAudioBlink 1s infinite}
      .audio-recording-time{font-variant-numeric:tabular-nums;min-width:42px}
      .audio-recording-stop{margin-left:auto;border:0;border-radius:8px;padding:5px 9px;cursor:pointer}
      .audio-result{margin:0 0 8px;padding:10px;border-radius:12px;background:rgba(255,255,255,.05)}
      .audio-result audio{width:100%;max-width:420px}
      .audio-transcript{font-size:13px;opacity:.8;margin-top:7px;white-space:pre-wrap}
      @keyframes nexusAudioPulse{50%{transform:scale(1.06)}}
      @keyframes nexusAudioBlink{50%{opacity:.25}}
    `;
    document.head.appendChild(style);
  }

  function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  }

  function supportedMime() {
    const types = ['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg'];
    return types.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || '';
  }

  function showBar() {
    let bar = document.getElementById('audioRecordingBar');
    if (bar) return bar;
    bar = document.createElement('div');
    bar.id = 'audioRecordingBar';
    bar.className = 'audio-recording-bar';
    bar.innerHTML = '<span class="audio-recording-dot"></span><span>Enregistrement</span><span class="audio-recording-time" id="audioRecordingTime">00:00</span><button type="button" class="audio-recording-stop" id="audioStopButton">⏹ Arrêter</button>';
    const area = document.querySelector('.composer-area');
    const composer = getComposer();
    area.insertBefore(bar, composer);
    bar.querySelector('#audioStopButton').addEventListener('click', stopRecording);
    return bar;
  }

  function startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = event => {
      let finalText = '';
      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += text + ' ';
      }
      if (finalText) transcript += finalText;
    };
    recognition.onerror = () => {};
    try { recognition.start(); } catch (_) {}
  }

  function stopSpeechRecognition() {
    if (!recognition) return;
    try { recognition.stop(); } catch (_) {}
    recognition = null;
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      alert('Ton navigateur ne permet pas l’enregistrement audio.');
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks = [];
      transcript = '';
      const mimeType = supportedMime();
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorder.ondataavailable = e => { if (e.data?.size) chunks.push(e.data); };
      recorder.onstop = finishRecording;
      recorder.start(250);
      startedAt = Date.now();
      showBar();
      const btn = document.getElementById('audioRecordButton');
      btn?.classList.add('recording');
      btn && (btn.title = 'Arrêter l’enregistrement');
      startSpeechRecognition();
      timer = setInterval(() => {
        const el = document.getElementById('audioRecordingTime');
        if (el) el.textContent = formatTime(Date.now() - startedAt);
        if (Date.now() - startedAt >= MAX_RECORDING_MS) stopRecording();
      }, 250);
    } catch (err) {
      if (err?.name === 'NotAllowedError') alert('Accès au micro refusé. Autorise le micro dans ton navigateur puis réessaie.');
      else alert('Impossible de démarrer l’enregistrement audio.');
    }
  }

  function stopRecording() {
    if (!recorder || recorder.state === 'inactive') return;
    clearInterval(timer);
    timer = null;
    stopSpeechRecognition();
    recorder.stop();
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = null;
  }

  function finishRecording() {
    const type = recorder?.mimeType || 'audio/webm';
    const blob = new Blob(chunks, { type });
    const url = URL.createObjectURL(blob);
    const bar = document.getElementById('audioRecordingBar');
    bar?.remove();
    const btn = document.getElementById('audioRecordButton');
    btn?.classList.remove('recording');
    if (btn) btn.title = 'Enregistrer un audio';

    const result = document.createElement('div');
    result.className = 'audio-result';
    result.innerHTML = `<audio controls src="${url}"></audio><div class="audio-transcript"></div>`;
    result.querySelector('.audio-transcript').textContent = transcript.trim()
      ? `Transcription : ${transcript.trim()}`
      : 'Audio enregistré. Aucune transcription automatique disponible dans ce navigateur.';
    document.querySelector('.composer-area').insertBefore(result, getComposer());

    if (transcript.trim()) {
      const input = getInput();
      if (input) {
        input.value = transcript.trim();
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      setTimeout(() => document.getElementById('sendButton')?.click(), 150);
    }
    recorder = null;
    chunks = [];
  }

  function init() {
    ensureStyles();
    const composer = getComposer();
    const send = document.getElementById('sendButton');
    if (!composer || !send || document.getElementById('audioRecordButton')) return;
    const btn = document.createElement('button');
    btn.id = 'audioRecordButton';
    btn.type = 'button';
    btn.className = 'audio-record-btn';
    btn.textContent = '🎙️';
    btn.title = 'Enregistrer un audio';
    btn.setAttribute('aria-label', 'Enregistrer un audio');
    btn.addEventListener('click', () => recorder ? stopRecording() : startRecording());
    composer.insertBefore(btn, send);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
