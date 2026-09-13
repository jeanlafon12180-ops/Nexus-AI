export const config = { api: { bodyParser: { sizeLimit: '25mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  try {
    const { audioData, filename = 'audio.webm', mimeType = 'audio/webm' } = req.body || {};
    if (typeof audioData !== 'string' || !audioData.startsWith('data:')) {
      return res.status(400).json({ error: 'Fichier audio manquant.' });
    }
    const comma = audioData.indexOf(',');
    if (comma < 0) return res.status(400).json({ error: 'Audio invalide.' });
    const base64 = audioData.slice(comma + 1);
    const bytes = Buffer.from(base64, 'base64');
    if (!bytes.length) return res.status(400).json({ error: 'Audio vide.' });

    const form = new FormData();
    form.append('file', new Blob([bytes], { type: mimeType }), filename);
    form.append('model', 'whisper-1');
    form.append('language', 'fr');

    const response = await fetch('https://gen.pollinations.ai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY}` },
      body: form
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || data?.error || 'Transcription audio impossible.' });
    return res.status(200).json({ text: data?.text || '' });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Erreur pendant la transcription audio.' });
  }
}
