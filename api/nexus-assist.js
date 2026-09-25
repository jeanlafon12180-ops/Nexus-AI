function clean(value, max = 5000) {
  return String(value || '').replace(/\u0000/g, '').trim().slice(0, max);
}

export function buildContextSupport({ message, mode, history = [], memory = '', documentText = '', documentName = '' }) {
  const text = clean(message, 8000);
  const lower = text.toLowerCase();
  const ambiguitySignals = [
    text.length < 20,
    /\b(ça|cela|lui|elle|ils|elles|ça marche|comme ça|le truc|ce truc|celui-ci|celui-là|ici|là)\b/i.test(text) && history.length === 0,
    /\b(explique|aide-moi|fais|corrige|résous|analyse)\b/i.test(text) && text.split(/\s+/).length < 8,
    /\b(je comprends pas|comprends pas|je sais pas|aucune idée|pas compris)\b/i.test(text)
  ].filter(Boolean).length;

  const hints = [];
  if (mode) hints.push('Mode détecté : ' + mode + '.');
  if (history.length) hints.push('Un historique récent est disponible : utiliser les derniers échanges pour résoudre les références courtes et les informations déjà données.');
  if (memory && memory !== '{}') hints.push('Une mémoire locale pertinente peut être disponible : ne l’utiliser que si elle correspond réellement à la demande.');
  if (documentText) hints.push('Le document fourni est une source prioritaire pour les faits qu’il contient.');
  if (documentName) hints.push('Document actif : ' + clean(documentName, 160) + '.');
  if (ambiguitySignals >= 2) hints.push('La demande présente des signaux d’ambiguïté : reformuler mentalement l’objectif et utiliser le contexte avant de répondre.');

  return {
    needed: ambiguitySignals >= 2 || Boolean(documentText) || history.length >= 6,
    ambiguityScore: ambiguitySignals,
    support: hints.join('\n') || 'Aucun contexte supplémentaire déterministe nécessaire.'
  };
}

export function buildVerificationPrompt({ userMessage, draft, mode }) {
  return [
    'Tu es le vérificateur interne de Nexus Core V3.4.',
    'Ne révèle jamais de raisonnement privé. Analyse uniquement la qualité du brouillon ci-dessous.',
    'Signale seulement les erreurs factuelles, contradictions avec la demande, oublis importants ou corrections nécessaires.',
    'Si le brouillon est correct, réponds exactement : OK.',
    'Si des corrections sont nécessaires, donne une liste courte et exploitable, sans réécrire toute la réponse.',
    'Mode : ' + clean(mode, 40),
    'Demande utilisateur :\n' + clean(userMessage, 8000),
    'Brouillon Nexus :\n' + clean(draft, 12000)
  ].join('\n\n');
}

export function buildCorrectionPrompt({ userMessage, draft, review }) {
  return [
    'Tu es Nexus AI V3.4 en phase de correction finale.',
    'Corrige uniquement les problèmes signalés par le vérificateur. Conserve les éléments corrects du brouillon.',
    'Réponds directement à l’utilisateur. Ne parle pas du processus interne de vérification.',
    'Demande :\n' + clean(userMessage, 8000),
    'Brouillon :\n' + clean(draft, 14000),
    'Corrections du vérificateur :\n' + clean(review, 5000)
  ].join('\n\n');
}

export function isUsefulReview(review) {
  const value = clean(review, 5000);
  if (!value || /^OK[.!]?$/i.test(value)) return false;
  return !/^aucune correction|pas de correction|rien à corriger/i.test(value);
}


export function selectSpecializedAgent(message, mode = 'general') {
  const text = String(message || '').toLowerCase();
  if (mode === 'code' || /\b(cod(e|er)|javascript|typescript|python|html|css|react|next\.js|api|bug|debug|github|roblox|lua)\b/i.test(text)) {
    return { id: 'code', name: 'Nexus Code Agent', instruction: 'Spécialiste développement : produire du code exploitable, vérifier architecture, syntaxe, imports et cohérence.' };
  }
  if (mode === 'maths' || /\b(math|maths|calcul|équation|pythagore|cosinus|sinus|géométrie|physique|chimie)\b/i.test(text)) {
    return { id: 'science', name: 'Nexus Science Agent', instruction: 'Spécialiste sciences : raisonner étape par étape, vérifier calculs, unités et résultats.' };
  }
  if (/\b(cours|devoir|exercice|histoire|géographie|français|anglais|révision|révise|école|collège)\b/i.test(text)) {
    return { id: 'study', name: 'Nexus Study Agent', instruction: 'Spécialiste études : expliquer clairement, adapter le niveau et distinguer faits, méthode et exemple.' };
  }
  if (/\b(analyse|compare|comparaison|document|résume|résumé|rapport)\b/i.test(text)) {
    return { id: 'analysis', name: 'Nexus Analysis Agent', instruction: 'Spécialiste analyse : extraire les informations utiles, structurer les éléments et signaler les incertitudes.' };
  }
  return { id: 'general', name: 'Nexus General Agent', instruction: 'Assistant généraliste : répondre directement et choisir la méthode la plus adaptée à la demande.' };
}
