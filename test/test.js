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
var PQLearn = require(path.join(root, 'learn.js'));
var PQSolitaire = require(path.join(root, 'solitaire.js'));
var PQParty = require(path.join(root, 'party.js'));
var PQBank = require(path.join(root, 'bank.js'));
var PQShop = require(path.join(root, 'shop.js'));
var PQGames = require(path.join(root, 'games.js'));
var PQBoards = require(path.join(root, 'boards.js'));
var PQDays = require(path.join(root, 'days.js'));
var fs = require('fs');

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
  assert.ok(text.partsLine.indexOf('pet story') !== -1);
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

function hasWholeNumber(text, n) {
  return new RegExp('(?:^|\\D)' + n + '(?:\\D|$)').test(String(text));
}

function warmupWithinGrade(task, grade) {
  if (grade <= 1) {
    assert.ok(task.a >= 0 && task.a <= 9, 'g1 a ' + task.a);
    assert.ok(task.b >= 0 && task.b <= 9, 'g1 b ' + task.b);
  } else if (grade === 2) {
    assert.ok(task.a >= 0 && task.a <= 20);
    assert.ok(task.b >= 0 && task.b <= 20);
  } else if (grade === 3) {
    assert.ok(task.a >= 0 && task.a <= 50);
    assert.ok(task.b >= 0 && task.b <= 50);
  } else {
    assert.ok(task.a >= 0 && task.a <= 100);
    assert.ok(task.b >= 0 && task.b <= 100);
  }
  if (task.type === 'add') assert.strictEqual(task.answer, task.a + task.b);
  if (task.type === 'sub') {
    assert.ok(task.b <= task.a);
    assert.strictEqual(task.answer, task.a - task.b);
    assert.ok(task.answer >= 0);
  }
  if (task.type === 'add' && grade === 2) assert.ok(task.answer <= 20);
  if (task.type === 'add' && grade === 3) assert.ok(task.answer <= 50);
  if (task.type === 'add' && grade >= 4) assert.ok(task.answer <= 100);
}

test('story-math numbers honor grade caps', function () {
  var grade;
  var i;
  for (grade = 1; grade <= 5; grade++) {
    var rng = lcg(30 + grade);
    for (i = 0; i < 30; i++) {
      var id = i === 0 ? 'warm-0' : (i === 1 ? 'warm-1' : ('warm-x-' + i));
      var task = PQMath.makeAddSubTask(rng, id, { grade: grade, petName: 'Maple' });
      warmupWithinGrade(task, grade);
      if (task.story) {
        assert.ok(hasWholeNumber(task.story.text, task.a), task.story.text);
        assert.ok(hasWholeNumber(task.story.text, task.b), task.story.text);
        assert.ok(task.story.text.indexOf('Maple') !== -1);
        task.story.scenes.forEach(function (scene) {
          assert.ok(scene.count >= 0 && scene.count <= 10);
          if (scene.count > 1) assert.ok(scene.count === task.a || scene.count === task.b);
        });
      }
    }
  }

  var state = PQStorage.defaultState();
  state.petName = 'Maple';
  state.courses.grade = 2;
  state.courses.parts = { warmup: true, reading: false, multiply: false };
  var quest = PQQuest.generateDailyQuest(state, lcg(8), { now: new Date(2026, 10, 5, 12, 0, 0) });
  assert.ok(quest.tasks[0].story, 'first warmup is a picture story');
  assert.ok(/strawberr/i.test(quest.tasks[0].story.text));
  assert.strictEqual(quest.tasks[1].story, null, 'a plain problem stays in the mix');
  var svg = PQMath.renderStorySvg(quest.tasks[0].story);
  assert.ok(svg.indexOf('<svg') !== -1);
  assert.ok(svg.indexOf('data-icon="strawberry"') !== -1);
  warmupWithinGrade(quest.tasks[0], 2);

  state.courses.grade = 1;
  state.courses.parts = { warmup: false, reading: false, multiply: true };
  state.courses.tables = [2, 7, 9];
  var mulQuest = PQQuest.generateDailyQuest(state, lcg(4), { now: new Date(2026, 10, 2, 12, 0, 0) });
  var sawStory = false;
  var sawPlain = false;
  mulQuest.tasks.forEach(function (t) {
    assert.strictEqual(t.a, 2, 'turned-off or above-grade tables stay out, got ' + t.a);
    assert.ok(t.b >= 1 && t.b <= 5);
    assert.strictEqual(t.answer, t.a * t.b);
    if (t.story) {
      sawStory = true;
      assert.ok(hasWholeNumber(t.story.text, t.a));
      assert.ok(hasWholeNumber(t.story.text, t.b));
      assert.ok(t.story.text.indexOf('Maple') !== -1);
    } else {
      sawPlain = true;
    }
  });
  assert.ok(sawStory && sawPlain, 'picture stories are mixed with plain problems');
});

test('new games show only the house and hide locked places and items', function () {
  var state = PQStorage.defaultState();
  var visible = PQWorld.visiblePlaces(state);
  assert.strictEqual(visible.length, 1);
  assert.strictEqual(visible[0].id, 'pet');
  var label = PQWorld.mapLabel(state, 'Maple');
  assert.ok(label.indexOf('Library') === -1);
  assert.ok(label.indexOf('Zoo') === -1);
  assert.ok(label.indexOf('parlor') === -1);
  assert.ok(!/not open|locked/i.test(label));
  ['library', 'school', 'garden', 'zoo', 'vet', 'police', 'parlor'].forEach(function (id) {
    assert.strictEqual(PQWorld.isPlaceOpen(state, id), false, id);
    assert.ok(!PQWorld.visiblePlaces(state).some(function (house) { return house.id === id; }));
  });
  assert.strictEqual(PQWorld.visibleItems(state).length, 0);
  assert.ok(PQWorld.allItems().length >= 40);
  PQWorld.allItems().forEach(function (item) {
    assert.ok(!PQWorld.visibleItems(state).some(function (shown) { return shown.id === item.id; }));
  });
  assert.strictEqual(PQWorld.placeItem(state, 'pet', 'vet-heart'), null);
  var help = PQWorld.placeHelp(PQWorld.getHouse('garden'), PQWorld.placeProgress(state, PQWorld.getHouse('garden')));
  assert.ok(/quest/i.test(help));
  assert.ok(!/garden/i.test(help));

  PQWorld.noteQuestFinished(state, '2026-11-05');
  assert.strictEqual(PQWorld.isPlaceOpen(state, 'library'), true);
  assert.strictEqual(PQWorld.isPlaceOpen(state, 'zoo'), false);
  assert.ok(PQWorld.mapLabel(state, 'Maple').indexOf('Library') !== -1);
  assert.ok(PQWorld.mapLabel(state, 'Maple').indexOf('Zoo') === -1);
  var gift = PQWorld.playAction('pet', 'surprise', state, { petName: 'Maple', dateKey: '2026-11-05', step: 0 });
  assert.ok(gift.prize && gift.prize.name);
  assert.ok(/saved on this device/i.test(gift.message));
  assert.ok(!/wrong|fail|lose|shame/i.test(gift.message));
  assert.strictEqual(PQWorld.isPlaceOpen(state, 'school'), true);
  assert.strictEqual(PQWorld.isPlaceOpen(state, 'parlor'), false);

  var before = state.world.prizes.length;
  var activities = state.world.activitiesDone;
  var again = PQWorld.playAction('pet', 'surprise', state, { petName: 'Maple', dateKey: '2026-11-05', step: 1 });
  assert.strictEqual(again.prize, null);
  assert.strictEqual(again.already, true);
  assert.strictEqual(state.world.prizes.length, before);
  assert.strictEqual(state.world.activitiesDone, activities);
  assert.ok(!/wrong|fail|lose|shame/i.test(again.message));

  var hinted = PQWorld.playAction('school', 'hint-star', state, { petName: 'Maple', dateKey: '2026-11-05' });
  assert.ok(hinted.prize);
  assert.ok(state.world.hintTokens >= 1);
  assert.ok(!/wrong|fail|lose|shame/i.test(hinted.message));

  var bowl = PQWorld.grantNextUnlock(state);
  assert.strictEqual(bowl.id, 'pet-bowl');
  assert.ok(PQWorld.placeItem(state, 'pet', 'pet-bowl'));
  assert.strictEqual(PQWorld.placeItem(state, 'pet', 'zoo-leaf'), null);
  var shownIds = PQWorld.visibleItems(state).map(function (item) { return item.id; });
  assert.ok(shownIds.indexOf('pet-bowl') !== -1);
  assert.strictEqual(shownIds.indexOf('zoo-leaf'), -1);
  assert.strictEqual(shownIds.indexOf('parlor-mat'), -1);
  var moved = PQWorld.moveItem(state, 'pet', 'pet-bowl');
  assert.ok(moved && moved.slot !== 0);
  assert.strictEqual(PQWorld.returnItem(state, 'pet', 'pet-bowl'), true);
  assert.strictEqual(PQWorld.placementsFor(state, 'pet').length, 0);
});

test('location prizes persist without wiping the pet', function () {
  var mem = {};
  var raw = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    setItem: function (k, v) { mem[k] = String(v); },
    removeItem: function (k) { delete mem[k]; }
  };
  var s = PQStorage.createStore(raw);
  var state = s.defaultState();
  state.onboardingDone = true;
  state.petId = 'kitten';
  state.petName = 'Maple';
  state.growthPoints = 10;
  state.world.unlocks = ['pet-bowl'];
  PQWorld.noteQuestFinished(state, '2026-11-05');
  PQWorld.playAction('cottage', 'snack', state, { petName: 'Maple', dateKey: '2026-11-05' });
  assert.strictEqual(s.save(state), true);
  var loaded = s.load();
  assert.strictEqual(loaded.version, 1);
  assert.strictEqual(PQStorage.SCHEMA_VERSION, 1);
  assert.strictEqual(loaded.petId, 'kitten');
  assert.strictEqual(loaded.petName, 'Maple');
  assert.strictEqual(loaded.growthPoints, 10);
  assert.ok(loaded.world.unlocks.indexOf('pet-bowl') !== -1);
  assert.ok(loaded.world.places.indexOf('library') !== -1);
  assert.strictEqual(loaded.world.places.indexOf('parlor'), -1);
  assert.ok(loaded.world.prizes.length >= 1);
  assert.ok(loaded.world.prizes[0].name);
});

test('party starts after quest completion and can be skipped', function () {
  var state = PQStorage.defaultState();
  state.petName = 'Maple';
  state.petId = 'bunny';
  state.daily = { dateKey: '2026-11-05', completed: false, taskIndex: 3, tasks: [], answers: [] };
  var when = new Date(2026, 10, 5, 15, 0, 0);
  PQStorage.markDailyComplete(state, when);
  PQQuest.applyGrowthForQuest(state, false);
  var points = state.growthPoints;
  var stage = state.growthStage;
  assert.strictEqual(state.daily.completed, true);
  assert.ok(points >= 10);

  var party = PQParty.offerParty(state, '2026-11-05');
  assert.strictEqual(party.offered, true);
  assert.strictEqual(party.skipped, false);

  var left = PQParty.skipParty(state, '2026-11-05');
  assert.strictEqual(left.skipped, true);
  assert.strictEqual(left.completed, true);
  assert.strictEqual(state.daily.completed, true);
  assert.strictEqual(state.growthPoints, points);
  assert.strictEqual(state.growthStage, stage);

  var spin = PQParty.spin(state, function () { return 0; }, '2026-11-05');
  assert.strictEqual(spin.ok, true);
  assert.strictEqual(spin.limited, false);
  assert.strictEqual(spin.rare, true);
  assert.ok(spin.prize && spin.prize.name);
  assert.ok(!/bet|wager|jackpot|lose|shame/i.test(spin.message));
  PQParty.spin(state, function () { return 0.4; }, '2026-11-05');
  PQParty.spin(state, function () { return 0.8; }, '2026-11-05');
  var stopped = PQParty.spin(state, function () { return 0.2; }, '2026-11-05');
  assert.strictEqual(stopped.limited, true);
  assert.strictEqual(stopped.prize, null);
  assert.ok(/resting/i.test(stopped.message));
  assert.ok(state.world.prizes.length >= 1);

  var deck = PQParty.createCardDeck(function () { return 0; });
  assert.strictEqual(deck.length, 6);
  var faces = {};
  deck.forEach(function (card) { faces[card.face] = (faces[card.face] || 0) + 1; });
  assert.strictEqual(faces.fox, 2);
  assert.strictEqual(faces.frog, 2);
  assert.strictEqual(faces.bird, 2);
  var first = PQParty.flipCard(deck, 0);
  assert.ok(!first.cleared);
  assert.ok(!/wrong|fail|lose|shame/i.test(first.message));
  var other = 1;
  while (other < deck.length && deck[other].face === deck[0].face) other += 1;
  var miss = PQParty.flipCard(deck, other);
  assert.strictEqual(miss.matched, false);
  assert.strictEqual(miss.needsContinue, true);
  assert.ok(!/wrong|fail|lose|shame/i.test(miss.message));
  assert.strictEqual(state.daily.completed, true);
});

test('old saves merge new fields and keep grade, courses, and unlocks', function () {
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
    petId: 'kitten',
    petName: 'Maple',
    growthStage: 2,
    growthPoints: 25,
    soundOn: false,
    tableStats: { '2': { attempts: 4, correct: 3 } },
    courses: {
      parts: { warmup: false, reading: false, multiply: true },
      tables: [2, 5],
      grade: 2
    },
    world: { unlocks: ['pet-bowl', 'library-seat'] },
    weekly: { weekKey: '2026-11-02', completedDates: ['2026-11-02', '2026-11-04'] }
  });
  var loaded = s.load();
  assert.strictEqual(loaded.version, 1);
  assert.strictEqual(loaded.petName, 'Maple');
  assert.strictEqual(loaded.petId, 'kitten');
  assert.strictEqual(loaded.growthPoints, 25);
  assert.strictEqual(loaded.growthStage, 2);
  assert.strictEqual(loaded.soundOn, false);
  assert.strictEqual(loaded.tableStats['2'].correct, 3);
  assert.strictEqual(loaded.courses.grade, 2);
  assert.strictEqual(loaded.courses.parts.reading, false);
  assert.strictEqual(loaded.courses.parts.multiply, true);
  assert.deepStrictEqual(loaded.courses.tables, [2, 5]);
  assert.deepStrictEqual(loaded.world.unlocks, ['pet-bowl', 'library-seat']);
  assert.deepStrictEqual(loaded.world.places, []);
  assert.deepStrictEqual(loaded.world.prizes, []);
  assert.strictEqual(loaded.party.offered, false);
  assert.strictEqual(loaded.weekly.completedDates.length, 2);

  var seen = {};
  weekDates().forEach(function (date, day) {
    var quest = PQQuest.generateDailyQuest(loaded, lcg(50 + day), { now: date });
    assert.ok(!quest.tasks.some(function (t) { return t.mission === 'reading' || t.mission === 'warmup'; }));
    mulTasks(quest).forEach(function (t) {
      assert.ok(t.a === 2 || t.a === 5, 'table ' + t.a);
      seen[t.a] = true;
      if (t.story) assert.strictEqual(t.answer, t.a * t.b);
    });
  });
  assert.ok(seen[2] && seen[5]);
});

function wordCount(text) {
  return String(text).trim().split(/\s+/).length;
}

test('reading bank grew and grade 1–2 stays simpler than grade 4–5', function () {
  assert.ok(PQReading.PASSAGES.length >= 32, 'passages ' + PQReading.PASSAGES.length);
  assert.ok(PQReading.LIBRARY_BOOKS.length >= 4);
  var easyWords = 0;
  var easyN = 0;
  var richWords = 0;
  var richN = 0;
  PQReading.PASSAGES.forEach(function (p) {
    assert.ok(p.level >= 1 && p.level <= 3, p.id);
    p.questions.forEach(function (q) {
      assert.ok(q.answer >= 0 && q.answer < q.choices.length, p.id);
    });
    if (p.level === 1) {
      easyWords += wordCount(p.text);
      easyN += 1;
    }
    if (p.level === 3) {
      richWords += wordCount(p.text);
      richN += 1;
    }
  });
  assert.ok(easyN >= 8 && richN >= 4);
  assert.ok(easyWords / easyN < richWords / richN);

  var i;
  for (i = 0; i < 12; i++) {
    assert.strictEqual(PQReading.pickPassage([], lcg(i + 1), { grade: 1 }).level, 1);
    assert.strictEqual(PQReading.pickPassage([], lcg(i + 3), { grade: 2 }).level, 1);
    assert.strictEqual(PQReading.pickPassage([], lcg(i + 9), { grade: 5 }).level, 3);
  }
  var books = PQReading.libraryBooks(2, 'Maple');
  assert.ok(books[0].text.indexOf('Maple') !== -1);
  assert.ok(books[0].text.indexOf('{name}') === -1);
  assert.ok(books[0].level <= books[books.length - 1].level);
});

function wordsIn(text) {
  return wordCount(text);
}

function parasIn(text) {
  return String(text).split(/\n\n+/).length;
}

test('champion reading is longer and richer than scout reading', function () {
  var scoutWords = 0;
  var scoutParas = 0;
  var scoutN = 0;
  var champWords = 0;
  var champParas = 0;
  var champN = 0;
  PQReading.PASSAGES.forEach(function (p) {
    if (p.level === 1) {
      scoutWords += wordsIn(p.text);
      scoutParas += parasIn(p.text);
      scoutN += 1;
    }
    if (p.level === 3) {
      champWords += wordsIn(p.text);
      champParas += parasIn(p.text);
      champN += 1;
    }
  });
  assert.ok(scoutN >= 8 && champN >= 4);
  assert.ok(champWords / champN > (scoutWords / scoutN) * 1.8);
  assert.ok(champParas / champN > scoutParas / scoutN);
  var scoutPick = PQReading.pickPassage([], lcg(2), { grade: 1 });
  var champPick = PQReading.pickPassage([], lcg(9), { grade: 5 });
  assert.strictEqual(scoutPick.level, 1);
  assert.strictEqual(champPick.level, 3);
  var scoutBook = 0;
  var champBook = 0;
  PQReading.LIBRARY_BOOKS.forEach(function (book) {
    if (book.level === 1) scoutBook = Math.max(scoutBook, wordsIn(book.text));
    if (book.level === 3) champBook = Math.max(champBook, wordsIn(book.text));
  });
  assert.ok(champBook > scoutBook * 2);
});

test('old saves map grade to adventure rank without wiping the pet', function () {
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
    petId: 'owl',
    petName: 'Pip',
    growthStage: 2,
    growthPoints: 30,
    courses: { grade: 4, parts: { warmup: true, reading: true, multiply: true }, tables: [2, 5] },
    world: { unlocks: ['pet-bowl', 'library-seat'], places: ['garden'], prizes: [{ id: 'pet-sticker', name: 'a paw-print sticker', kind: 'sticker' }] }
  });
  var loaded = s.load();
  assert.strictEqual(loaded.petId, 'owl');
  assert.strictEqual(loaded.petName, 'Pip');
  assert.strictEqual(loaded.growthPoints, 30);
  assert.strictEqual(loaded.courses.grade, 4);
  assert.strictEqual(loaded.courses.rank, 'keeper');
  assert.deepStrictEqual(loaded.world.unlocks, ['pet-bowl', 'library-seat']);
  assert.ok(loaded.world.places.indexOf('garden') !== -1);
  assert.strictEqual(loaded.world.prizes[0].name, 'a paw-print sticker');
  PQWorld.syncFromProgress(loaded);
  assert.strictEqual(PQWorld.isPlaceOpen(loaded, 'library'), true);
  assert.strictEqual(PQWorld.isPlaceOpen(loaded, 'school'), true);
  assert.strictEqual(PQWorld.isPlaceOpen(loaded, 'parlor'), false);
  assert.strictEqual(loaded.petId, 'owl');

  mem[s.STORAGE_KEY] = JSON.stringify({
    version: 1,
    onboardingDone: true,
    petId: 'kitten',
    petName: 'Maple',
    growthPoints: 10,
    settings: { grade: 1 }
  });
  var fromSettings = s.load();
  assert.strictEqual(fromSettings.petId, 'kitten');
  assert.strictEqual(fromSettings.petName, 'Maple');
  assert.strictEqual(fromSettings.courses.grade, 1);
  assert.strictEqual(fromSettings.courses.rank, 'scout');
  assert.strictEqual(PQStorage.SCHEMA_VERSION, 1);
});

test('zoo vet police and solitaire stay gated until unlock', function () {
  var fresh = PQStorage.defaultState();
  fresh.petId = 'bunny';
  assert.deepStrictEqual(PQLearn.availableIds(fresh), []);
  assert.strictEqual(PQLearn.forPlace(fresh, 'zoo'), null);
  assert.strictEqual(PQLearn.forPlace(fresh, 'vet'), null);
  assert.strictEqual(PQLearn.forPlace(fresh, 'police'), null);
  assert.strictEqual(PQSolitaire.canPlay(fresh), false);
  assert.strictEqual(PQSolitaire.openGame(fresh, lcg(1), '2026-11-05').game, null);

  fresh.world.places = ['zoo', 'vet', 'police', 'parlor'];
  fresh.courses.grade = 1;
  fresh.courses.rank = 'scout';
  var scoutZoo = PQLearn.forPlace(fresh, 'zoo');
  var scoutVet = PQLearn.forPlace(fresh, 'vet');
  var scoutPolice = PQLearn.forPlace(fresh, 'police');
  assert.ok(scoutZoo && scoutZoo.reading);
  assert.ok(scoutVet && scoutVet.play && scoutVet.play.kind === 'body');
  assert.ok(scoutPolice && scoutPolice.play && scoutPolice.play.kind === 'clues');
  fresh.courses.grade = 5;
  fresh.courses.rank = 'champion';
  var champZoo = PQLearn.forPlace(fresh, 'zoo');
  var champVet = PQLearn.forPlace(fresh, 'vet');
  var champPolice = PQLearn.forPlace(fresh, 'police');
  assert.ok(wordsIn(champZoo.reading) > wordsIn(scoutZoo.reading));
  assert.ok(champZoo.questions.length >= scoutZoo.questions.length);
  assert.ok(wordsIn(champVet.reading) > wordsIn(scoutVet.reading));
  assert.ok(champVet.play.parts.length >= scoutVet.play.parts.length);
  assert.ok(champPolice.play.pairs.length >= scoutPolice.play.pairs.length);
  assert.ok(!/medicine|diagnos|surgery|sick/i.test(champVet.reading));
  var progress = PQLearn.begin(scoutZoo);
  var looked = PQLearn.act(scoutZoo, progress, { type: 'continue' });
  assert.ok(!/wrong|fail|lose|shame/i.test(looked.message + looked.hint));
  assert.strictEqual(PQSolitaire.canPlay(fresh), true);
});

test('solitaire has no wagering and scout is gentler than champion', function () {
  var src = fs.readFileSync(path.join(root, 'solitaire.js'), 'utf8');
  assert.ok(!/wager|betting|jackpot|losing streak|\bcoins?\b/i.test(src));
  var scout = PQSolitaire.createGame(1, lcg(3));
  var champ = PQSolitaire.createGame(5, lcg(4));
  assert.ok(PQSolitaire.cardCount(champ) > PQSolitaire.cardCount(scout));
  assert.ok(PQSolitaire.faceDownCount(champ) > PQSolitaire.faceDownCount(scout));
  assert.ok(!scout.coins && !scout.bet && !scout.wager);
  var guard = 0;
  var solved = false;
  while (!scout.won && guard < 60) {
    var move = PQSolitaire.findMove(scout);
    if (!move) break;
    var result = PQSolitaire.applyMove(scout, move);
    assert.ok(!/wager|bet|coin|jackpot|shame/i.test(result.message));
    if (result.won) solved = true;
    guard += 1;
  }
  assert.ok(solved, 'hint path should finish a scout game');
  var hint = PQSolitaire.hintMessage(champ);
  assert.ok(!/wager|bet|coin|jackpot/i.test(hint));
  assert.ok(/town/i.test(PQSolitaire.exitMessage()));
  var state = PQStorage.defaultState();
  state.world.places = ['parlor'];
  var first = PQSolitaire.openGame(state, lcg(1), '2026-11-05');
  var second = PQSolitaire.openGame(state, lcg(1), '2026-11-05');
  var third = PQSolitaire.openGame(state, lcg(1), '2026-11-05');
  var rested = PQSolitaire.openGame(state, lcg(1), '2026-11-05');
  assert.ok(first.ok && second.ok && third.ok);
  assert.strictEqual(rested.resting, true);
  assert.strictEqual(rested.game, null);
  assert.ok(/town/i.test(rested.message));
  assert.ok(!/wager|bet|coin|streak/i.test(rested.message));
});

test('schema version stays 1 while placements survive a reload', function () {
  assert.strictEqual(PQStorage.SCHEMA_VERSION, 1);
  var mem = {};
  var raw = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    setItem: function (k, v) { mem[k] = String(v); },
    removeItem: function (k) { delete mem[k]; }
  };
  var s = PQStorage.createStore(raw);
  var state = s.defaultState();
  state.onboardingDone = true;
  state.petId = 'puppy';
  state.petName = 'Pip';
  state.courses.grade = 3;
  state.courses.rank = 'ranger';
  PQWorld.grantNextUnlock(state);
  PQWorld.placeItem(state, 'pet', 'pet-bowl');
  assert.strictEqual(s.save(state), true);
  var loaded = s.load();
  assert.strictEqual(loaded.version, 1);
  assert.strictEqual(loaded.petName, 'Pip');
  assert.strictEqual(loaded.courses.rank, 'ranger');
  assert.strictEqual(loaded.courses.grade, 3);
  assert.strictEqual(loaded.world.placements.pet[0].itemId, 'pet-bowl');
  assert.strictEqual(PQWorld.visiblePlaces(loaded).length, 1);
});

test('schema stays 1 and a current main save keeps pet, rank, places, and placements', function () {
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
    growthPoints: 25,
    courses: {
      parts: { warmup: true, reading: true, multiply: true },
      tables: [2, 5, 10],
      grade: 2,
      rank: 'explorer'
    },
    world: {
      unlocks: ['pet-bowl', 'library-seat'],
      places: ['library', 'garden'],
      prizes: [{ id: 'pet-sticker', name: 'a paw-print sticker', kind: 'sticker' }],
      placements: { pet: [{ itemId: 'pet-bowl', slot: 1 }] },
      questsFinished: 3
    }
  });
  var loaded = s.load();
  assert.strictEqual(loaded.version, 1);
  assert.strictEqual(loaded.petId, 'bunny');
  assert.strictEqual(loaded.petName, 'Clover');
  assert.strictEqual(loaded.courses.rank, 'explorer');
  assert.strictEqual(loaded.courses.grade, 2);
  assert.ok(loaded.world.places.indexOf('library') !== -1);
  assert.ok(loaded.world.places.indexOf('garden') !== -1);
  assert.strictEqual(loaded.world.placements.pet[0].itemId, 'pet-bowl');
  assert.strictEqual(loaded.world.prizes[0].name, 'a paw-print sticker');
  assert.strictEqual(loaded.bank.coins, 0);
  assert.strictEqual(loaded.courses.lessonFocus.multiplication, true);
  assert.strictEqual(PQWorld.isPlaceOpen(loaded, 'train'), false);
});

test('bank never goes negative and mistakes never remove coins', function () {
  var state = PQStorage.defaultState();
  PQBank.addCoins(state, 10);
  assert.strictEqual(PQBank.getCoins(state), 10);
  PQBank.addCoins(state, 0);
  PQBank.addCoins(state, -4);
  assert.strictEqual(PQBank.getCoins(state), 10);
  var task = { type: 'mul', a: 7, b: 8, prompt: '7 × 8', answer: 56, missCount: 0 };
  var miss = PQMath.processMathAttempt(task, '50');
  assert.strictEqual(miss.correct, false);
  PQBank.noteMistake(state);
  assert.strictEqual(PQBank.getCoins(state), 10);
  assert.strictEqual(PQBank.spendCoins(state, 11), false);
  assert.strictEqual(PQBank.getCoins(state), 10);
  assert.strictEqual(PQBank.spendCoins(state, 4), true);
  assert.strictEqual(PQBank.getCoins(state), 6);
  assert.ok(PQBank.getCoins(state) >= 0);
});

test('shop purchases need the right amount and scale by rank', function () {
  var state = PQStorage.defaultState();
  state.world.places = ['store'];
  state.world.unlocks = [];
  PQBank.addCoins(state, 30);
  var item = PQShop.catalog(state)[0];
  assert.ok(item && item.price > 0);
  var scout = PQShop.problemFor(item, 1, lcg(2));
  var champ = PQShop.problemFor(item, 5, lcg(2));
  assert.strictEqual(scout.mode, 'coins');
  assert.deepStrictEqual(scout.coins, [1, 5]);
  assert.strictEqual(scout.pictures, true);
  assert.strictEqual(champ.mode, 'change');
  assert.ok(champ.rankScore > scout.rankScore);
  assert.ok(champ.answer !== scout.price || champ.paid > scout.price);
  var wrong = PQShop.buy(state, item.id, { problem: scout, coins: [1] }, 1);
  assert.strictEqual(wrong.ok, false);
  assert.strictEqual(wrong.spent, 0);
  assert.strictEqual(PQBank.getCoins(state), 30);
  assert.strictEqual(PQWorld.hasUnlock(state, item.id), false);
  var coins = [];
  var left = scout.price;
  while (left >= 5) { coins.push(5); left -= 5; }
  while (left >= 1) { coins.push(1); left -= 1; }
  var right = PQShop.buy(state, item.id, { problem: scout, coins: coins }, 1);
  assert.strictEqual(right.ok, true);
  assert.strictEqual(PQBank.getCoins(state), 30 - item.price);
  assert.strictEqual(PQWorld.hasUnlock(state, item.id), true);
  var ranger = PQShop.problemFor(item, 3, lcg(4));
  assert.strictEqual(ranger.mode, 'howmany');
  assert.strictEqual(ranger.answer, ranger.unit * ranger.qty);
  assert.ok(ranger.rankScore > scout.rankScore && ranger.rankScore < champ.rankScore);
});

test('baking recipes are correct and champion scales harder than scout', function () {
  var scout = PQGames.bakeSpec(1, lcg(1));
  var champ = PQGames.bakeSpec(5, lcg(1));
  assert.ok(champ.rankScore > scout.rankScore);
  assert.strictEqual(champ.fraction, true);
  assert.strictEqual(scout.fraction, false);
  assert.ok(champ.hardest >= scout.hardest);
  var picks = {};
  scout.needs.forEach(function (need) { picks[need.id] = need.need; });
  assert.strictEqual(PQGames.checkBake(scout, picks).ok, true);
  picks.flour = picks.flour + 1;
  var miss = PQGames.checkBake(scout, picks);
  assert.strictEqual(miss.ok, false);
  assert.ok(miss.hint && miss.hint.length > 0);
  var round = PQGames.roundFor('bakery', 3, lcg(3));
  assert.strictEqual(round.spec.scale, 2);
  assert.ok(round.steps.length >= 3);
  assert.ok(round.steps[0].answer > PQGames.bakeSpec(1, lcg(9)).needs[0].need);
});

test('item play surprises are capped and only valid earned items', function () {
  var state = PQStorage.defaultState();
  state.petId = 'puppy';
  PQBank.addCoins(state, 5);
  var ids = {};
  PQWorld.allItems().forEach(function (item) { ids[item.id] = item; });
  var first = PQWorld.tryPlaySurprise(state, '2026-11-05', function () { return 0; });
  var second = PQWorld.tryPlaySurprise(state, '2026-11-05', function () { return 0; });
  var third = PQWorld.tryPlaySurprise(state, '2026-11-05', function () { return 0; });
  assert.strictEqual(third.capped, true);
  assert.strictEqual(third.item, null);
  [first, second].forEach(function (drop) {
    assert.ok(drop.item, 'expected a drop');
    assert.ok(ids[drop.item.id], drop.item.id);
    assert.ok(!drop.item.shop);
    if (drop.item.fromPlace) assert.strictEqual(PQWorld.isPlaceOpen(state, drop.item.fromPlace), true);
    assert.ok(PQWorld.hasUnlock(state, drop.item.id));
  });
  assert.strictEqual(PQBank.getCoins(state), 5);
  var fresh = PQStorage.defaultState();
  fresh.world.places = ['library'];
  var closed = PQWorld.tryPlaySurprise(fresh, '2026-11-06', function () { return 0; });
  assert.ok(closed.item);
  assert.ok(!closed.item.fromPlace || PQWorld.isPlaceOpen(fresh, closed.item.fromPlace));
  assert.notStrictEqual(closed.item.fromPlace, 'train');
});

test('new locations stay hidden until they are earned', function () {
  var state = PQStorage.defaultState();
  var hidden = ['store', 'toystore', 'bookstore', 'aquarium', 'art', 'music', 'beach', 'camp', 'train'];
  hidden.forEach(function (id) {
    assert.strictEqual(PQWorld.isPlaceOpen(state, id), false, id);
    assert.ok(PQWorld.mapLabel(state, 'Maple').indexOf(PQWorld.getHouse(id).title) === -1, id);
    assert.strictEqual(PQGames.forPlace(state, id), null, id);
  });
  PQWorld.noteQuestFinished(state, '2026-11-05');
  assert.strictEqual(PQWorld.isPlaceOpen(state, 'store'), true);
  assert.strictEqual(PQWorld.isPlaceOpen(state, 'train'), false);
  assert.strictEqual(PQGames.forPlace(state, 'train'), null);
  state.world.questsFinished = 30;
  state.world.activitiesDone = 30;
  PQWorld.checkPlaceUnlocks(state);
  hidden.forEach(function (id) {
    assert.strictEqual(PQWorld.isPlaceOpen(state, id), true, id);
    if (id !== 'store') assert.ok(PQGames.forPlace(state, id), id);
    assert.ok(PQWorld.renderRoomSvg(id, state).indexOf('<svg') !== -1);
  });
});

test('lesson focus changes the daily quest and keeps it one short session', function () {
  var state = PQStorage.defaultState();
  state.petName = 'Maple';
  state.courses.lessonFocus = {
    addition: true,
    subtraction: false,
    multiplication: false,
    reading: false
  };
  var addOnly = PQQuest.generateDailyQuest(state, lcg(3), { now: new Date(2026, 10, 3, 12, 0, 0) });
  assert.ok(addOnly.tasks.length >= 12 && addOnly.tasks.length <= 18);
  addOnly.tasks.forEach(function (task) {
    assert.strictEqual(task.type, 'add');
  });
  state.courses.lessonFocus = {
    addition: false,
    subtraction: true,
    multiplication: false,
    reading: true
  };
  var mix = PQQuest.generateDailyQuest(state, lcg(4), { now: new Date(2026, 10, 4, 12, 0, 0) });
  var summary = PQQuest.questMixSummary(mix.tasks);
  assert.ok(summary.sub >= 1);
  assert.strictEqual(summary.add, 0);
  assert.strictEqual(summary.mul, 0);
  assert.ok(summary['reading-pass'] >= 1);
  assert.ok(mix.tasks.length >= 8 && mix.tasks.length <= 20);
  var described = PQQuest.describeToday(mix.plan);
  assert.ok(/subtraction/i.test(described.partsLine));
  assert.ok(!/times tables/i.test(described.partsLine + described.tablesLine));
});

test('champion questions are harder than scout across math, reading, and shop', function () {
  var scoutOps = 0;
  var champOps = 0;
  var i;
  for (i = 0; i < 40; i++) {
    var easy = PQMath.makeAddSubTask(lcg(20 + i), 'w', { grade: 1, op: 'add' });
    var hard = PQMath.makeAddSubTask(lcg(80 + i), 'w', { grade: 5, op: 'add' });
    scoutOps = Math.max(scoutOps, easy.a, easy.b);
    champOps = Math.max(champOps, hard.a, hard.b);
    assert.ok(easy.a <= 9 && easy.b <= 9);
  }
  assert.ok(scoutOps <= 9);
  assert.ok(champOps > scoutOps);
  assert.ok(PQMath.factorBounds(7, { grade: 5 }).max > PQMath.factorBounds(7, { grade: 1 }).max);
  var scoutRead = PQReading.pickPassage([], lcg(2), { grade: 1 });
  var champRead = PQReading.pickPassage([], lcg(9), { grade: 5 });
  assert.ok(wordCount(champRead.text) > wordCount(scoutRead.text));
  assert.ok(champRead.text.indexOf('\n\n') !== -1);
  assert.ok(scoutRead.words && scoutRead.words.length >= 1);
  var sawInference = false;
  PQReading.PASSAGES.forEach(function (passage) {
    if (passage.level !== 3) return;
    (passage.questions || []).forEach(function (q) {
      if (q.skill === 'inference' || q.skill === 'main') sawInference = true;
    });
  });
  assert.strictEqual(sawInference, true);
  var shopItem = PQWorld.SHOP_ITEMS[0];
  var scoutShop = PQShop.problemFor(shopItem, 1, lcg(1));
  var champShop = PQShop.problemFor(shopItem, 5, lcg(1));
  assert.ok(champShop.rankScore > scoutShop.rankScore);
  var scoutGarden = PQGames.roundFor('garden', 1, lcg(5));
  var champGarden = PQGames.roundFor('garden', 5, lcg(5));
  assert.ok(champGarden.hardest > scoutGarden.hardest);
  var scoutPond = PQGames.roundFor('pond', 1, lcg(6));
  var champPond = PQGames.roundFor('pond', 5, lcg(6));
  assert.ok(champPond.hardest > scoutPond.hardest);
});

test('no gambling paths in the bank, shop, or place games', function () {
  ['bank.js', 'shop.js', 'games.js', 'days.js', 'world.js', 'boards.js'].forEach(function (file) {
    var src = fs.readFileSync(path.join(root, file), 'utf8');
    assert.ok(!/wager|jackpot|losing streak|paid spin|\bbet\b/i.test(src), file);
  });
  var state = PQStorage.defaultState();
  PQBank.addCoins(state, 8);
  var before = PQBank.getCoins(state);
  var skip = PQWorld.tryPlaySurprise(state, '2026-11-08', function () { return 0.99; });
  assert.strictEqual(skip.item, null);
  assert.strictEqual(PQBank.getCoins(state), before);
  var day = PQDays.openGift(state, '2026-11-08');
  assert.ok(day.coins > 0);
  assert.ok(PQBank.getCoins(state) > before);
  var again = PQDays.openGift(state, '2026-11-08');
  assert.strictEqual(again.already, true);
  assert.strictEqual(again.coins, 0);
  var cal = PQDays.calendar(state, '2026-11-02');
  assert.ok(!/shame|missed|broke|lost your/i.test(cal.note));
});

test('drag position saving keeps schema 1 and reloads', function () {
  assert.strictEqual(PQStorage.SCHEMA_VERSION, 1);
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
  state.world.unlocks = ['pet-bowl'];
  var placed = PQWorld.placeItem(state, 'pet', 'pet-bowl');
  assert.ok(placed);
  assert.ok(placed.x >= 10 && placed.x <= 90);
  assert.ok(placed.y >= 16 && placed.y <= 72);
  var moved = PQWorld.setItemPosition(state, 'pet', 'pet-bowl', 33, 47);
  assert.strictEqual(moved.x, 33);
  assert.strictEqual(moved.y, 47);
  assert.strictEqual(moved.itemId, 'pet-bowl');
  var clamped = PQWorld.setItemPosition(state, 'pet', 'pet-bowl', -20, 180);
  assert.strictEqual(clamped.x, 10);
  assert.strictEqual(clamped.y, 72);
  assert.strictEqual(s.save(state), true);
  var loaded = s.load();
  assert.strictEqual(loaded.version, 1);
  assert.strictEqual(loaded.petId, 'bunny');
  assert.strictEqual(loaded.world.placements.pet[0].itemId, 'pet-bowl');
  assert.strictEqual(loaded.world.placements.pet[0].x, 10);
  assert.strictEqual(loaded.world.placements.pet[0].y, 72);
  assert.strictEqual(PQWorld.returnItem(loaded, 'pet', 'pet-bowl'), true);
  assert.strictEqual(PQWorld.placementsFor(loaded, 'pet').length, 0);
  assert.strictEqual(PQWorld.setItemPosition(state, 'pet', 'zoo-leaf', 40, 40), null);
});

test('selection wheel shows only unlocked items, grouped with counts', function () {
  var state = PQStorage.defaultState();
  assert.deepStrictEqual(PQWorld.wheelGroups(state), []);
  assert.strictEqual(PQWorld.wheelText(state), '');
  PQWorld.grantNextUnlock(state);
  var groups = PQWorld.wheelGroups(state);
  assert.ok(groups.length >= 1);
  var seen = [];
  groups.forEach(function (group) {
    assert.strictEqual(group.count, group.items.length);
    assert.ok(group.count > 0);
    group.items.forEach(function (item) {
      seen.push(item.id);
      assert.strictEqual(PQWorld.hasUnlock(state, item.id), true);
    });
  });
  assert.ok(seen.indexOf('pet-bowl') !== -1);
  assert.strictEqual(seen.indexOf('library-seat'), -1);
  assert.strictEqual(seen.indexOf('zoo-leaf'), -1);
  var text = PQWorld.wheelText(state);
  assert.ok(text.indexOf('a food bowl') !== -1);
  assert.ok(/Cozy|Home|Lights|Plants|Toys|Pictures/.test(text));
  PQWorld.allItems().forEach(function (item) {
    if (PQWorld.hasUnlock(state, item.id)) return;
    assert.strictEqual(text.indexOf(item.name), -1, item.name);
  });
});

test('building fronts are distinct and motion can be turned off', function () {
  var ids = ['pet', 'library', 'school', 'bakery', 'firehouse', 'aquarium', 'zoo', 'parlor', 'store', 'beach', 'farm', 'market'];
  var seen = {};
  ids.forEach(function (id) {
    var svg = PQWorld.renderHouseFront(id);
    assert.ok(svg.indexOf('<svg') !== -1, id);
    assert.ok(!seen[svg], 'front reused for ' + id);
    seen[svg] = true;
    assert.ok(/idle-smoke|idle-flag|idle-spark|idle-glow|idle-bubble|idle-wave/.test(svg), id);
  });
  var roomA = PQWorld.renderRoomSvg('library', PQStorage.defaultState());
  var roomB = PQWorld.renderRoomSvg('bakery', PQStorage.defaultState());
  assert.notStrictEqual(roomA, roomB);
  assert.ok(/idle-/.test(roomA) && /idle-/.test(roomB));
  var css = fs.readFileSync(path.join(__dirname, '..', 'css', 'styles.css'), 'utf8');
  assert.ok(/prefers-reduced-motion/.test(css));
  assert.ok(/idle-smoke/.test(css));
  assert.ok(/touch-action:\s*none/.test(css));
});

function boardState(grade, focus) {
  var state = PQStorage.defaultState();
  state.petName = 'Clover';
  state.courses.grade = grade;
  state.courses.rank = PQStorage.rankFromGrade(grade);
  state.courses.lessonFocus = focus || {
    addition: false,
    subtraction: false,
    multiplication: true,
    reading: false
  };
  return state;
}

test('four in a row rules, gentle retry, and rank-scaled play', function () {
  var easy = PQBoards.aiSkill(1);
  var hard = PQBoards.aiSkill(5);
  assert.ok(easy.takeWin < hard.takeWin);
  assert.ok(easy.block < PQBoards.aiSkill(3).block);
  assert.ok(hard.noise > 0);
  var board = PQBoards.makeBoard();
  PQBoards.dropOn(board, 1, 2);
  PQBoards.dropOn(board, 2, 2);
  PQBoards.dropOn(board, 3, 2);
  var scoutCol = PQBoards.aiChoose(board, 1, scripted([0.9, 0, 0, 0.2]));
  var champCol = PQBoards.aiChoose(board, 5, scripted([0.9, 0, 0, 0.2]));
  assert.notStrictEqual(scoutCol, 0);
  assert.strictEqual(champCol, 0);
  assert.strictEqual(PQBoards.aiChoose(board, 1, scripted([0.1, 0, 0, 0])), 0);
  var line = PQBoards.makeBoard();
  PQBoards.dropOn(line, 0, 1);
  PQBoards.dropOn(line, 0, 1);
  PQBoards.dropOn(line, 0, 1);
  assert.strictEqual(PQBoards.winnerOf(line), null);
  PQBoards.dropOn(line, 0, 1);
  assert.strictEqual(PQBoards.winnerOf(line), 1);

  var state = boardState(1);
  var game = PQBoards.create('four', state, lcg(3));
  assert.strictEqual(game.prompt.type, 'mul');
  assert.ok(game.prompt.b <= 5);
  var before = JSON.stringify(game.board);
  var miss = PQBoards.answer(game, '0', lcg(1), state);
  assert.strictEqual(miss.ok, false);
  assert.ok(miss.hint && miss.hint.length > 0);
  assert.ok(!/wrong|fail|lose|shame/i.test(miss.message + miss.hint));
  assert.strictEqual(JSON.stringify(game.board), before);
  assert.strictEqual(game.armed, false);
  var yes = PQBoards.answer(game, String(game.prompt.answer), lcg(1), state);
  assert.strictEqual(yes.ok, true);
  assert.strictEqual(game.armed, true);
  var early = PQBoards.dropFour(game, 3, lcg(4), state);
  assert.strictEqual(early.ok, true);
  assert.strictEqual(game.board[5][3], 1);
  var blocked = PQBoards.dropFour(game, 3, lcg(4), state);
  assert.strictEqual(blocked.ok, false);
  assert.ok(/answer first/i.test(blocked.hint));

  var scoutMax = 0;
  var champMax = 0;
  var i;
  for (i = 0; i < 25; i++) {
    var scout = PQBoards.create('four', boardState(1), lcg(10 + i));
    var champ = PQBoards.create('four', boardState(5), lcg(40 + i));
    scoutMax = Math.max(scoutMax, scout.prompt.answer);
    champMax = Math.max(champMax, champ.prompt.answer);
    assert.ok([1, 2, 5, 10].indexOf(scout.prompt.a) !== -1);
    assert.ok(scout.prompt.b <= 5);
  }
  assert.ok(champMax > scoutMax);

  var weak = boardState(5);
  weak.courses.tables = [7];
  weak.factStats = {
    '2×7': { attempts: 8, correct: 8 },
    '4×7': { attempts: 8, correct: 1 }
  };
  weak.tableStats = { '7': { attempts: 8, correct: 2 } };
  var twos = 0;
  var fours = 0;
  for (i = 0; i < 80; i++) {
    var fact = PQBoards.makePrompt(weak, lcg(100 + i), false);
    if (fact.b === 2) twos += 1;
    if (fact.b === 4) fours += 1;
  }
  assert.ok(fours > twos, 'fours ' + fours + ' twos ' + twos);

  var addOnly = boardState(2, {
    addition: true,
    subtraction: false,
    multiplication: false,
    reading: false
  });
  var added = PQBoards.create('four', addOnly, lcg(2));
  assert.strictEqual(added.prompt.type, 'add');
  var counts = { mul: 0, add: 0, sub: 0, read: 0 };
  var mix = {
    addition: true,
    subtraction: true,
    multiplication: true,
    reading: true
  };
  for (i = 0; i < 200; i++) {
    var kind = PQBoards.pickKind(mix, lcg(i + 3), false);
    counts[kind] += 1;
  }
  assert.ok(counts.mul > counts.add);
  assert.ok(counts.mul > counts.sub);
  assert.strictEqual(counts.read, 0);
});

test('pet race home moves by the answer, bumps kindly, and she finishes', function () {
  assert.strictEqual(PQBoards.stepsFromAnswer(12, 12), 2);
  assert.strictEqual(PQBoards.stepsFromAnswer(3 * 4, 12), 2);
  assert.strictEqual(PQBoards.stepsFromAnswer(10, 12), 5);
  assert.strictEqual(PQBoards.stepsFromAnswer(0, 12), 1);
  assert.strictEqual(PQBoards.petStep(1, scripted([0.99])), 1);
  assert.ok(PQBoards.petStep(5, scripted([0.9])) >= 1);
  var state = boardState(2, {
    addition: true,
    subtraction: false,
    multiplication: true,
    reading: true
  });
  var game = PQBoards.create('race', state, lcg(5));
  var start = game.pawns.kid;
  var miss = PQBoards.answer(game, 'nope', lcg(1), state);
  assert.strictEqual(miss.ok, false);
  assert.ok(miss.hint);
  assert.strictEqual(game.pawns.kid, start);
  assert.ok(!/wrong|fail|lose|shame|wager|bet/i.test(miss.message + ' ' + miss.hint));
  game.pawns.kid = 3;
  game.pawns.pet = 5;
  game.prompt = { type: 'mul', prompt: '1 × 2', answer: 2, a: 1, b: 2, task: { type: 'mul', a: 1, b: 2, answer: 2 } };
  var bumped = PQBoards.answer(game, '2', scripted([0.1]), state);
  assert.strictEqual(bumped.ok, true);
  assert.ok(/den for a nap/i.test(bumped.message));
  assert.strictEqual(game.pawns.pet, null);
  assert.ok(!/shame|wrong|fail/i.test(bumped.message));

  var near = PQBoards.create('race', state, lcg(6));
  near.pawns.pet = near.home - 1;
  near.pawns.kid = 0;
  near.kidMoves = 0;
  near.prompt = { type: 'mul', prompt: '2 × 2', answer: 4, a: 2, b: 2, task: { type: 'mul', a: 2, b: 2, answer: 4 } };
  var petHome = PQBoards.answer(near, '4', scripted([0.1]), state);
  assert.strictEqual(petHome.done, false);
  assert.notStrictEqual(near.finished, true);

  var escort = PQBoards.create('race', state, lcg(7));
  escort.kidMoves = 13;
  escort.pawns.kid = 2;
  escort.pawns.pet = null;
  escort.prompt = { type: 'mul', prompt: '2 × 2', answer: 4, a: 2, b: 2, task: { type: 'mul', a: 2, b: 2, answer: 4 } };
  var done = PQBoards.answer(escort, '4', scripted([0.2]), state);
  assert.strictEqual(done.done, true);
  assert.strictEqual(escort.winner, 'kid');
  assert.strictEqual(escort.pawns.kid, escort.home);
  assert.ok(/home/i.test(done.message));
  assert.ok(!/shame|wrong|fail|wager|bet/i.test(done.message));

  var easyWords = 0;
  var richWords = 0;
  PQBoards.readBank(1).forEach(function (row) { easyWords += row.q.split(/\s+/).length; });
  PQBoards.readBank(5).forEach(function (row) { richWords += row.q.split(/\s+/).length; });
  assert.ok(richWords / PQBoards.readBank(5).length > easyWords / PQBoards.readBank(1).length);
  var readCounts = { mul: 0, add: 0, sub: 0, read: 0 };
  var i;
  for (i = 0; i < 240; i++) {
    readCounts[PQBoards.pickKind({
      addition: true,
      subtraction: true,
      multiplication: true,
      reading: true
    }, lcg(i + 9), true)] += 1;
  }
  assert.ok(readCounts.read > 0);
  assert.ok(readCounts.mul > readCounts.read);
});

test('bingo, word match, and array builder scale with rank and stay kind', function () {
  var fresh = PQStorage.defaultState();
  assert.deepStrictEqual(PQBoards.forPlace(fresh, 'school'), []);
  assert.deepStrictEqual(PQBoards.forPlace(fresh, 'parlor'), []);
  assert.deepStrictEqual(PQBoards.forPlace(fresh, 'library'), []);
  fresh.world.places = ['school', 'library'];
  var schoolIds = PQBoards.forPlace(fresh, 'school').map(function (meta) { return meta.id; });
  assert.ok(schoolIds.indexOf('four') !== -1);
  assert.ok(schoolIds.indexOf('bingo') !== -1);
  assert.ok(schoolIds.indexOf('array') !== -1);
  assert.strictEqual(PQBoards.forPlace(fresh, 'parlor').length, 0);
  assert.strictEqual(PQBoards.forPlace(fresh, 'library')[0].id, 'memory');
  var listed = JSON.stringify(PQBoards.forPlace(fresh, 'school'));
  assert.ok(listed.indexOf('locked') === -1);

  var scoutBingo = PQBoards.create('bingo', boardState(1), lcg(4));
  var champBingo = PQBoards.create('bingo', boardState(5), lcg(4));
  scoutBingo.cells.forEach(function (cell) {
    if (cell.free) return;
    assert.ok([1, 2, 5, 10].indexOf(cell.a) !== -1, 'table ' + cell.a);
    assert.ok(cell.b <= 5);
  });
  assert.ok(champBingo.hardest > scoutBingo.hardest);
  var open = -1;
  var c;
  for (c = 0; c < scoutBingo.cells.length; c++) {
    if (!scoutBingo.cells[c].free && scoutBingo.cells[c].answer === scoutBingo.prompt.answer) open = c;
  }
  assert.ok(open >= 0);
  var wrongCell = open === 0 ? 1 : 0;
  if (scoutBingo.cells[wrongCell].free || scoutBingo.cells[wrongCell].answer === scoutBingo.prompt.answer) {
    wrongCell = 3;
  }
  var miss = PQBoards.tapBingo(scoutBingo, wrongCell, lcg(1), boardState(1));
  assert.strictEqual(miss.ok, false);
  assert.ok(miss.hint);
  assert.strictEqual(scoutBingo.cells[wrongCell].marked, false);
  assert.ok(!/wrong|fail|lose|shame/i.test(miss.message + miss.hint));
  var marked = PQBoards.tapBingo(scoutBingo, open, lcg(2), boardState(1));
  assert.strictEqual(marked.ok, true);
  assert.strictEqual(scoutBingo.cells[open].marked, true);
  scoutBingo.cells.forEach(function (cell) { cell.marked = true; });
  scoutBingo.cells[0].marked = false;
  scoutBingo.cells[0].free = false;
  scoutBingo.prompt = { type: 'mul', prompt: '2 × 2', answer: scoutBingo.cells[0].answer, a: 2, b: 2, task: { type: 'mul', a: 2, b: 2, answer: scoutBingo.cells[0].answer } };
  var line = PQBoards.tapBingo(scoutBingo, 0, lcg(1), boardState(1));
  assert.strictEqual(line.done, true);
  assert.ok(PQBoards.bingoLines(scoutBingo.cells) >= 1);

  var scoutMem = PQBoards.create('memory', boardState(1), lcg(1));
  var champMem = PQBoards.create('memory', boardState(5), lcg(1));
  assert.strictEqual(scoutMem.cards.length, 6);
  assert.strictEqual(champMem.cards.length, 12);
  assert.ok(champMem.pairs > scoutMem.pairs);
  var first = 0;
  var second = 1;
  while (second < scoutMem.cards.length && scoutMem.cards[second].pair === scoutMem.cards[first].pair) second += 1;
  var flip = PQBoards.flipMemory(scoutMem, first);
  assert.strictEqual(flip.ok, true);
  var missPair = PQBoards.flipMemory(scoutMem, second);
  assert.strictEqual(missPair.matched, false);
  assert.strictEqual(missPair.needsContinue, true);
  assert.ok(!/wrong|fail|lose|shame/i.test(missPair.message + missPair.hint));
  PQBoards.memoryContinue(scoutMem);
  assert.strictEqual(scoutMem.cards[first].up, false);
  var pairIndex = -1;
  for (c = 0; c < scoutMem.cards.length; c++) {
    if (c !== first && scoutMem.cards[c].pair === scoutMem.cards[first].pair) pairIndex = c;
  }
  PQBoards.flipMemory(scoutMem, first);
  var matched = PQBoards.flipMemory(scoutMem, pairIndex);
  assert.strictEqual(matched.matched, true);
  assert.strictEqual(scoutMem.cards[first].matched, true);

  var scoutArray = PQBoards.create('array', boardState(1), scripted([0]));
  var champArray = PQBoards.create('array', boardState(5), scripted([0]));
  assert.ok(champArray.hardest > scoutArray.hardest);
  assert.strictEqual(scoutArray.rows * scoutArray.cols, scoutArray.hardest);
  var early = PQBoards.arrayAct(scoutArray, 'check');
  assert.strictEqual(early.ok, false);
  assert.ok(early.hint);
  assert.deepStrictEqual(scoutArray.built, []);
  assert.ok(!/wrong|fail|lose|shame/i.test(early.message + early.hint));
  var dots;
  var row;
  for (row = 0; row < scoutArray.rows; row++) {
    if (row > 0) {
      var next = PQBoards.arrayAct(scoutArray, 'row');
      assert.strictEqual(next.ok, true);
    }
    for (dots = 0; dots < scoutArray.cols; dots++) {
      assert.strictEqual(PQBoards.arrayAct(scoutArray, 'dot').ok, true);
    }
  }
  var built = scoutArray.built.slice();
  var back = PQBoards.arrayAct(scoutArray, 'back');
  assert.strictEqual(back.ok, true);
  assert.ok(scoutArray.built[scoutArray.built.length - 1] >= built[built.length - 1] - 1);
  PQBoards.arrayAct(scoutArray, 'dot');
  var good = PQBoards.arrayAct(scoutArray, 'check');
  assert.strictEqual(good.ok, true);
  assert.strictEqual(good.done, true);

  var win = PQBoards.reward(true);
  var played = PQBoards.reward(false);
  assert.ok(win.coins > 0 && played.coins > 0);
  assert.ok(win.coins >= played.coins);
  assert.strictEqual(win.mayDecor, true);
  assert.strictEqual(played.mayDecor, false);
  assert.ok(!/wager|bet|jackpot|shame|lose/i.test(win.message + played.message));
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
