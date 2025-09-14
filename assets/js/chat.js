// --------------------
// Utility Functions
// --------------------
const $ = (id) => document.getElementById(id);

const getTimestamp = () =>
  new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const sanitizeMarkdown = (text) => DOMPurify.sanitize(marked.parse(text));

const scrollToBottom = () => {
  const chat = $('chat-content');
  if (chat) chat.scrollTop = chat.scrollHeight;
};

// --------------------
// Chat UI Management
// --------------------
function postMessage(sender, text) {
  const chat = $('chat-thread');
  if (!chat) return;

  const messageContainer = document.createElement('li');
  messageContainer.classList.add(sender);

  const timestamp = document.createElement('span');
  timestamp.classList.add('timestamp');
  timestamp.textContent = getTimestamp();

  messageContainer.appendChild(timestamp);
  messageContainer.innerHTML += sanitizeMarkdown(text);

  chat.appendChild(messageContainer);
  scrollToBottom();
}

function addTypingMessage() {
  const chat = $('chat-thread');
  if (!chat) return;

  const typingMessage = document.createElement('li');
  typingMessage.id = 'typing-message';
  typingMessage.classList.add('me', 'typing');
  typingMessage.innerHTML = `
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  `;

  chat.appendChild(typingMessage);
  scrollToBottom();
}

function removeTypingMessage() {
  $('typing-message')?.remove();
}

function lockInput() {
  const input = $('chat-form-input');
  const sendButton = $('chat-form-send-button');
  if (!input || !sendButton) return;

  input.disabled = true;
  sendButton.disabled = true;
  input.value = '';
}

function unlockInput() {
  const input = $('chat-form-input');
  const sendButton = $('chat-form-send-button');
  if (!input || !sendButton) return;

  input.disabled = false;
  sendButton.disabled = false;
  input.focus();
}

// --------------------
// Bot Communication
// --------------------
const messageHistory = [];
const historyLength = 3;

async function askChatBot(question) {
  const response = await fetch(chatBotUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question : question, history: messageHistory}),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const { answer } = await response.json();

  messageHistory.push(question);
  if (messageHistory.length > historyLength) {
    messageHistory.shift();
  }

  return answer
    .replace(/<think\s*>[\s\S]*?<\/think\s*>/gi, '')
    .replace(/<think\s*\/>/gi, '')
    .trim();
}

// --------------------
// Main Interaction
// --------------------
async function sendMessage() {
  const input = $('chat-form-input');
  if (!input.checkValidity()) {
    input.reportValidity();
    return;
  }

  const message = input?.value.trim();
  if (!message) return;

  lockInput();
  postMessage('guest', message);
  addTypingMessage();

  try {
    const answer = await askChatBot(message);
    removeTypingMessage();
    postMessage('me', answer);
  } catch (error) {
    console.error('ChatBot Error:', error);
    removeTypingMessage();
    postMessage('me', "Sorry, I can't reply at the moment.");
  } finally {
    unlockInput();
  }
}

// --------------------
// Initialization
// --------------------
document.addEventListener('DOMContentLoaded', () => {
  postMessage(
    'me',
    'Hi! 👋<br>Curious about my blog or me? Ask away anytime! 😉'
  );
});
