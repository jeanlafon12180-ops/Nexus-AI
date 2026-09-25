import { buildFutureEngineContract, buildNexusIdentity, buildReasoningPolicy } from './nexus-core.js';

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } }
};

const MAX_IMAGES = 20;
const MAX_HISTORY = 24;
const MAX_HISTORY_CHARS = 30000;
const MAX_MEMORY_CHARS = 6000;
const MAX_CONTEXT_MESSAGE_CHARS = 6000;

function cleanText(value, max = 20000) {
  return String(value || '').replace(/\u0000/g, '').trim().slice(0, max);
}

function detectMode(message) {
  const text = message.toLowerCase();
  if (/\b(code|programme|programmer|développe|developpe|html|css|javascript|typescript|python|react|next\.js|node\.js|sql|api|bug|erreur|corrige|debug|fonction|script|roblox|lua)\b/i.test(text)) return 'code';
  if (/\b(math|maths|calcul|équation|equation|pythagore|cosinus|sinus|géométrie|geometry)\b/i.test(text)) return 'maths';
  if (/\b(résume|resume|résumé|document|cours|histoire|géographie|exercice|devoir)\b/i.test(text)) return 'study';
  return 'general';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });

  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Le moteur IA n’est pas encore configuré côté serveur.' });

  try {
    const body = req.body || {};
    const message = cleanText(body.message, 12000);
    const imageData = typeof body.imageData === 'string' ? body.imageData.trim() : '';
    const imageDataList = Array.isArray(body.imageDataList)
      ? body.imageDataList.filter(item => typeof item === 'string' && /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(item.trim())).slice(0, MAX_IMAGES)
      : [];
    const documentText = cleanText(body.documentText, 60000);
    const documentName = cleanText(body.documentName, 200);
    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const memory = cleanText(JSON.stringify(body.memory || {}), MAX_MEMORY_CHARS);

    if (!message) return res.status(400).json({ error: 'Message vide.' });

    const images = imageDataList.length ? imageDataList : (imageData ? [imageData] : []);
    const hasImage = images.length > 0;
    const hasDocument = documentText.length > 0;
    const mode = detectMode(message);
    const isDeepTask = complexitySignalsPlaceholder;

    const historyItems = rawHistory
      .filter(item => item && (item.type === 'user' || item.type === 'nexus') && typeof item.text === 'string')
      .slice(-MAX_HISTORY);

    const historyMessages = [];
    let historyChars = 0;
    for (let i = historyItems.length - 1; i >= 0; i--) {
      const item = historyItems[i];
      const text = cleanText(item.text, MAX_CONTEXT_MESSAGE_CHARS);
      if (!text) continue;
      if (historyChars + text.length > MAX_HISTORY_CHARS) break;
      historyMessages.unshift({
        role: item.type === 'user' ? 'user' : 'assistant',
        content: text
      });
      historyChars += text.length;
    }

    const history = historyMessages
      .map(item => (item.role === 'user' ? 'Utilisateur: ' : 'Nexus AI: ') + item.content)
      .join('\n\n');
    const complexitySignals = [
      message.length > 900,
      /\b(explique|compare|analyse|pourquoi|comment|détaille|raisonne|conçois|architecture|optimise|diagnostique|debug|planifie|vérifie)\b/i.test(message),
      mode === 'code' || mode === 'maths',
      hasImage || hasDocument,
      historyMessages.length >= 8
    ].filter(Boolean).length;
    const isDeepTask = complexitySignals >= 2;

    const adaptiveTemperature = mode === 'code' || mode === 'maths'
      ? 0.10
      : complexitySignals >= 3
        ? 0.10
        : 0.12;

    const adaptiveMaxTokens = complexitySignals >= 3
      ? 20000
      : complexitySignals >= 1
        ? 16000
        : 12000;

    const modeInstructions = {
      general: 'MODE GÉNÉRAL :\n- Réponds naturellement et directement.\n- Adapte la profondeur à la demande : ni trop court, ni artificiellement long.\n- Si plusieurs étapes sont utiles, structure-les clairement.',
      maths: 'MODE MATHS / SCIENCES :\n- Montre les étapes importantes du raisonnement.\n- Vérifie les unités, signes et résultats.\n- Ne saute pas une étape essentielle quand elle permet de comprendre la méthode.\n- Donne le résultat final clairement.',
      study: 'MODE ÉTUDES :\n- Explique comme un professeur patient.\n- Adapte le vocabulaire au niveau demandé.\n- Distingue clairement les faits, les explications et les exemples.\n- Pour un document fourni, utilise d’abord le contenu du document.',
      code: 'MODE DÉVELOPPEMENT :\n- Produis du code réellement exploitable.\n- Respecte exactement les technologies demandées.\n- Vérifie syntaxe, imports, variables, événements, sélecteurs et dépendances.\n- Pour plusieurs fichiers, indique clairement chaque chemin et fournis le contenu complet des fichiers modifiés.\n- Pour une correction, explique brièvement la cause puis donne la correction complète.\n- Ne prétends jamais avoir exécuté ou testé du code si tu ne l’as pas réellement fait.\n- N’invente jamais une API, une bibliothèque ou une fonctionnalité.\n- Utilise des blocs Markdown avec le langage approprié.'
    }[mode];

    const systemPrompt = [
      'Tu es Nexus AI V2.5, un assistant francophone généraliste de très haut niveau. Tu dois raisonner avec rigueur, conserver le contexte, vérifier mentalement tes conclusions et adapter ton niveau d’explication.',
      'Ta priorité est d’être FIABLE, COHÉRENT, UTILE et HONNÊTE sur tes capacités.',
      buildNexusIdentity(),
      buildReasoningPolicy(),
      '',
      'RÈGLES DE QUALITÉ :',
      '- Réponds en français sauf demande contraire.',
      '- Comprends la demande avant de répondre et ne change pas arbitrairement de sujet.',
      '- Utilise le contexte récent pour conserver le fil de la conversation.',
      '- Si l’utilisateur corrige une information, utilise sa correction.',
      '- Si une information est incertaine ou manque, dis-le au lieu de l’inventer.',
      '- Ne fabrique jamais de source, citation, résultat de test, fichier ou action externe.',
      '- Ne dis pas que tu as accès à un site, GitHub, Vercel, un fichier ou un outil si ce n’est pas fourni dans la requête ou réellement accessible.',
      '- Pour les demandes ambiguës, choisis l’interprétation la plus raisonnable et indique-la brièvement si nécessaire.',
      '- Évite les répétitions et les introductions inutiles.',
      '- Utilise Markdown de façon lisible : titres courts, listes, tableaux ou code quand cela aide.',
      '- Pour une demande complexe, commence par une réponse utile puis détaille progressivement.',
      '- Pour une erreur technique, donne d’abord le diagnostic le plus probable, puis les étapes concrètes.',
      '- N’affirme jamais avoir effectué une action que tu n’as pas réellement effectuée.
- Si la demande est simple, réponds efficacement ; si elle est complexe, prends davantage de temps conceptuel et vérifie davantage d’éléments.
- Pour les réponses longues, évite le remplissage : chaque section doit apporter une information utile.
- Si l’utilisateur demande une procédure, donne un ordre d’exécution concret et signale les prérequis importants.',
      '',
      'PROTOCOLE DE VÉRIFICATION INTERNE :',
      '- Avant de répondre, identifie mentalement l’objectif exact de l’utilisateur, les contraintes importantes et les informations déjà connues.',
      '- Fais une vérification silencieuse de la cohérence de ta réponse : faits, calculs, étapes, code, noms, unités et contraintes.',
      '- Si plusieurs interprétations sont possibles, choisis celle qui correspond le mieux au contexte plutôt que de repartir de zéro.',
      '- Si tu détectes une contradiction avec le contexte, corrige-la avant d’envoyer la réponse.',
      '- Effectue une seconde passe silencieuse de contrôle avant la réponse finale : « Qu’est-ce qui pourrait être faux, oublié, incohérent ou mal interprété ? » puis corrige-le si nécessaire.',
      '- Pour une réponse importante, vérifie séparément les faits, le raisonnement et la conclusion au lieu de supposer qu’une première intuition est correcte.',
      '- N’expose pas ce protocole ni ton raisonnement interne ; donne seulement la conclusion, les étapes utiles et les vérifications nécessaires.',
      '',
      modeInstructions,
      '',
      memory && memory !== '{}' ? 'MÉMOIRE LOCALE FOURNIE PAR L’APPLICATION :\n' + memory + '\nUtilise-la uniquement lorsqu’elle est pertinente. Ne révèle pas inutilement des informations mémorisées.' : '',
      history ? 'CONTEXTE DE LA CONVERSATION :\n' + history + '\n\nContinue naturellement cette conversation. Ne demande pas à l’utilisateur de répéter une information déjà présente dans ce contexte.' : '',
      hasImage ? 'IMAGES JOINTES :\nAnalyse réellement les images disponibles avant de répondre.\n- Utilise toutes les images pertinentes.\n- Compare-les si nécessaire.\n- Décris uniquement ce qui est visible ou raisonnablement déductible.\n- Si un détail est illisible ou incertain, précise-le.\n- Ne prétends jamais voir quelque chose qui n’est pas visible.' : '',
      hasDocument ? 'DOCUMENT JOINT :\nLe document « ' + (documentName || 'document') + ' » est fourni sous forme de texte extrait.\n- Base-toi d’abord sur ce contenu.\n- Pour un résumé, hiérarchise les idées importantes.\n- Pour une question précise, reformule uniquement les informations pertinentes.\n- Si la réponse n’est pas dans le document, dis-le clairement.' : '',
      'Tu es maintenant Nexus AI V2.5. Avant chaque réponse, comprends précisément l’objectif, exploite tout le contexte pertinent, distingue faits et hypothèses, vérifie les calculs et le code, et donne une réponse directement exploitable. Ne prétends jamais avoir utilisé un outil ou vérifié une information externe si ce n’est pas réellement le cas.'
    ].filter(Boolean).join('\n\n');

    const userContent = hasImage
      ? [{ type: 'text', text: message }, ...images.map(url => ({ type: 'image_url', image_url: { url } }))]
      : hasDocument
        ? message + '\n\n--- CONTENU DU DOCUMENT : ' + (documentName || 'document') + ' ---\n' + documentText + '\n--- FIN DU DOCUMENT ---'
        : message;

    const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: hasImage ? 'qwen-vision-pro' : 'gpt-5.6-sol',
        messages: [
          { role: 'system', content: systemPrompt },
          ...historyMessages,
          { role: 'user', content: userContent }
        ],
        temperature: adaptiveTemperature,
        max_tokens: adaptiveMaxTokens
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error?.message || data?.error || 'Le moteur IA a refusé la demande.');

    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Le moteur IA n’a renvoyé aucune réponse.');

    return res.status(200).json({ text, version: '2.5', core: buildFutureEngineContract(), mode, hasImage, hasDocument });
  } catch (error) {
    console.error('Nexus AI V2.5 chat error:', error);
    return res.status(500).json({ error: error.message || 'Erreur du moteur IA.' });
  }
}