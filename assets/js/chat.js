function sendMessage() {
  const message = getMessage();
  if (!message) {
    return;
  }
  lockInput();
  postMessage('guest', message);
  addTypingMessage();
  askChatBot(message)
    .then((answer) => {
      removeTypingMessage();
      postMessage('me', answer);
      unlockInput();
    })
    .catch((error) => {
      console.error('Error:', error);
      removeTypingMessage();
      postMessage('me', "Sorry, I can't reply at the moment.");
      unlockInput();
    });
}

function postMessage(who, text) {
  const chatThread = document.getElementById('chat-thread');

  const replyThread = document.createElement('li');
  replyThread.classList.add(who);

  const replyHtml = marked.parse(text);
  replyThread.innerHTML = DOMPurify.sanitize(replyHtml);

  chatThread.appendChild(replyThread);
  scrollToBottom();
}

async function askChatBot(question) {
  const response = await fetch(chatBotUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, k: 3 }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const answer = data.answer;
  const cleanAnswer = answer
    .replace(/<think\s*>[\s\S]*?<\/think\s*>/gi, '')
    .replace(/<think\s*\/>/gi, '')
    .trim();
  return cleanAnswer;
}

function getMessage() {
  const input = document.getElementById('chat-window-input');
  const message = input.value;
  return message;
}

function lockInput() {
  const input = document.getElementById('chat-window-input');
  input.disabled = true;
  const sendButton = document.getElementById('chat-window-send-button');
  sendButton.disabled = true;
  input.value = '';
}

function unlockInput() {
  const input = document.getElementById('chat-window-input');
  input.disabled = false;
  const sendButton = document.getElementById('chat-window-send-button');
  sendButton.disabled = false;
  input.focus();
}

function addTypingMessage() {
  const typingMessage = document.createElement('li');
  typingMessage.id = 'typing-message';
  typingMessage.classList.add('me', 'typing');
  typingMessage.innerHTML = `
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  `;

  const chatThread = document.getElementById('chat-thread');
  chatThread.appendChild(typingMessage);

  scrollToBottom();
}

function removeTypingMessage() {
  document.getElementById('typing-message')?.remove();
}

function scrollToBottom() {
  let chat = document.getElementById('chat-content');
  chat.scrollTop = chat.scrollHeight;
}
