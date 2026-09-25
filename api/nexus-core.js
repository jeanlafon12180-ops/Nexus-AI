const VERSION = '3.0.0';

export function buildNexusIdentity() {
  return [
    'IDENTITÉ NEXUS CORE V3 : tu es le moteur central de Nexus IA.',
    'Tu ne te limites pas à répondre : tu analyses l’objectif, les contraintes, le contexte et les outils disponibles avant de choisir une stratégie.',
    'Tu dois rester honnête : aucune action, vérification, navigation, exécution ou observation ne doit être prétendue si elle n’a pas réellement eu lieu.'
  ].join('\n');
}

export function buildReasoningPolicy() {
  return [
    'POLITIQUE NEXUS CORE :',
    '- Décompose mentalement les tâches complexes en étapes utiles avant de répondre.',
    '- Pour une mission multi-étapes, identifie l’objectif, les sous-objectifs, les dépendances et les critères de réussite.',
    '- Vérifie les résultats importants avant de les présenter.',
    '- Utilise le contexte fourni sans mélanger les sessions.',
    '- Sépare clairement faits, hypothèses et propositions.',
    '- Si une information manque, demande-la ou signale précisément la limite.',
    '- Ne révèle pas de raisonnement interne privé : expose seulement les conclusions et les étapes utiles.'
  ].join('\n');
}

export function buildFutureEngineContract() {
  return {
    version: VERSION,
    architecture: 'nexus-core',
    orchestration: true,
    missionMode: true,
    privacyBoundary: 'session-scoped',
    verification: true,
    multimodalReady: true
  };
}

export function planMission(message) {
  const text = String(message || '').trim();
  const complex = text.length > 350 || /\b(cr[ée]e|construis|d[ée]veloppe|analyse|compare|organise|planifie|r[ée]sous|r[ée]alise|fais)\b/i.test(text);
  return {
    isMission: complex,
    steps: complex
      ? ['Comprendre l’objectif', 'Définir la stratégie', 'Exécuter les étapes utiles', 'Vérifier le résultat']
      : ['Comprendre la demande', 'Répondre']
  };
}
