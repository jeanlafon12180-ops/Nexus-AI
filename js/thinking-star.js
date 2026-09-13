(() => {
  let thinking = null;
  let active = 0;

  function startThinking() {
    active += 1;
    if (thinking) return;

    const chat = document.getElementById('chat');
    if (!chat) return;

    const row = document.createElement('div');
    row.className = 'message-row nexus thinking-row';
    const bubble = document.createElement('div');
    bubble.className = 'bubble nexus thinking-bubble';
    bubble.innerHTML = '<div class="thinking-star" aria-label="Nexus AI réfléchit" role="status">✦</div>';
    row.appendChild(bubble);
    chat.appendChild(row);
    thinking = row;
    chat.scrollTop = chat.scrollHeight;
  }

  function stopThinking() {
    active = Math.max(0, active - 1);
    if (active !== 0 || !thinking) return;
    thinking.remove();
    thinking = null;
  }

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const requestUrl = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    const isAIRequest = /\/api\/chat(?:\?|$)/.test(requestUrl);

    if (!isAIRequest) return originalFetch(...args);

    startThinking();
    try {
      return await originalFetch(...args);
    } finally {
      stopThinking();
    }
  };
})();
