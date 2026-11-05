/**
 * Pet Quests — a small solitaire for the game hall.
 * There is no score to spend and no timer.
 * A player can always leave.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      typeof require !== 'undefined' ? require('./world.js') : root.PQWorld,
      typeof require !== 'undefined' ? require('./storage.js') : root.PQStorage
    );
  } else {
    root.PQSolitaire = factory(root.PQWorld, root.PQStorage);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (PQWorld, PQStorage) {
  'use strict';

  var SUITS = ['hearts', 'clubs', 'diamonds', 'spades'];
  var DEALS_PER_DAY = 3;

  var SPECS = {
    1: { suits: 1, maxRank: 4, columns: 3, bury: 0, recycles: 2, emptyAny: true },
    2: { suits: 2, maxRank: 5, columns: 4, bury: 1, recycles: 2, emptyAny: true },
    3: { suits: 2, maxRank: 6, columns: 4, bury: 2, recycles: 2, emptyAny: true },
    4: { suits: 4, maxRank: 5, columns: 5, bury: 2, recycles: 1, emptyAny: false },
    5: { suits: 4, maxRank: 6, columns: 6, bury: 3, recycles: 1, emptyAny: false }
  };

  function levelOf(state) {
    var grade = state && state.courses ? parseInt(state.courses.grade, 10) : 2;
    if (!(grade >= 1 && grade <= 5) && state && state.courses && PQStorage && PQStorage.gradeFromRank) {
      grade = PQStorage.gradeFromRank(state.courses.rank);
    }
    if (!(grade >= 1 && grade <= 5)) grade = 2;
    return grade;
  }

  function specFor(level) {
    return SPECS[level] || SPECS[2];
  }

  function canPlay(state) {
    return !!(PQWorld && PQWorld.isPlaceOpen && PQWorld.isPlaceOpen(state, 'parlor'));
  }

  function colorOf(suit) {
    return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
  }

  function rankLabel(rank) {
    if (rank === 1) return 'A';
    return String(rank);
  }

  function cardName(card) {
    var rank = card.rank === 1 ? 'ace' : String(card.rank);
    return rank + ' of ' + card.suit;
  }

  function makeDeck(spec) {
    var deck = [];
    var s, r;
    for (s = 0; s < spec.suits; s++) {
      for (r = 1; r <= spec.maxRank; r++) {
        deck.push({
          id: SUITS[s] + '-' + r,
          suit: SUITS[s],
          rank: r,
          up: false
        });
      }
    }
    return deck;
  }

  function shuffle(deck, rng) {
    var i, j, tmp;
    for (i = deck.length - 1; i > 0; i--) {
      j = Math.floor(rng() * (i + 1));
      tmp = deck[i];
      deck[i] = deck[j];
      deck[j] = tmp;
    }
    return deck;
  }

  function canStack(spec, moving, onto) {
    if (!onto || !moving) return false;
    if (moving.rank !== onto.rank - 1) return false;
    if (spec.suits === 1) return true;
    return colorOf(moving.suit) !== colorOf(onto.suit);
  }

  function canFoundation(card, pile) {
    if (!card) return false;
    if (!pile || !pile.length) return card.rank === 1;
    var top = pile[pile.length - 1];
    return card.suit === top.suit && card.rank === top.rank + 1;
  }

  function canEmpty(spec, card) {
    if (!card) return false;
    if (spec.emptyAny) return true;
    return card.rank === spec.maxRank;
  }

  function runOk(spec, pile, index) {
    if (!pile || index < 0 || index >= pile.length) return false;
    if (!pile[index].up) return false;
    var i;
    for (i = index; i < pile.length - 1; i++) {
      if (!pile[i + 1].up) return false;
      if (!canStack(spec, pile[i + 1], pile[i])) return false;
    }
    return true;
  }

  function createGame(level, rng) {
    rng = rng || Math.random;
    level = level >= 1 && level <= 5 ? level : 2;
    var spec = specFor(level);
    var deck = shuffle(makeDeck(spec), rng);
    var tableau = [];
    var c, r, pile, bury, card;
    for (c = 0; c < spec.columns; c++) {
      pile = [];
      var count = 1 + (c % 3);
      if (c === spec.columns - 1) count = Math.max(1, count - 1);
      for (r = 0; r < count && deck.length > 1; r++) {
        card = deck.pop();
        card.up = true;
        pile.push(card);
      }
      bury = Math.min(spec.bury, Math.max(0, pile.length - 1));
      for (r = 0; r < bury; r++) pile[r].up = false;
      tableau.push(pile);
    }
    var foundations = [];
    for (c = 0; c < spec.suits; c++) foundations.push([]);
    var stock = deck;
    for (c = 0; c < stock.length; c++) stock[c].up = false;
    return {
      level: level,
      spec: {
        suits: spec.suits,
        maxRank: spec.maxRank,
        columns: spec.columns,
        bury: spec.bury,
        recycles: spec.recycles,
        emptyAny: spec.emptyAny
      },
      foundations: foundations,
      tableau: tableau,
      stock: stock,
      waste: [],
      recyclesLeft: spec.recycles,
      moves: 0,
      won: false,
      lastSig: ''
    };
  }

  function dealsLeft(state, dateKey) {
    var saved = state && state.world && state.world.solitaire;
    var used = saved && saved.dateKey === dateKey ? (saved.deals || 0) : 0;
    return Math.max(0, DEALS_PER_DAY - used);
  }

  function noteDeal(state, dateKey) {
    if (!state.world || typeof state.world !== 'object') state.world = {};
    var saved = state.world.solitaire;
    if (!saved || saved.dateKey !== dateKey) {
      state.world.solitaire = { dateKey: dateKey || null, deals: 0 };
    }
    state.world.solitaire.deals += 1;
    return state.world.solitaire;
  }

  function openGame(state, rng, dateKey) {
    if (!canPlay(state)) {
      return {
        ok: false,
        game: null,
        resting: false,
        message: 'That table is quiet for now.'
      };
    }
    if (dealsLeft(state, dateKey) <= 0) {
      return {
        ok: false,
        game: null,
        resting: true,
        message: 'The cards are resting for today. You can head back to town.'
      };
    }
    noteDeal(state, dateKey);
    var level = levelOf(state);
    return {
      ok: true,
      game: createGame(level, rng || Math.random),
      resting: false,
      message: 'Build each pile from ace upward. You can head back to town anytime.'
    };
  }

  function topCard(pile) {
    if (!pile || !pile.length) return null;
    return pile[pile.length - 1];
  }

  function revealTop(pile) {
    var card = topCard(pile);
    if (card && !card.up) card.up = true;
  }

  function foundationIndex(game, card) {
    var i;
    for (i = 0; i < game.foundations.length; i++) {
      if (canFoundation(card, game.foundations[i])) return i;
    }
    return -1;
  }

  function checkWin(game) {
    var i, n = 0;
    for (i = 0; i < game.foundations.length; i++) n += game.foundations[i].length;
    var total = game.spec.suits * game.spec.maxRank;
    game.won = n >= total;
    return game.won;
  }

  function applyMove(game, move) {
    if (!game || game.won) {
      return { ok: false, won: !!(game && game.won), message: 'These cards are finished. The town is right outside.' };
    }
    if (!move || !move.type) {
      return { ok: false, won: false, message: 'Try a card, or ask for a hint.' };
    }
    var spec = game.spec;
    var card, dest, idx, run, target;

    if (move.type === 'draw') {
      if (!game.stock.length) {
        return { ok: false, won: false, message: 'The draw pile is empty. A hint can show another idea.' };
      }
      card = game.stock.pop();
      card.up = true;
      game.waste.push(card);
      game.moves += 1;
      game.lastSig = 'draw';
      return { ok: true, won: checkWin(game), message: 'You drew the ' + cardName(card) + '.' };
    }

    if (move.type === 'recycle') {
      if (game.stock.length || !game.waste.length || game.recyclesLeft <= 0) {
        return { ok: false, won: false, message: 'The draw pile can rest. You can still head back to town.' };
      }
      while (game.waste.length) {
        card = game.waste.pop();
        card.up = false;
        game.stock.push(card);
      }
      game.recyclesLeft -= 1;
      game.moves += 1;
      game.lastSig = 'recycle';
      return { ok: true, won: false, message: 'The draw pile is ready again.' };
    }

    if (move.type === 'waste-foundation') {
      card = topCard(game.waste);
      idx = card ? foundationIndex(game, card) : -1;
      if (idx === -1) {
        return { ok: false, won: false, message: 'That card needs a different spot. A hint can help.' };
      }
      game.waste.pop();
      game.foundations[idx].push(card);
      game.moves += 1;
      game.lastSig = 'wf-' + card.id;
      var wonW = checkWin(game);
      return {
        ok: true,
        won: wonW,
        message: wonW ? 'You built every pile. All done.' : 'The ' + cardName(card) + ' found its pile.'
      };
    }

    if (move.type === 'waste-tableau') {
      card = topCard(game.waste);
      dest = game.tableau[move.column];
      if (!card || !dest) {
        return { ok: false, won: false, message: 'That spot is not ready. Try a hint.' };
      }
      target = topCard(dest);
      if (!target && !canEmpty(spec, card)) {
        return { ok: false, won: false, message: 'An empty column wants a different card. Try a hint.' };
      }
      if (target && !canStack(spec, card, target)) {
        return { ok: false, won: false, message: 'That card wants a different spot. Try a hint.' };
      }
      game.waste.pop();
      dest.push(card);
      game.moves += 1;
      game.lastSig = 'wt-' + card.id + '-' + move.column;
      return { ok: true, won: checkWin(game), message: 'The ' + cardName(card) + ' moved over.' };
    }

    if (move.type === 'tableau-foundation') {
      dest = game.tableau[move.column];
      card = topCard(dest);
      idx = card ? foundationIndex(game, card) : -1;
      if (!dest || idx === -1) {
        return { ok: false, won: false, message: 'That card stays for now. A hint can show a next step.' };
      }
      dest.pop();
      revealTop(dest);
      game.foundations[idx].push(card);
      game.moves += 1;
      game.lastSig = 'tf-' + card.id;
      var wonT = checkWin(game);
      return {
        ok: true,
        won: wonT,
        message: wonT ? 'You built every pile. All done.' : 'The ' + cardName(card) + ' found its pile.'
      };
    }

    if (move.type === 'tableau-tableau') {
      var from = game.tableau[move.from];
      var to = game.tableau[move.to];
      if (!from || !to || move.from === move.to) {
        return { ok: false, won: false, message: 'Try another column, or ask for a hint.' };
      }
      var index = move.index != null ? move.index : from.length - 1;
      if (!runOk(spec, from, index)) {
        return { ok: false, won: false, message: 'Those cards stay together a different way. Try a hint.' };
      }
      card = from[index];
      target = topCard(to);
      if (!target && !canEmpty(spec, card)) {
        return { ok: false, won: false, message: 'An empty column wants a different card. Try a hint.' };
      }
      if (target && !canStack(spec, card, target)) {
        return { ok: false, won: false, message: 'That card wants a different spot. Try a hint.' };
      }
      run = from.splice(index);
      revealTop(from);
      var k;
      for (k = 0; k < run.length; k++) to.push(run[k]);
      game.moves += 1;
      game.lastSig = 'tt-' + card.id + '-' + move.from + '-' + move.to;
      return { ok: true, won: checkWin(game), message: 'You moved the ' + cardName(card) + '.' };
    }

    return { ok: false, won: false, message: 'Try a card, or ask for a hint.' };
  }

  function sameSig(game, sig) {
    return game.lastSig && game.lastSig === sig;
  }

  function neededCards(game) {
    var suits = SUITS.slice(0, game.spec.suits);
    var needs = [];
    var used = {};
    var empty = 0;
    var i, pile, top;
    for (i = 0; i < game.foundations.length; i++) {
      pile = game.foundations[i];
      if (!pile.length) {
        empty += 1;
        continue;
      }
      top = pile[pile.length - 1];
      used[top.suit] = true;
      if (top.rank < game.spec.maxRank) needs.push({ suit: top.suit, rank: top.rank + 1 });
    }
    if (empty) {
      for (i = 0; i < suits.length; i++) {
        if (!used[suits[i]]) needs.push({ suit: suits[i], rank: 1 });
      }
    }
    return needs;
  }

  function locateCard(game, suit, rank) {
    var i, j, col;
    for (i = 0; i < game.tableau.length; i++) {
      col = game.tableau[i];
      for (j = 0; j < col.length; j++) {
        if (col[j].suit === suit && col[j].rank === rank) return { column: i, index: j };
      }
    }
    return null;
  }

  function findUnblock(game) {
    var needs = neededCards(game);
    var spec = game.spec;
    var n, loc, col, start, moving, j, target, sig;
    for (n = 0; n < needs.length; n++) {
      loc = locateCard(game, needs[n].suit, needs[n].rank);
      if (!loc) continue;
      col = game.tableau[loc.column];
      if (!col || loc.index >= col.length - 1) continue;
      start = loc.index + 1;
      while (start < col.length && !col[start].up) start += 1;
      if (start >= col.length || !runOk(spec, col, start)) continue;
      moving = col[start];
      for (j = 0; j < game.tableau.length; j++) {
        if (j === loc.column) continue;
        target = topCard(game.tableau[j]);
        if (!target && canEmpty(spec, moving)) {
          sig = 'tt-' + moving.id + '-' + loc.column + '-' + j;
          return {
            type: 'tableau-tableau',
            from: loc.column,
            to: j,
            index: start,
            sig: sig,
            say: 'Moving the ' + cardName(moving) + ' opens the card under it.'
          };
        }
        if (target && canStack(spec, moving, target)) {
          sig = 'tt-' + moving.id + '-' + loc.column + '-' + j;
          return {
            type: 'tableau-tableau',
            from: loc.column,
            to: j,
            index: start,
            sig: sig,
            say: 'The ' + cardName(moving) + ' can sit on the ' + cardName(target) + '.'
          };
        }
      }
    }
    return null;
  }

  function findMove(game) {
    if (!game || game.won) return null;
    var spec = game.spec;
    var card, i, j, idx, dest, target, sig, from, index;

    card = topCard(game.waste);
    if (card && foundationIndex(game, card) !== -1) {
      sig = 'wf-' + card.id;
      if (!sameSig(game, sig)) return { type: 'waste-foundation', sig: sig, say: 'The ' + cardName(card) + ' can go up on its pile.' };
    }

    for (i = 0; i < game.tableau.length; i++) {
      card = topCard(game.tableau[i]);
      if (card && card.up && foundationIndex(game, card) !== -1) {
        sig = 'tf-' + card.id;
        if (!sameSig(game, sig)) {
          return { type: 'tableau-foundation', column: i, sig: sig, say: 'The ' + cardName(card) + ' can go up on its pile.' };
        }
      }
    }

    var unblock = findUnblock(game);
    if (unblock && !sameSig(game, unblock.sig)) return unblock;

    for (i = 0; i < game.tableau.length; i++) {
      from = game.tableau[i];
      if (from.length < 2) continue;
      for (index = 0; index < from.length; index++) {
        if (from[index].up) break;
      }
      if (index <= 0 || index >= from.length) continue;
      if (!from[index - 1] || from[index - 1].up) continue;
      if (!runOk(spec, from, index)) continue;
      card = from[index];
      for (j = 0; j < game.tableau.length; j++) {
        if (j === i) continue;
        dest = game.tableau[j];
        target = topCard(dest);
        if (!target && canEmpty(spec, card)) {
          sig = 'tt-' + card.id + '-' + i + '-' + j;
          if (!sameSig(game, sig)) {
            return { type: 'tableau-tableau', from: i, to: j, index: index, sig: sig, say: 'Moving the ' + cardName(card) + ' shows the card under it.' };
          }
        }
        if (target && canStack(spec, card, target)) {
          sig = 'tt-' + card.id + '-' + i + '-' + j;
          if (!sameSig(game, sig)) {
            return { type: 'tableau-tableau', from: i, to: j, index: index, sig: sig, say: 'The ' + cardName(card) + ' can sit on the ' + cardName(target) + '.' };
          }
        }
      }
    }

    card = topCard(game.waste);
    if (card) {
      for (j = 0; j < game.tableau.length; j++) {
        target = topCard(game.tableau[j]);
        if (!target && canEmpty(spec, card)) {
          sig = 'wt-' + card.id + '-' + j;
          if (!sameSig(game, sig)) return { type: 'waste-tableau', column: j, sig: sig, say: 'The ' + cardName(card) + ' can start an empty column.' };
        }
        if (target && canStack(spec, card, target)) {
          sig = 'wt-' + card.id + '-' + j;
          if (!sameSig(game, sig)) return { type: 'waste-tableau', column: j, sig: sig, say: 'The ' + cardName(card) + ' can sit on the ' + cardName(target) + '.' };
        }
      }
    }

    for (i = 0; i < game.tableau.length; i++) {
      from = game.tableau[i];
      for (index = 0; index < from.length; index++) {
        if (!runOk(spec, from, index)) continue;
        if (index === from.length - 1 && from.length === 1) continue;
        card = from[index];
        for (j = 0; j < game.tableau.length; j++) {
          if (j === i) continue;
          target = topCard(game.tableau[j]);
          if (!target || !canStack(spec, card, target)) continue;
          sig = 'tt-' + card.id + '-' + i + '-' + j;
          if (sameSig(game, sig)) continue;
          return { type: 'tableau-tableau', from: i, to: j, index: index, sig: sig, say: 'The ' + cardName(card) + ' can sit on the ' + cardName(target) + '.' };
        }
      }
    }

    if (game.stock.length) {
      return { type: 'draw', sig: 'draw', say: 'Draw one card.' };
    }
    if (!game.stock.length && game.waste.length && game.recyclesLeft > 0) {
      return { type: 'recycle', sig: 'recycle', say: 'Turn the draw pile over and try again.' };
    }
    return null;
  }

  function hintMessage(game) {
    if (!game) return 'The cards are here when you want them.';
    if (game.won) return 'You built every pile. All done.';
    var move = findMove(game);
    if (!move) return 'You can head back to town anytime. The cards will wait.';
    return move.say;
  }

  function cardCount(game) {
    if (!game) return 0;
    return game.spec.suits * game.spec.maxRank;
  }

  function faceDownCount(game) {
    if (!game) return 0;
    var n = 0;
    var i, j;
    for (i = 0; i < game.tableau.length; i++) {
      for (j = 0; j < game.tableau[i].length; j++) {
        if (!game.tableau[i][j].up) n += 1;
      }
    }
    for (i = 0; i < game.stock.length; i++) {
      if (!game.stock[i].up) n += 1;
    }
    return n;
  }

  function exitMessage() {
    return 'All done. Back to town whenever you like.';
  }

  return {
    DEALS_PER_DAY: DEALS_PER_DAY,
    specFor: specFor,
    canPlay: canPlay,
    createGame: createGame,
    openGame: openGame,
    dealsLeft: dealsLeft,
    applyMove: applyMove,
    findMove: findMove,
    hintMessage: hintMessage,
    cardCount: cardCount,
    faceDownCount: faceDownCount,
    cardName: cardName,
    rankLabel: rankLabel,
    colorOf: colorOf,
    exitMessage: exitMessage,
    checkWin: checkWin
  };
});
