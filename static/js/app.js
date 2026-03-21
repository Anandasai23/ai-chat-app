// ── State ──────────────────────────────────────────
let conversationHistory = [];
let isLoading = false;
let chatTitles = [];

// ── DOM refs ───────────────────────────────────────
const messagesEl   = document.getElementById('messages');
const inputEl      = document.getElementById('userInput');
const sendBtnEl    = document.getElementById('sendBtn');
const welcomeEl    = document.getElementById('welcomeScreen');
const historyList  = document.getElementById('historyList');

// ── Helpers ────────────────────────────────────────
function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 150) + 'px';
}

function scrollBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideWelcome() {
  if (welcomeEl) welcomeEl.style.display = 'none';
}

// ── Markdown renderer (lightweight) ───────────────
function renderMarkdown(text) {
  return text
    // Code blocks
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="lang-${lang}">${escapeHtml(code.trim())}</code></pre>`)
    // Inline code
    .replace(/`([^`\n]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`)
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    // Unordered lists
    .replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Line breaks (but not inside code blocks)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Append a message bubble ────────────────────────
function appendMessage(role, text) {
  hideWelcome();

  const isUser = role === 'user';
  const row = document.createElement('div');
  row.className = `msg-row ${isUser ? 'user' : 'bot'}`;

  const avatar = document.createElement('div');
  avatar.className = `msg-avatar ${isUser ? 'user-av' : 'bot-av'}`;
  avatar.textContent = isUser ? 'You' : '⬡';

  const content = document.createElement('div');
  content.className = 'msg-content';

  const meta = document.createElement('div');
  meta.className = 'msg-meta';
  meta.innerHTML = `
    <span class="msg-name">${isUser ? 'You' : 'AI Assistant'}</span>
    <span class="msg-time">${getTime()}</span>
  `;

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = renderMarkdown(text);

  content.appendChild(meta);
  content.appendChild(bubble);
  row.appendChild(avatar);
  row.appendChild(content);
  messagesEl.appendChild(row);
  scrollBottom();
}

// ── Typing indicator ──────────────────────────────
function showTyping() {
  const row = document.createElement('div');
  row.className = 'typing-row';
  row.id = 'typingRow';

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar bot-av';
  avatar.textContent = '⬡';

  const bubble = document.createElement('div');
  bubble.className = 'typing-bubble';
  bubble.innerHTML = '<div class="t-dot"></div><div class="t-dot"></div><div class="t-dot"></div>';

  row.appendChild(avatar);
  row.appendChild(bubble);
  messagesEl.appendChild(row);
  scrollBottom();
}

function hideTyping() {
  const el = document.getElementById('typingRow');
  if (el) el.remove();
}

// ── Toast notification ────────────────────────────
function showToast(msg, duration = 3500) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ── Chat history sidebar ──────────────────────────
function addToHistory(text) {
  const title = text.length > 36 ? text.slice(0, 36) + '…' : text;
  chatTitles.unshift(title);

  const item = document.createElement('div');
  item.className = 'history-item';
  item.textContent = title;
  historyList.prepend(item);

  // Keep max 8 items
  const items = historyList.querySelectorAll('.history-item');
  if (items.length > 8) items[items.length - 1].remove();
}

// ── Send a message ────────────────────────────────
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text || isLoading) return;

  // Lock UI
  isLoading = true;
  sendBtnEl.disabled = true;
  inputEl.value = '';
  inputEl.style.height = 'auto';

  appendMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });

  if (conversationHistory.length === 1) addToHistory(text);

  showTyping();

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory })
    });

    const data = await res.json();
    hideTyping();

    if (!res.ok) {
      showToast('⚠ ' + (data.error || 'Something went wrong.'));
      conversationHistory.pop(); // remove the failed user msg from history
    } else {
      conversationHistory.push({ role: 'assistant', content: data.reply });
      appendMessage('bot', data.reply);
    }

  } catch (err) {
    hideTyping();
    showToast('⚠ Network error — is Flask running?');
    conversationHistory.pop();
  }

  isLoading = false;
  sendBtnEl.disabled = false;
  inputEl.focus();
}

// ── Clear chat ────────────────────────────────────
function clearChat() {
  conversationHistory = [];
  messagesEl.innerHTML = '';

  // Re-insert welcome screen
  const welcome = document.createElement('div');
  welcome.className = 'welcome-screen';
  welcome.id = 'welcomeScreen';
  welcome.innerHTML = `
    <div class="welcome-icon">⬡</div>
    <h1 class="welcome-title">How can I help you today?</h1>
    <p class="welcome-sub">Ask me anything — code, ideas, explanations, writing.</p>
    <div class="suggestion-grid">
      <div class="suggest-card" onclick="useSuggestion('Explain how neural networks work')">
        <span class="suggest-icon">🧠</span><span>Explain neural networks</span>
      </div>
      <div class="suggest-card" onclick="useSuggestion('Write a Python function to sort a list of dictionaries by a key')">
        <span class="suggest-icon">🐍</span><span>Write Python code</span>
      </div>
      <div class="suggest-card" onclick="useSuggestion('Give me 5 creative startup ideas for 2025')">
        <span class="suggest-icon">💡</span><span>Brainstorm ideas</span>
      </div>
      <div class="suggest-card" onclick="useSuggestion('Write a short poem about the ocean at night')">
        <span class="suggest-icon">✍️</span><span>Write a poem</span>
      </div>
    </div>
  `;
  messagesEl.appendChild(welcome);
  inputEl.focus();
}

// ── Suggestion chips ──────────────────────────────
function useSuggestion(text) {
  inputEl.value = text;
  autoResize(inputEl);
  sendMessage();
}

// ── Keyboard handling ─────────────────────────────
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

// ── Init ──────────────────────────────────────────
inputEl.focus();
