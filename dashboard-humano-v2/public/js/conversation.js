async function loadMessages(userId) {
  try {
    const response = await fetch(`/api/chats/${userId}/messages`, {
      credentials: 'include'
    });
    
    console.log('loadMessages status:', response.status);
    
    if (response.ok) {
      const messages = await response.json();
      console.log('messages count:', messages.length, 'first:', messages[0]);
      renderMessages(messages);
      document.getElementById('chatName').textContent = userId.split('@')[0];
    } else {
      console.error('loadMessages error: response not ok', response.status);
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
    
    // Obtener el texto del mensaje (soporta diferentes formatos)
    let messageText = msg.text || msg.texto || msg.parts?.[0]?.text || '';
    
    // Procesar formato de WhatsApp
    // Convertir *texto* a <strong>texto</strong>
    messageText = messageText.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    
    // Convertir saltos de línea a <br>
    messageText = messageText.replace(/\n/g, '<br>');
    
    // Determinar la clase según el rol
    let messageClass = 'message';
    if (msg.role === 'user') {
      messageClass += ' message-user';
    } else if (msg.role === 'human' || msg.role === 'manual') {
      messageClass += ' message-human';
    } else {
      messageClass += ' message-bot';
    }
    
    return `
      <div class="${messageClass}">
        <div class="message-text">${messageText}</div>
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
    const response = await fetch(`/api/chats/${currentUserId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
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
    const response = await fetch(`/api/chats/${currentUserId}/finish`, {
      method: 'POST',
      credentials: 'include'
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
