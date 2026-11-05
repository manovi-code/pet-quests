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
  var houseId = null;
  var roleplayNote = '';
  var roleplayStep = 0;
  var questFocus = null;
  var settingsNote = '';
  var neighborhoodNote = '';
  var freshUnlock = null;

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
    PQQuest.normalizeCourses(state);
    PQWorld.ensureWorld(state);
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
    else if (screen === 'house') renderHouse(app);
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
      '<li>A little neighborhood to explore</li>' +
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

  function todayPlanHtml() {
    var dk = PQStorage.localDateKey();
    var plan = null;
    if (state.daily && state.daily.dateKey === dk) {
      plan = state.daily.plan;
      if (!plan && state.daily.tasks && state.daily.tasks.length) {
        plan = PQQuest.planFromTasks(state.daily);
      }
    }
    if (!plan) return '';
    var described = PQQuest.describeToday(plan);
    if (!described.partsLine && !described.tablesLine) return '';
    var html = '<div class="today-plan-block">';
    if (described.partsLine) html += '<p>' + esc(described.partsLine) + '</p>';
    if (described.tablesLine) html += '<p class="today-tables">' + esc(described.tablesLine) + '</p>';
    html += '</div>';
    return html;
  }

  function readyCardHtml() {
    var info = PQQuest.gradeReadiness(state);
    if (!info.ready) return '';
    return (
      '<div class="ready-card">' +
      '<p>These problems are feeling friendly. Ready to try the next grade when you are.</p>' +
      '<button type="button" class="btn secondary" data-act="try-next-grade">Try Grade ' +
      info.next +
      '</button>' +
      '</div>'
    );
  }

  function missionStillOpen(mission) {
    if (!mission || !state.courses || !state.courses.parts[mission]) return false;
    if (todayDone()) return false;
    syncCleared(state.daily);
    return nextOpenIndex(mission) !== -1;
  }

  function renderHome(app) {
    PQQuest.ensureTodayQuest(state);
    PQWorld.ensureWorld(state);
    save();
    var name = PQPets.displayName(state);
    var stage = state.growthStage || 0;
    var week = PQStorage.weeklyProgress(state);
    var done = todayDone();
    var note = neighborhoodNote
      ? '<p class="kind-note">' + esc(neighborhoodNote) + '</p>'
      : '';
    var houses = PQWorld.HOUSES.map(function (house) {
      var title = PQWorld.houseTitle(house, name);
      var flag = missionStillOpen(house.mission)
        ? '<em class="house-flag">Quest here</em>'
        : '';
      return (
        '<button type="button" class="house-card" data-act="open-house" data-house="' +
        house.id +
        '">' +
        '<span class="house-art">' +
        PQWorld.renderHouseFront(house.id) +
        '</span>' +
        '<strong>' +
        esc(title) +
        '</strong>' +
        '<span>' +
        esc(house.blurb) +
        '</span>' +
        flag +
        '</button>'
      );
    }).join('');
    var cta = done
      ? '<p class="kind-note">Today’s quest is done. The neighborhood is still open, or you can try extra tables.</p>' +
        '<button type="button" class="btn primary lg" data-act="extra-practice">Extra times tables</button>'
      : '<button type="button" class="btn primary lg" data-act="start-quest">Start today’s quest</button>';

    app.innerHTML =
      headerBar('Pet Quests') +
      '<main class="panel home">' +
      '<div class="garden-banner">' +
      PQWorld.renderSkylineSvg() +
      '<div class="pet-on-banner">' +
      PQPets.renderPetSvg(state.petId, stage, { label: name }) +
      '</div>' +
      '</div>' +
      '<h2 class="pet-name">' +
      esc(name) +
      '</h2>' +
      '<p class="stage-label">' +
      esc(PQPets.STAGE_LABELS[stage] || '') +
      '</p>' +
      todayPlanHtml() +
      note +
      readyCardHtml() +
      cta +
      '<div class="house-grid" aria-label="Neighborhood">' +
      houses +
      '</div>' +
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
      '</div>' +
      '<div class="home-actions">' +
      '<button type="button" class="btn secondary" data-act="open-settings">Settings</button>' +
      '</div>' +
      '</main>';
  }

  function renderHouse(app) {
    PQQuest.ensureTodayQuest(state);
    PQWorld.ensureWorld(state);
    var house = PQWorld.getHouse(houseId);
    var name = PQPets.displayName(state);
    var title = PQWorld.houseTitle(house, name);
    var actions = PQWorld.actionsFor(house, state);
    var buttons = actions
      .map(function (action) {
        return (
          '<button type="button" class="btn secondary role-btn" data-act="role-act" data-action="' +
          action.id +
          '">' +
          esc(action.label) +
          '</button>'
        );
      })
      .join('');
    var questBtn = '';
    if (house.mission && state.courses.parts[house.mission] && !todayDone() && missionStillOpen(house.mission)) {
      questBtn =
        '<button type="button" class="btn primary lg" data-act="start-mission" data-mission="' +
        house.mission +
        '">' +
        esc(house.questLabel) +
        '</button>';
    } else if (house.mission && !state.courses.parts[house.mission]) {
      questBtn = '<p class="plain-note">This practice is off today. You can still look around.</p>';
    } else if (house.mission === 'multiply' && todayDone()) {
      questBtn =
        '<button type="button" class="btn secondary" data-act="extra-practice">Extra times tables</button>';
    }
    var petBit =
      house.id === 'pet'
        ? '<div class="pet-in-room">' +
          PQPets.renderPetSvg(state.petId, state.growthStage || 0, { label: name }) +
          '</div>'
        : '';
    var feedbackHtml = roleplayNote
      ? '<div class="feedback good" role="status"><p>' + esc(roleplayNote) + '</p></div>'
      : '';

    app.innerHTML =
      headerBar(title, { back: true }) +
      '<main class="panel house">' +
      '<div class="room-wrap">' +
      PQWorld.renderRoomSvg(house.id, state) +
      petBit +
      '</div>' +
      '<p class="lede">' +
      esc(house.blurb) +
      '</p>' +
      questBtn +
      '<div class="role-actions">' +
      buttons +
      '</div>' +
      feedbackHtml +
      '</main>';
  }

  function renderQuest(app) {
    PQQuest.ensureTodayQuest(state);
    if (todayDone()) {
      go('home');
      return;
    }
    var daily = state.daily;
    syncCleared(daily);
    if (allTasksCleared()) {
      finishQuest();
      return;
    }
    var idx = daily.taskIndex || 0;
    var task = daily.tasks[idx];
    if (!task || task.cleared) {
      var nextIdx = nextOpenIndex(questFocus);
      if (nextIdx === -1) nextIdx = nextOpenIndex(null);
      if (nextIdx === -1) {
        finishQuest();
        return;
      }
      daily.taskIndex = nextIdx;
      idx = nextIdx;
      task = daily.tasks[idx];
    }
    var total = daily.tasks.length;
    var doneCount = 0;
    var ti;
    for (ti = 0; ti < total; ti++) if (daily.tasks[ti].cleared) doneCount += 1;
    var mission = PQQuest.currentMissionLabel(task);
    var progressPct = Math.round((doneCount / total) * 100);

    var body = '';
    if (task.type === 'reading-pass') body = renderReadingPass(task);
    else if (task.type === 'reading-q') body = renderReadingQ(task);
    else body = renderMathTask(task);

    app.innerHTML =
      headerBar(mission || 'Quest', { back: true }) +
      '<main class="panel quest">' +
      '<div class="quest-progress">' +
      '<div class="quest-progress-top"><span>Quest progress</span><span>' +
      (doneCount + 1) +
      ' / ' +
      total +
      '</span></div>' +
      '<div class="week-bar thin" role="progressbar" aria-valuemin="0" aria-valuemax="' +
      total +
      '" aria-valuenow="' +
      doneCount +
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
      ' looks proud. The neighborhood grew a little too.</p>' +
      (freshUnlock
        ? '<p class="kind-note">' + esc(freshUnlock.line) + '</p>'
        : '') +
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
    if (!state._practiceTask || !practiceTaskAllowed(state._practiceTask)) {
      state._practiceTask = nextPracticeTask();
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
    PQQuest.normalizeCourses(state);
    var parts = state.courses.parts;
    var selected = {};
    state.courses.tables.forEach(function (n) { selected[n] = true; });
    var grade = state.courses.grade;
    var ready = PQQuest.gradeReadiness(state);

    function partButton(id, label) {
      var on = !!parts[id];
      return (
        '<button type="button" class="part-toggle" data-act="toggle-part" data-part="' +
        id +
        '" aria-pressed="' +
        (on ? 'true' : 'false') +
        '"><span>' +
        esc(label) +
        '</span><span class="part-state">' +
        (on ? 'On' : 'Off') +
        '</span></button>'
      );
    }

    var chips = '';
    var n;
    for (n = 1; n <= 12; n++) {
      var onTable = !!selected[n];
      chips +=
        '<button type="button" class="table-chip" data-act="toggle-table" data-table="' +
        n +
        '" aria-pressed="' +
        (onTable ? 'true' : 'false') +
        '"><span class="chip-name">' +
        n +
        's</span><span class="chip-state">' +
        (onTable ? 'On' : 'Off') +
        '</span></button>';
    }

    var grades = '';
    var g;
    for (g = 1; g <= 5; g++) {
      var onGrade = g === grade;
      grades +=
        '<button type="button" class="grade-btn" data-act="set-grade" data-grade="' +
        g +
        '" aria-pressed="' +
        (onGrade ? 'true' : 'false') +
        '">Grade ' +
        g +
        '</button>';
    }

    var note = settingsNote
      ? '<p class="settings-note" role="status">' + esc(settingsNote) + '</p>'
      : '';
    var readyBlock = ready.ready
      ? '<div class="ready-card"><p>Ready to try the next grade when you are.</p>' +
        '<button type="button" class="btn primary" data-act="try-next-grade">Try Grade ' +
        ready.next +
        '</button></div>'
      : '';

    app.innerHTML =
      headerBar('Settings', { back: true }) +
      '<main class="panel">' +
      '<label class="toggle-row">' +
      '<span>Sound</span>' +
      '<button type="button" class="btn secondary" data-act="toggle-sound">' +
      (state.soundOn ? 'On' : 'Off') +
      '</button>' +
      '</label>' +
      '<section class="course-settings">' +
      '<h2 class="section-title">Grade</h2>' +
      '<p class="plain-note">Choose the grade that feels right today. A smaller grade is always okay.</p>' +
      '<div class="grade-list">' +
      grades +
      '</div>' +
      readyBlock +
      '<h2 class="section-title">Daily quest parts</h2>' +
      '<p class="plain-note">Choose what is in the daily quest. At least one stays on.</p>' +
      partButton('warmup', 'Warmup math') +
      partButton('reading', 'A short pet story') +
      partButton('multiply', 'Times tables practice') +
      '<h2 class="section-title">Times tables</h2>' +
      '<p class="plain-note">Choose which tables to practice. At least one stays on. A lower grade uses the friendlier ones first.</p>' +
      '<div class="table-grid">' +
      chips +
      '</div>' +
      '<p class="plain-note">If today’s quest has not been started, these choices update it now. A quest already started stays the same until tomorrow.</p>' +
      note +
      '</section>' +
      '<div class="danger-zone">' +
      '<p class="lede">Parent options</p>' +
      '<button type="button" class="btn danger" data-act="reset-confirm">Reset all progress…</button>' +
      '<p class="fine-print">Clears pet, quests, and practice history saved on this device. Cannot be undone.</p>' +
      '</div>' +
      '</main>';
  }

  function rerenderSettings() {
    var y = window.scrollY || 0;
    render();
    if (screen === 'settings') window.scrollTo(0, y);
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
      if (screen === 'nickname') {
        go('pick-pet');
        return;
      }
      if (screen === 'pick-pet') {
        go('welcome');
        return;
      }
      if (screen === 'house') {
        roleplayNote = '';
        houseId = null;
        go('home');
        return;
      }
      if (screen === 'quest' && questFocus && houseId) {
        go('house');
        return;
      }
      if (screen === 'quest' || screen === 'practice' || screen === 'settings') {
        if (screen === 'practice') state._practiceTask = null;
        questFocus = null;
        go('home');
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
      questFocus = null;
      startQuestAt(null);
      return;
    }
    if (act === 'open-house') {
      houseId = t.getAttribute('data-house') || 'pet';
      roleplayNote = '';
      go('house');
      return;
    }
    if (act === 'role-act') {
      var actionId = t.getAttribute('data-action');
      var played = PQWorld.playAction(houseId, actionId, state, {
        petName: PQPets.displayName(state),
        step: roleplayStep
      });
      roleplayStep += 1;
      roleplayNote = played.message;
      PQAudio.play('correct', state.soundOn);
      render();
      return;
    }
    if (act === 'start-mission') {
      startQuestAt(t.getAttribute('data-mission'));
      return;
    }
    if (act === 'toggle-part') {
      togglePart(t.getAttribute('data-part'));
      return;
    }
    if (act === 'toggle-table') {
      toggleTable(parseInt(t.getAttribute('data-table'), 10));
      return;
    }
    if (act === 'set-grade') {
      setGrade(parseInt(t.getAttribute('data-grade'), 10));
      return;
    }
    if (act === 'try-next-grade') {
      tryNextGrade();
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
      settingsNote = '';
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
        houseId = null;
        roleplayNote = '';
        questFocus = null;
        freshUnlock = null;
        neighborhoodNote = '';
        settingsNote = '';
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
      noteDailyAnswer(task, true);
      PQAudio.play('correct', state.soundOn);
      feedback = { kind: 'good', message: result.message };
      save();
      setTimeout(function () {
        advanceTask();
      }, 550);
      render();
      return;
    }
    noteDailyAnswer(task, false);
    PQAudio.play('hint', state.soundOn);
    feedback = { kind: 'gentle', message: result.message, hint: result.hint };
    if (result.reveal) readingRevealed = true;
    save();
    render();
  }

  function noteDailyAnswer(task, ok) {
    if (screen === 'practice' || !state.daily || !task) return;
    if (!Array.isArray(state.daily.answers)) state.daily.answers = [];
    state.daily.answers.push({ id: task.id, ok: !!ok });
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
      noteDailyAnswer(task, true);
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
          state._practiceTask = nextPracticeTask();
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
    noteDailyAnswer(task, false);
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

  function nextPracticeTask() {
    return PQMath.makeMulTaskPreferWeakFacts(
      state.tableStats || {},
      state.factStats || {},
      Math.random,
      'practice',
      PQQuest.mulOptionsForToday(state)
    );
  }

  function practiceTaskAllowed(task) {
    if (!task || task.type !== 'mul') return false;
    var opts = PQQuest.mulOptionsForToday(state);
    if (opts.pool.indexOf(task.a) === -1) return false;
    var bounds = PQMath.factorBounds(task.a, opts);
    return task.b >= bounds.min && task.b <= bounds.max;
  }

  function syncCleared(daily) {
    if (!daily || !daily.tasks) return;
    var any = false;
    var i;
    for (i = 0; i < daily.tasks.length; i++) {
      if (daily.tasks[i] && daily.tasks[i].cleared) any = true;
    }
    var idx = daily.taskIndex || 0;
    if (!any && idx > 0) {
      for (i = 0; i < idx && i < daily.tasks.length; i++) daily.tasks[i].cleared = true;
    }
  }

  function nextOpenIndex(mission) {
    var tasks = (state.daily && state.daily.tasks) || [];
    var i;
    for (i = 0; i < tasks.length; i++) {
      if (!tasks[i] || tasks[i].cleared) continue;
      if (mission && tasks[i].mission !== mission) continue;
      return i;
    }
    return -1;
  }

  function allTasksCleared() {
    var tasks = (state.daily && state.daily.tasks) || [];
    if (!tasks.length) return false;
    var i;
    for (i = 0; i < tasks.length; i++) {
      if (!tasks[i].cleared) return false;
    }
    return true;
  }

  function startQuestAt(mission) {
    PQQuest.ensureTodayQuest(state);
    syncCleared(state.daily);
    questFocus = mission || null;
    var idx = nextOpenIndex(questFocus);
    if (idx === -1) idx = nextOpenIndex(null);
    if (idx === -1) {
      finishQuest();
      return;
    }
    state.daily.taskIndex = idx;
    save();
    go('quest');
  }

  function togglePart(part) {
    PQQuest.normalizeCourses(state);
    var parts = state.courses.parts;
    if (!parts || !Object.prototype.hasOwnProperty.call(parts, part)) return;
    if (parts[part]) {
      var still = (parts.warmup ? 1 : 0) + (parts.reading ? 1 : 0) + (parts.multiply ? 1 : 0);
      if (still <= 1) {
        settingsNote = 'Leave at least one part on.';
        rerenderSettings();
        return;
      }
    }
    parts[part] = !parts[part];
    settingsNote = '';
    PQQuest.ensureTodayQuest(state);
    save();
    rerenderSettings();
  }

  function toggleTable(table) {
    if (!(table >= 1 && table <= 12)) return;
    PQQuest.normalizeCourses(state);
    var tables = state.courses.tables.slice();
    var idx = tables.indexOf(table);
    if (idx === -1) {
      tables.push(table);
      tables.sort(function (a, b) { return a - b; });
    } else {
      if (tables.length <= 1) {
        settingsNote = 'Leave at least one times table on.';
        rerenderSettings();
        return;
      }
      tables.splice(idx, 1);
    }
    state.courses.tables = tables;
    settingsNote = '';
    PQQuest.ensureTodayQuest(state);
    save();
    rerenderSettings();
  }

  function setGrade(grade) {
    if (!(grade >= 1 && grade <= 5)) return;
    PQQuest.normalizeCourses(state);
    if (state.courses.grade === grade) {
      if (screen === 'settings') rerenderSettings();
      return;
    }
    state.courses.grade = grade;
    PQQuest.stampGradeProgress(state);
    settingsNote = '';
    neighborhoodNote = '';
    state._practiceTask = null;
    PQQuest.ensureTodayQuest(state);
    save();
    if (screen === 'settings') rerenderSettings();
    else render();
  }

  function tryNextGrade() {
    var ok = PQQuest.applyNextGrade(state);
    if (!ok) return;
    neighborhoodNote = 'Grade ' + state.courses.grade + ' is on.';
    settingsNote = 'Grade ' + state.courses.grade + ' is on.';
    state._practiceTask = null;
    PQQuest.ensureTodayQuest(state);
    save();
    PQAudio.play('celebrate', state.soundOn);
    if (screen === 'settings') rerenderSettings();
    else render();
  }

  function missionDoneCopy(mission) {
    if (mission === 'warmup') return 'Kitchen warmup is done. You can look around or visit another house.';
    if (mission === 'reading') return 'That story is finished. Nice reading.';
    if (mission === 'multiply') return 'Times tables in the schoolhouse are done for now.';
    return 'That part is done. The neighborhood is still here.';
  }

  function advanceTask() {
    feedback = null;
    keypadValue = '';
    readingRevealed = false;
    PQAudio.stopSpeak();
    var tasks = state.daily.tasks || [];
    var current = tasks[state.daily.taskIndex];
    if (current) current.cleared = true;
    var idx = nextOpenIndex(questFocus);
    if (idx === -1) {
      if (allTasksCleared()) {
        finishQuest();
        return;
      }
      var finishedMission = questFocus;
      questFocus = null;
      save();
      houseId = PQWorld.houseIdForMission(finishedMission) || houseId;
      roleplayNote = missionDoneCopy(finishedMission);
      go('house');
      return;
    }
    state.daily.taskIndex = idx;
    save();
    render();
  }

  function finishQuest() {
    var weekBefore = PQStorage.weeklyProgress(state);
    PQStorage.markDailyComplete(state);
    var weekAfter = PQStorage.weeklyProgress(state);
    var weeklyJustMet = !weekBefore.met && weekAfter.met;
    PQQuest.applyGrowthForQuest(state, weeklyJustMet);
    freshUnlock = PQWorld.grantNextUnlock(state);
    questFocus = null;
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
