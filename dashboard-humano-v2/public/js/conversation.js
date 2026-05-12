async function loadMessages(userId) {
  try {
    const token = getToken();
    const response = await fetch(`/api/chats/${userId}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const messages = await response.json();
      renderMessages(messages);
      document.getElementById('chatName').textContent = userId.split('@')[0];
    }
  } catch (error) {
    console.error('Error cargando mensajes:', error);
  }
}

function renderMessages(messages) {
  const container = document.getElementById('messagesContainer');
  
  container.innerHTML = messages.map(msg => {
    const time = new Date(msg.timestamp).toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return `
      <div class="message ${msg.role}">
        <div class="message-text">${msg.texto || msg.parts?.[0]?.text || ''}</div>
        <div class="message-time">${time}</div>
      </div>
    `;
  }).join('');
  
  container.scrollTop = container.scrollHeight;
}

document.getElementById('sendBtn')?.addEventListener('click', sendMessage);
document.getElementById('messageInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  if (!currentUserId) return;
  
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  try {
    const token = getToken();
    const response = await fetch(`/api/chats/${currentUserId}/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });
    
    if (response.ok) {
      input.value = '';
      loadMessages(currentUserId);
    }
  } catch (error) {
    console.error('Error enviando mensaje:', error);
  }
}

document.getElementById('finishBtn')?.addEventListener('click', async () => {
  if (!currentUserId) return;
  
  if (!confirm('¿Finalizar conversación y reactivar bot?')) return;
  
  try {
    const token = getToken();
    const response = await fetch(`/api/chats/${currentUserId}/finish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      alert('Conversación finalizada. Bot reactivado.');
      loadMessages(currentUserId);
      loadChats();
    }
  } catch (error) {
    console.error('Error finalizando conversación:', error);
  }
});
