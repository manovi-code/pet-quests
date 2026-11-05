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
        },
        {
          id: 'surprise',
          label: 'Look for a surprise',
          bonus: true,
          lines: ['You and {name} look in a cozy corner.'],
          prizes: [
            { id: 'pet-sticker', name: 'a paw-print sticker', kind: 'sticker', once: true },
            { id: 'pet-cushion', name: 'a soft cushion', kind: 'decoration', once: true },
            { id: 'pet-treat', name: 'a berry treat', kind: 'treat', once: false }
          ]
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
        },
        {
          id: 'snack',
          label: 'Share a kitchen gift',
          bonus: true,
          lines: ['You wrap a little kitchen gift for {name}.'],
          prizes: [
            { id: 'cottage-sticker', name: 'a kettle sticker', kind: 'sticker', once: true },
            { id: 'cottage-cloth', name: 'a checked cloth', kind: 'decoration', once: true },
            { id: 'cottage-treat', name: 'a bread treat', kind: 'treat', once: false }
          ]
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
        },
        {
          id: 'books',
          label: 'Read an extra story',
          nav: 'library',
          lines: ['A short book is waiting on the table.']
        },
        {
          id: 'bookmark',
          label: 'Find a bookmark',
          bonus: true,
          lines: ['A bookmark peeks out of a picture book.'],
          prizes: [
            { id: 'library-sticker', name: 'a book sticker', kind: 'sticker', once: true },
            { id: 'library-bookmark', name: 'a leaf bookmark', kind: 'decoration', once: true },
            { id: 'library-hint', name: 'an extra gentle hint', kind: 'hint', once: false }
          ]
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
        },
        {
          id: 'hint-star',
          label: 'Look for a hint star',
          bonus: true,
          lines: ['A paper star sits on the chalk ledge.'],
          prizes: [
            { id: 'school-hint', name: 'an extra gentle hint', kind: 'hint', once: false },
            { id: 'school-sticker', name: 'a chalk-star sticker', kind: 'sticker', once: true }
          ]
        }
      ]
    },
    {
      id: 'garden',
      title: 'Garden',
      blurb: 'Berries and bees',
      mission: null,
      place: true,
      needsQuests: 1,
      needsActivities: 1,
      openLine: 'The garden gate is open. You can visit anytime.',
      actions: [
        {
          id: 'sniff',
          label: 'Smell the flowers',
          lines: ['The flowers smell sweet. A bee hums and moves on.']
        },
        {
          id: 'path',
          label: 'Walk the path',
          lines: ['The stone path is warm. {name} stays close to your side.']
        },
        {
          id: 'pick',
          label: 'Pick a garden gift',
          bonus: true,
          lines: ['You and {name} find something small among the leaves.'],
          prizes: [
            { id: 'garden-sticker', name: 'a leaf sticker', kind: 'sticker', once: true },
            { id: 'garden-pot', name: 'a flower-pot decoration', kind: 'decoration', once: true },
            { id: 'garden-berry', name: 'a berry treat', kind: 'treat', once: false }
          ]
        }
      ]
    },
    {
      id: 'bakery',
      title: 'Bakery',
      blurb: 'Warm treats',
      mission: null,
      place: true,
      needsQuests: 2,
      needsActivities: 3,
      openLine: 'The bakery door is open. It smells like fresh bread.',
      actions: [
        {
          id: 'window',
          label: 'Look in the window',
          lines: ['Round rolls cool on a wooden rack. The baker waves.']
        },
        {
          id: 'smell',
          label: 'Smell the bread',
          lines: ['The air is warm and soft. {name} sniffs and looks pleased.']
        },
        {
          id: 'treat',
          label: 'Take a bakery gift',
          bonus: true,
          lines: ['The baker wraps a little gift for you and {name}.'],
          prizes: [
            { id: 'bakery-sticker', name: 'a bread-loaf sticker', kind: 'sticker', once: true },
            { id: 'bakery-ribbon', name: 'a bakery ribbon', kind: 'decoration', once: true },
            { id: 'bakery-treat', name: 'a warm treat', kind: 'treat', once: false }
          ]
        }
      ]
    },
    {
      id: 'pond',
      title: 'Pond',
      blurb: 'Ducks and stones',
      mission: null,
      place: true,
      needsQuests: 3,
      needsActivities: 5,
      openLine: 'The pond path is open. The water looks calm.',
      actions: [
        {
          id: 'watch',
          label: 'Watch the ducks',
          lines: ['Two ducks glide by. They leave a quiet wake.']
        },
        {
          id: 'skip',
          label: 'Toss a pebble',
          lines: ['You toss one pebble. It makes a small ring on the water.']
        },
        {
          id: 'stone',
          label: 'Find a pond gift',
          bonus: true,
          lines: ['{name} noses a smooth stone into the light.'],
          prizes: [
            { id: 'pond-sticker', name: 'a duck sticker', kind: 'sticker', once: true },
            { id: 'pond-stone', name: 'a smooth-stone decoration', kind: 'decoration', once: true },
            { id: 'pond-treat', name: 'a seed treat', kind: 'treat', once: false }
          ]
        }
      ]
    },
    {
      id: 'friend',
      title: 'Friend\u2019s house',
      blurb: 'A visit next door',
      mission: null,
      place: true,
      needsQuests: 4,
      needsActivities: 7,
      openLine: 'Fern the fox opens the door. The friend\u2019s house is ready for visits.',
      actions: [
        {
          id: 'hello',
          label: 'Say hello to Fern',
          lines: ['Fern the fox waves. {name} sits politely on the rug.']
        },
        {
          id: 'cocoa',
          label: 'Share a cup',
          lines: ['You share a warm cup. Nobody is in a hurry.']
        },
        {
          id: 'trade',
          label: 'Trade a friend gift',
          bonus: true,
          lines: ['Fern the fox trades a small gift with you.'],
          prizes: [
            { id: 'friend-sticker', name: 'a fox sticker', kind: 'sticker', once: true },
            { id: 'friend-cushion', name: 'a visitor cushion', kind: 'decoration', once: true },
            { id: 'friend-treat', name: 'a shared treat', kind: 'treat', once: false }
          ]
        }
      ]
    }
  ];

  var STARTER_IDS = ['pet', 'cottage', 'library', 'school'];

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
    var world = state.world;
    if (!Array.isArray(world.unlocks)) world.unlocks = [];
    if (!Array.isArray(world.places)) world.places = [];
    if (!Array.isArray(world.prizes)) world.prizes = [];
    if (!Array.isArray(world.questDates)) world.questDates = [];
    if (typeof world.questsFinished !== 'number') world.questsFinished = world.questDates.length;
    if (typeof world.activitiesDone !== 'number') world.activitiesDone = 0;
    if (typeof world.hintTokens !== 'number') world.hintTokens = 0;
    if (!world.activity || typeof world.activity !== 'object' || Array.isArray(world.activity)) {
      world.activity = { dateKey: null, used: {} };
    }
    if (!world.activity.used || typeof world.activity.used !== 'object') world.activity.used = {};
    return world;
  }

  function isStarter(id) {
    return STARTER_IDS.indexOf(id) !== -1;
  }

  function isPlaceOpen(state, id) {
    if (isStarter(id)) return true;
    var world = state && state.world;
    if (!world || !Array.isArray(world.places)) return false;
    return world.places.indexOf(id) !== -1;
  }

  function placeProgress(state, place) {
    var world = ensureWorld(state);
    return {
      quests: world.questsFinished || 0,
      questsNeed: place && place.needsQuests ? place.needsQuests : 0,
      activities: world.activitiesDone || 0,
      activitiesNeed: place && place.needsActivities ? place.needsActivities : 0,
      open: place ? isPlaceOpen(state, place.id) : false
    };
  }

  function placeHelp(place, progress) {
    if (!place) return 'A new place will open as you play.';
    progress = progress || { quests: 0, activities: 0 };
    var qLeft = Math.max(0, (place.needsQuests || 0) - (progress.quests || 0));
    var aLeft = Math.max(0, (place.needsActivities || 0) - (progress.activities || 0));
    if (qLeft === 0 && aLeft === 0) return place.title + ' is ready to visit.';
    var parts = [];
    if (qLeft === 1) parts.push('1 more daily quest');
    else if (qLeft > 1) parts.push(qLeft + ' more daily quests');
    if (aLeft === 1) parts.push('1 more place activity');
    else if (aLeft > 1) parts.push(aLeft + ' more place activities');
    if (!parts.length) return place.title + ' is ready to visit.';
    return place.title + ' opens after ' + parts.join(' and ') + '.';
  }

  function nextLockedPlace(state) {
    var i;
    for (i = 0; i < HOUSES.length; i++) {
      if (!HOUSES[i].place) continue;
      if (!isPlaceOpen(state, HOUSES[i].id)) return HOUSES[i];
    }
    return null;
  }

  function checkPlaceUnlocks(state) {
    var world = ensureWorld(state);
    var opened = [];
    var i;
    for (i = 0; i < HOUSES.length; i++) {
      var place = HOUSES[i];
      if (!place.place) continue;
      if (world.places.indexOf(place.id) !== -1) continue;
      if ((world.questsFinished || 0) >= place.needsQuests &&
          (world.activitiesDone || 0) >= place.needsActivities) {
        world.places.push(place.id);
        opened.push(place);
      }
    }
    return opened;
  }

  function noteQuestFinished(state, dateKey) {
    var world = ensureWorld(state);
    if (dateKey) {
      if (world.questDates.indexOf(dateKey) === -1) world.questDates.push(dateKey);
      world.questsFinished = world.questDates.length;
    } else {
      world.questsFinished = (world.questsFinished || 0) + 1;
    }
    return checkPlaceUnlocks(state);
  }

  function hasPrize(state, id) {
    var world = state && state.world;
    var list = world && world.prizes;
    var i;
    if (!list) return false;
    for (i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) return true;
    }
    return false;
  }

  function findPrize(state, id) {
    var list = state.world.prizes;
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) return list[i];
    }
    return null;
  }

  /**
   * Save a prize on the device. A repeat of a one-time prize can fall back
   * to another gift so the moment still gives something.
   */
  function grantPrize(state, prize) {
    var world = ensureWorld(state);
    if (!prize) return null;
    if (prize.once && hasPrize(state, prize.id)) {
      if (prize.fallback) return grantPrize(state, prize.fallback);
      return findPrize(state, prize.id);
    }
    if (prize.kind === 'hint') world.hintTokens = (world.hintTokens || 0) + 1;
    var entry = {
      id: prize.id,
      name: prize.name,
      kind: prize.kind || 'sticker',
      place: prize.place || null
    };
    world.prizes.push(entry);
    return entry;
  }

  function pickPrize(pool, state, placeId) {
    pool = pool || [];
    if (!pool.length) {
      return { id: 'tiny-treat', name: 'a little treat', kind: 'treat', once: false };
    }
    var n = 0;
    var list = (state.world && state.world.prizes) || [];
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i] && list[i].place === placeId) n += 1;
    }
    for (i = 0; i < pool.length; i++) {
      var prize = pool[(n + i) % pool.length];
      if (!prize.once || !hasPrize(state, prize.id)) return prize;
    }
    return {
      id: 'repeat-treat',
      name: 'a little treat',
      kind: 'treat',
      once: false,
      place: pool[0].place || null
    };
  }

  function bonusUsedToday(state, placeId, dateKey) {
    var world = ensureWorld(state);
    if (!dateKey || world.activity.dateKey !== dateKey) return false;
    return !!world.activity.used[placeId];
  }

  function markBonusUsed(state, placeId, dateKey) {
    var world = ensureWorld(state);
    if (!dateKey || world.activity.dateKey !== dateKey) {
      world.activity = { dateKey: dateKey || null, used: {} };
    }
    world.activity.used[placeId] = true;
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
   * Pretend-play. Always a cozy result — nothing to get wrong.
   * ctx: { petName, step, dateKey }
   * A bonus action gives one saved prize per place per day.
   */
  function playAction(houseId, actionId, state, ctx) {
    ctx = ctx || {};
    var house = null;
    var h;
    for (h = 0; h < HOUSES.length; h++) {
      if (HOUSES[h].id === houseId) house = HOUSES[h];
    }
    if (!house) return { message: 'You look around. The neighborhood feels peaceful.', prize: null, opened: [] };
    if (!isPlaceOpen(state, house.id)) {
      return {
        message: placeHelp(house, placeProgress(state, house)),
        prize: null,
        opened: []
      };
    }
    var actions = house.actions || [];
    var action = null;
    var i;
    for (i = 0; i < actions.length; i++) {
      if (actions[i].id === actionId) action = actions[i];
    }
    if (!action) return { message: 'You look around the room. It feels peaceful.', prize: null, opened: [] };
    if (action.requires && !hasUnlock(state, action.requires)) {
      return { message: 'You look around the room. It feels peaceful.', prize: null, opened: [] };
    }
    var lines = action.lines;
    if (action.whenUnlock && action.unlockLines && hasUnlock(state, action.whenUnlock)) {
      lines = action.unlockLines;
    }
    var step = ctx.step || 0;
    var line = lines && lines.length ? lines[step % lines.length] : 'You look around the room. It feels peaceful.';
    if (action.bonus) {
      var dateKey = ctx.dateKey || 'today';
      if (bonusUsedToday(state, house.id, dateKey)) {
        return {
          message: fillName('You already found today\u2019s gift here. The room still feels glad you came.', ctx.petName),
          prize: null,
          already: true,
          opened: []
        };
      }
      markBonusUsed(state, house.id, dateKey);
      var world = ensureWorld(state);
      world.activitiesDone = (world.activitiesDone || 0) + 1;
      var spec = pickPrize(action.prizes, state, house.id);
      spec = {
        id: spec.id,
        name: spec.name,
        kind: spec.kind,
        once: spec.once,
        place: house.id,
        fallback: { id: 'bonus-treat', name: 'a little treat', kind: 'treat', once: false, place: house.id }
      };
      var prize = grantPrize(state, spec);
      var opened = checkPlaceUnlocks(state);
      var message = fillName(line, ctx.petName);
      if (prize && prize.name) {
        message += ' You get ' + prize.name + '. It is saved on this device.';
      }
      if (opened.length) message += ' ' + opened[0].openLine;
      return { message: message, prize: prize, already: false, opened: opened };
    }
    return { message: fillName(line, ctx.petName), prize: null, opened: [] };
  }

  function renderSkylineSvg(state) {
    var garden = state && isPlaceOpen(state, 'garden')
      ? '<circle cx="118" cy="92" r="5" fill="#c4784a"/><circle cx="128" cy="88" r="4" fill="#e8c84a"/><rect x="122" y="94" width="2" height="8" fill="#5f7a52"/>'
      : '';
    var pond = state && isPlaceOpen(state, 'pond')
      ? '<ellipse cx="210" cy="100" rx="16" ry="6" fill="#8eb4c9"/>'
      : '';
    return (
      '<svg class="skyline-svg" viewBox="0 0 360 120" width="100%" height="100%" aria-hidden="true">' +
      '<rect width="360" height="120" fill="#e7f0dc"/>' +
      '<circle cx="300" cy="36" r="16" fill="#f0e0a0"/>' +
      '<path d="M0 78 C70 60 120 90 180 74 C240 58 300 88 360 70 L360 120 L0 120 Z" fill="#b7c9a4"/>' +
      '<path d="M0 96 C80 88 140 104 220 94 C280 86 320 100 360 92 L360 120 L0 120 Z" fill="#8fa87a"/>' +
      garden +
      pond +
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
    if (id === 'garden') {
      return (
        '<svg viewBox="0 0 120 90" width="100%" height="72" aria-hidden="true">' +
        '<rect x="8" y="58" width="104" height="24" rx="8" fill="#8fa87a"/>' +
        '<rect x="18" y="46" width="10" height="22" fill="#5f7a52"/>' +
        '<circle cx="23" cy="40" r="12" fill="#7a9a68"/>' +
        '<circle cx="48" cy="62" r="7" fill="#c4784a"/>' +
        '<circle cx="64" cy="56" r="6" fill="#e8c84a"/>' +
        '<circle cx="80" cy="62" r="7" fill="#d4564e"/>' +
        '<circle cx="96" cy="58" r="5" fill="#f0e0a0"/>' +
        '</svg>'
      );
    }
    if (id === 'bakery') {
      return (
        '<svg viewBox="0 0 120 90" width="100%" height="72" aria-hidden="true">' +
        '<rect x="18" y="34" width="84" height="48" rx="4" fill="#fff6e8" stroke="#c4784a" stroke-width="3"/>' +
        '<polygon points="14,36 60,14 106,36" fill="#a35f38"/>' +
        '<rect x="30" y="46" width="28" height="18" fill="#f0e0a0" stroke="#5f7a52"/>' +
        '<ellipse cx="78" cy="58" rx="12" ry="8" fill="#e8c49a"/>' +
        '<rect x="52" y="64" width="16" height="18" fill="#7a9a68"/>' +
        '</svg>'
      );
    }
    if (id === 'pond') {
      return (
        '<svg viewBox="0 0 120 90" width="100%" height="72" aria-hidden="true">' +
        '<ellipse cx="60" cy="58" rx="46" ry="20" fill="#8eb4c9"/>' +
        '<ellipse cx="60" cy="56" rx="36" ry="12" fill="#b7d4e4"/>' +
        '<ellipse cx="40" cy="54" rx="10" ry="6" fill="#fffaf0"/>' +
        '<circle cx="36" cy="52" r="3" fill="#e8c84a"/>' +
        '<path d="M70 40 Q78 28 86 40" fill="none" stroke="#5f7a52" stroke-width="3"/>' +
        '<circle cx="92" cy="62" r="5" fill="#7a9a68"/>' +
        '</svg>'
      );
    }
    if (id === 'friend') {
      return (
        '<svg viewBox="0 0 120 90" width="100%" height="72" aria-hidden="true">' +
        '<rect x="24" y="38" width="72" height="42" rx="6" fill="#fffaf0" stroke="#c4784a" stroke-width="3"/>' +
        '<polygon points="18,40 60,16 102,40" fill="#c4784a"/>' +
        '<circle cx="46" cy="56" r="8" fill="#e8a05a"/>' +
        '<polygon points="40,50 46,40 52,50" fill="#e8a05a"/>' +
        '<rect x="68" y="50" width="16" height="14" fill="#d7e6ef" stroke="#5f7a52"/>' +
        '<rect x="54" y="60" width="14" height="20" fill="#7a9a68"/>' +
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
    var cushion = hasPrize(state, 'pet-cushion') || hasPrize(state, 'friend-cushion')
      ? '<rect x="120" y="96" width="36" height="14" rx="6" fill="#c4784a"/>'
      : '';
    var ribbon = hasPrize(state, 'party-ribbon') || hasPrize(state, 'bakery-ribbon')
      ? '<path d="M200 24 h46 l-6 10 6 10 h-46 z" fill="#c4784a"/>'
      : '';
    var extra = '';
    var wall = '#fffaf0';
    var floor = '#e7d7c3';
    if (houseId === 'pet') extra = bowl + sunny + cushion + ribbon;
    else if (houseId === 'library') {
      wall = '#f4f7ef';
      extra = seat + '<rect x="36" y="48" width="28" height="36" rx="2" fill="#7a9a68"/><rect x="70" y="40" width="28" height="44" rx="2" fill="#c4784a"/>' + ribbon;
    } else if (houseId === 'school') {
      wall = '#fff6e8';
      extra = bell + '<rect x="40" y="36" width="120" height="48" rx="4" fill="#2c241c"/><rect x="48" y="44" width="104" height="32" fill="#3d4a38"/>';
    } else if (houseId === 'cottage') {
      extra = box + '<rect x="40" y="70" width="70" height="28" rx="4" fill="#efe6d4" stroke="#c4784a"/>';
    } else if (houseId === 'garden') {
      wall = '#e7f0dc';
      floor = '#8fa87a';
      extra = '<circle cx="70" cy="78" r="10" fill="#c4784a"/><circle cx="96" cy="70" r="8" fill="#e8c84a"/><circle cx="120" cy="80" r="10" fill="#d4564e"/><circle cx="220" cy="40" r="14" fill="#f0e0a0"/>';
    } else if (houseId === 'bakery') {
      wall = '#fff6e8';
      extra = '<rect x="40" y="70" width="90" height="22" rx="4" fill="#efe6d4" stroke="#c4784a"/><ellipse cx="200" cy="78" rx="22" ry="12" fill="#e8c49a"/>' + ribbon;
    } else if (houseId === 'pond') {
      wall = '#e7f3f6';
      floor = '#d7e6c8';
      extra = '<ellipse cx="170" cy="100" rx="70" ry="22" fill="#8eb4c9"/><ellipse cx="150" cy="96" rx="14" ry="8" fill="#fffaf0"/>';
    } else if (houseId === 'friend') {
      extra = '<rect x="40" y="78" width="80" height="22" rx="8" fill="#c4784a"/><circle cx="230" cy="78" r="16" fill="#e8a05a"/><polygon points="218,70 230,48 242,70" fill="#e8a05a"/>' + cushion;
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
    STARTER_IDS: STARTER_IDS,
    getHouse: getHouse,
    houseTitle: houseTitle,
    houseIdForMission: houseIdForMission,
    ensureWorld: ensureWorld,
    hasUnlock: hasUnlock,
    unlockInfo: unlockInfo,
    grantNextUnlock: grantNextUnlock,
    isPlaceOpen: isPlaceOpen,
    placeProgress: placeProgress,
    placeHelp: placeHelp,
    nextLockedPlace: nextLockedPlace,
    checkPlaceUnlocks: checkPlaceUnlocks,
    noteQuestFinished: noteQuestFinished,
    hasPrize: hasPrize,
    grantPrize: grantPrize,
    actionsFor: actionsFor,
    playAction: playAction,
    renderSkylineSvg: renderSkylineSvg,
    renderHouseFront: renderHouseFront,
    renderRoomSvg: renderRoomSvg,
    escapeXml: escapeXml
  };
});
