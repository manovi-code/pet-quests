/**
 * Pet Quests — end-of-day party.
 * Card match and a prize spinner. Every spin gives a prize.
 * No betting, no coins, and no losing streak. Games can be skipped.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      typeof require !== 'undefined' ? require('./world.js') : root.PQWorld
    );
  } else {
    root.PQParty = factory(root.PQWorld);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (PQWorld) {
  'use strict';

  var MAX_SPINS = 3;
  var MAX_CARD_ROUNDS = 2;
  var SPIN_ICONS = ['strawberry', 'star', 'leaf', 'cupcake', 'heart'];
  var CARD_FACES = ['fox', 'frog', 'bird'];

  var SPIN_PRIZES = [
    { id: 'spin-sticker-star', name: 'a star sticker', kind: 'sticker', once: true },
    { id: 'spin-treat', name: 'a party treat', kind: 'treat', once: false },
    { id: 'spin-sticker-heart', name: 'a heart sticker', kind: 'sticker', once: true },
    { id: 'spin-cupcake', name: 'a cupcake treat', kind: 'treat', once: false }
  ];
  var RARE_SPIN = { id: 'spin-banner', name: 'a party banner', kind: 'decoration', once: true };
  var TREAT = { id: 'party-treat', name: 'a little party treat', kind: 'treat', once: false, place: 'party' };

  function blankParty(dateKey) {
    return {
      dateKey: dateKey || null,
      offered: false,
      skipped: false,
      spins: 0,
      cardRounds: 0
    };
  }

  function ensureParty(state, dateKey) {
    if (!state.party || typeof state.party !== 'object' || Array.isArray(state.party)) {
      state.party = blankParty(dateKey);
    }
    if (dateKey && state.party.dateKey !== dateKey) {
      state.party = blankParty(dateKey);
    }
    if (typeof state.party.spins !== 'number') state.party.spins = 0;
    if (typeof state.party.cardRounds !== 'number') state.party.cardRounds = 0;
    return state.party;
  }

  function offerParty(state, dateKey) {
    var party = ensureParty(state, dateKey);
    party.offered = true;
    return party;
  }

  function skipParty(state, dateKey) {
    var party = ensureParty(state, dateKey);
    party.offered = true;
    party.skipped = true;
    return {
      skipped: true,
      completed: !!(state.daily && state.daily.completed)
    };
  }

  function spinsLeft(state, dateKey) {
    var party = ensureParty(state, dateKey);
    return Math.max(0, MAX_SPINS - (party.spins || 0));
  }

  function cardRoundsLeft(state, dateKey) {
    var party = ensureParty(state, dateKey);
    return Math.max(0, MAX_CARD_ROUNDS - (party.cardRounds || 0));
  }

  function give(state, spec) {
    var prize = {
      id: spec.id,
      name: spec.name,
      kind: spec.kind,
      once: !!spec.once,
      place: 'party',
      fallback: TREAT
    };
    return PQWorld.grantPrize(state, prize);
  }

  function spin(state, rng, dateKey) {
    rng = rng || Math.random;
    var party = ensureParty(state, dateKey);
    if ((party.spins || 0) >= MAX_SPINS) {
      return {
        ok: true,
        limited: true,
        prize: null,
        reels: null,
        rare: false,
        message: 'The spinner is resting now. You can still dance, hug a friend, or head home.'
      };
    }
    var reels = [];
    var i;
    for (i = 0; i < 3; i++) {
      reels.push(SPIN_ICONS[Math.floor(rng() * SPIN_ICONS.length) % SPIN_ICONS.length]);
    }
    party.spins += 1;
    var rare = reels[0] === reels[1] && reels[1] === reels[2];
    var spec = rare ? RARE_SPIN : SPIN_PRIZES[(party.spins - 1) % SPIN_PRIZES.length];
    var prize = give(state, spec);
    var message = rare
      ? 'Three matching pictures. A special decoration is yours: ' + prize.name + '.'
      : 'The spinner shares a prize: ' + prize.name + '.';
    return {
      ok: true,
      limited: false,
      prize: prize,
      reels: reels,
      rare: rare,
      message: message
    };
  }

  function createCardDeck(rng) {
    rng = rng || Math.random;
    var cards = [];
    var i;
    for (i = 0; i < CARD_FACES.length; i++) {
      cards.push({ face: CARD_FACES[i], up: false, matched: false });
      cards.push({ face: CARD_FACES[i], up: false, matched: false });
    }
    for (i = cards.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = cards[i];
      cards[i] = cards[j];
      cards[j] = tmp;
    }
    return cards;
  }

  function unmatchedUp(cards) {
    var up = [];
    var i;
    for (i = 0; i < cards.length; i++) {
      if (cards[i].up && !cards[i].matched) up.push(i);
    }
    return up;
  }

  function boardClear(cards) {
    var i;
    for (i = 0; i < cards.length; i++) {
      if (!cards[i].matched) return false;
    }
    return cards.length > 0;
  }

  /**
   * Turn one card. A miss simply asks for another try.
   */
  function flipCard(cards, index) {
    var card = cards[index];
    if (!card || card.matched || card.up) {
      return { cards: cards, message: 'Pick a face-down card.', changed: false, cleared: boardClear(cards) };
    }
    var up = unmatchedUp(cards);
    if (up.length >= 2) {
      return {
        cards: cards,
        message: 'Those two will turn back in a moment.',
        changed: false,
        needsContinue: true,
        cleared: false
      };
    }
    card.up = true;
    up.push(index);
    if (up.length < 2) {
      return { cards: cards, message: 'Now pick another card.', changed: true, cleared: false };
    }
    var a = cards[up[0]];
    var b = cards[up[1]];
    if (a.face === b.face) {
      a.matched = true;
      b.matched = true;
      var done = boardClear(cards);
      return {
        cards: cards,
        message: done ? 'You found every pair.' : 'A pair. Those two stay up.',
        matched: true,
        cleared: done,
        changed: true
      };
    }
    return {
      cards: cards,
      message: 'Those two are different. You can try another pair.',
      matched: false,
      needsContinue: true,
      changed: true,
      cleared: false
    };
  }

  function turnBack(cards) {
    var i;
    for (i = 0; i < cards.length; i++) {
      if (cards[i].up && !cards[i].matched) cards[i].up = false;
    }
    return cards;
  }

  function finishCardRound(state, dateKey) {
    var party = ensureParty(state, dateKey);
    if ((party.cardRounds || 0) >= MAX_CARD_ROUNDS) {
      return {
        limited: true,
        prize: null,
        message: 'The cards are resting. You can spin, dance, or head home.'
      };
    }
    party.cardRounds += 1;
    var spec = party.cardRounds === 1
      ? { id: 'party-ribbon', name: 'a party ribbon', kind: 'decoration', once: true }
      : { id: 'party-star-sticker', name: 'a star sticker', kind: 'sticker', once: true };
    var prize = give(state, spec);
    return {
      limited: false,
      prize: prize,
      message: 'You found every pair. ' + prize.name + ' is yours to keep.'
    };
  }

  function faceLabel(face) {
    if (face === 'fox') return 'Fern the fox';
    if (face === 'frog') return 'Moss the frog';
    if (face === 'bird') return 'Coco the bird';
    return 'A friend';
  }

  function renderFaceSvg(face) {
    if (face === 'frog') {
      return '<svg viewBox="0 0 80 80" width="64" height="64" aria-hidden="true"><circle cx="40" cy="46" r="22" fill="#7a9a68"/><circle cx="24" cy="28" r="10" fill="#7a9a68"/><circle cx="56" cy="28" r="10" fill="#7a9a68"/><circle cx="24" cy="28" r="4" fill="#2c241c"/><circle cx="56" cy="28" r="4" fill="#2c241c"/><path d="M32 50 Q40 56 48 50" fill="none" stroke="#2c241c" stroke-width="2"/></svg>';
    }
    if (face === 'bird') {
      return '<svg viewBox="0 0 80 80" width="64" height="64" aria-hidden="true"><circle cx="40" cy="40" r="22" fill="#e8c84a"/><polygon points="58,40 74,34 58,48" fill="#c4784a"/><circle cx="32" cy="36" r="3" fill="#2c241c"/><path d="M24 18 Q32 8 40 18" fill="none" stroke="#a35f38" stroke-width="3"/></svg>';
    }
    return '<svg viewBox="0 0 80 80" width="64" height="64" aria-hidden="true"><circle cx="40" cy="46" r="22" fill="#e8a05a"/><polygon points="22,36 18,14 34,30" fill="#e8a05a"/><polygon points="58,36 62,14 46,30" fill="#e8a05a"/><circle cx="32" cy="46" r="3" fill="#2c241c"/><circle cx="48" cy="46" r="3" fill="#2c241c"/><ellipse cx="40" cy="54" rx="5" ry="3" fill="#2c241c"/></svg>';
  }

  function renderCardBack() {
    return '<svg viewBox="0 0 80 80" width="64" height="64" aria-hidden="true"><rect x="8" y="8" width="64" height="64" rx="12" fill="#5f7a52"/><circle cx="40" cy="40" r="10" fill="#e8c84a"/></svg>';
  }

  function renderIcon(name) {
    var body = '<circle cx="32" cy="32" r="16" fill="#d4564e"/>';
    if (name === 'star') {
      body = '<polygon points="32,8 37,24 54,24 40,34 46,50 32,40 18,50 24,34 10,24 27,24" fill="#e8c84a"/>';
    } else if (name === 'leaf') {
      body = '<path d="M32 10 Q52 28 32 54 Q12 28 32 10 Z" fill="#7a9a68"/>';
    } else if (name === 'heart') {
      body = '<path d="M32 50 L14 30 Q10 16 22 16 Q32 16 32 24 Q32 16 42 16 Q54 16 50 30 Z" fill="#c4784a"/>';
    } else if (name === 'cupcake') {
      body = '<path d="M18 28 Q32 12 46 28" fill="#f0a0b0"/><path d="M16 28 H48 L42 50 H22 Z" fill="#e8c49a"/>';
    } else if (name === 'strawberry') {
      body = '<path d="M32 16 Q50 18 46 32 Q42 52 32 56 Q22 52 18 32 Q14 18 32 16 Z" fill="#d4564e"/><path d="M22 18 Q32 8 42 18" fill="#5f7a52"/>';
    }
    return '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">' + body + '</svg>';
  }

  return {
    MAX_SPINS: MAX_SPINS,
    MAX_CARD_ROUNDS: MAX_CARD_ROUNDS,
    SPIN_ICONS: SPIN_ICONS,
    ensureParty: ensureParty,
    offerParty: offerParty,
    skipParty: skipParty,
    spinsLeft: spinsLeft,
    cardRoundsLeft: cardRoundsLeft,
    spin: spin,
    createCardDeck: createCardDeck,
    flipCard: flipCard,
    turnBack: turnBack,
    finishCardRound: finishCardRound,
    faceLabel: faceLabel,
    renderFaceSvg: renderFaceSvg,
    renderCardBack: renderCardBack,
    renderIcon: renderIcon
  };
});
