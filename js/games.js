/**
 * Pet Quests — short place games.
 * One step at a time. No fail state. Coins are a gift at the end, never spent to play.
 * Rank changes how big the numbers are and whether a recipe is scaled.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      typeof require !== 'undefined' ? require('./world.js') : root.PQWorld
    );
  } else {
    root.PQGames = factory(root.PQWorld);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (PQWorld) {
  'use strict';

  var META = {
    bakery: { title: 'Bake a recipe', button: 'Bake a recipe' },
    garden: { title: 'Plant the rows', button: 'Plant the rows' },
    pond: { title: 'Fish for numbers', button: 'Fish for numbers' },
    market: { title: 'Market math', button: 'Count at the market' },
    icecream: { title: 'Take an order', button: 'Take an order' },
    firehouse: { title: 'Ready the helpers', button: 'Ready the helpers' },
    museum: { title: 'Spot the detail', button: 'Spot the detail' },
    farm: { title: 'Feed the groups', button: 'Feed the groups' },
    toystore: { title: 'Toy sets', button: 'Count the toy sets' },
    bookstore: { title: 'Find the word', button: 'Find the word' },
    aquarium: { title: 'Count the fish', button: 'Count the fish' },
    art: { title: 'Mix the paints', button: 'Mix the paints' },
    music: { title: 'Count the beats', button: 'Count the beats' },
    beach: { title: 'Shell groups', button: 'Group the shells' },
    camp: { title: 'Pack the bag', button: 'Pack the bag' },
    train: { title: 'Read the board', button: 'Read the board' }
  };

  function clampGrade(grade) {
    var n = parseInt(grade, 10);
    if (!(n >= 1 && n <= 5)) return 2;
    return n;
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

  function textChoices(pairs, rng) {
    return shuffle(pairs, rng).map(function (pair) {
      return { label: pair.label, value: pair.label, ok: !!pair.ok };
    });
  }

  function makeStep(prompt, answer, hint, rng, detail) {
    return {
      prompt: prompt,
      hint: hint,
      detail: detail || '',
      answer: answer,
      choices: numChoices(answer, rng)
    };
  }

  function bakeSpec(grade, rng) {
    grade = clampGrade(grade);
    rng = rng || Math.random;
    var flour = 2;
    var eggs = 3;
    var milk = 1;
    var scale = 1;
    var fraction = false;
    var say = 'Follow the recipe card.';
    if (grade === 2) {
      flour = 3;
      eggs = 4;
      milk = 2;
      say = 'Follow this recipe card.';
    } else if (grade === 3) {
      scale = 2;
      say = 'The card is for 1 pan. You are baking 2 pans.';
    } else if (grade === 4) {
      scale = 3;
      say = 'The card is for 1 pan. You are baking 3 pans.';
    } else if (grade === 5) {
      fraction = true;
      scale = 0.5;
      flour = 4;
      eggs = 6;
      milk = 2;
      say = 'The card is for 2 pans. Bake half of the card.';
    }
    function needOf(base) {
      if (fraction) return base / 2;
      return base * scale;
    }
    var needs = [
      { id: 'flour', name: 'flour', unit: 'cups', shown: flour, need: needOf(flour) },
      { id: 'eggs', name: 'eggs', unit: 'eggs', shown: eggs, need: needOf(eggs) },
      { id: 'milk', name: 'milk', unit: 'cups', shown: milk, need: needOf(milk) }
    ];
    var hardest = 0;
    var i;
    for (i = 0; i < needs.length; i++) {
      if (needs[i].need > hardest) hardest = needs[i].need;
    }
    return {
      grade: grade,
      rankScore: grade,
      scale: scale,
      fraction: fraction,
      say: say,
      needs: needs,
      hardest: hardest
    };
  }

  function checkBake(spec, picks) {
    picks = picks || {};
    var i;
    for (i = 0; i < spec.needs.length; i++) {
      var n = spec.needs[i];
      if (parseInt(picks[n.id], 10) !== n.need) {
        return {
          ok: false,
          hint: 'The recipe needs ' + ingredientLine(n, n.need) + '.'
        };
      }
    }
    return { ok: true, hint: '' };
  }

  function ingredientLine(n, amount) {
    if (n.id === 'eggs') return amount + (amount === 1 ? ' egg' : ' eggs');
    var unit = n.unit;
    if (amount === 1 && unit.charAt(unit.length - 1) === 's') unit = unit.slice(0, -1);
    return amount + ' ' + unit + ' ' + n.name;
  }

  function ingredientAsk(n) {
    if (n.id === 'eggs') return 'How many eggs?';
    return 'How many ' + n.unit + ' of ' + n.name + '?';
  }

  function cardLine(spec) {
    return spec.needs.map(function (n) {
      return ingredientLine(n, n.shown);
    }).join(', ');
  }

  function arrayPair(grade, rng) {
    var rows;
    var each;
    if (grade <= 1) {
      rows = 1 + Math.floor(rng() * 2);
      each = 1 + Math.floor(rng() * 3);
    } else if (grade === 2) {
      rows = 2 + Math.floor(rng() * 2);
      each = 2 + Math.floor(rng() * 3);
    } else if (grade === 3) {
      rows = 3 + Math.floor(rng() * 3);
      each = 3 + Math.floor(rng() * 3);
    } else if (grade === 4) {
      rows = 4 + Math.floor(rng() * 4);
      each = 4 + Math.floor(rng() * 5);
    } else {
      rows = 6 + Math.floor(rng() * 4);
      each = 6 + Math.floor(rng() * 5);
    }
    if (rows < 1) rows = 1;
    if (each < 1) each = 1;
    return { rows: rows, each: each, answer: rows * each, hardest: rows * each };
  }

  function arraySteps(grade, rng, noun, placeNoun) {
    var pair = arrayPair(grade, rng);
    var detail = pair.rows + ' ' + placeNoun + ' with ' + pair.each + ' ' + noun + ' in each.';
    var hint = grade <= 2
      ? ('Count the ' + noun + '. ' + pair.rows + ' groups of ' + pair.each + '.')
      : (pair.rows + ' × ' + pair.each + ' = ' + pair.answer + '.');
    return {
      hardest: pair.hardest,
      steps: [
        makeStep(
          'How many ' + noun + ' is that?',
          pair.answer,
          hint,
          rng,
          detail
        )
      ]
    };
  }

  function pondSteps(grade, rng) {
    var a;
    var b;
    var sub = rng() < 0.45;
    if (grade <= 1) {
      a = Math.floor(rng() * 6);
      b = Math.floor(rng() * 5);
    } else if (grade === 2) {
      a = 4 + Math.floor(rng() * 12);
      b = Math.floor(rng() * 9);
    } else if (grade === 3) {
      a = 10 + Math.floor(rng() * 20);
      b = 2 + Math.floor(rng() * 12);
    } else if (grade === 4) {
      a = 20 + Math.floor(rng() * 40);
      b = 5 + Math.floor(rng() * 20);
    } else {
      a = 40 + Math.floor(rng() * 40);
      b = 8 + Math.floor(rng() * 25);
    }
    if (sub && b > a) {
      var swap = a;
      a = b;
      b = swap;
    }
    var answer = sub ? a - b : a + b;
    var sign = sub ? ' − ' : ' + ';
    var hint = sub
      ? ('Start at ' + a + ' and count back ' + b + '.')
      : ('Put ' + a + ' and ' + b + ' together.');
    return {
      hardest: Math.max(a, b, answer),
      steps: [makeStep('A fish shows ' + a + sign + b + '. What is the number?', answer, hint, rng, 'Catch the number that fits.')]
    };
  }

  function marketSteps(grade, rng) {
    if (grade <= 2) {
      var count = grade === 1 ? (2 + Math.floor(rng() * 4)) : (4 + Math.floor(rng() * 6));
      return {
        hardest: count,
        steps: [makeStep('How many apples are in the basket?', count, 'Count them one by one.', rng, 'You see ' + count + ' apples in a basket.')]
      };
    }
    if (grade === 3) {
      var packs = 2 + Math.floor(rng() * 3);
      var each = 2 + Math.floor(rng() * 4);
      return {
        hardest: packs * each,
        steps: [makeStep(
          'There are ' + packs + ' baskets with ' + each + ' oranges in each. How many oranges?',
          packs * each,
          packs + ' groups of ' + each + '.',
          rng,
          'Market baskets.'
        )]
      };
    }
    var price = grade === 4 ? (12 + Math.floor(rng() * 9)) : (18 + Math.floor(rng() * 15));
    var paid = grade === 4 ? 30 : 50;
    if (paid <= price) paid = price + 10;
    return {
      hardest: paid,
      steps: [makeStep(
        'The fruit costs ' + price + ' coins. You pay ' + paid + '. How much change?',
        paid - price,
        paid + ' − ' + price + ' = ' + (paid - price) + '.',
        rng,
        'Making change at the market.'
      )]
    };
  }

  function iceSteps(grade, rng) {
    var orders = [
      { who: 'Fern', scoop: 'mint', dish: 'a cup', topping: 'no topping' },
      { who: 'Maple', scoop: 'berry', dish: 'a cone', topping: 'sprinkles' }
    ];
    var detail = grade <= 2
      ? 'Fern wants mint in a cup.'
      : 'Fern wants a mint scoop with no topping in a cup. Maple wants berry with sprinkles in a cone.';
    var steps = [
      {
        prompt: 'What does Fern want?',
        hint: 'Look for Fern’s scoop and dish.',
        detail: detail,
        answer: 'mint in a cup',
        choices: textChoices([
          { label: 'mint in a cup', ok: true },
          { label: 'berry in a cone', ok: false },
          { label: 'honey in a bowl', ok: false },
          { label: 'mint in a cone', ok: false }
        ], rng)
      }
    ];
    if (grade >= 3) {
      steps.push({
        prompt: 'What does Maple want on top?',
        hint: 'Maple’s order says sprinkles.',
        detail: detail,
        answer: 'sprinkles',
        choices: textChoices([
          { label: 'sprinkles', ok: true },
          { label: 'no topping', ok: false },
          { label: 'a pickle', ok: false },
          { label: 'a leaf', ok: false }
        ], rng)
      });
    }
    if (grade >= 5) {
      steps.push({
        prompt: 'Who asked for no topping?',
        hint: 'The order says Fern wants no topping.',
        detail: detail,
        answer: 'Fern',
        choices: textChoices([
          { label: 'Fern', ok: true },
          { label: 'Maple', ok: false },
          { label: 'The baker', ok: false },
          { label: 'A duck', ok: false }
        ], rng)
      });
    }
    return { hardest: steps.length + grade, steps: steps };
  }

  function sequenceSteps(grade, rng, title, labels) {
    var n = 3;
    if (grade === 2) n = 3;
    else if (grade === 3) n = 4;
    else if (grade === 4) n = 5;
    else if (grade >= 5) n = labels.length;
    if (n > labels.length) n = labels.length;
    var used = labels.slice(0, n);
    var steps = [];
    var i;
    for (i = 0; i < used.length; i++) {
      var correct = used[i];
      var options = [{ label: correct, ok: true }];
      var k;
      for (k = 0; k < used.length && options.length < 3; k++) {
        if (used[k] !== correct) options.push({ label: used[k], ok: false });
      }
      if (options.length < 3) options.push({ label: 'Take a nap first', ok: false });
      var asked = i === 0 ? 'What comes first?' : 'What comes next?';
      var soFar = i === 0 ? '' : ('So far: ' + used.slice(0, i).join(', ') + '.');
      steps.push({
        prompt: asked,
        hint: 'Next is: ' + correct + '.',
        detail: title + ' ' + soFar,
        answer: correct,
        choices: textChoices(options, rng)
      });
    }
    return { hardest: n, steps: steps };
  }

  function museumSteps(grade, rng) {
    var easy = 'A blue vase sits on a wood stand. A leaf fossil hangs in a frame.';
    var rich = 'A blue vase with a painted wave sits on a low wood stand. Beside it, a leaf fossil hangs in a wood frame. A bench faces the wall so you can look as long as you like. The room is quiet, and nothing needs to be touched.';
    var detail = grade >= 4 ? rich : easy;
    var steps = [
      {
        prompt: 'What color is the vase?',
        hint: 'The vase is blue.',
        detail: detail,
        answer: 'Blue',
        choices: textChoices([
          { label: 'Blue', ok: true },
          { label: 'Red', ok: false },
          { label: 'Black', ok: false },
          { label: 'Orange', ok: false }
        ], rng)
      }
    ];
    if (grade >= 3) {
      steps.push({
        prompt: 'Where is the leaf fossil?',
        hint: 'The leaf fossil hangs in a frame.',
        detail: detail,
        answer: 'In a frame',
        choices: textChoices([
          { label: 'In a frame', ok: true },
          { label: 'In the pond', ok: false },
          { label: 'In a boot', ok: false },
          { label: 'On the roof', ok: false }
        ], rng)
      });
    }
    if (grade >= 5) {
      steps.push({
        prompt: 'Why is the bench there?',
        hint: 'The bench is so you can look as long as you like.',
        detail: detail,
        answer: 'So you can look as long as you like',
        choices: textChoices([
          { label: 'So you can look as long as you like', ok: true },
          { label: 'So the vase can sit on it', ok: false },
          { label: 'So the door stays shut', ok: false },
          { label: 'So the lights turn off', ok: false }
        ], rng)
      });
    }
    return { hardest: detail.split(/\s+/).length, steps: steps };
  }

  function bookSteps(grade, rng) {
    var word = grade >= 4 ? 'calm' : 'tidy';
    var say = word === 'tidy'
      ? 'The shelf was tidy. Every book stood up in a neat row.'
      : 'The reading room was calm. Voices stayed soft and nobody hurried.';
    var meaning = word === 'tidy' ? 'Neat' : 'Quiet and unhurried';
    return {
      hardest: say.split(/\s+/).length + grade,
      steps: [
        {
          prompt: 'What does “' + word + '” mean here?',
          hint: word === 'tidy' ? 'Tidy means neat.' : 'Calm means quiet and unhurried.',
          detail: say,
          answer: meaning,
          choices: textChoices([
            { label: meaning, ok: true },
            { label: 'Loud', ok: false },
            { label: 'Broken', ok: false },
            { label: 'Sleepy only at night', ok: false }
          ], rng)
        }
      ]
    };
  }

  function trainSteps(grade, rng) {
    var detail = grade <= 2
      ? 'The red train leaves at 2. The blue train leaves at 4.'
      : 'The board says the red train leaves at 2 and stops at the pond. The blue train leaves at 4 and stops at the beach. Maple wants the beach.';
    var steps = [
      {
        prompt: grade <= 2 ? 'Which train leaves at 2?' : 'Which train stops at the beach?',
        hint: grade <= 2 ? 'The red train leaves at 2.' : 'The blue train stops at the beach.',
        detail: detail,
        answer: grade <= 2 ? 'The red train' : 'The blue train',
        choices: textChoices([
          { label: grade <= 2 ? 'The red train' : 'The blue train', ok: true },
          { label: grade <= 2 ? 'The blue train' : 'The red train', ok: false },
          { label: 'A boat', ok: false },
          { label: 'A bicycle', ok: false }
        ], rng)
      }
    ];
    if (grade >= 4) {
      steps.push({
        prompt: 'Which train should Maple ride?',
        hint: 'Maple wants the beach, and the blue train goes there.',
        detail: detail,
        answer: 'The blue train',
        choices: textChoices([
          { label: 'The blue train', ok: true },
          { label: 'The red train', ok: false },
          { label: 'Neither train', ok: false },
          { label: 'A truck', ok: false }
        ], rng)
      });
    }
    return { hardest: grade * 4, steps: steps };
  }

  function stepsFor(place, grade, rng) {
    if (place === 'bakery') {
      var spec = bakeSpec(grade, rng);
      var detail = spec.say + ' Recipe card: ' + cardLine(spec) + '.';
      var steps = spec.needs.map(function (n) {
        var hint = spec.fraction
          ? ('Half of ' + ingredientLine(n, n.shown) + ' is ' + ingredientLine(n, n.need) + '.')
          : (spec.scale > 1
            ? (ingredientLine(n, n.shown) + ' × ' + spec.scale + ' = ' + ingredientLine(n, n.need) + '.')
            : ('The card says ' + ingredientLine(n, n.need) + '.'));
        return makeStep(ingredientAsk(n), n.need, hint, rng, detail);
      });
      return { hardest: spec.hardest, steps: steps, spec: spec };
    }
    if (place === 'garden') return arraySteps(grade, rng, 'flowers', 'rows');
    if (place === 'farm') return arraySteps(grade, rng, 'apples', 'pens');
    if (place === 'beach') return arraySteps(grade, rng, 'shells', 'piles');
    if (place === 'aquarium') return arraySteps(grade, rng, 'fish', 'tanks');
    if (place === 'music') return arraySteps(grade, rng, 'beats', 'lines');
    if (place === 'toystore') return arraySteps(grade, rng, 'blocks', 'boxes');
    if (place === 'art') return arraySteps(grade, rng, 'paint pots', 'trays');
    if (place === 'pond') return pondSteps(grade, rng);
    if (place === 'market') return marketSteps(grade, rng);
    if (place === 'icecream') return iceSteps(grade, rng);
    if (place === 'firehouse') {
      return sequenceSteps(grade, rng, 'Helper order.', [
        'Put on boots',
        'Check the hose',
        'Wave to a helper',
        'Walk to the truck',
        'Look both ways',
        'Help calmly'
      ]);
    }
    if (place === 'camp') {
      return sequenceSteps(grade, rng, 'Packing order.', [
        'Roll the blanket',
        'Pack the cup',
        'Zip the bag',
        'Check the lantern',
        'Walk to the path'
      ]);
    }
    if (place === 'museum') return museumSteps(grade, rng);
    if (place === 'bookstore') return bookSteps(grade, rng);
    if (place === 'train') return trainSteps(grade, rng);
    return { hardest: grade, steps: [makeStep('How many friendly waves?', 1, 'One wave is enough.', rng, '')] };
  }

  function roundFor(place, grade, rng) {
    rng = rng || Math.random;
    grade = clampGrade(grade);
    var meta = META[place] || { title: 'Play', button: 'Play' };
    var built = stepsFor(place, grade, rng);
    return {
      place: place,
      title: meta.title,
      button: meta.button,
      grade: grade,
      rankScore: grade,
      hardest: built.hardest,
      spec: built.spec || null,
      steps: built.steps,
      stepIndex: 0,
      misses: 0,
      reward: 8,
      rewarded: false
    };
  }

  function currentStep(round) {
    if (!round || !round.steps) return null;
    if (round.stepIndex >= round.steps.length) return null;
    return round.steps[round.stepIndex];
  }

  function correctLabel(step) {
    var i;
    for (i = 0; i < step.choices.length; i++) {
      if (step.choices[i].ok) return step.choices[i].label;
    }
    return '';
  }

  function checkStep(round, index) {
    var step = currentStep(round);
    if (!round) return { ok: false, done: true, hint: '', message: 'All done.', round: round };
    if (!step) return { ok: true, done: true, hint: '', message: 'All done here.', round: round };
    var choice = step.choices[index];
    if (!choice) return { ok: false, done: false, hint: 'Tap one answer.', message: 'Not yet.', round: round };
    if (choice.ok) {
      round.stepIndex += 1;
      round.misses = 0;
      var done = round.stepIndex >= round.steps.length;
      return {
        ok: true,
        done: done,
        hint: '',
        message: done ? 'All done here.' : 'Yes.',
        round: round
      };
    }
    round.misses = (round.misses || 0) + 1;
    var hint = round.misses >= 2 ? ('It is “' + correctLabel(step) + '”.') : (step.hint || 'Have another look.');
    return { ok: false, done: false, hint: hint, message: 'Not yet.', round: round };
  }

  function forPlace(state, placeId) {
    if (!META[placeId]) return null;
    if (!PQWorld || !PQWorld.isPlaceOpen || !PQWorld.isPlaceOpen(state, placeId)) return null;
    return { id: placeId, title: META[placeId].title, button: META[placeId].button };
  }

  function placeIds() {
    return Object.keys(META);
  }

  return {
    META: META,
    bakeSpec: bakeSpec,
    checkBake: checkBake,
    roundFor: roundFor,
    currentStep: currentStep,
    checkStep: checkStep,
    forPlace: forPlace,
    placeIds: placeIds
  };
});
