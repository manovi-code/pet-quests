/**
 * Pet Quests — coin bank.
 * Coins are only added for good things. Mistakes never remove coins.
 * Spending happens only when a shop problem is answered and she can afford it.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PQBank = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function ensureBank(state) {
    if (!state.bank || typeof state.bank !== 'object' || Array.isArray(state.bank)) {
      state.bank = { coins: 0 };
    }
    var n = parseInt(state.bank.coins, 10);
    if (!(n >= 0)) n = 0;
    state.bank.coins = n;
    return state.bank;
  }

  function getCoins(state) {
    return ensureBank(state).coins;
  }

  /**
   * Add coins. Zero and negative amounts do nothing.
   * Returns the new balance.
   */
  function addCoins(state, amount) {
    var bank = ensureBank(state);
    var n = parseInt(amount, 10);
    if (!(n > 0)) return bank.coins;
    bank.coins += n;
    return bank.coins;
  }

  /**
   * Spend coins only when the balance covers the price.
   * Never drives the balance below zero. A bad price does nothing.
   */
  function spendCoins(state, amount) {
    var bank = ensureBank(state);
    var n = parseInt(amount, 10);
    if (!(n > 0)) return false;
    if (bank.coins < n) return false;
    bank.coins -= n;
    if (bank.coins < 0) bank.coins = 0;
    return true;
  }

  /** A wrong answer, a miss, or a closed minigame must not touch the bank. */
  function noteMistake(state) {
    return getCoins(state);
  }

  function piggySvg() {
    return (
      '<svg class="piggy-svg" viewBox="0 0 160 120" width="100%" height="120" role="img" aria-label="Piggy bank">' +
      '<ellipse cx="80" cy="108" rx="54" ry="8" fill="#e7d3b0"/>' +
      '<ellipse cx="78" cy="68" rx="52" ry="36" fill="#f4b6c8"/>' +
      '<ellipse cx="78" cy="74" rx="36" ry="22" fill="#f7c6d4"/>' +
      '<ellipse cx="118" cy="62" rx="18" ry="14" fill="#f4b6c8"/>' +
      '<circle cx="124" cy="58" r="3" fill="#5c4030"/>' +
      '<circle cx="132" cy="60" r="2.2" fill="#5c4030"/>' +
      '<ellipse cx="112" cy="70" rx="7" ry="4" fill="#e07a8a"/>' +
      '<path d="M54 40 Q78 22 104 38" fill="none" stroke="#c4784a" stroke-width="4" stroke-linecap="round"/>' +
      '<rect x="70" y="28" width="16" height="8" rx="3" fill="#e8c84a"/>' +
      '<circle cx="62" cy="64" r="4" fill="#5c4030"/>' +
      '<circle cx="90" cy="62" r="4" fill="#5c4030"/>' +
      '<path d="M70 78 Q78 84 88 76" fill="none" stroke="#a35f38" stroke-width="2" stroke-linecap="round"/>' +
      '<ellipse cx="46" cy="96" rx="8" ry="5" fill="#e7a0b4"/>' +
      '<ellipse cx="108" cy="96" rx="8" ry="5" fill="#e7a0b4"/>' +
      '</svg>'
    );
  }

  return {
    ensureBank: ensureBank,
    getCoins: getCoins,
    addCoins: addCoins,
    spendCoins: spendCoins,
    noteMistake: noteMistake,
    piggySvg: piggySvg
  };
});
