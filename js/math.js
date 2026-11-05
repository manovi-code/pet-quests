/**
 * Pet Quests — math practice: checking, hints, adaptive weighting.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PQMath = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var FRIENDLY_TABLES = [2, 5, 10, 1];
  var MID_TABLES = [3, 4, 11, 6];
  var HARD_TABLES = [7, 8, 9, 12];
  var ALL_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  // Easier tables first, then mid, then harder. Used for the weekly plan.
  var TABLE_PROGRESSION = [1, 2, 5, 10, 3, 4, 11, 6, 7, 8, 9, 12];

  function checkAnswer(expected, given) {
    var e = parseInt(String(expected).trim(), 10);
    var g = parseInt(String(given).trim(), 10);
    if (!isFinite(e) || !isFinite(g) || String(given).trim() === '') {
      return { ok: false, expected: e, given: null };
    }
    return { ok: e === g, expected: e, given: g };
  }

  function factKey(a, b, op) {
    op = op || '×';
    if (op === '×') {
      var lo = Math.min(a, b);
      var hi = Math.max(a, b);
      return lo + '×' + hi;
    }
    return a + op + b;
  }

  function tableAccuracy(tableStats, table) {
    var s = tableStats && tableStats[String(table)];
    if (!s || !s.attempts) return null;
    return s.correct / s.attempts;
  }

  function recordResult(state, task, correct) {
    if (!state.tableStats) state.tableStats = {};
    if (!state.factStats) state.factStats = {};
    if (task.type === 'mul') {
      var t = String(task.a);
      if (!state.tableStats[t]) state.tableStats[t] = { attempts: 0, correct: 0 };
      state.tableStats[t].attempts += 1;
      if (correct) state.tableStats[t].correct += 1;
      // also track other factor's table lightly
      var t2 = String(task.b);
      if (t2 !== t) {
        if (!state.tableStats[t2]) state.tableStats[t2] = { attempts: 0, correct: 0 };
        state.tableStats[t2].attempts += 1;
        if (correct) state.tableStats[t2].correct += 1;
      }
      var fk = factKey(task.a, task.b, '×');
      if (!state.factStats[fk]) state.factStats[fk] = { attempts: 0, correct: 0 };
      state.factStats[fk].attempts += 1;
      if (correct) state.factStats[fk].correct += 1;
    }
    return state;
  }

  function uniqueTables(list) {
    var out = [];
    var seen = {};
    var i, n;
    list = list || [];
    for (i = 0; i < list.length; i++) {
      n = parseInt(list[i], 10);
      if (n >= 1 && n <= 12 && !seen[n]) {
        seen[n] = true;
        out.push(n);
      }
    }
    return out;
  }

  /** Selected tables in easier → harder order. */
  function orderByEase(tables) {
    var wanted = {};
    var unique = uniqueTables(tables);
    var i;
    for (i = 0; i < unique.length; i++) wanted[unique[i]] = true;
    var ordered = [];
    for (i = 0; i < TABLE_PROGRESSION.length; i++) {
      if (wanted[TABLE_PROGRESSION[i]]) ordered.push(TABLE_PROGRESSION[i]);
    }
    return ordered;
  }

  /**
   * Weight tables toward weaker ones.
   * With no pool, a brand-new player still sees friendly tables first.
   * With options.pool, weights stay inside that day's tables only.
   * Review tables are down-weighted so they stay a small part of the mix.
   * Returns array of { table, weight }.
   */
  function weightedTables(tableStats, options) {
    options = options || {};
    var totalAttempts = 0;
    var t, s;
    for (t = 1; t <= 12; t++) {
      s = tableStats && tableStats[String(t)];
      if (s) totalAttempts += s.attempts || 0;
    }

    var explicitPool = Array.isArray(options.pool) && options.pool.length > 0;
    var pool;
    if (explicitPool) {
      pool = uniqueTables(options.pool);
    } else if (totalAttempts < 8) {
      pool = FRIENDLY_TABLES.slice();
    } else if (totalAttempts < 30) {
      pool = FRIENDLY_TABLES.concat(MID_TABLES);
    } else {
      pool = ALL_TABLES.slice();
    }

    if (options.forceAll && !explicitPool) pool = ALL_TABLES.slice();
    if (!pool.length) pool = FRIENDLY_TABLES.slice();

    var review = uniqueTables(options.review);
    var focus = uniqueTables(options.focus);

    return pool.map(function (table) {
      var acc = tableAccuracy(tableStats, table);
      var weight = 1;
      if (acc === null) {
        weight = totalAttempts < 8 ? 2 : 1.5;
      } else if (acc < 0.5) {
        weight = 4;
      } else if (acc < 0.75) {
        weight = 2.5;
      } else if (acc < 0.9) {
        weight = 1.5;
      } else {
        weight = 0.6;
      }
      // boost hard tables slightly once unlocked so they appear
      if (!explicitPool && HARD_TABLES.indexOf(table) !== -1 && totalAttempts >= 30) {
        weight *= 1.2;
      }
      if (review.indexOf(table) !== -1 && focus.indexOf(table) === -1) {
        weight *= 0.4;
      }
      return { table: table, weight: weight };
    });
  }

  function pickWeighted(items, rng) {
    rng = rng || Math.random;
    var sum = 0;
    var i;
    for (i = 0; i < items.length; i++) sum += items[i].weight;
    var r = rng() * sum;
    var acc = 0;
    for (i = 0; i < items.length; i++) {
      acc += items[i].weight;
      if (r <= acc) return items[i];
    }
    return items[items.length - 1];
  }

  /**
   * How many tries she has on this table. Missing stats count as zero.
   */
  function tableAttempts(tableStats, table) {
    var s = tableStats && tableStats[String(table)];
    return s && s.attempts ? s.attempts : 0;
  }

  /** Enough correct practice that larger factors are a fair next step. */
  function tableIsStrong(tableStats, table) {
    var s = tableStats && tableStats[String(table)];
    if (!s || !s.attempts) return false;
    return s.attempts >= 6 && (s.correct / s.attempts) >= 0.8;
  }

  function clampGrade(grade) {
    var n = parseInt(grade, 10);
    if (!(n >= 1 && n <= 5)) return 2;
    return n;
  }

  /**
   * What a grade may practice.
   * Grade 1 stays on friendly tables and tiny factors.
   * Each step adds tables and a little more range.
   * Grade 4 is most of 1–12. Grade 5 is the full set.
   */
  function gradeProfile(grade) {
    var profiles = {
      1: { grade: 1, tables: [1, 2, 5, 10], early: 3, full: 5 },
      2: { grade: 2, tables: [1, 2, 5, 10, 3, 4], early: 5, full: 7 },
      3: { grade: 3, tables: [1, 2, 5, 10, 3, 4, 6, 11], early: 6, full: 9 },
      4: { grade: 4, tables: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11], early: 8, full: 10 },
      5: { grade: 5, tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], early: 6, full: 12 }
    };
    return profiles[clampGrade(grade)];
  }

  function tablesForGrade(grade) {
    return gradeProfile(grade).tables.slice();
  }

  /**
   * Other-factor range inside the grade's cap.
   * Smaller when the table is new, the week just started, or practice is thin.
   * Up to the grade's full cap later, or sooner once accuracy is strong.
   */
  function factorBounds(table, spec) {
    spec = spec || {};
    var caps = gradeProfile(spec.grade);
    var stats = spec.tableStats;
    var introduced = spec.introduced || [];
    var dayIndex = spec.dayIndex == null ? 0 : spec.dayIndex;
    var ready = tableIsStrong(stats, table) ||
      (dayIndex > 1 &&
        introduced.indexOf(table) === -1 &&
        tableAttempts(stats, table) >= 4);
    return { min: 1, max: ready ? caps.full : caps.early };
  }

  /** Upper band used once a table is ready to stretch inside this grade. */
  function stretchBand(table, spec) {
    var caps = gradeProfile(spec && spec.grade);
    var bounds = factorBounds(table, spec);
    if (bounds.max <= caps.early) return null;
    var min = caps.early + 1;
    if (min > bounds.max) return null;
    return { min: min, max: bounds.max };
  }

  function resolveFactorBounds(table, options) {
    var bounds = factorBounds(table, options || {});
    if (options && options.factorMin != null) bounds.min = options.factorMin;
    if (options && options.factorMax != null) bounds.max = options.factorMax;
    if (bounds.min < 1) bounds.min = 1;
    if (bounds.max > 12) bounds.max = 12;
    if (bounds.min > bounds.max) bounds.min = bounds.max;
    return bounds;
  }

  function pickFactor(table, bounds, factStats, rng) {
    var items = [];
    var b;
    for (b = bounds.min; b <= bounds.max; b++) {
      var fk = factKey(table, b, '×');
      var fs = factStats && factStats[fk];
      var w = 1;
      if (!fs || !fs.attempts) w = 1.6;
      else if (fs.correct / fs.attempts < 0.5) w = 4;
      else if (fs.correct / fs.attempts < 0.8) w = 2.2;
      else w = 0.7;
      // In a full 1–12 range, keep smaller factors a little more common.
      if (bounds.max > 6 && b <= 6) w *= 1.25;
      items.push({ b: b, weight: w });
    }
    return pickWeighted(items, rng).b;
  }

  function mulTaskFrom(a, b, id) {
    return {
      id: id || 'mul-' + a + 'x' + b,
      type: 'mul',
      mission: 'multiply',
      a: a,
      b: b,
      prompt: a + ' × ' + b,
      answer: a * b,
      missCount: 0
    };
  }

  function makeMulTaskPreferWeakFacts(tableStats, factStats, rng, id, options) {
    rng = rng || Math.random;
    options = options || {};
    var weights = weightedTables(tableStats, options);
    var a = options.table != null ? parseInt(options.table, 10) : pickWeighted(weights, rng).table;
    var bounds = resolveFactorBounds(a, {
      dayIndex: options.dayIndex,
      tableStats: options.tableStats || tableStats,
      introduced: options.introduced,
      grade: options.grade,
      factorMin: options.factorMin,
      factorMax: options.factorMax
    });
    var b = pickFactor(a, bounds, factStats, rng);
    var task = mulTaskFrom(a, b, id || ('mul-' + a + 'x' + b + '-' + Math.floor(rng() * 1e6)));
    if (!options.deferStory) attachStory(task, rng, options.petName);
    return task;
  }

  function makeMulTask(tableStats, rng, id, options) {
    return makeMulTaskPreferWeakFacts(tableStats, null, rng, id, options);
  }

  /**
   * One day's multiplication block.
   * Every focus table appears at least once. Review is a small extra.
   * A table that is ready for a bigger step gets at least one factor in the grade's upper band.
   */
  function buildMulTasks(tableStats, factStats, rng, count, spec) {
    rng = rng || Math.random;
    spec = spec || {};
    count = count || 0;
    var focus = uniqueTables(spec.focus && spec.focus.length ? spec.focus : spec.pool);
    var review = uniqueTables(spec.review);
    var pool = uniqueTables((spec.pool && spec.pool.length) ? spec.pool : focus.concat(review));
    if (!pool.length) pool = focus.length ? focus.slice() : [2];
    if (!focus.length) focus = pool.slice(0, 1);

    var shared = {
      pool: pool,
      focus: focus,
      review: review,
      introduced: uniqueTables(spec.introduced),
      dayIndex: spec.dayIndex == null ? 0 : spec.dayIndex,
      grade: spec.grade,
      tableStats: spec.tableStats || tableStats,
      deferStory: true,
      petName: spec.petName
    };

    var tasks = [];

    function pushTable(table, band) {
      var opts = {
        table: table,
        pool: shared.pool,
        focus: shared.focus,
        review: shared.review,
        introduced: shared.introduced,
        dayIndex: shared.dayIndex,
        grade: shared.grade,
        tableStats: shared.tableStats,
        deferStory: true,
        petName: shared.petName
      };
      if (band) {
        opts.factorMin = band.min;
        opts.factorMax = band.max;
      }
      tasks.push(makeMulTaskPreferWeakFacts(tableStats, factStats, rng, 'mul-seed', opts));
    }

    var i;
    var stretchTables = [];
    for (i = 0; i < focus.length && tasks.length < count; i++) {
      pushTable(focus[i], null);
      var focusBand = stretchBand(focus[i], shared);
      if (focusBand) stretchTables.push({ table: focus[i], band: focusBand });
    }
    for (i = 0; i < review.length && tasks.length < count; i++) {
      var reviewBand = stretchBand(review[i], shared);
      pushTable(review[i], reviewBand);
      if (reviewBand) stretchTables.push({ table: review[i], band: reviewBand });
    }
    while (tasks.length < count) {
      tasks.push(makeMulTaskPreferWeakFacts(tableStats, factStats, rng, 'mul-fill', shared));
    }

    function hasHighFactor(table, minHigh) {
      var n;
      for (n = 0; n < tasks.length; n++) {
        if (tasks[n].a === table && tasks[n].b >= minHigh) return true;
      }
      return false;
    }

    for (i = 0; i < stretchTables.length; i++) {
      var entry = stretchTables[i];
      if (hasHighFactor(entry.table, entry.band.min)) continue;
      var replaceAt = -1;
      var n;
      for (n = tasks.length - 1; n >= 0; n--) {
        if (tasks[n].a === entry.table) {
          replaceAt = n;
          break;
        }
      }
      if (replaceAt === -1) replaceAt = tasks.length - 1;
      var forced = {
        table: entry.table,
        pool: shared.pool,
        focus: shared.focus,
        review: shared.review,
        introduced: shared.introduced,
        dayIndex: shared.dayIndex,
        grade: shared.grade,
        tableStats: shared.tableStats,
        factorMin: entry.band.min,
        factorMax: entry.band.max,
        deferStory: true,
        petName: shared.petName
      };
      tasks[replaceAt] = makeMulTaskPreferWeakFacts(tableStats, factStats, rng, 'mul-stretch', forced);
    }

    var prefix = spec.idPrefix || 'mul';
    for (i = 0; i < tasks.length; i++) tasks[i].id = prefix + '-' + i;
    applyMulStories(tasks, spec.petName);
    return tasks;
  }

  /**
   * Seven local days, Monday first.
   * Easier selected tables are introduced earlier. Every selected table is
   * introduced on some day. Later days add a little review.
   */
  function weeklyTablePlan(selectedTables) {
    var ordered = orderByEase(selectedTables);
    var days = [];
    var d;
    for (d = 0; d < 7; d++) {
      days.push({ focus: [], review: [], introduced: [] });
    }
    if (!ordered.length) return days;

    var n = ordered.length;
    var base = Math.floor(n / 7);
    var extra = n % 7;
    var cursor = 0;
    var introducedAll = [];

    for (d = 0; d < 7; d++) {
      var count = base + (d < extra ? 1 : 0);
      var introduced = [];
      var k;
      for (k = 0; k < count; k++) {
        introduced.push(ordered[cursor]);
        introducedAll.push(ordered[cursor]);
        cursor++;
      }
      var focus = introduced.slice();
      if (!focus.length) {
        var recentCount = Math.min(2, introducedAll.length);
        focus = introducedAll.slice(introducedAll.length - recentCount);
      }
      var review = [];
      if (d >= 2) {
        var earlier = [];
        for (k = 0; k < introducedAll.length; k++) {
          if (focus.indexOf(introducedAll[k]) === -1 && earlier.indexOf(introducedAll[k]) === -1) {
            earlier.push(introducedAll[k]);
          }
        }
        if (earlier.length) {
          review.push(earlier[(d - 2) % earlier.length]);
          if (d >= 5 && earlier.length > 2) {
            var idx2 = (d + Math.floor(earlier.length / 2)) % earlier.length;
            if (review.indexOf(earlier[idx2]) === -1) review.push(earlier[idx2]);
          }
        }
      }
      days[d] = { focus: focus, review: review, introduced: introduced };
    }
    return days;
  }

  /** Single digit 0–9, mostly 1–9. */
  function pickDigit(rng) {
    if (rng() < 0.1) return 0;
    return 1 + Math.floor(rng() * 9);
  }

  function warmupCaps(grade) {
    grade = clampGrade(grade);
    if (grade <= 1) return { single: true, limit: 9, easy: 9 };
    if (grade === 2) return { single: false, limit: 20, easy: 9 };
    if (grade === 3) return { single: false, limit: 50, easy: 20 };
    if (grade === 4) return { single: false, limit: 100, easy: 40 };
    return { single: false, limit: 100, easy: 50 };
  }

  function pickSumWithin(rng, limit, easy) {
    var cap = rng() < 0.62 ? Math.min(easy, limit) : limit;
    var a = Math.floor(rng() * (cap + 1));
    var room = limit - a;
    if (room < 0) room = 0;
    var bCap = Math.min(cap, room);
    var b = Math.floor(rng() * (bCap + 1));
    return { a: a, b: b, answer: a + b };
  }

  function pickDiffWithin(rng, limit, easy) {
    var cap = rng() < 0.62 ? Math.min(easy, limit) : limit;
    var a = Math.floor(rng() * (cap + 1));
    var b = Math.floor(rng() * (a + 1));
    return { a: a, b: b, answer: a - b };
  }

  function makeAddSubTask(rng, id, options) {
    rng = rng || Math.random;
    options = options || {};
    var caps = warmupCaps(options.grade == null ? 2 : options.grade);
    var isAdd = rng() < 0.55;
    var a, b, answer, prompt, type;
    if (caps.single) {
      if (isAdd) {
        a = pickDigit(rng);
        b = pickDigit(rng);
        answer = a + b;
        prompt = a + ' + ' + b;
        type = 'add';
      } else {
        a = pickDigit(rng);
        if (a === 0) b = 0;
        else if (rng() < 0.12) b = 0;
        else b = 1 + Math.floor(rng() * a);
        answer = a - b;
        prompt = a + ' − ' + b;
        type = 'sub';
      }
    } else {
      var picked = isAdd
        ? pickSumWithin(rng, caps.limit, caps.easy)
        : pickDiffWithin(rng, caps.limit, caps.easy);
      a = picked.a;
      b = picked.b;
      answer = picked.answer;
      type = isAdd ? 'add' : 'sub';
      prompt = isAdd ? (a + ' + ' + b) : (a + ' − ' + b);
    }
    return attachStory({
      id: id || type + '-' + a + '-' + b + '-' + Math.floor(rng() * 1e6),
      type: type,
      mission: 'warmup',
      a: a,
      b: b,
      prompt: prompt,
      answer: answer,
      missCount: 0
    }, rng, options.petName);
  }

  /** How many pictures to draw. Large numbers stay in the words, not a misleading pile. */
  function sceneCount(n) {
    n = parseInt(n, 10);
    if (!(n > 0)) return 0;
    if (n <= 10) return n;
    return 1;
  }

  function buildStory(task, petName, which) {
    var name = (petName && String(petName).trim()) || 'Your pet';
    var kind = which == null ? 0 : (Math.abs(which) % 4);
    var text;
    var scenes;
    if (task.type === 'mul') {
      if (kind === 0) {
        text = name + ' picked ' + task.a + ' strawberries for each of ' + task.b +
          ' friends. How many strawberries is that?';
        scenes = [
          { icon: 'strawberry', count: sceneCount(task.a) },
          { icon: 'friend', count: sceneCount(task.b) }
        ];
      } else if (kind === 1) {
        text = name + ' sets out ' + task.b + ' plates. Each plate gets ' + task.a +
          ' treats. How many treats is that?';
        scenes = [
          { icon: 'plate', count: sceneCount(task.b) },
          { icon: 'treat', count: sceneCount(task.a) }
        ];
      } else if (kind === 2) {
        text = name + ' has ' + task.b + ' baskets with ' + task.a +
          ' toys in each. How many toys is that?';
        scenes = [
          { icon: 'basket', count: sceneCount(task.b) },
          { icon: 'toy', count: sceneCount(task.a) }
        ];
      } else {
        text = name + ' makes ' + task.a + ' sandwiches for each of ' + task.b +
          ' friends. How many sandwiches is that?';
        scenes = [
          { icon: 'sandwich', count: sceneCount(task.a) },
          { icon: 'friend', count: sceneCount(task.b) }
        ];
      }
    } else if (task.type === 'sub') {
      text = name + ' had ' + task.a + ' strawberries and shared ' + task.b +
        '. How many strawberries are left?';
      scenes = [{ icon: 'strawberry', count: sceneCount(task.a) }];
    } else if (kind % 2 === 1) {
      text = name + ' found ' + task.a + ' toys and ' + task.b +
        ' treats. How many things altogether?';
      scenes = [
        { icon: 'toy', count: sceneCount(task.a) },
        { icon: 'treat', count: sceneCount(task.b) }
      ];
    } else {
      text = name + ' picked ' + task.a + ' strawberries and ' + task.b +
        ' more berries. How many pieces of fruit is that?';
      scenes = [
        { icon: 'strawberry', count: sceneCount(task.a) },
        { icon: 'berry', count: sceneCount(task.b) }
      ];
    }
    return { text: text, scenes: scenes };
  }

  function attachStory(task, rng, petName) {
    rng = rng || Math.random;
    var want;
    var which = 0;
    if (task.id === 'warm-0') {
      want = true;
      which = 0;
    } else if (task.id === 'warm-1') {
      want = false;
    } else {
      want = rng() < 0.5;
      if (want) which = Math.floor(rng() * 4);
    }
    task.story = want ? buildStory(task, petName, which) : null;
    return task;
  }

  function applyMulStories(tasks, petName) {
    var i;
    for (i = 0; i < tasks.length; i++) {
      if (i % 2 === 0) tasks[i].story = buildStory(tasks[i], petName, Math.floor(i / 2));
      else tasks[i].story = null;
    }
    return tasks;
  }

  function iconShape(name) {
    if (name === 'strawberry') {
      return '<g data-icon="strawberry"><path d="M16 11 Q28 9 26 18 Q24 30 16 32 Q8 30 6 18 Q4 9 16 11 Z" fill="#d4564e"/><path d="M10 11 Q16 4 22 11" fill="#5f7a52"/><circle cx="12" cy="18" r="1.2" fill="#f0e0a0"/><circle cx="18" cy="20" r="1.2" fill="#f0e0a0"/><circle cx="14" cy="24" r="1.2" fill="#f0e0a0"/></g>';
    }
    if (name === 'berry') {
      return '<g data-icon="berry"><circle cx="16" cy="18" r="10" fill="#7a4e86"/><circle cx="12" cy="16" r="1.2" fill="#f7f1e6"/><circle cx="18" cy="15" r="1.2" fill="#f7f1e6"/><circle cx="15" cy="21" r="1.2" fill="#f7f1e6"/><path d="M12 8 Q16 4 20 8" fill="#5f7a52"/></g>';
    }
    if (name === 'friend') {
      return '<g data-icon="friend"><circle cx="16" cy="18" r="10" fill="#e8a05a"/><polygon points="8,12 10,4 14,11" fill="#e8a05a"/><polygon points="24,12 22,4 18,11" fill="#e8a05a"/><circle cx="12" cy="18" r="1.4" fill="#2c241c"/><circle cx="20" cy="18" r="1.4" fill="#2c241c"/><path d="M12 22 Q16 25 20 22" fill="none" stroke="#2c241c" stroke-width="1.2"/></g>';
    }
    if (name === 'sandwich') {
      return '<g data-icon="sandwich"><path d="M6 14 Q16 6 26 14 L26 18 Q16 14 6 18 Z" fill="#e8c49a"/><rect x="6" y="18" width="20" height="4" fill="#7a9a68"/><path d="M6 22 Q16 28 26 22 L26 24 Q16 30 6 24 Z" fill="#c4784a"/></g>';
    }
    if (name === 'treat') {
      return '<g data-icon="treat"><circle cx="16" cy="18" r="10" fill="#e8c49a"/><circle cx="12" cy="16" r="1.5" fill="#a35f38"/><circle cx="18" cy="14" r="1.5" fill="#a35f38"/><circle cx="17" cy="20" r="1.5" fill="#a35f38"/></g>';
    }
    if (name === 'toy') {
      return '<g data-icon="toy"><circle cx="16" cy="18" r="10" fill="#c4784a"/><path d="M8 18 H24 M16 10 V26" stroke="#fffaf0" stroke-width="2"/></g>';
    }
    if (name === 'plate') {
      return '<g data-icon="plate"><ellipse cx="16" cy="20" rx="12" ry="7" fill="#fffaf0" stroke="#c4784a" stroke-width="2"/><ellipse cx="16" cy="20" rx="6" ry="3" fill="#f0e0a0"/></g>';
    }
    if (name === 'basket') {
      return '<g data-icon="basket"><path d="M8 14 H24 L22 28 H10 Z" fill="#c4784a"/><path d="M8 14 Q16 6 24 14" fill="none" stroke="#a35f38" stroke-width="2"/></g>';
    }
    if (name === 'cupcake') {
      return '<g data-icon="cupcake"><path d="M10 16 Q16 8 22 16" fill="#f0a0b0"/><path d="M9 16 H23 L21 28 H11 Z" fill="#e8c49a"/></g>';
    }
    if (name === 'star') {
      return '<g data-icon="star"><polygon points="16,4 19,12 28,12 21,18 23,27 16,22 9,27 11,18 4,12 13,12" fill="#e8c84a"/></g>';
    }
    if (name === 'heart') {
      return '<g data-icon="heart"><path d="M16 28 L6 16 Q4 8 12 8 Q16 8 16 13 Q16 8 20 8 Q28 8 26 16 Z" fill="#c4784a"/></g>';
    }
    return '<g data-icon="leaf"><path d="M16 6 Q28 16 16 30 Q4 16 16 6 Z" fill="#7a9a68"/></g>';
  }

  function renderStorySvg(story) {
    if (!story || !story.scenes || !story.scenes.length) return '';
    var y = 2;
    var parts = [];
    var s;
    var i;
    for (s = 0; s < story.scenes.length; s++) {
      var n = story.scenes[s].count || 0;
      if (!n) continue;
      var cols = Math.min(6, n);
      for (i = 0; i < n; i++) {
        var x = 8 + (i % cols) * 40;
        var yy = y + Math.floor(i / cols) * 36;
        parts.push('<g transform="translate(' + x + ' ' + yy + ')">' + iconShape(story.scenes[s].icon) + '</g>');
      }
      y += Math.ceil(n / cols) * 36 + 6;
    }
    var height = Math.max(8, y);
    return '<svg class="story-svg" viewBox="0 0 280 ' + height + '" width="100%" role="img" aria-hidden="true">' + parts.join('') + '</svg>';
  }

  /** Gentle hints — never shame. */
  function getHint(task, missCount) {
    missCount = missCount || 1;
    if (task.type === 'mul') {
      if (missCount === 1) {
        return firstMulHint(task.a, task.b);
      }
      return walkthroughMul(task.a, task.b);
    }
    if (task.type === 'add') {
      return addHint(task, missCount);
    }
    if (task.type === 'sub') {
      return subHint(task, missCount);
    }
    return 'Give it another try — you can do this!';
  }

  function addHint(task, missCount) {
    var big = Math.max(task.a, task.b);
    var small = Math.min(task.a, task.b);
    var twoDigit = task.a >= 10 || task.b >= 10;
    if (missCount === 1) {
      if (small === 0) return 'Adding zero keeps the number the same. What is ' + big + '?';
      if (twoDigit) return 'Almost! Add the ones first, then the tens.';
      return 'Almost! Start at ' + big + ' and count up ' + small + '.';
    }
    if (twoDigit) {
      return 'Walkthrough: ' + task.a + ' + ' + task.b + ' = ' + task.answer +
        '. Ones first, then tens. Now type ' + task.answer + '.';
    }
    return 'Walkthrough: ' + task.a + ' + ' + task.b + ' = ' + task.answer +
      '. Now type ' + task.answer + '.';
  }

  function subHint(task, missCount) {
    if (missCount === 1) {
      if (task.b === 0) return 'Subtracting zero keeps the number the same. What is ' + task.a + '?';
      return 'Almost! Start at ' + task.a + ' and count back ' + task.b + '.';
    }
    return 'Walkthrough: ' + task.a + ' − ' + task.b + ' = ' + task.answer +
      '. Now type ' + task.answer + ' to practice.';
  }

  function firstMulHint(a, b) {
    if (a === 1 || b === 1) return 'Anything times 1 stays the same. What is ' + a + ' × ' + b + '?';
    if (a === 10 || b === 10) return 'Times 10 means add a zero. What is ' + a + ' × ' + b + '?';
    if (a === 5 || b === 5) return 'Think of counting by 5s. What is ' + a + ' × ' + b + '?';
    if (a === 2 || b === 2) return 'Times 2 means double it. What is ' + a + ' × ' + b + '?';
    if (a === 11 || b === 11) return 'Times 11 often repeats the digit for small numbers. What is ' + a + ' × ' + b + '?';
    return 'Nice try! Think about groups of ' + a + '. How many in ' + b + ' groups?';
  }

  function walkthroughMul(a, b) {
    // Prefer breaking using a friendly nearby fact
    var use = a;
    var other = b;
    if ([2, 5, 10].indexOf(b) !== -1 && [2, 5, 10].indexOf(a) === -1) {
      use = b;
      other = a;
    }
    if (use === 5 || other >= 5) {
      var fivePart = Math.min(other, 5);
      var rest = other - fivePart;
      if (rest > 0 && fivePart === 5) {
        var p1 = use * 5;
        var p2 = use * rest;
        return 'Walkthrough: think of ' + use + ' × 5 = ' + p1 +
          ', then add another ' + use + (rest > 1 ? ' × ' + rest + ' = ' + p2 : '') +
          '. ' + p1 + ' + ' + p2 + ' = ' + (use * other) +
          '. So ' + a + ' × ' + b + ' = ' + (a * b) + '. Type ' + (a * b) + '.';
      }
    }
    if (other > 1) {
      var near = other - 1;
      var nearProd = use * near;
      return 'Walkthrough: ' + use + ' × ' + near + ' = ' + nearProd +
        ', then add one more ' + use + ': ' + nearProd + ' + ' + use + ' = ' + (use * other) +
        '. So ' + a + ' × ' + b + ' = ' + (a * b) + '. Type ' + (a * b) + '.';
    }
    return 'Walkthrough: ' + a + ' × ' + b + ' = ' + (a * b) + '. Type ' + (a * b) + ' to practice it.';
  }

  function encouragement(correct, missCount) {
    if (correct && missCount === 0) {
      var wins = [
        'You got it!',
        'Nice work!',
        'Yes! That is right.',
        'Great job!',
        'You nailed it!'
      ];
      return wins[Math.floor(Math.random() * wins.length)];
    }
    if (correct) {
      return 'You figured it out — well done!';
    }
    if (missCount === 1) {
      return 'Not quite — try once more.';
    }
    return 'Let us walk through it together.';
  }

  /**
   * Process a submission for a math task.
   * miss flow: 1st miss → retry+hint; 2nd miss → walkthrough, then she enters correct answer.
   */
  function processMathAttempt(task, given) {
    var result = checkAnswer(task.answer, given);
    if (result.ok) {
      return {
        correct: true,
        task: task,
        message: encouragement(true, task.missCount || 0),
        hint: null,
        forceShowAnswer: false,
        done: true
      };
    }
    task.missCount = (task.missCount || 0) + 1;
    var hint = getHint(task, task.missCount);
    return {
      correct: false,
      task: task,
      message: encouragement(false, task.missCount),
      hint: hint,
      forceShowAnswer: task.missCount >= 2,
      done: false
    };
  }

  /** Which times tables look "mastered" (enough attempts + high accuracy). */
  function masteredTables(tableStats, minAttempts, minAcc) {
    minAttempts = minAttempts == null ? 8 : minAttempts;
    minAcc = minAcc == null ? 0.9 : minAcc;
    var out = [];
    var t;
    for (t = 1; t <= 12; t++) {
      var s = tableStats && tableStats[String(t)];
      if (s && s.attempts >= minAttempts && s.correct / s.attempts >= minAcc) {
        out.push(t);
      }
    }
    return out;
  }

  return {
    FRIENDLY_TABLES: FRIENDLY_TABLES,
    ALL_TABLES: ALL_TABLES,
    TABLE_PROGRESSION: TABLE_PROGRESSION,
    clampGrade: clampGrade,
    gradeProfile: gradeProfile,
    tablesForGrade: tablesForGrade,
    stretchBand: stretchBand,
    checkAnswer: checkAnswer,
    factKey: factKey,
    tableAccuracy: tableAccuracy,
    recordResult: recordResult,
    weightedTables: weightedTables,
    pickWeighted: pickWeighted,
    factorBounds: factorBounds,
    weeklyTablePlan: weeklyTablePlan,
    orderByEase: orderByEase,
    makeMulTask: makeMulTask,
    makeMulTaskPreferWeakFacts: makeMulTaskPreferWeakFacts,
    buildMulTasks: buildMulTasks,
    makeAddSubTask: makeAddSubTask,
    buildStory: buildStory,
    renderStorySvg: renderStorySvg,
    getHint: getHint,
    processMathAttempt: processMathAttempt,
    encouragement: encouragement,
    masteredTables: masteredTables,
    tableIsStrong: tableIsStrong
  };
});
