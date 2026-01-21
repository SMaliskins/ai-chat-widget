// AI Chat Widget - Standalone Version
(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiUrl: 'https://shopify.dev/apps/default-app-home/api/chat', // Замените на ваш URL
    primaryColor: '#3b82f6',
    position: 'bottom-right',
    businessName: 'IZO Art',
    welcomeMessage: 'Здравствуйте! Я AI-ассистент. Чем могу помочь?'
  };

  // Styles
  const styles = `
    .ai-chat-button {
      position: fixed;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${CONFIG.primaryColor};
      border: none;
      color: white;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      transition: transform 0.2s;
      ${CONFIG.position === 'bottom-right' ? 'bottom: 24px; right: 24px;' : 'bottom: 24px; left: 24px;'}
    }
    .ai-chat-button:hover {
      transform: scale(1.1);
    }
    .ai-chat-button svg {
      width: 24px;
      height: 24px;
    }
    .ai-chat-window {
      position: fixed;
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 100px);
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      display: none;
      flex-direction: column;
      z-index: 9999;
      ${CONFIG.position === 'bottom-right' ? 'bottom: 24px; right: 24px;' : 'bottom: 24px; left: 24px;'}
    }
    .ai-chat-window.open {
      display: flex;
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .ai-chat-header {
      padding: 16px 20px;
      background: ${CONFIG.primaryColor};
      color: white;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ai-chat-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    .ai-chat-header p {
      margin: 0;
      font-size: 12px;
      opacity: 0.9;
    }
    .ai-chat-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
    }
    .ai-chat-close:hover {
      background: rgba(255,255,255,0.2);
    }
    .ai-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f9fafb;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .ai-chat-message {
      display: flex;
      flex-direction: column;
      max-width: 80%;
      animation: messageIn 0.3s ease-out;
    }
    @keyframes messageIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .ai-chat-message.user {
      align-self: flex-end;
    }
    .ai-chat-message.assistant {
      align-self: flex-start;
    }
    .ai-chat-message-content {
      padding: 12px 16px;
      border-radius: 12px;
      line-height: 1.5;
      font-size: 14px;
    }
    .ai-chat-message.user .ai-chat-message-content {
      background: ${CONFIG.primaryColor};
      color: white;
      border-bottom-right-radius: 4px;
    }
    .ai-chat-message.assistant .ai-chat-message-content {
      background: white;
      color: #1f2937;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .ai-chat-typing {
      display: flex;
      gap: 4px;
      padding: 4px 0;
    }
    .ai-chat-typing span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #9ca3af;
      animation: typing 1.4s infinite;
    }
    .ai-chat-typing span:nth-child(2) { animation-delay: 0.2s; }
    .ai-chat-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-10px); opacity: 1; }
    }
    .ai-chat-input {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background: white;
      border-radius: 0 0 12px 12px;
      display: flex;
      gap: 8px;
    }
    .ai-chat-input input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
    }
    .ai-chat-input input:focus {
      border-color: ${CONFIG.primaryColor};
    }
    .ai-chat-input button {
      padding: 10px 14px;
      border: none;
      border-radius: 8px;
      background: ${CONFIG.primaryColor};
      color: white;
      cursor: pointer;
    }
    .ai-chat-input button:hover {
      opacity: 0.9;
    }
    .ai-chat-input button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    @media (max-width: 480px) {
      .ai-chat-window {
        width: calc(100vw - 32px);
        height: calc(100vh - 100px);
        bottom: 16px !important;
        left: 16px !important;
        right: 16px !important;
      }
    }
  `;

  // Create style element
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // Chat state
  let isOpen = false;
  let messages = [{ role: 'assistant', content: CONFIG.welcomeMessage }];
  let sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  // Create HTML
  const chatHTML = `
    <button class="ai-chat-button" id="ai-chat-toggle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
    <div class="ai-chat-window" id="ai-chat-window">
      <div class="ai-chat-header">
        <div>
          <h3>${CONFIG.businessName}</h3>
          <p>AI-ассистент онлайн</p>
        </div>
        <button class="ai-chat-close" id="ai-chat-close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="ai-chat-messages" id="ai-chat-messages"></div>
      <div class="ai-chat-input">
        <input type="text" id="ai-chat-input" placeholder="Напишите сообщение..." />
        <button id="ai-chat-send">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  // Insert into page
  const container = document.createElement('div');
  container.innerHTML = chatHTML;
  document.body.appendChild(container);

  // Get elements
  const toggleBtn = document.getElementById('ai-chat-toggle');
  const closeBtn = document.getElementById('ai-chat-close');
  const chatWindow = document.getElementById('ai-chat-window');
  const messagesContainer = document.getElementById('ai-chat-messages');
  const input = document.getElementById('ai-chat-input');
  const sendBtn = document.getElementById('ai-chat-send');

  // Render messages
  function renderMessages() {
    messagesContainer.innerHTML = messages.map(msg => `
      <div class="ai-chat-message ${msg.role}">
        <div class="ai-chat-message-content">${msg.content}</div>
      </div>
    `).join('');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Show typing indicator
  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'ai-chat-message assistant';
    typing.id = 'typing-indicator';
    typing.innerHTML = `
      <div class="ai-chat-message-content">
        <div class="ai-chat-typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typing);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  // Send message
  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    messages.push({ role: 'user', content: text });
    input.value = '';
    renderMessages();
    showTyping();

    try {
      const response = await fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId
        })
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      hideTyping();
      messages.push({ 
        role: 'assistant', 
        content: data.response?.message || 'Извините, произошла ошибка.'
      });
      renderMessages();
    } catch (error) {
      console.error('Chat error:', error);
      hideTyping();
      messages.push({ 
        role: 'assistant', 
        content: 'Извините, не могу подключиться к серверу. Попробуйте позже.'
      });
      renderMessages();
    }
  }

  // Event listeners
  toggleBtn.addEventListener('click', () => {
    isOpen = true;
    toggleBtn.style.display = 'none';
    chatWindow.classList.add('open');
    renderMessages();
    input.focus();
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    toggleBtn.style.display = 'flex';
    chatWindow.classList.remove('open');
  });

  sendBtn.addEventListener('click', sendMessage);
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Initial render
  renderMessages();

  console.log('AI Chat Widget loaded successfully');
})();
