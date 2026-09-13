export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Le moteur IA n’est pas encore configuré côté serveur.' });
  }

  try {
    const body = req.body || {};
    const message = String(body.message || '').trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return res.status(400).json({ error: 'Message vide.' });
    }

    const messages = [
      {
        role: 'system',
        content: `Tu es Nexus AI, un assistant intelligent francophone. Tu réponds en français sauf si l’utilisateur demande une autre langue.

Quand l’utilisateur demande du code, produis du VRAI code exploitable, complet et cohérent avec sa demande. N’invente pas que le code fonctionne : écris le code réellement. Utilise toujours un bloc Markdown avec le langage, par exemple \\`\\`\\`python ou \\`\\`\\`html. Évite les pseudo-codes et les morceaux volontairement incomplets. Si plusieurs fichiers sont nécessaires, indique clairement le nom de chaque fichier et donne son contenu complet. Pour HTML/CSS/JavaScript, privilégie un exemple directement testable. Pour Python, donne un script exécutable. Explique brièvement comment l’utiliser après le code.

Pour les questions scolaires, explique clairement avec des exemples. Pour les calculs simples, vérifie ton résultat. Ne prétends pas avoir accès à des informations que tu n’as pas.`
      },
      ...history.slice(-12).map(item => ({
        role: item.type === 'user' ? 'user' : 'assistant',
        content: String(item.text || '').slice(0, 12000)
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-coder',
        messages,
        temperature: 0.2,
        max_tokens: 5000
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error?.message || data?.error || 'Le moteur IA a refusé la demande.');
    }

    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Le moteur IA n’a renvoyé aucune réponse.');

    return res.status(200).json({ text });
  } catch (error) {
    console.error('Nexus AI chat error:', error);
    return res.status(500).json({ error: error.message || 'Erreur du moteur IA.' });
  }
}
