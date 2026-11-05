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
  var freshPlace = null;
  var partyNote = '';
  var partyStep = 0;
  var bookIndex = 0;
  var cardDeck = null;
  var cardNeedsContinue = false;
  var cardRewarded = false;
  var spinReels = ['star', 'leaf', 'heart'];

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
    else if (screen === 'locked') renderLocked(app);
    else if (screen === 'library') renderLibrary(app);
    else if (screen === 'quest') renderQuest(app);
    else if (screen === 'party') renderParty(app);
    else if (screen === 'party-cards') renderPartyCards(app);
    else if (screen === 'party-spin') renderPartySpin(app);
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
      '<li>A party with animal friends at the end</li>' +
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
      var open = PQWorld.isPlaceOpen(state, house.id);
      if (!open) {
        return (
          '<button type="button" class="house-card locked" data-act="open-locked" data-house="' +
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
          '<em class="house-flag">Not open yet</em>' +
          '</button>'
        );
      }
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
    var nextPlace = PQWorld.nextLockedPlace(state);
    var pathNote = nextPlace
      ? '<p class="kind-note">' + esc(PQWorld.placeHelp(nextPlace, PQWorld.placeProgress(state, nextPlace))) + '</p>'
      : '';
    var cta = done
      ? '<p class="kind-note">Today’s quest is done. The party is still open, and the neighborhood is too.</p>' +
        '<button type="button" class="btn primary lg" data-act="open-party">Visit the party</button>' +
        '<button type="button" class="btn secondary" data-act="extra-practice">Extra times tables</button>'
      : '<button type="button" class="btn primary lg" data-act="start-quest">Start today’s quest</button>';

    app.innerHTML =
      headerBar('Pet Quests') +
      '<main class="panel home">' +
      '<div class="garden-banner">' +
      PQWorld.renderSkylineSvg(state) +
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
      pathNote +
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
    var story = '';
    if (task.story && task.story.text) {
      story =
        '<p class="story-text">' + esc(task.story.text) + '</p>' +
        '<div class="story-art">' + PQMath.renderStorySvg(task.story) + '</div>' +
        '<button type="button" class="btn secondary" data-act="read-story">Read aloud</button>';
    }
    var tokens = state.world && state.world.hintTokens ? state.world.hintTokens : 0;
    var hintBtn = tokens > 0
      ? '<button type="button" class="btn secondary" data-act="use-hint">Use a gentle hint (' + tokens + ')</button>'
      : '';
    var eyebrow = task.story
      ? 'Story problem'
      : (task.mission === 'warmup' ? 'Warmup' : 'Times tables');
    return (
      '<section class="math-card">' +
      '<p class="eyebrow">' +
      eyebrow +
      '</p>' +
      story +
      '<div class="prompt' + (task.story ? ' story-prompt' : '') + '" aria-live="polite">' +
      esc(task.prompt) +
      ' = ?</div>' +
      '<div class="answer-display" aria-live="polite">' +
      (keypadValue || ' ') +
      '</div>' +
      hintBtn +
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
      (freshPlace
        ? '<p class="kind-note">' + esc(freshPlace.openLine) + '</p>'
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
      '<button type="button" class="btn primary lg" data-act="go-home">Back to the neighborhood</button>' +
      '<button type="button" class="btn secondary" data-act="open-party">Back to the party</button>' +
      '</main>';
  }

  function renderLocked(app) {
    var house = PQWorld.getHouse(houseId);
    var progress = PQWorld.placeProgress(state, house);
    var help = PQWorld.placeHelp(house, progress);
    app.innerHTML =
      headerBar(house.title, { back: true }) +
      '<main class="panel">' +
      '<div class="house-art lone">' + PQWorld.renderHouseFront(house.id) + '</div>' +
      '<h2>' + esc(house.title) + '</h2>' +
      '<p class="lede">' + esc(help) + '</p>' +
      '<p class="plain-note">Daily quests and the gift at each open place both count. Nothing here is a test.</p>' +
      '<p class="kind-note">Quests finished: ' + progress.quests + '. Place gifts found: ' + progress.activities + '.</p>' +
      '<button type="button" class="btn primary lg" data-act="back">Back to the neighborhood</button>' +
      '</main>';
  }

  function currentBook() {
    var books = PQReading.libraryBooks(state.courses && state.courses.grade, PQPets.displayName(state));
    if (!books.length) return null;
    if (bookIndex < 0) bookIndex = 0;
    bookIndex = bookIndex % books.length;
    return books[bookIndex];
  }

  function renderLibrary(app) {
    var book = currentBook();
    var speakBtn = PQAudio.canSpeak()
      ? '<button type="button" class="btn secondary" data-act="read-aloud">Read aloud</button>'
      : '';
    app.innerHTML =
      headerBar('Extra story', { back: true }) +
      '<main class="panel">' +
      '<p class="lede">These stories are extra. You can read one anytime. They are not part of today’s quest.</p>' +
      '<section class="reading-card">' +
      '<h2>' + esc(book ? book.title : 'Story') + '</h2>' +
      '<p class="passage">' + esc(book ? book.text : '') + '</p>' +
      '<div class="row-actions">' +
      speakBtn +
      '<button type="button" class="btn secondary" data-act="next-book">Another story</button>' +
      '<button type="button" class="btn primary lg" data-act="back">Back to the library</button>' +
      '</div>' +
      '</section>' +
      '</main>';
  }

  function renderParty(app) {
    var name = PQPets.displayName(state);
    var note = partyNote
      ? '<div class="feedback good" role="status"><p>' + esc(partyNote) + '</p></div>'
      : '';
    var prizeCount = (state.world && state.world.prizes) ? state.world.prizes.length : 0;
    app.innerHTML =
      headerBar('Party', { back: true }) +
      '<main class="panel party">' +
      '<div class="party-friends" aria-hidden="true">' +
      PQParty.renderFaceSvg('fox') +
      PQParty.renderFaceSvg('frog') +
      PQParty.renderFaceSvg('bird') +
      '</div>' +
      '<h2>Party time</h2>' +
      '<p class="lede">The school work is done. ' + esc(name) +
      ' is here with Fern the fox, Moss the frog, and Coco the bird. Play a game, or leave whenever you like.</p>' +
      (freshUnlock ? '<p class="kind-note">' + esc(freshUnlock.line) + '</p>' : '') +
      (freshPlace ? '<p class="kind-note">' + esc(freshPlace.openLine) + '</p>' : '') +
      '<button type="button" class="btn primary lg" data-act="open-cards">Play pet cards</button>' +
      '<button type="button" class="btn primary lg" data-act="open-spin">Spin for a prize</button>' +
      '<button type="button" class="btn secondary" data-act="party-dance">Dance</button>' +
      '<button type="button" class="btn secondary" data-act="party-hug">Hug a friend</button>' +
      '<p class="plain-note">Prizes saved on this device: ' + prizeCount + '.</p>' +
      note +
      '<button type="button" class="btn ghost" data-act="leave-party">Leave the party</button>' +
      '</main>';
  }

  function renderPartyCards(app) {
    var dateKey = PQStorage.localDateKey();
    var limited = PQParty.cardRoundsLeft(state, dateKey) <= 0 && !cardDeck;
    var board = '';
    if (cardDeck && cardDeck.length) {
      board = '<div class="card-grid">' + cardDeck.map(function (card, i) {
        var up = card.up || card.matched;
        return (
          '<button type="button" class="party-card' + (up ? ' up' : '') + '" data-act="flip-card" data-idx="' + i + '" aria-label="' +
          (up ? esc(PQParty.faceLabel(card.face)) : 'Face-down card') + '">' +
          (up ? PQParty.renderFaceSvg(card.face) : PQParty.renderCardBack()) +
          '</button>'
        );
      }).join('') + '</div>';
    }
    var continueBtn = cardNeedsContinue
      ? '<button type="button" class="btn secondary" data-act="cards-continue">Try another pair</button>'
      : '';
    app.innerHTML =
      headerBar('Pet cards', { back: true }) +
      '<main class="panel party">' +
      '<p class="lede">' + (limited
        ? 'The cards are resting. You can spin, dance, or head home.'
        : 'Turn two cards. Matching animal friends stay up.') + '</p>' +
      board +
      continueBtn +
      (partyNote ? '<div class="feedback good" role="status"><p>' + esc(partyNote) + '</p></div>' : '') +
      '<button type="button" class="btn ghost" data-act="back">Back to the party</button>' +
      '</main>';
  }

  function renderPartySpin(app) {
    var dateKey = PQStorage.localDateKey();
    var left = PQParty.spinsLeft(state, dateKey);
    var reels = (spinReels || ['star', 'leaf', 'heart']).map(function (icon) {
      return '<div class="reel">' + PQParty.renderIcon(icon) + '</div>';
    }).join('');
    var spinBtn = left > 0
      ? '<button type="button" class="btn primary lg" data-act="do-spin">Spin</button>'
      : '<p class="lede">The spinner is resting. You can still dance, hug a friend, or head home.</p>';
    app.innerHTML =
      headerBar('Prize spinner', { back: true }) +
      '<main class="panel party">' +
      '<p class="lede">Every spin shares a prize. Matching pictures bring a special decoration. Nothing is lost.</p>' +
      '<div class="reels" aria-hidden="true">' + reels + '</div>' +
      spinBtn +
      '<p class="plain-note">Spins left today: ' + left + '.</p>' +
      (partyNote ? '<div class="feedback good" role="status"><p>' + esc(partyNote) + '</p></div>' : '') +
      '<button type="button" class="btn ghost" data-act="back">Back to the party</button>' +
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
      if (screen === 'locked') {
        houseId = null;
        go('home');
        return;
      }
      if (screen === 'library') {
        go(houseId ? 'house' : 'home');
        return;
      }
      if (screen === 'party-cards' || screen === 'party-spin') {
        partyNote = '';
        cardNeedsContinue = false;
        go('party');
        return;
      }
      if (screen === 'party') {
        leaveParty();
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
      if (!PQWorld.isPlaceOpen(state, houseId)) {
        go('locked');
        return;
      }
      roleplayNote = '';
      go('house');
      return;
    }
    if (act === 'open-locked') {
      houseId = t.getAttribute('data-house') || 'garden';
      go('locked');
      return;
    }
    if (act === 'role-act') {
      var actionId = t.getAttribute('data-action');
      var chosen = findHouseAction(houseId, actionId);
      if (chosen && chosen.nav === 'library') {
        bookIndex = 0;
        PQAudio.stopSpeak();
        go('library');
        return;
      }
      var played = PQWorld.playAction(houseId, actionId, state, {
        petName: PQPets.displayName(state),
        step: roleplayStep,
        dateKey: PQStorage.localDateKey()
      });
      roleplayStep += 1;
      roleplayNote = played.message;
      if (played.opened && played.opened.length) {
        freshPlace = played.opened[0];
        neighborhoodNote = played.opened[0].openLine;
      }
      PQAudio.play(played.prize ? 'party' : 'correct', state.soundOn);
      save();
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
    if (act === 'open-party') {
      if (!todayDone()) return;
      PQParty.offerParty(state, PQStorage.localDateKey());
      partyNote = '';
      save();
      go('party');
      return;
    }
    if (act === 'leave-party') {
      leaveParty();
      return;
    }
    if (act === 'open-cards') {
      beginCards();
      return;
    }
    if (act === 'open-spin') {
      partyNote = '';
      go('party-spin');
      return;
    }
    if (act === 'party-dance') {
      partyBeat(true);
      return;
    }
    if (act === 'party-hug') {
      partyBeat(false);
      return;
    }
    if (act === 'flip-card') {
      flipPartyCard(parseInt(t.getAttribute('data-idx'), 10));
      return;
    }
    if (act === 'cards-continue') {
      if (cardDeck) PQParty.turnBack(cardDeck);
      cardNeedsContinue = false;
      partyNote = 'Pick two cards.';
      render();
      return;
    }
    if (act === 'do-spin') {
      doSpin();
      return;
    }
    if (act === 'next-book') {
      bookIndex += 1;
      PQAudio.stopSpeak();
      render();
      return;
    }
    if (act === 'read-story') {
      var storyTask = currentTask();
      if (storyTask && storyTask.story && storyTask.story.text) {
        PQAudio.speak(storyTask.story.text, true);
      }
      return;
    }
    if (act === 'use-hint') {
      useHintToken();
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
        freshPlace = null;
        neighborhoodNote = '';
        settingsNote = '';
        partyNote = '';
        cardDeck = null;
        bookIndex = 0;
        go('welcome');
      }
      return;
    }
    if (act === 'read-aloud') {
      if (screen === 'library') {
        var book = currentBook();
        if (book && book.text) PQAudio.speak(book.text, true);
        return;
      }
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

  function findHouseAction(id, actionId) {
    var house = PQWorld.getHouse(id);
    var list = (house && house.actions) || [];
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i].id === actionId) return list[i];
    }
    return null;
  }

  function leaveParty() {
    PQParty.skipParty(state, PQStorage.localDateKey());
    cardDeck = null;
    cardNeedsContinue = false;
    save();
    go('celebrate');
  }

  function beginCards() {
    var dateKey = PQStorage.localDateKey();
    cardNeedsContinue = false;
    cardRewarded = false;
    if (PQParty.cardRoundsLeft(state, dateKey) <= 0) {
      cardDeck = null;
      partyNote = 'The cards are resting. You can spin, dance, or head home.';
      go('party-cards');
      return;
    }
    cardDeck = PQParty.createCardDeck(Math.random);
    partyNote = 'Find the matching animal friends.';
    go('party-cards');
  }

  function flipPartyCard(index) {
    if (!cardDeck || !isFinite(index)) return;
    if (cardNeedsContinue) return;
    var result = PQParty.flipCard(cardDeck, index);
    cardDeck = result.cards;
    partyNote = result.message;
    cardNeedsContinue = !!result.needsContinue;
    if (result.cleared && !cardRewarded) {
      cardRewarded = true;
      var award = PQParty.finishCardRound(state, PQStorage.localDateKey());
      partyNote = award.message;
      save();
      PQAudio.play('party', state.soundOn);
    } else if (result.matched) {
      PQAudio.play('correct', state.soundOn);
    }
    render();
  }

  function doSpin() {
    var result = PQParty.spin(state, Math.random, PQStorage.localDateKey());
    if (result.reels) spinReels = result.reels;
    partyNote = result.message;
    if (result.prize) {
      save();
      PQAudio.play(result.rare ? 'party' : 'spin', state.soundOn);
    }
    render();
  }

  function partyBeat(dance) {
    var name = PQPets.displayName(state);
    var danceLines = [
      'You and ' + name + ' spin once with Fern the fox. Everyone is smiling.',
      'Coco the bird flaps along. The party stays gentle and bright.',
      name + ' takes a small bow. The friends cheer.'
    ];
    var hugLines = [
      'Moss the frog gives a gentle hug. ' + name + ' leans in.',
      'Fern the fox rests a paw near ' + name + '. It is a kind hello.',
      'You hug ' + name + '. The friends stay close and quiet.'
    ];
    var lines = dance ? danceLines : hugLines;
    partyNote = lines[partyStep % lines.length];
    partyStep += 1;
    PQAudio.play('party', state.soundOn);
    if (screen !== 'party') go('party');
    else render();
  }

  function useHintToken() {
    var task = currentTask();
    PQWorld.ensureWorld(state);
    if (!task || !(state.world.hintTokens > 0)) return;
    if (task.type !== 'mul' && task.type !== 'add' && task.type !== 'sub') return;
    state.world.hintTokens -= 1;
    feedback = { kind: 'gentle', message: 'Here is a gentle hint.', hint: PQMath.getHint(task, 1) };
    save();
    PQAudio.play('hint', state.soundOn);
    render();
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
    var openedPlaces = PQWorld.noteQuestFinished(state, PQStorage.localDateKey());
    freshPlace = openedPlaces && openedPlaces.length ? openedPlaces[0] : freshPlace;
    if (freshPlace) neighborhoodNote = freshPlace.openLine;
    PQParty.offerParty(state, PQStorage.localDateKey());
    questFocus = null;
    partyNote = '';
    cardDeck = null;
    cardRewarded = false;
    save();
    PQAudio.play('celebrate', state.soundOn);
    go('party');
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
