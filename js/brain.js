import { loadMemory } from './memory.js';

// Le cerveau local historique a été retiré.
// Nexus AI utilise maintenant /api/chat pour les réponses IA réelles.
export function createBrain(){
  return {
    reply: () => null,
    getMemory: () => loadMemory(),
    getContext: () => []
  };
}
