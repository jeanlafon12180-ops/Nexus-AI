export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' }
  }
};

const MAX_IMAGES = 20;
const MAX_HISTORY = 12;
const MAX_HISTORY_CHARS = 12000;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });

  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Le moteur IA n’est pas encore configuré côté serveur.' });

  try {
    const body = req.body || {};
    const message = String(body.message || '').trim();
    const imageData = typeof body.imageData === 'string' ? body.imageData.trim() : '';
    const imageDataList = Array.isArray(body.imageDataList)
      ? body.imageDataList.filter(item => typeof item === 'string' && /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(item.trim())).slice(0, MAX_IMAGES)
      : [];
    const documentText = typeof body.documentText === 'string' ? body.documentText.trim() : '';
    const documentName = typeof body.documentName === 'string' ? body.documentName.trim() : '';
    const rawHistory = Array.isArray(body.history) ? body.history : [];

    if (!message) return res.status(400).json({ error: 'Message vide.' });

    const images = imageDataList.length ? imageDataList : (imageData ? [imageData] : []);
    const hasImage = images.length > 0;
    const hasDocument = documentText.length > 0;
    const codeRequest = /\b(code|programme|programmer|développe|developpe|développer|developper|html|css|javascript|js|python|site|jeu|snake|typescript|react|next\.js|node\.js|sql|api|bug|erreur|corrige|debug|fonction|script)\b/i.test(message);

    const history = rawHistory
      .filter(item => item && (item.type === 'user' || item.type === 'nexus') && typeof item.text === 'string')
      .slice(-MAX_HISTORY)
      .map(item => `${item.type === 'user' ? 'Utilisateur' : 'Nexus AI'}: ${item.text}`)
      .join('\n\n')
      .slice(-MAX_HISTORY_CHARS);

    const systemPrompt = `Tu es Nexus AI 1.5, un assistant intelligent francophone polyvalent.
Réponds en français sauf si l'utilisateur demande une autre langue.

RÈGLES GÉNÉRALES :
- Réponds directement à la question et reste utile.
- Donne des explications claires, structurées et adaptées au niveau de l'utilisateur.
- Ne présente jamais une information incertaine comme un fait certain.
- N'invente jamais une source, une fonctionnalité, un résultat de test ou une information absente du contexte.
- Pour les calculs, vérifie le résultat avant de répondre.
- Si une demande est ambiguë mais qu'une interprétation raisonnable est possible, choisis-la et indique brièvement ton choix.
- Utilise des listes ou des étapes quand cela améliore la compréhension.

${history ? `CONTEXTE DE LA CONVERSATION RÉCENTE :\n${history}\n\nUtilise ce contexte pour éviter de faire répéter l'utilisateur et pour conserver le fil de la discussion.` : ''}

${hasImage ? `IMAGES JOINTES :
Une ou plusieurs images sont jointes. Analyse réellement toutes les images avant de répondre.
- Utilise toutes les images pertinentes.
- Compare-les si la question le demande ou si cela aide naturellement.
- Décris uniquement ce qui est raisonnablement visible.
- Si un détail est illisible, incertain ou absent, dis-le clairement.
- Pour le texte présent dans une image, sois prudent sur les passages difficiles à lire.
- Ne prétends jamais avoir vu un élément qui n'est pas visible.` : ''}

${hasDocument ? `DOCUMENT JOINT :
Un document nommé « ${documentName || 'document'} » est joint et son texte extrait est fourni dans la demande.
- Base-toi d'abord sur ce contenu pour les questions concernant le document.
- Pour un résumé, structure les idées principales.
- Pour une question précise, reformule les passages utiles sans inventer.
- Si l'information demandée n'est pas présente, dis-le clairement.` : ''}

${codeRequest ? `MODE DÉVELOPPEMENT :
La demande concerne du développement logiciel.
- Produis du VRAI code exploitable.
- Donne le code COMPLET nécessaire, sans « ... » à la place de parties importantes.
- Respecte exactement les technologies et fonctionnalités demandées.
- Vérifie mentalement syntaxe, imports, variables, fonctions, événements, sélecteurs et dépendances.
- N'invente pas d'API, de fonction ou de bibliothèque.
- Si plusieurs fichiers sont nécessaires, indique clairement le nom de chaque fichier.
- Si un seul fichier suffit, donne un fichier autonome complet.
- Pour HTML/CSS/JavaScript, vérifie que les sélecteurs, événements et fonctions correspondent.
- Pour Python, vérifie les imports et la logique d'exécution.
- Pour une correction de bug, explique brièvement la cause puis donne la correction complète.
- Ne prétends jamais avoir exécuté le code si tu ne l'as pas réellement exécuté.
- Utilise les blocs Markdown avec le langage approprié.` : ''}

Tu es Nexus AI V1.5 : privilégie la fiabilité, la cohérence, la continuité de conversation et une réponse réellement utile plutôt qu'une réponse artificiellement longue.`;

    const userContent = hasImage
      ? [
          { type: 'text', text: message },
          ...images.map(url => ({ type: 'image_url', image_url: { url } }))
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
