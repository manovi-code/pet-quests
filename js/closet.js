/**
 * Pet Quests — pet closet.
 * Free basics start unlocked. Everything else stays hidden until it is earned
 * or bought with coins from play. The worn outfit is saved with the pet.
 */
(function (root, factory) {
  var api = factory(
    typeof require !== 'undefined' ? require('./bank.js') : root.PQBank,
    typeof require !== 'undefined' ? require('./shop.js') : root.PQShop
  );
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PQCloset = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (PQBank, PQShop) {
  'use strict';

  var SLOTS = [
    { id: 'hat', label: 'Hats' },
    { id: 'glasses', label: 'Glasses' },
    { id: 'scarf', label: 'Scarves' },
    { id: 'shirt', label: 'Shirts' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'pack', label: 'Packs' }
  ];

  var STARTER = ['hat-sunny', 'scarf-red', 'shoes-cloud'];

  var ITEMS = [
    { id: 'hat-sunny', name: 'sunny hat', slot: 'hat', source: 'starter', look: 'sunhat', color: '#e8c84a' },
    { id: 'hat-explorer', name: 'explorer hat', slot: 'hat', source: 'quest', look: 'explorer', color: '#c4784a' },
    { id: 'hat-beanie', name: 'cozy beanie', slot: 'hat', source: 'quest', look: 'beanie', color: '#7a9a68' },
    { id: 'hat-flower', name: 'flower crown', slot: 'hat', source: 'outing', outing: 'outing-hike', look: 'flower', color: '#e07a5f' },
    { id: 'hat-party', name: 'party hat', slot: 'hat', source: 'shop', price: 8, look: 'party', color: '#d4564e' },
    { id: 'hat-crown', name: 'paper crown', slot: 'hat', source: 'shop', price: 12, look: 'crown', color: '#e8c84a' },
    { id: 'glasses-round', name: 'round glasses', slot: 'glasses', source: 'quest', look: 'round', color: '#5c4030' },
    { id: 'glasses-star', name: 'star glasses', slot: 'glasses', source: 'game', look: 'star', color: '#c4784a' },
    { id: 'glasses-sun', name: 'sun glasses', slot: 'glasses', source: 'outing', outing: 'outing-beach', look: 'sun', color: '#3d4a62' },
    { id: 'glasses-heart', name: 'heart glasses', slot: 'glasses', source: 'shop', price: 8, look: 'heart', color: '#e07a5f' },
    { id: 'glasses-square', name: 'square glasses', slot: 'glasses', source: 'shop', price: 10, look: 'square', color: '#5f7a52' },
    { id: 'scarf-red', name: 'red bow', slot: 'scarf', source: 'starter', look: 'bow', color: '#d4564e' },
    { id: 'scarf-bandana', name: 'trail bandana', slot: 'scarf', source: 'quest', look: 'bandana', color: '#7a9a68' },
    { id: 'scarf-ribbon', name: 'parade ribbon', slot: 'scarf', source: 'game', look: 'ribbon', color: '#e8c84a' },
    { id: 'scarf-blue', name: 'blue scarf', slot: 'scarf', source: 'shop', price: 6, look: 'scarf', color: '#8eb4c9' },
    { id: 'scarf-polka', name: 'polka bow', slot: 'scarf', source: 'shop', price: 8, look: 'polka', color: '#f0a0c0' },
    { id: 'scarf-green', name: 'green scarf', slot: 'scarf', source: 'shop', price: 6, look: 'scarf', color: '#7a9a68' },
    { id: 'shirt-stripe', name: 'stripe shirt', slot: 'shirt', source: 'quest', look: 'stripe', color: '#8eb4c9' },
    { id: 'shirt-vest', name: 'cozy vest', slot: 'shirt', source: 'quest', look: 'vest', color: '#c4784a' },
    { id: 'shirt-cape', name: 'star cape', slot: 'shirt', source: 'game', look: 'cape', color: '#5f7a52' },
    { id: 'shirt-leaf', name: 'leaf cape', slot: 'shirt', source: 'outing', outing: 'outing-camp', look: 'leafcape', color: '#3d6b4f' },
    { id: 'shirt-hoodie', name: 'soft hoodie', slot: 'shirt', source: 'shop', price: 12, look: 'hoodie', color: '#e07a5f' },
    { id: 'shirt-star', name: 'star shirt', slot: 'shirt', source: 'shop', price: 10, look: 'starshirt', color: '#f0e0a0' },
    { id: 'shoes-cloud', name: 'cloud shoes', slot: 'shoes', source: 'starter', look: 'cloud', color: '#fffaf0' },
    { id: 'shoes-boots', name: 'walk boots', slot: 'shoes', source: 'quest', look: 'boots', color: '#a35f38' },
    { id: 'shoes-sandals', name: 'day sandals', slot: 'shoes', source: 'game', look: 'sandals', color: '#e8c49a' },
    { id: 'shoes-rain', name: 'rain boots', slot: 'shoes', source: 'shop', price: 10, look: 'rain', color: '#8eb4c9' },
    { id: 'shoes-ballet', name: 'soft slippers', slot: 'shoes', source: 'shop', price: 8, look: 'slippers', color: '#f0a0c0' },
    { id: 'pack-satchel', name: 'little satchel', slot: 'pack', source: 'quest', look: 'satchel', color: '#c4784a' },
    { id: 'pack-bee', name: 'bee wings', slot: 'pack', source: 'game', look: 'bee', color: '#e8c84a' },
    { id: 'wings-bird', name: 'bird wings', slot: 'pack', source: 'game', look: 'bird', color: '#d7e6ef' },
    { id: 'pack-pack', name: 'day backpack', slot: 'pack', source: 'outing', outing: 'outing-play', look: 'backpack', color: '#5f7a52' },
    { id: 'wings-butterfly', name: 'butterfly wings', slot: 'pack', source: 'shop', price: 15, look: 'butterfly', color: '#f0a0c0' }
  ];

  function byId(id) {
    var i;
    for (i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i];
    return null;
  }

  function blankOutfit() {
    return { hat: '', glasses: '', scarf: '', shirt: '', shoes: '', pack: '' };
  }

  function ensure(state) {
    if (!state.closet || typeof state.closet !== 'object' || Array.isArray(state.closet)) {
      state.closet = { owned: STARTER.slice() };
    }
    if (!Array.isArray(state.closet.owned)) state.closet.owned = STARTER.slice();
    var i;
    for (i = 0; i < STARTER.length; i++) {
      if (state.closet.owned.indexOf(STARTER[i]) === -1) state.closet.owned.push(STARTER[i]);
    }
    if (!state.outfit || typeof state.outfit !== 'object' || Array.isArray(state.outfit)) {
      state.outfit = blankOutfit();
    }
    var base = blankOutfit();
    var key;
    for (key in base) {
      if (!Object.prototype.hasOwnProperty.call(base, key)) continue;
      if (typeof state.outfit[key] !== 'string') state.outfit[key] = '';
      if (state.outfit[key] && state.closet.owned.indexOf(state.outfit[key]) === -1) state.outfit[key] = '';
    }
    return state;
  }

  function owns(state, id) {
    var list = state && state.closet && state.closet.owned;
    if (!Array.isArray(list)) return STARTER.indexOf(id) !== -1;
    return list.indexOf(id) !== -1;
  }

  function grant(state, id) {
    ensure(state);
    var item = byId(id);
    if (!item) return null;
    if (state.closet.owned.indexOf(id) === -1) state.closet.owned.push(id);
    return item;
  }

  function grantFrom(state, source) {
    ensure(state);
    var i;
    for (i = 0; i < ITEMS.length; i++) {
      if (ITEMS[i].source !== source) continue;
      if (state.closet.owned.indexOf(ITEMS[i].id) !== -1) continue;
      return grant(state, ITEMS[i].id);
    }
    return null;
  }

  function visible(state, slot) {
    ensure(state);
    var out = [];
    var i;
    for (i = 0; i < ITEMS.length; i++) {
      if (slot && ITEMS[i].slot !== slot) continue;
      if (state.closet.owned.indexOf(ITEMS[i].id) === -1) continue;
      out.push(ITEMS[i]);
    }
    return out;
  }

  function forSale(state) {
    ensure(state);
    var out = [];
    var i;
    for (i = 0; i < ITEMS.length; i++) {
      if (ITEMS[i].source !== 'shop') continue;
      if (state.closet.owned.indexOf(ITEMS[i].id) !== -1) continue;
      out.push(ITEMS[i]);
    }
    return out;
  }

  function toggle(state, id) {
    ensure(state);
    var item = byId(id);
    if (!item || !owns(state, id)) return { ok: false, item: null };
    if (state.outfit[item.slot] === id) {
      state.outfit[item.slot] = '';
      return { ok: true, worn: false, item: item };
    }
    state.outfit[item.slot] = id;
    return { ok: true, worn: true, item: item };
  }

  function purchase(state, id, input, grade) {
    ensure(state);
    var item = byId(id);
    var coins = PQBank ? PQBank.getCoins(state) : 0;
    if (!item || item.source !== 'shop') {
      return { ok: false, hint: 'That is not on the shelf.', coins: coins, spent: 0 };
    }
    if (owns(state, id)) {
      return { ok: false, hint: 'That is already in the closet.', coins: coins, spent: 0, already: true };
    }
    var problem = (input && input.problem) || (PQShop && PQShop.problemFor(item, grade, Math.random));
    var check = PQShop ? PQShop.checkProblem(problem, input || {}) : { ok: false, hint: 'Not yet.' };
    if (!check.ok) {
      if (PQBank) PQBank.noteMistake(state);
      return { ok: false, hint: check.hint, coins: PQBank.getCoins(state), spent: 0 };
    }
    var price = item.price || (problem && problem.price) || 0;
    if (!PQBank || !PQBank.spendCoins(state, price)) {
      return {
        ok: false,
        hint: 'The bank does not have enough yet. You can earn more and come back.',
        coins: PQBank ? PQBank.getCoins(state) : 0,
        spent: 0
      };
    }
    grant(state, id);
    return {
      ok: true,
      item: item,
      hint: '',
      coins: PQBank.getCoins(state),
      spent: price,
      message: item.name + ' is in the closet.'
    };
  }

  function drawLook(item) {
    var c = item.color || '#c4784a';
    var look = item.look;
    if (look === 'sunhat') {
      return '<ellipse cx="0" cy="6" rx="26" ry="7" fill="' + c + '"/><path d="M-12 -2 Q0 -22 12 -2 Z" fill="' + c + '"/><ellipse cx="0" cy="-2" rx="12" ry="4" fill="#f0e0a0"/>';
    }
    if (look === 'beanie') {
      return '<path d="M-16 8 Q-16 -16 0 -18 Q16 -16 16 8 Z" fill="' + c + '"/><rect x="-16" y="4" width="32" height="8" rx="3" fill="#3d6b4f"/>';
    }
    if (look === 'explorer') {
      return '<ellipse cx="0" cy="8" rx="28" ry="7" fill="' + c + '"/><rect x="-12" y="-12" width="24" height="16" rx="4" fill="#e8c49a"/><rect x="-12" y="-2" width="24" height="5" fill="#5c4030"/>';
    }
    if (look === 'flower') {
      return '<circle cx="0" cy="0" r="5" fill="#e8c84a"/><circle cx="-10" cy="0" r="6" fill="' + c + '"/><circle cx="10" cy="0" r="6" fill="' + c + '"/><circle cx="0" cy="-10" r="6" fill="' + c + '"/><circle cx="0" cy="10" r="6" fill="#f0a0c0"/>';
    }
    if (look === 'party') {
      return '<polygon points="0,-20 14,12 -14,12" fill="' + c + '"/><circle cx="0" cy="-4" r="3" fill="#e8c84a"/><rect x="-16" y="10" width="32" height="5" fill="#e8c84a"/>';
    }
    if (look === 'crown') {
      return '<path d="M-18 10 L-18 -2 L-8 6 L0 -12 L8 6 L18 -2 L18 10 Z" fill="' + c + '" stroke="#a35f38" stroke-width="1.5"/>';
    }
    if (look === 'round' || look === 'sun' || look === 'heart' || look === 'square' || look === 'star') {
      var lens = look === 'sun' ? c : 'none';
      var stroke = look === 'sun' ? '#2c241c' : c;
      var shape = look === 'square'
        ? '<rect x="-22" y="-10" width="16" height="14" fill="' + lens + '" stroke="' + stroke + '" stroke-width="2"/><rect x="6" y="-10" width="16" height="14" fill="' + lens + '" stroke="' + stroke + '" stroke-width="2"/>'
        : '<circle cx="-12" cy="-2" r="9" fill="' + lens + '" stroke="' + stroke + '" stroke-width="2"/><circle cx="12" cy="-2" r="9" fill="' + lens + '" stroke="' + stroke + '" stroke-width="2"/>';
      var extra = '';
      if (look === 'star') extra = '<polygon points="0,-6 1.2,-2 5,-2 2,0 3,4 0,2 -3,4 -2,0 -5,-2 -1.2,-2" fill="' + c + '"/>';
      if (look === 'heart') extra = '<path d="M0 6 L-4 2 Q-6 -1 -3 -1 Q0 -1 0 2 Q0 -1 3 -1 Q6 -1 4 2 Z" fill="' + c + '"/>';
      return shape + '<path d="M-3 -2 H3" stroke="' + stroke + '" stroke-width="2"/>' + extra;
    }
    if (look === 'bow' || look === 'polka') {
      var dots = look === 'polka' ? '<circle cx="-8" cy="-2" r="2" fill="#fffaf0"/><circle cx="8" cy="2" r="2" fill="#fffaf0"/>' : '';
      return '<path d="M0 0 L-18 -10 L-18 10 Z" fill="' + c + '"/><path d="M0 0 L18 -10 L18 10 Z" fill="' + c + '"/><circle cx="0" cy="0" r="4" fill="#a35f38"/>' + dots;
    }
    if (look === 'bandana') {
      return '<path d="M-20 -4 H20 L0 16 Z" fill="' + c + '"/>';
    }
    if (look === 'ribbon') {
      return '<path d="M0 0 L-16 -8 L-10 2 Z" fill="' + c + '"/><path d="M0 0 L16 -8 L10 2 Z" fill="' + c + '"/><path d="M-4 2 L-8 16 M4 2 L8 16" stroke="' + c + '" stroke-width="3"/>';
    }
    if (look === 'scarf') {
      return '<path d="M-18 -2 H18 L14 8 H-14 Z" fill="' + c + '"/><path d="M-6 8 L-10 22 H-2 Z" fill="' + c + '"/><path d="M4 8 L8 20 H0 Z" fill="' + c + '"/>';
    }
    if (look === 'stripe') {
      return '<path d="M-18 14 L-14 -10 H14 L18 14 Z" fill="#fffaf0"/><path d="M-16 0 H16 M-17 6 H17" stroke="' + c + '" stroke-width="3"/>';
    }
    if (look === 'vest') {
      return '<path d="M-16 16 L-12 -8 H12 L16 16 Z" fill="' + c + '"/><path d="M-4 -8 L0 8 L4 -8" fill="#fffaf0"/>';
    }
    if (look === 'cape') {
      return '<path d="M-22 16 Q0 -8 22 16 L14 -6 H-14 Z" fill="' + c + '"/><polygon points="0,-12 2,-6 8,-6 3,-2 5,4 0,1 -5,4 -3,-2 -8,-6 -2,-6" fill="#e8c84a"/>';
    }
    if (look === 'leafcape') {
      return '<path d="M-20 14 Q0 -12 20 14 L0 4 Z" fill="' + c + '"/><path d="M0 -6 V12" stroke="#e8c84a" stroke-width="1.5"/>';
    }
    if (look === 'hoodie') {
      return '<path d="M-16 16 L-14 -2 Q0 -16 14 -2 L16 16 Z" fill="' + c + '"/><circle cx="0" cy="-4" r="6" fill="#fffaf0"/>';
    }
    if (look === 'starshirt') {
      return '<path d="M-16 16 L-12 -8 H12 L16 16 Z" fill="' + c + '"/><polygon points="0,-4 1.4,0 6,0 2,3 3,8 0,5 -3,8 -2,3 -6,0 -1.4,0" fill="#e8c84a"/>';
    }
    if (look === 'cloud' || look === 'sandals' || look === 'slippers') {
      var shoe = look === 'sandals'
        ? '<ellipse cx="-12" cy="4" rx="8" ry="4" fill="none" stroke="' + c + '" stroke-width="2"/><ellipse cx="12" cy="4" rx="8" ry="4" fill="none" stroke="' + c + '" stroke-width="2"/>'
        : '<ellipse cx="-12" cy="4" rx="9" ry="5" fill="' + c + '" stroke="#d7d2cc" stroke-width="1"/><ellipse cx="12" cy="4" rx="9" ry="5" fill="' + c + '" stroke="#d7d2cc" stroke-width="1"/>';
      return shoe;
    }
    if (look === 'boots' || look === 'rain') {
      var band = look === 'rain' ? '<path d="M-18 -2 H-6 M6 -2 H18" stroke="#fffaf0" stroke-width="2"/>' : '';
      return '<path d="M-20 8 L-16 -10 H-6 L-4 8 Z" fill="' + c + '"/><path d="M4 8 L6 -10 H16 L20 8 Z" fill="' + c + '"/>' + band;
    }
    if (look === 'satchel') {
      return '<rect x="-12" y="-8" width="24" height="20" rx="4" fill="' + c + '"/><path d="M-12 -2 H12" stroke="#fffaf0" stroke-width="2"/><circle cx="0" cy="4" r="2" fill="#e8c84a"/>';
    }
    if (look === 'backpack') {
      return '<rect x="-12" y="-10" width="24" height="26" rx="5" fill="' + c + '"/><rect x="-8" y="-4" width="16" height="10" rx="2" fill="#e8c49a"/><path d="M-8 -10 V-16 H8 V-10" fill="none" stroke="#3d6b4f" stroke-width="2"/>';
    }
    if (look === 'bee') {
      return '<ellipse cx="-12" cy="0" rx="10" ry="7" fill="' + c + '" opacity="0.85"/><ellipse cx="12" cy="0" rx="10" ry="7" fill="' + c + '" opacity="0.85"/><path d="M-16 -4 H-8 M8 -4 H16" stroke="#5c4030" stroke-width="1.2"/>';
    }
    if (look === 'bird') {
      return '<path d="M-4 0 Q-22 -12 -18 8 Q-10 4 -4 2 Z" fill="' + c + '"/><path d="M4 0 Q22 -12 18 8 Q10 4 4 2 Z" fill="' + c + '"/>';
    }
    if (look === 'butterfly') {
      return '<ellipse cx="-12" cy="-4" rx="10" ry="8" fill="' + c + '"/><ellipse cx="12" cy="-4" rx="10" ry="8" fill="' + c + '"/><ellipse cx="-10" cy="8" rx="7" ry="6" fill="#8eb4c9"/><ellipse cx="10" cy="8" rx="7" ry="6" fill="#8eb4c9"/>';
    }
    return '<circle cx="0" cy="0" r="8" fill="' + c + '"/>';
  }

  function placeOf(petId, stage, slot) {
    var base = {
      puppy: { hat: [100, 68], glasses: [100, 98], scarf: [100, 124], shirt: [100, 116], shoes: [100, 146], pack: [146, 108] },
      kitten: { hat: [100, 64], glasses: [100, 98], scarf: [100, 120], shirt: [100, 114], shoes: [100, 150], pack: [140, 112] },
      bunny: { hat: [100, 84], glasses: [100, 104], scarf: [100, 126], shirt: [100, 120], shoes: [100, 152], pack: [138, 116] },
      owl: { hat: [100, 62], glasses: [100, 100], scarf: [100, 130], shirt: [100, 118], shoes: [100, 158], pack: [150, 104] }
    };
    var table = base[petId] || base.bunny;
    var pt = table[slot] || [100, 100];
    var y = pt[1];
    stage = stage || 0;
    if (petId === 'bunny' && slot === 'hat') y -= stage * 3;
    if (slot === 'shoes') y += Math.min(4, stage);
    if (petId === 'owl' && slot === 'hat') y -= stage;
    var scale = 1;
    if (petId === 'owl' && slot === 'glasses') scale = 1.25;
    if (petId === 'bunny' && slot === 'hat') scale = 0.82;
    if (petId === 'kitten' && slot === 'hat') scale = 0.9;
    return { x: pt[0], y: y, scale: scale };
  }

  function icon(item) {
    if (!item) return '';
    return '<svg viewBox="-32 -32 64 64" width="48" height="48" aria-hidden="true">' + drawLook(item) + '</svg>';
  }

  function layers(petId, stage, outfit) {
    if (!outfit) return '';
    var order = ['pack', 'shirt', 'shoes', 'scarf', 'glasses', 'hat'];
    var out = '';
    var i;
    for (i = 0; i < order.length; i++) {
      var slot = order[i];
      var id = outfit[slot];
      if (!id) continue;
      var item = byId(id);
      if (!item) continue;
      var pt = placeOf(petId, stage, slot);
      out += '<g class="wear wear-' + slot + '" transform="translate(' + pt.x + ' ' + pt.y + ') scale(' + pt.scale + ')">' +
        drawLook(item) + '</g>';
    }
    return out;
  }

  return {
    SLOTS: SLOTS,
    STARTER: STARTER,
    ITEMS: ITEMS,
    byId: byId,
    ensure: ensure,
    owns: owns,
    grant: grant,
    grantFrom: grantFrom,
    visible: visible,
    forSale: forSale,
    toggle: toggle,
    purchase: purchase,
    icon: icon,
    layers: layers,
    placeOf: placeOf
  };
});
