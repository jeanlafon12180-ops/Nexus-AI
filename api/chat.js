export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });

  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Le moteur IA n’est pas encore configuré côté serveur.' });

  try {
    const body = req.body || {};
    const message = String(body.message || '').trim();
    const imageData = typeof body.imageData === 'string' ? body.imageData.trim() : '';
    const documentText = typeof body.documentText === 'string' ? body.documentText.trim() : '';
    const documentName = typeof body.documentName === 'string' ? body.documentName.trim() : '';
    if (!message) return res.status(400).json({ error: 'Message vide.' });

    const codeRequest = /\b(code|programme|programmer|développe|developpe|développer|developper|html|css|javascript|js|python|site|jeu|snake|typescript|react|next\.js|node\.js|sql|api)\b/i.test(message);
    const hasImage = /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(imageData);
    const hasDocument = documentText.length > 0;

    const systemPrompt = `Tu es Nexus AI 1.4, un assistant intelligent francophone avec compréhension d'images et de documents.
Réponds en français sauf si l'utilisateur demande une autre langue.

${hasImage ? `Une image est jointe à la demande. Analyse réellement son contenu avant de répondre.
- Décris uniquement ce que tu peux raisonnablement observer.
- Réponds aux questions en t'appuyant sur l'image.
- Si un élément est illisible, incertain ou absent, dis-le clairement au lieu de l'inventer.
- Pour une image contenant du texte, lis-le avec prudence.
- Ne prétends jamais avoir vu un élément qui n'est pas visible.` : ''}

${hasDocument ? `Un document texte est joint à la demande. Son nom est : ${documentName || 'document'}.
Le contenu extrait du document est fourni dans le message utilisateur.
- Réponds aux questions en utilisant d'abord ce contenu.
- Pour un résumé, structure clairement les idées principales.
- Pour une question précise, cite ou reformule les passages utiles sans inventer.
- Si l'information demandée n'est pas dans le document, dis-le clairement.
- Le document peut provenir d'un PDF, d'un fichier Word .docx, d'un fichier LibreOffice .odt ou d'un fichier texte.` : ''}

${codeRequest ? `La demande concerne du développement logiciel. Produis du VRAI code exploitable et adapté exactement à la demande.
- Donne du code COMPLET, sans « ... » ni parties essentielles à compléter.
- Respecte exactement les technologies et fonctionnalités demandées.
- Vérifie mentalement syntaxe, imports, variables, événements, fonctions et cohérence entre fichiers.
- N'invente pas d'API, de fonctions ou de bibliothèques.
- Si plusieurs fichiers sont nécessaires, donne chaque fichier avec son nom.
- Si un seul fichier suffit, donne un fichier autonome complet.
- Pour HTML/CSS/JavaScript, vérifie les sélecteurs, événements et fonctions.
- Pour Python, vérifie les imports et l'exécution du programme.
- Si une information manque, choisis une solution raisonnable au lieu de bloquer.
- Ne prétends jamais avoir réellement exécuté le code si ce n'est pas le cas.
- Utilise les blocs Markdown avec le langage approprié.` : `Réponds directement et clairement à la demande de l'utilisateur.`}

Pour les questions scolaires, explique avec des exemples. Pour les calculs, vérifie ton résultat. Ne prétends jamais avoir accès à des informations que tu n'as pas.`;

    const userContent = hasImage
      ? [
          { type: 'text', text: message },
          { type: 'image_url', image_url: { url: imageData } }
        ]
      : hasDocument
        ? `${message}\n\n--- CONTENU DU DOCUMENT : ${documentName || 'document'} ---\n${documentText}\n--- FIN DU DOCUMENT ---`
        : message;

    const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: hasImage ? 'qwen-vision' : 'qwen-coder',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
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
