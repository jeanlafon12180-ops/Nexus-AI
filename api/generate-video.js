export const config = { api: { bodyParser: { sizeLimit: '1mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Le moteur vidéo n’est pas configuré côté serveur.' });

  try {
    const { prompt, model = 'veo', duration = 4 } = req.body || {};
    const cleanPrompt = String(prompt || '').trim().slice(0, 3000);
    if (!cleanPrompt) return res.status(400).json({ error: 'Prompt vidéo vide.' });
    const safeDuration = Math.min(8, Math.max(3, Number(duration) || 4));
    const url = 'https://gen.pollinations.ai/video/' + encodeURIComponent(cleanPrompt) +
      '?model=' + encodeURIComponent(model) + '&duration=' + encodeURIComponent(safeDuration);
    const upstream = await fetch(url, { headers: { Authorization: 'Bearer ' + apiKey } });
    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return res.status(upstream.status).json({ error: detail || 'La génération vidéo a échoué.' });
    }
    const contentType = upstream.headers.get('content-type') || 'video/mp4';
    const buffer = Buffer.from(await upstream.arrayBuffer());
    if (!buffer.length) return res.status(502).json({ error: 'La génération vidéo n’a renvoyé aucun fichier.' });
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', String(buffer.length));
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('Nexus V2 video error:', error);
    return res.status(500).json({ error: error?.message || 'Erreur pendant la génération vidéo.' });
  }
}