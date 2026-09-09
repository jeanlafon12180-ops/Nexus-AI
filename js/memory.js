export const MEMORY_KEY = 'nexus_ia_memory_v07';
export const CHAT_KEY = 'nexus_ia_conversation_v07';

export function createMemory() {
    return { prenom: '', ville: '', preferences: {}, notes: [] };
}

function read(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

export function loadMemory() {
    const value = read(MEMORY_KEY, createMemory());
    return value && typeof value === 'object' ? { ...createMemory(), ...value } : createMemory();
}

export function saveMemory(memory) {
    try { localStorage.setItem(MEMORY_KEY, JSON.stringify(memory)); } catch {}
}

export function loadConversation() {
    const value = read(CHAT_KEY, []);
    return Array.isArray(value) ? value : [];
}

export function saveConversation(conversation) {
    try { localStorage.setItem(CHAT_KEY, JSON.stringify(conversation.slice(-150))); } catch {}
}

export function clearConversation() {
    try { localStorage.removeItem(CHAT_KEY); } catch {}
}

export function clearMemory() {
    try { localStorage.removeItem(MEMORY_KEY); } catch {}
}
