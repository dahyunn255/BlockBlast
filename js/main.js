document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const themeBtn = document.getElementById('themeBtn');
  const muteBtn = document.getElementById('muteBtn');

  const screens = {
    home: document.getElementById('homeScreen'),
    levelSelect: document.getElementById('levelSelectScreen'),
    achievements: document.getElementById('achievementsScreen'),
    shop: document.getElementById('shopScreen'),
    game: document.getElementById('gameScreen'),
  };

  function showScreen(name) {
    Object.values(screens).forEach(el => el.classList.add('hidden'));
    screens[name].classList.remove('hidden');
  }

  function updateDailyStatus() {
    const statusEl = document.getElementById('dailyStatus');
    const streak = Daily.getStreak();
    if (Daily.isCompletedToday()) {
      statusEl.textContent = `สำเร็จแล้ววันนี้! 🔥 ต่อเนื่อง ${streak} วัน`;
    } else if (streak > 0) {
      statusEl.textContent = `🔥 ต่อเนื่อง ${streak} วัน — เล่นวันนี้เพื่อรักษาสถิติ`;
    } else {
      statusEl.textContent = 'ยังไม่ได้เล่นวันนี้';
    }
  }

  function goHome() {
    document.getElementById('homeBest').textContent = Storage.getBest();
    document.getElementById('homeCoins').textContent = Storage.getCoins();
    updateDailyStatus();
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
    const owned = new Set(Storage.getOwnedItems());
    return Storage.THEMES.filter(t => {
      if (t === 'theme-classic' || t === 'theme-neon') return true;
      if (t === 'theme-sunset') return Achievements.hasThemeUnlock();
      return owned.has(t);
    });
  }

  function applyTheme(theme) {
    Storage.THEMES.forEach(t => app.classList.remove(t));
    app.classList.add(theme);
  }

  function applySkin(skinId) {
    Shop.ITEMS.filter(i => i.category === 'blockSkin').forEach(i => app.classList.remove(i.id));
    if (skinId && skinId !== 'default') app.classList.add(skinId);
  }

  function applyMuteIcon(muted) {
    muteBtn.textContent = muted ? '🔇' : '🔊';
  }

  function renderShop() {
    document.getElementById('shopCoins').textContent = Storage.getCoins();
    const containers = {
      theme: document.getElementById('shopThemes'),
      blockSkin: document.getElementById('shopSkins'),
      clearEffect: document.getElementById('shopEffects'),
    };
    Object.values(containers).forEach(el => { el.innerHTML = ''; });

    for (const item of Shop.list()) {
      const card = document.createElement('div');
      card.className = `shop-item${item.owned ? ' owned' : ''}${item.equipped ? ' equipped' : ''}`;

      const swatch = document.createElement('div');
      swatch.className = 'shop-item-swatch';
      if (item.swatch) {
        swatch.style.background = `linear-gradient(135deg, ${item.swatch.join(', ')})`;
      } else if (item.icon) {
        swatch.classList.add('shop-item-swatch-icon');
        swatch.textContent = item.icon;
      }

      const text = document.createElement('div');
      text.className = 'shop-item-text';
      const name = document.createElement('div');
      name.className = 'shop-item-name';
      name.textContent = item.name;
      const desc = document.createElement('div');
      desc.className = 'shop-item-desc';
      desc.textContent = item.desc;
      text.append(name, desc);

      const action = document.createElement('button');
      action.className = 'shop-item-action';

      function applyEquip() {
        if (item.category === 'theme') applyTheme(item.id);
        if (item.category === 'blockSkin') applySkin(item.id);
      }

      if (item.equipped) {
        action.textContent = 'กำลังใช้งาน';
        action.disabled = true;
      } else if (item.owned) {
        action.textContent = 'ใช้งาน';
        action.addEventListener('click', () => {
          Shop.equip(item.id);
          applyEquip();
          renderShop();
        });
      } else {
        action.textContent = `ซื้อ ${item.price} 🪙`;
        action.disabled = Storage.getCoins() < item.price;
        action.addEventListener('click', () => {
          if (Shop.buy(item.id).ok) {
            applyEquip();
            renderShop();
          }
        });
      }

      card.append(swatch, text, action);
      containers[item.category].appendChild(card);
    }
  }

  // Backfill: unlock any achievements already met by past progress (e.g. an existing
  // best score) without showing a toast — the toast is only for in-game unlock moments.
  Achievements.checkNewUnlocks({ bestScore: Storage.getBest() });

  const savedTheme = Storage.getTheme();
  const initialTheme = availableThemes().includes(savedTheme) ? savedTheme : 'theme-classic';
  applyTheme(initialTheme);
  applySkin(Storage.getEquipped().blockSkin);
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

  document.getElementById('playDailyBtn').addEventListener('click', () => {
    showScreen('game');
    Game.startDaily();
  });

  document.getElementById('achievementsBtn').addEventListener('click', () => {
    renderAchievements();
    showScreen('achievements');
  });

  document.getElementById('achievementsBackBtn').addEventListener('click', goHome);

  document.getElementById('shopBtn').addEventListener('click', () => {
    renderShop();
    showScreen('shop');
  });

  document.getElementById('shopBackBtn').addEventListener('click', goHome);

  Game.init({ onMenu: goHome });

  goHome();
});
