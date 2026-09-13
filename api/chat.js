export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });

  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Le moteur IA n’est pas encore configuré côté serveur.' });

  try {
    const message = String((req.body || {}).message || '').trim();
    if (!message) return res.status(400).json({ error: 'Message vide.' });

    const codeRequest = /\b(code|programme|programmer|développe|developpe|développer|developper|html|css|javascript|js|python|site|jeu|snake|typescript|react|next\.js|node\.js|sql|api)\b/i.test(message);

    const systemPrompt = `Tu es Nexus AI 1.1, un assistant intelligent francophone spécialisé dans la génération de code fiable.
Réponds en français sauf si l'utilisateur demande une autre langue.

${codeRequest ? `La demande concerne du développement logiciel. Produis du VRAI code exploitable et adapté exactement à la demande.
- Donne du code COMPLET, sans « ... » ni parties essentielles à compléter.
- Respecte exactement les technologies et fonctionnalités demandées.
- Vérifie mentalement syntaxe, imports, variables, événements, fonctions et cohérence entre fichiers avant de répondre.
- N'invente pas d'API, de fonctions ou de bibliothèques.
- Si plusieurs fichiers sont nécessaires, donne chaque fichier avec son nom.
- Si un seul fichier suffit, donne un fichier autonome complet.
- Pour HTML/CSS/JavaScript, vérifie que les sélecteurs, événements et fonctions correspondent.
- Pour Python, vérifie les imports et l'exécution du programme.
- Si une information manque, choisis une solution raisonnable au lieu de bloquer.
- Fais une vérification interne du code avant de l'envoyer.
- Ne prétends jamais avoir réellement exécuté le code si ce n'est pas le cas.
- Utilise les blocs Markdown avec le langage approprié.
- Pour un jeu Snake complet, fournis réellement un jeu jouable et tout le code nécessaire.` : `Réponds directement et clairement à la demande de l'utilisateur.`}

Pour les questions scolaires, explique avec des exemples. Pour les calculs, vérifie ton résultat. Ne prétends jamais avoir accès à des informations que tu n'as pas.`;

    const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen-coder',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.1,
        max_tokens: 10000
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error?.message || data?.error || 'Le moteur IA a refusé la demande.');

    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Le moteur IA n’a renvoyé aucune réponse.');

    return res.status(200).json({ text });
  } catch (error) {
    console.error('Nexus AI chat error:', error);
    return res.status(500).json({ error: error.message || 'Erreur du moteur IA.' });
  }
}
