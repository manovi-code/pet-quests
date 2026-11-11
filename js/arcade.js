/**
 * Pet Quests — extra learning games.
 * They stay hidden until a matching place is open.
 * A miss is a hint and another try. Nothing is taken away.
 */
(function (root, factory) {
  var api = factory(
    typeof require !== 'undefined' ? require('./world.js') : root.PQWorld
  );
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PQArcade = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (PQWorld) {
  'use strict';

  var GAMES = [
    {
      id: 'hide',
      title: 'Pet Hide and Seek',
      button: 'Hide and seek',
      places: ['nature', 'parlor'],
      unlock: 'Opens with the nature center, and also in the game hall.'
    },
    {
      id: 'parade',
      title: 'Pet Parade Patterns',
      button: 'Pet parade',
      places: ['playground', 'parlor'],
      unlock: 'Opens with the playground, and also in the game hall.'
    },
    {
      id: 'treasure',
      title: 'Treasure Map Steps',
      button: 'Treasure map',
      places: ['museum', 'parlor'],
      unlock: 'Opens with the museum, and also in the game hall.'
    },
    {
      id: 'sort',
      title: 'Pet Shop Sort',
      button: 'Pet shop sort',
      places: ['market', 'parlor'],
      unlock: 'Opens with the market, and also in the game hall.'
    }
  ];

  var NOUNS = ['nest', 'paw', 'leaf', 'trail', 'shell', 'tent'];
  var VERBS = ['hop', 'nibble', 'swing', 'peek', 'pack', 'rest'];

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
    while (vals.length < 4 && d < 30) {
      if (answer - d >= 0 && vals.indexOf(answer - d) === -1) vals.push(answer - d);
      if (vals.length < 4 && vals.indexOf(answer + d) === -1) vals.push(answer + d);
      d += 1;
    }
    return shuffle(vals.slice(0, 4), rng).map(function (n) {
      return { label: String(n), value: n, ok: n === answer };
    });
  }

  function meta(id) {
    var i;
    for (i = 0; i < GAMES.length; i++) if (GAMES[i].id === id) return GAMES[i];
    return null;
  }

  function forPlace(state, placeId) {
    if (!PQWorld || !PQWorld.isPlaceOpen || !PQWorld.isPlaceOpen(state, placeId)) return [];
    var out = [];
    var i;
    for (i = 0; i < GAMES.length; i++) {
      if (GAMES[i].places.indexOf(placeId) === -1) continue;
      out.push({
        id: GAMES[i].id,
        title: GAMES[i].title,
        button: GAMES[i].button,
        place: placeId
      });
    }
    return out;
  }

  function gridFor(grade) {
    if (grade <= 1) return { rows: 3, cols: 3, pets: 2 };
    if (grade === 2) return { rows: 3, cols: 4, pets: 2 };
    if (grade === 3) return { rows: 4, cols: 4, pets: 3 };
    if (grade === 4) return { rows: 4, cols: 4, pets: 3 };
    return { rows: 4, cols: 5, pets: 4 };
  }

  function pickWeighted(max, stats, rng) {
    var bag = [];
    var n;
    var k;
    for (n = 1; n <= max; n++) {
      var stat = (stats && stats[String(n)]) || { attempts: 0, correct: 0 };
      var miss = stat.attempts ? (1 - stat.correct / stat.attempts) : 0.35;
      var weight = 1 + Math.round(miss * 4);
      for (k = 0; k < weight; k++) bag.push(n);
    }
    if (!bag.length) return 1;
    return bag[Math.floor(rng() * bag.length) % bag.length];
  }

  function hideKey(r, c) { return r + ',' + c; }

  function hideOpenList(game) {
    var keys = [];
    var key;
    for (key in game.open) {
      if (Object.prototype.hasOwnProperty.call(game.open, key)) keys.push(key);
    }
    return keys;
  }

  function dealHide(game, rng) {
    var closed = [];
    var r;
    var c;
    for (r = 1; r <= game.rows; r++) {
      for (c = 1; c <= game.cols; c++) {
        if (!game.open[hideKey(r, c)]) closed.push({ r: r, c: c });
      }
    }
    if (!closed.length) {
      game.ask = null;
      game.choices = [];
      return game;
    }
    var lastKey = game.ask ? (game.ask.a + '×' + game.ask.b) : '';
    var pool = closed.filter(function (spot) {
      return !lastKey || (spot.r + '×' + spot.c) !== lastKey;
    });
    if (!pool.length) pool = closed;
    var spot = pool[Math.floor(rng() * pool.length) % pool.length];
    var a = spot.r;
    var b = spot.c;
    var useMul = game.useMul;
    var answer = useMul ? a * b : a + b;
    var sign = useMul ? '×' : '+';
    var roll = rng();
    var line;
    if (!useMul) {
      line = roll < 0.5
        ? ('Row ' + a + ', column ' + b + '. What is ' + a + ' + ' + b + '?')
        : ('Row ' + a + ' and column ' + b + '. How many is ' + a + ' and ' + b + ' more?');
    } else if (roll < 0.34) {
      line = 'Row ' + a + ', column ' + b + '. How many in ' + a + ' groups of ' + b + '?';
    } else if (roll < 0.67) {
      line = 'Skip-count ' + a + ' hops of ' + b + ' for row ' + a + ', column ' + b + '.';
    } else {
      line = 'Row ' + a + ', column ' + b + '. What is ' + b + ' × ' + a + '?';
    }
    game.ask = { r: a, c: b, a: a, b: b, answer: answer, sign: sign };
    game.choices = numChoices(answer, rng);
    game.prompt = {
      type: useMul ? 'mul' : 'add',
      prompt: line,
      answer: answer,
      a: a,
      b: b
    };
    return game;
  }

  function createHide(state, rng) {
    var grade = gradeOf(state);
    var focus = focusOf(state);
    var spec = gridFor(grade);
    var spots = [];
    var r;
    var c;
    for (r = 1; r <= spec.rows; r++) {
      for (c = 1; c <= spec.cols; c++) spots.push({ r: r, c: c });
    }
    spots = shuffle(spots, rng);
    var pets = [];
    var i;
    for (i = 0; i < spec.pets && i < spots.length; i++) pets.push(spots[i]);
    var game = {
      id: 'hide',
      title: 'Pet Hide and Seek',
      grade: grade,
      rows: spec.rows,
      cols: spec.cols,
      pets: pets,
      open: {},
      withPet: true,
      found: 0,
      need: pets.length,
      misses: 0,
      done: false,
      rewarded: false,
      useMul: focus.multiplication !== false,
      stats: (state && state.tableStats) || {},
      hardest: spec.rows * spec.cols
    };
    return dealHide(game, rng);
  }

  function isPet(game, r, c) {
    var i;
    for (i = 0; i < game.pets.length; i++) {
      if (game.pets[i].r === r && game.pets[i].c === c) return true;
    }
    return false;
  }

  function reveal(game, r, c) {
    var key = hideKey(r, c);
    if (game.open[key]) return game.open[key];
    var kind = isPet(game, r, c) ? 'pet' : 'empty';
    game.open[key] = kind;
    if (kind === 'pet') game.found += 1;
    return kind;
  }

  function petPeek(game, rng) {
    var closed = [];
    var r;
    var c;
    for (r = 1; r <= game.rows; r++) {
      for (c = 1; c <= game.cols; c++) {
        if (!game.open[hideKey(r, c)]) closed.push({ r: r, c: c });
      }
    }
    if (!closed.length) return null;
    var empties = closed.filter(function (spot) { return !isPet(game, spot.r, spot.c); });
    var pool = empties.length ? empties : closed;
    var spot = pool[Math.floor(rng() * pool.length) % pool.length];
    var kind = reveal(game, spot.r, spot.c);
    return { r: spot.r, c: spot.c, kind: kind };
  }

  function answerHide(game, index, rng) {
    if (game.done) return { ok: true, done: true, message: 'You found every hiding pet.', game: game };
    var choice = game.choices[index];
    if (!choice) return { ok: false, message: 'Tap one answer.', hint: '', game: game };
    if (!choice.ok) {
      game.misses += 1;
      var hint = game.useMul
        ? ('Count by ' + game.ask.a + ', ' + game.ask.b + ' times.')
        : ('Start at ' + game.ask.a + ' and add ' + game.ask.b + '.');
      if (game.misses >= 2) {
        hint = game.ask.a + ' ' + game.ask.sign + ' ' + game.ask.b + ' = ' + game.ask.answer + '.';
      }
      return { ok: false, message: 'Not yet.', hint: hint, game: game };
    }
    var kind = reveal(game, game.ask.r, game.ask.c);
    game.misses = 0;
    var message = kind === 'pet' ? 'A friend was hiding there.' : 'That square is open. Just a leaf.';
    if (game.found >= game.need) {
      game.done = true;
      return { ok: true, done: true, message: 'You found every hiding pet.', game: game };
    }
    if (game.withPet) {
      var peek = petPeek(game, rng);
      if (peek) {
        message += peek.kind === 'pet'
          ? ' Your pet peeks and finds a friend too.'
          : ' Your pet peeks at an empty square and smiles.';
      }
      if (game.found >= game.need) {
        game.done = true;
        return { ok: true, done: true, message: 'You found every hiding pet together.', game: game };
      }
    }
    dealHide(game, rng);
    return { ok: true, done: false, message: message, game: game };
  }

  function paradeNeed(grade) {
    if (grade <= 1) return 3;
    if (grade === 2) return 4;
    if (grade === 3) return 4;
    return 5;
  }

  function paradeStep(grade, focus, stats, rng) {
    if (focus.multiplication === false) return grade <= 2 ? 2 : 5;
    var max = grade <= 1 ? 5 : (grade === 2 ? 6 : (grade === 3 ? 8 : 12));
    return pickWeighted(max, stats, rng);
  }

  function dealParade(game, rng) {
    var start = game.shown.length ? game.shown[game.shown.length - 1] : game.step;
    if (!game.shown.length) {
      game.shown = [game.step, game.step * 2, game.step * 3];
      start = game.step * 3;
    }
    var next = start + game.step;
    game.next = next;
    game.choices = numChoices(next, rng);
    var tail = game.shown.slice(-3);
    game.prompt = {
      type: 'mul',
      prompt: tail.join(', ') + ', ?',
      answer: next
    };
    return game;
  }

  function createParade(state, rng) {
    var grade = gradeOf(state);
    var focus = focusOf(state);
    var step = paradeStep(grade, focus, (state && state.tableStats) || {}, rng);
    var game = {
      id: 'parade',
      title: 'Pet Parade Patterns',
      grade: grade,
      step: step,
      shown: [],
      pets: 0,
      need: paradeNeed(grade),
      misses: 0,
      done: false,
      rewarded: false,
      hardest: step * (3 + paradeNeed(grade))
    };
    return dealParade(game, rng);
  }

  function answerParade(game, index, rng) {
    if (game.done) return { ok: true, done: true, message: 'The parade is full.', game: game };
    var choice = game.choices[index];
    if (!choice || !choice.ok) {
      game.misses += 1;
      var hint = 'Count by ' + game.step + '. ' + game.shown[game.shown.length - 1] + ' and ' + game.step + ' more.';
      return { ok: false, message: 'Not yet.', hint: hint, game: game };
    }
    game.misses = 0;
    game.shown.push(game.next);
    game.pets += 1;
    if (game.pets >= game.need) {
      game.done = true;
      return { ok: true, done: true, message: 'The parade is full of pets.', game: game };
    }
    dealParade(game, rng);
    return { ok: true, done: false, message: 'A pet joins the parade.', game: game };
  }

  function trailLegs(grade, focus, rng) {
    rng = rng || Math.random;
    var mul = focus.multiplication !== false;
    var bank;
    if (grade <= 1) {
      bank = [
        { a: 2, b: 1, op: 'add', read: 'The note says two steps and one more.' },
        { a: 3, b: 1, op: 'add', read: 'You see three stones and one extra pebble.' },
        { a: 4, b: 2, op: 'sub', read: 'Four marks, then two are already counted.' },
        { a: 2, b: 2, op: 'add', read: 'Two nests and two more steps.' },
        { a: 3, b: 2, op: 'add', read: 'Three prints and two more steps.' },
        { a: 2, b: 1, op: 'add', read: 'Two stones and one extra step.' }
      ];
    } else if (!mul || grade === 2) {
      bank = [
        { a: 4, b: 2, op: 'add', read: 'The note says four steps and two more.' },
        { a: 5, b: 1, op: 'sub', read: 'Five dots, and one is the start.' },
        { a: 3, b: 2, op: 'add', read: 'Three leaves and two twigs mark the path.' },
        { a: 3, b: 1, op: 'add', read: 'Three steps and one more to the next mark.' },
        { a: 4, b: 3, op: 'add', read: 'Four leaves and three more steps.' },
        { a: 6, b: 2, op: 'sub', read: 'Six marks, then two steps are already counted.' }
      ];
    } else if (grade === 3) {
      bank = [
        { a: 2, b: 2, op: 'mul', read: 'The note says 2 rows of 2 steps.' },
        { a: 2, b: 3, op: 'mul', read: 'You read 2 groups of 3 steps.' },
        { a: 3, b: 2, op: 'mul', read: '3 nests with 2 steps beside each nest.' },
        { a: 2, b: 1, op: 'mul', read: '2 lines with 1 step left on each.' },
        { a: 4, b: 2, op: 'mul', read: '4 rows of 2 steps on the map.' },
        { a: 3, b: 3, op: 'mul', read: '3 nests with 3 steps beside each.' }
      ];
    } else if (grade === 4) {
      bank = [
        { a: 3, b: 2, op: 'mul', read: 'The map says 3 groups of 2 steps.' },
        { a: 4, b: 2, op: 'mul', read: '4 trees with 2 steps between the marks.' },
        { a: 2, b: 2, op: 'mul', read: '2 bridges with 2 steps each.' },
        { a: 2, b: 1, op: 'mul', read: '2 last steps, 1 on each side of the chest.' },
        { a: 3, b: 4, op: 'mul', read: '3 posts with 4 steps between them.' },
        { a: 5, b: 2, op: 'mul', read: '5 pairs of steps along the wall.' }
      ];
    } else {
      bank = [
        { a: 4, b: 2, op: 'mul', read: 'The note says 4 pairs of steps.' },
        { a: 3, b: 2, op: 'mul', read: '3 nests with 2 steps by each nest.' },
        { a: 2, b: 2, op: 'mul', read: '2 short rows of 2 steps.' },
        { a: 2, b: 1, op: 'mul', read: '2 final steps, 1 at a time, up to the chest.' },
        { a: 4, b: 3, op: 'mul', read: '4 rows of 3 steps on the map.' },
        { a: 6, b: 2, op: 'mul', read: '6 hops of 2 steps to the chest.' }
      ];
    }
    return shuffle(bank, rng).slice(0, 4);
  }

  function legAnswer(leg) {
    if (leg.op === 'mul') return leg.a * leg.b;
    if (leg.op === 'sub') return Math.max(0, leg.a - leg.b);
    return leg.a + leg.b;
  }

  function legPrompt(leg, grade, focus) {
    var answer = legAnswer(leg);
    var math = leg.op === 'mul'
      ? (leg.a + ' × ' + leg.b)
      : (leg.op === 'sub' ? (leg.a + ' − ' + leg.b) : (leg.a + ' + ' + leg.b));
    var sentence = leg.read;
    if (grade >= 4 && focus.reading) {
      sentence += ' That number is how many steps to move.';
    }
    return {
      prompt: sentence + ' How many steps is ' + math + '?',
      answer: answer,
      hint: math + ' tells the steps.'
    };
  }

  function createTreasure(state, rng) {
    var grade = gradeOf(state);
    var focus = focusOf(state);
    var legs = trailLegs(grade, focus, rng);
    var steps = [];
    var total = 0;
    var i;
    for (i = 0; i < legs.length; i++) {
      var told = legPrompt(legs[i], grade, focus);
      total += told.answer;
      steps.push({
        prompt: told.prompt,
        answer: told.answer,
        hint: told.hint,
        choices: numChoices(told.answer, rng),
        move: told.answer
      });
    }
    return {
      id: 'treasure',
      title: 'Treasure Map Steps',
      grade: grade,
      steps: steps,
      index: 0,
      pos: 0,
      goal: total,
      cols: 4,
      rows: 4,
      misses: 0,
      done: false,
      rewarded: false,
      hardest: total,
      prompt: { type: 'read', prompt: steps[0].prompt, answer: steps[0].answer, choices: steps[0].choices }
    };
  }

  function answerTreasure(game, index) {
    if (game.done) return { ok: true, done: true, message: 'The chest is open.', game: game };
    var step = game.steps[game.index];
    var choice = step.choices[index];
    if (!choice || !choice.ok) {
      game.misses += 1;
      return { ok: false, message: 'Not yet.', hint: step.hint, game: game };
    }
    game.misses = 0;
    game.pos += step.move;
    game.index += 1;
    if (game.index >= game.steps.length) {
      game.done = true;
      game.pos = game.goal;
      return { ok: true, done: true, message: 'You reach the treasure chest.', game: game };
    }
    var next = game.steps[game.index];
    game.prompt = { type: 'read', prompt: next.prompt, answer: next.answer, choices: next.choices };
    return { ok: true, done: false, message: 'You take ' + step.move + ' steps.', game: game };
  }

  function factCard(expr, value, basket) {
    return { label: expr, value: value, basket: basket };
  }

  function sortFacts(grade) {
    if (grade <= 1) {
      return {
        baskets: ['6', '10'],
        cards: [
          factCard('2 × 3', 6, '6'),
          factCard('1 × 6', 6, '6'),
          factCard('2 × 5', 10, '10'),
          factCard('5 × 2', 10, '10')
        ]
      };
    }
    if (grade === 2) {
      return {
        baskets: ['12', '18'],
        cards: [
          factCard('3 × 4', 12, '12'),
          factCard('2 × 6', 12, '12'),
          factCard('6 × 2', 12, '12'),
          factCard('3 × 6', 18, '18'),
          factCard('2 × 9', 18, '18')
        ]
      };
    }
    return {
      baskets: ['24', '36'],
      cards: [
        factCard('4 × 6', 24, '24'),
        factCard('3 × 8', 24, '24'),
        factCard('6 × 4', 24, '24'),
        factCard('6 × 6', 36, '36'),
        factCard('4 × 9', 36, '36'),
        factCard('3 × 12', 36, '36')
      ]
    };
  }

  function sortWords(grade) {
    var n = grade >= 5 ? 6 : 5;
    var cards = [];
    var i;
    for (i = 0; i < n; i++) {
      if (i % 2 === 0) cards.push({ label: NOUNS[i % NOUNS.length], value: NOUNS[i % NOUNS.length], basket: 'Nouns' });
      else cards.push({ label: VERBS[i % VERBS.length], value: VERBS[i % VERBS.length], basket: 'Verbs' });
    }
    return { baskets: ['Nouns', 'Verbs'], cards: cards };
  }

  function createSort(state, rng) {
    var grade = gradeOf(state);
    var focus = focusOf(state);
    var words = false;
    if (focus.reading && (grade >= 4 || focus.multiplication === false)) words = true;
    if (!focus.reading && focus.multiplication === false && !focus.addition && !focus.subtraction) words = false;
    var pack = words ? sortWords(grade) : sortFacts(grade);
    var cards = shuffle(pack.cards, rng);
    if (grade <= 2 && cards.length > 4) cards = cards.slice(0, 4);
    return {
      id: 'sort',
      title: 'Pet Shop Sort',
      grade: grade,
      mode: words ? 'words' : 'facts',
      baskets: pack.baskets,
      cards: cards,
      index: 0,
      sorted: 0,
      misses: 0,
      done: false,
      rewarded: false,
      hardest: words ? cards.length : 36,
      prompt: {
        type: words ? 'read' : 'mul',
        prompt: words ? 'Where does this word go?' : 'Which basket matches this fact?'
      }
    };
  }

  function answerSort(game, basket) {
    if (game.done) return { ok: true, done: true, message: 'Every card is sorted.', game: game };
    var card = game.cards[game.index];
    if (!card) {
      game.done = true;
      return { ok: true, done: true, message: 'Every card is sorted.', game: game };
    }
    if (basket !== card.basket) {
      game.misses += 1;
      var hint = game.mode === 'words'
        ? 'A noun is a thing. A verb is an action.'
        : (card.label + ' equals ' + card.value + '.');
      return { ok: false, message: 'Not yet.', hint: hint, game: game };
    }
    game.misses = 0;
    game.sorted += 1;
    game.index += 1;
    if (game.index >= game.cards.length) {
      game.done = true;
      return { ok: true, done: true, message: 'Every card is in a basket.', game: game };
    }
    return { ok: true, done: false, message: 'That card fits.', game: game };
  }

  function create(id, state, rng) {
    rng = rng || Math.random;
    if (id === 'hide') return createHide(state, rng);
    if (id === 'parade') return createParade(state, rng);
    if (id === 'treasure') return createTreasure(state, rng);
    if (id === 'sort') return createSort(state, rng);
    return null;
  }

  function answer(game, value, rng) {
    rng = rng || Math.random;
    if (!game) return { ok: false, message: 'Pick a game first.', game: game };
    if (game.id === 'hide') return answerHide(game, value, rng);
    if (game.id === 'parade') return answerParade(game, value, rng);
    if (game.id === 'treasure') return answerTreasure(game, value);
    if (game.id === 'sort') return answerSort(game, value);
    return { ok: false, message: 'Try a choice on the board.', game: game };
  }

  function setTogether(game, on) {
    if (!game || game.id !== 'hide') return game;
    game.withPet = !!on;
    return game;
  }

  return {
    GAMES: GAMES,
    forPlace: forPlace,
    create: create,
    answer: answer,
    setTogether: setTogether,
    meta: meta
  };
});
