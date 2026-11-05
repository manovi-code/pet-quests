/**
 * Pet Quests — original short pet-themed reading passages.
 * Each passage has 2–3 comprehension questions (one reading mission per day).
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PQReading = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Passages: ~2–4 short sentences, concrete language.
   * Enough for ~2 weeks of daily play (14+) without heavy repeats.
   * answers are 0-based indices into choices.
   */
  var PASSAGES = [
    {
      id: 'r01',
      title: 'Sunny Patch',
      text: 'Pip the puppy found a warm sunny patch by the garden wall. He curled up with his favorite ball. A soft breeze moved the leaves above him.',
      questions: [
        {
          q: 'Where did Pip find a sunny patch?',
          choices: ['By the garden wall', 'Under the bed', 'In the kitchen', 'On the roof'],
          answer: 0
        },
        {
          q: 'What did Pip curl up with?',
          choices: ['A stick', 'His favorite ball', 'A blanket', 'A shoe'],
          answer: 1
        },
        {
          q: 'What moved the leaves above him?',
          choices: ['A truck', 'Rain', 'A soft breeze', 'A bird'],
          answer: 2
        }
      ]
    },
    {
      id: 'r02',
      title: 'Kitten Steps',
      text: 'Mira the kitten practiced jumping from the soft chair to the rug. The first jump was short. On the third try, she landed right in the middle of the rug.',
      questions: [
        {
          q: 'What was Mira practicing?',
          choices: ['Swimming', 'Jumping', 'Singing', 'Cooking'],
          answer: 1
        },
        {
          q: 'Where did she jump from?',
          choices: ['The soft chair', 'A tree', 'A car', 'The porch roof'],
          answer: 0
        },
        {
          q: 'When did she land in the middle of the rug?',
          choices: ['First try', 'Second try', 'Third try', 'Never'],
          answer: 2
        }
      ]
    },
    {
      id: 'r03',
      title: 'Bunny Garden',
      text: 'Bramble the bunny hopped along the carrot row. He sniffed three carrots and chose the orange one that was longest. Then he sat quietly and listened to the bees.',
      questions: [
        {
          q: 'What did Bramble hop along?',
          choices: ['A river', 'The carrot row', 'A road', 'A fence'],
          answer: 1
        },
        {
          q: 'How many carrots did he sniff?',
          choices: ['One', 'Two', 'Three', 'Ten'],
          answer: 2
        },
        {
          q: 'What did he listen to at the end?',
          choices: ['Dogs', 'Bees', 'Trains', 'Thunder'],
          answer: 1
        }
      ]
    },
    {
      id: 'r04',
      title: 'Owl Evening',
      text: 'Nix the owl stretched her wings on the low branch. The sky turned purple as the sun went down. She watched a mouse dart under a leaf, then stayed still.',
      questions: [
        {
          q: 'Where did Nix stretch her wings?',
          choices: ['On the low branch', 'In a cave', 'On a boat', 'Inside a barn'],
          answer: 0
        },
        {
          q: 'What color did the sky turn?',
          choices: ['Bright green', 'Purple', 'Orange stripes', 'White'],
          answer: 1
        },
        {
          q: 'What did the mouse do?',
          choices: ['Flew away', 'Sang a song', 'Darted under a leaf', 'Climbed a tree'],
          answer: 2
        }
      ]
    },
    {
      id: 'r05',
      title: 'Water Bowl',
      text: 'After a long walk, Tess the terrier drank cool water from her blue bowl. Drops fell on the kitchen mat. Her person wiped the mat and smiled.',
      questions: [
        {
          q: 'What did Tess drink from?',
          choices: ['A red cup', 'Her blue bowl', 'A lake', 'A bottle'],
          answer: 1
        },
        {
          q: 'Where did the drops fall?',
          choices: ['On the kitchen mat', 'On the couch', 'Outside', 'On a book'],
          answer: 0
        },
        {
          q: 'What did her person do?',
          choices: ['Left the room', 'Wiped the mat and smiled', 'Turned off the lights', 'Opened a window'],
          answer: 1
        }
      ]
    },
    {
      id: 'r06',
      title: 'Feather Find',
      text: 'Luna the kitten found a soft gray feather near the door. She patted it with one paw. The feather slid under the shelf, and Luna waited patiently.',
      questions: [
        {
          q: 'What color was the feather?',
          choices: ['Red', 'Soft gray', 'Bright yellow', 'Green'],
          answer: 1
        },
        {
          q: 'How did Luna touch the feather?',
          choices: ['With her nose', 'With one paw', 'With her tail', 'With both ears'],
          answer: 1
        },
        {
          q: 'Where did the feather slide?',
          choices: ['Out the door', 'Under the shelf', 'Into a cup', 'Onto the bed'],
          answer: 1
        }
      ]
    },
    {
      id: 'r07',
      title: 'Rain Shelter',
      text: 'When rain began to fall, Clover the bunny hopped under the wooden bench. The ground stayed dry there. He watched puddles grow on the path.',
      questions: [
        {
          q: 'Where did Clover hop when it rained?',
          choices: ['Under the wooden bench', 'Into a pond', 'Up a tree', 'Onto a bike'],
          answer: 0
        },
        {
          q: 'What stayed dry under the bench?',
          choices: ['The sky', 'The ground', 'The rain', 'The clouds'],
          answer: 1
        },
        {
          q: 'What did he watch on the path?',
          choices: ['Cars', 'Puddles grow', 'Snow', 'Birds dancing'],
          answer: 1
        }
      ]
    },
    {
      id: 'r08',
      title: 'Night Watch',
      text: 'At night, Hoot the owl sat on the fence post. Stars showed between the clouds. A soft hoot came from the trees across the field.',
      questions: [
        {
          q: 'Where did Hoot sit?',
          choices: ['On the fence post', 'In a car', 'Under a bridge', 'On a swing'],
          answer: 0
        },
        {
          q: 'What showed between the clouds?',
          choices: ['Planes', 'Stars', 'Kites', 'Balls'],
          answer: 1
        },
        {
          q: 'Where did a soft hoot come from?',
          choices: ['The kitchen', 'The trees across the field', 'A radio', 'A truck'],
          answer: 1
        }
      ]
    },
    {
      id: 'r09',
      title: 'Ball Chase',
      text: 'Scout the puppy chased a red ball across the yard. It rolled under the apple tree. Scout waited while his person picked it up and tossed it again.',
      questions: [
        {
          q: 'What color was the ball?',
          choices: ['Blue', 'Red', 'Black', 'White'],
          answer: 1
        },
        {
          q: 'Where did the ball roll?',
          choices: ['Under the apple tree', 'Into the house', 'Down a hill only', 'Onto a roof'],
          answer: 0
        },
        {
          q: 'What did Scout do while waiting?',
          choices: ['Ran away', 'Waited for the toss', 'Ate the ball', 'Dug a hole'],
          answer: 1
        }
      ]
    },
    {
      id: 'r10',
      title: 'Window Seat',
      text: 'Pepper the cat sat on the wide windowsill. Birds hopped on the feeder outside. Pepper blinked slowly and kept her paws tucked neat and warm.',
      questions: [
        {
          q: 'Where did Pepper sit?',
          choices: ['On the wide windowsill', 'In a box outside', 'On the stairs', 'In the sink'],
          answer: 0
        },
        {
          q: 'What hopped on the feeder?',
          choices: ['Frogs', 'Birds', 'Dogs', 'Squirrels only'],
          answer: 1
        },
        {
          q: 'How did Pepper keep her paws?',
          choices: ['Spread wide', 'Tucked neat and warm', 'Wet from rain', 'Covered in mud'],
          answer: 1
        }
      ]
    },
    {
      id: 'r11',
      title: 'Lettuce Lunch',
      text: 'Daisy the bunny sniffed a leaf of lettuce in her bowl. She took small bites and chewed carefully. After lunch she cleaned her whiskers with both front paws.',
      questions: [
        {
          q: 'What was in Daisy’s bowl?',
          choices: ['Carrot cake', 'A leaf of lettuce', 'Soup', 'Nuts'],
          answer: 1
        },
        {
          q: 'How did she eat?',
          choices: ['In one gulp', 'Small bites, carefully', 'Without chewing', 'Standing on a chair'],
          answer: 1
        },
        {
          q: 'What did she clean after lunch?',
          choices: ['The floor', 'Her whiskers', 'A plate', 'A window'],
          answer: 1
        }
      ]
    },
    {
      id: 'r12',
      title: 'Quiet Nest',
      text: 'Ash the owl lined a nest box with dry leaves. The box hung on a tall oak. When wind shook the branches, Ash tucked her head and rested.',
      questions: [
        {
          q: 'What did Ash use to line the nest box?',
          choices: ['Dry leaves', 'Plastic bags', 'Wet mud', 'Metal'],
          answer: 0
        },
        {
          q: 'Where did the box hang?',
          choices: ['On a tall oak', 'Under a bridge', 'On a fence gate', 'Inside a shed'],
          answer: 0
        },
        {
          q: 'What did Ash do when the wind shook the branches?',
          choices: ['Flew to town', 'Tucked her head and rested', 'Sang loudly', 'Opened the box'],
          answer: 1
        }
      ]
    },
    {
      id: 'r13',
      title: 'Muddy Paws',
      text: 'After the rain, Milo the puppy ran through a puddle. His paws left prints on the porch. His person set out a towel by the door.',
      questions: [
        {
          q: 'What did Milo run through?',
          choices: ['A puddle', 'A tunnel', 'A store', 'A desert'],
          answer: 0
        },
        {
          q: 'Where did his paws leave prints?',
          choices: ['On the porch', 'On the ceiling', 'In the fridge', 'On a cloud'],
          answer: 0
        },
        {
          q: 'What did his person set out?',
          choices: ['A bike', 'A towel by the door', 'A drum', 'A ladder'],
          answer: 1
        }
      ]
    },
    {
      id: 'r14',
      title: 'Yarn Roll',
      text: 'Sable the kitten found a ball of soft yarn on the floor. She tapped it once and it rolled under the couch. She crouched and watched the dark space carefully.',
      questions: [
        {
          q: 'What did Sable find?',
          choices: ['A ball of soft yarn', 'A bone', 'A key', 'A shoe'],
          answer: 0
        },
        {
          q: 'Where did the yarn roll?',
          choices: ['Out the door', 'Under the couch', 'Into a pan', 'Up the stairs'],
          answer: 1
        },
        {
          q: 'What did Sable do next?',
          choices: ['Went to sleep outside', 'Crouched and watched carefully', 'Called a dog', 'Opened a window'],
          answer: 1
        }
      ]
    },
    {
      id: 'r15',
      title: 'Garden Path',
      text: 'Thistle the bunny followed the stone path between tomato plants. A ladybug rested on one leaf. Thistle paused so he would not bump the plant.',
      questions: [
        {
          q: 'What path did Thistle follow?',
          choices: ['A stone path', 'A highway', 'A riverbed', 'A rope bridge'],
          answer: 0
        },
        {
          q: 'What rested on one leaf?',
          choices: ['A frog', 'A ladybug', 'A bird nest', 'A hat'],
          answer: 1
        },
        {
          q: 'Why did Thistle pause?',
          choices: ['To not bump the plant', 'To catch a bus', 'To dig a hole', 'To bark'],
          answer: 0
        }
      ]
    },
    {
      id: 'r16',
      title: 'Dawn Light',
      text: 'At dawn, Fern the owl looked out over the meadow. Mist hung low near the grass. A rabbit hopped once, then froze and listened.',
      questions: [
        {
          q: 'When did Fern look out over the meadow?',
          choices: ['At noon', 'At dawn', 'At midnight only', 'In the afternoon'],
          answer: 1
        },
        {
          q: 'Where did mist hang?',
          choices: ['Near the grass', 'Inside a jar', 'On the moon', 'Under a bed'],
          answer: 0
        },
        {
          q: 'What did the rabbit do after hopping once?',
          choices: ['Sang', 'Froze and listened', 'Flew', 'Dug under water'],
          answer: 1
        }
      ]
    }
  ];

  function getPassageById(id) {
    for (var i = 0; i < PASSAGES.length; i++) {
      if (PASSAGES[i].id === id) return PASSAGES[i];
    }
    return null;
  }

  /**
   * Pick a passage avoiding recently used ids when possible.
   */
  function pickPassage(usedIds, rng) {
    rng = rng || Math.random;
    usedIds = usedIds || [];
    var fresh = PASSAGES.filter(function (p) {
      return usedIds.indexOf(p.id) === -1;
    });
    var pool = fresh.length ? fresh : PASSAGES.slice();
    var idx = Math.floor(rng() * pool.length);
    return pool[idx];
  }

  /**
   * Expand one passage into quest tasks:
   * - one reading-display task (passage + read-aloud)
   * - then 2–3 comprehension question tasks
   */
  function passageToTasks(passage) {
    var tasks = [];
    tasks.push({
      id: 'read-pass-' + passage.id,
      type: 'reading-pass',
      mission: 'reading',
      passageId: passage.id,
      title: passage.title,
      text: passage.text,
      missCount: 0
    });
    var qs = passage.questions || [];
    for (var i = 0; i < qs.length; i++) {
      tasks.push({
        id: 'read-q-' + passage.id + '-' + i,
        type: 'reading-q',
        mission: 'reading',
        passageId: passage.id,
        title: passage.title,
        text: passage.text,
        question: qs[i].q,
        choices: qs[i].choices.slice(),
        answer: qs[i].answer,
        missCount: 0
      });
    }
    return tasks;
  }

  function checkReadingAnswer(task, choiceIndex) {
    var idx = parseInt(choiceIndex, 10);
    if (!isFinite(idx)) return { ok: false, expected: task.answer, given: null };
    return { ok: idx === task.answer, expected: task.answer, given: idx };
  }

  function processReadingAttempt(task, choiceIndex) {
    var result = checkReadingAnswer(task, choiceIndex);
    if (result.ok) {
      return {
        correct: true,
        task: task,
        message: 'Yes — that matches the story!',
        hint: null,
        reveal: false,
        done: true
      };
    }
    task.missCount = (task.missCount || 0) + 1;
    if (task.missCount === 1) {
      return {
        correct: false,
        task: task,
        message: 'Not quite — peek at the story again.',
        hint: 'Look back at the passage, then try once more.',
        reveal: false,
        done: false
      };
    }
    var correctChoice = task.choices[task.answer];
    return {
      correct: false,
      task: task,
      message: 'Here is the answer from the story.',
      hint: 'The story says: “' + correctChoice + '”. Tap that choice to continue.',
      reveal: true,
      done: false
    };
  }

  return {
    PASSAGES: PASSAGES,
    getPassageById: getPassageById,
    pickPassage: pickPassage,
    passageToTasks: passageToTasks,
    checkReadingAnswer: checkReadingAnswer,
    processReadingAttempt: processReadingAttempt
  };
});
