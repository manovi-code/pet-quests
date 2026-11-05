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
  var MID_TABLES = [3, 4, 6, 11];
  var HARD_TABLES = [7, 8, 9, 12];
  var ALL_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

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

  /**
   * Weight tables toward weaker ones. Brand-new players get friendly tables.
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

    var pool;
    if (totalAttempts < 8) {
      pool = FRIENDLY_TABLES.slice();
    } else if (totalAttempts < 30) {
      pool = FRIENDLY_TABLES.concat(MID_TABLES);
    } else {
      pool = ALL_TABLES.slice();
    }

    if (options.forceAll) pool = ALL_TABLES.slice();

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
      if (HARD_TABLES.indexOf(table) !== -1 && totalAttempts >= 30) {
        weight *= 1.2;
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

  function pickOtherFactor(rng) {
    rng = rng || Math.random;
    return 1 + Math.floor(rng() * 12);
  }

  function makeMulTask(tableStats, rng, id) {
    rng = rng || Math.random;
    var weights = weightedTables(tableStats);
    var picked = pickWeighted(weights, rng);
    var a = picked.table;
    var b = pickOtherFactor(rng);
    // Prefer weaker facts when we have data
    var tries = 0;
    while (tries < 4) {
      var fk = factKey(a, b, '×');
      var fs = tableStats && null; // fact preference via parent state later
      void fs;
      void fk;
      break;
    }
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

  function makeMulTaskPreferWeakFacts(tableStats, factStats, rng, id) {
    rng = rng || Math.random;
    var weights = weightedTables(tableStats);
    var picked = pickWeighted(weights, rng);
    var a = picked.table;
    var candidates = [];
    var b;
    for (b = 1; b <= 12; b++) {
      var fk = factKey(a, b, '×');
      var fs = factStats && factStats[fk];
      var w = 1;
      if (!fs || !fs.attempts) w = 1.8;
      else if (fs.correct / fs.attempts < 0.5) w = 4;
      else if (fs.correct / fs.attempts < 0.8) w = 2;
      else w = 0.7;
      candidates.push({ b: b, weight: w });
    }
    var chosen = pickWeighted(candidates, rng);
    b = chosen.b;
    return {
      id: id || 'mul-' + a + 'x' + b + '-' + Math.floor(rng() * 1e6),
      type: 'mul',
      mission: 'multiply',
      a: a,
      b: b,
      prompt: a + ' × ' + b,
      answer: a * b,
      missCount: 0
    };
  }

  function makeAddSubTask(rng, id) {
    rng = rng || Math.random;
    var isAdd = rng() < 0.55;
    var a, b, answer, prompt, type;
    if (isAdd) {
      a = 10 + Math.floor(rng() * 40); // 10-49
      b = 5 + Math.floor(rng() * 35);  // 5-39
      answer = a + b;
      prompt = a + ' + ' + b;
      type = 'add';
    } else {
      a = 20 + Math.floor(rng() * 50); // 20-69
      b = 5 + Math.floor(rng() * Math.min(30, a - 1));
      answer = a - b;
      prompt = a + ' − ' + b;
      type = 'sub';
    }
    return {
      id: id || type + '-' + a + '-' + b + '-' + Math.floor(rng() * 1e6),
      type: type,
      mission: 'warmup',
      a: a,
      b: b,
      prompt: prompt,
      answer: answer,
      missCount: 0
    };
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
      if (missCount === 1) {
        return 'Almost! Try adding the ones place first, then the tens.';
      }
      return 'Walkthrough: ' + task.a + ' + ' + task.b + ' = ' + task.answer +
        '. Count up from ' + task.a + ' by ' + task.b + '. Now type ' + task.answer + '.';
    }
    if (task.type === 'sub') {
      if (missCount === 1) {
        return 'Take it slow — start at ' + task.a + ' and subtract ' + task.b + '.';
      }
      return 'Walkthrough: ' + task.a + ' − ' + task.b + ' = ' + task.answer +
        '. Now type ' + task.answer + ' to practice.';
    }
    return 'Give it another try — you can do this!';
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
    checkAnswer: checkAnswer,
    factKey: factKey,
    tableAccuracy: tableAccuracy,
    recordResult: recordResult,
    weightedTables: weightedTables,
    pickWeighted: pickWeighted,
    makeMulTask: makeMulTask,
    makeMulTaskPreferWeakFacts: makeMulTaskPreferWeakFacts,
    makeAddSubTask: makeAddSubTask,
    getHint: getHint,
    processMathAttempt: processMathAttempt,
    encouragement: encouragement,
    masteredTables: masteredTables
  };
});
