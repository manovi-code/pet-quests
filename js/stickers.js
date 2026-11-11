/**
 * Pet Quests — sticker book art.
 * Each earned sticker and collection badge is an original drawing.
 * Stickers she has not found stay out of the book.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PQStickers = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var STICKERS = {
    'pet-sticker': { name: 'a paw-print sticker', motif: 'paw' },
    'library-sticker': { name: 'a book sticker', motif: 'book' },
    'school-sticker': { name: 'a chalk-star sticker', motif: 'star' },
    'garden-sticker': { name: 'a leaf sticker', motif: 'leaf' },
    'bakery-sticker': { name: 'a bread-loaf sticker', motif: 'bread' },
    'pond-sticker': { name: 'a duck sticker', motif: 'duck' },
    'friend-sticker': { name: 'a fox sticker', motif: 'fox' },
    'farm-sticker': { name: 'a hen sticker', motif: 'hen' },
    'market-sticker': { name: 'an apple sticker', motif: 'apple' },
    'playground-sticker': { name: 'a swing sticker', motif: 'swing' },
    'icecream-sticker': { name: 'a cone sticker', motif: 'cone' },
    'firehouse-sticker': { name: 'a bell sticker', motif: 'bell' },
    'zoo-sticker': { name: 'a rabbit sticker', motif: 'rabbit' },
    'vet-sticker': { name: 'a heart sticker', motif: 'heart' },
    'police-sticker': { name: 'a star sticker', motif: 'badge' },
    'museum-sticker': { name: 'a fossil sticker', motif: 'fossil' },
    'nature-sticker': { name: 'a nest sticker', motif: 'nest' },
    'parlor-sticker': { name: 'a card sticker', motif: 'card' },
    'store-sticker': { name: 'a ribbon sticker', motif: 'ribbon' },
    'toystore-sticker': { name: 'a block sticker', motif: 'block' },
    'bookstore-sticker': { name: 'a book sticker', motif: 'book2' },
    'aquarium-sticker': { name: 'a fish sticker', motif: 'fish' },
    'art-sticker': { name: 'a paint sticker', motif: 'paint' },
    'music-sticker': { name: 'a note sticker', motif: 'note' },
    'beach-sticker': { name: 'a shell sticker', motif: 'shell' },
    'camp-sticker': { name: 'a tent sticker', motif: 'tent' },
    'train-sticker': { name: 'a train sticker', motif: 'train' },
    'cottage-sticker': { name: 'a kettle sticker', motif: 'kettle' },
    'party-star-sticker': { name: 'a star sticker', motif: 'party' },
    'hike-photo': { name: 'a trail photo', motif: 'camera' },
    'play-photo': { name: 'a swing photo', motif: 'swing' },
    'beach-photo': { name: 'a beach photo', motif: 'wave' },
    'camp-photo': { name: 'a camp photo', motif: 'lantern' }
  };

  var COLLECTIONS = [
    { id: 'cozy', name: 'Cozy home', ids: ['pet-sticker', 'friend-sticker', 'cottage-sticker', 'party-star-sticker'] },
    { id: 'stories', name: 'Stories', ids: ['library-sticker', 'school-sticker', 'bookstore-sticker', 'museum-sticker'] },
    { id: 'tasty', name: 'Tasty town', ids: ['bakery-sticker', 'market-sticker', 'icecream-sticker', 'farm-sticker'] },
    { id: 'outdoors', name: 'Outdoors', ids: ['garden-sticker', 'pond-sticker', 'playground-sticker', 'nature-sticker', 'beach-sticker', 'camp-sticker'] },
    { id: 'helpers', name: 'Helpers', ids: ['firehouse-sticker', 'vet-sticker', 'police-sticker', 'zoo-sticker', 'aquarium-sticker'] },
    { id: 'play', name: 'Make and play', ids: ['parlor-sticker', 'toystore-sticker', 'art-sticker', 'music-sticker', 'train-sticker', 'store-sticker'] },
    { id: 'walks', name: 'Walks', ids: ['hike-photo', 'play-photo', 'beach-photo', 'camp-photo'] }
  ];

  function motif(kind) {
    if (kind === 'paw') {
      return '<ellipse cx="40" cy="48" rx="10" ry="8" fill="#c4784a"/><circle cx="28" cy="34" r="5" fill="#c4784a"/><circle cx="40" cy="30" r="5" fill="#c4784a"/><circle cx="52" cy="34" r="5" fill="#c4784a"/>';
    }
    if (kind === 'book' || kind === 'book2') {
      var cover = kind === 'book2' ? '#5f7a52' : '#c4784a';
      return '<path d="M26 28 H40 V58 H26 Q22 58 22 50 V36 Q22 28 26 28 Z" fill="' + cover + '"/><path d="M40 28 H54 Q58 28 58 36 V50 Q58 58 54 58 H40 Z" fill="#e8c84a"/><path d="M40 28 V58" stroke="#5c4030" stroke-width="1.5"/>';
    }
    if (kind === 'star' || kind === 'party') {
      var fill = kind === 'party' ? '#e07a5f' : '#e8c84a';
      return '<polygon points="40,24 44,36 56,36 46,44 50,56 40,48 30,56 34,44 24,36 36,36" fill="' + fill + '"/>';
    }
    if (kind === 'leaf') {
      return '<path d="M40 24 Q58 36 40 60 Q22 36 40 24 Z" fill="#7a9a68"/><path d="M40 30 V54" stroke="#3d6b4f" stroke-width="1.5"/>';
    }
    if (kind === 'bread') {
      return '<path d="M24 44 Q24 30 40 30 Q56 30 56 44 V52 H24 Z" fill="#e8c49a"/><path d="M30 38 H34 M40 36 H44 M48 38 H52" stroke="#a35f38" stroke-width="1.5" stroke-linecap="round"/>';
    }
    if (kind === 'duck') {
      return '<ellipse cx="40" cy="46" rx="14" ry="10" fill="#f0e0a0"/><circle cx="50" cy="40" r="7" fill="#f0e0a0"/><polygon points="56,40 64,37 56,44" fill="#e07a5f"/><circle cx="52" cy="38" r="1.4" fill="#2c241c"/>';
    }
    if (kind === 'fox') {
      return '<circle cx="40" cy="46" r="12" fill="#e8a05a"/><polygon points="28,40 24,26 36,36" fill="#e8a05a"/><polygon points="52,40 56,26 44,36" fill="#e8a05a"/><circle cx="36" cy="46" r="1.6" fill="#2c241c"/><circle cx="44" cy="46" r="1.6" fill="#2c241c"/>';
    }
    if (kind === 'hen') {
      return '<ellipse cx="40" cy="48" rx="14" ry="10" fill="#f0e0a0"/><circle cx="52" cy="42" r="6" fill="#f0e0a0"/><polygon points="56,42 62,40 56,46" fill="#e07a5f"/><path d="M48 34 L50 28 L52 34" fill="#d4564e"/>';
    }
    if (kind === 'apple') {
      return '<circle cx="40" cy="46" r="12" fill="#d4564e"/><path d="M40 34 Q44 26 48 30" fill="none" stroke="#5f7a52" stroke-width="2"/><ellipse cx="46" cy="32" rx="4" ry="2" fill="#7a9a68"/>';
    }
    if (kind === 'swing') {
      return '<path d="M30 26 H50" stroke="#a35f38" stroke-width="3"/><path d="M34 26 L32 48 M46 26 L48 48" stroke="#5c4030" stroke-width="1.5"/><rect x="30" y="46" width="20" height="6" rx="2" fill="#c4784a"/>';
    }
    if (kind === 'cone') {
      return '<polygon points="40,58 30,38 50,38" fill="#e8c49a"/><circle cx="40" cy="34" r="8" fill="#f0a0c0"/><circle cx="34" cy="30" r="3" fill="#e8c84a"/>';
    }
    if (kind === 'bell') {
      return '<path d="M28 48 Q40 26 52 48 Z" fill="#e8c84a"/><rect x="26" y="48" width="28" height="4" rx="2" fill="#a35f38"/><circle cx="40" cy="56" r="3" fill="#c4784a"/>';
    }
    if (kind === 'rabbit') {
      return '<ellipse cx="34" cy="30" rx="4" ry="10" fill="#f7efe4"/><ellipse cx="46" cy="30" rx="4" ry="10" fill="#f7efe4"/><circle cx="40" cy="48" r="12" fill="#f7efe4"/><circle cx="36" cy="46" r="1.5" fill="#2c241c"/><circle cx="44" cy="46" r="1.5" fill="#2c241c"/>';
    }
    if (kind === 'heart') {
      return '<path d="M40 56 L24 40 Q20 30 28 30 Q40 30 40 38 Q40 30 52 30 Q60 30 56 40 Z" fill="#e07a5f"/>';
    }
    if (kind === 'badge') {
      return '<polygon points="40,24 44,36 56,36 46,44 50,56 40,48 30,56 34,44 24,36 36,36" fill="#e8c84a" stroke="#5f7a52" stroke-width="2"/>';
    }
    if (kind === 'fossil') {
      return '<ellipse cx="40" cy="44" rx="16" ry="12" fill="#e7d7c0"/><path d="M30 44 H50 M40 34 V54 M32 36 L48 52 M48 36 L32 52" stroke="#8a7a62" stroke-width="1.4"/>';
    }
    if (kind === 'nest') {
      return '<path d="M24 48 Q40 64 56 48 Q48 44 40 46 Q32 44 24 48 Z" fill="#a35f38"/><circle cx="34" cy="46" r="3" fill="#f0e0a0"/><circle cx="42" cy="44" r="3" fill="#f0e0a0"/><circle cx="48" cy="47" r="3" fill="#fffaf0"/>';
    }
    if (kind === 'card') {
      return '<rect x="28" y="26" width="24" height="32" rx="3" fill="#fffaf0" stroke="#5f7a52" stroke-width="2"/><circle cx="40" cy="42" r="6" fill="#e8c84a"/>';
    }
    if (kind === 'ribbon') {
      return '<circle cx="40" cy="40" r="8" fill="#d4564e"/><path d="M32 46 L24 60 L36 52 M48 46 L56 60 L44 52" fill="#d4564e"/>';
    }
    if (kind === 'block') {
      return '<rect x="26" y="36" width="14" height="14" fill="#e07a5f"/><rect x="40" y="30" width="14" height="14" fill="#8eb4c9"/><rect x="34" y="48" width="14" height="10" fill="#e8c84a"/>';
    }
    if (kind === 'fish') {
      return '<ellipse cx="38" cy="44" rx="14" ry="8" fill="#8eb4c9"/><polygon points="52,44 64,36 64,52" fill="#5f8ea8"/><circle cx="30" cy="42" r="1.6" fill="#2c241c"/>';
    }
    if (kind === 'paint') {
      return '<circle cx="32" cy="40" r="6" fill="#d4564e"/><circle cx="44" cy="34" r="6" fill="#e8c84a"/><circle cx="48" cy="48" r="6" fill="#7a9a68"/><rect x="36" y="50" width="6" height="12" rx="1" fill="#a35f38"/>';
    }
    if (kind === 'note') {
      return '<ellipse cx="36" cy="52" rx="8" ry="6" fill="#3d4a62"/><rect x="42" y="28" width="4" height="24" fill="#3d4a62"/><path d="M46 28 H58 V36 H46" fill="#8eb4c9"/>';
    }
    if (kind === 'shell') {
      return '<path d="M24 50 Q40 24 56 50 Z" fill="#f0e0a0" stroke="#e8c49a" stroke-width="2"/><path d="M40 28 V50 M32 36 L40 50 M48 36 L40 50" stroke="#e0c090" stroke-width="1.2"/>';
    }
    if (kind === 'tent') {
      return '<polygon points="24,56 40,28 56,56" fill="#5f7a52"/><polygon points="36,56 40,46 44,56" fill="#243c2c"/>';
    }
    if (kind === 'train') {
      return '<rect x="22" y="36" width="32" height="18" rx="3" fill="#d4564e"/><circle cx="30" cy="56" r="4" fill="#2c241c"/><circle cx="46" cy="56" r="4" fill="#2c241c"/><rect x="26" y="40" width="8" height="6" fill="#d7e6ef"/>';
    }
    if (kind === 'kettle') {
      return '<path d="M28 40 H48 Q54 40 54 48 V54 H28 Z" fill="#d7e6ef"/><path d="M48 44 H58 Q60 48 54 50" fill="none" stroke="#8eb4c9" stroke-width="2"/><rect x="34" y="34" width="10" height="6" fill="#a35f38"/>';
    }
    if (kind === 'camera') {
      return '<rect x="22" y="34" width="36" height="24" rx="4" fill="#5f7a52"/><circle cx="40" cy="46" r="7" fill="#d7e6ef"/><circle cx="40" cy="46" r="3" fill="#3d4a62"/><rect x="32" y="28" width="12" height="6" fill="#3d6b4f"/>';
    }
    if (kind === 'wave') {
      return '<path d="M18 48 Q28 36 40 48 T62 48" fill="none" stroke="#8eb4c9" stroke-width="4" stroke-linecap="round"/><circle cx="54" cy="32" r="6" fill="#f0e0a0"/>';
    }
    if (kind === 'lantern') {
      return '<rect x="32" y="32" width="16" height="22" rx="3" fill="#e8c84a"/><rect x="36" y="26" width="8" height="6" fill="#a35f38"/><path d="M40 36 V50" stroke="#fffaf0" stroke-width="2"/>';
    }
    return motif('paw');
  }

  function die(inner, label) {
    return '<svg class="sticker-svg" viewBox="0 0 80 80" role="img" aria-label="' + esc(label) + '">' +
      '<path d="M18 12 H54 Q68 12 68 26 V54 Q68 68 54 68 H26 Q12 68 12 54 V26 Q12 12 26 12 Z" fill="#fffaf0" stroke="#e7c7a1" stroke-width="3"/>' +
      '<circle cx="20" cy="20" r="2.4" fill="#f0d56a"/>' +
      '<circle cx="60" cy="20" r="2.4" fill="#f0d56a"/>' +
      '<circle cx="20" cy="60" r="2.4" fill="#f0d56a"/>' +
      '<circle cx="60" cy="60" r="2.4" fill="#f0d56a"/>' +
      inner +
      '</svg>';
  }

  function info(id) {
    return STICKERS[id] || null;
  }

  function svg(id, name) {
    var row = STICKERS[id];
    var label = (row && row.name) || name || 'sticker';
    var kind = row ? row.motif : 'paw';
    return die(motif(kind), label);
  }

  function badge(collectionId) {
    var col = null;
    var i;
    for (i = 0; i < COLLECTIONS.length; i++) {
      if (COLLECTIONS[i].id === collectionId) col = COLLECTIONS[i];
    }
    if (!col) return '';
    var sample = STICKERS[col.ids[0]];
    return '<svg class="badge-svg" viewBox="0 0 80 88" role="img" aria-label="' + esc(col.name) + ' badge">' +
      '<path d="M28 58 L22 84 L40 74 L58 84 L52 58" fill="#c4784a"/>' +
      '<circle cx="40" cy="36" r="24" fill="#e8c84a" stroke="#a35f38" stroke-width="3"/>' +
      '<circle cx="40" cy="36" r="18" fill="#fffaf0"/>' +
      '<g transform="translate(0 -6)">' + motif(sample ? sample.motif : 'star') + '</g>' +
      '</svg>';
  }

  function ownedMap(state) {
    var map = {};
    var prizes = state && state.world && state.world.prizes;
    var i;
    if (!prizes) return map;
    for (i = 0; i < prizes.length; i++) {
      if (prizes[i] && prizes[i].kind === 'sticker' && prizes[i].id) map[prizes[i].id] = prizes[i];
    }
    return map;
  }

  /**
   * Only stickers she has found. A collection badge appears after every
   * sticker in that set is found. Locked stickers are left out.
   */
  function book(state) {
    var owned = ownedMap(state);
    var known = {};
    var pages = [];
    var c;
    var i;
    for (c = 0; c < COLLECTIONS.length; c++) {
      var col = COLLECTIONS[c];
      var stickers = [];
      for (i = 0; i < col.ids.length; i++) {
        known[col.ids[i]] = true;
        if (!owned[col.ids[i]]) continue;
        var row = STICKERS[col.ids[i]] || { name: owned[col.ids[i]].name || 'a sticker' };
        stickers.push({ id: col.ids[i], name: owned[col.ids[i]].name || row.name });
      }
      if (!stickers.length) continue;
      pages.push({
        id: col.id,
        name: col.name,
        stickers: stickers,
        complete: stickers.length === col.ids.length
      });
    }
    var extra = [];
    var id;
    for (id in owned) {
      if (!Object.prototype.hasOwnProperty.call(owned, id) || known[id]) continue;
      extra.push({ id: id, name: owned[id].name || 'a sticker' });
    }
    if (extra.length) {
      pages.push({ id: 'saved', name: 'Saved stickers', stickers: extra, complete: false });
    }
    var decor = state && state.world && state.world.unlocks ? state.world.unlocks.length : 0;
    return { pages: pages, decor: decor };
  }

  return {
    STICKERS: STICKERS,
    COLLECTIONS: COLLECTIONS,
    info: info,
    svg: svg,
    badge: badge,
    book: book
  };
});
