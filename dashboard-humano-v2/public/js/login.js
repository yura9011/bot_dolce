document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const remember = document.getElementById('remember').checked;
  const errorDiv = document.getElementById('error-message');
  errorDiv.style.display = 'none';
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // IMPORTANTE: Incluir cookies en la petición
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok) {
      // El token ya está en la cookie httpOnly, no necesitamos guardarlo
      // Solo guardamos una flag si el usuario quiere ser recordado
      if (remember) {
        localStorage.setItem('remember', 'true');
      }
      window.location.href = '/index.html';
    } else {
      errorDiv.textContent = data.error || 'Error al iniciar sesión';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    errorDiv.textContent = 'Error de conexión. Intenta nuevamente.';
    errorDiv.style.display = 'block';
  }
});
