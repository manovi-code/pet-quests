/**
 * Pet Quests — a small neighborhood for pretend play.
 * Original drawings only. Roleplay has no fail state.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PQWorld = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var UNLOCKS = [
    {
      id: 'pet-bowl',
      house: 'pet',
      name: 'a food bowl',
      line: 'A food bowl showed up in the pet house.'
    },
    {
      id: 'library-seat',
      house: 'library',
      name: 'a window seat',
      line: 'The library has a new window seat.'
    },
    {
      id: 'school-bell',
      house: 'school',
      name: 'a school bell',
      line: 'The schoolhouse bell is ready to ring.'
    },
    {
      id: 'sunny-room',
      house: 'pet',
      name: 'a sunny room',
      line: 'A sunny room opened in the pet house.'
    },
    {
      id: 'window-box',
      house: 'cottage',
      name: 'a window box',
      line: 'Flowers opened in the cottage window box.'
    }
  ];

  var HOUSES = [
    {
      id: 'pet',
      title: 'Pet house',
      blurb: 'A cozy den',
      mission: null,
      actions: [
        {
          id: 'feed',
          label: 'Feed',
          lines: ['You share a few berries. {name} nibbles and stays close.'],
          whenUnlock: 'pet-bowl',
          unlockLines: ['You fill the bowl. {name} eats and looks pleased.']
        },
        {
          id: 'play',
          label: 'Play',
          lines: ['{name} bats a soft ball, then flops down happy.']
        },
        {
          id: 'tuck',
          label: 'Tuck in',
          lines: ['You pull up a blanket. {name} settles in.']
        },
        {
          id: 'window',
          label: 'Look out the window',
          lines: ['The garden is quiet. A bee visits a flower.']
        },
        {
          id: 'toy',
          label: 'Pick a toy',
          lines: [
            'You offer a ribbon. {name} carries it to the rug.',
            'You roll a wooden ball. {name} pounces, then looks proud.',
            'A leaf becomes a tiny toy. {name} watches it spin.'
          ]
        },
        {
          id: 'sunny',
          label: 'Visit the sunny room',
          requires: 'sunny-room',
          lines: ['Warm light fills the little room. {name} picks a sunny spot.']
        }
      ]
    },
    {
      id: 'cottage',
      title: 'Cozy cottage',
      blurb: 'Kitchen and kettle',
      mission: 'warmup',
      questLabel: 'Warmup in the kitchen',
      actions: [
        {
          id: 'kettle',
          label: 'Check the kettle',
          lines: ['The kettle hums. The kitchen smells like warm bread.']
        },
        {
          id: 'table',
          label: 'Set the table',
          lines: ['You set one plate and a cup. The table looks ready.']
        },
        {
          id: 'bread',
          label: 'Peek at the bread',
          lines: ['The loaf is golden and soft. You leave it to cool.']
        },
        {
          id: 'flowers',
          label: 'Smell the window box',
          requires: 'window-box',
          lines: ['Flowers lean out of the window box. They smell sweet.']
        }
      ]
    },
    {
      id: 'library',
      title: 'Library',
      blurb: 'Stories and quiet',
      mission: 'reading',
      questLabel: 'Read a pet story',
      actions: [
        {
          id: 'chair',
          label: 'Sit in the big chair',
          lines: ['The chair is soft. A good place for a story.']
        },
        {
          id: 'pictures',
          label: 'Look at the pictures',
          lines: ['The pictures show gardens, nests, and small boats.']
        },
        {
          id: 'seat',
          label: 'Curl up in the window seat',
          requires: 'library-seat',
          lines: ['The window seat has a cushion. You can see the path outside.']
        }
      ]
    },
    {
      id: 'school',
      title: 'Schoolhouse',
      blurb: 'Chalk and a bell',
      mission: 'multiply',
      questLabel: 'Times tables on the board',
      actions: [
        {
          id: 'plant',
          label: 'Water the plant',
          lines: ['You give the plant a little water. Its leaves look brighter.']
        },
        {
          id: 'doodle',
          label: 'Draw on the board',
          lines: ['You draw a star on the chalkboard and leave it there.']
        },
        {
          id: 'bell',
          label: 'Ring the bell',
          requires: 'school-bell',
          lines: ['You ring the bell once. It sounds clear and kind.']
        }
      ]
    }
  ];

  function escapeXml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getHouse(id) {
    var i;
    for (i = 0; i < HOUSES.length; i++) {
      if (HOUSES[i].id === id) return HOUSES[i];
    }
    return HOUSES[0];
  }

  function houseTitle(house, petName) {
    if (house && house.id === 'pet') return (petName || 'Pet') + '\u2019s house';
    return house ? house.title : '';
  }

  function houseIdForMission(mission) {
    var i;
    for (i = 0; i < HOUSES.length; i++) {
      if (HOUSES[i].mission === mission) return HOUSES[i].id;
    }
    return null;
  }

  function ensureWorld(state) {
    if (!state.world || typeof state.world !== 'object' || Array.isArray(state.world)) {
      state.world = { unlocks: [] };
    }
    if (!Array.isArray(state.world.unlocks)) state.world.unlocks = [];
    return state.world;
  }

  function hasUnlock(state, id) {
    var world = state && state.world;
    if (!world || !Array.isArray(world.unlocks)) return false;
    return world.unlocks.indexOf(id) !== -1;
  }

  function unlockInfo(id) {
    var i;
    for (i = 0; i < UNLOCKS.length; i++) {
      if (UNLOCKS[i].id === id) return UNLOCKS[i];
    }
    return null;
  }

  function grantNextUnlock(state) {
    var world = ensureWorld(state);
    var i;
    for (i = 0; i < UNLOCKS.length; i++) {
      if (world.unlocks.indexOf(UNLOCKS[i].id) === -1) {
        world.unlocks.push(UNLOCKS[i].id);
        return UNLOCKS[i];
      }
    }
    return null;
  }

  function actionsFor(house, state) {
    var list = (house && house.actions) || [];
    var out = [];
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i].requires && !hasUnlock(state, list[i].requires)) continue;
      out.push(list[i]);
    }
    return out;
  }

  function fillName(line, petName) {
    return String(line).replace(/\{name\}/g, petName || 'Your pet');
  }

  /**
   * Pretend-play. Always a cozy result — nothing to fail.
   * ctx: { petName, step }
   */
  function playAction(houseId, actionId, state, ctx) {
    ctx = ctx || {};
    var house = getHouse(houseId);
    var actions = house.actions || [];
    var action = null;
    var i;
    for (i = 0; i < actions.length; i++) {
      if (actions[i].id === actionId) action = actions[i];
    }
    if (!action) return { message: 'You look around the room. It feels peaceful.' };
    if (action.requires && !hasUnlock(state, action.requires)) {
      return { message: 'You look around the room. It feels peaceful.' };
    }
    var lines = action.lines;
    if (action.whenUnlock && action.unlockLines && hasUnlock(state, action.whenUnlock)) {
      lines = action.unlockLines;
    }
    var step = ctx.step || 0;
    var line = lines[step % lines.length];
    return { message: fillName(line, ctx.petName) };
  }

  function renderSkylineSvg() {
    return (
      '<svg class="skyline-svg" viewBox="0 0 360 120" width="100%" height="100%" aria-hidden="true">' +
      '<rect width="360" height="120" fill="#e7f0dc"/>' +
      '<circle cx="300" cy="36" r="16" fill="#f0e0a0"/>' +
      '<path d="M0 78 C70 60 120 90 180 74 C240 58 300 88 360 70 L360 120 L0 120 Z" fill="#b7c9a4"/>' +
      '<path d="M0 96 C80 88 140 104 220 94 C280 86 320 100 360 92 L360 120 L0 120 Z" fill="#8fa87a"/>' +
      '<rect x="40" y="58" width="46" height="34" rx="3" fill="#fffaf0" stroke="#c4784a" stroke-width="2"/>' +
      '<polygon points="34,60 63,40 92,60" fill="#c4784a"/>' +
      '<rect x="150" y="50" width="54" height="42" rx="3" fill="#fffaf0" stroke="#5f7a52" stroke-width="2"/>' +
      '<polygon points="144,52 177,32 210,52" fill="#5f7a52"/>' +
      '<rect x="250" y="46" width="50" height="46" rx="2" fill="#fff6e8" stroke="#a35f38" stroke-width="2"/>' +
      '<rect x="270" y="28" width="10" height="22" fill="#a35f38"/>' +
      '<circle cx="275" cy="26" r="6" fill="#e8c84a"/>' +
      '</svg>'
    );
  }

  function renderHouseFront(id) {
    if (id === 'library') {
      return (
        '<svg viewBox="0 0 120 90" width="100%" height="72" aria-hidden="true">' +
        '<rect x="18" y="28" width="84" height="52" rx="4" fill="#fffaf0" stroke="#5f7a52" stroke-width="3"/>' +
        '<polygon points="12,30 60,8 108,30" fill="#5f7a52"/>' +
        '<rect x="30" y="40" width="18" height="16" fill="#f0e0a0" stroke="#c4784a"/>' +
        '<rect x="72" y="40" width="18" height="16" fill="#f0e0a0" stroke="#c4784a"/>' +
        '<rect x="50" y="52" width="20" height="28" rx="2" fill="#7a9a68"/>' +
        '</svg>'
      );
    }
    if (id === 'school') {
      return (
        '<svg viewBox="0 0 120 90" width="100%" height="72" aria-hidden="true">' +
        '<rect x="16" y="36" width="88" height="46" fill="#fff6e8" stroke="#a35f38" stroke-width="3"/>' +
        '<polygon points="10,38 60,14 110,38" fill="#c4784a"/>' +
        '<rect x="52" y="8" width="16" height="22" fill="#a35f38"/>' +
        '<circle cx="60" cy="8" r="7" fill="#e8c84a"/>' +
        '<rect x="28" y="48" width="16" height="14" fill="#d7e6c8" stroke="#5f7a52"/>' +
        '<rect x="76" y="48" width="16" height="14" fill="#d7e6c8" stroke="#5f7a52"/>' +
        '<rect x="50" y="56" width="20" height="26" fill="#7a9a68"/>' +
        '</svg>'
      );
    }
    if (id === 'cottage') {
      return (
        '<svg viewBox="0 0 120 90" width="100%" height="72" aria-hidden="true">' +
        '<rect x="22" y="40" width="70" height="40" rx="3" fill="#fffaf0" stroke="#c4784a" stroke-width="3"/>' +
        '<polygon points="16,42 57,16 98,42" fill="#c4784a"/>' +
        '<rect x="78" y="28" width="10" height="18" fill="#a35f38"/>' +
        '<rect x="34" y="52" width="16" height="14" fill="#e7f0dc" stroke="#5f7a52"/>' +
        '<rect x="62" y="54" width="16" height="26" fill="#7a9a68"/>' +
        '</svg>'
      );
    }
    return (
      '<svg viewBox="0 0 120 90" width="100%" height="72" aria-hidden="true">' +
      '<ellipse cx="60" cy="78" rx="40" ry="8" fill="#d4c4a8" opacity="0.7"/>' +
      '<rect x="28" y="40" width="64" height="36" rx="16" fill="#fffaf0" stroke="#7a9a68" stroke-width="3"/>' +
      '<path d="M24 48 L60 22 L96 48" fill="#c4784a"/>' +
      '<circle cx="60" cy="58" r="8" fill="#e8c84a"/>' +
      '<rect x="52" y="58" width="16" height="18" rx="4" fill="#5f7a52"/>' +
      '</svg>'
    );
  }

  function renderRoomSvg(houseId, state) {
    var bowl = hasUnlock(state, 'pet-bowl')
      ? '<ellipse cx="78" cy="108" rx="16" ry="7" fill="#c4784a"/><ellipse cx="78" cy="105" rx="12" ry="5" fill="#f0e0a0"/>'
      : '';
    var sunny = hasUnlock(state, 'sunny-room')
      ? '<rect x="230" y="28" width="70" height="50" rx="6" fill="#fff6d8" stroke="#e8c84a" stroke-width="3"/>'
      : '';
    var seat = hasUnlock(state, 'library-seat')
      ? '<rect x="200" y="78" width="70" height="16" rx="8" fill="#c4784a"/><rect x="206" y="70" width="40" height="12" rx="6" fill="#f0e0a0"/>'
      : '';
    var bell = hasUnlock(state, 'school-bell')
      ? '<circle cx="250" cy="36" r="12" fill="#e8c84a" stroke="#a35f38" stroke-width="3"/>'
      : '';
    var box = hasUnlock(state, 'window-box')
      ? '<rect x="188" y="70" width="54" height="12" rx="3" fill="#a35f38"/><circle cx="200" cy="66" r="6" fill="#c4784a"/><circle cx="216" cy="62" r="7" fill="#e8c84a"/><circle cx="230" cy="66" r="6" fill="#7a9a68"/>'
      : '';
    var extra = '';
    var wall = '#fffaf0';
    var floor = '#e7d7c3';
    if (houseId === 'pet') extra = bowl + sunny;
    else if (houseId === 'library') {
      wall = '#f4f7ef';
      extra = seat + '<rect x="36" y="48" width="28" height="36" rx="2" fill="#7a9a68"/><rect x="70" y="40" width="28" height="44" rx="2" fill="#c4784a"/>';
    } else if (houseId === 'school') {
      wall = '#fff6e8';
      extra = bell + '<rect x="40" y="36" width="120" height="48" rx="4" fill="#2c241c"/><rect x="48" y="44" width="104" height="32" fill="#3d4a38"/>';
    } else if (houseId === 'cottage') {
      extra = box + '<rect x="40" y="70" width="70" height="28" rx="4" fill="#efe6d4" stroke="#c4784a"/>';
    }
    return (
      '<svg class="room-svg" viewBox="0 0 320 150" width="100%" height="100%" aria-hidden="true">' +
      '<rect width="320" height="110" fill="' + wall + '"/>' +
      '<rect y="110" width="320" height="40" fill="' + floor + '"/>' +
      '<rect x="24" y="28" width="64" height="48" rx="4" fill="#d7e6ef" stroke="#7a9a68" stroke-width="3"/>' +
      extra +
      '</svg>'
    );
  }

  return {
    HOUSES: HOUSES,
    UNLOCKS: UNLOCKS,
    getHouse: getHouse,
    houseTitle: houseTitle,
    houseIdForMission: houseIdForMission,
    ensureWorld: ensureWorld,
    hasUnlock: hasUnlock,
    unlockInfo: unlockInfo,
    grantNextUnlock: grantNextUnlock,
    actionsFor: actionsFor,
    playAction: playAction,
    renderSkylineSvg: renderSkylineSvg,
    renderHouseFront: renderHouseFront,
    renderRoomSvg: renderRoomSvg,
    escapeXml: escapeXml
  };
});
