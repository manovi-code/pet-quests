/**
 * Pet Quests — general-store math.
 * She keeps an item only after she builds the right amount.
 * A miss does not spend coins. Rank changes the kind of money problem.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      typeof require !== 'undefined' ? require('./world.js') : root.PQWorld,
      typeof require !== 'undefined' ? require('./bank.js') : root.PQBank
    );
  } else {
    root.PQShop = factory(root.PQWorld, root.PQBank);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (PQWorld, PQBank) {
  'use strict';

  function clampGrade(grade) {
    var n = parseInt(grade, 10);
    if (!(n >= 1 && n <= 5)) return 2;
    return n;
  }

  function catalog(state) {
    var items = PQWorld && PQWorld.SHOP_ITEMS ? PQWorld.SHOP_ITEMS : [];
    var out = [];
    var i;
    for (i = 0; i < items.length; i++) {
      if (state && PQWorld.hasUnlock(state, items[i].id)) continue;
      out.push(items[i]);
    }
    return out;
  }

  function itemById(id) {
    var items = PQWorld && PQWorld.SHOP_ITEMS ? PQWorld.SHOP_ITEMS : [];
    var i;
    for (i = 0; i < items.length; i++) {
      if (items[i].id === id) return items[i];
    }
    return null;
  }

  function factorPair(price, rng) {
    var pairs = [];
    var qty;
    for (qty = 2; qty <= 6; qty++) {
      if (price % qty === 0) {
        var unit = price / qty;
        if (unit >= 1 && unit <= 12) pairs.push({ unit: unit, qty: qty });
      }
    }
    if (!pairs.length) pairs.push({ unit: price, qty: 1 });
    return pairs[Math.floor(rng() * pairs.length) % pairs.length];
  }

  /**
   * Scout: picture coins that add up to the price (1s and 5s).
   * Explorer: 1s, 5s, and 10s.
   * Ranger: how many coins for several of an item (multiplication).
   * Keeper: two amounts that make the price.
   * Champion: pay with a larger bill and make change.
   */
  function problemFor(item, grade, rng) {
    rng = rng || Math.random;
    grade = clampGrade(grade);
    var price = item && item.price ? item.price : 6;
    if (grade <= 1) {
      return {
        mode: 'coins',
        rankScore: 1,
        price: price,
        coins: [1, 5],
        pictures: true,
        prompt: 'Pick coins that add up to ' + price + '.'
      };
    }
    if (grade === 2) {
      return {
        mode: 'coins',
        rankScore: 2,
        price: price,
        coins: [1, 5, 10],
        pictures: true,
        prompt: 'Pick coins that add up to ' + price + '.'
      };
    }
    if (grade === 3) {
      var pair = factorPair(price, rng);
      return {
        mode: 'howmany',
        rankScore: 3,
        unit: pair.unit,
        qty: pair.qty,
        price: price,
        answer: pair.unit * pair.qty,
        prompt: (rng() < 0.5
          ? (pair.qty + ' groups of ' + pair.unit + ' coins. How many coins is that?')
          : ('One costs ' + pair.unit + ' coins. You need ' + pair.qty + '. How many coins is that?'))
      };
    }
    if (grade === 4) {
      var ribbon = Math.min(5, Math.max(1, Math.floor(price / 3)));
      var main = price - ribbon;
      if (main < 1) {
        main = price;
        ribbon = 0;
      }
      return {
        mode: 'total',
        rankScore: 4,
        parts: ribbon ? [main, ribbon] : [price],
        price: price,
        answer: price,
        prompt: ribbon
          ? ('The item costs ' + main + ' coins and a ribbon costs ' + ribbon + '. How many coins altogether?')
          : ('How many coins make ' + price + '?')
      };
    }
    var paid = price <= 10 ? 20 : 25;
    if (paid <= price) paid = price + 10;
    return {
      mode: 'change',
      rankScore: 5,
      price: price,
      paid: paid,
      answer: paid - price,
      prompt: 'The price is ' + price + ' coins. You pay with ' + paid + '. How much change do you get?'
    };
  }

  function sumCoins(list) {
    var sum = 0;
    var i;
    list = list || [];
    for (i = 0; i < list.length; i++) sum += parseInt(list[i], 10) || 0;
    return sum;
  }

  function checkProblem(problem, input) {
    input = input || {};
    if (!problem) return { ok: false, hint: 'Pick a shelf first.' };
    if (problem.mode === 'coins') {
      var coins = input.coins || [];
      var i;
      var sum = 0;
      for (i = 0; i < coins.length; i++) {
        var c = parseInt(coins[i], 10);
        if (problem.coins.indexOf(c) === -1) {
          return { ok: false, hint: 'Use the coins on the counter.' };
        }
        sum += c;
      }
      if (sum === problem.price) return { ok: true, hint: '' };
      if (sum > problem.price) {
        return { ok: false, hint: 'That adds to ' + sum + '. The price is ' + problem.price + '. You can take a coin back.' };
      }
      return { ok: false, hint: 'That adds to ' + sum + ' so far. The price is ' + problem.price + '.' };
    }
    var given = parseInt(input.value, 10);
    if (given === problem.answer) return { ok: true, hint: '' };
    return { ok: false, hint: 'Not yet. The numbers on the tag can help.' };
  }

  /**
   * Buy only when the amount is right and the bank can cover the price.
   * A wrong amount leaves the bank alone.
   */
  function buy(state, itemId, input, grade) {
    var item = itemById(itemId);
    var coins = PQBank.getCoins(state);
    if (!item) return { ok: false, hint: 'That is not on the shelf.', coins: coins, spent: 0 };
    if (PQWorld.hasUnlock(state, item.id)) {
      return { ok: false, hint: 'You already brought that home.', coins: coins, spent: 0, already: true };
    }
    var problem = (input && input.problem) || problemFor(item, grade, Math.random);
    var check = checkProblem(problem, input);
    if (!check.ok) {
      PQBank.noteMistake(state);
      return { ok: false, hint: check.hint, coins: PQBank.getCoins(state), spent: 0 };
    }
    var price = problem.price || item.price;
    if (!PQBank.spendCoins(state, price)) {
      return {
        ok: false,
        hint: 'The bank does not have enough yet. You can earn more and come back.',
        coins: PQBank.getCoins(state),
        spent: 0
      };
    }
    PQWorld.ensureWorld(state);
    state.world.unlocks.push(item.id);
    return {
      ok: true,
      item: item,
      hint: '',
      coins: PQBank.getCoins(state),
      spent: price,
      message: 'You bought ' + item.name + '. It is ready to place at home.'
    };
  }

  function coinSvg(n) {
    var label = String(n);
    return (
      '<svg class="coin-svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="' + label + ' coin">' +
      '<circle cx="32" cy="32" r="28" fill="#f0d56a" stroke="#a35f38" stroke-width="4"/>' +
      '<circle cx="32" cy="32" r="20" fill="none" stroke="#fff4c4" stroke-width="2"/>' +
      '<text x="32" y="40" text-anchor="middle" font-size="22" font-family="Georgia, serif" fill="#5c4030">' + label + '</text>' +
      '</svg>'
    );
  }

  return {
    catalog: catalog,
    itemById: itemById,
    problemFor: problemFor,
    checkProblem: checkProblem,
    buy: buy,
    coinSvg: coinSvg,
    sumCoins: sumCoins
  };
});
