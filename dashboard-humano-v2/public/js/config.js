let adminNumbers = [];

async function loadAdminNumbers() {
  try {
    const response = await fetch('/api/admin-numbers', {
      credentials: 'include'
    });
    if (response.ok) {
      adminNumbers = await response.json();
      renderAdminNumbers();
    }
  } catch (error) {
    console.error('Error cargando números admin:', error);
  }
}

function renderAdminNumbers() {
  const container = document.getElementById('adminNumbersList');
  if (!container) return;

  // Obtener mapa de IDs para mostrar números legibles
  let phoneMap = {};
  fetch('/api/phone-map', { credentials: 'include' })
    .then(r => r.ok ? r.json() : {})
    .then(m => { phoneMap = m; render(); })
    .catch(() => render());
  
  function render() {
    const isAdmin = currentUser?.role === 'admin' || 
                    document.getElementById('userName')?.dataset?.role === 'admin';

    if (adminNumbers.length === 0) {
      container.innerHTML = '<p class="no-chats">No hay números configurados</p>';
      const addBtn = document.getElementById('addNumberBtn');
      if (addBtn) addBtn.style.display = isAdmin ? 'block' : 'none';
      return;
    }

    container.innerHTML = adminNumbers.map(item => {
      const badgeClass = item.rol === 'admin' ? 'badge-admin' : 'badge-ignorado';
      const badgeText = item.rol === 'admin' ? 'Admin' : 'Ignorado';
      const displayPhone = phoneMap[item.id] ? `+${phoneMap[item.id]}` : item.id;
      return `
        <div class="admin-number-item" data-id="${item.id}">
          <div class="admin-number-info">
            <div class="admin-number-name">${item.nombre}</div>
            <div class="admin-number-id">📱 ${displayPhone}</div>
            <div class="admin-number-role">
              <span class="role-badge ${badgeClass}">${badgeText}</span>
              <span class="admin-number-date">Agregado: ${new Date(item.fechaAgregado).toLocaleDateString('es-AR')}</span>
            </div>
          </div>
          <div class="admin-number-actions">
            ${isAdmin ? `
              <button class="btn-role-toggle" onclick="toggleRole('${item.id}')" title="Cambiar rol">🔄</button>
              <button class="btn-delete" onclick="deleteNumber('${item.id}')" title="Eliminar">❌</button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    if (isAdmin) {
      document.getElementById('addNumberBtn').onclick = showAddModal;
      document.getElementById('addNumberBtn').style.display = 'block';
    } else {
      document.getElementById('addNumberBtn').style.display = 'none';
    }
  }
}

async function toggleRole(id) {
  const item = adminNumbers.find(a => a.id === id);
  if (!item) return;
  const newRol = item.rol === 'admin' ? 'ignorado' : 'admin';
  try {
    const response = await fetch(`/api/admin-numbers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rol: newRol })
    });
    if (response.ok) {
      item.rol = newRol;
      renderAdminNumbers();
    }
  } catch (error) {
    console.error('Error actualizando rol:', error);
  }
}

async function deleteNumber(id) {
  if (!confirm(`¿Eliminar número ${id}?`)) return;
  try {
    const response = await fetch(`/api/admin-numbers/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (response.ok) {
      adminNumbers = adminNumbers.filter(a => a.id !== id);
      renderAdminNumbers();
    }
  } catch (error) {
    console.error('Error eliminando número:', error);
  }
}

function showAddModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'addNumberModal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>➕ Agregar Número</h3>
      <div class="modal-form">
        <div class="form-group">
          <label>Número de WhatsApp:</label>
          <input type="text" id="newNumberId" placeholder="5491158647529" class="form-input">
          <small class="form-hint">Solo dígitos, sin espacios ni símbolos</small>
        </div>
        <div class="form-group">
          <label>Rol:</label>
          <select id="newNumberRol" class="form-input">
            <option value="admin">Admin (ejecuta comandos)</option>
            <option value="ignorado" selected>Ignorado (bot no responde)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Nombre (opcional):</label>
          <input type="text" id="newNumberName" placeholder="Nombre del empleado" class="form-input">
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" onclick="closeAddModal()">Cancelar</button>
          <button class="btn-confirm" onclick="addNumber()">Agregar</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeAddModal() {
  const modal = document.getElementById('addNumberModal');
  if (modal) modal.remove();
}

async function addNumber() {
  const id = document.getElementById('newNumberId').value.trim();
  const rol = document.getElementById('newNumberRol').value;
  const nombre = document.getElementById('newNumberName').value.trim();

  if (!id) {
    alert('Ingresa un número de WhatsApp');
    return;
  }

  if (!/^\d+$/.test(id)) {
    alert('El número debe contener solo dígitos');
    return;
  }

  try {
    const response = await fetch('/api/admin-numbers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, rol, nombre: nombre || undefined })
    });

    const data = await response.json();
    if (response.ok) {
      closeAddModal();
      await loadAdminNumbers();
    } else {
      alert(data.error || 'Error al agregar número');
    }
  } catch (error) {
    alert('Error de conexión');
  }
}
