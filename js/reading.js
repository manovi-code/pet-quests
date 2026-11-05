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
    },
    {
      id: 'r17',
      level: 1,
      title: 'Little Basket',
      text: 'Maple carried a small basket to the garden. She put one red apple inside. The basket stayed light.',
      questions: [
        {
          q: 'Where did Maple carry the basket?',
          choices: ['To the garden', 'To the pond', 'To the school', 'To a car'],
          answer: 0
        },
        {
          q: 'What did she put inside?',
          choices: ['A blue cup', 'One red apple', 'A shoe', 'A book'],
          answer: 1
        }
      ]
    },
    {
      id: 'r18',
      level: 1,
      title: 'Pond Watch',
      text: 'A frog sat on a flat stone. Maple watched from the grass. The frog jumped into the pond.',
      questions: [
        {
          q: 'Where did the frog sit?',
          choices: ['On a flat stone', 'On a roof', 'In a cup', 'On a bike'],
          answer: 0
        },
        {
          q: 'What did the frog do next?',
          choices: ['Sang a song', 'Jumped into the pond', 'Opened a book', 'Climbed a tree'],
          answer: 1
        }
      ]
    },
    {
      id: 'r19',
      level: 1,
      title: 'Soft Blanket',
      text: 'Maple pulled a soft blanket to the rug. She patted it flat. Then she sat down.',
      questions: [
        {
          q: 'What did Maple pull to the rug?',
          choices: ['A wagon', 'A soft blanket', 'A ladder', 'A drum'],
          answer: 1
        },
        {
          q: 'What did she do after patting it flat?',
          choices: ['She sat down', 'She ran outside', 'She hid the rug', 'She turned off the lamp'],
          answer: 0
        }
      ]
    },
    {
      id: 'r20',
      level: 1,
      title: 'Bakery Window',
      text: 'Maple looked in the bakery window. She saw round rolls. The baker waved.',
      questions: [
        {
          q: 'What did Maple look in?',
          choices: ['The bakery window', 'A dark cave', 'A mailbox', 'A puddle'],
          answer: 0
        },
        {
          q: 'Who waved?',
          choices: ['A duck', 'The baker', 'A bus driver', 'A fish'],
          answer: 1
        }
      ]
    },
    {
      id: 'r21',
      level: 1,
      title: 'Cool Water',
      text: 'Maple’s bowl was blue. She drank cool water. Then she looked up and waited.',
      questions: [
        {
          q: 'What color was the bowl?',
          choices: ['Blue', 'Black', 'Orange', 'Silver'],
          answer: 0
        },
        {
          q: 'What did Maple drink?',
          choices: ['Warm soup', 'Cool water', 'Juice from a can', 'Milk from a jug on the porch'],
          answer: 1
        }
      ]
    },
    {
      id: 'r22',
      level: 1,
      title: 'Yellow Leaf',
      text: 'A yellow leaf fell on the path. Maple sniffed it. She left the leaf where it landed.',
      questions: [
        {
          q: 'What color was the leaf?',
          choices: ['Yellow', 'Purple', 'Black', 'Blue'],
          answer: 0
        },
        {
          q: 'What did Maple do with the leaf?',
          choices: ['She ate it', 'She left it where it landed', 'She threw it in a bin', 'She put it in a shoe'],
          answer: 1
        }
      ]
    },
    {
      id: 'r23',
      level: 1,
      title: 'Quiet Nap',
      text: 'After lunch, Maple curled up on a cushion. The room was quiet. She closed her eyes.',
      questions: [
        {
          q: 'When did Maple curl up?',
          choices: ['After lunch', 'Before breakfast', 'During a storm at sea', 'On the way to town'],
          answer: 0
        },
        {
          q: 'Where did she curl up?',
          choices: ['On a cushion', 'On a bicycle', 'In a boat', 'On the roof'],
          answer: 0
        }
      ]
    },
    {
      id: 'r24',
      level: 1,
      title: 'Fox Hello',
      text: 'Fern the fox sat by the gate. Maple walked over slowly. Fern waved a paw.',
      questions: [
        {
          q: 'Who sat by the gate?',
          choices: ['Fern the fox', 'A truck driver', 'A teacher', 'A fish'],
          answer: 0
        },
        {
          q: 'How did Maple walk over?',
          choices: ['Slowly', 'On a skateboard', 'Backward only', 'With a drum'],
          answer: 0
        }
      ]
    },
    {
      id: 'r25',
      level: 2,
      title: 'Picnic Cloth',
      text: 'Maple helped spread a red cloth under the apple tree. Two cups and a small plate sat on top. A breeze lifted one corner, and Maple held it down.',
      questions: [
        {
          q: 'Where was the cloth spread?',
          choices: ['Under the apple tree', 'Inside a car', 'On the school roof', 'Across the pond'],
          answer: 0
        },
        {
          q: 'What lifted one corner of the cloth?',
          choices: ['A breeze', 'A bicycle', 'A dog in a truck', 'A bell'],
          answer: 0
        },
        {
          q: 'What did Maple do then?',
          choices: ['Held the corner down', 'Ran to the road', 'Closed the bakery', 'Rang the school bell'],
          answer: 0
        }
      ]
    },
    {
      id: 'r26',
      level: 2,
      title: 'Library Lamp',
      text: 'The library lamp made a small warm circle on the table. Maple opened a picture book and turned one page. Outside, rain tapped the window, but the chair stayed dry.',
      questions: [
        {
          q: 'What made a warm circle on the table?',
          choices: ['The library lamp', 'A flashlight in a tent', 'The sun on the pond', 'A candle in the garden'],
          answer: 0
        },
        {
          q: 'What did Maple open?',
          choices: ['A picture book', 'A paint can', 'A window shade', 'A lunch box'],
          answer: 0
        },
        {
          q: 'What tapped the window?',
          choices: ['Rain', 'A hammer', 'A drum', 'A duck'],
          answer: 0
        }
      ]
    },
    {
      id: 'r27',
      level: 2,
      title: 'Muddy Path',
      text: 'Maple stepped around the muddy part of the path. Her paws stayed mostly clean. She shook once at the door, then waited on the mat.',
      questions: [
        {
          q: 'What did Maple step around?',
          choices: ['The muddy part of the path', 'A sleeping fox', 'A bakery cart', 'A school desk'],
          answer: 0
        },
        {
          q: 'Where did she wait?',
          choices: ['On the mat', 'In the pond', 'On the roof', 'In the bell tower'],
          answer: 0
        }
      ]
    },
    {
      id: 'r28',
      level: 2,
      title: 'Seed Packets',
      text: 'At the little stand, Maple looked at seed packets with pictures of carrots and peas. She chose the packet with the orange carrots. The seller dropped it into a paper bag.',
      questions: [
        {
          q: 'What pictures were on the packets?',
          choices: ['Carrots and peas', 'Boats and trains', 'Hats and shoes', 'Stars and moons only'],
          answer: 0
        },
        {
          q: 'Which packet did Maple choose?',
          choices: ['The one with orange carrots', 'The one with blue peas only', 'A packet of nails', 'An empty bag'],
          answer: 0
        },
        {
          q: 'Where did the seller put the packet?',
          choices: ['Into a paper bag', 'Under a stone', 'Into the pond', 'On the school bell'],
          answer: 0
        }
      ]
    },
    {
      id: 'r29',
      level: 3,
      title: 'Berry Row',
      text: 'Maple walked the garden row after the rain, counting ripe strawberries and leaving the pale ones to grow. She set the red berries in a shallow basket and carried it back along the stone path. A bee crossed the path once, and Maple stopped so it could pass.',
      questions: [
        {
          q: 'Which berries did Maple pick?',
          choices: ['The ripe red ones', 'Only the pale ones', 'Berries from the bakery', 'Berries floating in the pond'],
          answer: 0
        },
        {
          q: 'What did she carry them in?',
          choices: ['A shallow basket', 'A metal bucket from school', 'Her water bowl', 'A paper boat'],
          answer: 0
        },
        {
          q: 'Why did Maple stop on the path?',
          choices: ['So a bee could pass', 'To ring a bell', 'To hide the basket', 'To wait for a bus'],
          answer: 0
        }
      ]
    },
    {
      id: 'r30',
      level: 3,
      title: 'Morning Bread',
      text: 'Before the bakery opened, Maple waited beside the window while the loaves cooled on a wooden rack. She noticed the round rolls first, then the long ones, and saved her look for the biggest roll. Warm bread smell drifted out when the door opened.',
      questions: [
        {
          q: 'When did Maple wait by the window?',
          choices: ['Before the bakery opened', 'After the shop closed for the night', 'During a swim', 'While the school bell rang'],
          answer: 0
        },
        {
          q: 'What cooled on the wooden rack?',
          choices: ['Loaves of bread', 'Library books', 'Wet boots', 'Pond stones'],
          answer: 0
        },
        {
          q: 'What drifted out when the door opened?',
          choices: ['Warm bread smell', 'Cold wind from a cave', 'A flock of ducks', 'Chalk dust'],
          answer: 0
        }
      ]
    },
    {
      id: 'r31',
      level: 3,
      title: 'Afternoon Pond',
      text: 'In the afternoon Maple sat on the grassy bank and watched two ducks draw lines across the pond. She stacked three smooth stones and did not throw them. When a cloud covered the sun, the water turned a deeper blue and the ducks kept swimming.',
      questions: [
        {
          q: 'How many ducks did Maple watch?',
          choices: ['Two', 'Ten', 'None', 'Seven'],
          answer: 0
        },
        {
          q: 'What did she do with the stones?',
          choices: ['Stacked three and did not throw them', 'Tossed them all in at once', 'Took them to the bakery', 'Buried them under the mat'],
          answer: 0
        },
        {
          q: 'What happened when a cloud covered the sun?',
          choices: ['The water turned a deeper blue', 'The pond dried up', 'The ducks flew to school', 'The stones rolled away'],
          answer: 0
        }
      ]
    },
    {
      id: 'r32',
      level: 3,
      title: 'Story Hour',
      text: 'At story hour Maple shared a bench with Fern the fox and listened while the librarian read about a boat, a storm, and a safe harbor. Maple followed the pictures when the words felt fast. When the chapter ended, both friends stayed a moment in the quiet room.',
      questions: [
        {
          q: 'Who shared the bench with Maple?',
          choices: ['Fern the fox', 'The baker', 'A duck', 'A puppy from another town'],
          answer: 0
        },
        {
          q: 'What was the story about?',
          choices: ['A boat, a storm, and a safe harbor', 'A race across the city', 'A lost bicycle', 'A closed bakery'],
          answer: 0
        },
        {
          q: 'What did Maple do when the words felt fast?',
          choices: ['Followed the pictures', 'Left the building', 'Covered her ears', 'Rang a bell'],
          answer: 0
        }
      ]
    }
  ];

  PASSAGES.forEach(function (p) {
    if (p.level) return;
    var n = parseInt(String(p.id).replace(/\D/g, ''), 10);
    p.level = n <= 10 ? 1 : 2;
  });

  var LIBRARY_BOOKS = [
    {
      id: 'b01',
      level: 1,
      title: '{name} and the Red Ball',
      text: '{name} found a red ball by the step. The ball rolled to the grass. {name} waited, then nudged it back.'
    },
    {
      id: 'b02',
      level: 1,
      title: 'A Bowl for {name}',
      text: '{name} had a blue bowl by the door. Cool water sat in it. After a drink, {name} sat in a sunny spot.'
    },
    {
      id: 'b03',
      level: 2,
      title: '{name} Visits the Garden',
      text: '{name} walked between the flowers and stopped at the strawberry leaves. A bee was already there. {name} watched, then took the long way back to the path.'
    },
    {
      id: 'b04',
      level: 2,
      title: 'Rainy Day with {name}',
      text: 'Rain tapped the roof while {name} stayed on the rug. A blanket made a soft cave. When the rain slowed, {name} looked out and saw one bright puddle.'
    },
    {
      id: 'b05',
      level: 3,
      title: '{name} and the Library Key',
      text: 'The librarian let {name} hold the ribbon that marked the next chapter. {name} carried it carefully to the window seat and looked at the picture of a small boat. Outside, the path was still wet, so the story was a good place to stay.'
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
  function levelForGrade(grade) {
    var n = parseInt(grade, 10);
    if (n === 1 || n === 2) return 1;
    if (n === 3) return 2;
    if (n === 4 || n === 5) return 3;
    return 0;
  }

  function pickPassage(usedIds, rng, options) {
    rng = rng || Math.random;
    usedIds = usedIds || [];
    options = options || {};
    var level = levelForGrade(options.grade);
    var fresh = PASSAGES.filter(function (p) {
      return usedIds.indexOf(p.id) === -1;
    });
    var pool = fresh.length ? fresh : PASSAGES.slice();
    if (level) {
      var band = pool.filter(function (p) { return p.level === level; });
      if (!band.length) {
        band = PASSAGES.filter(function (p) { return p.level === level; });
      }
      if (band.length) pool = band;
    }
    var idx = Math.floor(rng() * pool.length);
    return pool[idx];
  }

  function fillPetName(text, petName) {
    var name = (petName && String(petName).trim()) || 'Your pet';
    return String(text || '').replace(/\{name\}/g, name);
  }

  function libraryBooks(grade, petName) {
    var level = levelForGrade(grade);
    var list = LIBRARY_BOOKS.slice();
    if (level) {
      list.sort(function (a, b) {
        var da = Math.abs((a.level || 2) - level);
        var db = Math.abs((b.level || 2) - level);
        return da - db;
      });
    }
    return list.map(function (book) {
      return {
        id: book.id,
        level: book.level,
        title: fillPetName(book.title, petName),
        text: fillPetName(book.text, petName)
      };
    });
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
    LIBRARY_BOOKS: LIBRARY_BOOKS,
    levelForGrade: levelForGrade,
    getPassageById: getPassageById,
    pickPassage: pickPassage,
    libraryBooks: libraryBooks,
    passageToTasks: passageToTasks,
    checkReadingAnswer: checkReadingAnswer,
    processReadingAttempt: processReadingAttempt
  };
});
