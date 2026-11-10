/**
 * Pet Quests — gentle Web Audio beeps; mute persists via caller/localStorage.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PQAudio = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var ctx = null;

  function getCtx() {
    if (typeof window === 'undefined') return null;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    return ctx;
  }

  function beep(freq, dur, type, gainVal) {
    var c = getCtx();
    if (!c) return;
    try {
      if (c.state === 'suspended') c.resume();
      var osc = c.createOscillator();
      var g = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      g.gain.value = gainVal == null ? 0.04 : gainVal;
      osc.connect(g);
      g.connect(c.destination);
      var now = c.currentTime;
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    } catch (e) { /* ignore */ }
  }

  function play(kind, soundOn) {
    if (!soundOn) return;
    if (kind === 'correct') {
      beep(523.25, 0.12, 'sine', 0.05);
      setTimeout(function () { beep(659.25, 0.14, 'sine', 0.045); }, 90);
    } else if (kind === 'soft' || kind === 'gentle') {
      beep(392, 0.1, 'sine', 0.028);
    } else if (kind === 'tap') {
      beep(440, 0.04, 'triangle', 0.025);
    } else if (kind === 'celebrate') {
      beep(523.25, 0.1, 'sine', 0.05);
      setTimeout(function () { beep(659.25, 0.1, 'sine', 0.05); }, 100);
      setTimeout(function () { beep(783.99, 0.18, 'sine', 0.05); }, 200);
    } else if (kind === 'hint') {
      beep(349.23, 0.1, 'sine', 0.035);
    } else if (kind === 'party') {
      beep(523.25, 0.1, 'sine', 0.045);
      setTimeout(function () { beep(659.25, 0.1, 'sine', 0.04); }, 110);
      setTimeout(function () { beep(783.99, 0.16, 'sine', 0.04); }, 220);
    } else if (kind === 'spin') {
      beep(392, 0.07, 'triangle', 0.03);
      setTimeout(function () { beep(494, 0.07, 'triangle', 0.03); }, 80);
      setTimeout(function () { beep(587, 0.12, 'sine', 0.04); }, 160);
    }
  }

  function speak(text, soundOn) {
    if (!soundOn) return false;
    if (typeof window === 'undefined' || !window.speechSynthesis) return false;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      u.rate = 0.92;
      u.pitch = 1.05;
      u.volume = 0.9;
      window.speechSynthesis.speak(u);
      return true;
    } catch (e) {
      return false;
    }
  }

  function canSpeak() {
    return typeof window !== 'undefined' && !!window.speechSynthesis;
  }

  function stopSpeak() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    }
  }

  return {
    play: play,
    speak: speak,
    canSpeak: canSpeak,
    stopSpeak: stopSpeak
  };
});
