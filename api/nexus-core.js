const VERSION = '3.1.0';

export function buildNexusIdentity() {
  return [
    'IDENTITÉ NEXUS CORE V3.1 : tu es le moteur central de Nexus IA.',
    'Tu analyses l’objectif, les contraintes, le contexte et les outils disponibles avant de choisir une stratégie.',
    'Tu restes honnête : aucune action, vérification, navigation, exécution ou observation ne doit être prétendue si elle n’a pas réellement eu lieu.'
  ].join('\n');
}

export function buildReasoningPolicy() {
  return [
    'POLITIQUE NEXUS CORE V3.1 :',
    '- Décompose mentalement les tâches complexes en étapes utiles avant de répondre.',
    '- Pour une mission, identifie objectif, sous-objectifs, dépendances, contraintes et critères de réussite.',
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
    missionEngine: '3.1',
    privacyBoundary: 'session-scoped',
    verification: true,
    multimodalReady: true
  };
}

function uniqueSteps(steps) {
  return [...new Set(steps)].slice(0, 6);
}

export function planMission(message) {
  const text = String(message || '').trim();
  const lower = text.toLowerCase();
  const isMission = text.length > 350 ||
    /\b(site|application|projet|système|architecture|workflow|diagnostic|audit|comparaison|organise|planifie|construis|développe|réalise|crée)\b/i.test(text);

  if (!isMission) {
    return {
      isMission: false,
      type: 'simple',
      priority: 'normal',
      steps: ['Comprendre la demande', 'Répondre']
    };
  }

  const steps = ['Comprendre l’objectif et les contraintes'];

  if (/\b(site|application|projet|système|architecture|workflow|code|roblox|programme|développe)\b/i.test(lower)) {
    steps.push('Définir l’architecture et les composants');
    steps.push('Construire ou modifier les éléments nécessaires');
  } else if (/\b(compare|comparaison|choisir|différence|analyse|audit)\b/i.test(lower)) {
    steps.push('Identifier les critères et les informations utiles');
    steps.push('Comparer les éléments de façon structurée');
  } else if (/\b(plan|organise|planifie|voyage|programme|planning)\b/i.test(lower)) {
    steps.push('Structurer les étapes, contraintes et dépendances');
    steps.push('Construire un plan exécutable');
  } else {
    steps.push('Décomposer le problème en sous-tâches');
    steps.push('Produire la solution étape par étape');
  }

  steps.push('Vérifier la cohérence du résultat');
  steps.push('Présenter le résultat et les prochaines actions utiles');

  return {
    isMission: true,
    type: 'mission',
    priority: text.length > 1200 ? 'high' : 'normal',
    steps: uniqueSteps(steps)
  };
}
