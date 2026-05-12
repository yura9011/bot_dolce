function playNotification() {
  const audio = document.getElementById('notificationSound');
  if (audio) {
    audio.play().catch(e => console.log('No se pudo reproducir sonido'));
  }
}
