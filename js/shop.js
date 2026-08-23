const SHOP_ITEMS = [
  {
    id: 'skin-pop', category: 'blockSkin', name: 'Pop! Crack!', desc: 'บล็อกสีสดใสสไตล์การ์ตูน',
    price: 100, swatch: ['#ff3b3b', '#ffe23b', '#2f8fff', '#3ddc61'],
  },
  {
    id: 'skin-neon', category: 'blockSkin', name: 'Beep Pulse', desc: 'บล็อกนีออนเรืองแสง',
    price: 150, swatch: ['#00e5ff', '#d63bff', '#ff2ee0', '#39ff9d'],
  },
  {
    id: 'skin-chiptune', category: 'blockSkin', name: 'Chiptune', desc: 'บล็อกพิกเซลสไตล์ 8-bit',
    price: 150, swatch: ['#8955c9', '#52a447', '#e0c23a', '#e8823a'],
  },
  {
    id: 'effect-pop', category: 'clearEffect', name: 'Pop! Crack!', desc: 'เอฟเฟกต์ระเบิดกระจายเป็นเศษ พร้อมเสียง Pop!',
    price: 100, icon: '💥',
  },
  {
    id: 'effect-pulse', category: 'clearEffect', name: 'Beep Pulse', desc: 'เอฟเฟกต์คลื่นพลังงานนีออน พร้อมเสียง Beep',
    price: 150, icon: '💫',
  },
  {
    id: 'effect-chiptune', category: 'clearEffect', name: 'Chiptune', desc: 'เอฟเฟกต์พิกเซลสไตล์ 8-bit พร้อมเสียงชิปทูน',
    price: 150, icon: '🕹️',
  },
];

const Shop = (() => {
  function list() {
    const owned = new Set(Storage.getOwnedItems());
    const equipped = Storage.getEquipped();
    return SHOP_ITEMS.map(item => ({
      ...item,
      owned: owned.has(item.id),
      equipped: equipped[item.category] === item.id,
    }));
  }

  function equip(id) {
    const item = SHOP_ITEMS.find(i => i.id === id);
    if (!item) return false;
    Storage.setEquipped(item.category, id);
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
