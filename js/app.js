import { createBrain } from './brain.js';
import {
  loadConversation,
  saveConversation,
  clearConversation,
  clearMemory,
  createMemory,
  saveMemory,
  getDeviceId
} from './memory.js';

const brain = createBrain();
const chat = document.getElementById('chat');
const input = document.getElementById('messageInput');
const send = document.getElementById('sendButton');
const deviceId = getDeviceId();
let history = loadConversation();

function html(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function show(text, type, persist = true) {
  const row = document.createElement('div');
  row.className = `message-row ${type}`;
  const bubble = document.createElement('div');
  bubble.className = `bubble ${type}`;
  bubble.innerHTML = html(text);
  row.appendChild(bubble);
  chat.appendChild(row);

  if (persist) {
    history.push({ text: String(text), type, time: Date.now() });
    history = history.slice(-150);
    saveConversation(history);
  }

  chat.scrollTop = chat.scrollHeight;
}

function render() {
  chat.innerHTML = '';

  if (!history.length) {
    show(
      'Bonjour ! 👋\n\nJe suis **Nexus IA V0.8**, ton assistant intelligent.\n🖥️ Cette conversation et ma mémoire sont enregistrées séparément sur cet appareil.\n\nPose-moi une question pour commencer ! 🚀',
      'nexus',
      false
    );
    return;
  }

  history.forEach(item => {
    if (item && typeof item.text === 'string' && (item.type === 'user' || item.type === 'nexus')) {
      show(item.text, item.type, false);
    }
  });
}

function splitQuestions(text) {
  return String(text)
    .replace(/\r/g, '')
    .split(/\n/)
    .map(line => line.trim())
    .map(line => line.replace(/^[-•*]\s+/, '').replace(/^\d+[.)]\s+/, '').trim())
    .filter(Boolean);
}

function setBusy(value) {
  send.disabled = value;
  input.disabled = value;
}

async function sendText(text) {
  if (send.disabled) return;

  const questions = splitQuestions(text);
  if (!questions.length) return;

  input.value = '';
  input.style.height = 'auto';
  setBusy(true);

  try {
    questions.forEach(question => show(question, 'user'));

    for (const question of questions) {
      await new Promise(resolve => setTimeout(resolve, 120));
      const answer = brain.reply(question);
      show(answer, 'nexus');
    }
  } catch (error) {
    console.error('Nexus IA error:', error);
    show('⚠️ Une erreur est survenue. Recharge la page puis réessaie.', 'nexus');
  } finally {
    setBusy(false);
    input.focus();
  }
}

function memoryView() {
  const memory = brain.getMemory();
  const items = [];
  if (memory.prenom) items.push(`Prénom : ${memory.prenom}`);
  if (memory.ville) items.push(`Ville : ${memory.ville}`);

  return items.length
    ? `🧠 **Mémoire de cet appareil**\n\n${items.join('\n')}\n\n🖥️ Appareil : ${deviceId.slice(0, 8)}`
    : `🧠 **Mémoire de cet appareil**\n\nMa mémoire est encore vide.\n\n🖥️ Appareil : ${deviceId.slice(0, 8)}`;
}

document.querySelectorAll('.suggestion').forEach(button => {
  button.addEventListener('click', () => sendText(button.textContent));
});

send.addEventListener('click', () => sendText(input.value));

input.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendText(input.value);
  }
});

input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 220)}px`;
});

document.getElementById('memoryButton').addEventListener('click', () => {
  show(memoryView(), 'nexus');
});

document.getElementById('helpButton').addEventListener('click', () => {
  show(brain.reply('Que peux-tu faire ?'), 'nexus');
});

document.getElementById('clearButton').addEventListener('click', () => {
  history = [];
  clearConversation();
  render();
});

document.getElementById('clearMemoryButton').addEventListener('click', () => {
  clearMemory();
  saveMemory(createMemory());
  show('🧹 La mémoire de **cet appareil** a été effacée.','nexus');
});

window.addEventListener('error', event => {
  console.error('Nexus IA runtime error:', event.error || event.message);
});

render();
