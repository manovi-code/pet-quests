/**
 * Pet Quests — optional place activities.
 * Nothing here is part of the daily quest. Nothing can be failed.
 * Content stays hidden until that place is unlocked.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      typeof require !== 'undefined' ? require('./world.js') : root.PQWorld
    );
  } else {
    root.PQLearn = factory(root.PQWorld);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (PQWorld) {
  'use strict';

  var PLACE_IDS = [
    'zoo', 'vet', 'police', 'garden', 'bakery', 'pond', 'friend',
    'farm', 'market', 'playground', 'icecream', 'firehouse',
    'museum', 'nature'
  ];

  function levelOf(state) {
    var grade = state && state.courses ? parseInt(state.courses.grade, 10) : 2;
    if (!(grade >= 1 && grade <= 5)) grade = 2;
    return grade;
  }

  function take(list, level) {
    var n = 2;
    if (level === 2) n = 3;
    else if (level === 3) n = 3;
    else if (level >= 4) n = 4;
    if (n > list.length) n = list.length;
    return list.slice(0, n);
  }

  function questionsFor(level, list) {
    var n = 1;
    if (level >= 3) n = Math.min(2, list.length);
    if (level >= 5) n = list.length;
    return list.slice(0, n);
  }

  function readingFor(level, easy, mid, rich) {
    if (level >= 5) return rich;
    if (level >= 3) return mid;
    return easy;
  }

  function cloneProgress(progress) {
    var matched = {};
    var key;
    var src = (progress && progress.matched) || {};
    for (key in src) {
      if (Object.prototype.hasOwnProperty.call(src, key)) matched[key] = src[key];
    }
    return {
      phase: progress.phase,
      qIndex: progress.qIndex || 0,
      misses: progress.misses || 0,
      matched: matched,
      step: progress.step || 0,
      grown: !!progress.grown,
      picks: (progress.picks || []).slice()
    };
  }

  function pack(progress, message, hint, done) {
    return {
      progress: progress,
      message: message || '',
      hint: hint || '',
      done: !!done || progress.phase === 'done'
    };
  }

  function allMatched(pairs, matched) {
    var i;
    for (i = 0; i < pairs.length; i++) {
      if (!matched[pairs[i].id]) return false;
    }
    return true;
  }

  function zooActivity(level) {
    var easy = 'A rabbit nibbles leaves beside a low log. A duck floats on the pond nearby. Each animal stays near the home that fits.';
    var mid = easy + ' The rabbit’s teeth are good for plants. The duck’s feet are wide for paddling. A keeper fills the water bowl and leaves the animals to eat in peace.';
    var rich = mid + ' Watch first, then guess what each animal will choose. Leaves are a rabbit food. Water plants and tiny pond plants are useful to ducks. Nothing here is a test you can lose.';
    return {
      id: 'zoo',
      title: 'Explore a habitat',
      button: 'Explore a habitat',
      reading: readingFor(level, easy, mid, rich),
      questions: questionsFor(level, [
        {
          q: 'What does the rabbit nibble?',
          choices: ['Leaves', 'A boot', 'A book', 'A bell'],
          answer: 0,
          hint: 'Look for the food beside the rabbit. It is a plant.'
        },
        {
          q: 'Where is the duck?',
          choices: ['On the pond', 'In the oven', 'On the roof', 'In a desk'],
          answer: 0,
          hint: 'The duck is near the water.'
        },
        {
          q: 'Why do the duck’s feet help?',
          choices: ['They are wide for paddling', 'They ring a bell', 'They bake bread', 'They write stories'],
          answer: 0,
          hint: 'The reading tells what the wide feet are for.'
        }
      ]),
      play: {
        kind: 'experiment',
        observe: level >= 4
          ? 'Look closely. One bowl holds green leaves. One bowl holds a small fish. The rabbit is facing the leaves. A thirsty plant sits beside the habitat.'
          : 'Look. One bowl has leaves. One bowl has a fish. A plant nearby looks thirsty.',
        predict: {
          q: 'What do you think the rabbit will choose?',
          choices: ['The leaves', 'The fish', 'A scarf'],
          answer: 0,
          hint: 'Rabbits eat plants. Leaves are a plant food.'
        },
        pairs: take([
          { id: 'rabbit', left: 'Rabbit', right: 'Grassy log', home: 'grass', hint: 'A rabbit likes a grassy place.' },
          { id: 'duck', left: 'Duck', right: 'Calm pond', home: 'pond', hint: 'A duck likes water.' },
          { id: 'bee', left: 'Bee', right: 'Flower patch', home: 'flowers', hint: 'A bee visits flowers.' },
          { id: 'turtle', left: 'Turtle', right: 'Sunny rock', home: 'rock', hint: 'A turtle likes a warm rock.' }
        ], level),
        water: {
          q: 'The plant looks thirsty. What will you try?',
          choices: ['Pour a little water', 'Give it a hat', 'Hide the pot'],
          answer: 0,
          hint: 'A thirsty plant perks up after a drink of water.',
          success: 'You pour a little water. The leaves lift.'
        }
      }
    };
  }

  function vetActivity(level) {
    var easy = 'Animals have body parts with jobs. Ears help them hear. A nose helps them smell. Water helps a body feel ready to play.';
    var mid = easy + ' A heart beats to move blood around the body. Lungs bring in air. Rest and clean water are kind ways to stay healthy. This is learning, not a checkup.';
    var rich = mid + ' Fur or feathers can keep an animal warm. Strong legs help a rabbit hop and a bird perch. You are learning how bodies work. You are not deciding anyone’s care.';
    var parts = take([
      { id: 'ears', label: 'Ears', fact: 'Ears help an animal hear.' },
      { id: 'nose', label: 'Nose', fact: 'A nose helps an animal smell food and friends.' },
      { id: 'heart', label: 'Heart', fact: 'A heart beats to move blood. That is a body job, not a worry.' },
      { id: 'lungs', label: 'Lungs', fact: 'Lungs help the body take in air.' },
      { id: 'water', label: 'Water bowl', fact: 'Clean water helps a body. A fresh bowl is a kind habit.' }
    ], level + 0);
    if (level <= 2 && parts.length > 3) parts = parts.slice(0, 3);
    if (level === 1) parts = parts.slice(0, 2);
    return {
      id: 'vet',
      title: 'How bodies work',
      button: 'How bodies work',
      reading: readingFor(level, easy, mid, rich),
      questions: questionsFor(level, [
        {
          q: 'What do ears help an animal do?',
          choices: ['Hear', 'Bake', 'Swim only', 'Read'],
          answer: 0,
          hint: 'Ears are for hearing.'
        },
        {
          q: 'What does a heart do?',
          choices: ['It beats to move blood', 'It rings the school bell', 'It bakes bread', 'It paints a poster'],
          answer: 0,
          hint: 'The reading says a heart moves blood.'
        },
        {
          q: 'What helps an animal stay warm?',
          choices: ['Fur or feathers', 'A fish bowl', 'A chalkboard', 'A locked door'],
          answer: 0,
          hint: 'Fur or feathers can hold warmth.'
        }
      ]),
      play: {
        kind: 'body',
        prompt: 'Tap each part to see its job.',
        parts: parts
      }
    };
  }

  function policeActivity(level) {
    var pairs = take([
      { id: 'sunny', clue: 'Red collar', pet: 'Sunny the puppy', hint: 'Look for the red collar.' },
      { id: 'moss', clue: 'Green spots', pet: 'Moss the frog', hint: 'The green spots belong with the frog.' },
      { id: 'pip', clue: 'Blue bandana', pet: 'Pip the kitten', hint: 'Find the blue bandana.' },
      { id: 'bram', clue: 'Long soft ears', pet: 'Bramble the bunny', hint: 'Long ears match the bunny.' }
    ], level);
    return {
      id: 'police',
      title: 'Help a lost pet',
      button: 'Help a lost pet',
      reading: readingFor(
        level,
        'A pet is waiting by the friendly desk. Match each clue to the right friend. The helpers are kind.',
        'A pet is waiting by the friendly desk. Read each clue, then match it to a friend. The star badge means helper. Nobody is in trouble.',
        'A small pet waited by the desk this morning. The helpers wrote kind clues: a color, a spot, or a soft ear. Match each clue to a friend so the pet can head home. This is a helping game. There is no trouble and no rush.'
      ),
      questions: [],
      play: {
        kind: 'clues',
        prompt: 'Match each clue to a friend.',
        pairs: pairs.map(function (pair) {
          return { id: pair.id, left: pair.clue, right: pair.pet, hint: pair.hint };
        })
      }
    };
  }

  function matchActivity(id, title, button, prompt, pairs, level) {
    return {
      id: id,
      title: title,
      button: button,
      reading: '',
      questions: [],
      play: {
        kind: 'match',
        prompt: prompt,
        pairs: take(pairs, level)
      }
    };
  }

  function activityForLevel(id, level) {
    if (id === 'zoo') return zooActivity(level);
    if (id === 'vet') return vetActivity(level);
    if (id === 'police') return policeActivity(level);
    if (id === 'garden') {
      return matchActivity(id, 'Sort the flowers', 'Sort the flowers', 'Match each flower to its pot.', [
        { id: 'rose', left: 'Red flower', right: 'Red pot', hint: 'Red stays with red.' },
        { id: 'sun', left: 'Yellow flower', right: 'Yellow pot', hint: 'Yellow stays with yellow.' },
        { id: 'leaf', left: 'White flower', right: 'White pot', hint: 'White stays with white.' },
        { id: 'violet', left: 'Purple flower', right: 'Purple pot', hint: 'Purple stays with purple.' }
      ], level);
    }
    if (id === 'bakery') {
      return matchActivity(id, 'Sort the treats', 'Sort the treats', 'Match each treat to its tray.', [
        { id: 'roll', left: 'Round roll', right: 'Round tray', hint: 'The round roll likes the round tray.' },
        { id: 'loaf', left: 'Long loaf', right: 'Long tray', hint: 'The long loaf likes the long tray.' },
        { id: 'bun', left: 'Seed bun', right: 'Seed tray', hint: 'Seeds stay with the seed tray.' },
        { id: 'star', left: 'Star cookie', right: 'Star tray', hint: 'The star cookie likes the star tray.' }
      ], level);
    }
    if (id === 'pond') {
      return {
        id: 'pond',
        title: 'Watch the pond',
        button: 'Watch the pond',
        reading: readingFor(
          level,
          'Two ducks glide on the pond. One frog sits on a stone.',
          'Two ducks glide on the pond. One frog sits on a stone. A ring spreads where a pebble could land, but you can just watch.',
          'Two ducks glide across the calm pond and leave a soft wake. One frog sits on a warm stone and does not jump. Reeds lean over the water. Count only what you came to see.'
        ),
        questions: questionsFor(level, [
          {
            q: 'How many ducks are on the pond?',
            choices: ['Two', 'Seven', 'Zero', 'Ten'],
            answer: 0,
            hint: 'Count the ducks. The frog is not a duck.'
          },
          {
            q: 'Where is the frog?',
            choices: ['On a stone', 'In the oven', 'On the roof', 'In a book'],
            answer: 0,
            hint: 'The frog picked a stone.'
          }
        ]),
        play: null
      };
    }
    if (id === 'friend') {
      return {
        id: 'friend',
        title: 'Share a snack',
        button: 'Share a snack',
        reading: '',
        questions: [],
        play: {
          kind: 'build',
          steps: [
            { prompt: 'Fern the fox is visiting. Pick a snack to share.', choices: ['Berries', 'Bread', 'Seeds'] },
            { prompt: 'Pick a cup.', choices: ['Warm cocoa', 'Cool water', 'Mint tea'] }
          ].slice(0, level >= 3 ? 2 : 1)
        }
      };
    }
    if (id === 'farm') {
      return matchActivity(id, 'Farm homes', 'Match the farm homes', 'Match each animal to a home.', [
        { id: 'hen', left: 'Hen', right: 'Cozy coop', hint: 'A hen rests in the coop.' },
        { id: 'goat', left: 'Goat', right: 'Hay stall', hint: 'The goat likes the stall.' },
        { id: 'duck', left: 'Duck', right: 'Farm pond', hint: 'This duck likes the farm pond.' },
        { id: 'cat', left: 'Barn cat', right: 'Sunny loft', hint: 'The barn cat likes the loft.' }
      ], level);
    }
    if (id === 'market') {
      return matchActivity(id, 'Market baskets', 'Sort the market', 'Match each food to a basket.', [
        { id: 'apple', left: 'Apple', right: 'Fruit basket', hint: 'An apple is a fruit.' },
        { id: 'carrot', left: 'Carrot', right: 'Garden basket', hint: 'A carrot grew in a garden.' },
        { id: 'bread', left: 'Bread', right: 'Bakery basket', hint: 'Bread comes from the bakery.' },
        { id: 'egg', left: 'Egg', right: 'Farm basket', hint: 'An egg comes from the farm.' }
      ], level);
    }
    if (id === 'playground') {
      var colors = [
        { id: 'sage', label: 'Green' },
        { id: 'gold', label: 'Gold' },
        { id: 'terra', label: 'Orange' },
        { id: 'sky', label: 'Blue' }
      ];
      return {
        id: 'playground',
        title: 'Follow the colors',
        button: 'Follow the colors',
        reading: '',
        questions: [],
        play: {
          kind: 'pattern',
          prompt: 'Tap the colors in this order.',
          colors: colors.slice(0, level <= 1 ? 2 : (level <= 3 ? 3 : 4))
        }
      };
    }
    if (id === 'icecream') {
      return {
        id: 'icecream',
        title: 'Build a cone',
        button: 'Build a cone',
        reading: '',
        questions: [],
        play: {
          kind: 'build',
          steps: [
            { prompt: 'Pick a scoop.', choices: ['Berry', 'Honey', 'Mint'] },
            { prompt: 'Pick a topping.', choices: ['Sprinkles', 'A berry', 'None today'] },
            { prompt: 'Pick a dish.', choices: ['Cone', 'Cup', 'Small bowl'] }
          ].slice(0, level <= 1 ? 1 : (level <= 3 ? 2 : 3))
        }
      };
    }
    if (id === 'firehouse') {
      return matchActivity(id, 'Helper tools', 'Match helper tools', 'Match each tool to its helper job.', [
        { id: 'hose', left: 'Hose', right: 'Brings water', hint: 'A hose carries water.' },
        { id: 'bell', left: 'Bell', right: 'Calls the helpers', hint: 'A bell can call the helpers.' },
        { id: 'boots', left: 'Boots', right: 'Ready for a walk', hint: 'Boots are for heading out.' },
        { id: 'lamp', left: 'Lamp', right: 'Lights the way', hint: 'A lamp helps people see.' }
      ], level);
    }
    if (id === 'museum') {
      return {
        id: 'museum',
        title: 'Look around',
        button: 'Look around the museum',
        reading: readingFor(
          level,
          'A leaf fossil sits in a frame. A blue vase sits on a stand. A bench waits if you want to rest.',
          'A leaf fossil sits in a frame on the left wall. A blue vase sits on a stand. The bench is for resting, and the pictures stay in their frames.',
          'The quiet gallery has three things to notice. A leaf fossil is pressed in stone and hung in a wood frame. A blue vase has a painted wave. A low bench faces the wall so you can look as long as you like.'
        ),
        questions: questionsFor(level, [
          {
            q: 'What is in the frame?',
            choices: ['A leaf fossil', 'A loaf of bread', 'A school bell', 'A duck'],
            answer: 0,
            hint: 'The frame holds a leaf from long ago.'
          },
          {
            q: 'What color is the vase?',
            choices: ['Blue', 'Only black', 'Invisible', 'Striped like a road'],
            answer: 0,
            hint: 'The vase on the stand is blue.'
          }
        ]),
        play: null
      };
    }
    if (id === 'nature') {
      return matchActivity(id, 'Nature homes', 'Match nature homes', 'Match each friend to a home outside.', [
        { id: 'bird', left: 'Bird', right: 'Tree nest', hint: 'A bird can rest in a nest.' },
        { id: 'fish', left: 'Fish', right: 'Clear stream', hint: 'A fish lives in water.' },
        { id: 'fox', left: 'Fox', right: 'Den', hint: 'A fox can rest in a den.' },
        { id: 'bee', left: 'Bee', right: 'Flower', hint: 'A bee visits a flower.' }
      ], level);
    }
    return null;
  }

  function forPlace(state, placeId) {
    if (!PQWorld || !PQWorld.isPlaceOpen || !PQWorld.isPlaceOpen(state, placeId)) return null;
    if (PLACE_IDS.indexOf(placeId) === -1) return null;
    return activityForLevel(placeId, levelOf(state));
  }

  function availableIds(state) {
    var out = [];
    var i;
    for (i = 0; i < PLACE_IDS.length; i++) {
      if (forPlace(state, PLACE_IDS[i])) out.push(PLACE_IDS[i]);
    }
    return out;
  }

  function begin(activity) {
    var phase = 'done';
    if (!activity) return { phase: 'done', qIndex: 0, misses: 0, matched: {}, step: 0, grown: false, picks: [] };
    if (activity.reading) phase = 'read';
    else if (activity.questions && activity.questions.length) phase = 'ask';
    else if (activity.play) phase = 'play';
    return { phase: phase, qIndex: 0, misses: 0, matched: {}, step: 0, grown: false, picks: [] };
  }

  function finishAsk(activity, progress, message) {
    if (progress.qIndex >= (activity.questions || []).length) {
      progress.phase = activity.play ? 'play' : 'done';
      progress.step = 0;
      progress.misses = 0;
      if (progress.phase === 'done') message = 'All done here.';
    }
    return message;
  }

  function actPlay(play, progress, input) {
    var message = '';
    var hint = '';
    var i;
    if (!play) {
      progress.phase = 'done';
      return pack(progress, 'All done here.', '', true);
    }

    if (play.kind === 'experiment') {
      if ((progress.step || 0) === 0) {
        if (input.type !== 'continue') return pack(progress, play.observe, '');
        progress.step = 1;
        progress.misses = 0;
        return pack(progress, 'What do you predict?', '');
      }
      if (progress.step === 1) {
        if (input.type !== 'choice') return pack(progress, play.predict.q, '');
        if (input.index === play.predict.answer) {
          progress.step = 2;
          progress.misses = 0;
          return pack(progress, 'Nice prediction. Now match a home.', '');
        }
        progress.misses += 1;
        return pack(progress, 'Have another look.', play.predict.hint);
      }
      if (progress.step === 2) {
        if (input.type !== 'pair') return pack(progress, 'Match a friend to a home.', '');
        var found = null;
        for (i = 0; i < play.pairs.length; i++) {
          if (play.pairs[i].id === input.left) found = play.pairs[i];
        }
        if (found && (found.home === input.right || found.right === input.right)) {
          progress.matched[found.id] = true;
          if (allMatched(play.pairs, progress.matched)) {
            progress.step = 3;
            progress.misses = 0;
            return pack(progress, 'The homes fit. The plant is next.', '');
          }
          return pack(progress, 'That home fits.', '');
        }
        return pack(progress, 'That home is for someone else.', found ? found.hint : 'Try another home.');
      }
      if (progress.step === 3) {
        if (input.type !== 'choice') return pack(progress, play.water.q, '');
        if (input.index === play.water.answer) {
          progress.grown = true;
          progress.phase = 'done';
          progress.step = 4;
          return pack(progress, play.water.success, '', true);
        }
        return pack(progress, 'Try a gentle choice.', play.water.hint);
      }
    }

    if (play.kind === 'match' || play.kind === 'clues') {
      if (input.type !== 'pair') return pack(progress, play.prompt, '');
      var pair = null;
      for (i = 0; i < play.pairs.length; i++) {
        if (play.pairs[i].id === input.left) pair = play.pairs[i];
      }
      if (pair && pair.right === input.right) {
        progress.matched[pair.id] = true;
        if (allMatched(play.pairs, progress.matched)) {
          progress.phase = 'done';
          return pack(progress, 'Everything matches. All done here.', '', true);
        }
        return pack(progress, 'That match fits.', '');
      }
      return pack(progress, 'Try another pair.', pair ? pair.hint : 'Look at the clue again.');
    }

    if (play.kind === 'body') {
      if (input.type !== 'part') return pack(progress, play.prompt, '');
      var part = null;
      for (i = 0; i < play.parts.length; i++) {
        if (play.parts[i].id === input.id) part = play.parts[i];
      }
      if (!part) return pack(progress, play.prompt, '');
      progress.matched[part.id] = true;
      if (allMatched(play.parts, progress.matched)) {
        progress.phase = 'done';
        return pack(progress, part.fact + ' You looked at every part. All done here.', '', true);
      }
      return pack(progress, part.fact, '');
    }

    if (play.kind === 'build') {
      if (input.type !== 'choice') return pack(progress, play.steps[progress.step || 0].prompt, '');
      var step = play.steps[progress.step || 0];
      var choice = step.choices[input.index] || step.choices[0];
      progress.picks.push(choice);
      progress.step += 1;
      if (progress.step >= play.steps.length) {
        progress.phase = 'done';
        return pack(progress, 'You made ' + progress.picks.join(' and ') + '. All done here.', '', true);
      }
      return pack(progress, 'Nice choice. ' + play.steps[progress.step].prompt, '');
    }

    if (play.kind === 'pattern') {
      if (input.type !== 'color') return pack(progress, play.prompt, '');
      var want = play.colors[progress.step || 0];
      if (want && input.id === want.id) {
        progress.step += 1;
        if (progress.step >= play.colors.length) {
          progress.phase = 'done';
          return pack(progress, 'You followed the colors. All done here.', '', true);
        }
        return pack(progress, 'Yes. Next is ' + play.colors[progress.step].label + '.', '');
      }
      progress.step = 0;
      return pack(progress, 'Let us start the order again.', 'First color: ' + play.colors[0].label + '.');
    }

    progress.phase = 'done';
    return pack(progress, 'All done here.', '', true);
  }

  function act(activity, progress, input) {
    if (!activity) return pack({ phase: 'done', qIndex: 0, misses: 0, matched: {}, step: 0, grown: false, picks: [] }, '', '', true);
    progress = cloneProgress(progress || begin(activity));
    input = input || {};
    var message = '';
    var hint = '';

    if (progress.phase === 'read') {
      if (input.type === 'continue') {
        progress.phase = activity.questions && activity.questions.length ? 'ask' : (activity.play ? 'play' : 'done');
        progress.qIndex = 0;
        progress.misses = 0;
        message = progress.phase === 'done' ? 'All done here.' : 'Ready when you are.';
      }
      return pack(progress, message, hint);
    }

    if (progress.phase === 'ask') {
      var q = activity.questions[progress.qIndex];
      if (!q) {
        progress.phase = activity.play ? 'play' : 'done';
        return pack(progress, 'All done here.', '', progress.phase === 'done');
      }
      if (input.type !== 'choice') return pack(progress, '', '');
      if (input.index === q.answer) {
        progress.qIndex += 1;
        progress.misses = 0;
        message = finishAsk(activity, progress, 'Yes — that matches.');
        return pack(progress, message, '', progress.phase === 'done');
      }
      progress.misses += 1;
      hint = progress.misses >= 2
        ? ('It says: “' + q.choices[q.answer] + '”.')
        : (q.hint || 'Peek again, then try once more.');
      return pack(progress, 'Have another look.', hint);
    }

    if (progress.phase === 'play') return actPlay(activity.play, progress, input);
    return pack(progress, 'All done here.', '', true);
  }

  return {
    PLACE_IDS: PLACE_IDS,
    levelOf: levelOf,
    forPlace: forPlace,
    availableIds: availableIds,
    begin: begin,
    act: act,
    activityForLevel: activityForLevel
  };
});
