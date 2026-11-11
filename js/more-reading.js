/**
 * Extra pet stories, library books, and short reads.
 * Original text for Pet Quests. Loaded before reading.js.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PQMoreReading = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function ask(q, choices, answer, skill) {
    return { q: q, choices: choices, answer: answer, skill: skill || 'detail' };
  }

  function passage(id, level, title, text, questions, words) {
    var row = { id: id, level: level, title: title, text: text, questions: questions };
    if (words) {
      row.words = words.map(function (pair) {
        return { word: pair[0], say: pair[1] };
      });
    }
    return row;
  }

  function book(id, level, title, text) {
    return { id: id, level: level, title: title, text: text };
  }

  var passages = [
    passage('r46', 1, 'Warm Stone', 'Pip found a warm stone by the path. He sat on it. The stone felt smooth.', [
      ask('What did Pip find?', ['A warm stone', 'A cold boot', 'A red drum', 'A boat'], 0, 'detail'),
      ask('What did he do next?', ['He sat on it', 'He threw it', 'He hid it', 'He painted it'], 1, 'sequence')
    ], [['smooth', 'Smooth means even, with no bumps.']]),
    passage('r47', 1, 'Blue Leash', 'Mira held a blue leash in her mouth. She waited by the door. Her tail moved slowly.', [
      ask('What color was the leash?', ['Blue', 'Orange', 'Black', 'Silver'], 0, 'detail'),
      ask('Where did Mira wait?', ['By the door', 'On the roof', 'In the pond', 'On a bus'], 1, 'detail')
    ], [['leash', 'A leash is a strap used on a walk.']]),
    passage('r48', 1, 'One Feather', 'A gray feather lay on the step. Bramble sniffed it. He left the feather there.', [
      ask('Where was the feather?', ['On the step', 'In a cup', 'On a bike', 'In the oven'], 0, 'detail'),
      ask('What did Bramble do last?', ['He left the feather', 'He ate it', 'He flew away', 'He rang a bell'], 1, 'sequence')
    ], [['sniffed', 'Sniffed means smelled with care.']]),
    passage('r49', 1, 'Small Bell', 'Nix heard a small bell by the gate. She turned her head. The bell was on a collar.', [
      ask('What did Nix hear?', ['A small bell', 'A truck', 'A drum line', 'Thunder'], 0, 'detail'),
      ask('Where was the bell?', ['On a collar', 'In a tree', 'Under a bed', 'On a boat'], 1, 'detail')
    ], [['collar', 'A collar is a band around a neck.']]),
    passage('r50', 1, 'Milk Bowl', 'Tess lapped milk from a white bowl. A drop fell on her paw. She licked the paw clean.', [
      ask('What was in the bowl?', ['Milk', 'Sand', 'Paint', 'Leaves'], 0, 'detail'),
      ask('What happened after the drop fell?', ['She licked her paw', 'She ran to town', 'She hid the bowl', 'She rang a bell'], 1, 'sequence')
    ], [['lapped', 'Lapped means drank with the tongue.']]),
    passage('r51', 1, 'Red Kite', 'Clover watched a red kite in the sky. The kite dipped once. Then it climbed again.', [
      ask('What color was the kite?', ['Red', 'Only black', 'Clear', 'Brown stripes'], 0, 'detail'),
      ask('What did the kite do after it dipped?', ['It climbed again', 'It fell in the pond', 'It turned into a bird', 'It rang'], 1, 'sequence')
    ], [['dipped', 'Dipped means went down a little.']]),
    passage('r52', 1, 'Cozy Crate', 'Scout curled in a wooden crate. A blanket lined the bottom. He closed his eyes.', [
      ask('Where did Scout curl?', ['In a wooden crate', 'On a roof', 'In a car', 'On a swing'], 0, 'detail'),
      ask('What lined the bottom?', ['A blanket', 'A pile of nails', 'Cold water', 'A bell'], 1, 'detail')
    ], [['crate', 'A crate is a wooden box.']]),
    passage('r53', 1, 'Garden Hose', 'Fern stepped over a green hose. Water made a small puddle. She walked around it.', [
      ask('What color was the hose?', ['Green', 'Purple', 'Silver', 'Black'], 0, 'detail'),
      ask('What did Fern do about the puddle?', ['She walked around it', 'She swam in it', 'She drank all of it', 'She hid the hose'], 1, 'sequence')
    ], [['hose', 'A hose is a tube that carries water.']]),
    passage('r54', 1, 'Yellow Ball', 'Luna patted a yellow ball. The ball rolled to the rug. She waited for it to stop.', [
      ask('What did Luna pat?', ['A yellow ball', 'A hot pan', 'A book', 'A boot'], 0, 'detail'),
      ask('Where did the ball roll?', ['To the rug', 'Into the oven', 'Up a tree', 'Onto a bus'], 1, 'detail')
    ], [['patted', 'Patted means touched gently.']]),
    passage('r55', 1, 'Night Lamp', 'Hoot sat near a night lamp. The light was soft. He did not bump the shade.', [
      ask('What was the light like?', ['Soft', 'Sharp as a knife', 'Gone', 'Blue fire'], 0, 'detail'),
      ask('What did Hoot not do?', ['Bump the shade', 'Sit near the lamp', 'Stay still', 'Look at the light'], 1, 'detail')
    ], [['shade', 'A shade covers a lamp and softens the light.']]),
    passage('r56', 1, 'Carrot Top', 'Bramble pulled a carrot top. Dirt shook off the leaves. He set the top on the grass.', [
      ask('What did Bramble pull?', ['A carrot top', 'A bicycle', 'A bell rope', 'A fish'], 0, 'detail'),
      ask('Where did he set it?', ['On the grass', 'In a boot', 'On the roof', 'In the sink'], 1, 'detail')
    ], [['dirt', 'Dirt is loose soil.']]),
    passage('r57', 1, 'Window Seat', 'Maple hopped onto the window seat. Rain tapped the glass. She stayed dry.', [
      ask('Where did Maple hop?', ['Onto the window seat', 'Into the pond', 'Onto a bike', 'Into a truck'], 0, 'detail'),
      ask('What tapped the glass?', ['Rain', 'A hammer', 'A drum', 'A duck'], 1, 'detail')
    ], [['dry', 'Dry means not wet.']]),
    passage('r58', 1, 'Two Boots', 'Pip stood by two muddy boots. He sniffed the left one. Then he sat down.', [
      ask('How many boots were there?', ['Two', 'Ten', 'Zero', 'Seven'], 0, 'detail'),
      ask('Which boot did he sniff?', ['The left one', 'A boot on the roof', 'No boot', 'A paper boot'], 1, 'detail')
    ], [['muddy', 'Muddy means covered with wet dirt.']]),
    passage('r59', 1, 'Soft Brush', 'Mira liked the soft brush. It moved along her back. She purred once.', [
      ask('What moved along her back?', ['A soft brush', 'A cold hose', 'A bicycle', 'A bell'], 0, 'detail'),
      ask('What did Mira do at the end?', ['She purred once', 'She ran outside', 'She hid the brush', 'She rang a bell'], 1, 'sequence')
    ], [['purred', 'Purred means made a soft happy sound.']]),
    passage('r60', 1, 'Paper Boat', 'Clover saw a paper boat in a puddle. The boat turned once. She did not poke it.', [
      ask('What was in the puddle?', ['A paper boat', 'A real ship', 'A drum', 'A boot'], 0, 'detail'),
      ask('What did Clover not do?', ['Poke the boat', 'See the boat', 'Watch it turn', 'Stay by the puddle'], 1, 'detail')
    ], [['poke', 'Poke means push with a paw or finger.']]),
    passage('r61', 1, 'Tin Cup', 'Scout drank from a tin cup. The cup was cool. He set it back on the mat.', [
      ask('What was the cup made to feel like?', ['Cool', 'On fire', 'Invisible', 'Sharp'], 0, 'detail'),
      ask('Where did he set the cup?', ['On the mat', 'On the roof', 'In the pond', 'In a boot'], 1, 'detail')
    ], [['tin', 'Tin is a light metal.']]),

    passage('r62', 1, 'Market Apple', 'Maple walked to the little market with a cloth bag on her side. She chose one red apple and watched the seller drop it into the bag. On the way home she held the bag carefully so the apple would not bruise.', [
      ask('What did Maple carry?', ['A cloth bag', 'A metal drum', 'A bicycle', 'A fish tank'], 0, 'detail'),
      ask('What happened to the apple at the market?', ['The seller dropped it into the bag', 'It rolled into the street', 'It was left on the roof', 'It turned into a pie'], 1, 'sequence'),
      ask('Why did she hold the bag carefully?', ['So the apple would not bruise', 'So the bag would fly', 'So the seller would chase her', 'So the apple would hide'], 0, 'detail')
    ]),
    passage('r63', 1, 'Library Step', 'Rain had left the library steps dark and shiny. Fern wiped her paws on the mat and waited while the door opened. Inside, a lamp made a small warm circle on the nearest table.', [
      ask('Why were the steps shiny?', ['Rain had left them wet', 'Someone painted them gold', 'The sun was a lamp', 'Snow covered them'], 0, 'detail'),
      ask('What did Fern do before the door opened?', ['Wiped her paws and waited', 'Ran back to the pond', 'Rang a loud bell', 'Climbed to the roof'], 1, 'sequence'),
      ask('What made a warm circle?', ['A lamp', 'A flashlight in a tent', 'The moon', 'A candle in a boat'], 0, 'detail')
    ]),
    passage('r64', 1, 'Pond Reeds', 'Bramble sat where the reeds leaned over the pond. Two ducks drew a thin line across the water and did not come to shore. He counted them, then watched a frog hop onto a flat stone.', [
      ask('Where did Bramble sit?', ['Where the reeds leaned over the pond', 'Inside the bakery', 'On the school roof', 'In a train'], 0, 'detail'),
      ask('How many ducks did he count?', ['Two', 'Ten', 'Zero', 'Seven'], 1, 'detail'),
      ask('What happened after he counted?', ['A frog hopped onto a stone', 'The pond dried up', 'The ducks rang a bell', 'He left town'], 0, 'sequence')
    ]),
    passage('r65', 1, 'Bakery Smell', 'Before the door opened, Pip could smell warm bread from the sidewalk. He saw round rolls cooling on a rack and one long loaf beside them. The baker waved, and Pip waved a paw back.', [
      ask('What could Pip smell?', ['Warm bread', 'Wet paint', 'A campfire on a boat', 'Cold metal'], 0, 'detail'),
      ask('What was beside the round rolls?', ['One long loaf', 'A bicycle', 'A fish', 'A drum'], 1, 'detail'),
      ask('What did Pip do when the baker waved?', ['Waved a paw back', 'Ran into the street', 'Hid under a car', 'Rang the school bell'], 0, 'sequence')
    ]),
    passage('r66', 1, 'Trail Sign', 'A wooden sign pointed toward the pines. Maple read the word trail and then looked at the arrow. She stayed on the packed dirt and did not step into the muddy edge.', [
      ask('What did the sign point toward?', ['The pines', 'The ocean dock', 'A closed mine', 'The moon'], 0, 'detail'),
      ask('Which word did Maple read?', ['Trail', 'Danger', 'Closed', 'Rocket'], 1, 'vocabulary'),
      ask('Where did she keep her feet?', ['On the packed dirt', 'In the muddy edge', 'On a bicycle', 'In the creek'], 0, 'detail')
    ]),
    passage('r67', 1, 'Camp Cup', 'At the camp table, Nix set a blue cup beside a folded blanket. The cup held cool water, not cocoa. She took one sip and left the rest for later.', [
      ask('What color was the cup?', ['Blue', 'Only black', 'Clear glass with no color', 'Striped purple'], 0, 'detail'),
      ask('What was in the cup?', ['Cool water', 'Hot cocoa', 'Paint', 'Sand'], 1, 'detail'),
      ask('What did Nix do after one sip?', ['Left the rest for later', 'Poured it on the fire', 'Threw the cup', 'Gave it to a truck'], 0, 'sequence')
    ]),
    passage('r68', 1, 'Playground Gate', 'The playground gate clicked shut behind Scout. He saw four benches, a red slide, and one hop ball by the path. He chose the bench in the shade and sat before he played.', [
      ask('What clicked shut?', ['The gate', 'A treasure chest', 'A car door on the highway', 'A piano'], 0, 'detail'),
      ask('How many benches did he see?', ['Four', 'Twelve', 'Zero', 'Nine'], 1, 'detail'),
      ask('What did he do before he played?', ['Sat on the shady bench', 'Climbed the flagpole', 'Left the park', 'Rang a bell'], 0, 'sequence')
    ]),
    passage('r69', 1, 'Button Jar', 'Mira found a jar of buttons on the low shelf. Most were white, and two were red. She did not tip the jar. She only looked, then pushed it back.', [
      ask('Where was the jar?', ['On the low shelf', 'In the pond', 'On the roof', 'In a boot'], 0, 'detail'),
      ask('How many buttons were red?', ['Two', 'Twenty', 'None', 'Eleven'], 1, 'detail'),
      ask('What did Mira do with the jar?', ['Pushed it back', 'Dumped it out', 'Hid it outside', 'Filled it with water'], 0, 'sequence')
    ]),
    passage('r70', 1, 'Mailbox Flag', 'The mailbox flag was up, so Fern knew a letter was waiting. She could not open the box, but she sat beside it until her person came. The letter was a picture card of a sailboat.', [
      ask('What did the raised flag mean?', ['A letter was waiting', 'The pond was closed', 'School was over', 'A storm was inside'], 0, 'detail'),
      ask('What was on the picture card?', ['A sailboat', 'A truck race', 'A dark cave', 'A drum set'], 1, 'detail'),
      ask('What did Fern do until her person came?', ['Sat beside the mailbox', 'Opened the box herself', 'Ran to the beach', 'Hid the flag'], 0, 'sequence')
    ]),
    passage('r71', 1, 'Seed Row', 'Clover helped drop seeds into a straight row. Each seed got a little pat of soil. She counted three seeds, then stopped so the next hole could wait until tomorrow.', [
      ask('Where did the seeds go?', ['Into a straight row', 'Into the bathtub', 'Onto the roof', 'Into a boot'], 0, 'detail'),
      ask('How many seeds did she count?', ['Three', 'Thirty', 'Zero', 'Twelve'], 1, 'detail'),
      ask('Why did she stop?', ['The next hole could wait', 'The seeds ran away', 'A bell said to quit forever', 'The row caught fire'], 0, 'detail')
    ]),
    passage('r72', 1, 'Quiet Hall', 'The school hall was empty after the bell. Maple walked past three closed doors and one open closet of coats. She did not touch the coats. She was only cutting through to the yard.', [
      ask('When was the hall empty?', ['After the bell', 'During a concert', 'At lunch rush', 'Before the building existed'], 0, 'detail'),
      ask('What was open?', ['A closet of coats', 'Every classroom', 'The roof hatch', 'A tiger cage'], 1, 'detail'),
      ask('Why was Maple in the hall?', ['She was cutting through to the yard', 'She was hiding forever', 'She was painting doors', 'She was looking for a train'], 0, 'detail')
    ]),
    passage('r73', 1, 'Beach Towel', 'Pip shook sand off a striped towel and spread it above the wet line. A shell sat on one corner so the towel would not lift. He lay down and listened to the waves.', [
      ask('What held the towel down?', ['A shell', 'A bicycle', 'A bucket of paint', 'A bell'], 0, 'detail'),
      ask('Where did he spread the towel?', ['Above the wet line', 'In the water', 'On the road', 'On a roof'], 1, 'detail'),
      ask('What did he listen to?', ['The waves', 'A drum line', 'A train', 'A school bell'], 0, 'detail')
    ]),
    passage('r74', 1, 'Night Window', 'Hoot kept watch from a low branch near the window. Stars showed between two clouds. A mouse darted under a leaf, and Hoot stayed still instead of diving.', [
      ask('Where did Hoot keep watch?', ['From a low branch', 'Inside a car', 'On a boat', 'Under a bed'], 0, 'detail'),
      ask('What showed between the clouds?', ['Stars', 'Kites', 'Balloons', 'Flags'], 1, 'detail'),
      ask('What did Hoot do when the mouse darted?', ['Stayed still', 'Dove at once', 'Rang a bell', 'Flew to school'], 0, 'sequence')
    ]),
    passage('r75', 1, 'Ribbon Box', 'Luna opened a box and found a green ribbon curled like a snake. She batted it once. The ribbon slid under the chair, and she decided that was enough play.', [
      ask('What color was the ribbon?', ['Green', 'Only black', 'Clear', 'Striped orange and purple'], 0, 'detail'),
      ask('Where did the ribbon slide?', ['Under the chair', 'Out the window', 'Into the oven', 'Down the well'], 1, 'detail'),
      ask('What did Luna decide?', ['That was enough play', 'She would eat the box', 'She would leave town', 'She would hide the chair'], 0, 'sequence')
    ]),
    passage('r76', 1, 'Farm Gate', 'The farm gate had a loop of rope instead of a lock. Bramble nosed the rope and left it tied. A hen watched from the coop and did not come out.', [
      ask('What held the gate?', ['A loop of rope', 'A gold lock', 'A bicycle chain', 'Nothing at all'], 0, 'detail'),
      ask('What did Bramble do with the rope?', ['Left it tied', 'Cut it', 'Threw it in the pond', 'Wore it as a hat'], 1, 'detail'),
      ask('Where was the hen?', ['In the coop', 'On the roof of the school', 'In the mailbox', 'On a train'], 0, 'detail')
    ]),
    passage('r77', 1, 'Story Cushion', 'Maple pulled the story cushion closer to the lamp. The cushion was faded blue and still soft. She set a thin book on it and did not open the book yet.', [
      ask('What color was the cushion?', ['Faded blue', 'Bright neon green', 'Only black', 'Clear'], 0, 'detail'),
      ask('What did she set on the cushion?', ['A thin book', 'A bowl of soup', 'A pair of skates', 'A drum'], 1, 'detail'),
      ask('Did she open the book right away?', ['No', 'Yes, to the last page', 'She threw it', 'There was no book'], 0, 'detail')
    ]),
    passage('r78', 1, 'Creek Stones', 'Scout stacked three smooth stones beside the creek. The top stone wobbled, so he lifted it off and tried a flatter one. The stack stayed up the second time.', [
      ask('How many stones did he stack at first?', ['Three', 'Thirteen', 'Zero', 'Eight'], 0, 'detail'),
      ask('Why did he lift the top stone off?', ['It wobbled', 'It was a bell', 'It was on fire', 'A sign said to'], 1, 'detail'),
      ask('What happened the second time?', ['The stack stayed up', 'The creek dried', 'The stones rolled to school', 'He gave up'], 0, 'sequence')
    ]),
    passage('r79', 1, 'Coat Hook', 'Fern’s bandana hung on the lowest coat hook. She could reach it without a jump. She left it there because the walk was finished and the mat was warm.', [
      ask('Where did the bandana hang?', ['On the lowest coat hook', 'In the pond', 'On the flagpole', 'In the oven'], 0, 'detail'),
      ask('Could she reach it without a jump?', ['Yes', 'No, it was on the roof', 'Only with a ladder', 'It was gone'], 1, 'detail'),
      ask('Why did she leave it?', ['The walk was finished', 'The bandana was wet paint', 'A bell told her never to touch it', 'It belonged to a truck'], 0, 'detail')
    ]),
    passage('r80', 1, 'Picnic Napkin', 'A red napkin tried to leave the picnic cloth. Clover put a cup on the corner. The breeze stayed, but the napkin stayed too.', [
      ask('What tried to leave the cloth?', ['A red napkin', 'The whole table', 'A bicycle', 'A duck'], 0, 'detail'),
      ask('What held the corner?', ['A cup', 'A rock from the moon', 'A shoe', 'A bell'], 1, 'detail'),
      ask('What stayed along with the napkin?', ['The breeze', 'The rain storm', 'The night', 'Nothing'], 0, 'detail')
    ]),
    passage('r81', 1, 'Paint Brush', 'The art table had one clean brush and a jar of water. Pip dipped only the tip. He painted a blue line, then rinsed the brush before the paint could dry.', [
      ask('What did Pip dip?', ['Only the tip of the brush', 'His whole tail', 'A book', 'The floor'], 0, 'detail'),
      ask('What color was the line?', ['Blue', 'Invisible', 'Black and gold stripes', 'No color'], 1, 'detail'),
      ask('When did he rinse the brush?', ['Before the paint could dry', 'The next week', 'Never', 'After he left town'], 0, 'sequence')
    ]),
    passage('r82', 1, 'Bus Stop', 'Maple waited on the bench under the bus sign. The sign showed a picture of a bus, not a train. She let two people get on first, then found a seat by the window.', [
      ask('What picture was on the sign?', ['A bus', 'A boat', 'A rocket', 'A drum'], 0, 'detail'),
      ask('How many people got on before her?', ['Two', 'Twenty', 'None', 'Nine'], 1, 'detail'),
      ask('Where did she sit?', ['By the window', 'On the roof', 'In the aisle forever', 'Next to the engine'], 0, 'detail')
    ]),
    passage('r83', 1, 'Herb Pot', 'A pot of mint sat on the kitchen sill. Nix brushed one leaf and smelled her paw. The leaf smell was sharp and green, so she did not taste it.', [
      ask('What plant was in the pot?', ['Mint', 'A cactus from a book', 'A tree', 'Nothing'], 0, 'detail'),
      ask('What did the leaf smell like?', ['Sharp and green', 'Like a bakery fire', 'Like nothing', 'Like paint'], 1, 'detail'),
      ask('Did Nix taste the leaf?', ['No', 'Yes, a whole bunch', 'She fed it to a fish', 'She could not find it'], 0, 'detail')
    ]),
    passage('r84', 1, 'Lost Mitten', 'One red mitten lay under the porch swing. Bramble pulled it out and carried it to the step. He did not know whose it was, so he left it where a person would see it.', [
      ask('Where was the mitten at first?', ['Under the porch swing', 'In the pond', 'On the school bell', 'In a nest'], 0, 'detail'),
      ask('What color was it?', ['Red', 'Clear', 'Only black', 'Striped green'], 1, 'detail'),
      ask('Why did he leave it on the step?', ['So a person would see it', 'So it would blow away', 'So a bird could wear it', 'So he could bury it'], 0, 'detail')
    ]),
    passage('r85', 1, 'Clock Tick', 'The kitchen clock ticked while Scout waited for his bowl. He knew the sound meant time was passing, not that he should worry. When the bowl arrived, he ate slowly.', [
      ask('What sound did Scout hear?', ['The clock ticking', 'A parade drum', 'Thunder', 'A train'], 0, 'detail'),
      ask('What did the sound mean to him?', ['Time was passing', 'He should panic', 'School was closed forever', 'The house was moving'], 1, 'vocabulary'),
      ask('How did he eat?', ['Slowly', 'Without stopping to breathe', 'He did not eat', 'He fed the clock'], 0, 'detail')
    ]),
    passage('r86', 1, 'Leaf Boat', 'Clover set a dry leaf on the creek and let it be a boat. The leaf spun once and caught on a twig. She freed the twig’s end and the leaf moved on.', [
      ask('What did Clover use as a boat?', ['A dry leaf', 'A real canoe', 'A shoe', 'A book'], 0, 'detail'),
      ask('What caught the leaf?', ['A twig', 'A fish', 'A bell', 'A bridge'], 1, 'detail'),
      ask('What did she do next?', ['Freed the twig so the leaf could move', 'Sank the leaf', 'Dammed the creek', 'Went home without looking'], 0, 'sequence')
    ]),
    passage('r87', 1, 'Porch Swing', 'The porch swing moved a little in the wind. Fern sat in the middle so it would not tip. She kept both paws on the cushion and watched the yard.', [
      ask('Why did Fern sit in the middle?', ['So the swing would not tip', 'So she could jump off', 'The ends were broken glass', 'A sign said only the middle existed'], 0, 'detail'),
      ask('Where were her paws?', ['On the cushion', 'On the ground dragging', 'Over her eyes', 'On the bell'], 1, 'detail'),
      ask('What did she watch?', ['The yard', 'A movie', 'The inside of a box', 'Nothing, her eyes were shut'], 0, 'detail')
    ]),
    passage('r88', 1, 'String Lights', 'Small string lights hung along the bakery awning. They were not on yet. Pip sat under them and waited for the sky to dim before he looked again.', [
      ask('Where did the lights hang?', ['Along the bakery awning', 'Under the pond', 'Inside a boot', 'On a kite'], 0, 'detail'),
      ask('Were the lights on?', ['Not yet', 'Yes, all of them', 'Only one was a fire', 'They had fallen'], 1, 'detail'),
      ask('What was Pip waiting for?', ['The sky to dim', 'A parade to start', 'The door to lock forever', 'Snow'], 0, 'detail')
    ]),
    passage('r89', 1, 'Map Pencil', 'Maple kept a short pencil with the trail map. The pencil had no eraser, so she made small marks she could live with. She put the cap back on before the pencil could roll.', [
      ask('What was wrong with the pencil?', ['It had no eraser', 'It was a pen', 'It was longer than her arm', 'It was made of water'], 0, 'detail'),
      ask('Why were her marks small?', ['She could not erase them', 'The map was a secret code', 'The pencil only wrote dots', 'Someone said to'], 1, 'detail'),
      ask('What did she do before the pencil could roll?', ['Put the cap back on', 'Threw it', 'Snapped it', 'Left it on the ground'], 0, 'sequence')
    ]),

    passage('r90', 2, 'Shelf Order', 'Maple slid the picture books into a neat row and left a gap for one more. The word tidy means neat and in a good order. Fern handed her a blue book. Maple checked the gap, then slid the book in without bending a page.', [
      ask('What does tidy mean here?', ['Neat and in a good order', 'Loud', 'Broken', 'Wet'], 0, 'vocabulary'),
      ask('What color was the book Fern handed over?', ['Blue', 'Orange', 'Black', 'Silver'], 1, 'detail'),
      ask('What did Maple do before she slid the book in?', ['Checked the gap', 'Closed the library', 'Ran outside', 'Hid the shelf'], 0, 'sequence')
    ]),
    passage('r91', 2, 'List at the Market', 'A list is a short set of things to remember. Maple’s list said apples, bread, and a red ribbon. She found the apples first, then the bread. The ribbon was last, tied in a bow on a hook by the door.', [
      ask('What is a list in this story?', ['Things to remember', 'A kind of soup', 'A loud bell', 'A place to swim'], 0, 'vocabulary'),
      ask('What did she find first?', ['The apples', 'The ribbon', 'A duck', 'A lantern'], 1, 'sequence'),
      ask('Where was the ribbon?', ['On a hook by the door', 'In the pond', 'Under a bench', 'In a boot'], 0, 'detail')
    ]),
    passage('r92', 2, 'Grassy Bank', 'Here, a bank is the ground beside the water. Maple sat on the grassy bank and counted two ducks. After that, a frog hopped to a flat stone and stayed. She did not throw the stones she had stacked.', [
      ask('What does bank mean in this story?', ['The ground beside the water', 'A place that stores coins', 'A steep roof', 'A kind of bread'], 0, 'vocabulary'),
      ask('How many ducks did she count?', ['Two', 'Ten', 'Zero', 'Six'], 1, 'detail'),
      ask('What happened after she counted the ducks?', ['A frog hopped to a stone', 'The pond froze solid', 'She left on a bus', 'The ducks flew to school'], 0, 'sequence')
    ]),
    passage('r93', 2, 'Schedule Board', 'A schedule tells what time things happen. The board said the red train left at 2 and the blue train left at 4. Maple wanted the beach, and only the blue train stopped there. She read the schedule twice before she moved.', [
      ask('What is a schedule?', ['It tells what time things happen', 'It is a sandwich', 'It is a kind of leash', 'It is a puddle'], 0, 'vocabulary'),
      ask('Which train stopped at the beach?', ['The blue train', 'The red train', 'Both trains', 'Neither train'], 1, 'detail'),
      ask('What did Maple do before she moved?', ['Read the schedule twice', 'Ran onto the tracks', 'Hid the board', 'Bought a drum'], 0, 'sequence')
    ]),
    passage('r94', 2, 'Habitat Sign', 'A habitat is the kind of home an animal uses. The zoo sign said the rabbit’s habitat was grass and a low log. The duck’s habitat was the pond. Maple wrote both homes in her notebook and did not tap the glass.', [
      ask('What is a habitat?', ['The kind of home an animal uses', 'A loud game', 'A type of cookie', 'A school bell'], 0, 'vocabulary'),
      ask('What was the duck’s habitat?', ['The pond', 'A bakery oven', 'A coat closet', 'A mailbox'], 1, 'detail'),
      ask('What did Maple not do?', ['Tap the glass', 'Read the sign', 'Write in her notebook', 'Look at the rabbit'], 0, 'detail')
    ]),
    passage('r95', 2, 'Patient Wait', 'Patient means you can wait without a fuss. Fern waited while Maple sounded out a new word. Fern did not tap the page or sigh. When Maple nodded, they turned the page together.', [
      ask('What does patient mean here?', ['Waiting without a fuss', 'Running fast', 'Speaking loudly', 'Hiding'], 0, 'vocabulary'),
      ask('What did Fern not do?', ['Tap the page', 'Wait', 'Stay beside Maple', 'Watch the book'], 1, 'detail'),
      ask('What did they do when Maple nodded?', ['Turned the page together', 'Closed the library', 'Left the book on the bus', 'Started a race'], 0, 'sequence')
    ]),
    passage('r96', 2, 'Keepsake Leaf', 'A keepsake is something you keep to remember a day. Maple pressed a yellow leaf inside a folded paper. She wrote the date on the front. The leaf was dry, so it would not stain the page.', [
      ask('What is a keepsake?', ['Something kept to remember a day', 'A kind of soup', 'A loud horn', 'A place to swim'], 0, 'vocabulary'),
      ask('What color was the leaf?', ['Yellow', 'Blue', 'Black', 'Clear'], 1, 'detail'),
      ask('Why would the leaf not stain the page?', ['It was dry', 'It was made of metal', 'It was imaginary', 'It was still on the tree'], 0, 'detail')
    ]),
    passage('r97', 2, 'Observe the Pond', 'To observe means to look with care. Scout observed the pond for a whole minute before he moved. He saw a ring where a pebble could land, but he did not throw one. He only counted the ducks.', [
      ask('What does observe mean?', ['To look with care', 'To shout', 'To run away', 'To hide a clue'], 0, 'vocabulary'),
      ask('How long did he look before he moved?', ['A whole minute', 'Half a day', 'He never looked', 'One second and then he jumped'], 1, 'detail'),
      ask('What did he not throw?', ['A pebble', 'A glance', 'A smile', 'His notebook'], 0, 'detail')
    ]),
    passage('r98', 2, 'Arrive at the Gate', 'Arrive means to reach the place you were going. Maple and Fern arrived at the garden gate just as the clouds thinned. They wiped their paws, then opened the latch. The path inside was still damp from the rain.', [
      ask('What does arrive mean?', ['To reach the place you were going', 'To turn around', 'To lose a map', 'To start over'], 0, 'vocabulary'),
      ask('What happened to the clouds?', ['They thinned', 'They turned to stone', 'They fell as apples', 'They disappeared forever'], 1, 'detail'),
      ask('What did they do before they opened the latch?', ['Wiped their paws', 'Rang a bell', 'Climbed the gate', 'Left the garden'], 0, 'sequence')
    ]),
    passage('r99', 2, 'Detail in the Picture', 'A detail is a small thing you can notice. In the picture, Maple noticed a tiny boat in the corner and a lamp in a window. The big storm was easy to see. The boat was the detail that told her the harbor was near.', [
      ask('What is a detail?', ['A small thing you can notice', 'The title of a book', 'A loud noise', 'A whole chapter'], 0, 'vocabulary'),
      ask('What detail told her the harbor was near?', ['A tiny boat', 'A giant truck', 'A blank corner', 'A drum'], 1, 'detail'),
      ask('What was easy to see?', ['The big storm', 'Nothing', 'Only the back cover', 'A hidden code'], 0, 'detail')
    ]),
    passage('r100', 2, 'Array of Rolls', 'An array is rows of equal groups. The baker set rolls in 3 rows with 4 rolls in each row. Maple counted one row and then the others. She said the rows matched, so the array was fair.', [
      ask('What is an array here?', ['Rows of equal groups', 'A messy pile', 'A single roll', 'A kind of oven'], 0, 'vocabulary'),
      ask('How many rolls were in each row?', ['4', '10', '1', '12'], 1, 'detail'),
      ask('What did Maple check?', ['That the rows matched', 'That the oven was off', 'That the door was locked', 'That the rolls were hidden'], 0, 'detail')
    ]),
    passage('r101', 2, 'Trail Marker', 'Orange ribbons marked the trail where it split. A marker is a sign that keeps you on the right path. Maple touched the nearest ribbon, checked the arrow, and took the left fork toward the pines.', [
      ask('What is a marker in this story?', ['A sign that keeps you on the path', 'A kind of pen only', 'A bell', 'A lost mitten'], 0, 'vocabulary'),
      ask('What color were the ribbons?', ['Orange', 'Black', 'Clear', 'Purple stripes'], 1, 'detail'),
      ask('Which fork did she take?', ['The left fork', 'The fork back to town', 'Neither', 'The one into the creek'], 0, 'sequence')
    ]),
    passage('r102', 2, 'Borrow a Book', 'To borrow means to use something and then bring it back. Maple borrowed a book about boats. She wrote her name on the card and promised to return it on Friday. The librarian stamped the card and smiled.', [
      ask('What does borrow mean?', ['To use something and bring it back', 'To keep it forever', 'To hide it', 'To sell it'], 0, 'vocabulary'),
      ask('When did she promise to return it?', ['On Friday', 'Never', 'Next year', 'In an hour only if it rained paint'], 1, 'detail'),
      ask('What did the librarian do?', ['Stamped the card and smiled', 'Closed the library', 'Took the book back at once', 'Hid the card'], 0, 'sequence')
    ]),
    passage('r103', 2, 'Gentle Hands', 'Gentle means quiet and kind, not rough. Fern held the teacup with two careful paws. The cup was full, so she walked slowly to the table. Not one drop spilled.', [
      ask('What does gentle mean here?', ['Quiet and kind', 'Fast and loud', 'Sharp', 'Hidden'], 0, 'vocabulary'),
      ask('Why did Fern walk slowly?', ['The cup was full', 'The floor was gone', 'She was racing', 'A sign said to hop'], 1, 'detail'),
      ask('What spilled?', ['Not one drop', 'The whole pot', 'A bowl of paint', 'The table'], 0, 'detail')
    ]),
    passage('r104', 2, 'Sketch First', 'Maple sketched the pond before she added color. A sketch is a light drawing you can still change. She drew two ducks, a stone, and the reeds. Then she checked the real pond and fixed the stone’s shape.', [
      ask('What is a sketch?', ['A light drawing you can still change', 'A finished poster', 'A photograph', 'A stone tower'], 0, 'vocabulary'),
      ask('What did she draw besides the ducks and reeds?', ['A stone', 'A truck', 'A bell', 'A house'], 1, 'detail'),
      ask('When did she fix the stone’s shape?', ['After she checked the real pond', 'Before she looked', 'She never fixed it', 'The next month'], 0, 'sequence')
    ]),
    passage('r105', 2, 'Packing List', 'Before camp, Scout checked a packing list: cup, blanket, and a small lamp. He put the cup in first so it would not be crushed. The blanket went on top. The lamp fit in a side pocket.', [
      ask('What went into the bag first?', ['The cup', 'The lamp', 'The blanket', 'A drum'], 0, 'sequence'),
      ask('Why did the cup go in first?', ['So it would not be crushed', 'So it could be seen from outside', 'It was the biggest thing', 'The list said to hide it'], 1, 'detail'),
      ask('Where did the lamp fit?', ['In a side pocket', 'On his head', 'It did not fit', 'In the blanket folds only'], 0, 'detail')
    ]),
    passage('r106', 2, 'Crosswalk', 'The crosswalk sign showed a walking figure, which meant it was her turn. Maple still looked both ways. A bike was far off, so she waited one extra second and then crossed.', [
      ask('What did the walking figure mean?', ['It was her turn', 'The street was closed forever', 'She should run', 'Bikes had to stop for the day'], 0, 'vocabulary'),
      ask('What did she do even after the sign changed?', ['Looked both ways', 'Closed her eyes', 'Rode a bike', 'Turned around at once'], 1, 'detail'),
      ask('Why did she wait one extra second?', ['A bike was far off', 'She forgot the way', 'The sign broke', 'A friend called her back'], 0, 'sequence')
    ]),
    passage('r107', 2, 'Recipe Card', 'The recipe card said two scoops of berries and one scoop of yogurt. A recipe is a set of steps for making food. Maple did the berries first, then the yogurt, and stirred until the color looked even.', [
      ask('What is a recipe?', ['A set of steps for making food', 'A story about a storm', 'A kind of leash', 'A map of the town'], 0, 'vocabulary'),
      ask('What did she add first?', ['Berries', 'Yogurt', 'Nothing', 'A whole cake'], 1, 'sequence'),
      ask('How many scoops of yogurt?', ['One', 'Ten', 'Zero', 'Four'], 0, 'detail')
    ]),
    passage('r108', 2, 'Field Guide', 'A field guide is a book that helps you name what you see outside. Maple used one to check a leaf with five points. The page said that leaf was a maple. She closed the book before the wind could turn the page.', [
      ask('What is a field guide?', ['A book that helps you name what you see outside', 'A book of jokes', 'A lunch menu', 'A train ticket'], 0, 'vocabulary'),
      ask('How many points did the leaf have?', ['Five', 'Two', 'Twelve', 'None'], 1, 'detail'),
      ask('Why did she close the book?', ['So the wind would not turn the page', 'The book was blank', 'She was angry', 'A bell rang'], 0, 'detail')
    ]),
    passage('r109', 2, 'Turn the Page', 'The chapter ended at the top of the next page, not at the bottom. Maple almost stopped too soon. Fern pointed at the last two lines. They read those lines, then marked the real end with a leaf.', [
      ask('Where did the chapter actually end?', ['At the top of the next page', 'In the middle of a picture', 'On the cover', 'It did not end'], 0, 'detail'),
      ask('Who noticed the last two lines?', ['Fern', 'The baker', 'A duck', 'Nobody'], 1, 'detail'),
      ask('What did they use as a marker?', ['A leaf', 'A shoe', 'A coin', 'A pencil they lost'], 0, 'sequence')
    ]),
    passage('r110', 2, 'Measuring Cup', 'The measuring cup had lines for 1 cup and for a half cup. Maple needed a half cup of water for the plant. She filled to the lower line, checked it at eye level, and then poured.', [
      ask('Which line did she use?', ['The lower line', 'The line for 1 cup', 'There were no lines', 'A line she drew'], 0, 'detail'),
      ask('Why did she check at eye level?', ['So she could see the line clearly', 'The cup was invisible', 'Someone told her to guess', 'The plant asked'], 1, 'detail'),
      ask('What was the water for?', ['A plant', 'A soup for the class', 'Paint', 'The fish tank'], 0, 'detail')
    ]),
    passage('r111', 2, 'Two Maps', 'One map showed the town. The other showed the trail. Maple needed the trail map because the town map stopped at the last street. She folded the town map away and kept the trail map on top.', [
      ask('Why did she need the trail map?', ['The town map stopped at the last street', 'The trail map was prettier', 'The town map was wet', 'She was already lost in a store'], 0, 'detail'),
      ask('What did she do with the town map?', ['Folded it away', 'Threw it out', 'Gave it to a duck', 'Taped it to the window'], 1, 'sequence'),
      ask('Which map stayed on top?', ['The trail map', 'The town map', 'Neither', 'A third map of the ocean'], 0, 'detail')
    ]),
    passage('r112', 2, 'Whisper Shelf', 'The whisper shelf was for books you could read without a big voice. Maple chose a short chapter and read it softly to Fern. When a word felt new, she pointed at the picture instead of guessing out loud.', [
      ask('What was the whisper shelf for?', ['Books you could read without a big voice', 'Books to shout', 'Blank books', 'Cookbooks only'], 0, 'detail'),
      ask('Who listened?', ['Fern', 'The whole class', 'Nobody', 'A baker'], 1, 'detail'),
      ask('What did Maple do with a new word?', ['Pointed at the picture', 'Skipped the page', 'Closed the book', 'Asked a stranger to shout it'], 0, 'sequence')
    ]),
    passage('r113', 2, 'Rain Plan', 'The plan said: read if it rained, walk if it cleared. A plan is a choice you make before you need it. Rain tapped the window, so Maple opened the book. She did not feel stuck, because the plan had already picked the afternoon.', [
      ask('What is a plan in this story?', ['A choice you make before you need it', 'A surprise with no idea', 'A kind of umbrella', 'A lost list'], 0, 'vocabulary'),
      ask('What did the rain tell her to do?', ['Open the book', 'Start the walk', 'Cancel the day', 'Go to the beach'], 1, 'detail'),
      ask('Why did she not feel stuck?', ['The plan had already picked the afternoon', 'The rain stopped at once', 'Fern chose for her at the last second', 'There was no book'], 0, 'detail')
    ]),
    passage('r114', 2, 'Boot Scraper', 'A scraper is a stiff bar that pulls mud off boots. Scout used the scraper at the door, left boot and then right boot. Mud fell on the stone, not on the mat. He still wiped his paws after.', [
      ask('What is a scraper here?', ['A stiff bar that pulls mud off boots', 'A soft towel', 'A kind of cookie', 'A bell'], 0, 'vocabulary'),
      ask('Which boot did he clean first?', ['The left boot', 'The right boot', 'Neither', 'Both at once'], 1, 'sequence'),
      ask('Where did the mud fall?', ['On the stone', 'On the mat', 'In the kitchen', 'On the book'], 0, 'detail')
    ]),
    passage('r115', 2, 'Return the Cup', 'Maple had borrowed a tin cup from the camp box. Borrowed meant she had to bring it back. She rinsed it, set it in the box, and checked the list so the next camper would find it.', [
      ask('What did borrowed mean for the cup?', ['She had to bring it back', 'She could keep it', 'She should bury it', 'She should trade it'], 0, 'vocabulary'),
      ask('What did she do before she set it in the box?', ['Rinsed it', 'Painted it', 'Hid it', 'Filled it with sand'], 1, 'sequence'),
      ask('Why did she check the list?', ['So the next camper would find the cup', 'So she could take a second cup', 'The list was a story', 'She was looking for her name only'], 0, 'detail')
    ]),

    passage('r116', 3, 'One Calm Hour', 'Maple had one calm hour at the library and she decided not to rush it. She picked a chapter about a small boat, read the first paragraph, and stopped when a word felt new. The picture showed a harbor, which helped her try the word again. Fern waited without tapping the page. That kind of wait is patient. At the end of the hour the boat in the story was tied up, and Maple marked the page with a leaf so tomorrow would be easy to find.', [
      ask('What is this passage mostly about?', ['Using a calm hour to read without rushing', 'A race across town', 'Baking four pans of rolls', 'Losing a bicycle'], 0, 'main'),
      ask('What helped Maple with the new word?', ['The picture of a harbor', 'A loud guess', 'Closing the book', 'Skipping the chapter'], 1, 'detail'),
      ask('What does the wait show about Fern?', ['Fern was patient', 'Fern was bored and left', 'Fern hid the leaf', 'Fern read ahead and spoiled it'], 0, 'inference')
    ]),
    passage('r117', 3, 'Market Choices', 'The market had more fruit than Maple could carry, so she used the list and ignored the rest. Apples were on the list. Oranges looked good but were not written down. She put three apples in the bag, checked the list again, and paid with coins she had counted at home. On the way out she could name every item in the bag. Saying the names made the trip feel finished instead of scrambled.', [
      ask('What is the main idea?', ['A list kept the market trip clear', 'Markets are too loud to use', 'Oranges are the only fruit', 'Coins do not matter'], 0, 'main'),
      ask('Why did she leave the oranges?', ['They were not on the list', 'They were rotten', 'The seller hid them', 'She already had ten'], 1, 'inference'),
      ask('When had she counted the coins?', ['At home', 'After she left', 'She did not count them', 'The next day'], 0, 'sequence')
    ]),
    passage('r118', 3, 'Habitat Notes', 'At the zoo, Maple wrote only what she could see. The rabbit stayed by the leaves and did not look at the fish bowl in the next habitat. The duck’s wide feet pushed the water, which matched the sign about paddling. She did not tap the glass. When a plant by the path looked droopy, a keeper let her pour a little water, and the leaves lifted. Her notes said what happened, not what she wished.', [
      ask('What is this mostly about?', ['Watching animals and writing what really happened', 'Feeding every animal by hand', 'A noisy contest', 'Running through the zoo'], 0, 'main'),
      ask('Why did the rabbit ignore the fish bowl?', ['The leaves fit the rabbit, and the fish did not', 'The bowl was empty of water', 'The rabbit was asleep', 'The sign said rabbits eat fish'], 1, 'inference'),
      ask('What changed after the water?', ['The leaves lifted', 'The plant walked away', 'The ducks left', 'The notebook closed itself'], 0, 'detail')
    ]),
    passage('r119', 3, 'The Helper Cards', 'Three clues sat on the helper’s desk: a red collar, a blue bandana, and long soft ears. Maple read each clue and matched it to a drawing before she said a name. The red collar belonged with Sunny the puppy. The bandana matched Pip the kitten. The long ears matched Bramble. Separate cards kept the clues from getting mixed. A helper said the pets were safe and heading home. Nobody was in trouble.', [
      ask('What is the main idea?', ['Careful matching helped the pets head home', 'The pets were in trouble', 'Clues should be thrown away', 'Only one pet was real'], 0, 'main'),
      ask('Which clue matched Bramble?', ['Long soft ears', 'A red collar', 'A blue bandana', 'A loaf of bread'], 1, 'detail'),
      ask('Why use separate cards?', ['So the clues would not get mixed', 'So the paper would look busy', 'The helper required colors', 'Maple was hiding the notes'], 0, 'inference')
    ]),
    passage('r120', 3, 'How Bodies Work', 'The clinic poster was for learning, not a checkup. It showed ears for hearing, a nose for smelling, lungs for air, and a heart that beats to move blood. Maple read one label at a time and said each job in her own words. Fern listened and did not laugh when a word came out slowly. They filled a clean water bowl at the end because the poster called that a kind habit. The room stayed as calm as they found it.', [
      ask('What is this passage mostly about?', ['Learning the jobs of body parts', 'A scary visit', 'Baking for the clinic', 'Painting the door'], 0, 'main'),
      ask('What job did the poster give the heart?', ['It beats to move blood', 'It rings a bell', 'It stores books', 'It lights the lamp'], 1, 'detail'),
      ask('Why did they fill the water bowl?', ['The poster called clean water a kind habit', 'They were thirsty only', 'A sign said to hide it', 'The bowl was a game prize'], 0, 'inference')
    ]),
    passage('r121', 3, 'Change at the Counter', 'The fruit cost 18 coins. Maple had a 25-coin bill she had saved. She knew change meant the coins she should get back, so she did not guess. She paid, watched the seller count back, and checked that 7 coins returned to her paw. Then she put the fruit in the bag and the coins in a separate pocket so they would not get lost in the apples.', [
      ask('What is the passage mainly about?', ['Checking change carefully after paying', 'Eating the fruit in the store', 'Losing a bill', 'Arguing about a price'], 0, 'main'),
      ask('How many coins came back?', ['7', '25', '18', 'None'], 1, 'detail'),
      ask('Why put coins in a separate pocket?', ['So they would not get lost among the apples', 'The pocket was prettier', 'The seller asked her to hide them', 'She had no bag'], 0, 'inference')
    ]),
    passage('r122', 3, 'A Fair Array', 'The baker asked Maple to check an array of rolls before the tray went out. There were 4 rows and 6 rolls in each row. She counted one row fully, then looked to see that the other rows matched. One roll was missing at the end of the last row. She told the baker, and they added the roll so every row was equal. The tray looked fair when it left the kitchen.', [
      ask('What is this mostly about?', ['Checking that equal groups really match', 'Eating the rolls', 'Closing the bakery', 'Painting the tray'], 0, 'main'),
      ask('How many rolls belonged in each row?', ['6', '4', '10', '2'], 1, 'detail'),
      ask('Why did she tell the baker about the gap?', ['A missing roll meant the rows were not equal yet', 'She wanted the tray for herself', 'The oven was off', 'She could not count'], 0, 'inference')
    ]),
    passage('r123', 3, 'Reading the Weather', 'The camp card listed two signs of weather: a dropped wind and a darker cloud bank. Maple could feel the wind easing, and the clouds in the west were taller than they had been at noon. She did not panic. She rolled the blanket, capped the water, and moved the book into the tent. The card had said to prepare and keep watching, not to guess a storm that had not arrived.', [
      ask('What is the main idea?', ['She prepared because the signs were changing', 'She ignored the sky', 'Camp was canceled', 'Books should stay in the rain'], 0, 'main'),
      ask('What was happening to the wind?', ['It was easing', 'It was gone forever', 'It was a tornado', 'It was warmer only'], 1, 'detail'),
      ask('Why move the book into the tent?', ['The signs said to prepare, and a book should stay dry', 'The tent was a library', 'Fern told her to hide it', 'The card said to bury books'], 0, 'inference')
    ]),

    passage('r124', 3, 'Chapter Mark', 'Rain kept Maple and Fern in the library for a long afternoon. They chose a chapter about a boat, a storm, and a calm harbor. The first page showed dark waves. The next page showed a lantern in a window.\n\nMaple read one paragraph and stopped when a word felt new. She used the harbor picture and tried the word again. Fern waited and did not tap the page. Nobody called that wait slow. It was patient.\n\nWhen the chapter ended, the boat was tied and the story rain had eased. Outside, the real rain had eased too. They marked the page with a leaf and left the next chapter for tomorrow.', [
      ask('What is this story mostly about?', ['Friends reading on a rainy afternoon', 'A race across town', 'Baking rolls', 'A lost bicycle'], 0, 'main'),
      ask('What shows that Fern was patient?', ['Fern waited and did not tap the page', 'Fern shut the book', 'Fern ran outside', 'Fern hid the leaf'], 1, 'inference'),
      ask('What does harbor mean here?', ['A safe place for a boat', 'A loud drum', 'A kind of bread', 'A school bell'], 0, 'vocabulary')
    ], [['patient', 'Patient means you can wait without a fuss.'], ['harbor', 'A harbor is a safe place for a boat.']]),
    passage('r125', 3, 'Blue Train', 'The station was bright and not crowded. A board listed two trains. The red one left at 2 and stopped by the pond. The blue one left at 4 and stopped by the beach. Maple wanted the beach, so she read the schedule twice.\n\nFern pointed at the blue line and then at the clock. There was still time. They shared a small apple on a bench. Maple kept her paws behind the yellow line because the board said to wait there.\n\nWhen the blue train arrived, they let other riders step off first. They found window seats. Maple said the beach stop out loud so she would not forget it as the platform slid away.', [
      ask('Which train should Maple take to the beach?', ['The blue train', 'The red train', 'A boat', 'Neither train'], 0, 'inference'),
      ask('What happened first?', ['Maple read the schedule', 'The platform slid away', 'They found window seats', 'The apple rolled away'], 1, 'sequence'),
      ask('What is a platform here?', ['The place where you wait for a train', 'A kind of sandwich', 'A fish tank', 'A bakery shelf'], 0, 'vocabulary')
    ], [['platform', 'A platform is the place where you wait for a train.'], ['schedule', 'A schedule tells what time things happen.']]),
    passage('r126', 3, 'After the Rain', 'The path to the library was dark and damp, so Maple and Fern wiped their feet and stood by the door until their paws felt steady. Inside, the room smelled like paper and warm wood.\n\nThree books waited on a low table. One showed a boat in a storm. One showed a garden after rain. One showed a fox with a basket. Maple chose the garden book because the cover looked like the path they had just walked. Fern chose the fox book.\n\nThey read without rushing. When a word was new, Maple looked at the picture and tried again. At the end, the garden in the story had a bright puddle, like the one by the real steps. They marked the page with a leaf.', [
      ask('Why did they wipe their feet?', ['The path was damp', 'The floor was snow', 'They were painting', 'A bell told them to dance'], 0, 'detail'),
      ask('Why did Maple choose the garden book?', ['The cover looked like the path they had walked', 'It was the shortest', 'Fern told her to', 'The other books were blank'], 1, 'inference'),
      ask('What is this story mostly about?', ['Choosing a book that matched their rainy walk', 'A contest', 'Losing the leaf', 'Running home'], 0, 'main')
    ]),
    passage('r127', 3, 'Zoo Notebook', 'The zoo gate opened just after breakfast. Maple carried a notebook. Fern carried nothing but curiosity. First they stopped at the pond, where two ducks made a thin line on the water. A keeper filled a low bowl and stepped back.\n\nNext they watched a rabbit beside a pile of leaves. The rabbit did not look at the fish in the next habitat. Maple wrote, “The rabbit chose leaves.” They did not tap the glass.\n\nOn the way out, a droopy plant got a little water. After a short wait the leaves looked higher. Maple drew the plant twice, once thirsty and once after the drink. The second drawing looked happier because the leaves had lifted.', [
      ask('What did the rabbit stay near?', ['A pile of leaves', 'The bowl of fish', 'The bakery oven', 'A school bell'], 0, 'detail'),
      ask('Why did the second drawing look happier?', ['The leaves had lifted after water', 'Maple used brighter paint only', 'The plant walked', 'Fern smiled at the page'], 1, 'inference'),
      ask('What is the passage mostly about?', ['Watching closely and recording what changed', 'Feeding the ducks by hand', 'A race to the gate', 'Buying a notebook'], 0, 'main')
    ]),
    passage('r128', 3, 'Safe Clues', 'A note on the helper’s desk listed three calm clues: a red collar, a blue bandana, and long soft ears. Maple read them once, then again more slowly. Fern pointed and did not rush.\n\nThe red collar matched Sunny the puppy because the drawing showed a red band at the neck. The blue bandana matched Pip the kitten. The long ears matched Bramble the bunny. Each match went on its own card.\n\nA helper smiled and said the pets were safe and heading home. Maple and Fern washed their paws, stacked the cards, and walked past the star badge in the window. The badge meant helper. It did not mean trouble.', [
      ask('Which clue matched Sunny?', ['A red collar', 'A blue bandana', 'Long soft ears', 'A loaf of bread'], 0, 'detail'),
      ask('What does the star badge mean here?', ['Helper', 'Danger', 'Closed', 'Lost and found prize'], 1, 'vocabulary'),
      ask('Why were separate cards useful?', ['The clues did not get mixed', 'The paper looked prettier', 'The helper was hiding them', 'One card was a ticket'], 0, 'inference')
    ]),
    passage('r129', 3, 'Clinic Poster', 'The clinic room was bright and quiet. Maple had come to learn how animal bodies work, not for a checkup. A poster showed a heart and a pair of ears. The words under the heart said it beats to move blood.\n\nFern listened while Maple read the other labels. Ears help an animal hear. A nose helps an animal smell. Lungs help the body take in air. There was no needle in the lesson, and none of the pictures were scary.\n\nAfter the reading they filled a clean water bowl because the poster called that a kind habit. Maple told Fern each part’s job in her own words. They left the blanket smooth and the room calm.', [
      ask('Why did Maple come to the room?', ['To learn how animal bodies work', 'To bake bread', 'To buy a ticket', 'To paint the door'], 0, 'detail'),
      ask('What can you tell about the lesson?', ['It was for learning, and it was not frightening', 'It was a real checkup', 'It was a test she could fail', 'It was about cooking'], 1, 'inference'),
      ask('What is this mostly about?', ['Learning body jobs in a calm room', 'A noisy clinic', 'Hiding from a poster', 'Filling every bowl in town'], 0, 'main')
    ]),
    passage('r130', 3, 'Half Cup', 'The plant on the sill looked thirsty, and the card said to give it half a cup of water, not a full cup. Maple held the measuring cup at eye level so the line would not trick her.\n\nShe filled to the lower line, paused, and poured in a slow circle around the stem. Fern watched the saucer. No water ran over the edge.\n\nAn hour later the leaves looked a little higher. Maple wrote “half cup” in her notebook so she would not guess next time. The card had been more useful than a hurry.', [
      ask('Why hold the cup at eye level?', ['So the line would not trick her', 'So she could drink it', 'The card said to balance it on her nose', 'Fern could not see otherwise'], 0, 'inference'),
      ask('How much water did the card allow?', ['Half a cup', 'Two cups', 'None', 'A bucket'], 1, 'detail'),
      ask('What is the main idea?', ['Measuring carefully helped the plant', 'Plants should be soaked', 'Notebooks are optional', 'Fern poured the water'], 0, 'main')
    ]),
    passage('r131', 3, 'The Long Chapter', 'The chapter was longer than the ones Maple usually chose. She did not try to finish it fast. She read one paragraph, looked at the picture, and then read the next.\n\nWhen the word harbor showed up, she remembered it meant a safe place for a boat. When patient showed up, she thought of Fern waiting. The pictures agreed with those meanings.\n\nAt the end, the friends in the story marked their place with a leaf. Maple did the same with a paper leaf. The lamp stayed on a little longer, and the room still felt calm. Stopping at a marked page was part of reading, not a failure to finish.', [
      ask('What is this mostly about?', ['Reading a long chapter without rushing', 'Finishing every book in one hour', 'Turning off the lamp', 'A test of speed'], 0, 'main'),
      ask('What does harbor mean here?', ['A safe place for a boat', 'A loud place', 'A kind of bread', 'A school bell'], 1, 'vocabulary'),
      ask('Why was a marked page not a failure?', ['Stopping on purpose was part of reading', 'The book was too babyish', 'Fern hid the ending', 'The lamp went out'], 0, 'inference')
    ]),
    passage('r132', 3, 'Trail Choice', 'Two paths left the meadow. The left one was marked with orange ribbons and a sign that said pines. The right one had no ribbons and looked muddy.\n\nMaple checked the field guide, then the sign, then the sky. She wanted the pines, and the ribbons matched the trail she had planned. Fern waited while she folded the town map away.\n\nThey took the left path and stayed on the packed dirt. When a puddle crossed the trail, they stepped on stones instead of through the mud. The choice felt calm because the markers agreed with each other.', [
      ask('Which path did they take?', ['The left path', 'The right path', 'Neither', 'A third path to town'], 0, 'detail'),
      ask('Why was the choice calm?', ['The ribbons, the sign, and the plan agreed', 'Someone pushed them', 'The right path was shorter', 'They closed their eyes'], 1, 'inference'),
      ask('What is a field guide for?', ['Naming and checking what you see outside', 'Telling jokes', 'Listing prices', 'Drawing only people'], 0, 'vocabulary')
    ]),
    passage('r133', 3, 'Coins in Pockets', 'Before the market, Maple sorted her coins at the kitchen table. She needed 18 for the fruit and wanted the change to be easy to check. A 25-coin bill would come back as 7.\n\nAt the stall she said the price out loud, paid, and watched the seller count 7 coins into her paw. She did not drop them into the fruit bag.\n\nOn the walk home the coins stayed in a separate pocket. She could tap them and know they were still there. The fruit smelled like apples, and the pocket stayed light and separate. That was the plan.', [
      ask('What is this mostly about?', ['Keeping money and fruit from getting mixed up', 'Spending every coin', 'Arguing at the stall', 'Losing the bill'], 0, 'main'),
      ask('How much change did she expect?', ['7 coins', '25 coins', '18 coins', 'No coins'], 1, 'detail'),
      ask('Why not drop the coins into the fruit bag?', ['They would get lost among the apples', 'The bag was full of water', 'The seller forbade pockets', 'She had no paw'], 0, 'inference')
    ]),
    passage('r134', 3, 'Story and Sky', 'The camp card said to watch the sky and prepare if two signs showed up together. By late day the wind had dropped and the western clouds were taller.\n\nMaple rolled the blanket, capped the water, and took the book into the tent. She did not announce a storm. The card had said to prepare and keep watching.\n\nFern asked if they were done for the day. Maple said they could still read. The book was dry, the blanket was ready, and the sky could be checked again after one chapter. Being ready left room to stay calm.', [
      ask('What two signs showed up?', ['The wind dropped and the clouds grew taller', 'Rain and snow', 'A bell and a whistle', 'None'], 0, 'detail'),
      ask('What is the main idea?', ['Preparing early left room to stay calm', 'They had to leave camp', 'Books should stay outside', 'Fern was worried'], 1, 'main'),
      ask('Why could they still read?', ['The book was dry and they were already prepared', 'The storm was over', 'The card said to ignore weather', 'The tent was a library'], 0, 'inference')
    ]),
    passage('r135', 3, 'Equal Rows', 'The bakery tray was supposed to hold an array: 4 rows with 6 rolls in each. Maple counted the first row with her paw, one roll at a time, and got 6.\n\nThe next two rows also had 6. The last row stopped at 5. She looked twice so she would not be fixing a row that was already fair. Then she told the baker about the gap.\n\nThey added one roll. Maple counted the last row again and nodded. The tray could go out because every row matched. She liked that the check was quiet and exact, not a guess.', [
      ask('What was missing at first?', ['One roll in the last row', 'The whole tray', 'The baker', 'Four rows'], 0, 'detail'),
      ask('Why did she look twice?', ['So she would not “fix” a row that was already fair', 'She could not see', 'The baker asked her to wait an hour', 'The rolls were moving'], 1, 'inference'),
      ask('What does array mean here?', ['Rows of equal groups', 'A messy pile', 'A single roll', 'A kind of oven'], 0, 'vocabulary')
    ])
  ];

  var books = [
    book('b09', 1, '{name} and the Smooth Stone', '{name} found a smooth stone. {name} sat on it. The stone was warm.'),
    book('b10', 1, 'A Leash for {name}', '{name} held a blue leash. {name} waited by the door. Then the walk began.'),
    book('b11', 1, '{name} and the Paper Boat', 'A paper boat sat in a puddle. {name} watched it turn. {name} did not poke it.'),
    book('b12', 1, 'Buttons', '{name} saw a jar of buttons. Two buttons were red. {name} only looked.'),
    book('b13', 1, '{name} at the Gate', 'The gate had a rope. {name} left the rope tied. A hen stayed in the coop.'),
    book('b14', 1, 'The Cool Cup', '{name} drank from a tin cup. The cup was cool. {name} set it on the mat.'),
    book('b15', 2, '{name} and the Trail Arrow', '{name} read the word trail on a wooden sign. The arrow pointed toward the pines. {name} stayed on the packed dirt and kept the muddy edge for the rain.'),
    book('b16', 2, 'A List for {name}', '{name} carried a list that said apples, bread, and a ribbon. The apples came first. The ribbon was last, on a hook by the door.'),
    book('b17', 2, '{name} Borrows a Book', 'To borrow means to bring a thing back. {name} borrowed a boat book, wrote a name on the card, and promised Friday. The librarian stamped the card.'),
    book('b18', 2, 'Half a Cup', '{name} needed half a cup of water for a plant. The lower line on the cup was the one that mattered. {name} checked it at eye level, then poured.'),
    book('b19', 3, '{name} and the Marked Page', '{name} opened a long chapter about a rainy path, a library lamp, and a fox who waited. The first page showed puddles. The next page showed three books on a low table.\n\n{name} read one paragraph, looked at the picture, and then read the next. When a word felt new, {name} said it slowly and used the picture as a hint. Nobody rushed.\n\nAt the end, the friends in the story marked their place with a leaf. {name} did the same and closed the book gently. Stopping at a mark was part of the plan.'),
    book('b20', 3, 'Market Math with {name}', '{name} sorted coins before leaving home. The fruit would cost 18, and a 25-coin bill would come back as 7. At the stall, {name} watched the count and kept the change in a separate pocket.\n\nOn the way home, {name} named the fruit out loud and tapped the pocket once. The apples stayed in the bag. The coins stayed coins. The plan held.'),
    book('b21', 3, '{name} Checks the Rows', 'The tray was an array, 4 rows of 6 rolls. {name} counted one row, then checked the others. The last row had only 5.\n\n{name} looked twice, then told the baker. One roll filled the gap. Every row matched, so the tray could go out. Quiet checking had been enough.'),
    book('b22', 3, 'Sky Signs for {name}', 'The camp card listed two signs: a dropped wind and taller clouds. By late day, {name} could feel both.\n\n{name} rolled the blanket, capped the water, and moved the book into the tent. Then {name} read one chapter because being ready left room to stay calm. The sky could be checked again after the page.'),
    book('b23', 3, '{name} at the Station', 'The schedule said the blue train left at 4 and stopped by the beach. {name} read it twice, shared an apple, and stayed behind the yellow line.\n\nWhen the train came, other riders stepped off first. {name} found a window seat and said the beach stop out loud as the platform slid away. The plan was still the plan.'),
    book('b24', 3, 'Notes from the Habitat', '{name} wrote only what showed up. The rabbit stayed with the leaves. The duck’s wide feet pushed water. Nobody tapped the glass.\n\nA droopy plant got a little water, and the leaves lifted. {name} drew it twice. The second drawing looked happier because something real had changed, not because the pencil was brighter.')
  ];

  var shorts = [
    { id: 's01', level: 1, text: 'A nap is a cozy sleep.', q: 'Which word means a cozy sleep?', choices: ['nap', 'rush', 'storm'], answer: 0, hint: 'A nap is a cozy sleep.' },
    { id: 's02', level: 1, text: 'A den is a home for a pet.', q: 'Which word is a pet home?', choices: ['den', 'cloud', 'boat'], answer: 0, hint: 'A den is a home for a pet.' },
    { id: 's03', level: 1, text: 'A paw is a pet foot.', q: 'Which word is a pet foot?', choices: ['paw', 'rain', 'hill'], answer: 0, hint: 'A paw is a pet foot.' },
    { id: 's04', level: 1, text: 'Peek means a careful look.', q: 'Which word means to look closely?', choices: ['peek', 'shout', 'drop'], answer: 0, hint: 'Peek means a careful look.' },
    { id: 's05', level: 1, text: 'A mat is a small rug by the door.', q: 'Which word is a small rug by the door?', choices: ['mat', 'kite', 'bell'], answer: 0, hint: 'A mat sits by the door.' },
    { id: 's06', level: 1, text: 'A sip is a tiny drink.', q: 'Which word is a tiny drink?', choices: ['sip', 'race', 'map'], answer: 0, hint: 'A sip is a tiny drink.' },
    { id: 's07', level: 1, text: 'The brim is the edge of a hat.', q: 'Which word is the edge of a hat?', choices: ['brim', 'paw', 'nest'], answer: 0, hint: 'The brim is the hat’s edge.' },
    { id: 's08', level: 1, text: 'A crate is a wooden box.', q: 'Which word is a wooden box?', choices: ['crate', 'cloud', 'wave'], answer: 0, hint: 'A crate is a wooden box.' },
    { id: 's09', level: 2, text: 'A trail is a path you can walk.', q: 'Which word means a path you can walk?', choices: ['trail', 'kettle', 'ribbon'], answer: 0, hint: 'A trail is a path.' },
    { id: 's10', level: 2, text: 'A keepsake is something you keep to remember.', q: 'Which word means something you keep to remember?', choices: ['keepsake', 'puddle', 'ladder'], answer: 0, hint: 'A keepsake is kept to remember.' },
    { id: 's11', level: 2, text: 'Gentle means quiet and kind.', q: 'Which word means quiet and kind?', choices: ['gentle', 'noisy', 'sharp'], answer: 0, hint: 'Gentle means quiet and kind.' },
    { id: 's12', level: 2, text: 'A set is a small group of the same thing.', q: 'Which word means a small group of the same thing?', choices: ['set', 'storm', 'fence'], answer: 0, hint: 'A set is a small group.' },
    { id: 's13', level: 2, text: 'To borrow means you will bring it back.', q: 'Which word means you will bring it back?', choices: ['borrow', 'drop', 'shout'], answer: 0, hint: 'Borrow means you bring it back.' },
    { id: 's14', level: 2, text: 'A schedule tells what time things happen.', q: 'Which word tells what time things happen?', choices: ['schedule', 'pebble', 'napkin'], answer: 0, hint: 'A schedule tells the time.' },
    { id: 's15', level: 2, text: 'A habitat is an animal’s kind of home.', q: 'Which word is an animal’s kind of home?', choices: ['habitat', 'ticket', 'button'], answer: 0, hint: 'A habitat is a home that fits.' },
    { id: 's16', level: 2, text: 'Patient means you can wait without a fuss.', q: 'Which word means waiting without a fuss?', choices: ['patient', 'sudden', 'sharp'], answer: 0, hint: 'Patient means a calm wait.' },
    { id: 's17', level: 3, text: 'A nap can mean a quiet rest, and a pawn that goes home to rest can come out again.', q: 'Which word means a quiet rest, not quitting?', choices: ['nap', 'forfeit', 'rush'], answer: 0, hint: 'A nap is a rest, and then you can continue.' },
    { id: 's18', level: 3, text: 'Home at last means the walk is finished and the pet is safe.', q: 'Which phrase means the walk is finished safely?', choices: ['home at last', 'lost the path', 'start over'], answer: 0, hint: 'Home at last means the walk is finished.' },
    { id: 's19', level: 3, text: 'A detail is a small clue you can notice in a story.', q: 'Which word means a small clue in a story?', choices: ['detail', 'thunder', 'pocket'], answer: 0, hint: 'A detail is a small thing you can notice.' },
    { id: 's20', level: 3, text: 'To observe means to look with care before you decide.', q: 'Which word means to look with care?', choices: ['observe', 'sprint', 'guess'], answer: 0, hint: 'Observe means a careful look.' },
    { id: 's21', level: 3, text: 'An array is rows of equal groups.', q: 'Which word means rows of equal groups?', choices: ['array', 'pile', 'gap'], answer: 0, hint: 'An array is equal rows.' },
    { id: 's22', level: 3, text: 'A harbor is a safe place for a boat.', q: 'Which word is a safe place for a boat?', choices: ['harbor', 'ladder', 'kettle'], answer: 0, hint: 'A harbor keeps a boat safe.' },
    { id: 's23', level: 3, text: 'Arrive means to reach the end of the path.', q: 'Which word means you reached the end?', choices: ['arrive', 'wander', 'drop'], answer: 0, hint: 'Arrive means you got there.' },
    { id: 's24', level: 3, text: 'A field guide helps you name what you see outside.', q: 'Which phrase helps you name what you see outside?', choices: ['field guide', 'lunch menu', 'comic page'], answer: 0, hint: 'A field guide is for naming what you see.' }
  ];

  return { passages: passages, books: books, shorts: shorts };
});
