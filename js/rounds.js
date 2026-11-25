/**
 * Pet Quests — short reading and times-table rounds.
 * Math facts come from the shared adaptive picker.
 * A miss is a hint and another try. Nothing is taken away.
 */
(function (root, factory) {
  var api = factory(
    typeof require !== 'undefined' ? require('./math.js') : root.PQMath,
    typeof require !== 'undefined' ? require('./world.js') : root.PQWorld,
    typeof require !== 'undefined' ? require('./reading.js') : root.PQReading
  );
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PQRounds = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (PQMath, PQWorld, PQReading) {
  'use strict';

  var GAMES = [
    {
      id: 'scoop',
      title: 'Kibble Scoop',
      button: 'Kibble scoop',
      skill: 'mul',
      places: ['bakery', 'farm', 'parlor'],
      unlock: 'Opens with the bakery, and also at the farm and the game hall.'
    },
    {
      id: 'family',
      title: 'Fact Family House',
      button: 'Fact family',
      skill: 'mul',
      places: ['school', 'parlor'],
      unlock: 'Opens with the schoolhouse, and also in the game hall.'
    },
    {
      id: 'garden',
      title: 'Garden Trail',
      button: 'Garden trail',
      skill: 'mul',
      places: ['garden', 'parlor'],
      unlock: 'Opens with the garden, and also in the game hall.'
    },
    {
      id: 'fetch',
      title: 'Fetch',
      button: 'Fetch',
      skill: 'mul',
      places: ['playground', 'parlor'],
      unlock: 'Opens with the playground, and also in the game hall.'
    },
    {
      id: 'order',
      title: 'Story Order',
      button: 'Story order',
      skill: 'read',
      places: ['library', 'parlor'],
      unlock: 'Opens with the library, and also in the game hall.'
    },
    {
      id: 'cloze',
      title: 'Word Fit',
      button: 'Word fit',
      skill: 'read',
      places: ['library', 'parlor'],
      unlock: 'Opens with the library, and also in the game hall.'
    },
    {
      id: 'clue',
      title: 'Pet Clues',
      button: 'Pet clues',
      skill: 'read',
      places: ['friend', 'zoo', 'parlor'],
      unlock: 'Opens with the friend house, the zoo, and the game hall.'
    },
    {
      id: 'paper',
      title: 'Pet Newspaper',
      button: 'Pet paper',
      skill: 'read',
      places: ['library', 'bookstore', 'parlor'],
      unlock: 'Opens with the library, and also at the bookstore and the game hall.'
    }
  ];

  var TABLE_WORD = ['', 'ones', 'twos', 'threes', 'fours', 'fives', 'sixes', 'sevens', 'eights', 'nines', 'tens', 'elevens', 'twelves'];

  var ORDER = [
    { id: 'ord-1a', level: 1, lines: ['Pip woke up.', 'He found his red ball.', 'He ran to the yard.'] },
    { id: 'ord-1b', level: 1, lines: ['Mira sat by her bowl.', 'She waited for kibble.', 'Then she ate.'] },
    { id: 'ord-1c', level: 1, lines: ['Bramble sniffed the row.', 'He picked one carrot.', 'He hopped back to his den.'] },
    { id: 'ord-1d', level: 1, lines: ['Fern set a cup on the table.', 'Steam rose from the cup.', 'She sat down to sip.'] },
    { id: 'ord-1e', level: 1, lines: ['Nix opened one eye.', 'The sky grew dark.', 'She flew to a low branch.'] },
    { id: 'ord-1f', level: 1, lines: ['Tess shook off the rain.', 'She found her blue bowl.', 'She took a long drink.'] },
    { id: 'ord-2a', level: 2, lines: ['Maple checked the bakery window.', 'Six rolls cooled on the rack.', 'She saved one roll for Fern.'] },
    { id: 'ord-2b', level: 2, lines: ['Pip walked to the pond.', 'A duck glided past him.', 'He sat still and watched.'] },
    { id: 'ord-2c', level: 2, lines: ['Rain started on the path.', 'Clover hopped under the bench.', 'The ground stayed dry there.'] },
    { id: 'ord-2d', level: 2, lines: ['Tess came home from a walk.', 'She drank from her blue bowl.', 'Drops fell on the mat.'] },
    { id: 'ord-2e', level: 2, lines: ['Mira found a gray feather.', 'She patted it with one paw.', 'The feather slid under the shelf.'] },
    { id: 'ord-2f', level: 2, lines: ['The baker waved from the window.', 'Maple counted the round rolls.', 'She left the biggest roll to cool.'] },
    { id: 'ord-3a', level: 3, lines: ['The station board listed two trains.', 'Maple read the times slowly.', 'She chose the blue train to the pond.'] },
    { id: 'ord-3b', level: 3, lines: ['A note named three pets.', 'Fern matched each clue to a picture.', 'The helper said the pets were heading home.'] },
    { id: 'ord-3c', level: 3, lines: ['The keeper filled the water dish.', 'A rabbit rested by the log.', 'Visitors stayed quiet so it could nap.'] },
    { id: 'ord-3d', level: 3, lines: ['Bramble counted the ripe berries.', 'He left the pale ones to grow.', 'He carried the red ones home.'] },
    { id: 'ord-3e', level: 3, lines: ['The lamp made a warm circle.', 'Nix read one page, then the next.', 'She marked her place with a leaf.'] },
    { id: 'ord-3f', level: 3, lines: ['A helper smiled at the tidy cards.', 'Maple washed her paws.', 'She walked home past the star badge.'] }
  ];

  var CLOZE = [
    { id: 'clz-1a', level: 1, prompt: 'Pip carried the ___ to his bowl.', choices: ['kibble', 'cloud', 'ladder', 'ticket'], answer: 0 },
    { id: 'clz-1b', level: 1, prompt: 'Mira naps on a soft ___.', choices: ['rug', 'engine', 'thunder', 'helmet'], answer: 0 },
    { id: 'clz-1c', level: 1, prompt: 'Bramble hops along the carrot ___.', choices: ['row', 'whistle', 'subway', 'comet'], answer: 0 },
    { id: 'clz-1d', level: 1, prompt: 'Nix sits on a low ___.', choices: ['branch', 'toaster', 'pocket', 'subway'], answer: 0 },
    { id: 'clz-1e', level: 1, prompt: 'Fern pours a warm ___.', choices: ['cup', 'iceberg', 'ladder', 'ticket'], answer: 0 },
    { id: 'clz-1f', level: 1, prompt: 'Pip sleeps in a sunny ___.', choices: ['spot', 'rocket', 'helmet', 'subway'], answer: 0 },
    { id: 'clz-2a', level: 2, prompt: 'Tess drank cool water from her blue ___.', choices: ['bowl', 'kite', 'drum', 'subway'], answer: 0 },
    { id: 'clz-2b', level: 2, prompt: 'The feather slid under the ___.', choices: ['shelf', 'ocean', 'rocket', 'helmet'], answer: 0 },
    { id: 'clz-2c', level: 2, prompt: 'Clover stayed dry under the wooden ___.', choices: ['bench', 'comet', 'trumpet', 'elevator'], answer: 0 },
    { id: 'clz-2d', level: 2, prompt: 'Maple saved one roll for her ___.', choices: ['friend', 'thunder', 'helmet', 'subway'], answer: 0 },
    { id: 'clz-2e', level: 2, prompt: 'A duck glided across the ___.', choices: ['pond', 'oven', 'closet', 'subway'], answer: 0 },
    { id: 'clz-2f', level: 2, prompt: 'They sat on a bench and shared a small ___.', choices: ['apple', 'comet', 'helmet', 'subway'], answer: 0 },
    { id: 'clz-3a', level: 3, prompt: 'The board listed the train ___.', choices: ['time', 'thunder', 'pocket', 'marble'], answer: 0 },
    { id: 'clz-3b', level: 3, prompt: 'A detail is a small ___ you can notice.', choices: ['clue', 'thunder', 'helmet', 'subway'], answer: 0 },
    { id: 'clz-3c', level: 3, prompt: 'The rabbit home at the zoo is its ___.', choices: ['habitat', 'trumpet', 'rocket', 'subway'], answer: 0 },
    { id: 'clz-3d', level: 3, prompt: 'Maple marked her place with a paper ___.', choices: ['leaf', 'engine', 'helmet', 'comet'], answer: 0 },
    { id: 'clz-3e', level: 3, prompt: 'They let other riders step off ___.', choices: ['first', 'never', 'backward', 'upside'], answer: 0 },
    { id: 'clz-3f', level: 3, prompt: 'The main idea is what the story is mostly ___.', choices: ['about', 'backward', 'upside', 'never'], answer: 0 }
  ];

  var CLUE = [
    { id: 'clu-1a', level: 1, prompt: 'This pet has long ears and nibbles carrots.', choices: ['Bramble the bunny', 'Pip the puppy', 'Nix the owl', 'Mira the kitten'], answer: 0 },
    { id: 'clu-1b', level: 1, prompt: 'This pet is a small dog who loves a red ball.', choices: ['Pip the puppy', 'Nix the owl', 'Fern the fox', 'Bramble the bunny'], answer: 0 },
    { id: 'clu-1c', level: 1, prompt: 'This pet flies at night and sits on a branch.', choices: ['Nix the owl', 'Tess the terrier', 'Bramble the bunny', 'Pip the puppy'], answer: 0 },
    { id: 'clu-1d', level: 1, prompt: 'This pet has soft paws and pats a feather.', choices: ['Mira the kitten', 'Nix the owl', 'Bramble the bunny', 'Fern the fox'], answer: 0 },
    { id: 'clu-1e', level: 1, prompt: 'This pet is a fox who shares a warm cup.', choices: ['Fern the fox', 'Pip the puppy', 'Nix the owl', 'Bramble the bunny'], answer: 0 },
    { id: 'clu-1f', level: 1, prompt: 'This pet is a terrier with a blue water bowl.', choices: ['Tess the terrier', 'Nix the owl', 'Bramble the bunny', 'Fern the fox'], answer: 0 },
    { id: 'clu-2a', level: 2, prompt: 'This pet drinks from a blue bowl after a long walk.', choices: ['Tess the terrier', 'Nix the owl', 'Bramble the bunny', 'Mira the kitten'], answer: 0 },
    { id: 'clu-2b', level: 2, prompt: 'This pet hops under a bench when rain starts.', choices: ['Clover the bunny', 'Pip the puppy', 'Nix the owl', 'Tess the terrier'], answer: 0 },
    { id: 'clu-2c', level: 2, prompt: 'This pet glides on the pond and leaves a quiet wake.', choices: ['The duck', 'Mira the kitten', 'Fern the fox', 'Pip the puppy'], answer: 0 },
    { id: 'clu-2d', level: 2, prompt: 'This pet counts ripe berries and leaves the pale ones.', choices: ['Bramble the bunny', 'Nix the owl', 'Tess the terrier', 'Fern the fox'], answer: 0 },
    { id: 'clu-2e', level: 2, prompt: 'This pet waits by the bakery window for a warm roll.', choices: ['Maple the cat', 'Nix the owl', 'The duck', 'Bramble the bunny'], answer: 0 },
    { id: 'clu-2f', level: 2, prompt: 'This pet pats a feather and waits beside a shelf.', choices: ['Mira the kitten', 'The duck', 'Nix the owl', 'Bramble the bunny'], answer: 0 },
    { id: 'clu-3a', level: 3, prompt: 'This pet stays up when the sky turns purple and calls across a field.', choices: ['Nix the owl', 'Pip the puppy', 'Bramble the bunny', 'Tess the terrier'], answer: 0 },
    { id: 'clu-3b', level: 3, prompt: 'This pet keeps a red ball in a sunny patch by the garden wall.', choices: ['Pip the puppy', 'Nix the owl', 'Fern the fox', 'The duck'], answer: 0 },
    { id: 'clu-3c', level: 3, prompt: 'The note lists long soft ears and a calm hop. This pet is heading home.', choices: ['Bramble the bunny', 'Pip the puppy', 'Nix the owl', 'Tess the terrier'], answer: 0 },
    { id: 'clu-3d', level: 3, prompt: 'This pet rests by a log while the water dish stays full.', choices: ['The rabbit', 'Pip the puppy', 'Nix the owl', 'Fern the fox'], answer: 0 },
    { id: 'clu-3e', level: 3, prompt: 'This pet reads by a warm lamp and marks the page with a leaf.', choices: ['Maple the cat', 'Pip the puppy', 'The duck', 'Bramble the bunny'], answer: 0 },
    { id: 'clu-3f', level: 3, prompt: 'This pet watches puddles grow and keeps low under a bench.', choices: ['Clover the bunny', 'Pip the puppy', 'Nix the owl', 'The duck'], answer: 0 }
  ];

  var PAPER = [
    { id: 'pap-1a', level: 1, story: 'The bakery opened early. Six warm rolls sat on the rack.', choices: ['Warm rolls at the bakery', 'A storm on the pond', 'The train is late', 'A lost red boot'], answer: 0 },
    { id: 'pap-1b', level: 1, story: 'Pip found his ball in the yard. He ran with it.', choices: ['Pip plays with his ball', 'Ducks on the pond', 'A quiet library', 'Rain in the kitchen'], answer: 0 },
    { id: 'pap-1c', level: 1, story: 'Bramble sniffed three carrots. He picked the longest one.', choices: ['Bramble picks a carrot', 'A night owl flies', 'The shop is closed', 'A blue train waits'], answer: 0 },
    { id: 'pap-1d', level: 1, story: 'Mira patted a gray feather. It slid under the shelf.', choices: ['Mira finds a feather', 'Rolls in the oven', 'A goat at the farm', 'Stars over the sea'], answer: 0 },
    { id: 'pap-1e', level: 1, story: 'Clover hopped under the bench when the rain began.', choices: ['Clover stays dry', 'A kite in the shop', 'The clock is wrong', 'Fish in a tank'], answer: 0 },
    { id: 'pap-1f', level: 1, story: 'Nix stretched her wings on a low branch. The sky turned purple.', choices: ['An owl at dusk', 'A red ball rolls', 'Soup boils over', 'The gate is locked'], answer: 0 },
    { id: 'pap-2a', level: 2, story: 'Maple read the station board. The blue train stopped by the pond.', choices: ['The blue train to the pond', 'A bunny eats hay', 'The bakery is dark', 'A lost drum'], answer: 0 },
    { id: 'pap-2b', level: 2, story: 'Tess came back from a walk and drank from her blue bowl.', choices: ['A drink after a walk', 'Owls in the daytime', 'A closed museum', 'Snow on the slide'], answer: 0 },
    { id: 'pap-2c', level: 2, story: 'The keeper filled a water dish. A rabbit rested by a log.', choices: ['A quiet rabbit at the zoo', 'Trains leave early', 'A torn kite', 'Soup on the stove'], answer: 0 },
    { id: 'pap-2d', level: 2, story: 'Fern matched three clues to three pets. Each pet was heading home.', choices: ['Pets matched to clues', 'A race in the rain', 'The pond froze', 'A broken bell'], answer: 0 },
    { id: 'pap-2e', level: 2, story: 'Bramble left the pale berries to grow. He took the red ones home.', choices: ['Red berries go home', 'A night at the firehouse', 'The shop bell rings', 'A paper boat sinks'], answer: 0 },
    { id: 'pap-2f', level: 2, story: 'You toss one pebble. It makes a small ring on the pond.', choices: ['A pebble on the pond', 'The bakery burns', 'A train skips town', 'The lamp goes out'], answer: 0 },
    { id: 'pap-3a', level: 3, story: 'Maple read about a rainy path. She told Fern the path was wet, and they still shared the story.', choices: ['Friends share a rainy-day story', 'The bakery sells soup', 'A duck learns to drive', 'The clock falls down'], answer: 0 },
    { id: 'pap-3b', level: 3, story: 'A small boat in the corner of the picture told Maple the harbor was near. The storm was easy to see. The boat was the detail.', choices: ['A small boat shows the harbor', 'The pet misses the bus', 'A drum is too loud', 'The farm gate locks'], answer: 0 },
    { id: 'pap-3c', level: 3, story: 'Other riders stepped off the blue train first. Then Maple and Fern found two seats by a window.', choices: ['A calm ride by the window', 'The zoo closes early', 'A carrot goes missing', 'The lamp will not light'], answer: 0 },
    { id: 'pap-3d', level: 3, story: 'The nature trail was soft. A bird called once and flew to a tree. Maple only looked at the nest.', choices: ['A quiet look at a nest', 'The market runs out of bread', 'A boot lands in soup', 'The slide is broken'], answer: 0 },
    { id: 'pap-3e', level: 3, story: 'The game hall lamp made a warm circle on the green table. Cards waited, and nobody had to hurry.', choices: ['A calm game at the hall', 'The pond floods the town', 'A train skips the station', 'The carrot row freezes'], answer: 0 },
    { id: 'pap-3f', level: 3, story: 'Maple finished her page. A leaf sticker went in the album. A quiet afternoon was enough.', choices: ['A sticker for a quiet page', 'The pond goes dry', 'A boot in the soup', 'The clock runs backward'], answer: 0 }
  ];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function clampGrade(grade) {
    var n = parseInt(grade, 10);
    if (!(n >= 1 && n <= 5)) return 2;
    return n;
  }

  function gradeOf(state) {
    return clampGrade(state && state.courses && state.courses.grade);
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

  function meta(id) {
    var i;
    for (i = 0; i < GAMES.length; i++) if (GAMES[i].id === id) return GAMES[i];
    return null;
  }

  function isRound(id) {
    return !!meta(id);
  }

  function numChoices(answer, rng) {
    var vals = [answer];
    var d = 1;
    while (vals.length < 4 && d < 40) {
      if (answer - d >= 0 && vals.indexOf(answer - d) === -1) vals.push(answer - d);
      if (vals.length < 4 && vals.indexOf(answer + d) === -1) vals.push(answer + d);
      d += 1;
    }
    return shuffle(vals.slice(0, 4), rng).map(function (n) {
      return { label: String(n), value: n, ok: n === answer };
    });
  }

  function mulOpts(state) {
    var grade = gradeOf(state);
    var selected = (state && state.courses && state.courses.tables) || [];
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
      introduced: [],
      grade: grade,
      tableStats: (state && state.tableStats) || {},
      dayIndex: 3,
      deferStory: true,
      state: state || null,
      petName: state && state.petName
    };
  }

  function pullFact(state, rng, batch) {
    var opts = mulOpts(state);
    opts.batch = batch || [];
    var task = PQMath.makeMulTaskPreferWeakFacts(
      (state && state.tableStats) || {},
      (state && state.factStats) || {},
      rng,
      'round',
      opts
    );
    return { a: task.a, b: task.b, product: task.a * task.b };
  }

  function mathNeed(grade) {
    return grade <= 2 ? 4 : 5;
  }

  function freshFact(pair) {
    return { a: pair.a, b: pair.b, recorded: false };
  }

  function base(id, state) {
    var info = meta(id);
    return {
      id: id,
      title: info ? info.title : 'Game',
      skill: info ? info.skill : '',
      grade: gradeOf(state),
      misses: 0,
      reveal: null,
      hint: '',
      done: false,
      rewarded: false,
      solved: 0,
      choices: [],
      batch: []
    };
  }

  function placeOpen(state, id) {
    return PQWorld && PQWorld.isPlaceOpen && PQWorld.isPlaceOpen(state, id);
  }

  function forPlace(state, placeId) {
    if (!placeOpen(state, placeId)) return [];
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

  function factStats(state, table, factor) {
    if (!state || !state.factStats) return null;
    return state.factStats[PQMath.factKey(table, factor, '×')] || null;
  }

  /**
   * A flower is a fact she can trust: the shared mastery rule, or three
   * solid tries. One miss does not block the garden forever.
   */
  function bloomed(fs) {
    if (!fs || !fs.attempts || !fs.correct) return false;
    if (PQMath.factIsMastered(fs)) return true;
    return fs.attempts >= 3 && (fs.correct / fs.attempts) >= 0.8;
  }

  function cellKind(state, table, factor, maxFactor) {
    if (factor > maxFactor) return 'later';
    var fs = factStats(state, table, factor);
    if (bloomed(fs)) return 'bloom';
    if (fs && fs.correct) return 'sprout';
    return 'empty';
  }

  function tableComplete(state, table, maxFactor) {
    var b;
    for (b = 1; b <= maxFactor; b++) {
      if (!bloomed(factStats(state, table, b))) return false;
    }
    return true;
  }

  function noteSticker(state, game, table, wasComplete) {
    if (wasComplete || !game.pool || game.pool.indexOf(table) === -1) return;
    if (!(table >= 1 && table <= 12)) return;
    if (!tableComplete(state, table, game.maxFactor)) return;
    var id = 'table-bloom-' + table;
    if (PQWorld.hasPrize(state, id)) return;
    var name = 'a ' + TABLE_WORD[table] + '-table sticker';
    PQWorld.grantPrize(state, { id: id, name: name, kind: 'sticker', once: true });
    game.sticker = name;
  }

  function practice(state, game, correct) {
    var fact = game.fact;
    if (!state || !fact || game.skill !== 'mul') return;
    var task = {
      type: 'mul',
      a: fact.a,
      b: fact.b,
      answer: fact.a * fact.b,
      prompt: fact.a + ' × ' + fact.b,
      format: 'eq'
    };
    var beforeA = tableComplete(state, fact.a, game.maxFactor);
    var beforeB = tableComplete(state, fact.b, game.maxFactor);
    if (correct) {
      if (!fact.recorded) {
        PQMath.recordResult(state, task, true);
        PQMath.clearRecheck(state, task);
        fact.recorded = true;
      } else if (game.misses > 0 && PQMath.noteSlow) {
        PQMath.noteSlow(state, task);
      }
      noteSticker(state, game, fact.a, beforeA);
      if (fact.b !== fact.a) noteSticker(state, game, fact.b, beforeB);
      return;
    }
    if (!fact.recorded && game.misses === 1) {
      PQMath.recordResult(state, task, false);
      fact.recorded = true;
    }
  }

  function correctLabel(game) {
    var i;
    for (i = 0; i < (game.choices || []).length; i++) {
      if (game.choices[i].ok) return game.choices[i].label;
    }
    return '';
  }

  function mulTask(game) {
    var fact = game.fact || { a: game.a, b: game.b };
    return {
      type: 'mul',
      a: fact.a,
      b: fact.b,
      answer: fact.a * fact.b,
      prompt: fact.a + ' × ' + fact.b,
      format: 'eq'
    };
  }

  function hintFor(game) {
    if (game.kind === 'div') {
      if (game.misses >= 2) return 'It is ' + game.answer + '. Tap ' + game.answer + '.';
      return 'How many groups of ' + game.divA + ' are in ' + game.divProduct + '?';
    }
    if (game.skill === 'read') {
      if (game.misses >= 2) return 'It is “' + correctLabel(game) + '”. Tap that one.';
      return game.softHint || 'Take another look.';
    }
    return PQMath.getHint(mulTask(game), game.misses >= 2 ? 2 : 1);
  }

  function applyFact(game, pair, rng) {
    game.fact = freshFact(pair);
    game.a = pair.a;
    game.b = pair.b;
    game.kind = 'mul';
    game.answer = pair.product;
    game.choices = numChoices(pair.product, rng);
    game.promptText = pair.a + ' × ' + pair.b;
  }

  function showScoop(game, pair, rng) {
    applyFact(game, pair, rng);
    var groups = pair.a;
    var each = pair.b;
    if (groups > 5 && each <= 5) {
      groups = pair.b;
      each = pair.a;
    }
    game.groups = groups;
    game.each = each;
    game.promptText = groups + ' bowls, with ' + each + ' kibbles in each. How many kibbles?';
  }

  function showFetch(game, pair, rng) {
    applyFact(game, pair, rng);
    game.promptText = pair.a + ' × ' + pair.b;
    game.lead = 'Where does the ball land?';
  }

  function showGarden(game, pair, rng) {
    applyFact(game, pair, rng);
    game.promptText = pair.a + ' × ' + pair.b;
    game.lead = 'Plant this fact on the trail.';
  }

  function showMath(game, state, rng) {
    var pair = pullFact(state, rng, game.batch);
    if (game.id === 'scoop') showScoop(game, pair, rng);
    else if (game.id === 'garden') showGarden(game, pair, rng);
    else showFetch(game, pair, rng);
  }

  function familyStep(kind, a, b, prompt, answer) {
    return {
      kind: kind,
      a: a,
      b: b,
      prompt: prompt,
      answer: answer,
      fact: freshFact({ a: a, b: b, product: a * b })
    };
  }

  function buildHouse(state, rng, batch, grade) {
    var pair = pullFact(state, rng, batch);
    var a = pair.a;
    var b = pair.b;
    var product = pair.product;
    var steps = [familyStep('mul', a, b, a + ' × ' + b, product)];
    if (a !== b) steps.push(familyStep('mul', b, a, b + ' × ' + a, product));
    if (grade >= 3) {
      steps.push(familyStep('div', a, b, product + ' ÷ ' + a, b));
    }
    return { steps: steps, at: 0 };
  }

  function showFamily(game, rng) {
    var house = game.houses[game.house];
    var step = house.steps[house.at];
    game.fact = step.fact;
    game.a = step.fact.a;
    game.b = step.fact.b;
    game.kind = step.kind;
    game.answer = step.answer;
    game.promptText = step.prompt;
    game.choices = numChoices(step.answer, rng);
    game.divA = step.a;
    game.divProduct = step.a * step.b;
    game.houseCount = game.houses.length;
    game.doorAt = house.at;
    game.doorTotal = house.steps.length;
  }

  function bankFor(id) {
    if (id === 'order') return ORDER;
    if (id === 'cloze') return CLOZE;
    if (id === 'clue') return CLUE;
    return PAPER;
  }

  function pickItems(bank, state, rng, count) {
    var used = (state && state.readingUsedIds) || [];
    var fresh = [];
    var i;
    for (i = 0; i < bank.length; i++) {
      if (used.indexOf(bank[i].id) === -1) fresh.push(bank[i]);
    }
    var pool = fresh.length ? fresh.slice() : bank.slice();
    var chosen = [];
    var guard = 0;
    while (chosen.length < count && pool.length && guard < 40) {
      guard += 1;
      var pick = pool[Math.floor(rng() * pool.length) % pool.length];
      var next = [];
      for (i = 0; i < pool.length; i++) if (pool[i].id !== pick.id) next.push(pool[i]);
      pool = next;
      chosen.push(pick);
      if (state && PQReading && PQReading.rememberRead) PQReading.rememberRead(state, pick.id);
    }
    return chosen;
  }

  function showRead(game, rng) {
    var item = game.items[game.index];
    game.kind = 'read';
    game.story = '';
    game.built = [];
    game.softHint = 'Take another look.';
    if (game.id === 'order') {
      if (!item.next) item.next = 0;
      var left = [];
      var i;
      for (i = item.next; i < item.lines.length; i++) left.push(i);
      game.choices = shuffle(left, rng).map(function (idx) {
        return { label: item.lines[idx], value: idx, ok: idx === item.next };
      });
      game.promptText = item.next === 0 ? 'What happens first?' : 'What happens next?';
      game.built = item.lines.slice(0, item.next);
      game.softHint = 'Look for what happens next in time.';
      game.speak = 'The lines are. ' + game.choices.map(function (c) { return c.label; }).join(' ');
      return;
    }
    var opts = item.choices.map(function (label, idx) {
      return { label: label, value: idx, ok: idx === item.answer };
    });
    game.choices = shuffle(opts, rng);
    if (game.id === 'cloze') {
      game.promptText = item.prompt;
      game.softHint = 'Which word makes sense in the sentence?';
      game.speak = item.prompt.replace('___', 'blank');
    } else if (game.id === 'clue') {
      game.promptText = item.prompt;
      game.softHint = 'Match the clue to the pet it describes.';
      game.speak = item.prompt;
    } else {
      game.story = item.story;
      game.promptText = 'Which headline fits?';
      game.softHint = 'The headline tells the main idea.';
      game.speak = item.story;
    }
  }

  function create(id, state, rng) {
    rng = rng || Math.random;
    if (!meta(id)) return null;
    var info = meta(id);
    var game = base(id, state);
    var grade = game.grade;
    if (info.skill === 'mul') {
      var opts = mulOpts(state);
      game.pool = opts.pool.slice();
      game.maxFactor = PQMath.gradeProfile(grade).full;
      game.need = mathNeed(grade);
      if (id === 'family') {
        game.houses = [buildHouse(state, rng, game.batch, grade), buildHouse(state, rng, game.batch, grade)];
        game.house = 0;
        game.need = 0;
        var h;
        for (h = 0; h < game.houses.length; h++) game.need += game.houses[h].steps.length;
        showFamily(game, rng);
      } else {
        showMath(game, state, rng);
      }
      return game;
    }
    var level = PQReading && PQReading.levelForGrade ? PQReading.levelForGrade(grade) : 1;
    var bank = bankFor(id).filter(function (item) { return item.level === level; });
    if (!bank.length) bank = bankFor(id).slice();
    game.items = pickItems(bank, state, rng, 3);
    game.index = 0;
    game.need = game.items.length;
    showRead(game, rng);
    return game;
  }

  function advanceMath(game, state, rng) {
    game.solved += 1;
    if (game.solved >= game.need) {
      game.done = true;
      game.choices = [];
      return;
    }
    if (game.id === 'family') {
      var house = game.houses[game.house];
      house.at += 1;
      if (house.at >= house.steps.length) {
        game.house += 1;
        if (game.house >= game.houses.length) {
          game.done = true;
          game.choices = [];
          return;
        }
      }
      showFamily(game, rng);
      return;
    }
    showMath(game, state, rng);
  }

  function advanceRead(game, rng) {
    var item = game.items[game.index];
    if (game.id === 'order') {
      item.next = (item.next || 0) + 1;
      if (item.next < item.lines.length) {
        showRead(game, rng);
        return;
      }
    }
    game.solved += 1;
    game.index += 1;
    if (game.index >= game.items.length) {
      game.done = true;
      game.choices = [];
      return;
    }
    showRead(game, rng);
  }

  function answer(game, value, rng, state) {
    rng = rng || Math.random;
    if (!game) return { ok: false, message: 'Pick a game first.', game: game };
    if (game.done) return { ok: true, done: true, message: 'You finished this round.', game: game };
    var idx = parseInt(value, 10);
    var choice = game.choices && game.choices[idx];
    if (!choice) return { ok: false, message: 'Tap one of the choices.', hint: '', game: game };
    if (!choice.ok) {
      if (game.misses < 2) game.misses += 1;
      var spot = 0;
      var i;
      for (i = 0; i < game.choices.length; i++) if (game.choices[i].ok) spot = i;
      game.reveal = game.misses >= 2 ? spot : null;
      practice(state, game, false);
      var hint = hintFor(game);
      game.hint = hint;
      return { ok: false, done: false, message: 'Not yet.', hint: hint, game: game };
    }
    practice(state, game, true);
    var sticker = game.sticker ? (' ' + game.sticker + ' is yours.') : '';
    game.sticker = '';
    game.misses = 0;
    game.reveal = null;
    game.hint = '';
    if (game.skill === 'read') advanceRead(game, rng);
    else advanceMath(game, state, rng);
    if (game.done) {
      return { ok: true, done: true, message: 'You finished this round.' + sticker, game: game };
    }
    return { ok: true, done: false, message: 'Yes.' + sticker, game: game };
  }

  function choiceHtml(game) {
    return (game.choices || []).map(function (choice, i) {
      var cls = 'choice-btn' + (game.reveal === i ? ' reveal-correct' : '');
      return '<button type="button" class="' + cls + '" data-act="round-choice" data-idx="' + i + '">' +
        esc(choice.label) + '</button>';
    }).join('');
  }

  function progress(game) {
    var now = Math.min((game.solved || 0) + 1, game.need || 1);
    return now + ' of ' + (game.need || 1);
  }

  function bowlHtml(game) {
    var n = Math.min(game.groups || 1, 5);
    var bowls = '';
    var i;
    var d;
    for (i = 0; i < n; i++) {
      var dots = '';
      var show = Math.min(game.each || 0, 4);
      for (d = 0; d < show; d++) dots += '<i></i>';
      bowls += '<span class="kibble-bowl" aria-hidden="true">' + dots + '</span>';
    }
    var more = (game.groups || 0) > n ? '<span class="kibble-more">+' + ((game.groups || 0) - n) + '</span>' : '';
    return '<div class="bowl-row">' + bowls + more + '</div>';
  }

  function doorHtml(game) {
    var doors = '';
    var i;
    for (i = 0; i < (game.doorTotal || 0); i++) {
      var cls = i < game.doorAt ? ' done' : (i === game.doorAt ? ' now' : '');
      doors += '<span class="fact-door' + cls + '" aria-hidden="true"></span>';
    }
    return '<div class="door-row">' + doors + '</div>';
  }

  function gardenHtml(game, state) {
    var cells = '';
    var factor;
    for (factor = 1; factor <= 12; factor++) {
      var kind = cellKind(state, game.a, factor, game.maxFactor || 12);
      var now = factor === game.b ? ' now' : '';
      cells += '<i class="bloom ' + kind + now + '" aria-label="' + game.a + ' times ' + factor + ' ' + kind + '"></i>';
    }
    var dots = '';
    var pool = game.pool || [];
    var t;
    for (t = 0; t < pool.length; t++) {
      var table = pool[t];
      var full = tableComplete(state, table, game.maxFactor || 12) ? ' full' : '';
      var on = table === game.a ? ' on' : '';
      dots += '<i class="table-dot' + on + full + '" aria-label="table ' + table + '"></i>';
    }
    var flowers = 0;
    for (factor = 1; factor <= (game.maxFactor || 12); factor++) {
      if (cellKind(state, game.a, factor, game.maxFactor || 12) === 'bloom') flowers += 1;
    }
    return '<p class="week-hint">Trail ' + progress(game) + ' · ' + flowers + ' flowers in the ' + game.a + 's</p>' +
      '<div class="bloom-row">' + cells + '</div>' +
      '<div class="table-dots">' + dots + '</div>';
  }

  function readBtn(game) {
    if (!game.speak || game.skill !== 'read') return '';
    var audio = typeof PQAudio !== 'undefined' ? PQAudio : null;
    if (audio && audio.canSpeak && !audio.canSpeak()) return '';
    return '<button type="button" class="btn secondary round-read" data-act="round-speak">🔊 Read</button>';
  }

  function markup(game, state) {
    if (!game) return '';
    if (game.done) return '<p class="lede">You finished this round.</p>';
    var body = '';
    if (game.id === 'scoop') {
      body = bowlHtml(game) +
        '<p class="week-hint">Scoop ' + progress(game) + '</p>' +
        '<h2 class="question">' + esc(game.promptText) + '</h2>' +
        '<div class="choices round-choices grid-2">' + choiceHtml(game) + '</div>';
    } else if (game.id === 'family') {
      body = doorHtml(game) +
        '<p class="week-hint">House ' + ((game.house || 0) + 1) + ' of ' + (game.houseCount || 1) + '</p>' +
        '<h2 class="question">' + esc(game.promptText) + '</h2>' +
        '<div class="choices round-choices grid-2">' + choiceHtml(game) + '</div>';
    } else if (game.id === 'garden') {
      body = gardenHtml(game, state) +
        '<h2 class="question">' + esc(game.promptText) + '</h2>' +
        '<div class="choices round-choices grid-2">' + choiceHtml(game) + '</div>';
    } else if (game.id === 'fetch') {
      body = '<p class="week-hint">Fetch ' + progress(game) + '</p>' +
        '<h2 class="question">' + esc(game.promptText) + '</h2>' +
        '<p class="lede">' + esc(game.lead || '') + '</p>' +
        '<div class="fetch-mats">' + choiceHtml(game) + '</div>';
    } else if (game.id === 'order') {
      var built = (game.built || []).map(function (line) {
        return '<li>' + esc(line) + '</li>';
      }).join('');
      body = '<p class="week-hint">Story ' + progress(game) + '</p>' +
        (built ? '<ol class="order-built">' + built + '</ol>' : '') +
        '<h2 class="question">' + esc(game.promptText) + '</h2>' +
        readBtn(game) +
        '<div class="choices round-choices">' + choiceHtml(game) + '</div>';
    } else if (game.id === 'paper') {
      body = '<p class="week-hint">Paper ' + progress(game) + '</p>' +
        '<p class="passage">' + esc(game.story || '') + '</p>' +
        '<h2 class="question">' + esc(game.promptText) + '</h2>' +
        readBtn(game) +
        '<div class="choices round-choices grid-2">' + choiceHtml(game) + '</div>';
    } else {
      body = '<p class="week-hint">' + (game.id === 'clue' ? 'Clue ' : 'Word ') + progress(game) + '</p>' +
        '<h2 class="question">' + esc(game.promptText) + '</h2>' +
        readBtn(game) +
        '<div class="choices round-choices">' + choiceHtml(game) + '</div>';
    }
    return body;
  }

  function firstPlace(state, game) {
    var i;
    for (i = 0; i < game.places.length; i++) {
      if (game.places[i] === 'parlor') continue;
      if (placeOpen(state, game.places[i])) return game.places[i];
    }
    for (i = 0; i < game.places.length; i++) {
      if (placeOpen(state, game.places[i])) return game.places[i];
    }
    return null;
  }

  function placeTitle(id) {
    var house = PQWorld && PQWorld.getHouse ? PQWorld.getHouse(id) : null;
    return house && house.title ? house.title : 'town';
  }

  /**
   * Tue, Thu, and Sat, one unlocked round can join the daily quest.
   * Other days stay on the usual quest.
   */
  function featureFor(state, now) {
    now = now || new Date();
    var day = now.getDay();
    if (day !== 2 && day !== 4 && day !== 6) return null;
    var parts = (state && state.courses && state.courses.parts) || {};
    var focus = (state && state.courses && state.courses.lessonFocus) || {};
    var allowMul = parts.multiply !== false && focus.multiplication !== false;
    var allowRead = parts.reading !== false && focus.reading !== false;
    var open = [];
    var i;
    for (i = 0; i < GAMES.length; i++) {
      var game = GAMES[i];
      if (game.skill === 'mul' && !allowMul) continue;
      if (game.skill === 'read' && !allowRead) continue;
      var place = firstPlace(state, game);
      if (!place) continue;
      open.push({
        id: game.id,
        title: game.title,
        skill: game.skill,
        place: place,
        placeTitle: placeTitle(place)
      });
    }
    if (!open.length) return null;
    return open[now.getDate() % open.length];
  }

  function contentCount(kind) {
    if (kind === 'order') return ORDER.length;
    if (kind === 'cloze') return CLOZE.length;
    if (kind === 'clue') return CLUE.length;
    if (kind === 'paper') return PAPER.length;
    return ORDER.length + CLOZE.length + CLUE.length + PAPER.length;
  }

  return {
    GAMES: GAMES,
    forPlace: forPlace,
    create: create,
    answer: answer,
    markup: markup,
    isRound: isRound,
    meta: meta,
    featureFor: featureFor,
    contentCount: contentCount,
    tableComplete: tableComplete,
    bloomed: bloomed
  };
});
