export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  try {
    const { text, voice = 'nova', model = 'qwen-tts' } = req.body || {};
    const input = String(text || '').trim().slice(0, 5000);
    if (!input) return res.status(400).json({ error: 'Texte vocal manquant.' });
    if (!process.env.POLLINATIONS_API_KEY) return res.status(500).json({ error: 'Clé vocale non configurée sur le serveur.' });

    const response = await fetch('https://gen.pollinations.ai/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, input, voice, response_format: 'mp3' })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return res.status(response.status).json({ error: detail || 'Génération de la voix impossible.' });
    }
    const arrayBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(Buffer.from(arrayBuffer));
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Erreur pendant la génération vocale.' });
  }
}
