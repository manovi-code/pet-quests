/**
 * Pet Quests — a town that starts at home and grows as she plays.
 * Original drawings only. Unearned places and items stay off the map.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PQWorld = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var SLOT_COUNT = 6;
  var SLOTS = [
    { x: 150, y: 100 },
    { x: 70, y: 168 },
    { x: 200, y: 168 },
    { x: 260, y: 150 },
    { x: 48, y: 110 },
    { x: 250, y: 70 }
  ];

  var QUEST_ITEMS = [
    { id: 'pet-bowl', house: 'pet', name: 'a food bowl', line: 'A food bowl is ready to place at home.', kind: 'bowl', color: '#c4784a' },
    { id: 'library-seat', house: 'library', name: 'a window seat cushion', line: 'A window seat cushion is ready to place.', kind: 'cushion', color: '#c4784a' },
    { id: 'school-bell', house: 'school', name: 'a school bell', line: 'A school bell is ready to place.', kind: 'bell', color: '#e8c84a' },
    { id: 'sunny-room', house: 'pet', name: 'a sunny rug', line: 'A sunny rug is ready for a bright spot.', kind: 'rug', color: '#e8c84a' },
    { id: 'window-box', house: 'pet', name: 'a window box', line: 'A window box is ready to place.', kind: 'flower', color: '#d4564e' },
    { id: 'red-rug', name: 'a red rug', line: 'A red rug is ready to place.', kind: 'rug', color: '#c4784a' },
    { id: 'blue-lamp', name: 'a blue lamp', line: 'A blue lamp is ready to place.', kind: 'lamp', color: '#8eb4c9' },
    { id: 'fern-plant', name: 'a fern plant', line: 'A fern plant is ready to place.', kind: 'plant', color: '#7a9a68' },
    { id: 'wood-chair', name: 'a wood chair', line: 'A wood chair is ready to place.', kind: 'chair', color: '#a35f38' },
    { id: 'star-poster', name: 'a star poster', line: 'A star poster is ready to place.', kind: 'poster', color: '#e8c84a' },
    { id: 'soft-pillow', name: 'a soft pillow', line: 'A soft pillow is ready to place.', kind: 'cushion', color: '#e07a5f' },
    { id: 'reading-lamp', name: 'a reading lamp', line: 'A reading lamp is ready to place.', kind: 'lamp', color: '#f0e0a0' },
    { id: 'toy-ball', name: 'a toy ball', line: 'A toy ball is ready to place.', kind: 'toy', color: '#d4564e' },
    { id: 'round-clock', name: 'a round clock', line: 'A round clock is ready to place.', kind: 'clock', color: '#5f7a52' },
    { id: 'check-cloth', name: 'a checked cloth', line: 'A checked cloth is ready to place.', kind: 'cloth', color: '#c4784a' },
    { id: 'flower-vase', name: 'a flower vase', line: 'A flower vase is ready to place.', kind: 'vase', color: '#7a9a68' },
    { id: 'cozy-basket', name: 'a cozy basket', line: 'A cozy basket is ready to place.', kind: 'basket', color: '#e8c49a' },
    { id: 'moon-poster', name: 'a moon poster', line: 'A moon poster is ready to place.', kind: 'poster', color: '#8eb4c9' },
    { id: 'striped-rug', name: 'a striped rug', line: 'A striped rug is ready to place.', kind: 'rug', color: '#5f7a52' },
    { id: 'little-teapot', name: 'a little teapot', line: 'A little teapot is ready to place.', kind: 'mug', color: '#d7e6ef' },
    { id: 'picture-frame', name: 'a picture frame', line: 'A picture frame is ready to place.', kind: 'frame', color: '#a35f38' },
    { id: 'wool-blanket', name: 'a wool blanket', line: 'A wool blanket is ready to place.', kind: 'blanket', color: '#c4784a' },
    { id: 'paper-kite', name: 'a paper kite', line: 'A paper kite is ready to place.', kind: 'poster', color: '#e07a5f' },
    { id: 'night-scarf', name: 'a soft scarf', line: 'A soft scarf is ready to place.', kind: 'cloth', color: '#7a8f6a' },
    { id: 'tiny-drum', name: 'a tiny drum', line: 'A tiny drum is ready to place.', kind: 'toy', color: '#a35f38' }
  ];

  var PLACE_ITEMS = [
    { id: 'lib-books', fromPlace: 'library', name: 'a stack of books', kind: 'book', color: '#c4784a' },
    { id: 'lib-lamp', fromPlace: 'library', name: 'a library lamp', kind: 'lamp', color: '#5f7a52' },
    { id: 'school-apple', fromPlace: 'school', name: 'an apple bowl', kind: 'bowl', color: '#d4564e' },
    { id: 'school-star', fromPlace: 'school', name: 'a chalk star', kind: 'poster', color: '#e8c84a' },
    { id: 'garden-pot', fromPlace: 'garden', name: 'a flower pot', kind: 'plant', color: '#d4564e' },
    { id: 'garden-bloom', fromPlace: 'garden', name: 'a garden bloom', kind: 'flower', color: '#e8c84a' },
    { id: 'bakery-loaf', fromPlace: 'bakery', name: 'a bread pillow', kind: 'cushion', color: '#e8c49a' },
    { id: 'bakery-mitt', fromPlace: 'bakery', name: 'an oven mitt', kind: 'cloth', color: '#c4784a' },
    { id: 'pond-duck', fromPlace: 'pond', name: 'a toy duck', kind: 'duck', color: '#f0e0a0' },
    { id: 'pond-stone', fromPlace: 'pond', name: 'a smooth stone', kind: 'toy', color: '#8eb4c9' },
    { id: 'friend-mug', fromPlace: 'friend', name: 'a cocoa mug', kind: 'mug', color: '#a35f38' },
    { id: 'friend-cushion', fromPlace: 'friend', name: 'a visitor cushion', kind: 'cushion', color: '#e8a05a' },
    { id: 'farm-bucket', fromPlace: 'farm', name: 'a red bucket', kind: 'bowl', color: '#d4564e' },
    { id: 'farm-hay', fromPlace: 'farm', name: 'a hay pillow', kind: 'cushion', color: '#e8c84a' },
    { id: 'market-fruit', fromPlace: 'market', name: 'a fruit bowl', kind: 'bowl', color: '#7a9a68' },
    { id: 'market-crate', fromPlace: 'market', name: 'a little crate', kind: 'basket', color: '#c4784a' },
    { id: 'play-ball', fromPlace: 'playground', name: 'a hop ball', kind: 'toy', color: '#e07a5f' },
    { id: 'play-flag', fromPlace: 'playground', name: 'a ribbon flag', kind: 'cloth', color: '#e8c84a' },
    { id: 'ice-cone', fromPlace: 'icecream', name: 'a cone pillow', kind: 'cone', color: '#e07a5f' },
    { id: 'ice-jar', fromPlace: 'icecream', name: 'a sprinkle jar', kind: 'vase', color: '#8eb4c9' },
    { id: 'fire-hose', fromPlace: 'firehouse', name: 'a toy hose', kind: 'hose', color: '#d4564e' },
    { id: 'fire-bell', fromPlace: 'firehouse', name: 'a helper bell', kind: 'bell', color: '#e8c84a' },
    { id: 'zoo-leaf', fromPlace: 'zoo', name: 'a leaf poster', kind: 'poster', color: '#7a9a68' },
    { id: 'zoo-sign', fromPlace: 'zoo', name: 'a habitat sign', kind: 'frame', color: '#5f7a52' },
    { id: 'vet-heart', fromPlace: 'vet', name: 'a heart poster', kind: 'poster', color: '#e07a5f' },
    { id: 'vet-scale', fromPlace: 'vet', name: 'a toy scale', kind: 'bowl', color: '#d7e6ef' },
    { id: 'police-badge', fromPlace: 'police', name: 'a star badge', kind: 'badge', color: '#e8c84a' },
    { id: 'police-note', fromPlace: 'police', name: 'a paw note', kind: 'poster', color: '#fffaf0' },
    { id: 'museum-leaf', fromPlace: 'museum', name: 'a fossil leaf', kind: 'frame', color: '#7a9a68' },
    { id: 'museum-vase', fromPlace: 'museum', name: 'a little vase', kind: 'vase', color: '#8eb4c9' },
    { id: 'nature-nest', fromPlace: 'nature', name: 'a twig nest', kind: 'nest', color: '#a35f38' },
    { id: 'nature-glass', fromPlace: 'nature', name: 'a pair of binoculars', kind: 'frame', color: '#5f7a52' },
    { id: 'parlor-mat', fromPlace: 'parlor', name: 'a green mat', kind: 'rug', color: '#3d6b4f' },
    { id: 'parlor-lamp', fromPlace: 'parlor', name: 'a card-table lamp', kind: 'lamp', color: '#e8c84a' }
  ];

  function act(id, label, line) {
    return { id: id, label: label, lines: [line] };
  }

  function gift(id, label, line, prizes) {
    return { id: id, label: label, bonus: true, lines: [line], prizes: prizes };
  }

  function stickers(place, sticker, decor, treat) {
    return [
      { id: place + '-sticker', name: sticker, kind: 'sticker', once: true },
      { id: place + '-decor', name: decor, kind: 'decoration', once: true },
      { id: place + '-treat', name: treat, kind: 'treat', once: false }
    ];
  }

  var HOUSES = [
    {
      id: 'pet',
      title: 'Home',
      blurb: 'Your cozy house',
      questLabel: 'Warmup at the kitchen table',
      actions: [
        {
          id: 'feed',
          label: 'Feed',
          lines: ['You share a few berries. {name} nibbles and stays close.'],
          whenUnlock: 'pet-bowl',
          unlockLines: ['You fill the bowl. {name} eats and looks pleased.']
        },
        act('play', 'Play', '{name} bats a soft ball, then flops down happy.'),
        act('tuck', 'Tuck in', 'You pull up a blanket. {name} settles in.'),
        act('window', 'Look out the window', 'The yard is quiet. A bee visits a flower.'),
        act('toy', 'Pick a toy', 'You roll a wooden ball. {name} watches it, then looks proud.'),
        act('kettle', 'Check the kettle', 'The kettle hums. The kitchen smells like warm bread.'),
        act('table', 'Sit at the kitchen table', 'The table is clear and ready for a short warmup.'),
        act('cushion', 'Sit on the reading cushion', 'The cushion is soft. A good spot for a story.'),
        act('desk', 'Sit at the desk', 'Paper and a pencil wait on the desk.'),
        {
          id: 'sunny',
          label: 'Sit in the sunny spot',
          requires: 'sunny-room',
          lines: ['Warm light fills the rug. {name} picks a bright place.']
        },
        gift('surprise', 'Look for a surprise', 'You and {name} look in a cozy corner.', [
          { id: 'pet-sticker', name: 'a paw-print sticker', kind: 'sticker', once: true },
          { id: 'pet-cushion', name: 'a soft cushion', kind: 'decoration', once: true },
          { id: 'pet-treat', name: 'a berry treat', kind: 'treat', once: false }
        ])
      ]
    },
    {
      id: 'library',
      title: 'Library',
      blurb: 'Stories and quiet',
      mission: 'reading',
      questLabel: 'Read a pet story',
      place: true,
      needsQuests: 1,
      needsActivities: 0,
      openLine: 'The library is on the map now. Stories can live there.',
      actions: [
        act('chair', 'Sit in the big chair', 'The chair is soft. A good place for a story.'),
        act('pictures', 'Look at the pictures', 'The pictures show gardens, nests, and small boats.'),
        {
          id: 'seat',
          label: 'Curl up in the window seat',
          requires: 'library-seat',
          lines: ['The window seat has a cushion. You can see the path outside.']
        },
        {
          id: 'books',
          label: 'Read an extra story',
          nav: 'library',
          lines: ['A book is waiting on the table.']
        },
        gift('bookmark', 'Find a bookmark', 'A bookmark peeks out of a picture book.', [
          { id: 'library-sticker', name: 'a book sticker', kind: 'sticker', once: true },
          { id: 'library-bookmark', name: 'a leaf bookmark', kind: 'decoration', once: true },
          { id: 'library-hint', name: 'an extra gentle hint', kind: 'hint', once: false }
        ])
      ]
    },
    {
      id: 'school',
      title: 'Schoolhouse',
      blurb: 'Chalk and a bell',
      mission: 'multiply',
      questLabel: 'Times tables on the board',
      place: true,
      needsQuests: 1,
      needsActivities: 1,
      orQuests: 2,
      openLine: 'The schoolhouse is on the map now. Times tables can live there.',
      actions: [
        act('plant', 'Water the plant', 'You give the plant a little water. Its leaves look brighter.'),
        act('doodle', 'Draw on the board', 'You draw a star on the chalkboard and leave it there.'),
        {
          id: 'bell',
          label: 'Ring the bell',
          requires: 'school-bell',
          lines: ['You ring the bell once. It sounds clear and kind.']
        },
        gift('hint-star', 'Look for a hint star', 'A paper star sits on the chalk ledge.', [
          { id: 'school-hint', name: 'an extra gentle hint', kind: 'hint', once: false },
          { id: 'school-sticker', name: 'a chalk-star sticker', kind: 'sticker', once: true }
        ])
      ]
    },
    {
      id: 'garden',
      title: 'Garden',
      blurb: 'Berries and bees',
      place: true,
      needsQuests: 2,
      needsActivities: 2,
      orQuests: 3,
      openLine: 'A garden gate opened on the map.',
      actions: [
        act('sniff', 'Smell the flowers', 'The flowers smell sweet. A bee hums and moves on.'),
        act('path', 'Walk the path', 'The stone path is warm. {name} stays close to your side.'),
        gift('pick', 'Pick a garden gift', 'You and {name} find something small among the leaves.', stickers('garden', 'a leaf sticker', 'a flower-pot decoration', 'a berry treat'))
      ]
    },
    {
      id: 'bakery',
      title: 'Bakery',
      blurb: 'Warm treats',
      place: true,
      needsQuests: 3,
      needsActivities: 3,
      orQuests: 4,
      openLine: 'The bakery door is open. It smells like fresh bread.',
      actions: [
        act('window', 'Look in the window', 'Round rolls cool on a wooden rack. The baker waves.'),
        act('smell', 'Smell the bread', 'The air is warm and soft. {name} sniffs and looks pleased.'),
        gift('treat', 'Take a bakery gift', 'The baker wraps a little gift for you and {name}.', stickers('bakery', 'a bread-loaf sticker', 'a bakery ribbon', 'a warm treat'))
      ]
    },
    {
      id: 'pond',
      title: 'Pond',
      blurb: 'Ducks and stones',
      place: true,
      needsQuests: 4,
      needsActivities: 4,
      orQuests: 5,
      openLine: 'The pond path is open. The water looks calm.',
      actions: [
        act('watch', 'Watch the ducks', 'Two ducks glide by. They leave a quiet wake.'),
        act('skip', 'Toss a pebble', 'You toss one pebble. It makes a small ring on the water.'),
        gift('stone', 'Find a pond gift', '{name} noses a smooth stone into the light.', stickers('pond', 'a duck sticker', 'a smooth-stone decoration', 'a seed treat'))
      ]
    },
    {
      id: 'friend',
      title: 'Friend\u2019s house',
      blurb: 'Fern the fox lives here',
      place: true,
      needsQuests: 5,
      needsActivities: 5,
      orQuests: 6,
      openLine: 'Fern the fox opens the door. The friend\u2019s house is ready for visits.',
      actions: [
        act('hello', 'Say hello to Fern', 'Fern the fox waves. {name} sits politely on the rug.'),
        act('cocoa', 'Share a cup', 'You share a warm cup. Nobody is in a hurry.'),
        gift('trade', 'Trade a friend gift', 'Fern the fox trades a small gift with you.', stickers('friend', 'a fox sticker', 'a visitor cushion', 'a shared treat'))
      ]
    },
    {
      id: 'farm',
      title: 'Farm',
      blurb: 'Hay and soft stalls',
      place: true,
      needsQuests: 6,
      needsActivities: 6,
      orQuests: 7,
      openLine: 'The farm lane is open.',
      actions: [
        act('hello', 'Visit the barn', 'A hen clucks softly. The hay smells dry and sweet.'),
        act('gate', 'Lean on the gate', '{name} watches a goat chew and does not rush it.'),
        gift('gift', 'Take a farm gift', 'You find a small gift by the gate.', stickers('farm', 'a hen sticker', 'a hay-bale decoration', 'a grain treat'))
      ]
    },
    {
      id: 'market',
      title: 'Market',
      blurb: 'Fruit and baskets',
      place: true,
      needsQuests: 7,
      needsActivities: 7,
      orQuests: 8,
      openLine: 'The market stalls are open.',
      actions: [
        act('look', 'Look at the fruit', 'Apples, berries, and carrots sit in tidy baskets.'),
        act('smell', 'Smell the crates', 'The crates smell like apples and fresh bread.'),
        gift('gift', 'Take a market gift', 'A seller wraps a tiny gift.', stickers('market', 'an apple sticker', 'a basket decoration', 'a fruit treat'))
      ]
    },
    {
      id: 'playground',
      title: 'Playground',
      blurb: 'Swings and soft grass',
      place: true,
      needsQuests: 8,
      needsActivities: 8,
      orQuests: 9,
      openLine: 'The playground gate is open.',
      actions: [
        act('swing', 'Try the swing', 'You swing once, slow and easy. {name} watches from the grass.'),
        act('slide', 'Look at the slide', 'The slide is smooth. You can try it when you want.'),
        gift('gift', 'Find a playground gift', 'A ribbon is tied on the bench.', stickers('playground', 'a swing sticker', 'a ribbon decoration', 'a seed treat'))
      ]
    },
    {
      id: 'icecream',
      title: 'Ice cream shop',
      blurb: 'Cool and sweet',
      place: true,
      needsQuests: 9,
      needsActivities: 9,
      orQuests: 10,
      openLine: 'The ice cream shop is open.',
      actions: [
        act('look', 'Look in the case', 'Berry, honey, and mint sit in round tubs.'),
        act('taste', 'Choose a taste', 'You pick a small taste. It is cool and sweet.'),
        gift('gift', 'Take a shop gift', 'The server adds a tiny gift to the counter.', stickers('icecream', 'a cone sticker', 'a sprinkle decoration', 'a cool treat'))
      ]
    },
    {
      id: 'firehouse',
      title: 'Firehouse',
      blurb: 'Helpers and tools',
      place: true,
      needsQuests: 10,
      needsActivities: 10,
      orQuests: 11,
      openLine: 'The firehouse door is open. The helpers wave.',
      actions: [
        act('wave', 'Wave to a helper', 'A helper waves back. The boots are lined up and ready.'),
        act('bell', 'Look at the bell', 'The bell is for calling helpers. You do not need to ring it.'),
        gift('gift', 'Take a helper gift', 'A helper shares a small gift.', stickers('firehouse', 'a bell sticker', 'a boot decoration', 'a warm treat'))
      ]
    },
    {
      id: 'zoo',
      title: 'Zoo',
      blurb: 'Habitats and animals',
      place: true,
      needsQuests: 11,
      needsActivities: 11,
      orQuests: 12,
      openLine: 'The zoo gate is open.',
      actions: [
        act('look', 'Look at a habitat', 'A rabbit rests by a log. The water dish is full.'),
        act('listen', 'Listen', 'You hear a soft splash and a quiet nibble.'),
        gift('gift', 'Take a zoo gift', 'A keeper offers a small paper gift.', stickers('zoo', 'a rabbit sticker', 'a leaf decoration', 'a crunchy treat'))
      ]
    },
    {
      id: 'vet',
      title: 'Vet clinic',
      blurb: 'A gentle learning room',
      place: true,
      needsQuests: 12,
      needsActivities: 12,
      orQuests: 13,
      openLine: 'The vet clinic is open for a gentle visit.',
      actions: [
        act('hello', 'Say hello', 'The room is calm. A blanket is folded on the table.'),
        act('blanket', 'Smooth the blanket', 'You smooth the blanket. It is only for learning and pretend.'),
        gift('gift', 'Take a clinic gift', 'You find a small sticker by the plant.', stickers('vet', 'a heart sticker', 'a bowl decoration', 'a gentle treat'))
      ]
    },
    {
      id: 'police',
      title: 'Police station',
      blurb: 'Helpers and clues',
      place: true,
      needsQuests: 13,
      needsActivities: 13,
      orQuests: 14,
      openLine: 'The helper station is open.',
      actions: [
        act('hello', 'Say hello', 'A helper smiles. The star badge means they help pets find home.'),
        act('board', 'Look at the board', 'The board has kind notes about pets who are waiting.'),
        gift('gift', 'Take a helper gift', 'The helper shares a paper star.', stickers('police', 'a star sticker', 'a badge decoration', 'a biscuit treat'))
      ]
    },
    {
      id: 'museum',
      title: 'Museum',
      blurb: 'Quiet things to notice',
      place: true,
      needsQuests: 14,
      needsActivities: 14,
      orQuests: 15,
      openLine: 'The museum doors are open.',
      actions: [
        act('frame', 'Look at a frame', 'A leaf fossil sits in a wood frame.'),
        act('bench', 'Sit on the bench', 'The bench is low and quiet. You can look as long as you like.'),
        gift('gift', 'Take a museum gift', 'A paper leaf is waiting on the bench.', stickers('museum', 'a fossil sticker', 'a frame decoration', 'a mint treat'))
      ]
    },
    {
      id: 'nature',
      title: 'Nature center',
      blurb: 'Nests and trails',
      place: true,
      needsQuests: 15,
      needsActivities: 15,
      orQuests: 16,
      openLine: 'The nature center trail is open.',
      actions: [
        act('trail', 'Walk the trail', 'The path is soft. A bird calls once and flies to a tree.'),
        act('nest', 'Look at the nest', 'The nest is empty and tidy. You only look.'),
        gift('gift', 'Take a nature gift', 'A smooth twig becomes a tiny keepsake.', stickers('nature', 'a nest sticker', 'a twig decoration', 'a seed treat'))
      ]
    },
    {
      id: 'parlor',
      title: 'Game hall',
      blurb: 'Cards and a quiet table',
      place: true,
      needsQuests: 16,
      needsActivities: 16,
      orQuests: 17,
      openLine: 'The game hall is open. A card table is ready.',
      actions: [
        act('look', 'Look at the table', 'The green table is clear. Cards wait if you want them.'),
        act('lamp', 'Turn up the lamp', 'The lamp makes a warm circle on the felt.'),
        gift('gift', 'Take a hall gift', 'A paper card is set aside as a gift.', stickers('parlor', 'a card sticker', 'a felt decoration', 'a cocoa treat'))
      ]
    },
    {
      id: 'cottage',
      legacy: true,
      title: 'Cozy cottage',
      blurb: 'Kitchen and kettle',
      actions: [
        act('kettle', 'Check the kettle', 'The kettle hums. The kitchen smells like warm bread.'),
        act('table', 'Set the table', 'You set one plate and a cup. The table looks ready.'),
        act('bread', 'Peek at the bread', 'The loaf is golden and soft. You leave it to cool.'),
        {
          id: 'flowers',
          label: 'Smell the window box',
          requires: 'window-box',
          lines: ['Flowers lean out of the window box. They smell sweet.']
        },
        gift('snack', 'Share a kitchen gift', 'You wrap a little kitchen gift for {name}.', [
          { id: 'cottage-sticker', name: 'a kettle sticker', kind: 'sticker', once: true },
          { id: 'cottage-cloth', name: 'a checked cloth', kind: 'decoration', once: true },
          { id: 'cottage-treat', name: 'a bread treat', kind: 'treat', once: false }
        ])
      ]
    }
  ];

  var UNLOCKS = QUEST_ITEMS;
  var STARTER_IDS = ['pet'];
  var LEGACY_UNLOCKS = ['pet-bowl', 'library-seat', 'school-bell', 'sunny-room', 'window-box'];

  var LOOKS = {
    pet: { wall: '#fffaf0', roof: '#c4784a', door: '#7a9a68', accent: '#e8c84a' },
    library: { wall: '#f4f7ef', roof: '#5f7a52', door: '#7a9a68', accent: '#c4784a' },
    school: { wall: '#fff6e8', roof: '#c4784a', door: '#7a9a68', accent: '#e8c84a' },
    garden: { wall: '#e7f0dc', roof: '#5f7a52', door: '#8fa87a', accent: '#d4564e' },
    bakery: { wall: '#fff6e8', roof: '#a35f38', door: '#c4784a', accent: '#e8c49a' },
    pond: { wall: '#e7f3f6', roof: '#8eb4c9', door: '#5f7a52', accent: '#f0e0a0' },
    friend: { wall: '#fffaf0', roof: '#e8a05a', door: '#c4784a', accent: '#e8a05a' },
    farm: { wall: '#f3e6c8', roof: '#a35f38', door: '#7a9a68', accent: '#e8c84a' },
    market: { wall: '#fffaf0', roof: '#d4564e', door: '#5f7a52', accent: '#e8c84a' },
    playground: { wall: '#e7f0dc', roof: '#7a9a68', door: '#c4784a', accent: '#e07a5f' },
    icecream: { wall: '#fff0f4', roof: '#e07a5f', door: '#c4784a', accent: '#f0e0a0' },
    firehouse: { wall: '#f8e8e4', roof: '#d4564e', door: '#a35f38', accent: '#e8c84a' },
    zoo: { wall: '#e7f0dc', roof: '#5f7a52', door: '#a35f38', accent: '#7a9a68' },
    vet: { wall: '#eef6f4', roof: '#7a9a68', door: '#8eb4c9', accent: '#e07a5f' },
    police: { wall: '#f7f1e6', roof: '#3d4a62', door: '#5f7a52', accent: '#e8c84a' },
    museum: { wall: '#f4efe6', roof: '#6b5344', door: '#a35f38', accent: '#8eb4c9' },
    nature: { wall: '#e7f0dc', roof: '#3d6b4f', door: '#5f7a52', accent: '#c4784a' },
    parlor: { wall: '#f3efe6', roof: '#3d6b4f', door: '#a35f38', accent: '#e8c84a' },
    cottage: { wall: '#fffaf0', roof: '#c4784a', door: '#7a9a68', accent: '#e8c84a' }
  };

  function escapeXml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function R(x, y, w, h, fill, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"' + (extra || '') + '/>';
  }

  function getHouse(id) {
    var i;
    for (i = 0; i < HOUSES.length; i++) {
      if (HOUSES[i].id === id) return HOUSES[i];
    }
    return HOUSES[0];
  }

  function houseTitle(house, petName) {
    if (house && house.id === 'pet') return (petName || 'Pet') + '\u2019s house';
    return house ? house.title : '';
  }

  function houseIdForMission(mission, state) {
    if (mission === 'reading' && state && isPlaceOpen(state, 'library')) return 'library';
    if (mission === 'multiply' && state && isPlaceOpen(state, 'school')) return 'school';
    if (mission === 'warmup' || mission === 'reading' || mission === 'multiply') return 'pet';
    var i;
    for (i = 0; i < HOUSES.length; i++) {
      if (HOUSES[i].mission === mission && !HOUSES[i].legacy) return HOUSES[i].id;
    }
    return null;
  }

  function ensureWorld(state) {
    if (!state.world || typeof state.world !== 'object' || Array.isArray(state.world)) {
      state.world = {};
    }
    var world = state.world;
    if (!Array.isArray(world.unlocks)) world.unlocks = [];
    if (!Array.isArray(world.places)) world.places = [];
    if (!Array.isArray(world.prizes)) world.prizes = [];
    if (!Array.isArray(world.questDates)) world.questDates = [];
    if (typeof world.questsFinished !== 'number') world.questsFinished = world.questDates.length;
    if (typeof world.activitiesDone !== 'number') world.activitiesDone = 0;
    if (typeof world.hintTokens !== 'number') world.hintTokens = 0;
    if (!world.activity || typeof world.activity !== 'object' || Array.isArray(world.activity)) {
      world.activity = { dateKey: null, used: {} };
    }
    if (!world.activity.used || typeof world.activity.used !== 'object') world.activity.used = {};
    if (!world.placements || typeof world.placements !== 'object' || Array.isArray(world.placements)) {
      world.placements = {};
    }
    if (!world.solitaire || typeof world.solitaire !== 'object' || Array.isArray(world.solitaire)) {
      world.solitaire = { dateKey: null, deals: 0 };
    }
    if (typeof world.migrateTown !== 'boolean') world.migrateTown = false;
    return world;
  }

  function isStarter(id) {
    return STARTER_IDS.indexOf(id) !== -1;
  }

  function isPlaceOpen(state, id) {
    if (id === 'pet' || id === 'cottage') return true;
    var world = state && state.world;
    if (!world || !Array.isArray(world.places)) return false;
    return world.places.indexOf(id) !== -1;
  }

  function visiblePlaces(state) {
    var out = [];
    var i;
    for (i = 0; i < HOUSES.length; i++) {
      if (HOUSES[i].legacy) continue;
      if (!isPlaceOpen(state, HOUSES[i].id)) continue;
      out.push(HOUSES[i]);
    }
    return out;
  }

  function mapLabel(state, petName) {
    return visiblePlaces(state).map(function (house) {
      return house.id + ':' + houseTitle(house, petName || '');
    }).join('|');
  }

  function townHint(state) {
    if (nextLockedPlace(state)) {
      return 'Something new might open when you finish today\u2019s quest.';
    }
    return 'The town feels glad you are here.';
  }

  function allItems() {
    return QUEST_ITEMS.concat(PLACE_ITEMS);
  }

  function itemById(id) {
    var items = allItems();
    var i;
    for (i = 0; i < items.length; i++) {
      if (items[i].id === id) return items[i];
    }
    return null;
  }

  function visibleItems(state) {
    var world = state && state.world;
    var unlocks = world && world.unlocks;
    var out = [];
    var items = allItems();
    var i;
    if (!unlocks) return out;
    for (i = 0; i < items.length; i++) {
      if (unlocks.indexOf(items[i].id) !== -1) out.push(items[i]);
    }
    return out;
  }

  function placeProgress(state, place) {
    var world = ensureWorld(state);
    return {
      quests: world.questsFinished || 0,
      questsNeed: place && place.needsQuests ? place.needsQuests : 0,
      activities: world.activitiesDone || 0,
      activitiesNeed: place && place.needsActivities ? place.needsActivities : 0,
      open: place ? isPlaceOpen(state, place.id) : false
    };
  }

  function placeHelp() {
    return 'Something new might open when you finish today\u2019s quest.';
  }

  function nextLockedPlace(state) {
    var i;
    for (i = 0; i < HOUSES.length; i++) {
      if (!HOUSES[i].place || HOUSES[i].legacy) continue;
      if (!isPlaceOpen(state, HOUSES[i].id)) return HOUSES[i];
    }
    return null;
  }

  function requirementMet(world, place) {
    var q = world.questsFinished || 0;
    var a = world.activitiesDone || 0;
    if (place.orQuests && q >= place.orQuests) return true;
    return q >= (place.needsQuests || 0) && a >= (place.needsActivities || 0);
  }

  function grantPlaceItems(state, placeId) {
    var world = ensureWorld(state);
    var added = [];
    var i;
    for (i = 0; i < PLACE_ITEMS.length; i++) {
      var item = PLACE_ITEMS[i];
      if (item.fromPlace !== placeId) continue;
      if (world.unlocks.indexOf(item.id) !== -1) continue;
      world.unlocks.push(item.id);
      added.push(item);
      if (added.length >= 2) break;
    }
    return added;
  }

  function checkPlaceUnlocks(state) {
    var world = ensureWorld(state);
    var opened = [];
    var i;
    for (i = 0; i < HOUSES.length; i++) {
      var place = HOUSES[i];
      if (!place.place || place.legacy) continue;
      if (world.places.indexOf(place.id) !== -1) continue;
      if (!requirementMet(world, place)) continue;
      world.places.push(place.id);
      grantPlaceItems(state, place.id);
      opened.push(place);
    }
    return opened;
  }

  function inferQuests(state) {
    var world = state.world || {};
    var stored = Math.max(world.questsFinished || 0, (world.questDates || []).length);
    var legacy = 0;
    var unlocks = world.unlocks || [];
    var i;
    for (i = 0; i < LEGACY_UNLOCKS.length; i++) {
      if (unlocks.indexOf(LEGACY_UNLOCKS[i]) !== -1) legacy += 1;
    }
    var growth = Math.floor((state.growthPoints || 0) / 10);
    return Math.max(stored, legacy, growth);
  }

  function seedQuests(world, n) {
    if (!n || n < 1) return;
    var i;
    for (i = world.questDates.length; i < n; i++) world.questDates.push('played-' + i);
    if ((world.questsFinished || 0) < world.questDates.length) {
      world.questsFinished = world.questDates.length;
    }
  }

  function syncFromProgress(state) {
    var world = ensureWorld(state);
    if (world.migrateTown) {
      seedQuests(world, inferQuests(state));
      if (world.places.indexOf('library') === -1) {
        world.places.push('library');
        grantPlaceItems(state, 'library');
      }
      if (world.places.indexOf('school') === -1) {
        world.places.push('school');
        grantPlaceItems(state, 'school');
      }
      world.migrateTown = false;
    }
    checkPlaceUnlocks(state);
    return world;
  }

  function noteQuestFinished(state, dateKey) {
    var world = ensureWorld(state);
    if (dateKey) {
      if (world.questDates.indexOf(dateKey) === -1) world.questDates.push(dateKey);
      world.questsFinished = world.questDates.length;
    } else {
      world.questsFinished = (world.questsFinished || 0) + 1;
    }
    return checkPlaceUnlocks(state);
  }

  function hasPrize(state, id) {
    var world = state && state.world;
    var list = world && world.prizes;
    var i;
    if (!list) return false;
    for (i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) return true;
    }
    return false;
  }

  function findPrize(state, id) {
    var list = state.world.prizes;
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) return list[i];
    }
    return null;
  }

  function grantPrize(state, prize) {
    var world = ensureWorld(state);
    if (!prize) return null;
    if (prize.once && hasPrize(state, prize.id)) {
      if (prize.fallback) return grantPrize(state, prize.fallback);
      return findPrize(state, prize.id);
    }
    if (prize.kind === 'hint') world.hintTokens = (world.hintTokens || 0) + 1;
    var entry = {
      id: prize.id,
      name: prize.name,
      kind: prize.kind || 'sticker',
      place: prize.place || null
    };
    world.prizes.push(entry);
    return entry;
  }

  function pickPrize(pool, state, placeId) {
    pool = pool || [];
    if (!pool.length) {
      return { id: 'tiny-treat', name: 'a little treat', kind: 'treat', once: false };
    }
    var n = 0;
    var list = (state.world && state.world.prizes) || [];
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i] && list[i].place === placeId) n += 1;
    }
    for (i = 0; i < pool.length; i++) {
      var prize = pool[(n + i) % pool.length];
      if (!prize.once || !hasPrize(state, prize.id)) return prize;
    }
    return {
      id: 'repeat-treat',
      name: 'a little treat',
      kind: 'treat',
      once: false,
      place: pool[0].place || null
    };
  }

  function bonusUsedToday(state, placeId, dateKey) {
    var world = ensureWorld(state);
    if (!dateKey || world.activity.dateKey !== dateKey) return false;
    return !!world.activity.used[placeId];
  }

  function markBonusUsed(state, placeId, dateKey) {
    var world = ensureWorld(state);
    if (!dateKey || world.activity.dateKey !== dateKey) {
      world.activity = { dateKey: dateKey || null, used: {} };
    }
    world.activity.used[placeId] = true;
  }

  function hasUnlock(state, id) {
    var world = state && state.world;
    if (!world || !Array.isArray(world.unlocks)) return false;
    return world.unlocks.indexOf(id) !== -1;
  }

  function unlockInfo(id) {
    return itemById(id);
  }

  function grantNextUnlock(state) {
    var world = ensureWorld(state);
    var i;
    for (i = 0; i < QUEST_ITEMS.length; i++) {
      if (world.unlocks.indexOf(QUEST_ITEMS[i].id) === -1) {
        world.unlocks.push(QUEST_ITEMS[i].id);
        return QUEST_ITEMS[i];
      }
    }
    return null;
  }

  function placementsFor(state, placeId) {
    var world = ensureWorld(state);
    if (!Array.isArray(world.placements[placeId])) world.placements[placeId] = [];
    return world.placements[placeId];
  }

  function clearItem(world, itemId) {
    var key;
    for (key in world.placements) {
      if (!Object.prototype.hasOwnProperty.call(world.placements, key)) continue;
      var list = world.placements[key];
      if (!Array.isArray(list)) continue;
      var next = [];
      var i;
      for (i = 0; i < list.length; i++) {
        if (!list[i] || list[i].itemId === itemId) continue;
        next.push(list[i]);
      }
      world.placements[key] = next;
    }
  }

  function placeItem(state, placeId, itemId) {
    if (!isPlaceOpen(state, placeId) || !hasUnlock(state, itemId)) return null;
    if (!itemById(itemId)) return null;
    var world = ensureWorld(state);
    clearItem(world, itemId);
    var list = placementsFor(state, placeId);
    var used = {};
    var i;
    for (i = 0; i < list.length; i++) used[list[i].slot] = true;
    var slot = -1;
    for (i = 0; i < SLOT_COUNT; i++) {
      if (!used[i]) { slot = i; break; }
    }
    if (slot === -1) return null;
    var entry = { itemId: itemId, slot: slot };
    list.push(entry);
    return entry;
  }

  function moveItem(state, placeId, itemId) {
    var list = placementsFor(state, placeId);
    var found = null;
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i].itemId === itemId) found = list[i];
    }
    if (!found) return null;
    var used = {};
    for (i = 0; i < list.length; i++) {
      if (list[i] !== found) used[list[i].slot] = true;
    }
    var n;
    for (n = 1; n <= SLOT_COUNT; n++) {
      var next = (found.slot + n) % SLOT_COUNT;
      if (!used[next]) {
        found.slot = next;
        return found;
      }
    }
    return found;
  }

  function returnItem(state, placeId, itemId) {
    var world = ensureWorld(state);
    var list = world.placements[placeId] || [];
    var next = [];
    var removed = false;
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i] && list[i].itemId === itemId) removed = true;
      else next.push(list[i]);
    }
    world.placements[placeId] = next;
    return removed;
  }

  function actionsFor(house, state) {
    var list = (house && house.actions) || [];
    var out = [];
    var seen = {};
    var i;
    for (i = 0; i < list.length; i++) {
      if (seen[list[i].id]) continue;
      if (list[i].requires && !hasUnlock(state, list[i].requires)) continue;
      seen[list[i].id] = true;
      out.push(list[i]);
    }
    return out;
  }

  function fillName(line, petName) {
    return String(line).replace(/\{name\}/g, petName || 'Your pet');
  }

  function playAction(houseId, actionId, state, ctx) {
    ctx = ctx || {};
    var house = null;
    var h;
    for (h = 0; h < HOUSES.length; h++) {
      if (HOUSES[h].id === houseId) house = HOUSES[h];
    }
    if (!house) return { message: 'You look around. Everything feels peaceful.', prize: null, opened: [] };
    if (!isPlaceOpen(state, house.id)) {
      return { message: placeHelp(), prize: null, opened: [] };
    }
    var actions = house.actions || [];
    var action = null;
    var i;
    for (i = 0; i < actions.length; i++) {
      if (actions[i].id === actionId) action = actions[i];
    }
    if (!action) return { message: 'You look around the room. It feels peaceful.', prize: null, opened: [] };
    if (action.requires && !hasUnlock(state, action.requires)) {
      return { message: 'You look around the room. It feels peaceful.', prize: null, opened: [] };
    }
    var lines = action.lines;
    if (action.whenUnlock && action.unlockLines && hasUnlock(state, action.whenUnlock)) {
      lines = action.unlockLines;
    }
    var step = ctx.step || 0;
    var line = lines && lines.length ? lines[step % lines.length] : 'You look around the room. It feels peaceful.';
    if (action.bonus) {
      var dateKey = ctx.dateKey || 'today';
      if (bonusUsedToday(state, house.id, dateKey)) {
        return {
          message: fillName('You already found today\u2019s gift here. The room still feels glad you came.', ctx.petName),
          prize: null,
          already: true,
          opened: []
        };
      }
      markBonusUsed(state, house.id, dateKey);
      var world = ensureWorld(state);
      var before = world.unlocks.length;
      world.activitiesDone = (world.activitiesDone || 0) + 1;
      var spec = pickPrize(action.prizes, state, house.id);
      spec = {
        id: spec.id,
        name: spec.name,
        kind: spec.kind,
        once: spec.once,
        place: house.id,
        fallback: { id: 'bonus-treat', name: 'a little treat', kind: 'treat', once: false, place: house.id }
      };
      var prize = grantPrize(state, spec);
      var opened = checkPlaceUnlocks(state);
      var message = fillName(line, ctx.petName);
      if (prize && prize.name) {
        message += ' You get ' + prize.name + '. It is saved on this device.';
      }
      if (opened.length) message += ' ' + opened[0].openLine;
      if (world.unlocks.length > before) message += ' New things to place are waiting with your things.';
      return { message: message, prize: prize, already: false, opened: opened };
    }
    return { message: fillName(line, ctx.petName), prize: null, opened: [] };
  }

  function iconMarkup(kind, color) {
    color = color || '#c4784a';
    if (kind === 'bowl') return '<ellipse cx="0" cy="4" rx="16" ry="7" fill="' + color + '"/><ellipse cx="0" cy="1" rx="12" ry="5" fill="#f0e0a0"/>';
    if (kind === 'rug') return '<ellipse cx="0" cy="2" rx="26" ry="12" fill="' + color + '"/><ellipse cx="0" cy="2" rx="14" ry="6" fill="#fffaf0" opacity="0.45"/>';
    if (kind === 'lamp') return '<rect x="-2" y="0" width="4" height="14" fill="#a35f38"/><polygon points="-12,-2 12,-2 7,-16 -7,-16" fill="' + color + '"/>';
    if (kind === 'plant') return '<rect x="-6" y="4" width="12" height="10" rx="2" fill="#a35f38"/><circle cx="-6" cy="-2" r="7" fill="' + color + '"/><circle cx="6" cy="-4" r="8" fill="' + color + '"/>';
    if (kind === 'chair') return '<rect x="-12" y="0" width="24" height="8" rx="2" fill="' + color + '"/><rect x="-12" y="-14" width="5" height="16" fill="' + color + '"/><rect x="7" y="-14" width="5" height="16" fill="' + color + '"/>';
    if (kind === 'poster') return '<rect x="-11" y="-16" width="22" height="28" rx="2" fill="' + color + '" stroke="#2c241c" stroke-width="1.5"/><circle cx="0" cy="-2" r="5" fill="#fffaf0"/>';
    if (kind === 'cushion') return '<rect x="-14" y="-6" width="28" height="14" rx="6" fill="' + color + '"/>';
    if (kind === 'book') return '<rect x="-12" y="-8" width="8" height="18" fill="#7a9a68"/><rect x="-3" y="-10" width="8" height="20" fill="' + color + '"/><rect x="6" y="-7" width="7" height="16" fill="#5f7a52"/>';
    if (kind === 'bell') return '<path d="M-8 4 Q0 -14 8 4 Z" fill="' + color + '"/><rect x="-10" y="4" width="20" height="3" rx="1" fill="#a35f38"/>';
    if (kind === 'flower') return '<circle cx="0" cy="0" r="4" fill="#e8c84a"/><circle cx="-7" cy="0" r="4" fill="' + color + '"/><circle cx="7" cy="0" r="4" fill="' + color + '"/><circle cx="0" cy="-7" r="4" fill="' + color + '"/><circle cx="0" cy="7" r="4" fill="' + color + '"/>';
    if (kind === 'toy') return '<circle cx="0" cy="0" r="10" fill="' + color + '" stroke="#fffaf0" stroke-width="2"/>';
    if (kind === 'clock') return '<circle cx="0" cy="0" r="12" fill="#fffaf0" stroke="' + color + '" stroke-width="3"/><path d="M0 0 V-6 M0 0 L5 3" stroke="#2c241c" stroke-width="2"/>';
    if (kind === 'cloth') return '<path d="M-16 -4 H16 L11 12 H-11 Z" fill="' + color + '"/>';
    if (kind === 'vase') return '<path d="M-6 -8 H6 L9 12 H-9 Z" fill="' + color + '"/>';
    if (kind === 'basket') return '<path d="M-14 0 H14 L10 12 H-10 Z" fill="' + color + '"/>';
    if (kind === 'frame') return '<rect x="-12" y="-14" width="24" height="26" fill="#fffaf0" stroke="' + color + '" stroke-width="3"/>';
    if (kind === 'blanket') return '<path d="M-16 -6 H16 V10 H-16 Z" fill="' + color + '"/>';
    if (kind === 'mug') return '<rect x="-8" y="-6" width="14" height="14" rx="2" fill="' + color + '"/><path d="M6 -2 H10 Q14 2 6 6" fill="none" stroke="' + color + '" stroke-width="2"/>';
    if (kind === 'badge') return '<polygon points="0,-14 4,-4 14,-4 6,2 9,12 0,6 -9,12 -6,2 -14,-4 -4,-4" fill="' + color + '"/>';
    if (kind === 'duck') return '<ellipse cx="0" cy="2" rx="12" ry="7" fill="' + color + '"/><circle cx="8" cy="-3" r="5" fill="' + color + '"/>';
    if (kind === 'cone') return '<polygon points="0,14 -8,-2 8,-2" fill="#e8c49a"/><circle cx="0" cy="-6" r="7" fill="' + color + '"/>';
    if (kind === 'hose') return '<circle cx="0" cy="2" r="9" fill="none" stroke="' + color + '" stroke-width="4"/>';
    if (kind === 'nest') return '<path d="M-14 2 Q0 16 14 2" fill="' + color + '"/><circle cx="-3" cy="1" r="3" fill="#f0e0a0"/>';
    return '<circle cx="0" cy="0" r="10" fill="' + color + '"/>';
  }

  function renderPlaced(state, placeId) {
    var world = state && state.world;
    var list = world && world.placements && world.placements[placeId];
    if (!list || !list.length) return '';
    var out = '';
    var i;
    for (i = 0; i < list.length; i++) {
      var item = itemById(list[i].itemId);
      var slot = SLOTS[list[i].slot] || SLOTS[0];
      if (!item) continue;
      out += '<g transform="translate(' + slot.x + ' ' + slot.y + ')">' + iconMarkup(item.kind, item.color) + '</g>';
    }
    return out;
  }

  function sceneFor(id) {
    if (id === 'library') {
      return R(0, 0, 320, 150, '#efe6d2') + R(0, 150, 320, 60, '#b08968') +
        R(8, 18, 70, 120, '#5f7a52') + R(16, 28, 10, 28, '#c4784a') + R(30, 28, 10, 28, '#e8c84a') + R(44, 28, 10, 28, '#8eb4c9') +
        R(16, 64, 10, 28, '#d4564e') + R(30, 64, 10, 28, '#f0e0a0') + R(44, 64, 10, 28, '#7a9a68') +
        R(16, 100, 10, 28, '#a35f38') + R(30, 100, 10, 28, '#e07a5f') + R(44, 100, 10, 28, '#5f7a52') +
        R(242, 18, 70, 120, '#5f7a52') + R(250, 30, 10, 32, '#fffaf0') + R(264, 30, 10, 32, '#c4784a') + R(278, 30, 10, 32, '#e8c84a') +
        R(250, 72, 10, 32, '#8eb4c9') + R(264, 72, 10, 32, '#d4564e') + R(278, 72, 10, 32, '#f0e0a0') +
        R(110, 36, 100, 70, '#d7e6ef', ' stroke="#5f7a52" stroke-width="4"') +
        R(118, 108, 84, 16, '#c4784a', ' rx="6"') + R(126, 96, 36, 14, '#f0e0a0', ' rx="5"') +
        R(150, 78, 28, 18, '#fffaf0') +
        '<polygon points="200,78 214,78 207,58" fill="#e8c84a"/>' + R(204, 78, 6, 18, '#a35f38') +
        '<ellipse cx="160" cy="186" rx="46" ry="12" fill="#7a9a68"/>';
    }
    if (id === 'school') {
      return R(0, 0, 320, 150, '#fff3df') + R(0, 150, 320, 60, '#d7b48a') +
        R(28, 22, 150, 78, '#2c241c', ' rx="4"') + R(38, 32, 130, 58, '#3d4a38') +
        R(48, 48, 28, 6, '#f0e0a0') + R(48, 60, 40, 6, '#fffaf0') + R(86, 44, 18, 18, '#e8c84a') +
        R(210, 18, 18, 40, '#a35f38') + '<circle cx="219" cy="16" r="10" fill="#e8c84a" stroke="#a35f38" stroke-width="3"/>' +
        R(36, 118, 70, 28, '#efe6d4', ' stroke="#a35f38" stroke-width="3"') +
        R(130, 124, 70, 24, '#efe6d4', ' stroke="#a35f38" stroke-width="3"') +
        R(230, 70, 28, 36, '#d7e6ef', ' stroke="#5f7a52" stroke-width="3"') +
        R(268, 96, 24, 30, '#7a9a68') + '<circle cx="280" cy="88" r="10" fill="#d4564e"/>' +
        '<ellipse cx="170" cy="186" rx="40" ry="10" fill="#c4784a"/>';
    }
    if (id === 'garden') {
      return R(0, 0, 320, 120, '#c5e4f5') + '<circle cx="250" cy="36" r="18" fill="#f0e0a0"/>' +
        R(0, 120, 320, 90, '#8fa87a') + R(0, 150, 70, 60, '#c9956a') +
        R(18, 78, 8, 70, '#5f7a52') + '<circle cx="22" cy="70" r="18" fill="#7a9a68"/>' +
        '<circle cx="70" cy="150" r="12" fill="#d4564e"/>' + '<circle cx="96" cy="140" r="10" fill="#e8c84a"/>' +
        '<circle cx="120" cy="156" r="12" fill="#fffaf0"/>' + '<circle cx="150" cy="142" r="9" fill="#c4784a"/>' +
        R(200, 150, 90, 28, '#a35f38', ' rx="4"') + '<circle cx="220" cy="142" r="8" fill="#d4564e"/>' +
        '<circle cx="246" cy="136" r="9" fill="#e8c84a"/>' + '<circle cx="270" cy="144" r="8" fill="#fffaf0"/>' +
        '<circle cx="40" cy="48" r="4" fill="#e8c84a"/>' + '<circle cx="48" cy="42" r="3" fill="#2c241c"/>';
    }
    if (id === 'bakery') {
      return R(0, 0, 320, 150, '#fff1df') + R(0, 150, 320, 60, '#e7c7a1') +
        R(18, 78, 90, 70, '#5a4e42', ' rx="6"') + R(30, 90, 66, 40, '#2c241c', ' rx="3"') +
        '<circle cx="48" cy="110" r="6" fill="#e07a5f"/>' + '<circle cx="78" cy="110" r="6" fill="#e8c84a"/>' +
        R(130, 48, 70, 90, '#a35f38') + R(138, 58, 54, 14, '#e8c49a') + R(138, 78, 54, 14, '#f0e0a0') + R(138, 98, 54, 14, '#d4564e') +
        R(220, 70, 80, 50, '#d7e6ef', ' stroke="#c4784a" stroke-width="4"') +
        '<ellipse cx="246" cy="96" rx="14" ry="8" fill="#e8c49a"/>' + '<ellipse cx="274" cy="98" rx="10" ry="6" fill="#f0e0a0"/>' +
        R(24, 168, 270, 10, '#c4784a') + R(24, 178, 270, 10, '#fffaf0') + R(24, 188, 270, 8, '#c4784a');
    }
    if (id === 'pond') {
      return R(0, 0, 320, 110, '#d5eef8') + '<circle cx="60" cy="36" r="16" fill="#f0e0a0"/>' +
        R(0, 110, 320, 100, '#c5ddb4') +
        '<ellipse cx="170" cy="160" rx="110" ry="36" fill="#8eb4c9"/>' +
        '<ellipse cx="150" cy="154" rx="70" ry="18" fill="#b7d4e4"/>' +
        '<ellipse cx="120" cy="150" rx="16" ry="8" fill="#fffaf0"/>' + '<circle cx="112" cy="146" r="4" fill="#e8c84a"/>' +
        '<ellipse cx="200" cy="156" rx="14" ry="7" fill="#fffaf0"/>' +
        R(36, 120, 6, 40, '#5f7a52') + '<circle cx="39" cy="112" r="14" fill="#7a9a68"/>' +
        '<circle cx="260" cy="130" r="8" fill="#d4564e"/>' + '<circle cx="278" cy="124" r="6" fill="#e8c84a"/>';
    }
    if (id === 'friend') {
      return R(0, 0, 320, 150, '#fff6ea') + R(0, 150, 320, 60, '#e0c2a0') +
        R(24, 28, 64, 48, '#d7e6ef', ' stroke="#e8a05a" stroke-width="4"') +
        R(24, 28, 12, 48, '#e8a05a') + R(76, 28, 12, 48, '#e8a05a') +
        '<ellipse cx="150" cy="176" rx="70" ry="16" fill="#c4784a"/>' +
        R(100, 150, 100, 22, '#e8a05a', ' rx="8"') +
        '<circle cx="230" cy="120" r="22" fill="#e8a05a"/>' +
        '<polygon points="214,108 226,78 238,108" fill="#e8a05a"/>' +
        '<polygon points="222,108 234,82 248,112" fill="#e8a05a"/>' +
        '<circle cx="222" cy="118" r="2" fill="#2c241c"/>' + '<circle cx="236" cy="118" r="2" fill="#2c241c"/>' +
        R(40, 110, 28, 20, '#fffaf0', ' rx="4"') + R(250, 100, 28, 20, '#8eb4c9', ' rx="4"');
    }
    if (id === 'farm') {
      return R(0, 0, 320, 140, '#f6e7c8') + R(0, 140, 320, 70, '#c9956a') +
        R(16, 40, 120, 110, '#a35f38') + R(40, 78, 36, 72, '#5f7a52') +
        R(150, 90, 70, 50, '#e8c84a', ' rx="4"') + R(230, 90, 70, 50, '#e8c49a', ' rx="4"') +
        '<circle cx="250" cy="70" r="10" fill="#fffaf0"/>' + '<circle cx="268" cy="78" r="8" fill="#d4564e"/>' +
        R(20, 24, 40, 16, '#7a9a68');
    }
    if (id === 'market') {
      return R(0, 0, 320, 90, '#f8d7c4') + R(0, 90, 320, 120, '#efe6d4') +
        '<path d="M10 90 Q80 40 160 90 Q230 40 310 90" fill="#d4564e"/>' +
        R(24, 100, 70, 40, '#c4784a') + '<circle cx="44" cy="118" r="8" fill="#d4564e"/>' + '<circle cx="64" cy="116" r="8" fill="#7a9a68"/>' +
        R(120, 96, 70, 46, '#a35f38') + '<circle cx="142" cy="116" r="7" fill="#e8c84a"/>' + '<circle cx="162" cy="120" r="8" fill="#d4564e"/>' +
        R(214, 104, 80, 40, '#5f7a52') + R(230, 112, 48, 16, '#e8c49a');
    }
    if (id === 'playground') {
      return R(0, 0, 320, 120, '#c5e4f5') + '<circle cx="250" cy="34" r="16" fill="#f0e0a0"/>' +
        R(0, 120, 320, 90, '#8fa87a') +
        R(40, 70, 8, 80, '#a35f38') + R(90, 70, 8, 80, '#a35f38') +
        '<path d="M44 78 H94" stroke="#5a4e42" stroke-width="3"/>' +
        R(60, 100, 22, 8, '#c4784a') +
        '<polygon points="180,150 230,150 250,90 200,90" fill="#e07a5f"/>' +
        R(176, 150, 70, 8, '#e8c84a') +
        '<circle cx="270" cy="170" r="12" fill="#d4564e"/>';
    }
    if (id === 'icecream') {
      return R(0, 0, 320, 150, '#ffe4ef') + R(0, 150, 320, 60, '#f0d2c4') +
        R(0, 0, 320, 16, '#e07a5f') + R(0, 16, 320, 10, '#fffaf0') + R(0, 26, 320, 10, '#8eb4c9') +
        R(30, 70, 170, 70, '#fffaf0', ' stroke="#e07a5f" stroke-width="4"') +
        '<circle cx="70" cy="104" r="16" fill="#e07a5f"/>' + '<circle cx="110" cy="104" r="16" fill="#e8c84a"/>' + '<circle cx="150" cy="104" r="16" fill="#7a9a68"/>' +
        '<polygon points="240,150 270,70 300,150" fill="#e8c49a"/>' + '<circle cx="270" cy="64" r="16" fill="#f0a0c0"/>';
    }
    if (id === 'firehouse') {
      return R(0, 0, 320, 150, '#f8e4de') + R(0, 150, 320, 60, '#d7b48a') +
        R(20, 40, 130, 100, '#d4564e', ' rx="6"') + R(36, 56, 98, 60, '#8eb4c9') +
        '<circle cx="58" cy="150" r="12" fill="#2c241c"/>' + '<circle cx="112" cy="150" r="12" fill="#2c241c"/>' +
        R(180, 30, 16, 50, '#a35f38') + '<circle cx="188" cy="26" r="10" fill="#e8c84a"/>' +
        '<circle cx="230" cy="120" r="22" fill="none" stroke="#d4564e" stroke-width="8"/>' +
        R(250, 100, 40, 28, '#5a4e42', ' rx="4"');
    }
    if (id === 'zoo') {
      return R(0, 0, 320, 150, '#e5f2d8') + R(0, 150, 320, 60, '#c4a574') +
        R(12, 24, 92, 110, '#c5e4f5', ' stroke="#5f7a52" stroke-width="4"') +
        '<ellipse cx="58" cy="100" rx="30" ry="12" fill="#8eb4c9"/>' + '<ellipse cx="40" cy="96" rx="10" ry="6" fill="#fffaf0"/>' +
        R(114, 24, 92, 110, '#d7e6c4', ' stroke="#5f7a52" stroke-width="4"') +
        '<circle cx="150" cy="78" r="16" fill="#7a9a68"/>' + R(146, 90, 8, 30, '#5f7a52') + '<ellipse cx="160" cy="112" rx="16" ry="8" fill="#f4f1ea"/>' +
        R(216, 24, 92, 110, '#f0e6cf', ' stroke="#a35f38" stroke-width="4"') +
        '<ellipse cx="262" cy="100" rx="22" ry="10" fill="#c4a574"/>' + '<circle cx="250" cy="86" r="8" fill="#e8c84a"/>' +
        R(120, 150, 80, 18, '#5f7a52', ' rx="3"');
    }
    if (id === 'vet') {
      return R(0, 0, 320, 150, '#e7f4f1') + R(0, 150, 320, 60, '#d5e0ea') +
        R(18, 22, 70, 54, '#d7e6ef', ' stroke="#7a9a68" stroke-width="4"') +
        R(36, 78, 180, 22, '#fffaf0', ' stroke="#8eb4c9" stroke-width="3"') +
        R(48, 100, 16, 40, '#8eb4c9') + R(188, 100, 16, 40, '#8eb4c9') +
        R(70, 70, 90, 12, '#c9ddd4', ' rx="4"') +
        R(230, 36, 70, 80, '#fffaf0', ' stroke="#e07a5f" stroke-width="3"') +
        '<path d="M252 70 C252 58 278 58 278 70 C278 84 265 92 265 92 C265 92 252 84 252 70 Z" fill="#e07a5f"/>' +
        R(24, 120, 28, 22, '#a35f38') + '<circle cx="32" cy="112" r="8" fill="#7a9a68"/>' + '<circle cx="46" cy="114" r="7" fill="#5f7a52"/>' +
        '<ellipse cx="160" cy="186" rx="40" ry="10" fill="#b7d0c6"/>';
    }
    if (id === 'police') {
      return R(0, 0, 320, 150, '#f3eee4') + R(0, 150, 320, 60, '#c4a574') +
        R(20, 24, 54, 40, '#d7e6ef', ' stroke="#3d4a62" stroke-width="4"') +
        R(70, 90, 140, 36, '#a35f38', ' rx="4"') + R(86, 78, 40, 14, '#fffaf0') + R(140, 80, 28, 12, '#e8c84a') +
        '<polygon points="250,28 258,48 280,48 262,60 268,80 250,68 232,80 238,60 220,48 242,48" fill="#e8c84a" stroke="#a35f38" stroke-width="2"/>' +
        R(24, 80, 36, 44, '#fffaf0', ' stroke="#5f7a52" stroke-width="3"') +
        '<circle cx="42" cy="96" r="6" fill="#c4784a"/>' +
        '<ellipse cx="170" cy="186" rx="50" ry="12" fill="#7a9a68"/>';
    }
    if (id === 'museum') {
      return R(0, 0, 320, 150, '#f7f1e4') + R(0, 150, 320, 60, '#d9c7ae') +
        R(24, 28, 70, 80, '#fffaf0', ' stroke="#6b5344" stroke-width="6"') +
        '<ellipse cx="59" cy="68" rx="16" ry="10" fill="#7a9a68"/>' +
        R(120, 36, 70, 70, '#fffaf0', ' stroke="#6b5344" stroke-width="6"') +
        '<path d="M140 90 L155 50 L170 90 Z" fill="#8eb4c9"/>' +
        R(214, 48, 70, 60, '#fffaf0', ' stroke="#6b5344" stroke-width="6"') +
        '<circle cx="249" cy="78" r="12" fill="#e8c84a"/>' +
        R(90, 160, 140, 16, '#a35f38', ' rx="4"');
    }
    if (id === 'nature') {
      return R(0, 0, 320, 150, '#e7f3e4') + R(0, 150, 320, 60, '#b08968') +
        R(16, 20, 90, 70, '#c5e4f5', ' stroke="#3d6b4f" stroke-width="4"') +
        R(40, 36, 8, 40, '#5f7a52') + '<circle cx="44" cy="30" r="14" fill="#7a9a68"/>' +
        R(130, 40, 80, 70, '#fffaf0', ' stroke="#5f7a52" stroke-width="3"') +
        '<path d="M150 96 Q170 70 190 96" fill="#a35f38"/>' + '<circle cx="170" cy="88" r="4" fill="#f0e0a0"/>' +
        R(230, 70, 70, 40, '#5f7a52', ' rx="16"') + R(248, 78, 34, 10, '#d7e6ef', ' rx="4"') +
        '<ellipse cx="80" cy="180" rx="30" ry="10" fill="#8fa87a"/>';
    }
    if (id === 'parlor') {
      return R(0, 0, 320, 150, '#2f4a3c') + R(0, 150, 320, 60, '#1f3329') +
        R(18, 22, 36, 70, '#c4784a') + R(266, 22, 36, 70, '#c4784a') +
        '<ellipse cx="160" cy="120" rx="90" ry="36" fill="#3d6b4f" stroke="#e8c84a" stroke-width="4"/>' +
        R(120, 100, 22, 30, '#fffaf0', ' rx="2" stroke="#d4564e" stroke-width="2"') +
        R(150, 96, 22, 30, '#fffaf0', ' rx="2" stroke="#2c241c" stroke-width="2"') +
        R(180, 100, 22, 30, '#d4564e', ' rx="2"') +
        '<polygon points="70,36 92,36 84,16" fill="#e8c84a"/>' + R(80, 36, 4, 20, '#a35f38') +
        '<polygon points="230,36 252,36 244,16" fill="#e8c84a"/>' + R(240, 36, 4, 20, '#a35f38');
    }
    if (id === 'cottage') {
      return sceneFor('pet');
    }
    return R(0, 0, 320, 150, '#f4dcc4') + R(0, 150, 320, 60, '#c9956a') +
      R(16, 24, 78, 64, '#d7e6ef', ' stroke="#c4784a" stroke-width="4"') +
      R(16, 24, 14, 64, '#c4784a') + R(80, 24, 14, 64, '#c4784a') +
      R(24, 96, 52, 16, '#e07a5f', ' rx="7"') +
      R(108, 112, 84, 16, '#fffaf0', ' stroke="#c4784a" stroke-width="3"') +
      R(120, 128, 8, 22, '#a35f38') + R(172, 128, 8, 22, '#a35f38') +
      '<ellipse cx="150" cy="108" rx="12" ry="8" fill="#d7d2cc" stroke="#5a4e42" stroke-width="2"/>' +
      R(214, 86, 88, 22, '#efe6d4', ' stroke="#a35f38" stroke-width="3"') +
      R(214, 108, 12, 34, '#a35f38') + R(290, 108, 12, 34, '#a35f38') +
      R(230, 90, 26, 14, '#fffaf0') +
      R(236, 118, 64, 28, '#5a4e42', ' rx="4"') +
      '<circle cx="256" cy="132" r="6" fill="#e8c84a"/>' + '<circle cx="280" cy="132" r="6" fill="#e07a5f"/>' +
      R(16, 156, 92, 28, '#fffaf0') + R(16, 166, 92, 22, '#7a9a68') + R(22, 152, 24, 16, '#f0e0a0', ' rx="4"') +
      '<ellipse cx="168" cy="190" rx="48" ry="12" fill="#c4784a"/>' +
      '<polygon points="250,70 274,70 266,50" fill="#e8c84a"/>' + R(263, 70, 6, 16, '#a35f38') +
      R(118, 36, 40, 30, '#7a9a68', ' stroke="#a35f38" stroke-width="3"') +
      '<circle cx="138" cy="50" r="6" fill="#e8c84a"/>';
  }

  function renderRoomSvg(houseId, state) {
    var scene = sceneFor(houseId || 'pet');
    return '<svg class="room-svg" viewBox="0 0 320 210" width="100%" height="100%" aria-hidden="true">' +
      scene + renderPlaced(state, houseId) + '</svg>';
  }

  function emblem(id, accent) {
    if (id === 'library') return '<rect x="78" y="48" width="8" height="14" fill="#c4784a"/><rect x="88" y="46" width="8" height="16" fill="#e8c84a"/>';
    if (id === 'school') return '<circle cx="86" cy="20" r="6" fill="#e8c84a"/>';
    if (id === 'garden') return '<circle cx="34" cy="62" r="6" fill="#d4564e"/><circle cx="86" cy="58" r="6" fill="#e8c84a"/>';
    if (id === 'bakery') return '<ellipse cx="60" cy="58" rx="10" ry="6" fill="#e8c49a"/>';
    if (id === 'pond') return '<ellipse cx="60" cy="70" rx="16" ry="6" fill="#8eb4c9"/>';
    if (id === 'friend') return '<circle cx="46" cy="56" r="6" fill="#e8a05a"/>';
    if (id === 'farm') return '<rect x="70" y="50" width="16" height="10" fill="#e8c84a"/>';
    if (id === 'market') return '<circle cx="40" cy="58" r="5" fill="#d4564e"/><circle cx="52" cy="60" r="4" fill="#e8c84a"/>';
    if (id === 'playground') return '<circle cx="86" cy="62" r="5" fill="#e07a5f"/>';
    if (id === 'icecream') return '<circle cx="60" cy="48" r="6" fill="#f0a0c0"/>';
    if (id === 'firehouse') return '<circle cx="60" cy="22" r="5" fill="#e8c84a"/>';
    if (id === 'zoo') return '<circle cx="36" cy="60" r="5" fill="#7a9a68"/><circle cx="84" cy="60" r="5" fill="#e8c84a"/>';
    if (id === 'vet') return '<path d="M78 52 C78 46 90 46 90 52 C90 58 84 62 84 62 C84 62 78 58 78 52 Z" fill="#e07a5f"/>';
    if (id === 'police') return '<polygon points="60,40 63,48 72,48 65,53 67,61 60,56 53,61 55,53 48,48 57,48" fill="#e8c84a"/>';
    if (id === 'museum') return '<rect x="74" y="46" width="16" height="14" fill="#fffaf0" stroke="#6b5344"/>';
    if (id === 'nature') return '<circle cx="86" cy="40" r="8" fill="#7a9a68"/>';
    if (id === 'parlor') return '<rect x="74" y="48" width="10" height="14" fill="#fffaf0" stroke="' + accent + '"/>';
    return '<circle cx="60" cy="52" r="5" fill="' + accent + '"/>';
  }

  function renderHouseFront(id) {
    var look = LOOKS[id] || LOOKS.pet;
    if (id === 'garden') {
      return '<svg viewBox="0 0 120 90" width="100%" height="72" aria-hidden="true">' +
        '<rect width="120" height="90" fill="#c5e4f5"/>' +
        '<rect y="58" width="120" height="32" fill="#8fa87a"/>' +
        '<circle cx="30" cy="62" r="8" fill="#d4564e"/>' +
        '<circle cx="48" cy="54" r="9" fill="#e8c84a"/>' +
        '<circle cx="66" cy="62" r="8" fill="#fffaf0"/>' +
        '<circle cx="84" cy="56" r="7" fill="#c4784a"/>' +
        '<rect x="96" y="48" width="6" height="22" fill="#5f7a52"/>' +
        '<circle cx="99" cy="42" r="10" fill="#7a9a68"/>' +
        '</svg>';
    }
    if (id === 'pond') {
      return '<svg viewBox="0 0 120 90" width="100%" height="72" aria-hidden="true">' +
        '<rect width="120" height="90" fill="#e7f3f6"/>' +
        '<ellipse cx="60" cy="58" rx="46" ry="18" fill="#8eb4c9"/>' +
        '<ellipse cx="46" cy="54" rx="12" ry="6" fill="#fffaf0"/>' +
        '<circle cx="40" cy="50" r="3" fill="#e8c84a"/>' +
        '<circle cx="92" cy="40" r="8" fill="#7a9a68"/>' +
        '</svg>';
    }
    if (id === 'playground') {
      return '<svg viewBox="0 0 120 90" width="100%" height="72" aria-hidden="true">' +
        '<rect width="120" height="90" fill="#c5e4f5"/>' +
        '<rect y="64" width="120" height="26" fill="#8fa87a"/>' +
        '<rect x="24" y="30" width="6" height="40" fill="#a35f38"/>' +
        '<rect x="52" y="30" width="6" height="40" fill="#a35f38"/>' +
        '<rect x="34" y="46" width="16" height="6" fill="#c4784a"/>' +
        '<polygon points="70,70 96,70 104,40 78,40" fill="#e07a5f"/>' +
        '</svg>';
    }
    return '<svg viewBox="0 0 120 90" width="100%" height="72" aria-hidden="true">' +
      '<rect x="16" y="36" width="88" height="46" rx="3" fill="' + look.wall + '" stroke="' + look.roof + '" stroke-width="3"/>' +
      '<polygon points="10,40 60,12 110,40" fill="' + look.roof + '"/>' +
      '<rect x="28" y="46" width="16" height="14" fill="#d7e6ef" stroke="' + look.accent + '"/>' +
      '<rect x="76" y="46" width="16" height="14" fill="#d7e6ef" stroke="' + look.accent + '"/>' +
      '<rect x="50" y="54" width="20" height="28" fill="' + look.door + '"/>' +
      emblem(id, look.accent) +
      '</svg>';
  }

  function renderSkylineSvg(state) {
    var places = visiblePlaces(state);
    if (!places.length) places = [getHouse('pet')];
    var n = places.length;
    var gap = 340 / n;
    var bits = '';
    var i;
    for (i = 0; i < n; i++) {
      var look = LOOKS[places[i].id] || LOOKS.pet;
      var w = n === 1 ? 78 : Math.max(18, Math.min(42, gap - 6));
      var x = n === 1 ? 141 : 10 + i * gap;
      var roofY = n === 1 ? 28 : 48;
      var wallY = roofY + 16;
      var wallH = 78 - (wallY - 28);
      if (places[i].id === 'pond') {
        bits += '<ellipse cx="' + (x + w / 2) + '" cy="92" rx="' + (w / 2) + '" ry="8" fill="#8eb4c9"/>';
      } else if (places[i].id === 'garden' || places[i].id === 'playground') {
        bits += '<circle cx="' + (x + 8) + '" cy="78" r="6" fill="#d4564e"/>' +
          '<circle cx="' + (x + w - 8) + '" cy="74" r="6" fill="#e8c84a"/>';
      } else {
        bits += '<rect x="' + x + '" y="' + wallY + '" width="' + w + '" height="' + wallH + '" fill="' + look.wall + '" stroke="' + look.roof + '" stroke-width="2"/>' +
          '<polygon points="' + (x - 3) + ',' + wallY + ' ' + (x + w / 2) + ',' + roofY + ' ' + (x + w + 3) + ',' + wallY + '" fill="' + look.roof + '"/>';
      }
    }
    return '<svg class="skyline-svg" viewBox="0 0 360 120" width="100%" height="100%" aria-hidden="true">' +
      '<rect width="360" height="120" fill="#e7f0dc"/>' +
      '<circle cx="300" cy="28" r="14" fill="#f0e0a0"/>' +
      '<path d="M0 96 C80 88 140 104 220 94 C280 86 320 100 360 92 L360 120 L0 120 Z" fill="#8fa87a"/>' +
      bits +
      '</svg>';
  }

  return {
    HOUSES: HOUSES,
    UNLOCKS: UNLOCKS,
    QUEST_ITEMS: QUEST_ITEMS,
    PLACE_ITEMS: PLACE_ITEMS,
    STARTER_IDS: STARTER_IDS,
    SLOT_COUNT: SLOT_COUNT,
    getHouse: getHouse,
    houseTitle: houseTitle,
    houseIdForMission: houseIdForMission,
    ensureWorld: ensureWorld,
    hasUnlock: hasUnlock,
    unlockInfo: unlockInfo,
    grantNextUnlock: grantNextUnlock,
    isPlaceOpen: isPlaceOpen,
    visiblePlaces: visiblePlaces,
    visibleItems: visibleItems,
    mapLabel: mapLabel,
    townHint: townHint,
    allItems: allItems,
    itemById: itemById,
    placeProgress: placeProgress,
    placeHelp: placeHelp,
    nextLockedPlace: nextLockedPlace,
    checkPlaceUnlocks: checkPlaceUnlocks,
    syncFromProgress: syncFromProgress,
    noteQuestFinished: noteQuestFinished,
    hasPrize: hasPrize,
    grantPrize: grantPrize,
    actionsFor: actionsFor,
    playAction: playAction,
    placementsFor: placementsFor,
    placeItem: placeItem,
    moveItem: moveItem,
    returnItem: returnItem,
    renderSkylineSvg: renderSkylineSvg,
    renderHouseFront: renderHouseFront,
    renderRoomSvg: renderRoomSvg,
    escapeXml: escapeXml
  };
});
