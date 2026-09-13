(() => {
  const input = document.getElementById('imageFileInput');
  if (!input) return;
  input.accept += ',audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/ogg,audio/webm,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a,.aac,.flac';
  const originalChange = input.onchange;
  input.addEventListener('change', async (event) => {
    const files = [...(event.target.files || [])].filter(f => f.type.startsWith('audio/'));
    if (!files.length) return;
    event.stopImmediatePropagation();
    const file = files[0];
    if (file.size > 20 * 1024 * 1024) { alert('Audio trop volumineux : maximum 20 Mo.'); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const preview = document.getElementById('filePreview');
        if (preview) {
          preview.hidden = false;
          preview.innerHTML = `<div style="display:flex;align-items:center;gap:10px;width:100%"><div class="file-icon">🎵</div><div class="file-info" style="flex:1"><strong>${file.name.replace(/[&<>\"]/g, '')}</strong><span>Audio · transcription en cours…</span></div></div>`;
        }
        const response = await fetch('/api/transcribe-audio', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ audioData:reader.result, filename:file.name, mimeType:file.type || 'audio/webm' }) });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error || 'Transcription impossible.');
        const text = String(data?.text || '').trim();
        const inputText = document.getElementById('messageInput');
        if (inputText) { inputText.value = text; inputText.dispatchEvent(new Event('input',{bubbles:true})); }
        if (preview) {
          preview.innerHTML = `<div style="width:100%"><div style="font-weight:600">🎵 ${file.name.replace(/[&<>\"]/g, '')}</div><audio controls style="width:100%;margin-top:8px" src="${URL.createObjectURL(file)}"></audio><div style="font-size:13px;opacity:.75;margin-top:7px">${text ? 'Transcription : '+text.replace(/[&<>\"]/g, '') : 'Aucune parole détectée.'}</div></div>`;
        }
      } catch (error) {
        alert(error?.message || 'Erreur audio.');
      }
    };
    reader.readAsDataURL(file);
  }, true);
})();
