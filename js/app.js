/**
 * Pet Quests — UI controller (phone-first, one task at a time).
 */
(function () {
  'use strict';

  var store = PQStorage.createStore(
    typeof localStorage !== 'undefined' ? localStorage : null
  );
  var state = store.load();
  var keypadValue = '';
  var feedback = null; // { kind, message, hint }
  var screen = 'boot';
  var selectedPet = null;
  var nicknameDraft = '';
  var settingsOpen = false;
  var readingRevealed = false;

  function $(sel) {
    return document.querySelector(sel);
  }

  function save() {
    store.save(state);
  }

  function go(name) {
    screen = name;
    feedback = null;
    keypadValue = '';
    readingRevealed = false;
    PQAudio.stopSpeak();
    render();
  }

  function todayDone() {
    var dk = PQStorage.localDateKey();
    return state.daily && state.daily.dateKey === dk && state.daily.completed;
  }

  function boot() {
    state = store.load();
    PQStorage.ensureWeek(state);
    if (!state.onboardingDone || !state.petId) {
      go('welcome');
      return;
    }
    PQQuest.ensureTodayQuest(state);
    save();
    go('home');
  }

  /* ---------- Render ---------- */

  function render() {
    var app = $('#app');
    if (!app) return;
    app.innerHTML = '';
    app.className = 'app screen-' + screen;

    if (screen === 'welcome') renderWelcome(app);
    else if (screen === 'pick-pet') renderPickPet(app);
    else if (screen === 'nickname') renderNickname(app);
    else if (screen === 'home') renderHome(app);
    else if (screen === 'quest') renderQuest(app);
    else if (screen === 'celebrate') renderCelebrate(app);
    else if (screen === 'practice') renderPractice(app);
    else if (screen === 'settings') renderSettings(app);
    else renderWelcome(app);

    bindGlobal();
  }

  function headerBar(title, opts) {
    opts = opts || {};
    var soundLabel = state.soundOn ? 'Sound on' : 'Sound off';
    var back = opts.back
      ? '<button type="button" class="icon-btn" data-act="back" aria-label="Back">←</button>'
      : '<span class="icon-btn spacer"></span>';
    return (
      '<header class="topbar">' +
      back +
      '<h1 class="top-title">' +
      esc(title) +
      '</h1>' +
      '<button type="button" class="icon-btn sound-btn" data-act="toggle-sound" aria-label="' +
      soundLabel +
      '" aria-pressed="' +
      (state.soundOn ? 'true' : 'false') +
      '">' +
      (state.soundOn ? '♪' : '🔇') +
      '</button>' +
      '</header>'
    );
  }

  function renderWelcome(app) {
    app.innerHTML =
      headerBar('Pet Quests') +
      '<main class="panel welcome">' +
      '<div class="hero-mark" aria-hidden="true">🌿</div>' +
      '<h2>Welcome to Pet Quests</h2>' +
      '<p class="lede">Practice a little each day. Your pet grows with you. Progress stays on this device.</p>' +
      '<ul class="soft-list">' +
      '<li>Warmup math</li>' +
      '<li>A short pet story</li>' +
      '<li>Times tables practice</li>' +
      '</ul>' +
      '<button type="button" class="btn primary lg" data-act="start-onboarding">Meet your pet</button>' +
      '</main>';
  }

  function renderPickPet(app) {
    var cards = PQPets.PETS.map(function (p) {
      var sel = selectedPet === p.id ? ' selected' : '';
      return (
        '<button type="button" class="pet-card' +
        sel +
        '" data-act="select-pet" data-pet="' +
        p.id +
        '" aria-pressed="' +
        (selectedPet === p.id ? 'true' : 'false') +
        '">' +
        '<div class="pet-card-art">' +
        PQPets.renderPetSvg(p.id, 1, { label: p.name }) +
        '</div>' +
        '<strong>' +
        esc(p.name) +
        '</strong>' +
        '<span>' +
        esc(p.blurb) +
        '</span>' +
        '</button>'
      );
    }).join('');

    app.innerHTML =
      headerBar('Choose a pet', { back: true }) +
      '<main class="panel">' +
      '<p class="lede center">Pick a friend for your garden habitat.</p>' +
      '<div class="pet-grid">' +
      cards +
      '</div>' +
      '<button type="button" class="btn primary lg" data-act="confirm-pet" ' +
      (selectedPet ? '' : 'disabled') +
      '>Continue</button>' +
      '</main>';
  }

  function renderNickname(app) {
    var pet = PQPets.getPet(state.petId || selectedPet);
    app.innerHTML =
      headerBar('Nickname', { back: true }) +
      '<main class="panel">' +
      '<div class="pet-preview">' +
      PQPets.renderPetSvg(pet.id, 0, { label: pet.name }) +
      '</div>' +
      '<h2>Name your ' +
      esc(pet.name.toLowerCase()) +
      '?</h2>' +
      '<p class="lede">Optional. You can leave this blank.</p>' +
      '<label class="field">' +
      '<span class="sr-only">Pet nickname</span>' +
      '<input id="nick-input" class="text-input" maxlength="16" autocomplete="off" spellcheck="false" placeholder="Nickname (optional)" value="' +
      esc(nicknameDraft) +
      '" />' +
      '</label>' +
      '<button type="button" class="btn primary lg" data-act="finish-onboarding">Enter the garden</button>' +
      '<button type="button" class="btn ghost" data-act="finish-onboarding-skip">Skip for now</button>' +
      '</main>';
    var input = $('#nick-input');
    if (input) {
      input.addEventListener('input', function () {
        nicknameDraft = input.value;
      });
      setTimeout(function () {
        try {
          input.focus();
        } catch (e) { /* ignore */ }
      }, 50);
    }
  }

  function renderHome(app) {
    PQQuest.ensureTodayQuest(state);
    save();
    var name = PQPets.displayName(state);
    var stage = state.growthStage || 0;
    var week = PQStorage.weeklyProgress(state);
    var mastered = PQMath.masteredTables(state.tableStats || {});
    var done = todayDone();
    var cta = done
      ? '<p class="kind-note">Today’s quest is done. Nice work — come back tomorrow, or try a little extra practice.</p>' +
        '<button type="button" class="btn primary lg" data-act="extra-practice">Extra practice</button>'
      : '<button type="button" class="btn primary lg" data-act="start-quest">Start today’s quest</button>';

    app.innerHTML =
      headerBar('Pet Quests') +
      '<main class="panel home">' +
      '<div class="habitat-wrap">' +
      PQPets.renderHabitatSvg(stage) +
      '<div class="pet-on-habitat">' +
      PQPets.renderPetSvg(state.petId, stage, { label: name }) +
      '</div>' +
      '</div>' +
      '<h2 class="pet-name">' +
      esc(name) +
      '</h2>' +
      '<p class="stage-label">' +
      esc(PQPets.STAGE_LABELS[stage] || '') +
      '</p>' +
      '<div class="week-card" aria-label="Weekly goal">' +
      '<div class="week-top"><span>This week</span><strong>' +
      week.completed +
      ' / ' +
      week.goal +
      ' days</strong></div>' +
      '<div class="week-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' +
      week.goal +
      '" aria-valuenow="' +
      week.completed +
      '"><i style="width:' +
      Math.min(100, (week.completed / week.goal) * 100) +
      '%"></i></div>' +
      '<p class="week-hint">Goal: finish 5 daily quests this week. Missing a day is okay.</p>' +
      (mastered.length
        ? '<p class="week-hint">Times tables growing strong: ' +
          mastered.map(function (t) {
            return t + 's';
          }).join(', ') +
          '</p>'
        : '') +
      '</div>' +
      cta +
      '<div class="home-actions">' +
      '<button type="button" class="btn secondary" data-act="open-settings">Settings</button>' +
      '</div>' +
      '</main>';
  }

  function renderQuest(app) {
    PQQuest.ensureTodayQuest(state);
    if (todayDone()) {
      go('home');
      return;
    }
    var daily = state.daily;
    var idx = daily.taskIndex || 0;
    var total = daily.tasks.length;
    if (idx >= total) {
      finishQuest();
      return;
    }
    var task = daily.tasks[idx];
    var mission = PQQuest.currentMissionLabel(task);
    var progressPct = Math.round((idx / total) * 100);

    var body = '';
    if (task.type === 'reading-pass') body = renderReadingPass(task);
    else if (task.type === 'reading-q') body = renderReadingQ(task);
    else body = renderMathTask(task);

    app.innerHTML =
      headerBar(mission || 'Quest', { back: true }) +
      '<main class="panel quest">' +
      '<div class="quest-progress">' +
      '<div class="quest-progress-top"><span>Quest progress</span><span>' +
      (idx + 1) +
      ' / ' +
      total +
      '</span></div>' +
      '<div class="week-bar thin" role="progressbar" aria-valuemin="0" aria-valuemax="' +
      total +
      '" aria-valuenow="' +
      idx +
      '"><i style="width:' +
      progressPct +
      '%"></i></div>' +
      '</div>' +
      body +
      (feedback
        ? '<div class="feedback ' +
          (feedback.kind || '') +
          '" role="status">' +
          '<p>' +
          esc(feedback.message) +
          '</p>' +
          (feedback.hint ? '<p class="hint">' + esc(feedback.hint) + '</p>' : '') +
          '</div>'
        : '') +
      '</main>';
  }

  function renderReadingPass(task) {
    var speakBtn = PQAudio.canSpeak()
      ? '<button type="button" class="btn secondary" data-act="read-aloud">Read aloud</button>'
      : '';
    return (
      '<section class="reading-card">' +
      '<p class="eyebrow">Story</p>' +
      '<h2>' +
      esc(task.title) +
      '</h2>' +
      '<p class="passage">' +
      esc(task.text) +
      '</p>' +
      '<div class="row-actions">' +
      speakBtn +
      '<button type="button" class="btn primary lg" data-act="reading-continue">I read it</button>' +
      '</div>' +
      '</section>'
    );
  }

  function renderReadingQ(task) {
    var choices = (task.choices || [])
      .map(function (c, i) {
        var revealClass =
          readingRevealed && i === task.answer ? ' reveal-correct' : '';
        return (
          '<button type="button" class="choice-btn' +
          revealClass +
          '" data-act="choose-reading" data-idx="' +
          i +
          '">' +
          esc(c) +
          '</button>'
        );
      })
      .join('');
    return (
      '<section class="reading-card">' +
      '<p class="eyebrow">From the story</p>' +
      '<details class="passage-peek"><summary>Show story again</summary><p class="passage">' +
      esc(task.text) +
      '</p></details>' +
      '<h2 class="question">' +
      esc(task.question) +
      '</h2>' +
      '<div class="choices">' +
      choices +
      '</div>' +
      '</section>'
    );
  }

  function renderMathTask(task) {
    return (
      '<section class="math-card">' +
      '<p class="eyebrow">' +
      (task.mission === 'warmup' ? 'Warmup' : 'Times tables') +
      '</p>' +
      '<div class="prompt" aria-live="polite">' +
      esc(task.prompt) +
      ' = ?</div>' +
      '<div class="answer-display" aria-live="polite">' +
      (keypadValue || ' ') +
      '</div>' +
      renderKeypad() +
      '</section>'
    );
  }

  function renderKeypad() {
    var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'Go'];
    return (
      '<div class="keypad" role="group" aria-label="Number keypad">' +
      keys
        .map(function (k) {
          var cls = 'key';
          var act = 'key';
          if (k === '⌫') {
            cls += ' key-back';
            act = 'key-back';
          } else if (k === 'Go') {
            cls += ' key-go';
            act = 'key-go';
          }
          return (
            '<button type="button" class="' +
            cls +
            '" data-act="' +
            act +
            '" data-key="' +
            k +
            '">' +
            k +
            '</button>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function renderCelebrate(app) {
    var name = PQPets.displayName(state);
    var stage = state.growthStage || 0;
    var week = PQStorage.weeklyProgress(state);
    app.innerHTML =
      headerBar('Quest complete') +
      '<main class="panel celebrate">' +
      '<div class="pet-preview big">' +
      PQPets.renderPetSvg(state.petId, stage, { label: name }) +
      '</div>' +
      '<h2>Wonderful work!</h2>' +
      '<p class="lede">' +
      esc(name) +
      ' looks proud. Your garden habitat grew a little too.</p>' +
      '<div class="week-card">' +
      '<div class="week-top"><span>This week</span><strong>' +
      week.completed +
      ' / ' +
      week.goal +
      ' days</strong></div>' +
      '<div class="week-bar"><i style="width:' +
      Math.min(100, (week.completed / week.goal) * 100) +
      '%"></i></div>' +
      (week.met
        ? '<p class="week-hint">Weekly goal met — extra growth for ' +
          esc(name) +
          '!</p>'
        : '<p class="week-hint">Keep going at your pace. Missing a day is okay.</p>') +
      '</div>' +
      '<button type="button" class="btn primary lg" data-act="go-home">Back to habitat</button>' +
      '</main>';
  }

  function renderPractice(app) {
    // Lightweight extra practice: one mul at a time, not counting as daily
    if (!state._practiceTask) {
      state._practiceTask = PQMath.makeMulTaskPreferWeakFacts(
        state.tableStats || {},
        state.factStats || {},
        Math.random,
        'practice'
      );
    }
    var task = state._practiceTask;
    app.innerHTML =
      headerBar('Extra practice', { back: true }) +
      '<main class="panel quest">' +
      '<p class="lede center">Just for fun — this does not change today’s quest.</p>' +
      renderMathTask(task) +
      (feedback
        ? '<div class="feedback ' +
          (feedback.kind || '') +
          '" role="status"><p>' +
          esc(feedback.message) +
          '</p>' +
          (feedback.hint ? '<p class="hint">' + esc(feedback.hint) + '</p>' : '') +
          '</div>'
        : '') +
      '</main>';
  }

  function renderSettings(app) {
    app.innerHTML =
      headerBar('Settings', { back: true }) +
      '<main class="panel">' +
      '<label class="toggle-row">' +
      '<span>Sound</span>' +
      '<button type="button" class="btn secondary" data-act="toggle-sound">' +
      (state.soundOn ? 'On' : 'Off') +
      '</button>' +
      '</label>' +
      '<div class="danger-zone">' +
      '<p class="lede">Parent options</p>' +
      '<button type="button" class="btn danger" data-act="reset-confirm">Reset all progress…</button>' +
      '<p class="fine-print">Clears pet, quests, and practice history saved on this device. Cannot be undone.</p>' +
      '</div>' +
      '</main>';
  }

  /* ---------- Actions ---------- */

  function bindGlobal() {
    var app = $('#app');
    if (!app || app._bound) return;
    app._bound = true;
    app.addEventListener('click', onClick);
  }

  function onClick(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    PQAudio.play('tap', state.soundOn);

    if (act === 'toggle-sound') {
      state.soundOn = !state.soundOn;
      save();
      render();
      return;
    }
    if (act === 'back') {
      if (screen === 'quest' || screen === 'practice' || screen === 'settings' || screen === 'pick-pet' || screen === 'nickname') {
        if (screen === 'nickname') go('pick-pet');
        else if (screen === 'pick-pet') go('welcome');
        else {
          if (screen === 'practice') state._practiceTask = null;
          go('home');
        }
      }
      return;
    }
    if (act === 'start-onboarding') {
      selectedPet = null;
      go('pick-pet');
      return;
    }
    if (act === 'select-pet') {
      selectedPet = t.getAttribute('data-pet');
      render();
      return;
    }
    if (act === 'confirm-pet') {
      if (!selectedPet) return;
      state.petId = selectedPet;
      go('nickname');
      return;
    }
    if (act === 'finish-onboarding' || act === 'finish-onboarding-skip') {
      if (act === 'finish-onboarding') {
        var input = $('#nick-input');
        nicknameDraft = input ? input.value : nicknameDraft;
      } else {
        nicknameDraft = '';
      }
      state.petName = String(nicknameDraft || '').trim().slice(0, 16);
      state.petId = state.petId || selectedPet;
      state.onboardingDone = true;
      state.growthStage = 0;
      state.growthPoints = 0;
      PQQuest.ensureTodayQuest(state);
      save();
      go('home');
      return;
    }
    if (act === 'start-quest') {
      PQQuest.ensureTodayQuest(state);
      state.daily.taskIndex = state.daily.taskIndex || 0;
      save();
      go('quest');
      return;
    }
    if (act === 'extra-practice') {
      state._practiceTask = null;
      feedback = null;
      keypadValue = '';
      go('practice');
      return;
    }
    if (act === 'open-settings') {
      go('settings');
      return;
    }
    if (act === 'go-home') {
      go('home');
      return;
    }
    if (act === 'reset-confirm') {
      if (
        window.confirm(
          'Reset all Pet Quests progress on this device? This cannot be undone.'
        )
      ) {
        state = store.clear();
        selectedPet = null;
        nicknameDraft = '';
        go('welcome');
      }
      return;
    }
    if (act === 'read-aloud') {
      var task = currentTask();
      if (task && task.text) PQAudio.speak(task.text, true);
      return;
    }
    if (act === 'reading-continue') {
      advanceTask();
      return;
    }
    if (act === 'choose-reading') {
      handleReadingChoice(parseInt(t.getAttribute('data-idx'), 10));
      return;
    }
    if (act === 'key') {
      var k = t.getAttribute('data-key');
      if (keypadValue.length < 4) keypadValue += k;
      render();
      return;
    }
    if (act === 'key-back') {
      keypadValue = keypadValue.slice(0, -1);
      render();
      return;
    }
    if (act === 'key-go') {
      submitMath();
      return;
    }
  }

  function currentTask() {
    if (screen === 'practice') return state._practiceTask;
    if (!state.daily || !state.daily.tasks) return null;
    return state.daily.tasks[state.daily.taskIndex];
  }

  function handleReadingChoice(idx) {
    var task = currentTask();
    if (!task || task.type !== 'reading-q') return;
    var result = PQReading.processReadingAttempt(task, idx);
    if (result.correct) {
      PQAudio.play('correct', state.soundOn);
      feedback = { kind: 'good', message: result.message };
      save();
      setTimeout(function () {
        advanceTask();
      }, 550);
      render();
      return;
    }
    PQAudio.play('hint', state.soundOn);
    feedback = { kind: 'gentle', message: result.message, hint: result.hint };
    if (result.reveal) readingRevealed = true;
    save();
    render();
  }

  function submitMath() {
    var task = currentTask();
    if (!task) return;
    if (keypadValue === '') {
      feedback = { kind: 'gentle', message: 'Type an answer, then tap Go.' };
      render();
      return;
    }
    var result = PQMath.processMathAttempt(task, keypadValue);

    if (result.correct) {
      // missCount is prior misses; 0 means first-try correct
      var wasFirstTry = (task.missCount || 0) === 0;
      if (wasFirstTry) {
        PQMath.recordResult(state, task, true);
      }
      // If they missed earlier, the incorrect attempt was already recorded on first miss.
      PQAudio.play('correct', state.soundOn);
      feedback = { kind: 'good', message: result.message };
      keypadValue = '';
      save();
      if (screen === 'practice') {
        setTimeout(function () {
          state._practiceTask = PQMath.makeMulTaskPreferWeakFacts(
            state.tableStats || {},
            state.factStats || {},
            Math.random,
            'practice'
          );
          feedback = null;
          render();
        }, 600);
        render();
        return;
      }
      setTimeout(function () {
        advanceTask();
      }, 550);
      render();
      return;
    }

    // Incorrect
    PQAudio.play('hint', state.soundOn);
    feedback = { kind: 'gentle', message: result.message, hint: result.hint };
    keypadValue = '';
    // Record a single incorrect attempt on the first miss only
    if (task.missCount === 1) {
      PQMath.recordResult(state, task, false);
    }
    save();
    render();
  }

  function advanceTask() {
    feedback = null;
    keypadValue = '';
    readingRevealed = false;
    PQAudio.stopSpeak();
    state.daily.taskIndex = (state.daily.taskIndex || 0) + 1;
    if (state.daily.taskIndex >= state.daily.tasks.length) {
      finishQuest();
      return;
    }
    save();
    render();
  }

  function finishQuest() {
    var weekBefore = PQStorage.weeklyProgress(state);
    PQStorage.markDailyComplete(state);
    var weekAfter = PQStorage.weeklyProgress(state);
    var weeklyJustMet = !weekBefore.met && weekAfter.met;
    PQQuest.applyGrowthForQuest(state, weeklyJustMet);
    save();
    PQAudio.play('celebrate', state.soundOn);
    go('celebrate');
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Fix double-record bug in submitMath — rewrite carefully via patch after load
  // Expose for debugging
  window.PetQuests = {
    boot: boot,
    getState: function () {
      return state;
    },
    render: render
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
