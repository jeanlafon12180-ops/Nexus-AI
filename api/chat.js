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

    if (!message) {
      return res.status(400).json({ error: 'Message vide.' });
    }

    const codeRequest = /\b(code|programme|programmer|développe|developpe|développer|developper|html|css|javascript|js|python|site|jeu|snake)\b/i.test(message);

    const systemPrompt = `Tu es Nexus AI, un assistant intelligent francophone.
Réponds en français sauf si l'utilisateur demande une autre langue.

${codeRequest ? `IMPORTANT : la demande actuelle concerne du développement logiciel. Tu dois répondre avec du VRAI code exploitable, pas avec une définition du langage et pas avec un simple exemple générique.
- Pour « Crée-moi un jeu Snake complet en HTML, CSS et JavaScript », fournis un jeu réellement jouable.
- Donne le contenu COMPLET des fichiers nécessaires.
- Si un seul fichier HTML suffit, donne un seul fichier HTML autonome contenant HTML + CSS + JavaScript.
- Le code doit être cohérent, exécutable dans un navigateur et inclure les fonctionnalités demandées.
- Utilise des blocs Markdown avec le langage : \`\`\`html, \`\`\`css, \`\`\`javascript ou \`\`\`python.
- Ne remplace jamais une demande de code par une explication théorique du langage.` : `Réponds directement et clairement à la demande de l'utilisateur.`}

Pour les questions scolaires, explique avec des exemples. Pour les calculs, vérifie ton résultat. Ne prétends jamais avoir accès à des informations que tu n'as pas.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-coder-large',
        messages,
        temperature: 0.15,
        max_tokens: 8000
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
