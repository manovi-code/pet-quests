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

  var FACT_RING = 18;

  function ensureFactMemory(state) {
    if (!state) return;
    if (!Array.isArray(state.recentFacts)) state.recentFacts = [];
    if (!Array.isArray(state.factDue)) state.factDue = [];
  }

  function rememberFact(state, key) {
    if (!state || !key) return state;
    ensureFactMemory(state);
    var list = [];
    var i;
    for (i = 0; i < state.recentFacts.length; i++) {
      if (state.recentFacts[i] !== key) list.push(state.recentFacts[i]);
    }
    list.push(key);
    if (list.length > FACT_RING) list = list.slice(list.length - FACT_RING);
    state.recentFacts = list;
    return state;
  }

  function factStatsOf(state, key) {
    if (!state.factStats) state.factStats = {};
    if (!state.factStats[key]) state.factStats[key] = { attempts: 0, correct: 0, misses: 0, slow: 0 };
    var fs = state.factStats[key];
    if (fs.misses == null) fs.misses = 0;
    if (fs.slow == null) fs.slow = 0;
    return fs;
  }

  /**
   * A missed fact comes back after a few other problems, and again the next day
   * if it is still due. No timer. "Slow" means she needed a hint first.
   */
  function queueRecheck(state, a, b, op) {
    if (!state) return;
    ensureFactMemory(state);
    var key = factKey(a, b, op || '×');
    var i;
    for (i = 0; i < state.factDue.length; i++) {
      if (state.factDue[i].key === key) return;
    }
    var dayKey = state.daily && state.daily.dateKey ? state.daily.dateKey : '';
    state.factDue.push({
      key: key,
      a: a,
      b: b,
      op: op || '×',
      left: 3,
      served: false,
      placedDay: '',
      dayKey: dayKey
    });
    if (state.factDue.length > 12) state.factDue = state.factDue.slice(-12);
  }

  function clearRecheck(state, task) {
    if (!state || !task || task.type !== 'mul') return state;
    ensureFactMemory(state);
    var key = factKey(task.a, task.b, '×');
    var next = [];
    var i;
    for (i = 0; i < state.factDue.length; i++) {
      if (state.factDue[i].key !== key) next.push(state.factDue[i]);
    }
    state.factDue = next;
    return state;
  }

  function noteSlow(state, task) {
    if (!state || !task || task.type !== 'mul') return state;
    var key = factKey(task.a, task.b, '×');
    var fs = factStatsOf(state, key);
    fs.slow += 1;
    queueRecheck(state, task.a, task.b, '×');
    return state;
  }

  function tickDue(state, chosenKey) {
    if (!state || !state.factDue) return;
    var next = [];
    var i;
    for (i = 0; i < state.factDue.length; i++) {
      var item = state.factDue[i];
      if (item.key === chosenKey) {
        item.served = true;
        item.left = 99;
      } else if (!item.served && item.left > 0) {
        item.left -= 1;
      }
      next.push(item);
    }
    state.factDue = next;
  }

  /**
   * After a miss, rewrite a later unstarted multiplication problem so the
   * same fact returns a few problems later in this session.
   */
  function plantRecheck(tasks, index, state) {
    if (!tasks || !tasks.length || !state) return null;
    var task = tasks[index];
    if (!task || task.type !== 'mul') return null;
    var key = factKey(task.a, task.b, '×');
    var target = -1;
    var i;
    for (i = index + 3; i < tasks.length; i++) {
      if (!tasks[i] || tasks[i].type !== 'mul' || tasks[i].cleared) continue;
      if (factKey(tasks[i].a, tasks[i].b, '×') === key) continue;
      target = i;
      break;
    }
    queueRecheck(state, task.a, task.b, '×');
    if (target === -1) return null;
    var fresh = mulTaskFrom(task.a, task.b, tasks[target].id);
    fresh.mission = tasks[target].mission || 'multiply';
    applyProductFormat(fresh, Math.random);
    fresh.story = null;
    tasks[target] = fresh;
    var due = state.factDue || [];
    for (i = 0; i < due.length; i++) {
      if (due[i].key === key) {
        due[i].served = true;
        due[i].placedDay = state.daily && state.daily.dateKey ? state.daily.dateKey : due[i].placedDay;
      }
    }
    return fresh;
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
      var fs = factStatsOf(state, fk);
      fs.attempts += 1;
      if (correct) fs.correct += 1;
      else {
        fs.misses += 1;
        queueRecheck(state, task.a, task.b, '×');
      }
    } else if (task && (task.type === 'add' || task.type === 'sub')) {
      rememberFact(state, factKey(task.a, task.b, task.type === 'sub' ? '−' : '+'));
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
    if (!(sum > 0)) return items[items.length - 1];
    var r = rng() * sum;
    var acc = 0;
    for (i = 0; i < items.length; i++) {
      acc += items[i].weight;
      if (r <= acc) return items[i];
    }
    return items[items.length - 1];
  }

  /** Fisher–Yates. The caller’s rng is the only source of order. */
  function shuffle(list, rng) {
    rng = rng || Math.random;
    var a = (list || []).slice();
    var i;
    for (i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
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

  function factAccuracy(fs) {
    if (!fs || !fs.attempts) return null;
    return fs.correct / fs.attempts;
  }

  /** Tried, and still shaky: misses, a hint, or accuracy under 80%. */
  function factIsWeak(fs) {
    if (!fs || !fs.attempts) return false;
    var acc = factAccuracy(fs);
    if (acc < 0.8) return true;
    if ((fs.misses || 0) > 0 && acc < 0.9) return true;
    if ((fs.slow || 0) > 0 && acc < 0.95) return true;
    return false;
  }

  /** Solid enough to fade. Still allowed, just uncommon. */
  function factIsMastered(fs) {
    if (!fs || fs.attempts < 4) return false;
    return factAccuracy(fs) >= 0.9 && (fs.slow || 0) === 0 && (fs.misses || 0) === 0;
  }

  function inList(list, key) {
    return (list || []).indexOf(key) !== -1;
  }

  function mulCandidates(tableStats, factStats, options) {
    options = options || {};
    var weights = weightedTables(tableStats, options);
    var tables = [];
    var i;
    if (options.table != null) tables = [parseInt(options.table, 10)];
    else {
      for (i = 0; i < weights.length; i++) tables.push(weights[i].table);
    }
    var weightOf = {};
    for (i = 0; i < weights.length; i++) weightOf[weights[i].table] = weights[i].weight;
    var out = [];
    for (i = 0; i < tables.length; i++) {
      var table = tables[i];
      if (!(table >= 1 && table <= 12)) continue;
      var bounds = resolveFactorBounds(table, {
        dayIndex: options.dayIndex,
        tableStats: options.tableStats || tableStats,
        introduced: options.introduced,
        grade: options.grade,
        factorMin: options.factorMin,
        factorMax: options.factorMax
      });
      var b;
      for (b = bounds.min; b <= bounds.max; b++) {
        var key = factKey(table, b, '×');
        out.push({
          a: table,
          b: b,
          key: key,
          stats: factStats && factStats[key],
          weight: weightOf[table] || 1
        });
      }
    }
    return out;
  }

  function narrowFacts(cands, hard, soft) {
    var fresh = [];
    var i;
    for (i = 0; i < cands.length; i++) {
      if (!inList(hard, cands[i].key) && !inList(soft, cands[i].key)) fresh.push(cands[i]);
    }
    if (fresh.length) return fresh;
    for (i = 0; i < cands.length; i++) {
      if (!inList(hard, cands[i].key)) fresh.push(cands[i]);
    }
    if (fresh.length) return fresh;
    var last = hard && hard.length ? hard[hard.length - 1] : null;
    if (cands.length > 1 && last) {
      for (i = 0; i < cands.length; i++) {
        if (cands[i].key !== last) fresh.push(cands[i]);
      }
    }
    return fresh.length ? fresh : cands.slice();
  }

  /**
   * About 45% of draws come from weak facts when she has any.
   * The rest come from the other facts, with mastered ones faded.
   */
  function pickMulPair(tableStats, factStats, rng, options, hard) {
    rng = rng || Math.random;
    options = options || {};
    var cands = mulCandidates(tableStats, factStats, options);
    if (!cands.length) cands = [{ a: 2, b: 2, key: '2×2', stats: null, weight: 1 }];
    var state = options.state;
    var soft = (state && state.recentFacts) || options.recent || [];
    var dueHit = null;
    if (state && state.factDue && !options.skipDue) {
      var today = options.dayKey || (state.daily && state.daily.dateKey) || '';
      var i;
      for (i = 0; i < state.factDue.length; i++) {
        var item = state.factDue[i];
        if (inList(hard, item.key)) continue;
        var allowed = false;
        var n;
        for (n = 0; n < cands.length; n++) {
          if (cands[n].key === item.key) allowed = true;
        }
        if (!allowed) continue;
        var laterToday = !item.served && item.left <= 0;
        var nextDay = item.dayKey && today && item.dayKey < today && item.placedDay !== today;
        if (laterToday || nextDay) {
          dueHit = item;
          break;
        }
      }
    }
    if (dueHit) {
      tickDue(state, dueHit.key);
      return { a: dueHit.a, b: dueHit.b, key: dueHit.key, due: true };
    }
    var pool = narrowFacts(cands, hard || [], soft);
    var weak = [];
    var rest = [];
    var k;
    for (k = 0; k < pool.length; k++) {
      if (factIsWeak(pool[k].stats)) weak.push(pool[k]);
      else rest.push(pool[k]);
    }
    var useWeak = weak.length && (rest.length === 0 || rng() < 0.45);
    var bag = useWeak ? weak : (rest.length ? rest : pool);
    var items = bag.map(function (c) {
      var w = c.weight || 1;
      if (!c.stats || !c.stats.attempts) w *= 1.35;
      else if (factIsMastered(c.stats)) w *= 0.28;
      else if (factIsWeak(c.stats)) w *= 3;
      if ((options.factorMax || 12) > 6 && c.b <= 6) w *= 1.15;
      return { pair: c, weight: w };
    });
    var picked = pickWeighted(items, rng).pair;
    if (state) tickDue(state, picked.key);
    return picked;
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
      format: 'eq',
      missCount: 0
    };
  }

  /** Product stays a×b. Order, groups, rows, and skip-counting change the words. */
  function applyProductFormat(task, rng) {
    rng = rng || Math.random;
    var roll = rng();
    var a = task.a;
    var b = task.b;
    task.answer = a * b;
    task.missing = '';
    if (roll < 0.22) {
      task.format = 'groups';
      task.prompt = a + ' equal groups of ' + b;
    } else if (roll < 0.4) {
      task.format = 'rows';
      task.prompt = a + ' rows of ' + b;
    } else if (roll < 0.58) {
      task.format = 'skip';
      task.prompt = 'Skip-count ' + a + ' hops of ' + b;
    } else if (roll < 0.8) {
      task.format = 'eq';
      task.prompt = b + ' × ' + a;
    } else {
      task.format = 'eq';
      task.prompt = a + ' × ' + b;
    }
    return task;
  }

  /** The blank is a factor. The typed answer is that factor, not the product. */
  function applyMissingFormat(task, rng) {
    rng = rng || Math.random;
    var product = task.a * task.b;
    task.format = 'missing';
    if (rng() < 0.5) {
      task.missing = 'a';
      task.prompt = '___ × ' + task.b + ' = ' + product;
      task.answer = task.a;
    } else {
      task.missing = 'b';
      task.prompt = task.a + ' × ___ = ' + product;
      task.answer = task.b;
    }
    task.story = null;
    return task;
  }

  function notePickedFact(task, options, hard) {
    var key = factKey(task.a, task.b, '×');
    if (hard && hard.indexOf(key) === -1) hard.push(key);
    if (options && options.batch && options.batch.indexOf(key) === -1) options.batch.push(key);
    if (options && options.state) rememberFact(options.state, key);
    return key;
  }

  function makeMulTaskPreferWeakFacts(tableStats, factStats, rng, id, options) {
    rng = rng || Math.random;
    options = options || {};
    var hard = options.batch || options.hard || [];
    var pair = pickMulPair(tableStats, factStats, rng, options, hard);
    var a = pair.a;
    var b = pair.b;
    var task = mulTaskFrom(a, b, id || ('mul-' + a + 'x' + b + '-' + Math.floor(rng() * 1e6)));
    var wantMissing = !!(options.allowMissing && rng() < 0.34);
    if (wantMissing) applyMissingFormat(task, rng);
    else applyProductFormat(task, rng);
    if (!wantMissing && !options.deferStory) attachStory(task, rng, options.petName);
    notePickedFact(task, options, hard);
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
      petName: spec.petName,
      state: spec.state || null,
      dayKey: spec.dayKey || '',
      batch: [],
      skipDue: true
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
        petName: shared.petName,
        state: shared.state,
        dayKey: shared.dayKey,
        batch: shared.batch,
        skipDue: true
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
        petName: shared.petName,
        state: shared.state,
        dayKey: shared.dayKey,
        batch: shared.batch,
        skipDue: true
      };
      tasks[replaceAt] = makeMulTaskPreferWeakFacts(tableStats, factStats, rng, 'mul-stretch', forced);
    }

    placeNextDayDue(tasks, spec.state, shared);
    unstickFacts(tasks);

    var prefix = spec.idPrefix || 'mul';
    for (i = 0; i < tasks.length; i++) tasks[i].id = prefix + '-' + i;
    applyMulStories(tasks, spec.petName, rng);
    var m;
    for (m = 0; m < tasks.length; m++) {
      if (tasks[m].story) continue;
      if (rng() < 0.34) applyMissingFormat(tasks[m], rng);
    }
    return tasks;
  }

  function unstickFacts(tasks) {
    var i;
    var j;
    for (i = 1; i < tasks.length; i++) {
      if (factKey(tasks[i].a, tasks[i].b, '×') !== factKey(tasks[i - 1].a, tasks[i - 1].b, '×')) continue;
      for (j = i + 1; j < tasks.length; j++) {
        var keyJ = factKey(tasks[j].a, tasks[j].b, '×');
        if (keyJ === factKey(tasks[i - 1].a, tasks[i - 1].b, '×')) continue;
        var tmp = tasks[i];
        tasks[i] = tasks[j];
        tasks[j] = tmp;
        break;
      }
    }
  }

  /** A fact missed on an earlier day returns once inside today's block. */
  function placeNextDayDue(tasks, state, shared) {
    if (!state || !state.factDue || !tasks.length) return;
    var today = shared.dayKey || '';
    var item = null;
    var i;
    for (i = 0; i < state.factDue.length; i++) {
      var due = state.factDue[i];
      if (!due.dayKey || !today || !(due.dayKey < today)) continue;
      if (due.placedDay === today) continue;
      if (shared.pool.indexOf(due.a) === -1 && shared.pool.indexOf(due.b) === -1) continue;
      var table = shared.pool.indexOf(due.a) !== -1 ? due.a : due.b;
      var factor = table === due.a ? due.b : due.a;
      var bounds = resolveFactorBounds(table, shared);
      if (factor < bounds.min || factor > bounds.max) continue;
      item = { due: due, table: table, factor: factor };
      break;
    }
    if (!item) return;
    var counts = {};
    for (i = 0; i < tasks.length; i++) counts[tasks[i].a] = (counts[tasks[i].a] || 0) + 1;
    var slot = -1;
    for (i = tasks.length - 1; i >= 1; i--) {
      if (counts[tasks[i].a] > 1) {
        slot = i;
        break;
      }
    }
    if (slot === -1) return;
    var fresh = mulTaskFrom(item.table, item.factor, tasks[slot].id);
    fresh.mission = 'multiply';
    fresh.format = 'groups';
    fresh.prompt = item.table + ' equal groups of ' + item.factor;
    fresh.answer = item.table * item.factor;
    tasks[slot] = fresh;
    item.due.placedDay = today;
    item.due.served = true;
    rememberFact(state, factKey(item.table, item.factor, '×'));
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
    var isAdd = options.op === 'sub' ? false : (options.op === 'add' ? true : rng() < 0.55);
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
    var task = {
      id: id || type + '-' + a + '-' + b + '-' + Math.floor(rng() * 1e6),
      type: type,
      mission: 'warmup',
      a: a,
      b: b,
      prompt: prompt,
      answer: answer,
      format: 'eq',
      missCount: 0
    };
    var key = warmupKey(task.type, task.a, task.b);
    var seen = (options.batch || []).concat((options.state && options.state.recentFacts) || []);
    if (seen.indexOf(key) !== -1 && options.allowRetry !== false && (options.batch || options.state)) {
      options.allowRetry = false;
      return makeAddSubTask(rng, id, options);
    }
    paintAddSub(task, rng);
    if (options.batch && options.batch.indexOf(key) === -1) options.batch.push(key);
    if (options.state) rememberFact(options.state, key);
    return attachStory(task, rng, options.petName);
  }

  function warmupKey(type, a, b) {
    if (type === 'sub') return a + '−' + b;
    var lo = Math.min(a, b);
    var hi = Math.max(a, b);
    return lo + '+' + hi;
  }

  function paintAddSub(task, rng) {
    var roll = rng();
    if (task.type === 'sub') {
      if (roll < 0.34) {
        task.format = 'take';
        task.prompt = task.a + ' take away ' + task.b;
      } else if (roll < 0.67) {
        task.format = 'left';
        task.prompt = 'Start at ' + task.a + ', subtract ' + task.b;
      } else {
        task.format = 'eq';
        task.prompt = task.a + ' − ' + task.b;
      }
      return task;
    }
    if (roll < 0.25) {
      task.format = 'flip';
      task.prompt = task.b + ' + ' + task.a;
    } else if (roll < 0.5) {
      task.format = 'and';
      task.prompt = task.a + ' and ' + task.b + ' more';
    } else if (roll < 0.75) {
      task.format = 'plus';
      task.prompt = task.a + ' plus ' + task.b;
    } else {
      task.format = 'eq';
      task.prompt = task.a + ' + ' + task.b;
    }
    return task;
  }

  /** How many pictures to draw. Large numbers stay in the words, not a misleading pile. */
  function sceneCount(n) {
    n = parseInt(n, 10);
    if (!(n > 0)) return 0;
    if (n <= 10) return n;
    return 1;
  }

  function storyFrame(name, a, b, line, iconA, iconB) {
    return {
      text: name + ' ' + line,
      scenes: [
        { icon: iconA, count: sceneCount(a) },
        { icon: iconB, count: sceneCount(b) }
      ]
    };
  }

  function mulStoryBank(name, a, b) {
    return [
      storyFrame(name, a, b, 'picked ' + a + ' strawberries for each of ' + b + ' friends. How many strawberries is that?', 'strawberry', 'friend'),
      storyFrame(name, b, a, 'sets out ' + b + ' plates. Each plate gets ' + a + ' treats. How many treats is that?', 'plate', 'treat'),
      storyFrame(name, b, a, 'has ' + b + ' baskets with ' + a + ' toys in each. How many toys is that?', 'basket', 'toy'),
      storyFrame(name, a, b, 'makes ' + a + ' sandwiches for each of ' + b + ' friends. How many sandwiches is that?', 'sandwich', 'friend'),
      storyFrame(name, a, b, 'plants ' + a + ' seeds in each of ' + b + ' pots. How many seeds is that?', 'seed', 'pot'),
      storyFrame(name, b, a, 'fills ' + b + ' bowls with ' + a + ' berries each. How many berries is that?', 'bowl', 'berry'),
      storyFrame(name, a, b, 'sticks ' + a + ' stars on each of ' + b + ' cards. How many stars is that?', 'star', 'card'),
      storyFrame(name, b, a, 'sees ' + b + ' nests with ' + a + ' eggs in each. How many eggs is that?', 'nest', 'egg'),
      storyFrame(name, a, b, 'packs ' + a + ' apples into each of ' + b + ' bags. How many apples is that?', 'apple', 'bag'),
      storyFrame(name, b, a, 'lines up ' + b + ' mats with ' + a + ' cups on each. How many cups is that?', 'mat', 'cup'),
      storyFrame(name, a, b, 'gives ' + a + ' carrots to each of ' + b + ' bunnies. How many carrots is that?', 'carrot', 'friend'),
      storyFrame(name, b, a, 'finds ' + b + ' shells in each of ' + a + ' pails. How many shells is that?', 'pail', 'shell'),
      storyFrame(name, a, b, 'hangs ' + a + ' flags on each of ' + b + ' posts. How many flags is that?', 'flag', 'post'),
      storyFrame(name, b, a, 'sets ' + b + ' lanterns on each of ' + a + ' steps. How many lanterns is that?', 'step', 'lantern'),
      storyFrame(name, a, b, 'puts ' + a + ' fish stickers in each of ' + b + ' books. How many stickers is that?', 'fish', 'book'),
      storyFrame(name, b, a, 'ties ' + b + ' bows on each of ' + a + ' gifts. How many bows is that?', 'gift', 'ribbon'),
      storyFrame(name, a, b, 'counts ' + a + ' stones in each of ' + b + ' piles. How many stones is that?', 'stone', 'pile'),
      storyFrame(name, b, a, 'pours ' + b + ' cups for each of ' + a + ' friends. How many cups is that?', 'friend', 'cup'),
      storyFrame(name, a, b, 'spots ' + a + ' paw prints on each of ' + b + ' trails. How many prints is that?', 'paw', 'trail'),
      storyFrame(name, b, a, 'saves ' + b + ' leaves from each of ' + a + ' trees. How many leaves is that?', 'tree', 'leaf')
    ];
  }

  function addStoryBank(name, a, b) {
    return [
      storyFrame(name, a, b, 'picked ' + a + ' strawberries and ' + b + ' more berries. How many pieces of fruit is that?', 'strawberry', 'berry'),
      storyFrame(name, a, b, 'found ' + a + ' toys and ' + b + ' treats. How many things altogether?', 'toy', 'treat'),
      storyFrame(name, a, b, 'saw ' + a + ' ducks and ' + b + ' frogs at the pond. How many animals is that?', 'duck', 'frog'),
      storyFrame(name, a, b, 'picked up ' + a + ' sticks and ' + b + ' stones. How many things is that?', 'stick', 'stone'),
      storyFrame(name, a, b, 'has ' + a + ' red buttons and ' + b + ' blue buttons. How many buttons altogether?', 'button', 'button'),
      storyFrame(name, a, b, 'packed ' + a + ' apples and ' + b + ' rolls. How many snacks is that?', 'apple', 'roll'),
      storyFrame(name, a, b, 'counted ' + a + ' shells and then ' + b + ' more. How many shells is that?', 'shell', 'shell'),
      storyFrame(name, a, b, 'got ' + a + ' stickers and ' + b + ' stars. How many decorations is that?', 'sticker', 'star'),
      storyFrame(name, a, b, 'filled ' + a + ' cups and ' + b + ' bowls. How many dishes is that?', 'cup', 'bowl'),
      storyFrame(name, a, b, 'saw ' + a + ' kites and ' + b + ' balloons. How many are in the sky?', 'kite', 'balloon'),
      storyFrame(name, a, b, 'lined up ' + a + ' books and ' + b + ' pencils. How many supplies is that?', 'book', 'pencil'),
      storyFrame(name, a, b, 'found ' + a + ' acorns and ' + b + ' leaves. How many nature finds is that?', 'acorn', 'leaf')
    ];
  }

  function subStoryBank(name, a, b) {
    return [
      {
        text: name + ' had ' + a + ' strawberries and shared ' + b + '. How many strawberries are left?',
        scenes: [{ icon: 'strawberry', count: sceneCount(a) }]
      },
      {
        text: name + ' had ' + a + ' stickers and gave away ' + b + '. How many stickers are left?',
        scenes: [{ icon: 'sticker', count: sceneCount(a) }]
      },
      {
        text: name + ' baked ' + a + ' rolls and ate ' + b + '. How many rolls are left?',
        scenes: [{ icon: 'roll', count: sceneCount(a) }]
      },
      {
        text: name + ' saw ' + a + ' birds, and ' + b + ' flew off. How many birds stayed?',
        scenes: [{ icon: 'bird', count: sceneCount(a) }]
      },
      {
        text: name + ' had ' + a + ' stones and used ' + b + ' in a tower. How many stones are left?',
        scenes: [{ icon: 'stone', count: sceneCount(a) }]
      },
      {
        text: name + ' poured ' + a + ' cups and drank ' + b + '. How many cups are still full?',
        scenes: [{ icon: 'cup', count: sceneCount(a) }]
      },
      {
        text: name + ' picked ' + a + ' apples and set ' + b + ' aside. How many apples are still in the bag?',
        scenes: [{ icon: 'apple', count: sceneCount(a) }]
      },
      {
        text: name + ' had ' + a + ' ribbons and tied ' + b + '. How many ribbons are left?',
        scenes: [{ icon: 'ribbon', count: sceneCount(a) }]
      }
    ];
  }

  function buildStory(task, petName, which) {
    var name = (petName && String(petName).trim()) || 'Your pet';
    var bank;
    if (task.type === 'mul') bank = mulStoryBank(name, task.a, task.b);
    else if (task.type === 'sub') bank = subStoryBank(name, task.a, task.b);
    else bank = addStoryBank(name, task.a, task.b);
    var kind = which == null ? 0 : (Math.abs(which) % bank.length);
    return bank[kind];
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
      if (want) {
        var bankSize = task.type === 'mul' ? 20 : (task.type === 'sub' ? 8 : 12);
        which = Math.floor(rng() * bankSize);
      }
    }
    task.story = want ? buildStory(task, petName, which) : null;
    return task;
  }

  function applyMulStories(tasks, petName, rng) {
    rng = rng || Math.random;
    var order = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], rng);
    var cursor = 0;
    var i;
    for (i = 0; i < tasks.length; i++) {
      if (i % 2 === 0) {
        tasks[i].story = buildStory(tasks[i], petName, order[cursor % order.length]);
        cursor += 1;
      } else {
        tasks[i].story = null;
      }
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
    if (name === 'seed' || name === 'sticker') {
      return '<g data-icon="' + name + '"><ellipse cx="16" cy="18" rx="6" ry="9" fill="#c4a35a"/></g>';
    }
    if (name === 'pot' || name === 'pail' || name === 'bag') {
      return '<g data-icon="' + name + '"><path d="M8 14 H24 L22 28 H10 Z" fill="#c4784a"/></g>';
    }
    if (name === 'bowl' || name === 'cup') {
      return '<g data-icon="' + name + '"><path d="M8 12 H24 L22 24 Q16 30 10 24 Z" fill="#8eb4c9"/></g>';
    }
    if (name === 'card' || name === 'book') {
      return '<g data-icon="' + name + '"><rect x="8" y="8" width="16" height="20" rx="2" fill="#f0e0a0" stroke="#5f7a52"/></g>';
    }
    if (name === 'nest') {
      return '<g data-icon="nest"><path d="M6 20 Q16 10 26 20 Q16 28 6 20 Z" fill="#a35f38"/></g>';
    }
    if (name === 'egg') {
      return '<g data-icon="egg"><ellipse cx="16" cy="18" rx="7" ry="9" fill="#fffaf0" stroke="#e8c49a"/></g>';
    }
    if (name === 'apple') {
      return '<g data-icon="apple"><circle cx="16" cy="18" r="8" fill="#d4564e"/><path d="M16 10 Q18 6 20 8" fill="none" stroke="#5f7a52"/></g>';
    }
    if (name === 'mat' || name === 'trail') {
      return '<g data-icon="' + name + '"><rect x="4" y="14" width="24" height="10" rx="3" fill="#7a9a68"/></g>';
    }
    if (name === 'carrot') {
      return '<g data-icon="carrot"><path d="M16 8 L22 26 H10 Z" fill="#e07a5f"/><path d="M14 8 Q16 2 18 8" fill="#5f7a52"/></g>';
    }
    if (name === 'shell') {
      return '<g data-icon="shell"><path d="M8 22 Q16 6 24 22 Z" fill="#f0e0a0"/></g>';
    }
    if (name === 'flag' || name === 'post') {
      return '<g data-icon="' + name + '"><path d="M14 6 V28" stroke="#a35f38" stroke-width="2"/><path d="M14 8 H26 L22 12 L26 16 H14 Z" fill="#d4564e"/></g>';
    }
    if (name === 'step' || name === 'pile' || name === 'stone') {
      return '<g data-icon="' + name + '"><ellipse cx="16" cy="20" rx="10" ry="6" fill="#b7b1a6"/></g>';
    }
    if (name === 'lantern') {
      return '<g data-icon="lantern"><rect x="10" y="10" width="12" height="16" rx="2" fill="#e8c84a"/><path d="M16 6 V10" stroke="#a35f38"/></g>';
    }
    if (name === 'fish') {
      return '<g data-icon="fish"><ellipse cx="14" cy="18" rx="8" ry="5" fill="#8eb4c9"/><path d="M22 18 L28 12 L28 24 Z" fill="#8eb4c9"/></g>';
    }
    if (name === 'gift') {
      return '<g data-icon="gift"><rect x="8" y="14" width="16" height="12" fill="#d4564e"/><path d="M16 14 V26 M8 18 H24" stroke="#e8c84a"/></g>';
    }
    if (name === 'ribbon' || name === 'balloon') {
      return '<g data-icon="' + name + '"><path d="M16 10 C10 10 8 18 16 22 C24 18 22 10 16 10 Z" fill="#e07a5f"/></g>';
    }
    if (name === 'paw') {
      return '<g data-icon="paw"><circle cx="16" cy="20" r="5" fill="#c4784a"/><circle cx="10" cy="12" r="2" fill="#c4784a"/><circle cx="16" cy="10" r="2" fill="#c4784a"/><circle cx="22" cy="12" r="2" fill="#c4784a"/></g>';
    }
    if (name === 'tree') {
      return '<g data-icon="tree"><rect x="14" y="18" width="4" height="10" fill="#a35f38"/><path d="M16 6 L24 18 H8 Z" fill="#5f7a52"/></g>';
    }
    if (name === 'duck' || name === 'bird' || name === 'frog') {
      return '<g data-icon="' + name + '"><ellipse cx="16" cy="18" rx="10" ry="7" fill="#e8c84a"/><circle cx="22" cy="16" r="2" fill="#2c241c"/></g>';
    }
    if (name === 'stick') {
      return '<g data-icon="stick"><path d="M8 22 L24 12" stroke="#a35f38" stroke-width="3"/></g>';
    }
    if (name === 'button') {
      return '<g data-icon="button"><circle cx="16" cy="18" r="7" fill="#d4564e"/><circle cx="14" cy="16" r="1" fill="#fff"/><circle cx="18" cy="16" r="1" fill="#fff"/></g>';
    }
    if (name === 'roll' || name === 'acorn') {
      return '<g data-icon="' + name + '"><ellipse cx="16" cy="18" rx="8" ry="6" fill="#e8c49a"/></g>';
    }
    if (name === 'kite') {
      return '<g data-icon="kite"><path d="M16 6 L26 18 L16 28 L6 18 Z" fill="#8eb4c9"/></g>';
    }
    if (name === 'pencil') {
      return '<g data-icon="pencil"><rect x="8" y="14" width="14" height="6" fill="#e8c84a"/><path d="M22 14 L28 17 L22 20 Z" fill="#e8b4b8"/></g>';
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
    if (task.format === 'missing') {
      var known = task.missing === 'b' ? task.a : task.b;
      var product = task.a * task.b;
      if (missCount === 1) {
        return 'Almost! What number times ' + known + ' makes ' + product + '?';
      }
      return 'Walkthrough: ' + task.a + ' × ' + task.b + ' = ' + product +
        '. The missing number is ' + task.answer + '. Type ' + task.answer + '.';
    }
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
      return 'Not yet — try once more.';
    }
    return 'Not yet — let us walk through it together.';
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
        fact: task.prompt + ' = ' + task.answer,
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
    FACT_RING: FACT_RING,
    shuffle: shuffle,
    factIsWeak: factIsWeak,
    factIsMastered: factIsMastered,
    rememberFact: rememberFact,
    queueRecheck: queueRecheck,
    clearRecheck: clearRecheck,
    noteSlow: noteSlow,
    plantRecheck: plantRecheck,
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
