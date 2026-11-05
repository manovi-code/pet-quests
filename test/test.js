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

test('growth stages advance with quest points', function () {
  assert.strictEqual(PQQuest.stageFromPoints(0), 0);
  assert.strictEqual(PQQuest.stageFromPoints(10), 1);
  assert.strictEqual(PQQuest.stageFromPoints(25), 2);
  assert.strictEqual(PQQuest.stageFromPoints(50), 3);
  assert.strictEqual(PQQuest.stageFromPoints(80), 4);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
