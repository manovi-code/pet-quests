/**
 * Pet Quests — gentle return visits.
 * A daily gift, a sticker calendar, and a weekly goal gift.
 * A quiet day is fine. Nothing is taken away.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      typeof require !== 'undefined' ? require('./bank.js') : root.PQBank,
      typeof require !== 'undefined' ? require('./storage.js') : root.PQStorage
    );
  } else {
    root.PQDays = factory(root.PQBank, root.PQStorage);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (PQBank, PQStorage) {
  'use strict';

  var DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var NOTES = [
    'The bakery has a recipe card when you want to bake.',
    'Garden rows are a calm way to see groups.',
    'The pond is a quiet spot for adding and taking away.',
    'Your sticker book keeps the things you have found.',
    'The general store can wait. There is no rush.',
    'Playing with a toy sometimes leaves a small surprise.',
    'A hello for your pet is a good way to start.'
  ];

  function ensureDays(state) {
    if (!state.days || typeof state.days !== 'object' || Array.isArray(state.days)) {
      state.days = {};
    }
    var days = state.days;
    if (!Array.isArray(days.giftDates)) days.giftDates = [];
    if (!Array.isArray(days.visitDates)) days.visitDates = [];
    if (typeof days.careDate !== 'string' && days.careDate != null) days.careDate = null;
    if (!('careDate' in days)) days.careDate = null;
    if (!('weeklyClaimed' in days)) days.weeklyClaimed = null;
    return days;
  }

  function whatsNew(dateKey) {
    var key = String(dateKey || '');
    var n = 0;
    var i;
    for (i = 0; i < key.length; i++) n += key.charCodeAt(i);
    return NOTES[n % NOTES.length];
  }

  function onVisit(state, dateKey) {
    var days = ensureDays(state);
    var first = days.visitDates.indexOf(dateKey) === -1;
    if (first && dateKey) days.visitDates.push(dateKey);
    if (days.visitDates.length > 60) days.visitDates = days.visitDates.slice(-60);
    return {
      firstVisit: first,
      giftPending: !!(dateKey && days.giftDates.indexOf(dateKey) === -1),
      note: whatsNew(dateKey)
    };
  }

  function openGift(state, dateKey) {
    var days = ensureDays(state);
    if (!dateKey) dateKey = 'today';
    if (days.giftDates.indexOf(dateKey) !== -1) {
      return {
        already: true,
        coins: 0,
        message: 'You already opened today’s gift. Another one can wait until tomorrow.'
      };
    }
    days.giftDates.push(dateKey);
    var amount = 6;
    PQBank.addCoins(state, amount);
    return {
      already: false,
      coins: amount,
      message: 'A daily gift: ' + amount + ' coins. Glad you are here.'
    };
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function dateKeyFrom(d) {
    if (PQStorage && PQStorage.localDateKey) return PQStorage.localDateKey(d);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function calendar(state, weekKey) {
    ensureDays(state);
    var parts = String(weekKey || '2026-01-05').split('-');
    var start = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    var days = [];
    var stickers = 0;
    var i;
    for (i = 0; i < 7; i++) {
      var dt = new Date(start.getTime());
      dt.setDate(start.getDate() + i);
      var key = dateKeyFrom(dt);
      var on = state.days.visitDates.indexOf(key) !== -1;
      if (on) stickers += 1;
      days.push({ name: DAY_NAMES[i], key: key, sticker: on });
    }
    return {
      days: days,
      stickers: stickers,
      note: 'Days you visit get a sticker. A quiet day is okay.'
    };
  }

  function claimWeekly(state, weekKey, met) {
    var days = ensureDays(state);
    if (!met) {
      return { ok: false, coins: 0, message: 'A weekly gift waits for 5 finished quests. A quiet day is okay.' };
    }
    if (days.weeklyClaimed === weekKey) {
      return { ok: true, already: true, coins: 0, message: 'You already opened this week’s gift.' };
    }
    days.weeklyClaimed = weekKey;
    var amount = 10;
    PQBank.addCoins(state, amount);
    return { ok: true, already: false, coins: amount, message: 'Weekly goal gift: ' + amount + ' coins. Five quests this week.' };
  }

  function greet(state, dateKey, petName) {
    var days = ensureDays(state);
    var name = petName || 'Your pet';
    if (days.careDate === dateKey) {
      return { already: true, growth: 0, message: name + ' is glad you are here.' };
    }
    days.careDate = dateKey;
    return { already: false, growth: 1, message: 'Good to see you. ' + name + ' leans in for a hello.' };
  }

  function collection(state) {
    var world = (state && state.world) || {};
    var prizes = Array.isArray(world.prizes) ? world.prizes : [];
    var stickers = [];
    var i;
    for (i = 0; i < prizes.length; i++) {
      if (prizes[i] && prizes[i].kind === 'sticker') stickers.push(prizes[i]);
    }
    var decor = Array.isArray(world.unlocks) ? world.unlocks.length : 0;
    return { stickers: stickers, decor: decor };
  }

  return {
    ensureDays: ensureDays,
    whatsNew: whatsNew,
    onVisit: onVisit,
    openGift: openGift,
    calendar: calendar,
    claimWeekly: claimWeekly,
    greet: greet,
    collection: collection
  };
});
