document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const themeBtn = document.getElementById('themeBtn');
  const muteBtn = document.getElementById('muteBtn');

  const screens = {
    home: document.getElementById('homeScreen'),
    levelSelect: document.getElementById('levelSelectScreen'),
    game: document.getElementById('gameScreen'),
  };

  function showScreen(name) {
    Object.values(screens).forEach(el => el.classList.add('hidden'));
    screens[name].classList.remove('hidden');
  }

  function goHome() {
    document.getElementById('homeBest').textContent = Storage.getBest();
    showScreen('home');
  }

  function renderLevelGrid() {
    const grid = document.getElementById('levelGrid');
    const unlocked = Storage.getUnlockedLevel();
    grid.innerHTML = '';
    for (let n = 1; n <= Levels.TOTAL; n++) {
      const btn = document.createElement('button');
      const isLocked = n > unlocked;
      btn.className = `level-btn${isLocked ? ' locked' : ''}`;
      btn.textContent = isLocked ? '🔒' : n;
      btn.disabled = isLocked;
      if (!isLocked) {
        btn.addEventListener('click', () => {
          showScreen('game');
          Game.startLevel(n);
        });
      }
      grid.appendChild(btn);
    }
  }

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

  document.getElementById('playEndlessBtn').addEventListener('click', () => {
    showScreen('game');
    Game.startEndless();
  });

  document.getElementById('playLevelBtn').addEventListener('click', () => {
    renderLevelGrid();
    showScreen('levelSelect');
  });

  document.getElementById('levelSelectBackBtn').addEventListener('click', goHome);

  Game.init({ onMenu: goHome });

  goHome();
});
