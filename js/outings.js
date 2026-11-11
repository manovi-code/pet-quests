/**
 * Pet Quests — walks outside.
 * Hike, playground, beach, and camping open as quests add up.
 * Each walk is a few steps. One saved prize per place per day.
 */
(function (root, factory) {
  var api = factory(
    typeof require !== 'undefined' ? require('./world.js') : root.PQWorld,
    typeof require !== 'undefined' ? require('./closet.js') : root.PQCloset
  );
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PQOutings = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (PQWorld, PQCloset) {
  'use strict';

  var OUTINGS = [
    {
      id: 'outing-hike',
      title: 'Hike',
      button: 'Hike',
      blurb: 'A nature trail',
      needsQuests: 1,
      cloth: 'hat-flower',
      photo: { id: 'hike-photo', name: 'a trail photo', kind: 'sticker', once: true }
    },
    {
      id: 'outing-play',
      title: 'Playground',
      button: 'Playground',
      blurb: 'Swings and a path',
      needsQuests: 4,
      cloth: 'pack-pack',
      photo: { id: 'play-photo', name: 'a swing photo', kind: 'sticker', once: true }
    },
    {
      id: 'outing-beach',
      title: 'Beach',
      button: 'Beach',
      blurb: 'Sand and shells',
      needsQuests: 8,
      cloth: 'glasses-sun',
      photo: { id: 'beach-photo', name: 'a beach photo', kind: 'sticker', once: true }
    },
    {
      id: 'outing-camp',
      title: 'Camping',
      button: 'Camping',
      blurb: 'A tent and stars',
      needsQuests: 12,
      cloth: 'shirt-leaf',
      photo: { id: 'camp-photo', name: 'a camp photo', kind: 'sticker', once: true }
    }
  ];

  function clampGrade(grade) {
    var n = parseInt(grade, 10);
    if (!(n >= 1 && n <= 5)) return 2;
    return n;
  }

  function gradeOf(state) {
    return clampGrade(state && state.courses && state.courses.grade);
  }

  function focusOf(state) {
    var focus = state && state.courses && state.courses.lessonFocus;
    if (!focus) return { addition: true, subtraction: true, multiplication: true, reading: true };
    return {
      addition: !!focus.addition,
      subtraction: !!focus.subtraction,
      multiplication: focus.multiplication !== false,
      reading: !!focus.reading
    };
  }

  function questsOf(state) {
    var world = state && state.world;
    return world && world.questsFinished ? world.questsFinished : 0;
  }

  function byId(id) {
    var i;
    for (i = 0; i < OUTINGS.length; i++) if (OUTINGS[i].id === id) return OUTINGS[i];
    return null;
  }

  function openList(state) {
    var q = questsOf(state);
    var out = [];
    var i;
    for (i = 0; i < OUTINGS.length; i++) {
      if (q >= OUTINGS[i].needsQuests) out.push(OUTINGS[i]);
    }
    return out;
  }

  function isOpen(state, id) {
    var row = byId(id);
    return !!(row && questsOf(state) >= row.needsQuests);
  }

  function shuffle(list, rng) {
    var a = list.slice();
    var i;
    for (i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function numChoices(answer, rng) {
    var vals = [answer];
    var d = 1;
    while (vals.length < 4 && d < 20) {
      if (answer - d >= 0 && vals.indexOf(answer - d) === -1) vals.push(answer - d);
      if (vals.length < 4 && vals.indexOf(answer + d) === -1) vals.push(answer + d);
      d += 1;
    }
    return shuffle(vals.slice(0, 4), rng).map(function (n) {
      return { label: String(n), value: n, ok: n === answer };
    });
  }

  function ask(scene, find, prompt, answer, hint, rng) {
    return {
      kind: 'ask',
      scene: scene,
      find: find,
      prompt: prompt,
      answer: answer,
      hint: hint,
      choices: numChoices(answer, rng)
    };
  }

  function stepCount(grade) {
    if (grade >= 5) return 6;
    if (grade >= 3) return 5;
    return 4;
  }

  function swingStep(grade) {
    var by = 2;
    var times = 3;
    if (grade === 2) times = 4;
    if (grade === 3) { by = 3; times = 4; }
    if (grade === 4) { by = 4; times = 3; }
    if (grade >= 5) { by = 5; times = 3; }
    return {
      kind: 'swing',
      scene: 'swing',
      find: 'the swing',
      by: by,
      target: by * times,
      count: 0,
      prompt: 'Tap the swing. Count by ' + by + ' until you reach ' + (by * times) + '.',
      hint: 'Each swing adds ' + by + '.'
    };
  }

  function signRead(grade, state, rng) {
    var picked = null;
    if (typeof PQReading !== 'undefined' && PQReading.pickShort) {
      picked = PQReading.pickShort((state && state.readingUsedIds) || [], rng, grade);
      if (picked && state && PQReading.rememberRead) PQReading.rememberRead(state, picked.id);
    }
    if (!picked) {
      return ask('sign', 'a trail sign', 'You read a sign about a quiet den. How many animals does the sign name if it says 2?', 2, 'The sign says 2.', rng);
    }
    var choices = picked.choices.map(function (label, i) {
      return { label: label, value: i, ok: i === picked.answer };
    });
    return {
      kind: 'ask',
      scene: 'leaf',
      find: 'a trail sign',
      prompt: picked.text + ' ' + picked.q,
      answer: picked.answer,
      hint: picked.hint,
      choices: shuffle(choices, rng)
    };
  }

  function hikeSteps(grade, focus, rng, state) {
    var mul = focus.multiplication !== false;
    var read = !!focus.reading;
    var nestsA = grade <= 1 ? 2 : 3;
    var nestsB = grade <= 1 ? 2 : 4;
    var nestAnswer = mul ? nestsA * nestsB : nestsA + nestsB;
    var nestPrompt = mul
      ? ('You see ' + nestsA + ' nests. Each nest has ' + nestsB + ' eggs. How many eggs is that?')
      : ('You see ' + nestsA + ' eggs and then ' + nestsB + ' more. How many eggs?');
    var leaf = read
      ? (grade >= 4
        ? 'You read a sign. Maple leaves have five points. This leaf is a maple. Oak leaves are longer. How many points does the maple leaf have?'
        : 'You read a sign. A maple leaf has five points. How many points does this maple leaf have?')
      : 'You find a leaf with 5 points. How many points is that?';
    var steps = [
      ask('leaf', 'a maple leaf', leaf, 5, 'The sign says a maple leaf has five points.', rng),
      ask('nests', 'nests', nestPrompt, nestAnswer, mul
        ? (nestsA + ' groups of ' + nestsB + '.')
        : 'Add the eggs you can see.', rng),
      signRead(grade, state, rng),
      ask('tracks', 'animal tracks', grade <= 1
        ? 'You spot 2 paw prints and then 3 more. How many prints?'
        : 'You spot 4 paw prints and then ' + (grade + 2) + ' more. How many prints?',
      grade <= 1 ? 5 : 4 + grade + 2,
      'Add the two groups of prints.', rng),
      ask('rocks', 'a stack of rocks', mul
        ? ('You see ' + (grade <= 2 ? 2 : 3) + ' stacks with ' + (grade <= 2 ? 3 : 4) + ' rocks in each. How many rocks?')
        : 'You count 3 rocks and then 4 more. How many rocks?',
      mul ? (grade <= 2 ? 6 : 12) : 7,
      mul ? 'Each stack is a group. Count the groups.' : 'Add the rocks you counted.', rng),
      ask('birds', 'two birds', '2 birds sit on a branch, then 2 more hop up. How many birds?', 4, 'Count the birds on the branch.', rng)
    ];
    return steps.slice(0, stepCount(grade));
  }

  function playSteps(grade, focus, rng) {
    var mul = focus.multiplication !== false;
    var kids = grade <= 1 ? 2 : 3;
    var slides = grade <= 2 ? 2 : 3;
    var steps = [
      ask('gate', 'the gate', focus.reading
        ? 'The gate sign says the playground has 4 benches. How many benches?'
        : 'You see 4 benches by the gate. How many benches?',
      4, 'Count the benches.', rng),
      swingStep(grade),
      ask('slide', 'the slide', mul
        ? (slides + ' slides have ' + kids + ' friends each. How many friends?')
        : ('You see ' + kids + ' friends and then 2 more. How many friends?'),
      mul ? slides * kids : kids + 2,
      mul ? 'Each slide is a group.' : 'Add the friends.', rng),
      ask('snack', 'a snack bench', 'You pack 3 apple slices and 2 more. How many slices?', 5, 'Add the slices.', rng),
      ask('ball', 'a hop ball', mul
        ? '2 bins hold 5 balls each. How many balls?'
        : 'You find 5 balls and then 2 more. How many balls?',
      mul ? 10 : 7, 'Count the balls.', rng),
      ask('ribbon', 'a ribbon', 'A ribbon has 3 bows and then 3 more. How many bows?', 6, 'Add the bows.', rng)
    ];
    var n = stepCount(grade);
    var out = [steps[0], steps[1]];
    var i;
    for (i = 2; i < steps.length && out.length < n; i++) out.push(steps[i]);
    return out;
  }

  function beachSteps(grade, focus, rng) {
    var mul = focus.multiplication !== false;
    var piles = grade <= 1 ? 2 : 3;
    var each = grade <= 2 ? 3 : 4;
    var steps = [
      ask('shells', 'shells', 'You find 3 shells and then 2 more. How many shells?', 5, 'Add the shells.', rng),
      ask('waves', 'a wave', focus.reading
        ? (grade >= 4
          ? 'A sign says the tide comes in two times today. The morning tide already came. How many tides are still coming?'
          : 'A sign says 3 waves are easy to count from the towel. How many waves does the sign name?')
        : 'You count 3 waves. How many waves?',
      focus.reading && grade >= 4 ? 1 : 3,
      'Use the number in the sign.', rng),
      ask('pools', 'a tide pool', mul
        ? (piles + ' pools have ' + each + ' crabs each. How many crabs?')
        : 'You see 4 crabs and then 2 more. How many crabs?',
      mul ? piles * each : 6,
      mul ? 'Each pool is a group.' : 'Add the crabs.', rng),
      ask('sand', 'footprints', 'You make 2 footprints and your pet makes 2. How many footprints?', 4, 'Count every footprint.', rng),
      ask('pail', 'a pail', mul ? '2 pails hold 4 shells each. How many shells?' : 'A pail has 4 shells and you add 2. How many shells?',
        mul ? 8 : 6, 'Count the shells in the pails.', rng),
      ask('gulls', 'gulls', '4 gulls stand on the sand. 1 flies off. How many are still standing?', 3, 'Start at 4 and take 1 away.', rng)
    ];
    return steps.slice(0, stepCount(grade));
  }

  function campSteps(grade, focus, rng) {
    var mul = focus.multiplication !== false;
    var bags = grade <= 1 ? 2 : 3;
    var sticks = grade <= 2 ? 3 : 4;
    var steps = [
      ask('stars', 'stars', 'You see 4 stars and then 3 more. How many stars?', 7, 'Add the stars.', rng),
      ask('tent', 'the tent', focus.reading
        ? (grade >= 4
          ? 'The tent card says two blankets are inside and one is on the bench. How many blankets does the card name?'
          : 'The tent card says 2 blankets are inside. How many blankets?')
        : 'You see 2 blankets in the tent. How many blankets?',
      focus.reading && grade >= 4 ? 3 : 2,
      'Use the number on the tent card.', rng),
      ask('sticks', 'sticks', mul
        ? (bags + ' bundles have ' + sticks + ' sticks each. How many sticks?')
        : 'You pick up 4 sticks and then 3 more. How many sticks?',
      mul ? bags * sticks : 7,
      mul ? 'Each bundle is a group.' : 'Add the sticks.', rng),
      ask('mallows', 'marshmallows', 'You toast 2 marshmallows and then 2 more. How many?', 4, 'Count the marshmallows.', rng),
      ask('lanterns', 'a lantern', mul ? '3 hooks hold 2 lanterns each. How many lanterns?' : 'You light 2 lanterns and then 1 more. How many lanterns?',
        mul ? 6 : 3, 'Count the lanterns.', rng),
      ask('songs', 'a quiet song', 'You hum 5 notes and then stop after 2 more. How many notes?', 7, 'Add the notes.', rng)
    ];
    return steps.slice(0, stepCount(grade));
  }

  function create(id, state, rng) {
    rng = rng || Math.random;
    if (!isOpen(state, id)) return null;
    var meta = byId(id);
    var grade = gradeOf(state);
    var focus = focusOf(state);
    var steps = [];
    if (id === 'outing-hike') steps = hikeSteps(grade, focus, rng, state);
    else if (id === 'outing-play') steps = playSteps(grade, focus, rng);
    else if (id === 'outing-beach') steps = beachSteps(grade, focus, rng);
    else if (id === 'outing-camp') steps = campSteps(grade, focus, rng);
    else return null;
    return {
      id: id,
      title: meta.title,
      blurb: meta.blurb,
      cloth: meta.cloth,
      photo: meta.photo,
      grade: grade,
      index: 0,
      steps: steps,
      done: false,
      hint: '',
      note: ''
    };
  }

  function current(run) {
    if (!run || !run.steps) return null;
    return run.steps[run.index] || null;
  }

  function claim(state, run, dateKey) {
    var meta = byId(run.id);
    if (!meta) return { already: false, prize: null, message: 'The walk feels peaceful.' };
    if (PQWorld.bonusUsedToday(state, run.id, dateKey)) {
      return {
        already: true,
        prize: null,
        message: 'You already saved today’s prize from this walk. The path is still nice.'
      };
    }
    PQWorld.markBonusUsed(state, run.id, dateKey);
    var world = PQWorld.ensureWorld(state);
    world.activitiesDone = (world.activitiesDone || 0) + 1;
    var prize = null;
    var photo = {
      id: meta.photo.id,
      name: meta.photo.name,
      kind: 'sticker',
      once: true,
      place: run.id
    };
    if (!PQWorld.hasPrize(state, photo.id)) {
      prize = PQWorld.grantPrize(state, photo);
    } else if (PQCloset && meta.cloth && !PQCloset.owns(state, meta.cloth)) {
      var item = PQCloset.grant(state, meta.cloth);
      prize = item ? { id: item.id, name: item.name, kind: 'clothing', place: run.id } : null;
    } else {
      prize = PQWorld.grantPrize(state, {
        id: run.id + '-treat-' + String(dateKey || 'day'),
        name: 'a little trail treat',
        kind: 'treat',
        once: false,
        place: run.id
      });
    }
    var opened = PQWorld.checkPlaceUnlocks(state);
    var message = 'You finish the walk.';
    if (prize && prize.name) message += ' ' + prize.name + ' is saved on this device.';
    if (opened && opened.length && opened[0].openLine) message += ' ' + opened[0].openLine;
    return { already: false, prize: prize, opened: opened || [], message: message };
  }

  function advance(run, state, dateKey) {
    run.index += 1;
    run.hint = '';
    if (run.index < run.steps.length) {
      return { ok: true, done: false, message: 'You step along the path.', run: run };
    }
    run.done = true;
    var prize = claim(state, run, dateKey || 'today');
    run.note = prize.message;
    return {
      ok: true,
      done: true,
      already: !!prize.already,
      prize: prize.prize,
      message: prize.message,
      run: run
    };
  }

  function answer(run, index, state, dateKey) {
    if (!run || run.done) return { ok: true, done: true, message: run && run.note ? run.note : 'The walk is finished.', run: run };
    var step = current(run);
    if (!step || step.kind === 'swing') {
      return { ok: false, message: 'Tap the swing.', hint: step ? step.hint : '', run: run };
    }
    var choice = step.choices[index];
    if (!choice || !choice.ok) {
      run.hint = step.hint;
      return { ok: false, message: 'Not yet.', hint: step.hint, run: run };
    }
    return advance(run, state, dateKey);
  }

  function swing(run, state, dateKey) {
    if (!run || run.done) return { ok: true, done: true, message: 'The walk is finished.', run: run };
    var step = current(run);
    if (!step || step.kind !== 'swing') {
      return { ok: false, message: 'This stop has a question.', run: run };
    }
    step.count += step.by;
    if (step.count === step.target) {
      var moved = advance(run, state, dateKey);
      moved.message = 'You reach ' + step.target + '. ' + (moved.message || '');
      return moved;
    }
    if (step.count > step.target) {
      step.count = 0;
      run.hint = 'That went past ' + step.target + '. The swing comes back to 0. Count by ' + step.by + '.';
      return { ok: false, message: 'Not yet.', hint: run.hint, run: run };
    }
    run.hint = '';
    return { ok: true, done: false, message: 'The swing says ' + step.count + '.', count: step.count, run: run };
  }

  function scene(kind) {
    var sky = '<rect width="320" height="70" fill="#c5e4f5"/>';
    var ground = '<rect y="70" width="320" height="40" fill="#8fa87a"/>';
    var bit = '';
    if (kind === 'tracks') {
      bit = '<ellipse cx="80" cy="86" rx="10" ry="6" fill="#c9956a"/><ellipse cx="120" cy="90" rx="10" ry="6" fill="#c9956a"/><ellipse cx="160" cy="84" rx="10" ry="6" fill="#c9956a"/>';
    } else if (kind === 'leaf') {
      bit = '<path d="M150 80 Q190 40 230 78 Q180 70 150 80 Z" fill="#7a9a68"/>';
    } else if (kind === 'rocks') {
      bit = '<circle cx="90" cy="84" r="12" fill="#b7b1a6"/><circle cx="140" cy="88" r="16" fill="#9a9388"/><circle cx="190" cy="84" r="12" fill="#cfc8bc"/>';
    } else if (kind === 'nests') {
      bit = '<path d="M70 88 Q100 70 130 88" fill="#a35f38"/><circle cx="92" cy="82" r="4" fill="#f0e0a0"/><circle cx="108" cy="80" r="4" fill="#fffaf0"/>';
    } else if (kind === 'swing') {
      bit = '<rect x="70" y="30" width="8" height="60" fill="#a35f38"/><rect x="150" y="30" width="8" height="60" fill="#a35f38"/><rect x="70" y="30" width="88" height="6" fill="#a35f38"/><rect x="96" y="70" width="36" height="8" rx="2" fill="#c4784a"/>';
    } else if (kind === 'slide') {
      bit = '<polygon points="80,90 150,90 170,40 120,40" fill="#e07a5f"/>';
    } else if (kind === 'shells' || kind === 'sand') {
      ground = '<rect y="70" width="320" height="40" fill="#f0e0a0"/>';
      bit = '<path d="M80 90 Q100 70 120 90" fill="#fffaf0"/><path d="M160 92 Q180 74 200 92" fill="#e8c49a"/>';
    } else if (kind === 'waves' || kind === 'pools') {
      sky = '<rect width="320" height="60" fill="#c5e4f5"/>';
      ground = '<rect y="60" width="320" height="24" fill="#8eb4c9"/><rect y="84" width="320" height="26" fill="#f0e0a0"/>';
      bit = '<path d="M0 70 Q40 58 80 70 T160 70 T240 70 T320 70" fill="none" stroke="#fffaf0" stroke-width="3"/>';
    } else if (kind === 'tent' || kind === 'lanterns') {
      bit = '<polygon points="70,90 130,40 190,90" fill="#5f7a52"/><circle cx="220" cy="70" r="10" fill="#e8c84a"/>';
    } else if (kind === 'stars') {
      sky = '<rect width="320" height="70" fill="#2f4a6a"/>';
      bit = '<circle cx="60" cy="30" r="2" fill="#fffaf0"/><circle cx="120" cy="20" r="2" fill="#fffaf0"/><circle cx="200" cy="28" r="2" fill="#e8c84a"/>';
    } else if (kind === 'flags' || kind === 'gate') {
      bit = '<rect x="80" y="40" width="6" height="50" fill="#a35f38"/><polygon points="86,40 120,50 86,60" fill="#e07a5f"/>';
    } else {
      bit = '<circle cx="240" cy="28" r="12" fill="#f0e0a0"/>';
    }
    return '<svg class="outing-svg" viewBox="0 0 320 110" width="100%" height="100%" aria-hidden="true">' +
      sky + ground + bit + '</svg>';
  }

  return {
    OUTINGS: OUTINGS,
    byId: byId,
    openList: openList,
    isOpen: isOpen,
    create: create,
    current: current,
    answer: answer,
    swing: swing,
    claim: claim,
    scene: scene
  };
});
