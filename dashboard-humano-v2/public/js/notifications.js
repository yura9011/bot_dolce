let notificationsEnabled = true;
let audioContext = null;

// Inicializar AudioContext en el primer gesto del usuario
function initAudio() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {}
  }
}

// Activar en cualquier interacción
document.addEventListener('click', initAudio, { once: false });
document.addEventListener('keydown', initAudio, { once: false });

function playNotification() {
  if (!notificationsEnabled || !audioContext) return;
  
  try {
    // Resumir contexto si está suspendido (política del navegador)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch(e) {}
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function showDesktopNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}
