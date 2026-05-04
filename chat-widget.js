(function() {
  const ENDPOINT = 'https://shotfactory-chat-886493114748.europe-west1.run.app/chat';
  
  const styles = `
    #sf-chat-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #7c3aed);
      border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(99,102,241,0.5);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; transition: transform 0.2s;
    }
    #sf-chat-btn:hover { transform: scale(1.1); }
    #sf-chat-window {
      position: fixed; bottom: 90px; right: 24px; z-index: 9999;
      width: 360px; height: 500px; border-radius: 16px; overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      display: none; flex-direction: column;
      background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1);
      font-family: 'Segoe UI', sans-serif;
    }
    #sf-chat-window.open { display: flex; }
    #sf-chat-header {
      padding: 16px; background: rgba(99,102,241,0.15);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; gap: 10px;
    }
    #sf-chat-header span { color: #fff; font-weight: 600; font-size: 15px; }
    .sf-dot { width: 8px; height: 8px; border-radius: 50%; background: #34d399; margin-left: auto; box-shadow: 0 0 6px #34d399; }
    #sf-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
    }
    #sf-messages::-webkit-scrollbar { width: 4px; }
    #sf-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
    .sf-msg { max-width: 85%; padding: 10px 13px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
    .sf-msg.bot { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); border-radius: 12px 12px 12px 3px; }
    .sf-msg.user { background: linear-gradient(135deg, #6366f1, #7c3aed); color: #fff; margin-left: auto; border-radius: 12px 12px 3px 12px; }
    #sf-input-area {
      padding: 12px; border-top: 1px solid rgba(255,255,255,0.08);
      display: flex; gap: 8px;
    }
    #sf-input {
      flex: 1; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; padding: 9px 12px; color: #fff; font-size: 13px;
      font-family: inherit; resize: none; outline: none;
    }
    #sf-send {
      width: 38px; height: 38px; border-radius: 10px; border: none;
      background: linear-gradient(135deg, #6366f1, #7c3aed);
      color: #fff; cursor: pointer; font-size: 16px;
      display: flex; align-items: center; justify-content: center;
    }
    #sf-send:disabled { opacity: 0.4; }
    .sf-typing { display: flex; gap: 4px; padding: 4px 2px; }
    .sf-typing span { width: 6px; height: 6px; border-radius: 50%; background: #6366f1; animation: sfBounce 1.2s infinite; }
    .sf-typing span:nth-child(2) { animation-delay: 0.2s; }
    .sf-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes sfBounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-5px);opacity:1} }
  `;

  const SYSTEM = `Ти си асистент на ShotFactory — Windows десктоп приложение за автоматична обработка на продуктови снимки за e-commerce. Отговаряй само на въпроси свързани с ShotFactory. Бъди конкретен и кратък. Отговаряй на езика на потребителя.`;

  let messages = [];

  function init() {
    const style = document.createElement('style');
    style.textContent = styles;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'sf-chat-btn';
    btn.innerHTML = '💬';
    btn.onclick = toggleChat;

    const win = document.createElement('div');
    win.id = 'sf-chat-window';
    win.innerHTML = `
      <div id="sf-chat-header">
        <span>📸</span>
        <span>ShotFactory Assistant</span>
        <div class="sf-dot"></div>
      </div>
      <div id="sf-messages"></div>
      <div id="sf-input-area">
        <textarea id="sf-input" rows="1" placeholder="Задай въпрос..."></textarea>
        <button id="sf-send">↑</button>
      </div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(win);

    document.getElementById('sf-send').onclick = sendMessage;
    document.getElementById('sf-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    addMessage('bot', 'Здравей! Мога да отговоря на въпроси за ShotFactory. С какво мога да помогна?');
  }

  function toggleChat() {
    const win = document.getElementById('sf-chat-window');
    win.classList.toggle('open');
  }

  function addMessage(type, text) {
    const msgs = document.getElementById('sf-messages');
    const div = document.createElement('div');
    div.className = `sf-msg ${type}`;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function showTyping() {
    const msgs = document.getElementById('sf-messages');
    const div = document.createElement('div');
    div.className = 'sf-msg bot';
    div.innerHTML = '<div class="sf-typing"><span></span><span></span><span></span></div>';
    div.id = 'sf-typing';
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
      const reply = data.reply || 'Нещо се обърка. Опитай отново.';
      addMessage('bot', reply);
      messages.push({ role: 'assistant', content: reply });
    } catch {
      hideTyping();
      addMessage('bot', 'Грешка при свързване. Опитай отново.');
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