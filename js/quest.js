/**
 * Pet Quests — daily quest generation.
 * Selected parts run in this order: warmup → one reading passage → times tables.
 * Times tables follow a Monday–Sunday plan so each chosen table shows up,
 * with easier tables earlier in the week.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      typeof require !== 'undefined' ? require('./math.js') : root.PQMath,
      typeof require !== 'undefined' ? require('./reading.js') : root.PQReading,
      typeof require !== 'undefined' ? require('./storage.js') : root.PQStorage
    );
  } else {
    root.PQQuest = factory(root.PQMath, root.PQReading, root.PQStorage);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (PQMath, PQReading, PQStorage) {
  'use strict';

  var DEFAULTS = {
    warmupCount: 3,
    mulCount: 12,
    weeklyGoalDays: 5
  };

  var PART_IDS = ['warmup', 'reading', 'multiply'];

  function normalizeCourses(state) {
    var base = PQStorage.defaultState().courses;
    var incoming = state.courses;
    if (!incoming || typeof incoming !== 'object') {
      state.courses = {
        parts: {
          warmup: true,
          reading: true,
          multiply: true
        },
        tables: base.tables.slice()
      };
      return state.courses;
    }

    var p = incoming.parts || {};
    var parts = {
      warmup: p.warmup !== false,
      reading: p.reading !== false,
      multiply: p.multiply !== false
    };
    if (!parts.warmup && !parts.reading && !parts.multiply) {
      parts = { warmup: true, reading: true, multiply: true };
    }

    var tables = [];
    var raw = Array.isArray(incoming.tables) ? incoming.tables : base.tables;
    var i, n;
    for (i = 0; i < raw.length; i++) {
      n = parseInt(raw[i], 10);
      if (n >= 1 && n <= 12 && tables.indexOf(n) === -1) tables.push(n);
    }
    if (!tables.length) tables = base.tables.slice();
    tables.sort(function (a, b) { return a - b; });

    var grade = parseInt(incoming.grade, 10);
    var fromRank = PQStorage.gradeFromRank ? PQStorage.gradeFromRank(incoming.rank) : 0;
    if (!(grade >= 1 && grade <= 5)) grade = fromRank || 2;
    var rank = PQStorage.rankFromGrade ? PQStorage.rankFromGrade(grade) : 'explorer';

    var focusIn = incoming.lessonFocus;
    var lessonFocus = {
      addition: !focusIn || focusIn.addition !== false,
      subtraction: !focusIn || focusIn.subtraction !== false,
      multiplication: !focusIn || focusIn.multiplication !== false,
      reading: !focusIn || focusIn.reading !== false
    };
    if (!lessonFocus.addition && !lessonFocus.subtraction && !lessonFocus.multiplication && !lessonFocus.reading) {
      lessonFocus = { addition: true, subtraction: true, multiplication: true, reading: true };
    }

    var gradeMarked = {};
    var markedIn = incoming.gradeMarked;
    if (markedIn && typeof markedIn === 'object' && !Array.isArray(markedIn)) {
      var key;
      for (key in markedIn) {
        if (!Object.prototype.hasOwnProperty.call(markedIn, key)) continue;
        var mv = parseInt(markedIn[key], 10);
        var mk = parseInt(key, 10);
        if (mk >= 1 && mk <= 12 && mv >= 0) gradeMarked[String(mk)] = mv;
      }
    }

    state.courses = {
      parts: parts,
      tables: tables,
      grade: grade,
      rank: rank,
      gradeMarked: gradeMarked,
      lessonFocus: lessonFocus
    };
    return state.courses;
  }

  /** Selected tables that this grade actually practices. */
  function inPlayTables(selected, grade) {
    var allowed = PQMath.tablesForGrade(grade);
    var allow = {};
    var i;
    for (i = 0; i < allowed.length; i++) allow[allowed[i]] = true;
    var inPlay = [];
    var list = selected || [];
    for (i = 0; i < list.length; i++) {
      var n = parseInt(list[i], 10);
      if (allow[n] && inPlay.indexOf(n) === -1) inPlay.push(n);
    }
    if (!inPlay.length && list.length) {
      var ordered = PQMath.orderByEase(list);
      if (ordered.length) inPlay.push(ordered[0]);
    }
    return inPlay;
  }

  function sameCourses(plan, courses) {
    if (!plan || !plan.parts || !courses || !courses.parts) return false;
    var i;
    for (i = 0; i < PART_IDS.length; i++) {
      var id = PART_IDS[i];
      if (!!plan.parts[id] !== !!courses.parts[id]) return false;
    }
    var a = (plan.tables || []).slice().sort(function (x, y) { return x - y; });
    var b = (courses.tables || []).slice().sort(function (x, y) { return x - y; });
    if (a.length !== b.length) return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    var planGrade = parseInt(plan.grade, 10);
    var courseGrade = parseInt(courses.grade, 10);
    if (!(planGrade >= 1 && planGrade <= 5)) return false;
    if (planGrade !== courseGrade) return false;
    var pf = plan.lessonFocus || { addition: true, subtraction: true, multiplication: true, reading: true };
    var cf = courses.lessonFocus || { addition: true, subtraction: true, multiplication: true, reading: true };
    if (!!pf.addition !== !!cf.addition) return false;
    if (!!pf.subtraction !== !!cf.subtraction) return false;
    if (!!pf.multiplication !== !!cf.multiplication) return false;
    if (!!pf.reading !== !!cf.reading) return false;
    return true;
  }

  function questStarted(daily) {
    if (!daily) return false;
    if (daily.completed) return true;
    if ((daily.taskIndex || 0) > 0) return true;
    if (daily.answers && daily.answers.length > 0) return true;
    var tasks = daily.tasks || [];
    var i;
    for (i = 0; i < tasks.length; i++) {
      if (tasks[i] && (tasks[i].missCount || 0) > 0) return true;
    }
    return false;
  }

  function copyList(list) {
    return (list || []).slice();
  }

  function dayPlanSnapshot(courses, now) {
    now = now || new Date();
    var dayIndex = PQStorage.localDayIndex(now);
    var inPlay = inPlayTables(courses.tables, courses.grade);
    var week = PQMath.weeklyTablePlan(inPlay);
    var day = week[dayIndex] || { focus: [], review: [], introduced: [] };
    return {
      weekKey: PQStorage.localWeekKey(now),
      dayIndex: dayIndex,
      grade: courses.grade,
      parts: {
        warmup: !!courses.parts.warmup,
        reading: !!courses.parts.reading,
        multiply: !!courses.parts.multiply
      },
      tables: courses.tables.slice(),
      inPlay: inPlay.slice(),
      focus: copyList(day.focus),
      review: copyList(day.review),
      introduced: copyList(day.introduced),
      dayKey: PQStorage.localDateKey(now),
      lessonFocus: {
        addition: !!(courses.lessonFocus && courses.lessonFocus.addition),
        subtraction: !!(courses.lessonFocus && courses.lessonFocus.subtraction),
        multiplication: !!(courses.lessonFocus && courses.lessonFocus.multiplication),
        reading: !!(courses.lessonFocus && courses.lessonFocus.reading)
      }
    };
  }

  function activeSkills(courses, plan) {
    var focus = (plan && plan.lessonFocus) || courses.lessonFocus || {};
    return {
      addition: !!(courses.parts.warmup && focus.addition),
      subtraction: !!(courses.parts.warmup && focus.subtraction),
      reading: !!(courses.parts.reading && focus.reading),
      multiplication: !!(courses.parts.multiply && focus.multiplication)
    };
  }

  function poolFromPlan(plan) {
    var pool = copyList(plan.focus);
    var i;
    for (i = 0; i < (plan.review || []).length; i++) {
      if (pool.indexOf(plan.review[i]) === -1) pool.push(plan.review[i]);
    }
    return pool;
  }

  function pushMul(state, rng, tasks, missions, plan, courses, count) {
    if (!count) return;
    var mulTasks = PQMath.buildMulTasks(
      state.tableStats || {},
      state.factStats || {},
      rng,
      count,
      {
        pool: poolFromPlan(plan),
        focus: plan.focus,
        review: plan.review,
        introduced: plan.introduced,
        dayIndex: plan.dayIndex,
        grade: courses.grade,
        tableStats: state.tableStats || {},
        petName: state.petName,
        idPrefix: 'mul',
        state: state,
        dayKey: plan.dayKey || ''
      }
    );
    var i;
    for (i = 0; i < mulTasks.length; i++) tasks.push(mulTasks[i]);
    missions.push({ id: 'multiply', label: 'Times tables', count: mulTasks.length });
  }

  function pushReading(state, rng, opts, tasks, missions, courses, passes, passageIds) {
    var n;
    var used = (state.readingUsedIds || []).slice();
    for (n = 0; n < passes; n++) {
      var passage = n === 0 && opts.reusePassage && opts.reusePassage.id
        ? opts.reusePassage
        : PQReading.pickPassage(used, rng, { grade: courses.grade });
      if (!passage) continue;
      if (used.indexOf(passage.id) === -1) used.push(passage.id);
      if (passageIds.indexOf(passage.id) === -1) passageIds.push(passage.id);
      var readingTasks = PQReading.passageToTasks(passage);
      var i;
      for (i = 0; i < readingTasks.length; i++) tasks.push(readingTasks[i]);
      missions.push({ id: 'reading', label: 'Reading', count: readingTasks.length });
    }
  }

  /**
   * Build today's task list from the selected parts, lesson focus, and times tables.
   * A full focus keeps the usual warmup, one story, and a times-tables block.
   * A narrower focus fills the same short session with the chosen skills.
   */
  function generateDailyQuest(state, rng, opts) {
    rng = rng || Math.random;
    opts = opts || {};
    var courses = normalizeCourses(state);
    var now = opts.now || new Date();
    var plan = dayPlanSnapshot(courses, now);
    var tasks = [];
    var missions = [];
    var passageIds = [];
    var active = activeSkills(courses, plan);
    var full = active.addition && active.subtraction && active.reading && active.multiplication;
    var any = active.addition || active.subtraction || active.reading || active.multiplication;
    var i;

    if (!any || full) {
      if (courses.parts.warmup) {
        var warmupN = opts.warmupCount != null ? opts.warmupCount : DEFAULTS.warmupCount;
        var warmBatch = [];
        for (i = 0; i < warmupN; i++) {
          tasks.push(PQMath.makeAddSubTask(rng, 'warm-' + i, {
            grade: courses.grade,
            petName: state.petName,
            state: state,
            batch: warmBatch
          }));
        }
        missions.push({ id: 'warmup', label: 'Warmup', count: warmupN });
      }
      if (courses.parts.reading) {
        pushReading(state, rng, opts, tasks, missions, courses, 1, passageIds);
      }
      if (courses.parts.multiply) {
        var mulN = opts.mulCount != null ? opts.mulCount : DEFAULTS.mulCount;
        pushMul(state, rng, tasks, missions, plan, courses, mulN);
      }
    } else {
      var mathKinds = (active.addition ? 1 : 0) + (active.subtraction ? 1 : 0) + (active.multiplication ? 1 : 0);
      var passes = 0;
      if (active.reading) passes = mathKinds === 0 ? (courses.grade <= 2 ? 3 : 2) : 1;
      var mathSlots = 16 - (passes > 1 ? passes * 3 : (passes ? 4 : 0));
      if (mathSlots < 8 && mathKinds) mathSlots = 12;
      if (!mathKinds) mathSlots = 0;
      var counts = { addition: 0, subtraction: 0, multiplication: 0 };
      if (mathKinds === 1) {
        if (active.addition) counts.addition = Math.max(12, mathSlots);
        else if (active.subtraction) counts.subtraction = Math.max(12, mathSlots);
        else counts.multiplication = Math.max(12, mathSlots);
      } else if (active.multiplication) {
        counts.multiplication = Math.max(8, Math.ceil(mathSlots * 0.6));
        var rest = Math.max(0, mathSlots - counts.multiplication);
        var others = [];
        if (active.addition) others.push('addition');
        if (active.subtraction) others.push('subtraction');
        var each = others.length ? Math.floor(rest / others.length) : 0;
        var extra = others.length ? rest - each * others.length : 0;
        for (i = 0; i < others.length; i++) counts[others[i]] = each + (i < extra ? 1 : 0);
      } else {
        var plain = [];
        if (active.addition) plain.push('addition');
        if (active.subtraction) plain.push('subtraction');
        var share = plain.length ? Math.floor(mathSlots / plain.length) : 0;
        var leftover = plain.length ? mathSlots - share * plain.length : 0;
        for (i = 0; i < plain.length; i++) counts[plain[i]] = share + (i < leftover ? 1 : 0);
      }
      var warmCount = 0;
      var warmBatch = [];
      function addWarm(op, n) {
        var k;
        for (k = 0; k < n; k++) {
          tasks.push(PQMath.makeAddSubTask(rng, 'warm-' + warmCount, {
            grade: courses.grade,
            petName: state.petName,
            op: op,
            state: state,
            batch: warmBatch
          }));
          warmCount += 1;
        }
      }
      addWarm('add', counts.addition);
      addWarm('sub', counts.subtraction);
      if (warmCount) missions.push({ id: 'warmup', label: 'Warmup', count: warmCount });
      if (passes) pushReading(state, rng, opts, tasks, missions, courses, passes, passageIds);
      pushMul(state, rng, tasks, missions, plan, courses, counts.multiplication);
    }

    return {
      dateKey: PQStorage.localDateKey(now),
      passageId: passageIds.length ? passageIds[0] : null,
      passageIds: passageIds,
      tasks: tasks,
      missions: missions,
      plan: plan
    };
  }

  function questMixSummary(tasks) {
    var counts = { mul: 0, add: 0, sub: 0, 'reading-pass': 0, 'reading-q': 0, other: 0 };
    for (var i = 0; i < tasks.length; i++) {
      var t = tasks[i].type;
      if (counts[t] != null) counts[t] += 1;
      else counts.other += 1;
    }
    return counts;
  }

  function trackPassage(state, passageId) {
    if (PQReading.rememberRead) PQReading.rememberRead(state, passageId);
  }

  function untrackPassage(state, passageId) {
    if (!passageId || !state.readingUsedIds) return;
    var idx = state.readingUsedIds.lastIndexOf(passageId);
    if (idx !== -1) state.readingUsedIds.splice(idx, 1);
  }

  function installQuest(state, quest, replacePassageId) {
    state.daily = {
      dateKey: quest.dateKey,
      completed: false,
      taskIndex: 0,
      tasks: quest.tasks,
      answers: [],
      passageId: quest.passageId || null,
      missions: quest.missions,
      plan: quest.plan
    };
    var ids = quest.passageIds && quest.passageIds.length
      ? quest.passageIds.slice()
      : (quest.passageId ? [quest.passageId] : []);
    state.daily.passageIds = ids;
    if (replacePassageId && ids.indexOf(replacePassageId) === -1) {
      untrackPassage(state, replacePassageId);
    }
    var p;
    for (p = 0; p < ids.length; p++) trackPassage(state, ids[p]);
    return state;
  }

  /**
   * Keep today's quest once she has started it.
   * Before any answer, rebuild it so a settings change shows up today.
   */
  function ensureTodayQuest(state, rng, now) {
    now = now || new Date();
    var dk = PQStorage.localDateKey(now);
    PQStorage.ensureWeek(state, now);
    var courses = normalizeCourses(state);

    var existing = state.daily;
    var hasToday = !!(
      existing &&
      existing.dateKey === dk &&
      Array.isArray(existing.tasks) &&
      existing.tasks.length
    );

    if (hasToday && questStarted(existing)) return state;
    if (hasToday && sameCourses(existing.plan, courses)) return state;

    var reuse = null;
    if (hasToday && existing.passageId && courses.parts.reading) {
      reuse = PQReading.getPassageById(existing.passageId);
    }

    var quest = generateDailyQuest(state, rng, { now: now, reusePassage: reuse });
    return installQuest(state, quest, hasToday ? existing.passageId : null);
  }

  /**
   * Options for a newly made multiplication problem (extra practice).
   * Uses the current grade and the tables the parent left on.
   * An in-progress daily quest is not rewritten.
   */
  function mulOptionsForToday(state, now) {
    now = now || new Date();
    var courses = normalizeCourses(state);
    var plan = dayPlanSnapshot(courses, now);
    return {
      pool: poolFromPlan(plan),
      focus: plan.focus.slice(),
      review: plan.review.slice(),
      introduced: plan.introduced.slice(),
      dayIndex: plan.dayIndex,
      grade: courses.grade,
      tableStats: state.tableStats || {}
    };
  }

  /**
   * True when every table she is actually practicing at this grade looks solid.
   * Does not change the grade.
   */
  function gradeReadiness(state) {
    var courses = normalizeCourses(state);
    var grade = courses.grade;
    var next = grade < 5 ? grade + 1 : null;
    var tables = inPlayTables(courses.tables, grade);
    var info = { ready: false, grade: grade, next: next, tables: tables };
    if (!next || !tables.length) return info;
    var stats = state.tableStats || {};
    var marked = courses.gradeMarked || {};
    var i;
    for (i = 0; i < tables.length; i++) {
      var key = String(tables[i]);
      var s = stats[key];
      var need = 8;
      if (marked[key] >= 0 && marked[key] != null && String(marked[key]) !== '') {
        var mark = parseInt(marked[key], 10);
        if (mark >= 0) need = Math.max(8, mark + 4);
      }
      if (!s || !s.attempts || s.attempts < need) return info;
      if (s.correct / s.attempts < 0.85) return info;
    }
    info.ready = true;
    return info;
  }

  /** Remember how much practice she already had when this grade was chosen. */
  function stampGradeProgress(state) {
    var courses = normalizeCourses(state);
    var tables = inPlayTables(courses.tables, courses.grade);
    var marked = {};
    var stats = state.tableStats || {};
    var i;
    for (i = 0; i < tables.length; i++) {
      var s = stats[String(tables[i])];
      marked[String(tables[i])] = s && s.attempts ? s.attempts : 0;
    }
    state.courses.gradeMarked = marked;
    return state;
  }

  function applyNextGrade(state) {
    var info = gradeReadiness(state);
    if (!info.ready || !info.next) return false;
    normalizeCourses(state);
    state.courses.grade = info.next;
    stampGradeProgress(state);
    return true;
  }

  function planFromTasks(daily) {
    var parts = { warmup: false, reading: false, multiply: false };
    var focus = [];
    var tasks = (daily && daily.tasks) || [];
    var i;
    for (i = 0; i < tasks.length; i++) {
      var t = tasks[i];
      if (!t) continue;
      if (t.mission === 'warmup') parts.warmup = true;
      if (t.mission === 'reading') parts.reading = true;
      if (t.type === 'mul' && focus.indexOf(t.a) === -1) {
        parts.multiply = true;
        focus.push(t.a);
      }
    }
    focus.sort(function (a, b) { return a - b; });
    return {
      parts: parts,
      tables: focus.slice(),
      focus: focus,
      review: [],
      introduced: [],
      dayIndex: null
    };
  }

  function joinNames(names) {
    if (!names.length) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return names[0] + ' and ' + names[1];
    return names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1];
  }

  function tableLabels(tables) {
    var nums = (tables || []).slice().sort(function (a, b) { return a - b; });
    var labels = [];
    var i;
    for (i = 0; i < nums.length; i++) labels.push(nums[i] + 's');
    return joinNames(labels);
  }

  /** Short home-screen lines for today's parts and focus tables. */
  function describeToday(plan) {
    plan = plan || {};
    var parts = plan.parts || {};
    var focus = plan.lessonFocus;
    var names = [];
    if (focus) {
      if (parts.warmup && focus.addition && focus.subtraction) names.push('warmup math');
      else if (parts.warmup && focus.addition) names.push('addition');
      else if (parts.warmup && focus.subtraction) names.push('subtraction');
      if (parts.reading && focus.reading) names.push('a pet story');
      if (parts.multiply && focus.multiplication) names.push('times tables');
    } else {
      if (parts.warmup) names.push('warmup math');
      if (parts.reading) names.push('a pet story');
      if (parts.multiply) names.push('times tables');
    }
    var partsLine = '';
    if (names.length === 1) partsLine = 'Today includes ' + names[0] + '.';
    else if (names.length === 2) partsLine = 'Today includes ' + names[0] + ' and ' + names[1] + '.';
    else if (names.length >= 3) {
      partsLine = 'Today includes ' + names[0] + ', ' + names[1] + ', and ' + names[2] + '.';
    }

    var tablesLine = '';
    var showTables = parts.multiply && (!focus || focus.multiplication);
    if (showTables && plan.focus && plan.focus.length) {
      tablesLine = 'Today\u2019s tables: ' + tableLabels(plan.focus);
      if (plan.review && plan.review.length) {
        tablesLine += ', plus a little review of ' + tableLabels(plan.review);
      }
      tablesLine += '.';
    }
    return { partsLine: partsLine, tablesLine: tablesLine };
  }

  function currentMissionLabel(task) {
    if (!task) return '';
    if (task.mission === 'warmup') {
      if (task.type === 'add') return 'Addition';
      if (task.type === 'sub') return 'Subtraction';
      return 'Warmup';
    }
    if (task.mission === 'reading') return 'Reading';
    if (task.mission === 'multiply') return 'Times tables';
    return '';
  }

  function applyGrowthForQuest(state, weeklyJustMet) {
    // Base growth for finishing daily quest; bonus if weekly goal newly met
    state.growthPoints = (state.growthPoints || 0) + 10;
    if (weeklyJustMet) state.growthPoints += 8;
    state.growthStage = stageFromPoints(state.growthPoints);
    return state;
  }

  function stageFromPoints(points) {
    points = points || 0;
    if (points >= 80) return 4;
    if (points >= 50) return 3;
    if (points >= 25) return 2;
    if (points >= 10) return 1;
    return 0;
  }

  return {
    DEFAULTS: DEFAULTS,
    normalizeCourses: normalizeCourses,
    inPlayTables: inPlayTables,
    gradeReadiness: gradeReadiness,
    stampGradeProgress: stampGradeProgress,
    applyNextGrade: applyNextGrade,
    generateDailyQuest: generateDailyQuest,
    questMixSummary: questMixSummary,
    ensureTodayQuest: ensureTodayQuest,
    mulOptionsForToday: mulOptionsForToday,
    planFromTasks: planFromTasks,
    describeToday: describeToday,
    questStarted: questStarted,
    currentMissionLabel: currentMissionLabel,
    applyGrowthForQuest: applyGrowthForQuest,
    stageFromPoints: stageFromPoints
  };
});
