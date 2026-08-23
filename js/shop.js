const SHOP_ITEMS = [
  {
    id: 'skin-pop', category: 'blockSkin', name: 'Pop! Crack!', desc: 'บล็อกพลาสติกมันเงา สีสดจัดจ้าน',
    price: 100,
  },
  {
    id: 'skin-neon', category: 'blockSkin', name: 'Beep Pulse', desc: 'บล็อกโครงลวดนีออน เรืองแสงกลางคืน',
    price: 150,
  },
  {
    id: 'skin-chiptune', category: 'blockSkin', name: 'Chiptune', desc: 'บล็อกวอกเซล 8-bit แบ่งช่อง 3x3',
    price: 150,
  },
  {
    id: 'effect-pop', category: 'clearEffect', name: 'Pop! Crack!', desc: 'บล็อกแตกกระจายเป็นเศษ+ประกายไฟ พร้อมคำว่า POP! CRACK!',
    price: 100, icon: '💥',
  },
  {
    id: 'effect-pulse', category: 'clearEffect', name: 'Beep Pulse', desc: 'คลื่นวงแหวนนีออนซ้อนกัน พร้อมคำว่า BEEP PULSE',
    price: 150, icon: '💫',
  },
  {
    id: 'effect-chiptune', category: 'clearEffect', name: 'Chiptune', desc: 'พิกเซลร่วงหล่นแบบ 8-bit พร้อมคำว่า LEVEL UP!',
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
