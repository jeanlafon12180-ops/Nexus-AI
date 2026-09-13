export const config = {
  api: {
    bodyParser: { sizeLimit: '5mb' }
  }
};

function dataUrlToBlob(dataUrl) {
  const match = String(dataUrl || '').match(/^data:(image\/(?:png|jpe?g|webp|gif));base64,(.+)$/i);
  if (!match) return null;
  return new Blob([Buffer.from(match[2], 'base64')], { type: match[1].toLowerCase() });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });

  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Le moteur d’image n’est pas encore configuré côté serveur.' });

  try {
    const { imageData, prompt } = req.body || {};
    const cleanPrompt = String(prompt || '').trim();
    const imageBlob = dataUrlToBlob(imageData);

    if (!cleanPrompt) return res.status(400).json({ error: 'Instruction de modification vide.' });
    if (!imageBlob) return res.status(400).json({ error: 'Image invalide ou format non pris en charge.' });

    const form = new FormData();
    form.append('model', 'p-image-edit');
    form.append('prompt', cleanPrompt);
    form.append('image', imageBlob, 'nexus-input.png');

    const upstream = await fetch('https://gen.pollinations.ai/v1/images/edits', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: form
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) throw new Error(data?.error?.message || data?.error || 'Le service de modification d’image a refusé la demande.');

    const image = data?.data?.[0] || {};
    const imageUrl = image.url || null;
    const imageBase64 = image.b64_json || null;
    if (!imageUrl && !imageBase64) return res.status(502).json({ error: 'Le service n’a pas renvoyé l’image modifiée.' });

    return res.status(200).json({ url: imageUrl, b64_json: imageBase64, prompt: cleanPrompt });
  } catch (error) {
    console.error('Nexus image edit error:', error);
    return res.status(500).json({ error: error.message || 'Erreur pendant la modification de l’image.' });
  }
}
