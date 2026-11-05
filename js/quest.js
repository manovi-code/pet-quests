/**
 * Pet Quests — daily quest generation.
 * Mission order: warmup (add/sub) → one reading passage (2–3 Qs) → multiplication block.
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

  /**
   * Build today's full task list.
   * Shape: ~3 warmup add/sub → 1 passage + 2–3 reading Qs → ~12 mul.
   * Total roughly 16–19 tasks (~15–20 min for a struggling 5th grader).
   */
  function generateDailyQuest(state, rng, opts) {
    rng = rng || Math.random;
    opts = opts || {};
    var warmupN = opts.warmupCount != null ? opts.warmupCount : DEFAULTS.warmupCount;
    var mulN = opts.mulCount != null ? opts.mulCount : DEFAULTS.mulCount;

    var tasks = [];
    var i;

    // Mission 1: warmup addition/subtraction
    for (i = 0; i < warmupN; i++) {
      tasks.push(PQMath.makeAddSubTask(rng, 'warm-' + i));
    }

    // Mission 2: one reading passage with 2–3 comprehension questions
    var passage = PQReading.pickPassage(state.readingUsedIds || [], rng);
    var readingTasks = PQReading.passageToTasks(passage);
    for (i = 0; i < readingTasks.length; i++) {
      tasks.push(readingTasks[i]);
    }

    // Mission 3: longer multiplication block (main skill)
    for (i = 0; i < mulN; i++) {
      tasks.push(
        PQMath.makeMulTaskPreferWeakFacts(
          state.tableStats || {},
          state.factStats || {},
          rng,
          'mul-' + i
        )
      );
    }

    return {
      dateKey: PQStorage.localDateKey(opts.now || new Date()),
      passageId: passage.id,
      tasks: tasks,
      missions: [
        { id: 'warmup', label: 'Warmup', count: warmupN },
        { id: 'reading', label: 'Reading', count: readingTasks.length },
        { id: 'multiply', label: 'Times tables', count: mulN }
      ]
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

  function ensureTodayQuest(state, rng, now) {
    now = now || new Date();
    var dk = PQStorage.localDateKey(now);
    PQStorage.ensureWeek(state, now);

    if (
      state.daily &&
      state.daily.dateKey === dk &&
      Array.isArray(state.daily.tasks) &&
      state.daily.tasks.length
    ) {
      return state;
    }

    var quest = generateDailyQuest(state, rng, { now: now });
    state.daily = {
      dateKey: dk,
      completed: false,
      taskIndex: 0,
      tasks: quest.tasks,
      answers: [],
      passageId: quest.passageId,
      missions: quest.missions
    };

    // Track used reading (keep last ~10)
    state.readingUsedIds = state.readingUsedIds || [];
    if (quest.passageId && state.readingUsedIds.indexOf(quest.passageId) === -1) {
      state.readingUsedIds.push(quest.passageId);
    }
    if (state.readingUsedIds.length > 10) {
      state.readingUsedIds = state.readingUsedIds.slice(-10);
    }

    return state;
  }

  function currentMissionLabel(task) {
    if (!task) return '';
    if (task.mission === 'warmup') return 'Warmup';
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
    generateDailyQuest: generateDailyQuest,
    questMixSummary: questMixSummary,
    ensureTodayQuest: ensureTodayQuest,
    currentMissionLabel: currentMissionLabel,
    applyGrowthForQuest: applyGrowthForQuest,
    stageFromPoints: stageFromPoints
  };
});
