let notificationsEnabled = true;

// "Unlock" audio en el primer gesto del usuario (requisito del browser)
function unlockAudio() {
  const audio = document.getElementById('notificationSound');
  if (audio) {
    audio.play().then(() => { audio.pause(); audio.currentTime = 0; }).catch(() => {});
  }
}
document.addEventListener('click', unlockAudio, { once: true });
document.addEventListener('keydown', unlockAudio, { once: true });

function playNotification() {
  if (!notificationsEnabled) return;
  const audio = document.getElementById('notificationSound');
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
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
