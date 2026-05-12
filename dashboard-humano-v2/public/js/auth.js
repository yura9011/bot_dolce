function getToken() {
  // El token está en la cookie httpOnly, no necesitamos leerlo desde JS
  // El navegador lo enviará automáticamente con credentials: 'include'
  return null;
}

let currentUser = null;

async function checkAuth() {
  try {
    const response = await fetch('/api/auth/verify', {
      credentials: 'include'
    });
    if (!response.ok) {
      window.location.href = '/login.html';
      return false;
    }
    const data = await response.json();
    if (data.valid && data.user) {
      currentUser = data.user;
      const userNameEl = document.getElementById('userName');
      if (userNameEl) {
        userNameEl.textContent = data.user.name || data.user.username;
        userNameEl.dataset.role = data.user.role; // guardar rol en DOM
      }
    }
    return data.valid;
  } catch (error) {
    window.location.href = '/login.html';
    return false;
  }
}

async function logout() {
  await fetch('/api/auth/logout', { 
    method: 'POST',
    credentials: 'include' // IMPORTANTE: Incluir cookies en la petición
  });
  localStorage.removeItem('remember');
  window.location.href = '/login.html';
}
