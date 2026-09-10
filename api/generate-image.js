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

    const upstream = await fetch('https://gen.pollinations.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'flux',
        prompt: cleanPrompt,
        size: '1024x1024'
      })
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data?.error?.message || 'Le service de génération a refusé la demande.'
      });
    }

    const imageUrl = data?.data?.[0]?.url;
    const imageBase64 = data?.data?.[0]?.b64_json;

    if (!imageUrl && !imageBase64) {
      return res.status(502).json({ error: 'Le service n’a pas renvoyé d’image.' });
    }

    return res.status(200).json({
      url: imageUrl || null,
      b64_json: imageBase64 || null,
      prompt: cleanPrompt
    });
  } catch (error) {
    console.error('Nexus image error:', error);
    return res.status(500).json({ error: 'Erreur pendant la génération de l’image.' });
  }
}
