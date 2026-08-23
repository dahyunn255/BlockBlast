document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const themeBtn = document.getElementById('themeBtn');
  const muteBtn = document.getElementById('muteBtn');

  const screens = {
    home: document.getElementById('homeScreen'),
    levelSelect: document.getElementById('levelSelectScreen'),
    achievements: document.getElementById('achievementsScreen'),
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

  function renderAchievements() {
    const list = document.getElementById('achievementList');
    list.innerHTML = '';
    for (const a of Achievements.list()) {
      const item = document.createElement('div');
      item.className = `achievement-item${a.unlocked ? ' unlocked' : ''}`;
      const icon = document.createElement('div');
      icon.className = 'achievement-icon';
      icon.textContent = a.unlocked ? '🏆' : '🔒';
      const text = document.createElement('div');
      text.className = 'achievement-text';
      const title = document.createElement('div');
      title.className = 'achievement-title';
      title.textContent = a.title;
      const desc = document.createElement('div');
      desc.className = 'achievement-desc';
      desc.textContent = a.desc;
      text.append(title, desc);
      item.append(icon, text);
      list.appendChild(item);
    }
  }

  function availableThemes() {
    return Achievements.hasThemeUnlock() ? Storage.THEMES : Storage.THEMES.filter(t => t !== 'theme-sunset');
  }

  function applyTheme(theme) {
    Storage.THEMES.forEach(t => app.classList.remove(t));
    app.classList.add(theme);
  }

  function applyMuteIcon(muted) {
    muteBtn.textContent = muted ? '🔇' : '🔊';
  }

  // Backfill: unlock any achievements already met by past progress (e.g. an existing
  // best score) without showing a toast — the toast is only for in-game unlock moments.
  Achievements.checkNewUnlocks({ bestScore: Storage.getBest() });

  const savedTheme = Storage.getTheme();
  const initialTheme = availableThemes().includes(savedTheme) ? savedTheme : 'theme-classic';
  applyTheme(initialTheme);
  AudioFx.setMuted(Storage.getMuted());
  applyMuteIcon(Storage.getMuted());

  themeBtn.addEventListener('click', () => {
    const avail = availableThemes();
    const current = Storage.getTheme();
    const idx = avail.indexOf(current);
    const next = avail[(idx + 1) % avail.length] || avail[0];
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

  document.getElementById('achievementsBtn').addEventListener('click', () => {
    renderAchievements();
    showScreen('achievements');
  });

  document.getElementById('achievementsBackBtn').addEventListener('click', goHome);

  Game.init({ onMenu: goHome });

  goHome();
});
