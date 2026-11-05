/**
 * Pet Quests — localStorage persistence (versioned schema).
 * Works in browser; Node tests inject a mock store.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PQStorage = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var STORAGE_KEY = 'petquests_v1';
  // Stay on schema 1. New fields are added in defaultState() and filled in
  // by mergeDeep so a saved pet and quest history are not wiped.
  var SCHEMA_VERSION = 1;

  function defaultState() {
    return {
      version: SCHEMA_VERSION,
      onboardingDone: false,
      petId: null,
      petName: '',
      growthStage: 0,
      growthPoints: 0,
      soundOn: true,
      tableStats: {},
      factStats: {},
      courses: {
        parts: {
          warmup: true,
          reading: true,
          multiply: true
        },
        tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        grade: 2
      },
      world: {
        unlocks: [],
        places: [],
        prizes: [],
        questDates: [],
        questsFinished: 0,
        activitiesDone: 0,
        hintTokens: 0,
        activity: {
          dateKey: null,
          used: {}
        }
      },
      party: {
        dateKey: null,
        offered: false,
        skipped: false,
        spins: 0,
        cardRounds: 0
      },
      daily: {
        dateKey: null,
        completed: false,
        taskIndex: 0,
        tasks: [],
        answers: []
      },
      weekly: {
        weekKey: null,
        completedDates: []
      },
      readingUsedIds: [],
      createdAt: null,
      updatedAt: null
    };
  }

  function createStore(rawStore) {
    var memory = {};
    var store = rawStore || {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(memory, k) ? memory[k] : null; },
      setItem: function (k, v) { memory[k] = String(v); },
      removeItem: function (k) { delete memory[k]; }
    };

    function load() {
      try {
        var raw = store.getItem(STORAGE_KEY);
        if (!raw) return defaultState();
        var data = JSON.parse(raw);
        if (!data || typeof data !== 'object' || data.version !== SCHEMA_VERSION) {
          return defaultState();
        }
        var base = defaultState();
        return mergeDeep(base, data);
      } catch (e) {
        return defaultState();
      }
    }

    function save(state) {
      var next = mergeDeep(defaultState(), state || {});
      next.version = SCHEMA_VERSION;
      next.updatedAt = new Date().toISOString();
      if (!next.createdAt) next.createdAt = next.updatedAt;
      try {
        store.setItem(STORAGE_KEY, JSON.stringify(next));
        return true;
      } catch (e) {
        return false;
      }
    }

    function clear() {
      try {
        store.removeItem(STORAGE_KEY);
      } catch (e) { /* ignore */ }
      return defaultState();
    }

    return {
      STORAGE_KEY: STORAGE_KEY,
      SCHEMA_VERSION: SCHEMA_VERSION,
      defaultState: defaultState,
      load: load,
      save: save,
      clear: clear
    };
  }

  function mergeDeep(base, overlay) {
    var out = {};
    var k;
    for (k in base) {
      if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    }
    for (k in overlay) {
      if (!Object.prototype.hasOwnProperty.call(overlay, k)) continue;
      if (
        overlay[k] &&
        typeof overlay[k] === 'object' &&
        !Array.isArray(overlay[k]) &&
        base[k] &&
        typeof base[k] === 'object' &&
        !Array.isArray(base[k])
      ) {
        out[k] = mergeDeep(base[k], overlay[k]);
      } else {
        out[k] = overlay[k];
      }
    }
    return out;
  }

  /** Local calendar helpers (device timezone). */
  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function localDateKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  /** Monday = 0 … Sunday = 6, in the same local week as localWeekKey. */
  function localDayIndex(d) {
    d = d || new Date();
    var day = d.getDay(); // 0 Sun .. 6 Sat
    return day === 0 ? 6 : day - 1;
  }

  /** Monday–Sunday week key based on local Monday of the week containing d. */
  function localWeekKey(d) {
    d = d ? new Date(d.getTime()) : new Date();
    var day = d.getDay(); // 0 Sun .. 6 Sat
    var diffToMonday = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diffToMonday);
    return localDateKey(d);
  }

  function ensureWeek(state, now) {
    now = now || new Date();
    var wk = localWeekKey(now);
    if (!state.weekly || state.weekly.weekKey !== wk) {
      state.weekly = { weekKey: wk, completedDates: [] };
    }
    return state;
  }

  function markDailyComplete(state, now) {
    now = now || new Date();
    var dk = localDateKey(now);
    ensureWeek(state, now);
    state.daily.dateKey = dk;
    state.daily.completed = true;
    if (state.weekly.completedDates.indexOf(dk) === -1) {
      state.weekly.completedDates.push(dk);
    }
    return state;
  }

  function weeklyProgress(state, now) {
    ensureWeek(state, now || new Date());
    var count = (state.weekly.completedDates || []).length;
    var goal = 5;
    return {
      weekKey: state.weekly.weekKey,
      completed: count,
      goal: goal,
      met: count >= goal
    };
  }

  return {
    createStore: createStore,
    defaultState: defaultState,
    localDateKey: localDateKey,
    localDayIndex: localDayIndex,
    localWeekKey: localWeekKey,
    ensureWeek: ensureWeek,
    markDailyComplete: markDailyComplete,
    weeklyProgress: weeklyProgress,
    STORAGE_KEY: STORAGE_KEY,
    SCHEMA_VERSION: SCHEMA_VERSION
  };
});
