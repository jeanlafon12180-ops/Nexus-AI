(() => {
  const MAX_IMAGES = 20;
  const MAX_VIDEOS = 5;
  const MAX_ANALYSIS_FRAMES = 20;
  const FRAMES_PER_VIDEO = 4;
  const MAX_TOTAL_DATA = 8000000;
  const input = document.getElementById('messageInput');
  const fileInput = document.getElementById('imageFileInput');
  const filePreview = document.getElementById('filePreview');
  const fileName = document.getElementById('fileName');
  const fileMeta = document.getElementById('fileMeta');
  const removeButton = document.getElementById('removeFileButton');
  const sendButton = document.getElementById('sendButton');
  const chat = document.getElementById('chat');
  let mediaItems = [];
  let busy = false;

  const escapeHtml = (value) => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 1000;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error(`Impossible de préparer « ${file.name} ».`));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.68));
        };
        img.onerror = () => reject(new Error(`Impossible de lire « ${file.name} ».`));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error(`Impossible de charger « ${file.name} ».`));
      reader.readAsDataURL(file);
    });
  }

  function extractVideoFrames(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const objectUrl = URL.createObjectURL(file);
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.src = objectUrl;

      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
        video.removeAttribute('src');
        video.load();
      };

      video.onerror = () => {
        cleanup();
        reject(new Error(`Impossible de lire la vidéo « ${file.name} ». Utilise de préférence MP4 ou WebM.`));
      };

      video.onloadedmetadata = async () => {
        try {
          const duration = Number(video.duration);
          if (!Number.isFinite(duration) || duration <= 0) throw new Error('Durée vidéo invalide.');
          const canvas = document.createElement('canvas');
          const max = 960;
          const scale = Math.min(1, max / Math.max(video.videoWidth || 1, video.videoHeight || 1));
          canvas.width = Math.max(1, Math.round((video.videoWidth || 960) * scale));
          canvas.height = Math.max(1, Math.round((video.videoHeight || 540) * scale));
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Impossible de préparer les images de la vidéo.');

          const times = duration <= 1
            ? [0]
            : Array.from({length: FRAMES_PER_VIDEO}, (_, i) => duration * ((i + 1) / (FRAMES_PER_VIDEO + 1)));
          const frames = [];

          for (const time of times) {
            await new Promise((resolveSeek, rejectSeek) => {
              const onSeeked = () => { video.removeEventListener('seeked', onSeeked); resolveSeek(); };
              const onError = () => { video.removeEventListener('seeked', onSeeked); rejectSeek(new Error(`Impossible d’extraire une image de « ${file.name} ».`)); };
              video.addEventListener('seeked', onSeeked, {once:true});
              video.addEventListener('error', onError, {once:true});
              video.currentTime = Math.min(Math.max(0, time), Math.max(0, duration - 0.05));
            });
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            frames.push(canvas.toDataURL('image/jpeg', 0.68));
          }
          cleanup();
          resolve({duration, frames});
        } catch (error) {
          cleanup();
          reject(error);
        }
      };
    });
  }

  function renderPreview() {
    if (!mediaItems.length) {
      filePreview.hidden = true;
      return;
    }
    const imageCount = mediaItems.filter(item => item.kind === 'image').length;
    const videoCount = mediaItems.filter(item => item.kind === 'video').length;
    filePreview.hidden = false;
    fileName.textContent = `${imageCount ? `${imageCount} photo${imageCount > 1 ? 's' : ''}` : ''}${imageCount && videoCount ? ' + ' : ''}${videoCount ? `${videoCount} vidéo${videoCount > 1 ? 's' : ''}` : ''} sélectionnée${imageCount + videoCount > 1 ? 's' : ''}`;
    fileMeta.textContent = videoCount ? `Jusqu’à ${MAX_VIDEOS} vidéos · ${FRAMES_PER_VIDEO} images extraites par vidéo pour l’analyse` : `Maximum : ${MAX_IMAGES} photos · analyse groupée`;
    filePreview.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;min-width:0;width:100%;">
        <div class="file-icon">${videoCount ? '🎬' : '🖼️'}</div>
        <div class="file-info" style="flex:1;min-width:0;">
          <strong>${escapeHtml(fileName.textContent)}</strong>
          <span>${escapeHtml(fileMeta.textContent)}</span>
        </div>
        <button id="removeMultiImages" type="button" aria-label="Retirer les médias">×</button>
      </div>
      <div style="display:flex;gap:6px;overflow-x:auto;margin-top:8px;padding-bottom:2px;">
        ${mediaItems.map((item, i) => item.kind === 'image'
          ? `<img src="${item.data}" alt="Photo ${i + 1}" title="${escapeHtml(item.name)}" style="width:52px;height:52px;object-fit:cover;border-radius:8px;flex:0 0 auto;">`
          : `<div title="${escapeHtml(item.name)}" style="width:52px;height:52px;border-radius:8px;flex:0 0 auto;display:grid;place-items:center;background:rgba(255,255,255,.08);font-size:25px;">🎬</div>`).join('')}
      </div>`;
    document.getElementById('removeMultiImages')?.addEventListener('click', clearMedia);
  }

  function clearMedia() {
    mediaItems = [];
    renderPreview();
    if (fileInput) fileInput.value = '';
    if (input) input.placeholder = 'Message à Nexus IA...';
  }

  function showUserMedia(selected) {
    selected.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'message-row user';
      const bubble = document.createElement('div');
      bubble.className = 'bubble user image-user-card';
      if (item.kind === 'image') {
        const img = document.createElement('img');
        img.className = 'attached-image';
        img.src = item.data;
        img.alt = `Photo ${index + 1}`;
        bubble.appendChild(img);
      } else {
        const title = document.createElement('div');
        title.style.fontSize = '16px';
        title.textContent = `🎬 ${item.name}`;
        bubble.appendChild(title);
        const meta = document.createElement('div');
        meta.style.marginTop = '5px';
        meta.style.fontSize = '12px';
        meta.style.opacity = '0.7';
        meta.textContent = 'Vidéo envoyée · images clés extraites pour l’analyse';
        bubble.appendChild(meta);
      }
      const label = document.createElement('div');
      label.style.marginTop = '6px';
      label.style.fontSize = '12px';
      label.style.opacity = '0.7';
      label.textContent = `${index + 1}/${selected.length} · ${item.name}`;
      bubble.appendChild(label);
      row.appendChild(bubble);
      chat.appendChild(row);
    });
    chat.scrollTop = chat.scrollHeight;
  }

  function showResponse(text) {
    const row = document.createElement('div');
    row.className = 'message-row nexus';
    const bubble = document.createElement('div');
    bubble.className = 'bubble nexus';
    bubble.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
    row.appendChild(bubble);
    chat.appendChild(row);
    chat.scrollTop = chat.scrollHeight;
  }

  async function sendMedia() {
    if (busy || !mediaItems.length) return;
    const question = String(input?.value || '').trim() || 'Analyse ces médias et explique-moi ce que tu observes. Pour les vidéos, décris les éléments importants visibles dans les images extraites et compare les vidéos si nécessaire.';
    const selected = mediaItems.slice();
    busy = true;
    if (sendButton) sendButton.disabled = true;
    if (input) { input.value = ''; input.disabled = true; }
    showUserMedia(selected);
    try {
      const analysisImages = selected.flatMap(item => item.kind === 'image' ? [item.data] : item.frames);
      if (analysisImages.length > MAX_ANALYSIS_FRAMES) {
        throw new Error(`Cette sélection représente ${analysisImages.length} images d’analyse. La limite est de ${MAX_ANALYSIS_FRAMES}. Pour analyser ${MAX_VIDEOS} vidéos, sélectionne-les seules.`);
      }
      const total = analysisImages.reduce((sum, data) => sum + data.length, 0);
      if (total > MAX_TOTAL_DATA) {
        throw new Error('Les médias sont trop lourds pour être envoyés ensemble. Réduis le nombre de fichiers ou choisis des fichiers plus légers.');
      }
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          imageDataList: analysisImages
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || `Erreur serveur (${response.status}).`);
      if (!data?.text) throw new Error('Le moteur IA n’a renvoyé aucune réponse.');
      showResponse(data.text);
    } catch (error) {
      showResponse(`⚠️ ${error.message || 'Une erreur est survenue.'}`);
    } finally {
      clearMedia();
      busy = false;
      if (sendButton) sendButton.disabled = false;
      if (input) { input.disabled = false; input.focus(); }
    }
  }

  fileInput?.addEventListener('change', async (event) => {
    const files = [...(event.target.files || [])];
    if (!files.length) return;
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    if (!imageFiles.length && !videoFiles.length) return;
    event.stopImmediatePropagation();

    if (imageFiles.length > MAX_IMAGES) {
      alert(`Nexus AI accepte au maximum ${MAX_IMAGES} photos à la fois.`);
      if (fileInput) fileInput.value = '';
      return;
    }
    if (videoFiles.length > MAX_VIDEOS) {
      alert(`Nexus AI accepte au maximum ${MAX_VIDEOS} vidéos à la fois.`);
      if (fileInput) fileInput.value = '';
      return;
    }

    try {
      mediaItems = [];
      for (const file of imageFiles) {
        const data = await compressImage(file);
        mediaItems.push({kind:'image', name:file.name, data});
      }
      for (const file of videoFiles) {
        const result = await extractVideoFrames(file);
        mediaItems.push({kind:'video', name:file.name, duration:result.duration, frames:result.frames});
      }
      const analysisCount = mediaItems.reduce((sum, item) => sum + (item.kind === 'image' ? 1 : item.frames.length), 0);
      if (analysisCount > MAX_ANALYSIS_FRAMES) {
        throw new Error(`Cette sélection dépasse la limite de ${MAX_ANALYSIS_FRAMES} images d’analyse. Avec ${videoFiles.length} vidéo(s), sélectionne moins de photos en même temps.`);
      }
      renderPreview();
      if (input) input.placeholder = videoFiles.length ? 'Pose une question sur ces vidéos…' : (imageFiles.length > 1 ? 'Pose une question sur ces photos…' : 'Pose une question sur cette photo…');
    } catch (error) {
      clearMedia();
      showResponse(`⚠️ ${error.message}`);
    }
  }, true);

  sendButton?.addEventListener('click', (event) => {
    if (!mediaItems.length) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    sendMedia();
  }, true);

  input?.addEventListener('keydown', (event) => {
    if (!mediaItems.length || event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    sendMedia();
  }, true);

  removeButton?.addEventListener('click', () => {
    if (mediaItems.length) clearMedia();
  }, true);
})();
