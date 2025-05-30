// script.js
const API_BASE = 'http://localhost:5000';

function submitMood(mood) {
  fetch(${API_BASE}/mood, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'user123', mood })
  })
  .then(res => res.json())
  .then(data => {
    console.log('Mood submitted:', data);
    document.getElementById('mood-section').style.display = 'none';
    document.getElementById('chat-section').style.display = 'flex';
  })
  .catch(err => alert('Error submitting mood'));
}

function sendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (!message) return;

  appendMessage('You', message);
  input.value = '';

  fetch(${API_BASE}/chat, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  })
  .then(res => res.json())
  .then(data => {
    appendMessage('Assistant', data.reply);
  })
  .catch(err => appendMessage('Assistant', 'Sorry, something went wrong.'));
}

function appendMessage(sender, text) {
  const chatBox = document.getElementById('chat-box');
  const msg = document.createElement('div');
  msg.innerHTML = <strong>${sender}:</strong> ${text};
  msg.style.marginBottom = '12px';
  msg.style.animation = 'fadeIn 0.4s ease';
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}