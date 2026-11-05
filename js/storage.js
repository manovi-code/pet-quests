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

  var RANKS = [
    { id: 'scout', level: 1, label: 'Scout' },
    { id: 'explorer', level: 2, label: 'Explorer' },
    { id: 'ranger', level: 3, label: 'Ranger' },
    { id: 'keeper', level: 4, label: 'Keeper' },
    { id: 'champion', level: 5, label: 'Champion' }
  ];

  function clampLevel(grade) {
    var n = parseInt(grade, 10);
    if (n >= 1 && n <= 5) return n;
    return 2;
  }

  function rankFromGrade(grade) {
    var level = clampLevel(grade);
    var i;
    for (i = 0; i < RANKS.length; i++) {
      if (RANKS[i].level === level) return RANKS[i].id;
    }
    return 'explorer';
  }

  function gradeFromRank(rank) {
    var id = String(rank || '').toLowerCase();
    var i;
    for (i = 0; i < RANKS.length; i++) {
      if (RANKS[i].id === id) return RANKS[i].level;
    }
    return 0;
  }

  function rankLabel(gradeOrRank) {
    var level = gradeFromRank(gradeOrRank);
    if (!level) level = clampLevel(gradeOrRank);
    var i;
    for (i = 0; i < RANKS.length; i++) {
      if (RANKS[i].level === level) return RANKS[i].label;
    }
    return 'Explorer';
  }

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
        grade: 2,
        rank: 'explorer'
      },
      world: {
        unlocks: [],
        places: [],
        prizes: [],
        questDates: [],
        questsFinished: 0,
        activitiesDone: 0,
        hintTokens: 0,
        placements: {},
        migrateTown: false,
        solitaire: {
          dateKey: null,
          deals: 0
        },
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
        return migrateLoaded(mergeDeep(base, data), data);
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

  /**
   * Old saves stored a number called grade. Map it onto the adventure rank
   * without touching the pet, prizes, or quest history.
   * Saves from before the town update have no placements object; those get
   * a one-time flag so library and school can return on the new map.
   */
  function migrateLoaded(state, raw) {
    raw = raw || {};
    var rawCourses = raw.courses && typeof raw.courses === 'object' && !Array.isArray(raw.courses)
      ? raw.courses
      : {};
    var rawSettings = raw.settings && typeof raw.settings === 'object' && !Array.isArray(raw.settings)
      ? raw.settings
      : {};
    var hadRank = rawCourses.rank != null && String(rawCourses.rank) !== '';
    var hadGrade = rawCourses.grade != null && rawCourses.grade !== '';
    var hadSettings = rawSettings.grade != null && rawSettings.grade !== '';
    var level = 0;
    if (hadRank && hadGrade) {
      var fromRank = gradeFromRank(rawCourses.rank);
      var fromGrade = clampLevel(rawCourses.grade);
      // The number is what math already used. If it disagrees with a rank
      // label, keep her current difficulty and rename the label to match.
      level = fromRank === fromGrade ? fromRank : fromGrade;
    } else if (hadRank) {
      level = gradeFromRank(rawCourses.rank);
    } else if (hadSettings) {
      level = clampLevel(rawSettings.grade);
    } else if (hadGrade) {
      level = clampLevel(rawCourses.grade);
    }
    if (!level) level = clampLevel(state.courses && state.courses.grade);
    if (!state.courses || typeof state.courses !== 'object') state.courses = {};
    state.courses.grade = level;
    state.courses.rank = rankFromGrade(level);

    var rawWorld = raw.world && typeof raw.world === 'object' && !Array.isArray(raw.world)
      ? raw.world
      : null;
    var legacyTown = !rawWorld || !Object.prototype.hasOwnProperty.call(rawWorld, 'placements');
    var progress = false;
    if (rawWorld) {
      if (rawWorld.unlocks && rawWorld.unlocks.length) progress = true;
      if (rawWorld.places && rawWorld.places.length) progress = true;
      if (rawWorld.questsFinished > 0) progress = true;
      if (rawWorld.questDates && rawWorld.questDates.length) progress = true;
      if (rawWorld.prizes && rawWorld.prizes.length) progress = true;
    }
    if ((raw.growthPoints || 0) > 0) progress = true;
    if (raw.onboardingDone && raw.petId) progress = true;
    if (!state.world || typeof state.world !== 'object') state.world = {};
    state.world.migrateTown = !!(legacyTown && progress);
    return state;
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
    RANKS: RANKS,
    clampLevel: clampLevel,
    rankFromGrade: rankFromGrade,
    gradeFromRank: gradeFromRank,
    rankLabel: rankLabel,
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
