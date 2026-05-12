function getToken() {
  // El token está en la cookie httpOnly, no necesitamos leerlo desde JS
  // El navegador lo enviará automáticamente con credentials: 'include'
  return null;
}

async function checkAuth() {
  try {
    const response = await fetch('/api/auth/verify', {
      credentials: 'include' // IMPORTANTE: Incluir cookies en la petición
    });
    if (!response.ok) {
      window.location.href = '/login.html';
      return false;
    }
    const data = await response.json();
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
