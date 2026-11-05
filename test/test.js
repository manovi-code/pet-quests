/**
 * Pet Quests — Node test script (no extra deps).
 * Run: node test/test.js
 */
'use strict';

var path = require('path');
var assert = require('assert');
var root = path.join(__dirname, '..', 'js');

var PQStorage = require(path.join(root, 'storage.js'));
var PQMath = require(path.join(root, 'math.js'));
var PQReading = require(path.join(root, 'reading.js'));
var PQQuest = require(path.join(root, 'quest.js'));
var PQWorld = require(path.join(root, 'world.js'));

var passed = 0;
var failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log('  ok  ' + name);
  } catch (e) {
    failed += 1;
    console.log('  FAIL  ' + name);
    console.log('    ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n    ') : e));
  }
}

console.log('Pet Quests tests\n');

test('checkAnswer accepts exact integer match', function () {
  assert.strictEqual(PQMath.checkAnswer(42, '42').ok, true);
  assert.strictEqual(PQMath.checkAnswer(42, ' 42 ').ok, true);
  assert.strictEqual(PQMath.checkAnswer(42, '41').ok, false);
  assert.strictEqual(PQMath.checkAnswer(42, '').ok, false);
  assert.strictEqual(PQMath.checkAnswer(42, 'abc').ok, false);
});

test('hint/retry: first miss gentle hint, second miss walkthrough', function () {
  var task = { type: 'mul', a: 6, b: 7, prompt: '6 × 7', answer: 42, missCount: 0 };
  var r1 = PQMath.processMathAttempt(task, '40');
  assert.strictEqual(r1.correct, false);
  assert.strictEqual(task.missCount, 1);
  assert.ok(r1.hint && r1.hint.length > 0);
  assert.strictEqual(r1.forceShowAnswer, false);
  assert.ok(r1.message.indexOf('Wrong') === -1);

  var r2 = PQMath.processMathAttempt(task, '41');
  assert.strictEqual(r2.correct, false);
  assert.strictEqual(task.missCount, 2);
  assert.strictEqual(r2.forceShowAnswer, true);
  assert.ok(/Walkthrough|Type 42/i.test(r2.hint));

  var r3 = PQMath.processMathAttempt(task, '42');
  assert.strictEqual(r3.correct, true);
  assert.strictEqual(r3.done, true);
});

test('6×7 walkthrough mentions 6×5 style scaffolding', function () {
  var hint = PQMath.getHint({ type: 'mul', a: 6, b: 7, answer: 42 }, 2);
  assert.ok(/6 × 5 = 30|Walkthrough/i.test(hint));
  assert.ok(/42/.test(hint));
});

test('adaptive weighting favors weaker tables', function () {
  var stats = {
    '2': { attempts: 10, correct: 10 },
    '7': { attempts: 10, correct: 2 }
  };
  var weights = PQMath.weightedTables(stats, { forceAll: true });
  var byTable = {};
  weights.forEach(function (w) { byTable[w.table] = w.weight; });
  assert.ok(byTable[7] > byTable[2], 'table 7 weight should exceed table 2');
});

test('brand-new player pool starts with friendly tables', function () {
  var weights = PQMath.weightedTables({});
  var tables = weights.map(function (w) { return w.table; }).sort(function (a, b) { return a - b; });
  tables.forEach(function (t) {
    assert.ok([1, 2, 5, 10].indexOf(t) !== -1, 'unexpected early table ' + t);
  });
});

test('daily quest mix: warmup then reading then mostly multiplication', function () {
  var state = PQStorage.defaultState();
  var rng = (function () {
    var n = 0;
    return function () {
      n = (n * 9301 + 49297) % 233280;
      return n / 233280;
    };
  })();
  var quest = PQQuest.generateDailyQuest(state, rng);
  var tasks = quest.tasks;
  var summary = PQQuest.questMixSummary(tasks);

  assert.ok(summary.add + summary.sub >= 3, 'warmup add/sub count');
  assert.strictEqual(summary['reading-pass'], 1, 'one reading passage');
  assert.ok(summary['reading-q'] >= 2 && summary['reading-q'] <= 3, '2–3 reading questions');
  assert.ok(summary.mul >= 10, 'multiplication is the main block');
  assert.ok(summary.mul > summary.add + summary.sub, 'more mul than warmup');

  // Order: warmup mission first, then reading, then multiply
  assert.strictEqual(tasks[0].mission, 'warmup');
  var firstReading = tasks.findIndex(function (t) { return t.mission === 'reading'; });
  var firstMul = tasks.findIndex(function (t) { return t.mission === 'multiply'; });
  assert.ok(firstReading > 0);
  assert.ok(firstMul > firstReading);

  // reading questions belong to same passage
  var passTask = tasks.find(function (t) { return t.type === 'reading-pass'; });
  var qTasks = tasks.filter(function (t) { return t.type === 'reading-q'; });
  qTasks.forEach(function (q) {
    assert.strictEqual(q.passageId, passTask.passageId);
  });
});

test('weekly progress uses local Mon–Sun weekKey and counts days', function () {
  // Wednesday Nov 5, 2026 local — construct without UTC shift surprises
  var wed = new Date(2026, 10, 5, 12, 0, 0); // month 10 = November
  assert.strictEqual(PQStorage.localDateKey(wed), '2026-11-05');
  // Monday of that week is Nov 2, 2026
  assert.strictEqual(PQStorage.localWeekKey(wed), '2026-11-02');

  var state = PQStorage.defaultState();
  PQStorage.ensureWeek(state, wed);
  assert.strictEqual(state.weekly.weekKey, '2026-11-02');

  // Complete Mon and Wed
  var mon = new Date(2026, 10, 2, 12, 0, 0);
  state.daily = { dateKey: null, completed: false, taskIndex: 0, tasks: [], answers: [] };
  PQStorage.markDailyComplete(state, mon);
  PQStorage.markDailyComplete(state, wed);

  var prog = PQStorage.weeklyProgress(state, wed);
  assert.strictEqual(prog.goal, 5);
  assert.strictEqual(prog.completed, 2);
  assert.strictEqual(prog.met, false);

  // New week resets
  var nextMon = new Date(2026, 10, 9, 12, 0, 0);
  PQStorage.ensureWeek(state, nextMon);
  assert.strictEqual(state.weekly.weekKey, '2026-11-09');
  assert.deepStrictEqual(state.weekly.completedDates, []);
});

test('localStorage save/load round-trip and corrupt recovery', function () {
  var mem = {};
  var raw = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    setItem: function (k, v) { mem[k] = String(v); },
    removeItem: function (k) { delete mem[k]; }
  };
  var s = PQStorage.createStore(raw);
  var state = s.defaultState();
  state.onboardingDone = true;
  state.petId = 'bunny';
  state.petName = 'Clover';
  state.tableStats = { '7': { attempts: 3, correct: 1 } };
  assert.strictEqual(s.save(state), true);

  var loaded = s.load();
  assert.strictEqual(loaded.version, PQStorage.SCHEMA_VERSION);
  assert.strictEqual(loaded.petId, 'bunny');
  assert.strictEqual(loaded.petName, 'Clover');
  assert.strictEqual(loaded.tableStats['7'].attempts, 3);

  // Corrupt JSON
  mem[s.STORAGE_KEY] = '{not-json';
  var fresh = s.load();
  assert.strictEqual(fresh.petId, null);
  assert.strictEqual(fresh.onboardingDone, false);

  // Wrong version
  mem[s.STORAGE_KEY] = JSON.stringify({ version: 999, petId: 'hack' });
  var fresh2 = s.load();
  assert.strictEqual(fresh2.petId, null);
});

test('reading attempt soft retry then reveal', function () {
  var passage = PQReading.PASSAGES[0];
  var tasks = PQReading.passageToTasks(passage);
  var q = tasks[1];
  var wrong = q.answer === 0 ? 1 : 0;
  var r1 = PQReading.processReadingAttempt(q, wrong);
  assert.strictEqual(r1.correct, false);
  assert.strictEqual(r1.reveal, false);
  var r2 = PQReading.processReadingAttempt(q, wrong);
  assert.strictEqual(r2.reveal, true);
  var r3 = PQReading.processReadingAttempt(q, q.answer);
  assert.strictEqual(r3.correct, true);
});

test('enough reading passages for ~2 weeks', function () {
  assert.ok(PQReading.PASSAGES.length >= 14, 'need at least 14 passages, got ' + PQReading.PASSAGES.length);
  PQReading.PASSAGES.forEach(function (p) {
    assert.ok(p.questions.length >= 2 && p.questions.length <= 3);
    assert.ok(p.text.split(/(?<=\.)\s+/).length >= 2);
  });
});

function lcg(seed) {
  var n = seed || 7;
  return function () {
    n = (n * 9301 + 49297) % 233280;
    return n / 233280;
  };
}

function scripted(values) {
  var i = 0;
  return function () {
    var v = values[i % values.length];
    i += 1;
    return v;
  };
}

var EASE = [1, 2, 5, 10, 3, 4, 11, 6, 7, 8, 9, 12];

function easeRank(table) {
  var r = EASE.indexOf(table);
  return r === -1 ? 99 : r;
}

function weekDates() {
  var dates = [];
  var i;
  for (i = 0; i < 7; i++) dates.push(new Date(2026, 10, 2 + i, 12, 0, 0));
  return dates;
}

function mulTasks(quest) {
  return quest.tasks.filter(function (t) { return t.type === 'mul'; });
}

test('grade 1 warmups are single digits and subtraction stays non-negative', function () {
  var rng = lcg(3);
  var i;
  var nonzero = 0;
  var total = 0;
  for (i = 0; i < 200; i++) {
    var task = PQMath.makeAddSubTask(rng, 'w-' + i, { grade: 1 });
    assert.ok(task.a >= 0 && task.a <= 9, 'addend a ' + task.a);
    assert.ok(task.b >= 0 && task.b <= 9, 'addend b ' + task.b);
    assert.strictEqual(task.answer, task.type === 'add' ? task.a + task.b : task.a - task.b);
    if (task.type === 'sub') {
      assert.ok(task.b <= task.a);
      assert.ok(task.answer >= 0 && task.answer <= 9);
    } else {
      assert.ok(task.answer <= 18);
    }
    if (task.a > 0) nonzero += 1;
    if (task.b > 0) nonzero += 1;
    total += 2;
    var hint = PQMath.getHint(task, 1) + ' ' + PQMath.getHint(task, 2);
    assert.ok(!/ones|tens/i.test(hint), hint);
  }
  assert.ok(nonzero / total > 0.7, 'most warmups use 1–9');
});

test('grade 2 warmups stay within 20 and higher grades stay in their cap', function () {
  var wide = PQMath.makeAddSubTask(scripted([0.1, 0.9, 0.99, 0]), 'wide', { grade: 2 });
  assert.strictEqual(wide.type, 'add');
  assert.strictEqual(wide.a, 20);
  assert.ok(wide.answer <= 20);

  var rng = lcg(11);
  var i;
  var sawTeen = false;
  for (i = 0; i < 180; i++) {
    var task = PQMath.makeAddSubTask(rng, 'g2-' + i, { grade: 2 });
    assert.ok(task.a >= 0 && task.a <= 20);
    assert.ok(task.b >= 0 && task.b <= 20);
    if (task.type === 'add') assert.ok(task.answer <= 20);
    if (task.type === 'sub') {
      assert.ok(task.b <= task.a);
      assert.ok(task.answer >= 0);
    }
    if (task.a > 9 || task.b > 9) sawTeen = true;
  }
  assert.ok(sawTeen, 'grade 2 includes some facts within 20 that are not single-digit');

  for (i = 0; i < 80; i++) {
    var g5 = PQMath.makeAddSubTask(rng, 'g5-' + i, { grade: 5 });
    assert.ok(g5.a >= 0 && g5.a <= 100);
    assert.ok(g5.b >= 0 && g5.b <= 100);
    if (g5.type === 'add') assert.ok(g5.answer <= 100);
    if (g5.type === 'sub') {
      assert.ok(g5.b <= g5.a);
      assert.ok(g5.answer >= 0);
    }
  }
});

test('unselected missions and tables are left out', function () {
  var state = PQStorage.defaultState();
  state.courses.parts = { warmup: false, reading: false, multiply: true };
  state.courses.tables = [4, 9];
  state.courses.grade = 5;
  var quest = PQQuest.generateDailyQuest(state, lcg(4), { now: new Date(2026, 10, 2, 12, 0, 0) });
  assert.ok(quest.tasks.length > 0);
  quest.tasks.forEach(function (t) {
    assert.strictEqual(t.mission, 'multiply');
    assert.ok(t.a === 4 || t.a === 9, 'practiced table ' + t.a);
  });

  state.courses.parts = { warmup: true, reading: false, multiply: false };
  state.courses.tables = [2, 5, 7];
  var quest2 = PQQuest.generateDailyQuest(state, lcg(5), { now: new Date(2026, 10, 2, 12, 0, 0) });
  quest2.tasks.forEach(function (t) {
    assert.strictEqual(t.mission, 'warmup');
    assert.ok(t.type === 'add' || t.type === 'sub');
  });
});

test('a week of quests covers every selected table and starts easier', function () {
  var state = PQStorage.defaultState();
  state.courses.grade = 5;
  state.courses.tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  var seen = {};
  var mondayEase = -1;
  var sundayEase = -1;
  var dates = weekDates();
  dates.forEach(function (date, day) {
    var quest = PQQuest.generateDailyQuest(state, lcg(20 + day), { now: date });
    mulTasks(quest).forEach(function (t) {
      seen[t.a] = true;
      assert.ok(t.b >= 1 && t.b <= 12);
      if (day === 0) {
        assert.ok(t.b <= 6, 'Monday factor ' + t.b);
        if (easeRank(t.a) > mondayEase) mondayEase = easeRank(t.a);
      }
      if (day === 6 && easeRank(t.a) > sundayEase) sundayEase = easeRank(t.a);
    });
  });
  state.courses.tables.forEach(function (table) {
    assert.ok(seen[table], 'missing table ' + table);
  });
  assert.ok(mondayEase < sundayEase, 'Monday ease ' + mondayEase + ' Sunday ' + sundayEase);

  state.tableStats = { '2': { attempts: 8, correct: 7 } };
  var plan = PQMath.weeklyTablePlan(state.courses.tables);
  var stretchDay = -1;
  var d;
  for (d = 2; d < 7; d++) {
    var pool = plan[d].focus.concat(plan[d].review);
    if (pool.indexOf(2) !== -1 && plan[d].introduced.indexOf(2) === -1) stretchDay = d;
  }
  assert.ok(stretchDay >= 2);
  var later = PQQuest.generateDailyQuest(state, lcg(99), { now: dates[stretchDay] });
  var high = mulTasks(later).some(function (t) { return t.a === 2 && t.b >= 7; });
  assert.ok(high, 'a familiar table later in the week includes a larger factor');
  mulTasks(later).forEach(function (t) {
    if (plan[stretchDay].introduced.indexOf(t.a) !== -1) {
      assert.ok(t.b <= 6, 'new table stays smaller, got ' + t.a + '×' + t.b);
    }
  });
});

test('grade limits which tables and factors appear', function () {
  var state = PQStorage.defaultState();
  state.courses.grade = 1;
  state.courses.tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  var seen = {};
  weekDates().forEach(function (date, day) {
    var quest = PQQuest.generateDailyQuest(state, lcg(40 + day), { now: date });
    mulTasks(quest).forEach(function (t) {
      seen[t.a] = true;
      assert.ok([1, 2, 5, 10].indexOf(t.a) !== -1, 'grade 1 table ' + t.a);
      assert.ok(t.b >= 1 && t.b <= 5, 'grade 1 factor ' + t.b);
      if (day === 0) assert.ok(t.b <= 3);
    });
  });
  [1, 2, 5, 10].forEach(function (table) {
    assert.ok(seen[table], 'grade 1 should cover ' + table);
  });
  assert.ok(!seen[7] && !seen[9] && !seen[12]);

  state.courses.tables = [7];
  var only = PQQuest.generateDailyQuest(state, lcg(3), { now: weekDates()[0] });
  mulTasks(only).forEach(function (t) {
    assert.strictEqual(t.a, 7);
    assert.ok(t.b <= 5);
  });

  state.courses.grade = 3;
  state.courses.tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  var allowed = PQMath.tablesForGrade(3);
  weekDates().forEach(function (date, day) {
    var quest = PQQuest.generateDailyQuest(state, lcg(70 + day), { now: date });
    mulTasks(quest).forEach(function (t) {
      assert.ok(allowed.indexOf(t.a) !== -1, 'grade 3 table ' + t.a);
      assert.ok(t.b <= 9);
    });
  });
});

test('grade does not change until a parent or kid accepts it', function () {
  var state = PQStorage.defaultState();
  state.courses.grade = 2;
  state.courses.tables = [2, 5];
  state.tableStats = {
    '2': { attempts: 10, correct: 9 },
    '5': { attempts: 10, correct: 9 }
  };
  var info = PQQuest.gradeReadiness(state);
  assert.strictEqual(info.ready, true);
  assert.strictEqual(info.next, 3);
  assert.strictEqual(state.courses.grade, 2);
  assert.strictEqual(PQQuest.applyNextGrade(state), true);
  assert.strictEqual(state.courses.grade, 3);
  assert.strictEqual(PQQuest.gradeReadiness(state).ready, false);
  state.courses.grade = 1;
  assert.strictEqual(state.courses.grade, 1);
});

test('today line names the focus tables', function () {
  var text = PQQuest.describeToday({
    parts: { warmup: true, reading: true, multiply: true },
    focus: [5, 2],
    review: []
  });
  assert.ok(text.tablesLine.indexOf('2s and 5s') !== -1);
  assert.ok(text.partsLine.indexOf('warmup math') !== -1);
  assert.ok(text.partsLine.indexOf('short pet story') !== -1);
});

test('new course fields merge without wiping pet progress', function () {
  assert.strictEqual(PQStorage.SCHEMA_VERSION, 1);
  var mem = {};
  var raw = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    setItem: function (k, v) { mem[k] = String(v); },
    removeItem: function (k) { delete mem[k]; }
  };
  var s = PQStorage.createStore(raw);
  mem[s.STORAGE_KEY] = JSON.stringify({
    version: 1,
    onboardingDone: true,
    petId: 'bunny',
    petName: 'Clover',
    growthStage: 2,
    growthPoints: 30,
    soundOn: true,
    tableStats: { '4': { attempts: 2, correct: 1 } },
    factStats: { '2×4': { attempts: 1, correct: 1 } },
    daily: {
      dateKey: '2026-11-05',
      completed: true,
      taskIndex: 4,
      tasks: [{ id: 'keep', type: 'add', a: 3, b: 3, answer: 6 }],
      answers: [{ id: 'keep', ok: true }]
    },
    weekly: { weekKey: '2026-11-02', completedDates: ['2026-11-02', '2026-11-05'] },
    readingUsedIds: ['r01']
  });
  var loaded = s.load();
  assert.strictEqual(loaded.version, 1);
  assert.strictEqual(loaded.petId, 'bunny');
  assert.strictEqual(loaded.petName, 'Clover');
  assert.strictEqual(loaded.growthPoints, 30);
  assert.strictEqual(loaded.growthStage, 2);
  assert.strictEqual(loaded.tableStats['4'].attempts, 2);
  assert.strictEqual(loaded.weekly.completedDates.length, 2);
  assert.strictEqual(loaded.daily.tasks[0].id, 'keep');
  assert.strictEqual(loaded.courses.grade, 2);
  assert.strictEqual(loaded.courses.parts.warmup, true);
  assert.strictEqual(loaded.courses.parts.reading, true);
  assert.strictEqual(loaded.courses.tables.length, 12);
  assert.deepStrictEqual(loaded.world.unlocks, []);

  loaded.courses.grade = 1;
  loaded.courses.tables = [2, 5];
  loaded.courses.parts.reading = false;
  assert.strictEqual(s.save(loaded), true);
  var again = s.load();
  assert.strictEqual(again.petId, 'bunny');
  assert.strictEqual(again.growthPoints, 30);
  assert.strictEqual(again.courses.grade, 1);
  assert.deepStrictEqual(again.courses.tables, [2, 5]);
  assert.strictEqual(again.courses.parts.reading, false);
  assert.strictEqual(again.courses.parts.warmup, true);
});

test('neighborhood unlocks survive reload and roleplay has no fail state', function () {
  var mem = {};
  var raw = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    setItem: function (k, v) { mem[k] = String(v); },
    removeItem: function (k) { delete mem[k]; }
  };
  var s = PQStorage.createStore(raw);
  var state = s.defaultState();
  state.onboardingDone = true;
  state.petId = 'owl';
  state.petName = 'Pip';
  state.growthPoints = 10;
  var first = PQWorld.grantNextUnlock(state);
  assert.strictEqual(first.id, 'pet-bowl');
  var second = PQWorld.grantNextUnlock(state);
  assert.strictEqual(second.id, 'library-seat');
  assert.strictEqual(s.save(state), true);

  var loaded = s.load();
  assert.strictEqual(loaded.petId, 'owl');
  assert.strictEqual(loaded.petName, 'Pip');
  assert.strictEqual(loaded.growthPoints, 10);
  assert.deepStrictEqual(loaded.world.unlocks, ['pet-bowl', 'library-seat']);
  assert.strictEqual(loaded.version, 1);

  var fed = PQWorld.playAction('pet', 'feed', loaded, { petName: 'Pip', step: 0 });
  assert.ok(/bowl/i.test(fed.message));
  assert.ok(fed.message.indexOf('Pip') !== -1);
  assert.ok(!/wrong|fail|lose/i.test(fed.message));
  var played = PQWorld.playAction('cottage', 'kettle', loaded, { petName: 'Pip', step: 0 });
  assert.ok(played.message.length > 0);
  var houses = PQWorld.HOUSES.map(function (h) { return h.id; });
  assert.ok(houses.indexOf('pet') !== -1);
  assert.ok(houses.indexOf('cottage') !== -1);
  assert.ok(houses.indexOf('library') !== -1);
  assert.ok(houses.indexOf('school') !== -1);
});

test('settings changes rebuild today only before the quest starts', function () {
  var state = PQStorage.defaultState();
  var wed = new Date(2026, 10, 4, 12, 0, 0);
  PQQuest.ensureTodayQuest(state, lcg(8), wed);
  assert.ok(state.daily.tasks.some(function (t) { return t.mission === 'reading'; }));
  state.courses.parts.reading = false;
  PQQuest.ensureTodayQuest(state, lcg(8), wed);
  assert.ok(!state.daily.tasks.some(function (t) { return t.mission === 'reading'; }));

  state.daily.taskIndex = 1;
  state.daily.tasks[0].cleared = true;
  var kept = state.daily.tasks.length;
  state.courses.grade = 1;
  PQQuest.ensureTodayQuest(state, lcg(8), wed);
  assert.strictEqual(state.daily.tasks.length, kept);
  assert.strictEqual(state.daily.taskIndex, 1);
});

test('growth stages advance with quest points', function () {
  assert.strictEqual(PQQuest.stageFromPoints(0), 0);
  assert.strictEqual(PQQuest.stageFromPoints(10), 1);
  assert.strictEqual(PQQuest.stageFromPoints(25), 2);
  assert.strictEqual(PQQuest.stageFromPoints(50), 3);
  assert.strictEqual(PQQuest.stageFromPoints(80), 4);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
