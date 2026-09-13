(() => {
  const MAX_IMAGES = 20;
  const MAX_TOTAL_DATA = 4200000;
  const input = document.getElementById('messageInput');
  const fileInput = document.getElementById('imageFileInput');
  const filePreview = document.getElementById('filePreview');
  const fileName = document.getElementById('fileName');
  const fileMeta = document.getElementById('fileMeta');
  const removeButton = document.getElementById('removeFileButton');
  const sendButton = document.getElementById('sendButton');
  const chat = document.getElementById('chat');
  let images = [];
  let busy = false;

  const escapeHtml = (value) => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');

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

  function renderPreview() {
    if (!images.length) {
      filePreview.hidden = true;
      return;
    }
    filePreview.hidden = false;
    fileName.textContent = `${images.length} photo${images.length > 1 ? 's' : ''} sélectionnée${images.length > 1 ? 's' : ''}`;
    fileMeta.textContent = 'Les photos seront envoyées ensemble à Nexus AI';
    filePreview.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;min-width:0;width:100%;">
        <div class="file-icon">🖼️</div>
        <div class="file-info" style="flex:1;min-width:0;">
          <strong>${images.length} photo${images.length > 1 ? 's' : ''}</strong>
          <span>Maximum : ${MAX_IMAGES} · analyse groupée</span>
        </div>
        <button id="removeMultiImages" type="button" aria-label="Retirer les photos">×</button>
      </div>
      <div style="display:flex;gap:6px;overflow-x:auto;margin-top:8px;padding-bottom:2px;">
        ${images.map((item, i) => `<img src="${item.data}" alt="Photo ${i + 1}" title="${escapeHtml(item.name)}" style="width:52px;height:52px;object-fit:cover;border-radius:8px;flex:0 0 auto;">`).join('')}
      </div>`;
    document.getElementById('removeMultiImages')?.addEventListener('click', clearImages);
  }

  function clearImages() {
    images = [];
    renderPreview();
    if (fileInput) fileInput.value = '';
  }

  function showImages() {
    images.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'message-row user';
      const bubble = document.createElement('div');
      bubble.className = 'bubble user image-user-card';
      const img = document.createElement('img');
      img.className = 'attached-image';
      img.src = item.data;
      img.alt = `Photo ${index + 1}`;
      bubble.appendChild(img);
      const label = document.createElement('div');
      label.style.marginTop = '6px';
      label.style.fontSize = '12px';
      label.style.opacity = '0.7';
      label.textContent = `${index + 1}/${images.length} · ${item.name}`;
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

  async function sendImages() {
    if (busy || !images.length) return;
    const question = String(input?.value || '').trim() || 'Analyse ces photos ensemble et explique-moi ce que tu observes. Compare-les si cela est pertinent.';
    const selected = images.slice();
    busy = true;
    if (sendButton) sendButton.disabled = true;
    if (input) { input.value = ''; input.disabled = true; }
    showImages();
    try {
      const total = selected.reduce((sum, item) => sum + item.data.length, 0);
      if (total > MAX_TOTAL_DATA) {
        throw new Error('Les 20 photos sont trop lourdes pour être envoyées ensemble. Sélectionne des photos moins lourdes ou moins nombreuses.');
      }
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          imageDataList: selected.map(item => item.data)
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || `Erreur serveur (${response.status}).`);
      if (!data?.text) throw new Error('Le moteur IA n’a renvoyé aucune réponse.');
      showResponse(data.text);
    } catch (error) {
      showResponse(`⚠️ ${error.message || 'Une erreur est survenue.'}`);
    } finally {
      clearImages();
      busy = false;
      if (sendButton) sendButton.disabled = false;
      if (input) { input.disabled = false; input.focus(); }
    }
  }

  fileInput?.addEventListener('change', async (event) => {
    const files = [...(event.target.files || [])];
    if (!files.length) return;
    event.stopImmediatePropagation();
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (!imageFiles.length) return;
    if (imageFiles.length > MAX_IMAGES) {
      alert(`Nexus AI accepte au maximum ${MAX_IMAGES} photos à la fois.`);
    }
    try {
      images = [];
      for (const file of imageFiles.slice(0, MAX_IMAGES)) {
        const data = await compressImage(file);
        images.push({ name: file.name, data });
      }
      renderPreview();
      if (input) input.placeholder = 'Pose une question sur ces photos…';
    } catch (error) {
      clearImages();
      showResponse(`⚠️ ${error.message}`);
    }
  }, true);

  sendButton?.addEventListener('click', (event) => {
    if (!images.length) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    sendImages();
  }, true);

  input?.addEventListener('keydown', (event) => {
    if (!images.length || event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    sendImages();
  }, true);

  removeButton?.addEventListener('click', () => {
    if (images.length) clearImages();
  }, true);
})();
