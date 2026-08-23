const SHOP_ITEMS = [
  {
    id: 'theme-ocean', category: 'theme', name: 'Ocean', desc: 'ธีมโทนสีฟ้าน้ำทะเล',
    price: 150, swatch: ['#0f3d5c', '#1a6b96', '#4fc3e8'],
  },
  {
    id: 'theme-forest', category: 'theme', name: 'Forest', desc: 'ธีมโทนสีเขียวป่าไม้',
    price: 150, swatch: ['#16241a', '#3d6b2f', '#7bc95f'],
  },
  {
    id: 'skin-pastel', category: 'blockSkin', name: 'Pastel', desc: 'สีบล็อกโทนพาสเทลนุ่มนวล',
    price: 100, swatch: ['#a8d8ff', '#b8f2c8', '#ffd9a8', '#d9b8f2'],
  },
  {
    id: 'skin-mono', category: 'blockSkin', name: 'Mono', desc: 'สีบล็อกโทนเดียวมินิมอล',
    price: 120, swatch: ['#7a8699', '#8a96a8', '#9aa6b8', '#6a7688'],
  },
  {
    id: 'effect-confetti', category: 'clearEffect', name: 'Confetti', desc: 'เอฟเฟกต์กระดาษสีสันสดใสตอนบล็อกหาย',
    price: 100, icon: '🎉',
  },
  {
    id: 'effect-firework', category: 'clearEffect', name: 'Firework', desc: 'เอฟเฟกต์พลุระเบิดใหญ่ตอนบล็อกหาย',
    price: 150, icon: '🎆',
  },
];

const Shop = (() => {
  function list() {
    const owned = new Set(Storage.getOwnedItems());
    const equipped = Storage.getEquipped();
    const currentTheme = Storage.getTheme();
    return SHOP_ITEMS.map(item => ({
      ...item,
      owned: owned.has(item.id),
      equipped: item.category === 'theme' ? currentTheme === item.id : equipped[item.category] === item.id,
    }));
  }

  function equip(id) {
    const item = SHOP_ITEMS.find(i => i.id === id);
    if (!item) return false;
    if (item.category === 'theme') {
      Storage.setTheme(id);
    } else {
      Storage.setEquipped(item.category, id);
    }
    return true;
  }

  function buy(id) {
    const item = SHOP_ITEMS.find(i => i.id === id);
    if (!item) return { ok: false, reason: 'not-found' };
    if (Storage.getOwnedItems().includes(id)) return { ok: false, reason: 'owned' };
    if (!Storage.spendCoins(item.price)) return { ok: false, reason: 'insufficient' };
    Storage.ownItem(id);
    equip(id);
    return { ok: true };
  }

  return { list, buy, equip, ITEMS: SHOP_ITEMS };
})();
