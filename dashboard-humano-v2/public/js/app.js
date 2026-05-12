let currentUserId = null;

async function init() {
  const isAuth = await checkAuth();
  if (!isAuth) return;
  
  document.getElementById('logoutBtn').addEventListener('click', logout);
  
  loadChats();
  setInterval(loadChats, 5000);
}

async function loadChats() {
  try {
    const response = await fetch('/api/chats', {
      credentials: 'include' // IMPORTANTE: Incluir cookies en la petición
    });
    
    if (response.ok) {
      const chats = await response.json();
      renderChats(chats);
    }
  } catch (error) {
    console.error('Error cargando chats:', error);
  }
}

document.addEventListener('DOMContentLoaded', init);
