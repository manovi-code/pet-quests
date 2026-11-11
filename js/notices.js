/**
 * Pet Quests — result cards close on their own.
 * A read-aloud pause holds the card until speech finishes, then the timer starts again.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PQNotices = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var NOTICE_MS = 3000;

  function create(clock) {
    clock = clock || {};
    var setTimer = clock.setTimeout || setTimeout;
    var clearTimer = clock.clearTimeout || clearTimeout;
    var serial = 0;
    var timer = null;
    var open = false;
    var paused = false;

    function clear() {
      if (timer != null) {
        clearTimer(timer);
        timer = null;
      }
    }

    function arm() {
      clear();
      if (!open || paused) return;
      var id = serial;
      timer = setTimer(function () {
        if (id !== serial || paused || !open) return;
        open = false;
        timer = null;
        serial += 1;
        if (clock.onDismiss) clock.onDismiss();
      }, NOTICE_MS);
    }

    return {
      NOTICE_MS: NOTICE_MS,
      show: function () {
        serial += 1;
        open = true;
        paused = false;
        arm();
      },
      pause: function () {
        if (!open) return;
        paused = true;
        clear();
      },
      resume: function () {
        if (!open) return;
        paused = false;
        arm();
      },
      dismiss: function () {
        if (!open) return;
        open = false;
        paused = false;
        serial += 1;
        clear();
        if (clock.onDismiss) clock.onDismiss();
      },
      isOpen: function () { return open; },
      isPaused: function () { return paused; }
    };
  }

  return {
    NOTICE_MS: NOTICE_MS,
    create: create
  };
});
