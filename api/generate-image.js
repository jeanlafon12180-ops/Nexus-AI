export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'Le moteur d’image n’est pas encore configuré côté serveur.'
    });
  }

  try {
    const { prompt } = req.body || {};
    const cleanPrompt = String(prompt || '').trim();

    if (!cleanPrompt) {
      return res.status(400).json({ error: 'Prompt vide.' });
    }

    // V1.2 : on conserve la demande de l'utilisateur tout en ajoutant
    // des indications générales de qualité et de cohérence visuelle.
    const enhancedPrompt = [
      cleanPrompt,
      'High quality, detailed image, coherent composition, natural lighting, sharp subject, clean details.'
    ].join('. ');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    let upstream;
    try {
      upstream = await fetch('https://gen.pollinations.ai/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-image-2',
          prompt: enhancedPrompt,
          size: '1536x1024'
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data?.error?.message || data?.error || 'Le service de génération a refusé la demande.'
      });
    }

    const image = data?.data?.[0] || {};
    const imageUrl = image.url;
    const imageBase64 = image.b64_json;

    if (!imageUrl && !imageBase64) {
      return res.status(502).json({ error: 'Le service n’a pas renvoyé d’image.' });
    }

    return res.status(200).json({
      url: imageUrl || null,
      b64_json: imageBase64 || null,
      prompt: cleanPrompt
    });
  } catch (error) {
    console.error('Nexus V2 image error:', error);
    if (error?.name === 'AbortError') {
      return res.status(504).json({ error: 'La génération de l’image a pris trop de temps. Réessaie.' });
    }
    return res.status(500).json({ error: 'Erreur pendant la génération de l’image.' });
  }
}
