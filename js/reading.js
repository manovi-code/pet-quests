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
    },
    {
      id: 'r33',
      level: 3,
      title: 'Rain at the Library',
      text: 'Maple and Fern walked to the library just as the rain slowed. The path was dark and damp, so they wiped their feet on the mat and stood a moment by the door. Inside, the room smelled like paper and warm wood. A lamp glowed on the low table, and the window seat held a folded blanket.\n\nThe librarian had set out three books. One showed a boat in a storm. One showed a garden after rain. The third showed a small fox carrying a basket. Maple chose the garden book because the cover looked like the path they had just walked. Fern chose the fox book and traced the basket with one careful paw.\n\nThey read without rushing. When Maple did not know a word, she looked at the picture and then tried the word again. Fern waited and did not laugh. At the end of the chapter, the garden in the story had a bright puddle, just like the one by the real library steps. The two friends marked the page with a leaf and agreed to read the next chapter tomorrow.',
      questions: [
        {
          q: 'Why did Maple and Fern wipe their feet?',
          choices: ['The path was damp', 'The floor was made of snow', 'They were painting', 'The bell told them to'],
          answer: 0
        },
        {
          q: 'Which book did Maple choose?',
          choices: ['The garden book', 'The boat book', 'A blank notebook', 'The bakery menu'],
          answer: 0
        },
        {
          q: 'What did they use to mark the page?',
          choices: ['A leaf', 'A shoe', 'A bell', 'A bucket of paint'],
          answer: 0
        }
      ]
    },
    {
      id: 'r34',
      level: 3,
      title: 'Morning at the Zoo Gate',
      text: 'The zoo gate opened just after breakfast. Maple carried a small notebook, and Fern carried nothing but curiosity. First they stopped at the pond habitat, where two ducks made a thin silver line across the water. A keeper poured water into a low bowl and then stepped back so the animals could drink in peace.\n\nNext they visited the grassy log. A rabbit sat beside a pile of leaves and did not look at the bowl of fish in the next habitat. Maple wrote, “The rabbit chose leaves.” Fern nodded, because the rabbit’s nose stayed near the greens. They did not tap the glass. They only watched.\n\nOn the way out, a plant by the path looked droopy. The keeper let Maple tip a little water into the soil. After a short wait, the leaves looked a bit higher. Maple drew the plant twice, once thirsty and once after the drink, and Fern said the second drawing looked happier.',
      questions: [
        {
          q: 'What did the rabbit stay near?',
          choices: ['A pile of leaves', 'The bowl of fish', 'The bakery oven', 'A school bell'],
          answer: 0
        },
        {
          q: 'What did Maple and Fern not do at the glass?',
          choices: ['They did not tap it', 'They broke it', 'They painted it', 'They hid it'],
          answer: 0
        },
        {
          q: 'What changed after the plant got water?',
          choices: ['The leaves looked a bit higher', 'The plant walked away', 'The ducks left town', 'The notebook closed itself'],
          answer: 0
        }
      ]
    },
    {
      id: 'r35',
      level: 3,
      title: 'The Helper’s Desk',
      text: 'A paper on the helper’s desk said a small pet was waiting. The note listed three calm clues: a red collar, a blue bandana, and long soft ears. Maple read the clues out loud once, then again more slowly. Fern pointed at the words with a paw and did not rush.\n\nThey matched the red collar to Sunny the puppy, because the drawing next to that name showed a red band around the neck. The blue bandana matched Pip the kitten. The long soft ears matched Bramble the bunny. Each match went on a separate card so the clues did not get mixed.\n\nWhen the cards were finished, a helper smiled and said the pets were safe and heading home. Nobody was in trouble. Maple and Fern washed their paws, left the cards in a neat stack, and walked back past the star badge in the window.',
      questions: [
        {
          q: 'Which clue matched Sunny the puppy?',
          choices: ['A red collar', 'A blue bandana', 'Long soft ears', 'A loaf of bread'],
          answer: 0
        },
        {
          q: 'How did they keep the clues from getting mixed?',
          choices: ['Each match went on a separate card', 'They hid the notes', 'They rang a loud bell', 'They threw the paper away'],
          answer: 0
        },
        {
          q: 'What did the helper say about the pets?',
          choices: ['They were safe and heading home', 'They were lost forever', 'They had to stay at school', 'They could not have water'],
          answer: 0
        }
      ]
    },
    {
      id: 'r36',
      level: 3,
      title: 'A Quiet Clinic Morning',
      text: 'The clinic room was bright and quiet. A folded blanket lay on the low table, and a plant stood by the window. Maple had come to learn how animal bodies work, not for a checkup. A poster showed a simple heart and a pair of ears. The words under the heart said it beats to move blood.\n\nFern listened while Maple read. Ears help an animal hear. A nose helps an animal smell food and friends. Lungs help the body take in air. None of the pictures were scary, and nobody had to be brave about a needle because there was no needle in the lesson.\n\nAfter the reading, they filled a clean water bowl and set it on the floor. The poster said clean water is a kind habit. Maple traced the heart with a finger, then traced the ears, and told Fern each part’s job in her own words. They left the blanket smooth and the room as calm as they found it.',
      questions: [
        {
          q: 'Why did Maple come to the clinic room?',
          choices: ['To learn how animal bodies work', 'To bake bread', 'To buy a ticket', 'To paint the door'],
          answer: 0
        },
        {
          q: 'What job did the poster give the heart?',
          choices: ['It beats to move blood', 'It rings a bell', 'It stores books', 'It lights the lamp'],
          answer: 0
        },
        {
          q: 'What did they do with the water bowl?',
          choices: ['Filled it and set it on the floor', 'Hid it on the roof', 'Traded it for a bell', 'Left it empty on purpose'],
          answer: 0
        }
      ]
    },
    {
      id: 'r37',
      level: 1,
      title: 'Red Cup',
      words: [{ word: 'sip', say: 'A sip is a tiny drink.' }],
      text: 'Maple had a red cup. She took one sip. The cup stayed on the mat.',
      questions: [
        {
          q: 'What color was the cup?',
          choices: ['Red', 'Blue', 'Black', 'Green'],
          answer: 0,
          skill: 'detail'
        },
        {
          q: 'Where did the cup stay?',
          choices: ['On the mat', 'In the pond', 'On the roof', 'In a boot'],
          answer: 0,
          skill: 'detail'
        }
      ]
    },
    {
      id: 'r38',
      level: 1,
      title: 'Soft Mat',
      words: [{ word: 'mat', say: 'A mat is a small rug by the door.' }],
      text: 'A soft mat sat by the door. Maple sat on it. She did not rush.',
      questions: [
        {
          q: 'Where was the mat?',
          choices: ['By the door', 'In a tree', 'On a boat', 'In the oven'],
          answer: 0,
          skill: 'detail'
        },
        {
          q: 'What did Maple do on the mat?',
          choices: ['She sat', 'She swam', 'She rang a bell', 'She hid a book'],
          answer: 0,
          skill: 'detail'
        }
      ]
    },
    {
      id: 'r39',
      level: 1,
      title: 'Big Hat',
      words: [{ word: 'brim', say: 'The brim is the edge of a hat.' }],
      text: 'Fern had a big hat. The brim was wide. Maple looked up and smiled.',
      questions: [
        {
          q: 'Who had a big hat?',
          choices: ['Fern', 'A fish', 'A train', 'A bell'],
          answer: 0,
          skill: 'detail'
        },
        {
          q: 'What did Maple do?',
          choices: ['Looked up and smiled', 'Ran to the pond', 'Ate the hat', 'Closed the shop'],
          answer: 0,
          skill: 'sequence'
        }
      ]
    },
    {
      id: 'r40',
      level: 1,
      title: 'Pet Nap',
      words: [{ word: 'nap', say: 'A nap is a short rest.' }],
      text: 'After a walk, Maple took a nap. The room was quiet. She woke up soft and slow.',
      questions: [
        {
          q: 'When did Maple take a nap?',
          choices: ['After a walk', 'Before breakfast', 'On a boat', 'At the bakery'],
          answer: 0,
          skill: 'sequence'
        },
        {
          q: 'How was the room?',
          choices: ['Quiet', 'Full of drums', 'Very wet', 'Dark as a cave'],
          answer: 0,
          skill: 'detail'
        }
      ]
    },
    {
      id: 'r41',
      level: 2,
      title: 'Tidy Shelf',
      words: [{ word: 'tidy', say: 'Tidy means neat and in a good order.' }],
      text: 'Maple helped make the shelf tidy. She stood each book in a neat row and left a small space for a new one. Fern handed her a blue book. Maple slid it in without bending the page.',
      questions: [
        {
          q: 'What does tidy mean in this story?',
          choices: ['Neat', 'Loud', 'Broken', 'Wet'],
          answer: 0,
          skill: 'vocabulary'
        },
        {
          q: 'What color was the book Fern handed over?',
          choices: ['Blue', 'Orange', 'Black', 'Silver'],
          answer: 0,
          skill: 'detail'
        },
        {
          q: 'What did Maple do with the blue book?',
          choices: ['Slid it onto the shelf', 'Threw it in the pond', 'Hid it in a boot', 'Used it as a plate'],
          answer: 0,
          skill: 'detail'
        }
      ]
    },
    {
      id: 'r42',
      level: 2,
      title: 'Market List',
      words: [{ word: 'list', say: 'A list is a short set of things to remember.' }],
      text: 'Maple carried a list to the market. It said apples, bread, and a red ribbon. She found the apples first, then the bread. The ribbon was last, tied in a small bow on a hook.',
      questions: [
        {
          q: 'What was on the list?',
          choices: ['Apples, bread, and a red ribbon', 'Boats and trains', 'Hats and boots only', 'A drum and a bell'],
          answer: 0,
          skill: 'detail'
        },
        {
          q: 'What did Maple find first?',
          choices: ['The apples', 'The ribbon', 'A duck', 'A lantern'],
          answer: 0,
          skill: 'sequence'
        },
        {
          q: 'What is a list in this story?',
          choices: ['Things to remember', 'A kind of soup', 'A loud bell', 'A place to swim'],
          answer: 0,
          skill: 'vocabulary'
        }
      ]
    },
    {
      id: 'r43',
      level: 2,
      title: 'Pond Path',
      words: [{ word: 'bank', say: 'Here, a bank is the ground beside the water.' }],
      text: 'Maple walked the path to the pond and sat on the grassy bank. Two ducks made a thin line on the water. She counted them once, then watched a frog hop to a flat stone.',
      questions: [
        {
          q: 'Where did Maple sit?',
          choices: ['On the grassy bank', 'In the bakery', 'On the school roof', 'Inside a train'],
          answer: 0,
          skill: 'detail'
        },
        {
          q: 'How many ducks did she count?',
          choices: ['Two', 'Ten', 'Zero', 'Seven'],
          answer: 0,
          skill: 'detail'
        },
        {
          q: 'What happened after she counted the ducks?',
          choices: ['A frog hopped to a stone', 'The pond dried up', 'She rang a bell', 'The ducks drove a truck'],
          answer: 0,
          skill: 'sequence'
        }
      ]
    },
    {
      id: 'r44',
      level: 3,
      title: 'Half a Rainy Afternoon',
      words: [
        { word: 'patient', say: 'Patient means you can wait without a fuss.' },
        { word: 'harbor', say: 'A harbor is a safe place for a boat.' }
      ],
      text: 'Rain kept Maple and Fern inside the library for a long afternoon. They picked a chapter about a small boat, a storm, and a calm harbor. The first page showed dark waves. The next page showed a lantern in a window.\n\nMaple read one paragraph and stopped when a word felt new. She looked at the picture of the harbor and tried the word again. Fern waited and did not tap the page. That wait was patient, even though nobody said the word out loud.\n\nWhen the chapter ended, the boat was tied up and the rain in the story had slowed. Outside the real window, the rain had slowed too. They marked the page with a leaf and agreed the next chapter could wait until tomorrow.',
      questions: [
        {
          q: 'What is this story mostly about?',
          choices: ['Friends reading on a rainy afternoon', 'A race across town', 'Baking four pans of rolls', 'A lost bicycle'],
          answer: 0,
          skill: 'main'
        },
        {
          q: 'What shows that Fern was patient?',
          choices: ['Fern waited and did not tap the page', 'Fern shut the book', 'Fern ran outside', 'Fern hid the leaf'],
          answer: 0,
          skill: 'inference'
        },
        {
          q: 'What does harbor mean here?',
          choices: ['A safe place for a boat', 'A loud drum', 'A kind of bread', 'A school bell'],
          answer: 0,
          skill: 'vocabulary'
        }
      ]
    },
    {
      id: 'r45',
      level: 3,
      title: 'The Quiet Platform',
      words: [
        { word: 'platform', say: 'A platform is the place where you wait for a train.' },
        { word: 'schedule', say: 'A schedule tells what time things happen.' }
      ],
      text: 'The train station was bright and not crowded. A board listed two trains. The red train would leave at 2 and stop by the pond. The blue train would leave at 4 and stop by the beach. Maple wanted the beach, so she read the schedule twice before she moved.\n\nFern pointed at the blue line and then at the clock. There was still time. They sat on a bench and shared a small apple. Maple did not stand near the edge. She kept her paws behind the yellow line because the board said to wait there.\n\nWhen the blue train arrived, they let other riders step off first. Then they found two seats by a window. Maple watched the platform slide away and said the beach stop out loud so she would not forget it.',
      questions: [
        {
          q: 'Which train should Maple take to the beach?',
          choices: ['The blue train', 'The red train', 'A boat', 'Neither train'],
          answer: 0,
          skill: 'inference'
        },
        {
          q: 'What happened first?',
          choices: ['Maple read the schedule', 'The platform slid away', 'They found window seats', 'The apple rolled under the train'],
          answer: 0,
          skill: 'sequence'
        },
        {
          q: 'What is a platform in this story?',
          choices: ['The place where you wait for a train', 'A kind of sandwich', 'A fish tank', 'A bakery shelf'],
          answer: 0,
          skill: 'vocabulary'
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
      id: 'b07',
      level: 3,
      title: '{name} Reads a Long Chapter',
      text: '{name} opened a chapter about a rainy path, a library lamp, and a fox who waited. The first page showed puddles by the steps. The next page showed three books on a low table.\n\n{name} read one paragraph, looked at the picture, and then read the next paragraph. When a word felt new, {name} said it slowly and used the picture as a hint. Nobody rushed.\n\nAt the end, the friends in the story marked their place with a leaf. {name} did the same with a paper leaf and closed the book gently. The lamp stayed on a little longer, and the room still felt calm.'
    },
    {
      id: 'b08',
      level: 3,
      title: 'Market Day with {name}',
      text: '{name} walked between the market baskets and named what was easy to see: red apples, orange carrots, and a loaf wrapped in paper. A seller smiled and pointed to the fruit basket, then the garden basket.\n\n{name} matched each food to the basket it belonged in. The apple stayed with the fruit. The carrot stayed with the garden food. The loaf stayed near the bread. {name} checked once more before moving on.\n\nOn the way home, {name} told the list out loud. Saying the names helped the picture stay clear. The baskets were still tidy when they looked back.'
    },
    {
      id: 'b05',
      level: 3,
      title: '{name} and the Library Key',
      text: 'The librarian let {name} hold the ribbon that marked the next chapter. {name} carried it carefully to the window seat and looked at the picture of a small boat. Outside, the path was still wet, so the story was a good place to stay.'
    },
    {
      id: 'b06',
      level: 1,
      title: 'A Nap for {name}',
      text: '{name} found a soft rug. {name} lay down. The room was quiet.'
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

  function wordCount(text) {
    return String(text || '').trim().split(/\s+/).length;
  }

  function preferBand(pool, grade) {
    var band = pool;
    if (grade === 1) {
      var short = pool.filter(function (p) {
        return wordCount(p.text) <= 28 && String(p.text).indexOf('\n\n') === -1 && p.words && p.words.length;
      });
      if (short.length) band = short;
    } else if (grade === 2) {
      var longer = pool.filter(function (p) { return wordCount(p.text) > 28; });
      if (longer.length) band = longer;
    } else if (grade === 4) {
      var single = pool.filter(function (p) { return String(p.text).indexOf('\n\n') === -1; });
      if (single.length) band = single;
    } else if (grade === 5) {
      var multi = pool.filter(function (p) { return String(p.text).indexOf('\n\n') !== -1; });
      if (multi.length) band = multi;
    }
    return band;
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
    pool = preferBand(pool, parseInt(options.grade, 10));
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
      words: (passage.words || []).map(function (word) {
        return { word: word.word, say: word.say };
      }),
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
        skill: qs[i].skill || 'detail',
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
