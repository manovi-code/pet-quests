/**
 * Pet Quests — board and quick learning games.
 * Rank changes the size of the facts. A miss is a hint and a retry.
 * Coins are a gift for playing. Nothing is taken away.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      typeof require !== 'undefined' ? require('./math.js') : root.PQMath,
      typeof require !== 'undefined' ? require('./world.js') : root.PQWorld,
      typeof require !== 'undefined' ? require('./quest.js') : root.PQQuest
    );
  } else {
    root.PQBoards = factory(root.PQMath, root.PQWorld, root.PQQuest);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (PQMath, PQWorld, PQQuest) {
  'use strict';

  var ROWS = 6;
  var COLS = 7;
  var HOME = 12;
  var ESCORT_AFTER = 14;
  var FLIP_BACK_MS = 1000;

  var HOSTS = {
    parlor: [
      { id: 'four', title: 'Four in a Row', button: 'Four in a Row' },
      { id: 'race', title: 'Pet Race Home', button: 'Pet Race Home' }
    ],
    school: [
      { id: 'four', title: 'Four in a Row', button: 'Four in a Row' },
      { id: 'bingo', title: 'Times Bingo', button: 'Times bingo' },
      { id: 'array', title: 'Array Builder', button: 'Array builder' }
    ],
    library: [
      { id: 'memory', title: 'Word Match', button: 'Word match' }
    ],
    playground: [
      { id: 'race', title: 'Pet Race Home', button: 'Pet Race Home' }
    ]
  };

  var READ_EASY = [
    { q: 'Which word means a cozy sleep?', choices: ['nap', 'rush', 'storm'], answer: 0, hint: 'A nap is a cozy sleep.' },
    { q: 'Which word is a pet home?', choices: ['den', 'cloud', 'boat'], answer: 0, hint: 'A den is a home for a pet.' },
    { q: 'Which word is a pet foot?', choices: ['paw', 'rain', 'hill'], answer: 0, hint: 'A paw is a pet foot.' },
    { q: 'Which word means to look closely?', choices: ['peek', 'shout', 'drop'], answer: 0, hint: 'Peek means a careful look.' }
  ];

  var READ_MID = [
    { q: 'Which word means a path you can walk?', choices: ['trail', 'kettle', 'ribbon'], answer: 0, hint: 'A trail is a path.' },
    { q: 'Which word means something you keep to remember?', choices: ['keepsake', 'puddle', 'ladder'], answer: 0, hint: 'A keepsake is kept to remember.' },
    { q: 'Which word means quiet and calm?', choices: ['gentle', 'noisy', 'sharp'], answer: 0, hint: 'Gentle means quiet and kind.' },
    { q: 'Which word means a small group of the same thing?', choices: ['set', 'storm', 'fence'], answer: 0, hint: 'A set is a small group.' }
  ];

  var READ_RICH = [
    { q: 'Which word means someone goes back to a quiet den to rest?', choices: ['nap', 'sprint', 'puzzle'], answer: 0, hint: 'A nap means resting in a quiet place.' },
    { q: 'Which word means a friendly bump sends a pawn home to rest, not to quit?', choices: ['nap', 'forfeit', 'rush'], answer: 0, hint: 'The pawn takes a nap in the den, then can come out again.' },
    { q: 'Which phrase means the pet is safe and finished walking?', choices: ['home at last', 'lost the path', 'start over'], answer: 0, hint: 'Home at last means the walk is finished.' },
    { q: 'Which word means you notice a small clue in a story?', choices: ['detail', 'thunder', 'pocket'], answer: 0, hint: 'A detail is a small thing you can notice.' }
  ];

  var MEMORY = {
    1: [
      { id: 'nap', word: 'nap', mean: 'a cozy sleep' },
      { id: 'den', word: 'den', mean: 'a pet home' },
      { id: 'paw', word: 'paw', mean: 'a pet foot' }
    ],
    2: [
      { id: 'nap', word: 'nap', mean: 'a cozy sleep' },
      { id: 'den', word: 'den', mean: 'a pet home' },
      { id: 'trail', word: 'trail', mean: 'a walking path' },
      { id: 'peek', word: 'peek', mean: 'a careful look' }
    ],
    3: [
      { id: 'keepsake', word: 'keepsake', mean: 'kept to remember' },
      { id: 'gentle', word: 'gentle', mean: 'quiet and kind' },
      { id: 'trail', word: 'trail', mean: 'a walking path' },
      { id: 'set', word: 'set', mean: 'a small group' }
    ],
    4: [
      { id: 'keepsake', word: 'keepsake', mean: 'kept to remember' },
      { id: 'detail', word: 'detail', mean: 'a small clue' },
      { id: 'habitat', word: 'habitat', mean: 'an animal home' },
      { id: 'array', word: 'array', mean: 'rows of equal groups' },
      { id: 'gentle', word: 'gentle', mean: 'quiet and kind' }
    ],
    5: [
      { id: 'keepsake', word: 'keepsake', mean: 'kept to remember' },
      { id: 'detail', word: 'detail', mean: 'a small clue' },
      { id: 'habitat', word: 'habitat', mean: 'an animal home' },
      { id: 'array', word: 'array', mean: 'rows of equal groups' },
      { id: 'observe', word: 'observe', mean: 'to look with care' },
      { id: 'arrive', word: 'arrive', mean: 'to reach the end' }
    ]
  };

  function clampGrade(grade) {
    var n = parseInt(grade, 10);
    if (!(n >= 1 && n <= 5)) return 2;
    return n;
  }

  function gradeOf(state) {
    var courses = state && state.courses;
    return clampGrade(courses && courses.grade);
  }

  function focusOf(state) {
    var focus = state && state.courses && state.courses.lessonFocus;
    if (!focus) {
      return { addition: true, subtraction: true, multiplication: true, reading: true };
    }
    return {
      addition: !!focus.addition,
      subtraction: !!focus.subtraction,
      multiplication: focus.multiplication !== false,
      reading: !!focus.reading
    };
  }

  function pickKind(focus, rng, allowRead) {
    focus = focus || {};
    var bag = [];
    if (focus.multiplication !== false) {
      bag.push('mul', 'mul', 'mul', 'mul');
    }
    if (focus.addition) bag.push('add');
    if (focus.subtraction) bag.push('sub');
    if (allowRead && focus.reading) bag.push('read');
    if (!bag.length) bag.push('mul');
    return bag[Math.floor(rng() * bag.length) % bag.length];
  }

  function mulOpts(state) {
    var courses = (state && state.courses) || {};
    var grade = clampGrade(courses.grade);
    var selected = courses.tables || [1, 2, 5, 10];
    var allowed = PQMath.tablesForGrade(grade);
    var pool = [];
    var i;
    for (i = 0; i < selected.length; i++) {
      var n = parseInt(selected[i], 10);
      if (allowed.indexOf(n) !== -1 && pool.indexOf(n) === -1) pool.push(n);
    }
    if (!pool.length) pool = allowed.slice();
    return {
      pool: pool,
      focus: pool.slice(),
      review: [],
      grade: grade,
      tableStats: (state && state.tableStats) || {},
      dayIndex: 3,
      deferStory: true
    };
  }

  function readBank(grade) {
    grade = clampGrade(grade);
    if (grade <= 2) return READ_EASY;
    if (grade === 3) return READ_MID;
    return READ_RICH;
  }

  function readingPrompt(grade, rng) {
    var bank = readBank(grade);
    var row = bank[Math.floor(rng() * bank.length) % bank.length];
    return {
      type: 'read',
      prompt: row.q,
      choices: row.choices.slice(),
      answer: row.answer,
      hint: row.hint,
      task: null
    };
  }

  function makePrompt(state, rng, allowRead) {
    var focus = focusOf(state);
    var kind = pickKind(focus, rng, allowRead);
    var grade = gradeOf(state);
    if (kind === 'read') return readingPrompt(grade, rng);
    if (kind === 'add' || kind === 'sub') {
      var task = PQMath.makeAddSubTask(rng, 'board', { grade: grade, op: kind });
      return {
        type: task.type,
        prompt: task.prompt,
        answer: task.answer,
        choices: null,
        hint: '',
        a: task.a,
        b: task.b,
        task: task
      };
    }
    var mul = PQMath.makeMulTaskPreferWeakFacts(
      (state && state.tableStats) || {},
      (state && state.factStats) || {},
      rng,
      'board-mul',
      mulOpts(state)
    );
    return {
      type: 'mul',
      prompt: mul.prompt,
      answer: mul.answer,
      choices: null,
      hint: '',
      a: mul.a,
      b: mul.b,
      task: mul
    };
  }

  function sameAnswer(prompt, value) {
    if (!prompt) return false;
    if (prompt.type === 'read') {
      var idx = parseInt(value, 10);
      return idx === prompt.answer;
    }
    if (!PQMath || !PQMath.checkAnswer) return String(value) === String(prompt.answer);
    return PQMath.checkAnswer(prompt.answer, value).ok;
  }

  function hintFor(prompt, misses) {
    if (!prompt) return 'Give it another try.';
    if (prompt.type === 'read') {
      if (misses >= 2) return 'It is “' + prompt.choices[prompt.answer] + '”.';
      return prompt.hint || 'Look at the meaning again.';
    }
    if (prompt.task && PQMath.getHint) return PQMath.getHint(prompt.task, misses);
    return 'Give it another try.';
  }

  function notePractice(state, prompt, misses, correct) {
    if (!state || !prompt || !prompt.task || prompt.task.type !== 'mul') return;
    if (prompt.recorded) return;
    if (correct && !misses) {
      PQMath.recordResult(state, prompt.task, true);
      prompt.recorded = true;
    } else if (!correct && misses === 1) {
      PQMath.recordResult(state, prompt.task, false);
      prompt.recorded = true;
    }
  }

  function missResult(game, state) {
    game.misses = (game.misses || 0) + 1;
    notePractice(state, game.prompt, game.misses, false);
    var hint = hintFor(game.prompt, game.misses);
    return {
      ok: false,
      done: false,
      hint: hint,
      message: 'Not yet.',
      game: game
    };
  }

  function makeBoard() {
    var rows = [];
    var r;
    var c;
    for (r = 0; r < ROWS; r++) {
      rows[r] = [];
      for (c = 0; c < COLS; c++) rows[r][c] = 0;
    }
    return rows;
  }

  function cloneBoard(board) {
    return board.map(function (row) { return row.slice(); });
  }

  function lowestRow(board, col) {
    var r;
    for (r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === 0) return r;
    }
    return -1;
  }

  function dropOn(board, col, player) {
    if (col < 0 || col >= COLS) return -1;
    var r = lowestRow(board, col);
    if (r < 0) return -1;
    board[r][col] = player;
    return r;
  }

  function winnerOf(board) {
    var dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    var r;
    var c;
    var d;
    for (r = 0; r < ROWS; r++) {
      for (c = 0; c < COLS; c++) {
        var p = board[r][c];
        if (!p) continue;
        for (d = 0; d < dirs.length; d++) {
          var n = 1;
          var rr = r + dirs[d][0];
          var cc = c + dirs[d][1];
          while (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && board[rr][cc] === p) {
            n += 1;
            rr += dirs[d][0];
            cc += dirs[d][1];
          }
          if (n >= 4) return p;
        }
      }
    }
    for (c = 0; c < COLS; c++) {
      if (board[0][c] === 0) return null;
    }
    return 'draw';
  }

  function validCols(board) {
    var cols = [];
    var c;
    for (c = 0; c < COLS; c++) {
      if (lowestRow(board, c) >= 0) cols.push(c);
    }
    return cols;
  }

  function winningCol(board, player) {
    var cols = validCols(board);
    var i;
    for (i = 0; i < cols.length; i++) {
      var copy = cloneBoard(board);
      dropOn(copy, cols[i], player);
      if (winnerOf(copy) === player) return cols[i];
    }
    return -1;
  }

  /**
   * Scout misses obvious lines often. Higher ranks take a win and block more,
   * and still leave a random step so a careful player can get ahead.
   */
  function aiSkill(grade) {
    grade = clampGrade(grade);
    if (grade <= 1) return { takeWin: 0.35, block: 0.22, center: 0.15, noise: 0.65 };
    if (grade === 2) return { takeWin: 0.72, block: 0.48, center: 0.4, noise: 0.4 };
    if (grade === 3) return { takeWin: 1, block: 0.8, center: 0.55, noise: 0.28 };
    if (grade === 4) return { takeWin: 1, block: 1, center: 0.7, noise: 0.22 };
    return { takeWin: 1, block: 1, center: 0.8, noise: 0.2 };
  }

  function aiChoose(board, grade, rng) {
    rng = rng || Math.random;
    var skill = aiSkill(grade);
    var cols = validCols(board);
    if (!cols.length) return -1;
    var win = winningCol(board, 2);
    var block = winningCol(board, 1);
    var rollWin = rng();
    var rollBlock = rng();
    var rollCenter = rng();
    var rollPick = rng();
    if (win !== -1 && rollWin < skill.takeWin) return win;
    if (block !== -1 && rollBlock < skill.block) return block;
    if (rollCenter < skill.center && cols.indexOf(3) !== -1) return 3;
    return cols[Math.floor(rollPick * cols.length) % cols.length];
  }

  function createFour(state, rng) {
    rng = rng || Math.random;
    var game = {
      id: 'four',
      title: 'Four in a Row',
      grade: gradeOf(state),
      board: makeBoard(),
      turn: 1,
      armed: false,
      misses: 0,
      winner: null,
      finished: false,
      rewarded: false,
      lastAi: -1,
      petName: (state && state.petName) || 'Your pet'
    };
    game.prompt = makePrompt(state, rng, false);
    return game;
  }

  function answerFour(game, value, rng, state) {
    if (!game || game.finished) return { ok: true, done: true, message: 'This round is done.', game: game };
    if (game.armed) {
      return { ok: true, armed: true, message: 'Tap a column to drop your disc.', game: game };
    }
    if (!sameAnswer(game.prompt, value)) return missResult(game, state);
    notePractice(state, game.prompt, game.misses, true);
    game.armed = true;
    game.misses = 0;
    return { ok: true, armed: true, message: 'Yes. Tap a column to drop your disc.', game: game };
  }

  function dropFour(game, col, rng, state) {
    rng = rng || Math.random;
    if (!game || game.finished) return { ok: false, done: true, message: 'This round is done.', game: game };
    if (!game.armed) {
      return {
        ok: false,
        done: false,
        hint: 'Answer first, then you can drop a disc.',
        message: 'Not yet.',
        game: game
      };
    }
    var row = dropOn(game.board, col, 1);
    if (row < 0) {
      return {
        ok: false,
        done: false,
        hint: 'That column is full. Try a different one.',
        message: 'Not yet.',
        game: game
      };
    }
    game.armed = false;
    var win = winnerOf(game.board);
    if (win) {
      game.winner = win;
      game.finished = true;
      var kidLine = win === 1 ? 'You made four in a row.' : (win === 'draw' ? 'The board is full. What a full game.' : (game.petName + ' made four. You can play again whenever you like.'));
      return { ok: true, done: true, winner: win, message: kidLine, game: game };
    }
    var aiCol = aiChoose(game.board, game.grade, rng);
    game.lastAi = aiCol;
    if (aiCol >= 0) dropOn(game.board, aiCol, 2);
    win = winnerOf(game.board);
    game.prompt = makePrompt(state || { courses: { grade: game.grade } }, rng, false);
    if (win) {
      game.winner = win;
      game.finished = true;
      return {
        ok: true,
        done: true,
        winner: win,
        message: win === 1 ? 'You made four in a row.' : (game.petName + ' made four. You can play again whenever you like.'),
        game: game
      };
    }
    return {
      ok: true,
      done: false,
      message: game.petName + ' dropped a disc. Your turn.',
      game: game
    };
  }

  function stepsFromAnswer(answer, boardSize) {
    var n = Math.abs(parseInt(answer, 10));
    if (!isFinite(n)) n = 0;
    var size = boardSize > 1 ? boardSize : HOME;
    var digit = n % 10;
    var mod = n % size;
    var steps = digit > 0 ? digit : mod;
    if (steps > 6) steps = (steps % 6) + 1;
    if (steps < 1) steps = 1;
    return steps;
  }

  function petStep(grade, rng) {
    if (clampGrade(grade) <= 1) return 1;
    return rng() < 0.55 ? 1 : 2;
  }

  function createRace(state, rng) {
    rng = rng || Math.random;
    var game = {
      id: 'race',
      title: 'Pet Race Home',
      grade: gradeOf(state),
      home: HOME,
      pawns: { kid: 0, pet: 0 },
      kidMoves: 0,
      misses: 0,
      finished: false,
      winner: null,
      escort: false,
      rewarded: false,
      lastBump: '',
      petName: (state && state.petName) || 'Your pet'
    };
    game.prompt = makePrompt(state, rng, true);
    return game;
  }

  function land(game, who, steps) {
    var pos = game.pawns[who];
    var next = pos == null ? steps : pos + steps;
    if (next > game.home) next = game.home;
    if (next < 0) next = 0;
    game.pawns[who] = next;
    var other = who === 'kid' ? 'pet' : 'kid';
    if (next !== game.home && next !== 0 && game.pawns[other] != null && game.pawns[other] === next) {
      game.pawns[other] = null;
      return other;
    }
    return '';
  }

  function answerRace(game, value, rng, state) {
    rng = rng || Math.random;
    if (!game || game.finished) return { ok: true, done: true, message: 'You are home.', game: game };
    if (!sameAnswer(game.prompt, value)) return missResult(game, state);
    notePractice(state, game.prompt, game.misses, true);
    var steps = game.prompt.type === 'read'
      ? (game.grade <= 2 ? 2 : 3)
      : stepsFromAnswer(game.prompt.answer, game.home);
    var bumped = land(game, 'kid', steps);
    game.kidMoves += 1;
    if (game.kidMoves >= ESCORT_AFTER && game.pawns.kid !== game.home) {
      game.pawns.kid = game.home;
      game.escort = true;
    }
    var bumpNote = '';
    if (bumped === 'pet') {
      bumpNote = game.petName + ' goes back to the den for a nap.';
      game.lastBump = bumpNote;
    }
    if (game.pawns.kid === game.home) {
      game.finished = true;
      game.winner = 'kid';
      var doneLine = game.escort
        ? 'You made it home. A cozy last step brought you in.'
        : 'You made it home.';
      if (bumpNote) doneLine = bumpNote + ' ' + doneLine;
      return { ok: true, done: true, steps: steps, bumped: bumped, message: doneLine, game: game };
    }
    var petSteps = 0;
    var petBump = '';
    if (bumped !== 'pet') {
      petSteps = petStep(game.grade, rng);
      petBump = land(game, 'pet', petSteps);
    }
    if (petBump === 'kid') {
      bumpNote = 'You go back to the den for a nap. You can step out again on the next answer.';
      game.lastBump = bumpNote;
    }
    game.misses = 0;
    game.prompt = makePrompt(state || { courses: { grade: game.grade, lessonFocus: focusOf(state) } }, rng, true);
    var message = 'Move ' + steps + (steps === 1 ? ' space.' : ' spaces.');
    if (bumpNote) message += ' ' + bumpNote;
    else message += ' ' + game.petName + ' takes a small step.';
    return { ok: true, done: false, steps: steps, petSteps: petSteps, bumped: bumped || petBump, message: message, game: game };
  }

  function createBingo(state, rng) {
    rng = rng || Math.random;
    var grade = gradeOf(state);
    var opts = mulOpts(state);
    var cells = [];
    var guard = 0;
    while (cells.length < 24 && guard < 80) {
      guard += 1;
      var task = PQMath.makeMulTaskPreferWeakFacts(
        (state && state.tableStats) || {},
        (state && state.factStats) || {},
        rng,
        'bingo-' + guard,
        opts
      );
      cells.push({
        answer: task.answer,
        a: task.a,
        b: task.b,
        marked: false,
        free: false
      });
    }
    cells.splice(12, 0, { answer: null, a: 0, b: 0, marked: true, free: true, label: 'Free' });
    var hardest = 0;
    var i;
    for (i = 0; i < cells.length; i++) {
      if (cells[i].answer != null && cells[i].answer > hardest) hardest = cells[i].answer;
    }
    var game = {
      id: 'bingo',
      title: 'Times Bingo',
      grade: grade,
      cells: cells,
      misses: 0,
      done: false,
      rewarded: false,
      hardest: hardest
    };
    dealBingoPrompt(game, rng);
    return game;
  }

  function bingoLines(cells) {
    var lines = [
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
    ];
    var n = 0;
    var i;
    for (i = 0; i < lines.length; i++) {
      var ok = true;
      var k;
      for (k = 0; k < lines[i].length; k++) {
        if (!cells[lines[i][k]].marked) ok = false;
      }
      if (ok) n += 1;
    }
    return n;
  }

  function dealBingoPrompt(game, rng) {
    var open = [];
    var i;
    for (i = 0; i < game.cells.length; i++) {
      if (!game.cells[i].marked && !game.cells[i].free) open.push(game.cells[i]);
    }
    if (!open.length) {
      game.done = true;
      game.prompt = null;
      return;
    }
    var cell = open[Math.floor(rng() * open.length) % open.length];
    game.prompt = {
      type: 'mul',
      prompt: cell.a + ' × ' + cell.b,
      answer: cell.answer,
      a: cell.a,
      b: cell.b,
      choices: null,
      task: { type: 'mul', a: cell.a, b: cell.b, answer: cell.answer, prompt: cell.a + ' × ' + cell.b }
    };
    game.misses = 0;
  }

  function tapBingo(game, index, rng, state) {
    rng = rng || Math.random;
    if (!game || game.done) return { ok: true, done: true, message: 'You made a line.', game: game };
    var cell = game.cells[index];
    if (!cell || !game.prompt) return { ok: false, message: 'Tap a number on the card.', hint: '', game: game };
    if (cell.free || cell.marked) {
      return { ok: false, message: 'That spot is already filled.', hint: 'Look for ' + game.prompt.prompt + '.', game: game };
    }
    if (cell.answer !== game.prompt.answer) {
      game.misses = (game.misses || 0) + 1;
      notePractice(state, game.prompt, game.misses, false);
      return { ok: false, message: 'Not yet.', hint: hintFor(game.prompt, game.misses), game: game };
    }
    notePractice(state, game.prompt, game.misses, true);
    cell.marked = true;
    if (bingoLines(game.cells) > 0) {
      game.done = true;
      return { ok: true, done: true, message: 'You made a line.', game: game };
    }
    dealBingoPrompt(game, rng);
    return { ok: true, done: false, message: 'Marked. Next one.', game: game };
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

  function createMemory(state, rng) {
    rng = rng || Math.random;
    var grade = gradeOf(state);
    var pairs = MEMORY[grade] || MEMORY[2];
    var cards = [];
    var i;
    for (i = 0; i < pairs.length; i++) {
      cards.push({ pair: pairs[i].id, kind: 'word', text: pairs[i].word, up: false, matched: false });
      cards.push({ pair: pairs[i].id, kind: 'mean', text: pairs[i].mean, up: false, matched: false });
    }
    return {
      id: 'memory',
      title: 'Word Match',
      grade: grade,
      cards: shuffle(cards, rng),
      open: [],
      misses: 0,
      needsContinue: false,
      done: false,
      rewarded: false,
      pairs: pairs.length
    };
  }

  function flipMemory(game, index) {
    if (!game || game.done) return { ok: true, done: true, message: 'You matched every word.', game: game };
    if (game.needsContinue) {
      return {
        ok: false,
        needsContinue: true,
        message: 'Turn these two back, then try another pair.',
        hint: 'The words stay on the table.',
        game: game
      };
    }
    var card = game.cards[index];
    if (!card || card.up || card.matched) {
      return { ok: false, message: 'Pick a face-down card.', hint: '', game: game };
    }
    card.up = true;
    game.open.push(index);
    if (game.open.length < 2) {
      return { ok: true, message: 'Now find the one that matches.', game: game };
    }
    var a = game.cards[game.open[0]];
    var b = game.cards[game.open[1]];
    if (a.pair === b.pair && a.kind !== b.kind) {
      a.matched = true;
      b.matched = true;
      game.open = [];
      var all = true;
      var i;
      for (i = 0; i < game.cards.length; i++) {
        if (!game.cards[i].matched) all = false;
      }
      game.done = all;
      return {
        ok: true,
        matched: true,
        done: all,
        message: all ? 'You matched every word.' : 'They match.',
        game: game
      };
    }
    game.needsContinue = true;
    game.misses += 1;
    return {
      ok: false,
      matched: false,
      needsContinue: true,
      message: 'Not a pair yet.',
      hint: 'They will turn back in a moment. Then try two that mean the same thing.',
      game: game
    };
  }

  function memoryContinue(game) {
    if (!game) return null;
    var i;
    for (i = 0; i < game.cards.length; i++) {
      if (!game.cards[i].matched) game.cards[i].up = false;
    }
    game.open = [];
    game.needsContinue = false;
    return game;
  }

  function arraySize(grade, rng) {
    var rows = 2;
    var cols = 2;
    if (grade <= 1) {
      rows = 2;
      cols = 2 + Math.floor(rng() * 2);
    } else if (grade === 2) {
      rows = 2;
      cols = 3 + Math.floor(rng() * 3);
    } else if (grade === 3) {
      rows = 3;
      cols = 3 + Math.floor(rng() * 3);
    } else if (grade === 4) {
      rows = 3 + Math.floor(rng() * 2);
      cols = 4 + Math.floor(rng() * 3);
    } else {
      rows = 4;
      cols = 4 + Math.floor(rng() * 4);
    }
    return { rows: rows, cols: cols };
  }

  function arrayStory(game) {
    var pet = game.petName || 'Your pet';
    return pet + ' wants ' + game.rows + ' rows of ' + game.cols + ' ' + game.treat + '.';
  }

  function createArray(state, rng) {
    rng = rng || Math.random;
    var grade = gradeOf(state);
    var goal = 3 + Math.floor(rng() * 3);
    var size = arraySize(grade, rng);
    var treat = 'berry treats';
    if (state && state.petId === 'puppy') treat = 'bone treats';
    else if (state && state.petId === 'kitten') treat = 'fish treats';
    else if (state && state.petId === 'owl') treat = 'seed treats';
    var game = {
      id: 'array',
      title: 'Array Builder',
      grade: grade,
      rows: size.rows,
      cols: size.cols,
      built: [],
      done: false,
      rewarded: false,
      goal: goal,
      round: 0,
      roundClear: false,
      fact: '',
      treat: treat,
      petName: (state && state.petName) || 'Your pet',
      pulse: null,
      hardest: size.rows * size.cols
    };
    game.story = arrayStory(game);
    game.prompt = {
      type: 'array',
      prompt: game.story,
      answer: size.rows * size.cols
    };
    return game;
  }

  function arrayHasMore(game) {
    return !!(game && (game.round || 0) + 1 < (game.goal || 1));
  }

  function arrayAdvance(game, rng) {
    if (!game) return game;
    rng = rng || Math.random;
    game.round = (game.round || 0) + 1;
    if (game.round >= (game.goal || 1)) {
      game.done = true;
      return game;
    }
    var size = arraySize(game.grade, rng);
    game.rows = size.rows;
    game.cols = size.cols;
    game.hardest = Math.max(game.hardest || 0, size.rows * size.cols);
    game.built = [];
    game.done = false;
    game.roundClear = false;
    game.fact = '';
    game.pulse = null;
    game.story = arrayStory(game);
    game.prompt = {
      type: 'array',
      prompt: game.story,
      answer: size.rows * size.cols
    };
    return game;
  }

  function arrayAct(game, action) {
    if (!game || game.done) return { ok: true, done: true, message: 'That array matches.', game: game };
    var last;
    if (action === 'dot') {
      if (!game.built.length) game.built.push(0);
      last = game.built.length - 1;
      if (game.built[last] >= game.cols) {
        return {
          ok: false,
          message: 'Not yet.',
          hint: 'That row is full. Start the next row.',
          game: game
        };
      }
      game.built[last] += 1;
      game.pulse = { row: last, col: game.built[last] - 1 };
      return { ok: true, message: 'A treat joins the row.', game: game };
    }
    if (action === 'row') {
      if (game.built.length >= game.rows) {
        return {
          ok: false,
          message: 'Not yet.',
          hint: 'You already have ' + game.rows + ' rows.',
          game: game
        };
      }
      if (game.built.length && game.built[game.built.length - 1] < game.cols) {
        return {
          ok: false,
          message: 'Not yet.',
          hint: 'Fill this row first. It needs ' + game.cols + ' dots.',
          game: game
        };
      }
      game.built.push(0);
      return { ok: true, message: 'A new row is ready.', game: game };
    }
    if (action === 'back') {
      if (!game.built.length) {
        return { ok: true, message: 'Nothing to take back.', game: game };
      }
      last = game.built.length - 1;
      if (game.built[last] > 0) game.built[last] -= 1;
      else game.built.pop();
      return { ok: true, message: 'Took one step back. Your other dots stay.', game: game };
    }
    if (action === 'check') {
      var good = game.built.length === game.rows;
      var i;
      for (i = 0; i < game.built.length; i++) {
        if (game.built[i] !== game.cols) good = false;
      }
      if (!good) {
        return {
          ok: false,
          message: 'Not yet.',
          hint: 'The plan is ' + game.rows + ' rows of ' + game.cols + '.',
          game: game
        };
      }
      game.done = true;
      game.roundClear = true;
      var product = game.rows * game.cols;
      game.fact = game.rows + ' × ' + game.cols + ' = ' + product;
      return {
        ok: true,
        done: true,
        fact: game.fact,
        message: game.fact + '. That is ' + product + ' ' + game.treat + '.',
        game: game
      };
    }
    return { ok: false, message: 'Try one of the buttons.', hint: '', game: game };
  }

  function reward(won) {
    var coins = won ? 6 : 3;
    return {
      coins: coins,
      mayDecor: !!won,
      message: won
        ? coins + ' coins go in the bank.'
        : 'You played the whole way. ' + coins + ' coins go in the bank.'
    };
  }

  function forPlace(state, placeId) {
    if (!HOSTS[placeId]) return [];
    if (!PQWorld || !PQWorld.isPlaceOpen || !PQWorld.isPlaceOpen(state, placeId)) return [];
    return HOSTS[placeId].map(function (meta) {
      return { id: meta.id, title: meta.title, button: meta.button, place: placeId };
    });
  }

  function create(id, state, rng) {
    rng = rng || Math.random;
    if (id === 'four') return createFour(state, rng);
    if (id === 'race') return createRace(state, rng);
    if (id === 'bingo') return createBingo(state, rng);
    if (id === 'memory') return createMemory(state, rng);
    if (id === 'array') return createArray(state, rng);
    return null;
  }

  function answer(game, value, rng, state) {
    if (!game) return { ok: false, message: 'Pick a game first.', game: game };
    if (game.id === 'four') return answerFour(game, value, rng, state);
    if (game.id === 'race') return answerRace(game, value, rng, state);
    return { ok: false, message: 'Use the board for this one.', game: game };
  }

  return {
    HOSTS: HOSTS,
    HOME: HOME,
    forPlace: forPlace,
    create: create,
    answer: answer,
    dropFour: dropFour,
    tapBingo: tapBingo,
    FLIP_BACK_MS: FLIP_BACK_MS,
    flipMemory: flipMemory,
    memoryContinue: memoryContinue,
    arrayAct: arrayAct,
    arrayHasMore: arrayHasMore,
    arrayAdvance: arrayAdvance,
    stepsFromAnswer: stepsFromAnswer,
    petStep: petStep,
    reward: reward,
    pickKind: pickKind,
    readingPrompt: readingPrompt,
    readBank: readBank,
    aiChoose: aiChoose,
    aiSkill: aiSkill,
    winnerOf: winnerOf,
    makeBoard: makeBoard,
    dropOn: dropOn,
    bingoLines: bingoLines,
    makePrompt: makePrompt
  };
});
