let currentUserId = null;
let currentTab = 'chats';

async function init() {
  const isAuth = await checkAuth();
  if (!isAuth) return;
  
  document.getElementById('logoutBtn').addEventListener('click', logout);
  
  document.getElementById('tabChats').addEventListener('click', () => switchTab('chats'));
  document.getElementById('tabConfig').addEventListener('click', () => switchTab('config'));
  
  loadChats();
  setInterval(loadChats, 5000);
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  
  if (tab === 'chats') {
    document.getElementById('tabChats').classList.add('active');
    document.getElementById('chatListContainer').style.display = 'block';
    document.getElementById('configContainer').style.display = 'none';
    document.getElementById('configPanel').style.display = 'none';
    document.querySelector('.no-chat-selected').style.display = 'block';
    document.getElementById('conversationContainer').style.display = 'none';
    document.getElementById('searchInput').style.display = 'block';
  } else {
    document.getElementById('tabConfig').classList.add('active');
    document.getElementById('chatListContainer').style.display = 'none';
    document.getElementById('configContainer').style.display = 'block';
    document.getElementById('configPanel').style.display = 'flex';
    document.querySelector('.no-chat-selected').style.display = 'none';
    document.getElementById('conversationContainer').style.display = 'none';
    document.getElementById('searchInput').style.display = 'none';
    loadAdminNumbers();
  }
}

async function loadChats() {
  if (currentTab !== 'chats') return;
  try {
    const response = await fetch('/api/chats', {
      credentials: 'include'
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
