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

  function starPoints(cx, cy, r) {
    var pts = [];
    var i;
    for (i = 0; i < 5; i++) {
      var outer = -Math.PI / 2 + i * 2 * Math.PI / 5;
      var inner = outer + Math.PI / 5;
      pts.push((cx + Math.cos(outer) * r).toFixed(1) + ',' + (cy + Math.sin(outer) * r).toFixed(1));
      pts.push((cx + Math.cos(inner) * (r * 0.42)).toFixed(1) + ',' + (cy + Math.sin(inner) * (r * 0.42)).toFixed(1));
    }
    return pts.join(' ');
  }

  function heartPath(cx, cy) {
    return 'M' + cx + ' ' + (cy + 6) +
      ' C' + (cx - 8) + ' ' + (cy + 1) + ' ' + (cx - 8) + ' ' + (cy - 6) + ' ' + (cx - 3.2) + ' ' + (cy - 6) +
      ' C' + (cx - 1) + ' ' + (cy - 6) + ' ' + cx + ' ' + (cy - 3) + ' ' + cx + ' ' + (cy - 1.2) +
      ' C' + cx + ' ' + (cy - 3) + ' ' + (cx + 1) + ' ' + (cy - 6) + ' ' + (cx + 3.2) + ' ' + (cy - 6) +
      ' C' + (cx + 8) + ' ' + (cy - 6) + ' ' + (cx + 8) + ' ' + (cy + 1) + ' ' + cx + ' ' + (cy + 6) + ' Z';
  }

  function drawLook(item) {
    var c = item.color || '#c4784a';
    var look = item.look;
    var shape = '<g data-shape="' + look + '">';
    var body = '';
    if (look === 'sunhat') {
      body = '<ellipse cx="0" cy="8" rx="26" ry="6" fill="' + c + '"/>' +
        '<path d="M-14 4 Q0 -20 14 4 Z" fill="' + c + '"/>' +
        '<ellipse cx="0" cy="2" rx="14" ry="4" fill="#f0e0a0"/>' +
        '<circle cx="0" cy="-8" r="5" fill="#e8c84a"/>' +
        '<path d="M0 -16 V-2 M-6 -12 H6 M-5 -5 H5" stroke="#e8c84a" stroke-width="1.6"/>';
    } else if (look === 'beanie') {
      body = '<path d="M-16 8 Q-18 -8 0 -18 Q18 -8 16 8 Z" fill="' + c + '"/>' +
        '<path d="M-10 -2 V8 M-4 -6 V8 M2 -6 V8 M8 -2 V8" stroke="#3d6b4f" stroke-width="1.4" opacity="0.7"/>' +
        '<rect x="-16" y="4" width="32" height="7" rx="3" fill="#3d6b4f"/>' +
        '<circle cx="0" cy="-18" r="4" fill="' + c + '"/>';
    } else if (look === 'explorer') {
      body = '<ellipse cx="0" cy="10" rx="28" ry="6" fill="' + c + '"/>' +
        '<path d="M-14 8 Q-16 -12 0 -16 Q16 -12 14 8 Z" fill="#e8c49a"/>' +
        '<rect x="-14" y="0" width="28" height="5" fill="#5c4030"/>' +
        '<path d="M-6 -8 H6" stroke="#a35f38" stroke-width="1.4"/>';
    } else if (look === 'flower') {
      body = '<path d="M-18 8 Q0 -6 18 8" fill="none" stroke="#5f7a52" stroke-width="3"/>' +
        '<circle cx="-14" cy="4" r="4" fill="' + c + '"/><circle cx="-14" cy="4" r="1.6" fill="#e8c84a"/>' +
        '<circle cx="-4" cy="-2" r="4" fill="#f0a0c0"/><circle cx="-4" cy="-2" r="1.6" fill="#e8c84a"/>' +
        '<circle cx="6" cy="-2" r="4" fill="' + c + '"/><circle cx="6" cy="-2" r="1.6" fill="#e8c84a"/>' +
        '<circle cx="16" cy="4" r="4" fill="#f0a0c0"/><circle cx="16" cy="4" r="1.6" fill="#e8c84a"/>';
    } else if (look === 'party') {
      body = '<polygon points="0,-22 16,12 -16,12" fill="' + c + '"/>' +
        '<path d="M-10 0 H10 M-12 6 H12" stroke="#e8c84a" stroke-width="2.4"/>' +
        '<circle cx="0" cy="-22" r="4" fill="#e8c84a"/>' +
        '<rect x="-16" y="10" width="32" height="4" fill="#e8c84a"/>';
    } else if (look === 'crown') {
      body = '<path d="M-20 10 L-20 -2 L-10 8 L0 -14 L10 8 L20 -2 L20 10 Z" fill="' + c + '" stroke="#a35f38" stroke-width="1.6"/>' +
        '<path d="M-16 10 H16" stroke="#fffaf0" stroke-width="1.4"/>' +
        '<circle cx="0" cy="2" r="2" fill="#d4564e"/><circle cx="-10" cy="6" r="1.4" fill="#8eb4c9"/><circle cx="10" cy="6" r="1.4" fill="#8eb4c9"/>';
    } else if (look === 'round') {
      body = '<circle cx="-13" cy="0" r="10" fill="#fffaf0" fill-opacity="0.72" stroke="' + c + '" stroke-width="3"/>' +
        '<circle cx="13" cy="0" r="10" fill="#fffaf0" fill-opacity="0.72" stroke="' + c + '" stroke-width="3"/>' +
        '<path d="M-3 0 H3" stroke="' + c + '" stroke-width="3"/>' +
        '<path d="M-23 1 L-30 6 M23 1 L30 6" stroke="' + c + '" stroke-width="3"/>';
    } else if (look === 'star') {
      body = '<polygon points="' + starPoints(-13, 0, 12) + '" fill="#fff6d8" stroke="' + c + '" stroke-width="2.6"/>' +
        '<polygon points="' + starPoints(13, 0, 12) + '" fill="#fff6d8" stroke="' + c + '" stroke-width="2.6"/>' +
        '<path d="M-1 0 H1 M-25 2 L-31 7 M25 2 L31 7" stroke="' + c + '" stroke-width="2.6"/>';
    } else if (look === 'sun') {
      body = '<circle cx="-13" cy="0" r="8" fill="' + c + '"/>' +
        '<circle cx="13" cy="0" r="8" fill="' + c + '"/>' +
        '<path d="M-4 0 H4" stroke="#2c241c" stroke-width="2"/>' +
        '<path d="M-13 -12 V-9 M-13 9 V12 M-23 0 H-20 M-6 0 H-3 M-20 -7 L-18 -5 M-8 -7 L-6 -5 M-20 7 L-18 5 M-8 7 L-6 5" stroke="#e8c84a" stroke-width="1.6"/>' +
        '<path d="M13 -12 V-9 M13 9 V12 M3 0 H6 M20 0 H23 M6 -7 L8 -5 M18 -7 L20 -5 M6 7 L8 5 M18 7 L20 5" stroke="#e8c84a" stroke-width="1.6"/>';
    } else if (look === 'heart') {
      body = '<path d="' + heartPath(-13, -1) + '" fill="#ffd5df" stroke="' + c + '" stroke-width="2.8"/>' +
        '<path d="' + heartPath(13, -1) + '" fill="#ffd5df" stroke="' + c + '" stroke-width="2.8"/>' +
        '<path d="M-4 0 H4 M-24 2 L-31 8 M24 2 L31 8" stroke="' + c + '" stroke-width="2.8"/>';
    } else if (look === 'square') {
      body = '<rect x="-23" y="-9" width="18" height="16" rx="1" fill="#f3f7ef" stroke="' + c + '" stroke-width="3"/>' +
        '<rect x="5" y="-9" width="18" height="16" rx="1" fill="#f3f7ef" stroke="' + c + '" stroke-width="3"/>' +
        '<path d="M-5 0 H5 M-23 0 L-30 5 M23 0 L30 5" stroke="' + c + '" stroke-width="3"/>';
    } else if (look === 'bow') {
      body = '<path d="M0 0 L-20 -12 L-16 0 L-20 12 Z" fill="' + c + '"/>' +
        '<path d="M0 0 L20 -12 L16 0 L20 12 Z" fill="' + c + '"/>' +
        '<circle cx="0" cy="0" r="3.5" fill="#a35f38"/>';
    } else if (look === 'polka') {
      body = '<path d="M0 0 L-20 -12 L-16 0 L-20 12 Z" fill="' + c + '"/>' +
        '<path d="M0 0 L20 -12 L16 0 L20 12 Z" fill="' + c + '"/>' +
        '<circle cx="0" cy="0" r="3.5" fill="#a35f38"/>' +
        '<circle cx="-10" cy="-4" r="1.7" fill="#fffaf0"/><circle cx="-8" cy="4" r="1.7" fill="#fffaf0"/>' +
        '<circle cx="10" cy="-3" r="1.7" fill="#fffaf0"/><circle cx="8" cy="5" r="1.7" fill="#fffaf0"/>' +
        '<circle cx="-14" cy="1" r="1.5" fill="#fffaf0"/><circle cx="14" cy="1" r="1.5" fill="#fffaf0"/>';
    } else if (look === 'bandana') {
      body = '<path d="M-22 -6 H22 L0 16 Z" fill="' + c + '"/>' +
        '<path d="M-8 2 L-4 8 L0 2 L4 8 L8 2" fill="none" stroke="#fffaf0" stroke-width="1.4"/>' +
        '<circle cx="-6" cy="6" r="1.3" fill="#fffaf0"/><circle cx="6" cy="6" r="1.3" fill="#fffaf0"/>';
    } else if (look === 'ribbon') {
      body = '<circle cx="0" cy="-2" r="5" fill="' + c + '"/>' +
        '<circle cx="0" cy="-2" r="2" fill="#fffaf0"/>' +
        '<path d="M-4 -2 L-16 -10 L-10 2 Z" fill="' + c + '"/>' +
        '<path d="M4 -2 L16 -10 L10 2 Z" fill="' + c + '"/>' +
        '<path d="M-3 2 L-8 16 M3 2 L8 16" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/>';
    } else if (look === 'scarf') {
      body = '<path d="M-20 -4 Q0 -12 20 -4 L16 6 H-16 Z" fill="' + c + '"/>' +
        '<path d="M-8 6 L-12 22 H-4 Z" fill="' + c + '"/>' +
        '<path d="M6 6 L10 20 H2 Z" fill="' + c + '"/>' +
        '<path d="M-16 0 H16" stroke="#fffaf0" stroke-width="1.5" opacity="0.8"/>';
    } else if (look === 'stripe') {
      body = '<path d="M-18 16 L-16 -2 L-8 -10 H8 L16 -2 L18 16 Z" fill="#fffaf0"/>' +
        '<path d="M-8 -10 L-14 4 H-18 L-16 -2 Z" fill="#fffaf0"/>' +
        '<path d="M8 -10 L14 4 H18 L16 -2 Z" fill="#fffaf0"/>' +
        '<path d="M-16 2 H16 M-17 7 H17 M-17 12 H17" stroke="' + c + '" stroke-width="2.4"/>';
    } else if (look === 'vest') {
      body = '<path d="M-16 16 L-14 -6 H-6 L0 4 L6 -6 H14 L16 16 Z" fill="' + c + '"/>' +
        '<path d="M-6 -6 L0 6 L6 -6" fill="#fffaf0"/>' +
        '<circle cx="-4" cy="6" r="1.3" fill="#e8c84a"/><circle cx="4" cy="6" r="1.3" fill="#e8c84a"/><circle cx="0" cy="11" r="1.3" fill="#e8c84a"/>';
    } else if (look === 'cape') {
      body = '<path d="M-22 16 Q0 -4 22 16 L12 -8 H-12 Z" fill="' + c + '"/>' +
        '<path d="M-12 -8 Q0 -16 12 -8" fill="#3d6b4f"/>' +
        '<polygon points="' + starPoints(0, 4, 7) + '" fill="#e8c84a"/>';
    } else if (look === 'leafcape') {
      body = '<path d="M0 -16 Q22 4 0 18 Q-22 4 0 -16 Z" fill="' + c + '"/>' +
        '<path d="M0 -12 V14 M0 0 L-8 4 M0 4 L8 8 M0 8 L-7 12" stroke="#e8c84a" stroke-width="1.4" fill="none"/>';
    } else if (look === 'hoodie') {
      body = '<path d="M-16 16 L-14 0 Q-18 -12 0 -16 Q18 -12 14 0 L16 16 Z" fill="' + c + '"/>' +
        '<path d="M-8 -2 Q0 -10 8 -2 Q0 2 -8 -2 Z" fill="#fffaf0"/>' +
        '<path d="M-6 8 H6" stroke="#fffaf0" stroke-width="2"/>' +
        '<circle cx="-3" cy="12" r="1.2" fill="#fffaf0"/><circle cx="3" cy="12" r="1.2" fill="#fffaf0"/>';
    } else if (look === 'starshirt') {
      body = '<path d="M-16 16 L-14 -2 L-8 -10 H8 L14 -2 L16 16 Z" fill="' + c + '"/>' +
        '<path d="M-8 -10 L-14 4 H-16 L-14 -2 Z M8 -10 L14 4 H16 L14 -2 Z" fill="' + c + '"/>' +
        '<polygon points="' + starPoints(0, 4, 8) + '" fill="#e8c84a"/>';
    } else if (look === 'cloud') {
      body = '<path d="M-28 4 Q-26 -4 -20 -2 Q-18 -10 -12 -6 Q-8 -12 -2 -6 Q2 -10 6 -4 Q12 -8 14 2 Q8 8 -22 8 Q-28 8 -28 4 Z" fill="' + c + '" stroke="#d7d2cc"/>' +
        '<path d="M2 4 Q4 -4 10 -2 Q12 -10 18 -6 Q22 -12 28 -4 Q32 -2 30 4 Q24 10 8 10 Q2 8 2 4 Z" fill="' + c + '" stroke="#d7d2cc"/>';
    } else if (look === 'boots') {
      body = '<path d="M-22 8 L-18 -12 H-8 L-6 4 H-2 L-4 8 Z" fill="' + c + '"/>' +
        '<path d="M2 8 L4 -12 H14 L18 4 H22 L20 8 Z" fill="' + c + '"/>' +
        '<path d="M-18 -4 H-8 M4 -4 H14" stroke="#5c4030" stroke-width="1.6"/>';
    } else if (look === 'sandals') {
      body = '<path d="M-22 6 Q-14 2 -6 6 L-8 10 H-20 Z" fill="' + c + '"/>' +
        '<path d="M6 6 Q14 2 22 6 L20 10 H8 Z" fill="' + c + '"/>' +
        '<path d="M-20 4 H-8 M-16 -2 V6 M8 4 H20 M14 -2 V6" stroke="' + c + '" stroke-width="2" fill="none"/>';
    } else if (look === 'rain') {
      body = '<path d="M-22 8 L-18 -16 H-8 L-6 8 Z" fill="' + c + '"/>' +
        '<path d="M4 8 L6 -16 H16 L20 8 Z" fill="' + c + '"/>' +
        '<path d="M-18 -8 H-8 M6 -8 H16" stroke="#fffaf0" stroke-width="2"/>' +
        '<path d="M-26 -6 V2 M-24 4 V8 M24 -8 V-2 M26 0 V6" stroke="#8eb4c9" stroke-width="1.6"/>';
    } else if (look === 'slippers') {
      body = '<path d="M-24 6 Q-20 -2 -10 -2 Q-6 2 -6 8 H-22 Z" fill="' + c + '"/>' +
        '<path d="M4 6 Q8 -2 18 -2 Q24 2 24 8 H6 Z" fill="' + c + '"/>' +
        '<path d="M-20 2 Q-14 -4 -8 2 M8 2 Q14 -4 20 2" fill="none" stroke="#fffaf0" stroke-width="1.5"/>';
    } else if (look === 'satchel') {
      body = '<path d="M-8 -16 Q0 -22 8 -16" fill="none" stroke="#5c4030" stroke-width="2"/>' +
        '<rect x="-14" y="-8" width="28" height="20" rx="3" fill="' + c + '"/>' +
        '<path d="M-14 -2 H14 L10 6 H-10 Z" fill="#a35f38"/>' +
        '<circle cx="0" cy="8" r="2" fill="#e8c84a"/>';
    } else if (look === 'backpack') {
      body = '<path d="M-10 -16 H-6 V-8 M10 -16 H6 V-8" fill="none" stroke="#3d6b4f" stroke-width="2.4"/>' +
        '<rect x="-14" y="-10" width="28" height="26" rx="5" fill="' + c + '"/>' +
        '<rect x="-8" y="-2" width="16" height="10" rx="2" fill="#e8c49a"/>' +
        '<path d="M-14 -2 H-18 V16 M14 -2 H18 V16" fill="none" stroke="#3d6b4f" stroke-width="2"/>' +
        '<circle cx="0" cy="12" r="1.6" fill="#e8c84a"/>';
    } else if (look === 'bee') {
      body = '<ellipse cx="0" cy="2" rx="4" ry="7" fill="#5c4030"/>' +
        '<path d="M-2 -2 H2 M-2 2 H2 M-2 6 H2" stroke="#e8c84a" stroke-width="1.4"/>' +
        '<ellipse cx="-12" cy="0" rx="10" ry="7" fill="' + c + '" opacity="0.9"/>' +
        '<ellipse cx="12" cy="0" rx="10" ry="7" fill="' + c + '" opacity="0.9"/>' +
        '<path d="M-16 -2 H-8 M8 -2 H16" stroke="#5c4030" stroke-width="1.2"/>';
    } else if (look === 'bird') {
      body = '<path d="M-2 0 Q-24 -16 -20 8 Q-12 2 -6 6 Q-10 -4 -2 0 Z" fill="' + c + '"/>' +
        '<path d="M2 0 Q24 -16 20 8 Q12 2 6 6 Q10 -4 2 0 Z" fill="' + c + '"/>' +
        '<path d="M-16 -6 Q-10 0 -14 6 M16 -6 Q10 0 14 6" fill="none" stroke="#8eb4c9" stroke-width="1.2"/>';
    } else if (look === 'butterfly') {
      body = '<path d="M0 -10 V12" stroke="#5c4030" stroke-width="2"/>' +
        '<ellipse cx="-12" cy="-4" rx="11" ry="8" fill="' + c + '"/>' +
        '<ellipse cx="12" cy="-4" rx="11" ry="8" fill="' + c + '"/>' +
        '<ellipse cx="-10" cy="8" rx="8" ry="6" fill="#8eb4c9"/>' +
        '<ellipse cx="10" cy="8" rx="8" ry="6" fill="#8eb4c9"/>' +
        '<circle cx="-12" cy="-4" r="2" fill="#e8c84a"/><circle cx="12" cy="-4" r="2" fill="#e8c84a"/>' +
        '<path d="M-2 -10 Q-6 -16 -2 -14 M2 -10 Q6 -16 2 -14" fill="none" stroke="#5c4030" stroke-width="1.2"/>';
    } else {
      body = '<circle cx="0" cy="0" r="8" fill="' + c + '"/>';
    }
    return shape + body + '</g>';
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
    if (slot === 'glasses') scale = Math.max(scale, 1.2);
    if (petId === 'owl' && slot === 'glasses') scale = 1.35;
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
