(function () {
  const ENDPOINT = 'https://shotfactory-chat-886493114748.europe-west1.run.app/chat';

  const STRINGS = {
    bg: {
      greeting:    'Здравей! Мога да отговоря на въпроси за ShotFactory. С какво мога да помогна?',
      placeholder: 'Задай въпрос...',
      online:      'Онлайн',
      error:       'Грешка при свързване. Опитай отново.',
    },
    en: {
      greeting:    'Hi! I can answer questions about ShotFactory. How can I help?',
      placeholder: 'Ask a question...',
      online:      'Online',
      error:       'Connection error. Please try again.',
    }
  };

  const MINT        = '#a7f3d0';  // светло зелено — фон на хедъра и бутоните
  const MINT_HOVER  = '#86efac';  // малко по-тъмно при hover
  const MINT_TEXT   = '#064e3b';  // тъмнозелен текст върху mint фон
  const GREEN_DOT   = '#22c55e';  // ярко зелено за online

  function getLang() {
    return document.documentElement.lang === 'bg' ? 'bg' : 'en';
  }

  const styles = `
    #sf-chat-btn {
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      width: 52px; height: 52px; border-radius: 50%;
      background: ${MINT}; border: none; cursor: pointer;
      box-shadow: 0 4px 20px rgba(167,243,208,0.5);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; transition: transform 0.2s, box-shadow 0.2s;
      color: ${MINT_TEXT}; font-weight: 700;
    }
    #sf-chat-btn:hover {
      transform: scale(1.08);
      background: ${MINT_HOVER};
      box-shadow: 0 6px 28px rgba(167,243,208,0.6);
    }
    #sf-chat-window {
      position: fixed; bottom: 92px; right: 28px; z-index: 9999;
      width: 360px; height: 480px; border-radius: 18px; overflow: hidden;
      box-shadow: 0 12px 48px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06);
      display: none; flex-direction: column;
      background: #ffffff; border: 1px solid #d1fae5;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    #sf-chat-window.open { display: flex; }
    #sf-chat-header {
      padding: 14px 16px;
      background: ${MINT};
      display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }
    #sf-chat-header-info { flex: 1; }
    #sf-chat-header-title {
      color: ${MINT_TEXT}; font-weight: 700; font-size: 14px; line-height: 1.2;
    }
    #sf-chat-header-sub {
      display: flex; align-items: center; gap: 5px; margin-top: 3px;
    }
    .sf-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: ${GREEN_DOT}; box-shadow: 0 0 6px ${GREEN_DOT}; flex-shrink: 0;
    }
    #sf-online-label {
      color: ${MINT_TEXT}; font-size: 11px; font-weight: 600; opacity: 0.8;
    }
    #sf-chat-close {
      background: none; border: none; color: ${MINT_TEXT};
      font-size: 19px; cursor: pointer; padding: 0; line-height: 1;
      opacity: 0.6; transition: opacity 0.15s;
    }
    #sf-chat-close:hover { opacity: 1; }
    #sf-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px; background: #f8fafc;
    }
    #sf-messages::-webkit-scrollbar { width: 3px; }
    #sf-messages::-webkit-scrollbar-thumb { background: #d1fae5; border-radius: 2px; }
    .sf-msg { max-width: 84%; padding: 9px 13px; font-size: 13.5px; line-height: 1.55; }
    .sf-msg.bot {
      background: #ffffff; color: #18181b; border: 1px solid #e4e4e7;
      border-radius: 14px 14px 14px 3px; align-self: flex-start;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }
    .sf-msg.user {
      background: ${MINT}; color: ${MINT_TEXT};
      border-radius: 14px 14px 3px 14px; align-self: flex-end;
      font-weight: 500;
    }
    #sf-input-area {
      padding: 10px 12px; border-top: 1px solid #d1fae5;
      display: flex; gap: 8px; align-items: flex-end;
      background: #ffffff; flex-shrink: 0;
    }
    #sf-input {
      flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0;
      border-radius: 10px; padding: 9px 12px; color: #18181b;
      font-size: 13.5px; font-family: inherit; resize: none; outline: none;
      line-height: 1.4; transition: border-color 0.15s;
    }
    #sf-input:focus { border-color: ${MINT_HOVER}; }
    #sf-input::placeholder { color: #a1a1aa; }
    #sf-send {
      width: 36px; height: 36px; border-radius: 10px; border: none;
      background: ${MINT}; color: ${MINT_TEXT}; cursor: pointer; font-size: 16px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 0.15s, opacity 0.15s;
      font-weight: 700;
    }
    #sf-send:hover:not(:disabled) { background: ${MINT_HOVER}; }
    #sf-send:disabled { opacity: 0.35; cursor: not-allowed; }
    .sf-typing { display: flex; gap: 4px; padding: 3px 2px; }
    .sf-typing span {
      width: 6px; height: 6px; border-radius: 50%; background: #a1a1aa;
      animation: sfBounce 1.2s infinite;
    }
    .sf-typing span:nth-child(2) { animation-delay: 0.2s; }
    .sf-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes sfBounce {
      0%,80%,100% { transform: translateY(0); opacity: .4; }
      40% { transform: translateY(-5px); opacity: 1; }
    }
    @media (max-width: 480px) {
      #sf-chat-window { width: calc(100vw - 24px); right: 12px; bottom: 80px; }
      #sf-chat-btn { right: 16px; bottom: 20px; }
    }
  `;

  let messages = [];
  let initialized = false;

  function updateLangUI() {
    const lang = getLang();
    const s = STRINGS[lang];
    const input = document.getElementById('sf-input');
    const onlineLabel = document.getElementById('sf-online-label');
    if (input) input.placeholder = s.placeholder;
    if (onlineLabel) onlineLabel.textContent = s.online;
  }

  function init() {
    if (initialized) return;
    initialized = true;

    const style = document.createElement('style');
    style.textContent = styles;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'sf-chat-btn';
    btn.innerHTML = '💬';
    btn.setAttribute('aria-label', 'Open chat');
    btn.onclick = toggleChat;

    const win = document.createElement('div');
    win.id = 'sf-chat-window';
    const lang = getLang();
    const s = STRINGS[lang];

    win.innerHTML = `
      <div id="sf-chat-header">
        <div id="sf-chat-header-info">
          <div id="sf-chat-header-title">ShotFactory Assistant</div>
          <div id="sf-chat-header-sub">
            <div class="sf-dot"></div>
            <span id="sf-online-label">${s.online}</span>
          </div>
        </div>
        <button id="sf-chat-close" aria-label="Close">✕</button>
      </div>
      <div id="sf-messages"></div>
      <div id="sf-input-area">
        <textarea id="sf-input" rows="1" placeholder="${s.placeholder}"></textarea>
        <button id="sf-send">↑</button>
      </div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(win);

    document.getElementById('sf-send').onclick = sendMessage;
    document.getElementById('sf-chat-close').onclick = closeChat;
    document.getElementById('sf-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    addMessage('bot', STRINGS[getLang()].greeting);

    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
      langBtn.addEventListener('click', function () {
        setTimeout(updateLangUI, 50);
      });
    }
  }

  function toggleChat() {
    const win = document.getElementById('sf-chat-window');
    if (win.classList.contains('open')) {
      closeChat();
    } else {
      win.classList.add('open');
      document.getElementById('sf-chat-btn').innerHTML = '✕';
      setTimeout(() => document.getElementById('sf-input')?.focus(), 100);
    }
  }

  function closeChat() {
    document.getElementById('sf-chat-window').classList.remove('open');
    document.getElementById('sf-chat-btn').innerHTML = '💬';
  }

  function addMessage(type, text) {
    const msgs = document.getElementById('sf-messages');
    const div = document.createElement('div');
    div.className = `sf-msg ${type}`;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const msgs = document.getElementById('sf-messages');
    const div = document.createElement('div');
    div.className = 'sf-msg bot';
    div.id = 'sf-typing';
    div.innerHTML = '<div class="sf-typing"><span></span><span></span><span></span></div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('sf-typing');
    if (t) t.remove();
  }

  async function sendMessage() {
    const input = document.getElementById('sf-input');
    const send = document.getElementById('sf-send');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    send.disabled = true;
    addMessage('user', text);
    messages.push({ role: 'user', content: text });
    showTyping();

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      const data = await res.json();
      hideTyping();
      const reply = data.reply || STRINGS[getLang()].error;
      addMessage('bot', reply);
      messages.push({ role: 'assistant', content: reply });
    } catch {
      hideTyping();
      addMessage('bot', STRINGS[getLang()].error);
    } finally {
      send.disabled = false;
      input.focus();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
