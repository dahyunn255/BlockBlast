document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const themeBtn = document.getElementById('themeBtn');
  const muteBtn = document.getElementById('muteBtn');

  function applyTheme(theme) {
    Storage.THEMES.forEach(t => app.classList.remove(t));
    app.classList.add(theme);
  }

  function applyMuteIcon(muted) {
    muteBtn.textContent = muted ? '🔇' : '🔊';
  }

  applyTheme(Storage.getTheme());
  AudioFx.setMuted(Storage.getMuted());
  applyMuteIcon(Storage.getMuted());

  themeBtn.addEventListener('click', () => {
    const next = Storage.nextTheme(Storage.getTheme());
    Storage.setTheme(next);
    applyTheme(next);
  });

  muteBtn.addEventListener('click', () => {
    const muted = !AudioFx.isMuted();
    AudioFx.setMuted(muted);
    applyMuteIcon(muted);
  });

  Game.init();
});
