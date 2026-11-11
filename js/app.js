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
  var learn = null;
  var solitaire = null;
  var solitaireNote = '';
  var gameRound = null;
  var shopItemId = null;
  var shopProblem = null;
  var shopCoins = [];
  var shopNote = '';
  var visitNote = '';
  var toast = null;
  var toastTimer = null;
  var toastSerial = 0;
  var wheelOpen = false;
  var wheelList = false;
  var wheelCat = null;
  var wheelPage = 0;
  var pickedId = null;
  var drag = null;
  var ignoreClick = false;
  var board = null;
  var boardEntry = '';
  var logFrom = 'home';
  var townPage = 0;
  var homePane = 'map';
  var settingsTab = 'rank';
  var readStep = 0;
  var storyStep = 0;
  var peeking = false;
  var bookStep = 0;
  var learnStep = 0;
  var actionPage = 0;
  var shelfPage = 0;
  var albumPage = 0;
  var logPage = 0;
  var notePage = 0;
  var townSwipe = null;
  var toastAfter = null;
  var petMood = 'calm';
  var solitaireHint = '';
  var leaveTimer = null;
  var notices = PQNotices.create({
    setTimeout: function (fn, ms) { return setTimeout(fn, ms); },
    clearTimeout: function (id) { clearTimeout(id); },
    onDismiss: function () {
      var after = toastAfter;
      toastAfter = null;
      toast = null;
      var el = document.querySelector('.toast-card');
      if (el && el.parentNode) el.parentNode.removeChild(el);
      if (after) after();
    }
  });

  function $(sel) {
    return document.querySelector(sel);
  }

  function save() {
    store.save(state);
  }

  function clearLeave() {
    if (leaveTimer) clearTimeout(leaveTimer);
    leaveTimer = null;
  }

  function armLeave(fn) {
    clearLeave();
    leaveTimer = setTimeout(function () {
      leaveTimer = null;
      fn();
    }, PQNotices.NOTICE_MS);
  }

  function go(name) {
    screen = name;
    feedback = null;
    keypadValue = '';
    readingRevealed = false;
    readStep = 0;
    storyStep = 0;
    peeking = false;
    learnStep = 0;
    notePage = 0;
    clearLeave();
    toastAfter = null;
    if (name !== 'house') {
      wheelOpen = false;
      pickedId = null;
      drag = null;
      actionPage = 0;
    }
    if (name !== 'board') boardEntry = '';
    if (name !== 'shop') shelfPage = 0;
    PQAudio.stopSpeak();
    render();
  }

  function queueToast(kind, message, hint, after) {
    var text = String(message || '').trim();
    var extra = String(hint || '').trim();
    if (!text && !extra) return;
    toastAfter = null;
    petMood = kind === 'gentle' ? 'cheer' : 'happy';
    toast = {
      kind: kind === 'gentle' ? 'gentle' : 'good',
      message: text,
      hint: extra && extra.length <= 90 ? extra : ''
    };
    PQWorld.pushLog(state, extra ? (text + ' ' + extra) : text);
    toastAfter = typeof after === 'function' ? after : null;
    notices.show();
  }

  function dismissToast() {
    PQAudio.stopSpeak();
    if (notices.isOpen()) notices.dismiss();
    else {
      toast = null;
      toastAfter = null;
      var el = document.querySelector('.toast-card');
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }
  }

  function toastHtml() {
    if (!toast) return '';
    var speak = PQAudio.canSpeak()
      ? '<button type="button" class="btn secondary" data-act="toast-speak">🔊 Read</button>'
      : '';
    return (
      '<div class="toast-card ' + (toast.kind === 'gentle' ? 'gentle' : 'good') + '" role="status" data-act="toast-close" aria-label="Notice. Tap to close.">' +
      '<p>' + esc(toast.message) + '</p>' +
      (toast.hint ? '<p class="hint">' + esc(toast.hint) + '</p>' : '') +
      (speak ? '<div class="toast-actions">' + speak + '</div>' : '') +
      '</div>'
    );
  }

  function chunkLimit() {
    var w = window.innerWidth || 390;
    return w >= 700 ? 460 : 220;
  }

  function chunkText(text, limit) {
    limit = limit || chunkLimit();
    var paras = String(text || '').split(/\n\n+/);
    var pages = [];
    var p;
    for (p = 0; p < paras.length; p++) {
      var words = paras[p].trim().split(/\s+/);
      if (!words[0]) continue;
      var buf = [];
      var size = 0;
      var i;
      for (i = 0; i < words.length; i++) {
        if (buf.length && size + words[i].length + 1 > limit) {
          pages.push(buf.join(' '));
          buf = [];
          size = 0;
        }
        buf.push(words[i]);
        size += words[i].length + 1;
      }
      if (buf.length) pages.push(buf.join(' '));
    }
    if (!pages.length) pages.push('');
    return pages;
  }

  function townPerPage() {
    var w = window.innerWidth || 390;
    var h = window.innerHeight || 800;
    if (w >= 700 && h >= 1000) return 12;
    if (w >= 700) return 8;
    return 6;
  }

  function pageCount(total, per) {
    return Math.max(1, Math.ceil(total / Math.max(1, per)));
  }

  function clampPage(page, pages) {
    if (page < 0) return 0;
    if (page >= pages) return pages - 1;
    return page;
  }

  function turnTown(delta, absolute) {
    var total = PQWorld.visiblePlaces(state).length;
    var pages = pageCount(total, townPerPage());
    if (pages <= 1) return;
    if (absolute) townPage = delta;
    else townPage += delta;
    if (townPage < 0) townPage = pages - 1;
    if (townPage >= pages) townPage = 0;
    render();
  }

  function pagerHtml(page, pages, act) {
    if (pages <= 1) return '';
    var dots = '';
    var i;
    for (i = 0; i < pages; i++) {
      dots += '<button type="button" class="dot' + (i === page ? ' on' : '') + '" data-act="' + act + '" data-page="' + i + '" aria-label="Page ' + (i + 1) + ' of ' + pages + '"></button>';
    }
    return (
      '<div class="pager">' +
      '<button type="button" class="btn pager-arrow" data-act="' + act + '" data-dir="-1" aria-label="Previous">◀</button>' +
      '<div class="dots" aria-hidden="true">' + dots + '</div>' +
      '<button type="button" class="btn pager-arrow" data-act="' + act + '" data-dir="1" aria-label="Next">▶</button>' +
      '</div>'
    );
  }

  function readPager(t, page, pages) {
    var raw = t.getAttribute('data-page');
    if (raw != null && raw !== '') return clampPage(parseInt(raw, 10) || 0, pages);
    var dir = parseInt(t.getAttribute('data-dir'), 10) || 0;
    var next = page + dir;
    if (next < 0) next = pages - 1;
    if (next >= pages) next = 0;
    return next;
  }

  function actionIcon(id) {
    var icons = {
      feed: '🥣', play: '🎾', tuck: '🛏️', window: '🪟', toy: '🧸', kettle: '🫖',
      table: '🪑', cushion: '📖', desk: '✏️', sunny: '☀️', surprise: '🎁',
      chair: '🪑', pictures: '🖼️', books: '📚', seat: '🪟', bell: '🔔',
      swing: '🛝', shelves: '🏪', blocks: '🧱', page: '📄', count: '🐟',
      brush: '🖌️', tap: '🥁', shells: '🐚', lantern: '🏮', bench: '🚉', flowers: '🌼'
    };
    return icons[id] || '✨';
  }

  function todayDone() {
    var dk = PQStorage.localDateKey();
    return state.daily && state.daily.dateKey === dk && state.daily.completed;
  }

  function boot() {
    state = store.load();
    PQQuest.normalizeCourses(state);
    PQWorld.ensureWorld(state);
    PQWorld.syncFromProgress(state);
    PQStorage.ensureWeek(state);
    if (!state.onboardingDone || !state.petId) {
      go('welcome');
      return;
    }
    PQQuest.ensureTodayQuest(state);
    var visit = PQDays.onVisit(state, PQStorage.localDateKey());
    visitNote = visit && visit.note ? visit.note : '';
    save();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
    go('home');
  }

  /* ---------- Render ---------- */

  function render() {
    var app = $('#app');
    if (!app) return;
    app.innerHTML = '';
    app.className = 'app screen-' + screen + (wheelOpen && screen === 'house' ? ' wheel-open' : '');

    if (screen === 'welcome') renderWelcome(app);
    else if (screen === 'pick-pet') renderPickPet(app);
    else if (screen === 'nickname') renderNickname(app);
    else if (screen === 'home') renderHome(app);
    else if (screen === 'house') renderHouse(app);
    else if (screen === 'library') renderLibrary(app);
    else if (screen === 'learn') renderLearn(app);
    else if (screen === 'solitaire') renderSolitaire(app);
    else if (screen === 'quest') renderQuest(app);
    else if (screen === 'party') renderParty(app);
    else if (screen === 'party-cards') renderPartyCards(app);
    else if (screen === 'party-spin') renderPartySpin(app);
    else if (screen === 'celebrate') renderCelebrate(app);
    else if (screen === 'practice') renderPractice(app);
    else if (screen === 'settings') renderSettings(app);
    else if (screen === 'bank') renderBank(app);
    else if (screen === 'shop') renderShop(app);
    else if (screen === 'game') renderGame(app);
    else if (screen === 'board') renderBoard(app);
    else if (screen === 'album') renderAlbum(app);
    else if (screen === 'log') renderLog(app);
    else renderWelcome(app);

    if (toast) app.insertAdjacentHTML('beforeend', toastHtml());
    if (wheelOpen && screen === 'house') app.insertAdjacentHTML('beforeend', wheelHtml());
    bindGlobal();
  }

  function headerPet(force) {
    if (!state.petId) return '';
    if (!force && !state.onboardingDone) return '';
    return (
      '<span class="header-pet" aria-hidden="true">' +
      PQPets.renderPetSvg(state.petId, state.growthStage || 0, {
        label: PQPets.displayName(state),
        mood: petMood
      }) +
      '</span>'
    );
  }

  function headerBar(title, opts) {
    opts = opts || {};
    var soundLabel = state.soundOn ? 'Sound on' : 'Sound off';
    var back = opts.back
      ? '<button type="button" class="icon-btn" data-act="back" aria-label="Back">←</button>'
      : '<span class="icon-btn spacer"></span>';
    var gear = opts.settings
      ? '<button type="button" class="icon-btn" data-act="open-settings" aria-label="Settings">⚙️</button>'
      : '';
    var pet = opts.pet === false ? '' : headerPet(!!opts.pet);
    return (
      '<header class="topbar">' +
      back +
      '<h1 class="top-title">' + esc(title) + '</h1>' +
      pet +
      gear +
      '<button type="button" class="icon-btn log-btn" data-act="open-log" aria-label="What happened">★</button>' +
      '<button type="button" class="icon-btn sound-btn" data-act="toggle-sound" aria-label="' +
      soundLabel + '" aria-pressed="' + (state.soundOn ? 'true' : 'false') + '">' +
      (state.soundOn ? '♪' : '🔇') +
      '</button></header>'
    );
  }

  function renderWelcome(app) {
    app.innerHTML =
      headerBar('Pet Quests', { pet: false }) +
      '<main class="panel welcome fit-col">' +
      '<div class="hero-mark" aria-hidden="true">🐾</div>' +
      '<h2>Pet Quests</h2>' +
      '<p class="lede">Short quests. A pet who grows with you. A town that starts at your house.</p>' +
      '<div class="welcome-pills">' +
      '<span>➕ Warmup</span><span>📖 Story</span><span>✖️ Tables</span>' +
      '</div>' +
      '<p class="lede">Progress stays on this phone.</p>' +
      '<button type="button" class="btn primary lg" data-act="start-onboarding">🐾 Meet your pet</button>' +
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
      '<p class="lede center">Pick a friend.</p>' +
      '<div class="pet-grid">' +
      cards +
      '</div>' +
      '<button type="button" class="btn primary lg" data-act="confirm-pet" ' +
      (selectedPet ? '' : 'disabled') +
      '>👉 This one</button>' +
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
      '<button type="button" class="btn primary lg" data-act="finish-onboarding">🏠 Come home</button>' +
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

  function readyCardHtml(primary) {
    var info = PQQuest.gradeReadiness(state);
    if (!info.ready || !info.next) return '';
    var label = PQStorage.rankLabel(info.next);
    return (
      '<div class="ready-card">' +
      '<p>These problems are feeling friendly. You can try the next rank when you want.</p>' +
      '<button type="button" class="btn ' + (primary ? 'primary' : 'secondary') + '" data-act="try-next-rank">Try ' +
      esc(label) +
      '</button>' +
      '</div>'
    );
  }

  function missionsHere(house) {
    var list = [];
    if (!house) return list;
    if (house.id === 'pet') {
      list.push({ id: 'warmup', label: 'Warmup at the kitchen table' });
      if (!PQWorld.isPlaceOpen(state, 'library')) list.push({ id: 'reading', label: 'Read on the cushion' });
      if (!PQWorld.isPlaceOpen(state, 'school')) list.push({ id: 'multiply', label: 'Times tables at the desk' });
    } else if (house.mission === 'reading') {
      list.push({ id: 'reading', label: house.questLabel || 'Read a pet story' });
    } else if (house.mission === 'multiply') {
      list.push({ id: 'multiply', label: house.questLabel || 'Times tables on the board' });
    }
    return list;
  }

  function passageBlocks(text) {
    return String(text || '').split(/\n\n+/).map(function (para) {
      return '<p class="passage">' + esc(para.trim()) + '</p>';
    }).join('');
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
    var places = PQWorld.visiblePlaces(state);
    var per = townPerPage();
    var pages = pageCount(places.length, per);
    townPage = clampPage(townPage, pages);
    var slice = places.slice(townPage * per, townPage * per + per);
    var houses = slice.map(function (house) {
      var title = PQWorld.houseTitle(house, name);
      var missions = missionsHere(house);
      var flag = '';
      var mi;
      for (mi = 0; mi < missions.length; mi++) {
        if (missionStillOpen(missions[mi].id)) flag = '<em class="house-flag">Quest</em>';
      }
      return (
        '<button type="button" class="house-card" data-act="open-house" data-house="' + house.id + '">' +
        '<span class="house-art">' + PQWorld.renderHouseFront(house.id) + '</span>' +
        '<strong>' + esc(title) + '</strong>' +
        '<span>' + esc(house.blurb) + '</span>' +
        flag +
        '</button>'
      );
    }).join('');
    var cta = done
      ? '<button type="button" class="btn primary" data-act="open-party">🎉 Party</button>'
      : '<button type="button" class="btn primary" data-act="start-quest">▶ Start quest</button>';
    var todayKey = PQStorage.localDateKey();
    var days = PQDays.onVisit(state, todayKey);
    var stickers = PQDays.calendar(state, week.weekKey).stickers;
    var pane = '';
    if (homePane === 'today') pane = todayPaneHtml(name, days, week, done);
    else if (homePane === 'week') pane = weekPaneHtml(week);
    else {
      pane =
        '<div class="town-map" aria-label="Town">' + houses + '</div>' +
        pagerHtml(townPage, pages, 'town-page');
    }
    app.innerHTML =
      headerBar('Pet Quests', { settings: true, pet: false }) +
      '<main class="panel home fit-col">' +
      '<div class="chip-row">' +
      '<button type="button" class="chip" data-act="open-bank">🪙 ' + PQBank.getCoins(state) + '</button>' +
      '<button type="button" class="chip' + (homePane === 'week' ? ' on' : '') + '" data-act="home-pane" data-pane="week">★ ' + stickers + '</button>' +
      '<button type="button" class="chip' + (homePane === 'today' ? ' on' : '') + '" data-act="home-pane" data-pane="today">✨ Today</button>' +
      '<button type="button" class="chip' + (homePane === 'map' ? ' on' : '') + '" data-act="home-pane" data-pane="map">🗺️ Town</button>' +
      '</div>' +
      '<div class="pet-strip">' +
      '<div class="pet-face">' +
      PQPets.renderPetSvg(state.petId, stage, { label: name, mood: days.giftPending ? 'happy' : petMood }) +
      '</div>' +
      '<div class="pet-strip-copy"><h2>' + esc(name) + '</h2><p>' +
      esc(PQPets.STAGE_LABELS[stage] || '') + '</p></div>' +
      cta +
      '</div>' +
      pane +
      '</main>';
  }

  function todayPaneHtml(name, days, week, done) {
    var bits = [];
    if (visitNote) bits.push(visitNote);
    if (neighborhoodNote) bits.push(neighborhoodNote);
    var described = '';
    var planBlock = todayPlanHtml();
    var pages = chunkText(bits.join(' '), 180);
    notePage = clampPage(notePage, pages.length);
    var note = pages[0]
      ? '<p class="note-page">' + esc(pages[notePage] || pages[0]) + '</p>' +
        pagerHtml(notePage, pages.length, 'note-page')
      : '';
    var buttons = '';
    if (days.giftPending) buttons += '<button type="button" class="btn secondary" data-act="open-gift">🎁 Gift</button>';
    buttons += '<button type="button" class="btn secondary" data-act="greet-pet">👋 Hello</button>';
    if (week.met) buttons += '<button type="button" class="btn secondary" data-act="claim-week">🌟 Week gift</button>';
    if (PQWorld.isPlaceOpen(state, 'store')) buttons += '<button type="button" class="btn secondary" data-act="open-shop">🏪 Shop</button>';
    buttons += '<button type="button" class="btn secondary" data-act="open-album">📒 Stickers</button>';
    if (done) buttons += '<button type="button" class="btn secondary" data-act="extra-practice">✖️ Extra tables</button>';
    var hint = PQWorld.nextLockedPlace(state)
      ? '<p class="week-hint">' + esc(done ? 'A visit can still surprise you.' : PQWorld.townHint(state)) + '</p>'
      : '';
    return (
      '<div class="pane">' +
      note +
      planBlock +
      hint +
      readyCardHtml() +
      '<div class="action-grid">' + buttons + '</div>' +
      '</div>'
    );
  }

  function weekPaneHtml(week) {
    return (
      '<div class="pane">' +
      calendarHtml() +
      '<div class="week-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + week.goal +
      '" aria-valuenow="' + week.completed + '"><i style="width:' +
      Math.min(100, (week.completed / week.goal) * 100) + '%"></i></div>' +
      '<p class="week-hint">' + week.completed + ' of ' + week.goal + ' quests. A quiet day is okay.</p>' +
      (week.met ? '<button type="button" class="btn primary" data-act="claim-week">🌟 Week gift</button>' : '') +
      '</div>'
    );
  }

  function calendarHtml() {
    var week = PQStorage.weeklyProgress(state);
    var cal = PQDays.calendar(state, week.weekKey);
    var cells = cal.days.map(function (day) {
      return (
        '<div class="cal-day' + (day.sticker ? ' has-sticker' : '') + '">' +
        '<span>' + esc(day.name) + '</span>' +
        '<strong aria-label="' + (day.sticker ? 'sticker' : 'quiet') + '">' +
        (day.sticker ? '★' : '·') +
        '</strong></div>'
      );
    }).join('');
    return (
      '<div class="calendar" aria-label="Sticker calendar">' +
      '<p class="calendar-title">Stickers this week: ' + cal.stickers + '</p>' +
      '<div class="calendar-row">' + cells + '</div>' +
      '<p class="week-hint">' + esc(cal.note) + '</p>' +
      '</div>'
    );
  }

  function renderHouse(app) {
    PQQuest.ensureTodayQuest(state);
    PQWorld.ensureWorld(state);
    var house = PQWorld.getHouse(houseId);
    var name = PQPets.displayName(state);
    var title = PQWorld.houseTitle(house, name);
    var actions = PQWorld.actionsFor(house, state);
    var dock = [];
    var sawOff = false;
    missionsHere(house).forEach(function (mission) {
      if (!state.courses.parts[mission.id]) {
        sawOff = true;
        return;
      }
      if (todayDone() && mission.id === 'multiply') {
        dock.push('<button type="button" class="dock-btn" data-act="extra-practice">✖️ Extra tables</button>');
        return;
      }
      if (todayDone() || !missionStillOpen(mission.id)) return;
      var missionIcon = mission.id === 'reading' ? '📖' : (mission.id === 'multiply' ? '✖️' : '🥣');
      var missionWord = mission.id === 'reading' ? 'Story' : (mission.id === 'multiply' ? 'Tables' : 'Warmup');
      dock.push(
        '<button type="button" class="dock-btn" data-act="start-mission" data-mission="' +
        mission.id + '">' + missionIcon + ' ' + missionWord + '</button>'
      );
    });
    var activity = PQLearn.forPlace(state, house.id);
    var placeGame = PQGames.forPlace(state, house.id);
    if (house.id === 'parlor' && PQSolitaire.canPlay(state)) {
      dock.push('<button type="button" class="dock-btn" data-act="open-solitaire">🃏 Solitaire</button>');
    }
    if (placeGame) {
      dock.push('<button type="button" class="dock-btn" data-act="open-game">🎮 ' + esc(placeGame.button || placeGame.title) + '</button>');
    }
    if (activity) {
      dock.push('<button type="button" class="dock-btn" data-act="open-activity">🔬 ' + esc(activity.button || activity.title) + '</button>');
    }
    if (house.id === 'store') {
      dock.push('<button type="button" class="dock-btn" data-act="open-shop">🏪 Shop</button>');
    }
    PQBoards.forPlace(state, house.id).forEach(function (meta) {
      dock.push('<button type="button" class="dock-btn" data-act="open-board" data-game="' +
        meta.id + '">🎲 ' + esc(meta.button) + '</button>');
    });
    actions.forEach(function (action) {
      dock.push(
        '<button type="button" class="dock-btn" data-act="role-act" data-action="' + action.id + '">' +
        actionIcon(action.id) + ' ' + esc(shortActionLabel(action.label)) + '</button>'
      );
    });
    var petBit =
      house.id === 'pet' || house.id === 'friend'
        ? '<div class="pet-in-room">' +
          PQPets.renderPetSvg(state.petId, state.growthStage || 0, { label: name, mood: petMood }) +
          '</div>'
        : '';
    var thingsBtn = PQWorld.wheelGroups(state).length
      ? '<button type="button" class="wheel-fab" data-act="toggle-wheel" aria-label="Things you can place" aria-expanded="' +
        (wheelOpen ? 'true' : 'false') + '">🧺 Things</button>'
      : '';
    var per = (window.innerWidth || 390) >= 700 ? 6 : 4;
    var pages = pageCount(dock.length, per);
    actionPage = clampPage(actionPage, pages);
    var roleSlice = dock.slice(actionPage * per, actionPage * per + per).join('');
    var offNote = sawOff ? '<p class="week-hint">Some practice is off today. You can still look around.</p>' : '';

    app.innerHTML =
      headerBar(title, { back: true }) +
      '<main class="panel house fit-col">' +
      '<div class="room-stage" data-place="' + esc(house.id) + '">' +
      PQWorld.renderRoomSvg(house.id, state, { bare: true }) +
      placedItemsHtml(house.id) +
      petBit +
      '<button type="button" class="put-away" data-act="put-away">📦 Put away</button>' +
      thingsBtn +
      '</div>' +
      (pickedId ? '<p class="place-hint">Tap a spot, or drag it onto Put away.</p>' : '') +
      (wheelOpen ? '' : (
        '<div class="dock">' +
        offNote +
        '<div class="dock-grid">' + roleSlice + '</div>' +
        pagerHtml(actionPage, pages, 'action-page') +
        '</div>'
      )) +
      '</main>';
  }

  function shortActionLabel(label) {
    var text = String(label || '');
    text = text.replace(/^Sit (at|on|in) the /i, '').replace(/^Sit in the /i, '');
    text = text.replace(/^Look out the /i, '').replace(/^Look for a /i, '');
    text = text.replace(/^Check the /i, '');
    if (text.length > 22) text = text.slice(0, 21) + '…';
    return text;
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

    var gentle = feedback && feedback.kind !== 'good' ? hintStripHtml() : '';
    app.innerHTML =
      headerBar(mission || 'Quest', { back: true }) +
      '<main class="panel quest fit-col">' +
      '<div class="quest-top">' +
      '<div class="pet-face quest-pet">' +
      (state.petId ? PQPets.renderPetSvg(state.petId, state.growthStage || 0, { label: PQPets.displayName(state), mood: petMood }) : '') +
      '</div>' +
      '<div class="quest-progress">' +
      '<div class="quest-progress-top"><span>Quest</span><span>' +
      (doneCount + 1) + ' / ' + total +
      '</span></div>' +
      '<div class="week-bar thin" role="progressbar" aria-valuemin="0" aria-valuemax="' +
      total + '" aria-valuenow="' + doneCount + '"><i style="width:' +
      progressPct + '%"></i></div></div></div>' +
      gentle +
      body +
      '</main>';
  }

  function hintStripHtml() {
    if (!feedback) return '';
    var text = feedback.message || '';
    if (feedback.fact) text += (text ? ' ' : '') + feedback.fact;
    if (feedback.coins) text += ' +' + feedback.coins + (feedback.coins === 1 ? ' coin' : ' coins');
    return (
      '<div class="hint-strip ' + (feedback.kind === 'good' ? 'good' : 'gentle') + '" role="status">' +
      '<p>' + esc(text) + '</p>' +
      (feedback.hint ? '<p class="hint">' + esc(feedback.hint) + '</p>' : '') +
      '</div>'
    );
  }

  function feedbackHtml(task) {
    if (!feedback) return '';
    var good = feedback.kind === 'good';
    var fact = '';
    if (good && feedback.fact) {
      fact = '<p class="fact-line">' + esc(feedback.fact) + '</p>';
    }
    var coins = good && feedback.coins
      ? '<p class="coin-gain">+' + feedback.coins + (feedback.coins === 1 ? ' coin' : ' coins') + '</p>'
      : '';
    var pet = '';
    if (state.petId) {
      pet = '<div class="react-pet">' +
        PQPets.renderPetSvg(state.petId, state.growthStage || 0, {
          label: PQPets.displayName(state),
          mood: good ? 'happy' : 'cheer'
        }) +
        '</div>';
    }
    return (
      '<div class="feedback ' + (good ? 'good' : 'gentle') + ' big-feedback" role="status">' +
      '<div class="feedback-row">' +
      '<span class="mark ' + (good ? 'mark-yes' : 'mark-yet') + '" aria-hidden="true">' +
      (good ? '✓' : '…') +
      '</span>' +
      '<div>' +
      '<p class="mark-word">' + (good ? 'Yes' : 'Not yet') + '</p>' +
      '<p>' + esc(feedback.message) + '</p>' +
      fact +
      coins +
      (feedback.hint ? '<p class="hint">' + esc(feedback.hint) + '</p>' : '') +
      '</div></div>' +
      pet +
      '</div>'
    );
  }

  function passagePages(task) {
    var pages = [];
    if (task.words && task.words.length) {
      pages.push(task.words.map(function (word) {
        return word.word + '. ' + word.say;
      }).join(' '));
    }
    chunkText(task.text).forEach(function (page) { pages.push(page); });
    return pages.length ? pages : [''];
  }

  function renderReadingPass(task) {
    var pages = passagePages(task);
    readStep = clampPage(readStep, pages.length);
    var last = readStep >= pages.length - 1;
    var speakBtn = PQAudio.canSpeak()
      ? '<button type="button" class="btn secondary" data-act="read-aloud">🔊 Read</button>'
      : '';
    var next = last
      ? '<button type="button" class="btn primary" data-act="reading-continue">✅ I read it</button>'
      : '<button type="button" class="btn primary" data-act="read-next">➡️ Next</button>';
    return (
      '<section class="reading-card">' +
      '<p class="eyebrow">Story</p>' +
      '<h2>' + esc(task.title) + '</h2>' +
      '<p class="passage">' + esc(pages[readStep]) + '</p>' +
      pagerHtml(readStep, pages.length, 'read-step') +
      '<div class="action-grid">' + speakBtn + next + '</div>' +
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
    if (peeking) {
      var pages = chunkText(task.text);
      readStep = clampPage(readStep, pages.length);
      return (
        '<section class="reading-card">' +
        '<p class="eyebrow">Story</p>' +
        '<p class="passage">' + esc(pages[readStep] || '') + '</p>' +
        pagerHtml(readStep, pages.length, 'read-step') +
        '<button type="button" class="btn primary" data-act="peek-back">❓ Back to the question</button>' +
        '</section>'
      );
    }
    return (
      '<section class="reading-card">' +
      '<button type="button" class="btn secondary" data-act="peek-story">📖 Story</button>' +
      '<h2 class="question">' + esc(task.question) + '</h2>' +
      '<div class="choices">' + choices + '</div>' +
      '</section>'
    );
  }

  function renderMathTask(task) {
    var tokens = state.world && state.world.hintTokens ? state.world.hintTokens : 0;
    var hintBtn = tokens > 0
      ? '<button type="button" class="btn secondary" data-act="use-hint">💡 Hint (' + tokens + ')</button>'
      : '';
    if (task.story && task.story.text && storyStep < 1) {
      var speak = PQAudio.canSpeak()
        ? '<button type="button" class="btn secondary" data-act="read-story">🔊 Read</button>'
        : '';
      return (
        '<section class="math-card">' +
        '<p class="eyebrow">Story problem</p>' +
        '<div class="story-art">' + PQMath.renderStorySvg(task.story) + '</div>' +
        '<p class="story-text">' + esc(task.story.text) + '</p>' +
        '<div class="action-grid">' + speak +
        '<button type="button" class="btn primary" data-act="story-next">➡️ Next</button></div>' +
        '</section>'
      );
    }
    var eyebrow = task.story
      ? 'Story problem'
      : (task.type === 'add' ? 'Addition' : (task.type === 'sub' ? 'Subtraction' : 'Times tables'));
    return (
      '<section class="math-card">' +
      '<p class="eyebrow">' + eyebrow + '</p>' +
      '<div class="prompt" aria-live="polite">' + esc(task.prompt) + ' = ?</div>' +
      '<div class="answer-display" aria-live="polite">' + (keypadValue || ' ') + '</div>' +
      hintBtn +
      renderKeypad() +
      '</section>'
    );
  }

  function renderKeypad() {
    var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Del', '0', 'Go'];
    return (
      '<div class="keypad" role="group" aria-label="Number keypad">' +
      keys
        .map(function (k) {
          var cls = 'key';
          var act = 'key';
          if (k === 'Del') {
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
      headerBar('Nice work') +
      '<main class="panel celebrate fit-col">' +
      '<div class="pet-preview big">' +
      PQPets.renderPetSvg(state.petId, stage, { label: name, mood: 'happy' }) +
      '</div>' +
      '<h2>Nice work</h2>' +
      '<p class="lede">' + esc(name) + ' looks proud.</p>' +
      '<div class="week-bar"><i style="width:' +
      Math.min(100, (week.completed / week.goal) * 100) + '%"></i></div>' +
      '<p class="week-hint">' + week.completed + ' of ' + week.goal + ' quests this week.</p>' +
      '<button type="button" class="btn primary" data-act="go-home">🗺️ Town</button>' +
      '<button type="button" class="btn secondary" data-act="open-party">🎉 Party</button>' +
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
    var pages = chunkText(book ? book.text : '');
    bookStep = clampPage(bookStep, pages.length);
    var last = bookStep >= pages.length - 1;
    var speakBtn = PQAudio.canSpeak()
      ? '<button type="button" class="btn secondary" data-act="read-aloud">🔊 Read</button>'
      : '';
    var next = last
      ? '<button type="button" class="btn primary" data-act="next-book">📚 Another story</button>'
      : '<button type="button" class="btn primary" data-act="book-next">➡️ Next</button>';
    app.innerHTML =
      headerBar('Library', { back: true }) +
      '<main class="panel fit-col">' +
      '<p class="week-hint">Extra story. Not part of today’s quest.</p>' +
      '<section class="reading-card">' +
      '<h2>' + esc(book ? book.title : 'Story') + '</h2>' +
      '<p class="passage">' + esc(pages[bookStep] || '') + '</p>' +
      pagerHtml(bookStep, pages.length, 'book-step') +
      '<div class="action-grid">' + speakBtn + next + '</div>' +
      '</section></main>';
  }

  function renderParty(app) {
    var name = PQPets.displayName(state);
    var prizeCount = (state.world && state.world.prizes) ? state.world.prizes.length : 0;
    app.innerHTML =
      headerBar('Party', { back: true }) +
      '<main class="panel party fit-col">' +
      '<div class="party-friends" aria-hidden="true">' +
      PQParty.renderFaceSvg('fox') +
      PQParty.renderFaceSvg('frog') +
      PQParty.renderFaceSvg('bird') +
      '</div>' +
      '<h2>Party</h2>' +
      '<p class="lede">' + esc(name) + ' is here with Fern, Moss, and Coco.</p>' +
      '<div class="action-grid">' +
      '<button type="button" class="btn primary" data-act="open-cards">🃏 Cards</button>' +
      '<button type="button" class="btn primary" data-act="open-spin">🎰 Spin</button>' +
      '<button type="button" class="btn secondary" data-act="party-dance">💃 Dance</button>' +
      '<button type="button" class="btn secondary" data-act="party-hug">🤗 Hug</button>' +
      '</div>' +
      '<p class="week-hint">Prizes saved here: ' + prizeCount + '.</p>' +
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
    app.innerHTML =
      headerBar('Pet cards', { back: true }) +
      '<main class="panel party fit-col">' +
      '<p class="lede">' + (limited
        ? 'The cards are resting. Spin, dance, or head home.'
        : 'Turn two cards. Matches stay up.') + '</p>' +
      board +
      '</main>';
  }

  function renderPartySpin(app) {
    var dateKey = PQStorage.localDateKey();
    var left = PQParty.spinsLeft(state, dateKey);
    var reels = (spinReels || ['star', 'leaf', 'heart']).map(function (icon) {
      return '<div class="reel">' + PQParty.renderIcon(icon) + '</div>';
    }).join('');
    var spinBtn = left > 0
      ? '<button type="button" class="btn primary" data-act="do-spin">🎰 Spin</button>'
      : '<p class="lede">The spinner is resting. Dance or head home.</p>';
    app.innerHTML =
      headerBar('Spinner', { back: true }) +
      '<main class="panel party fit-col">' +
      '<p class="lede">Every spin shares a prize. Nothing is lost.</p>' +
      '<div class="reels" aria-hidden="true">' + reels + '</div>' +
      spinBtn +
      '<p class="week-hint">Spins left today: ' + left + '.</p>' +
      '</main>';
  }

  function renderPractice(app) {
    // Lightweight extra practice: one mul at a time, not counting as daily
    if (!state._practiceTask || !practiceTaskAllowed(state._practiceTask)) {
      state._practiceTask = nextPracticeTask();
    }
    var task = state._practiceTask;
    var gentle = feedback && feedback.kind !== 'good' ? hintStripHtml() : '';
    app.innerHTML =
      headerBar('Extra tables', { back: true }) +
      '<main class="panel quest fit-col">' +
      gentle +
      '<p class="week-hint">Just for fun. Today’s quest stays the same.</p>' +
      renderMathTask(task) +
      '</main>';
  }

  function learnFeedback() {
    if (!learn || !learn.hint) return '';
    return '<div class="hint-strip gentle" role="status"><p>' + esc(learn.note || 'Not yet.') + '</p>' +
      '<p class="hint">' + esc(learn.hint) + '</p></div>';
  }

  function plantSvg(grown) {
    var height = grown ? 46 : 24;
    var top = 62 - height;
    return '<svg class="plant-svg" viewBox="0 0 120 80" aria-hidden="true">' +
      '<rect x="46" y="62" width="28" height="14" rx="3" fill="#a35f38"/>' +
      '<rect x="58" y="' + top + '" width="4" height="' + height + '" fill="#5f7a52"/>' +
      '<circle cx="60" cy="' + top + '" r="' + (grown ? 16 : 10) + '" fill="#7a9a68"/>' +
      '<circle cx="' + (grown ? 44 : 50) + '" cy="' + (top + 8) + '" r="' + (grown ? 10 : 6) + '" fill="#8fa87a"/>' +
      '</svg>';
  }

  function choiceButtons(choices, act) {
    return (choices || []).map(function (choice, i) {
      return '<button type="button" class="choice-btn" data-act="' + act + '" data-idx="' + i + '">' + esc(choice) + '</button>';
    }).join('');
  }

  function renderPlay(play, progress) {
    if (!play) return '<p class="lede">All done here.</p>';
    if (play.kind === 'experiment') {
      var step = progress.step || 0;
      if (step <= 0) {
        return '<p class="lede">' + esc(play.observe) + '</p>' + plantSvg(false) +
          '<button type="button" class="btn primary" data-act="learn-continue">👀 I looked</button>';
      }
      if (step === 1) {
        return '<h2 class="question">' + esc(play.predict.q) + '</h2><div class="choices">' +
          choiceButtons(play.predict.choices, 'learn-choice') + '</div>';
      }
      if (step === 2) {
        return matchColumns(play.pairs, progress, 'Friend', 'Home');
      }
      return '<h2 class="question">' + esc(play.water.q) + '</h2>' + plantSvg(!!progress.grown) +
        '<div class="choices">' + choiceButtons(play.water.choices, 'learn-choice') + '</div>';
    }
    if (play.kind === 'match' || play.kind === 'clues') {
      return '<p class="lede">' + esc(play.prompt) + '</p>' + matchColumns(play.pairs, progress, 'Clue', 'Match');
    }
    if (play.kind === 'body') {
      return '<p class="lede">' + esc(play.prompt) + '</p><div class="choices">' +
        play.parts.map(function (part) {
          var done = progress.matched && progress.matched[part.id] ? ' reveal-correct' : '';
          return '<button type="button" class="choice-btn' + done + '" data-act="learn-part" data-id="' + part.id + '">' + esc(part.label) + '</button>';
        }).join('') + '</div>';
    }
    if (play.kind === 'build') {
      var current = play.steps[progress.step] || play.steps[play.steps.length - 1];
      var made = (progress.picks || []).length
        ? '<p class="kind-note">So far: ' + esc(progress.picks.join(', ')) + '</p>'
        : '';
      return made + '<h2 class="question">' + esc(current.prompt) + '</h2><div class="choices">' +
        choiceButtons(current.choices, 'learn-choice') + '</div>';
    }
    if (play.kind === 'pattern') {
      var order = play.colors.map(function (color) { return color.label; }).join(', then ');
      return '<p class="lede">' + esc(play.prompt) + '</p><p class="kind-note">' + esc(order) + '</p><div class="choices">' +
        play.colors.map(function (color) {
          return '<button type="button" class="choice-btn" data-act="learn-color" data-id="' + color.id + '">' + esc(color.label) + '</button>';
        }).join('') + '</div>';
    }
    return '<p class="lede">You can look around as long as you like.</p>';
  }

  function matchColumns(pairs, progress, leftName, rightName) {
    var left = pairs.map(function (pair) {
      if (progress.matched && progress.matched[pair.id]) return '';
      var on = learn && learn.pick === pair.id ? ' reveal-correct' : '';
      return '<button type="button" class="choice-btn' + on + '" data-act="learn-left" data-id="' + pair.id + '">' + esc(pair.left) + '</button>';
    }).join('');
    var right = [];
    var seen = {};
    pairs.forEach(function (pair) {
      if (seen[pair.right]) return;
      seen[pair.right] = true;
      right.push('<button type="button" class="choice-btn" data-act="learn-right" data-id="' + esc(pair.right) + '">' + esc(pair.right) + '</button>');
    });
    return '<div class="match-grid"><div class="match-col"><p class="eyebrow">' + esc(leftName) + '</p>' + left +
      '</div><div class="match-col"><p class="eyebrow">' + esc(rightName) + '</p>' + right.join('') + '</div></div>';
  }

  function renderLearn(app) {
    if (!learn || !learn.activity) {
      go(houseId ? 'house' : 'home');
      return;
    }
    var activity = learn.activity;
    var progress = learn.progress;
    var house = PQWorld.getHouse(activity.id);
    var body = '';
    if (progress.phase === 'read') {
      var pages = chunkText(activity.reading || '');
      learnStep = clampPage(learnStep, pages.length);
      var last = learnStep >= pages.length - 1;
      var speak = PQAudio.canSpeak()
        ? '<button type="button" class="btn secondary" data-act="read-aloud">🔊 Read</button>'
        : '';
      var next = last
        ? '<button type="button" class="btn primary" data-act="learn-continue">✅ I read it</button>'
        : '<button type="button" class="btn primary" data-act="learn-next">➡️ Next</button>';
      body = '<p class="passage">' + esc(pages[learnStep] || '') + '</p>' +
        pagerHtml(learnStep, pages.length, 'learn-step') +
        '<div class="action-grid">' + speak + next + '</div>';
    } else if (progress.phase === 'ask') {
      var q = activity.questions[progress.qIndex];
      body = q
        ? '<h2 class="question">' + esc(q.q) + '</h2><div class="choices">' + choiceButtons(q.choices, 'learn-choice') + '</div>'
        : '<p class="lede">All done here.</p>';
    } else if (progress.phase === 'play') {
      body = renderPlay(activity.play, progress);
    } else {
      body = (progress.grown ? plantSvg(true) : '') + '<p class="lede">All done here. The town is right outside.</p>';
    }
    app.innerHTML =
      headerBar(house ? house.title : activity.title, { back: true }) +
      '<main class="panel fit-col">' +
      '<h2>' + esc(activity.title) + '</h2>' +
      learnFeedback() +
      body +
      '</main>';
  }

  function solSuit(suit) {
    if (suit === 'hearts') return '♥';
    if (suit === 'diamonds') return '♦';
    if (suit === 'clubs') return '♣';
    return '♠';
  }

  function solCard(card, act, extra) {
    extra = extra || '';
    if (!card) {
      return '<button type="button" class="sol-card empty" data-act="' + act + '" ' + extra + ' aria-label="Empty spot"></button>';
    }
    if (!card.up) return '<div class="sol-card down" aria-hidden="true"></div>';
    var red = PQSolitaire.colorOf(card.suit) === 'red' ? ' red' : '';
    return '<button type="button" class="sol-card' + red + '" data-act="' + act + '" ' + extra +
      ' aria-label="' + esc(PQSolitaire.cardName(card)) + '"><span>' +
      esc(PQSolitaire.rankLabel(card.rank) + solSuit(card.suit)) + '</span></button>';
  }

  function renderSolitaire(app) {
    var board = '';
    if (solitaire) {
      var foundations = solitaire.foundations.map(function (pile, i) {
        var card = pile.length ? pile[pile.length - 1] : null;
        return solCard(card, 'sol-foundation', 'data-index="' + i + '"');
      }).join('');
      var waste = solitaire.waste.length ? solitaire.waste[solitaire.waste.length - 1] : null;
      var columns = solitaire.tableau.map(function (col, ci) {
        var cards = col.map(function (card, idx) {
          return solCard(card, 'sol-tab', 'data-col="' + ci + '" data-index="' + idx + '"');
        }).join('');
        if (!cards) {
          cards = '<button type="button" class="sol-card empty" data-act="sol-col" data-col="' + ci + '" aria-label="Empty column"></button>';
        }
        return '<div class="sol-col">' + cards + '</div>';
      }).join('');
      board =
        '<div class="sol-top"><div class="sol-foundations" aria-label="Piles">' + foundations + '</div>' +
        '<div class="sol-draw">' + solCard(waste, 'sol-waste', '') +
        '<button type="button" class="btn secondary" data-act="sol-draw">' +
        (solitaire.stock.length ? 'Draw' : 'Turn pile') + '</button>' +
        '<button type="button" class="btn secondary" data-act="sol-hint">💡 Hint</button></div></div>' +
        '<div class="sol-table">' + columns + '</div>';
    }
    app.innerHTML =
      headerBar('Game hall', { back: true }) +
      '<main class="panel fit-col">' +
      (solitaireHint ? '<div class="hint-strip gentle" role="status"><p>' + esc(solitaireHint) + '</p></div>' : '') +
      '<p class="week-hint">Build each pile from ace up.</p>' +
      board +
      '</main>';
  }

  function renderSettings(app) {
    PQQuest.normalizeCourses(state);
    var parts = state.courses.parts;
    var selected = {};
    state.courses.tables.forEach(function (n) { selected[n] = true; });
    var rankId = state.courses.rank || PQStorage.rankFromGrade(state.courses.grade);
    var focus = state.courses.lessonFocus || {};

    function focusButton(id, label) {
      var on = !!focus[id];
      return (
        '<button type="button" class="part-toggle" data-act="toggle-focus" data-focus="' +
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

    var ranks = '';
    PQStorage.RANKS.forEach(function (rank) {
      var onRank = rank.id === rankId;
      ranks +=
        '<button type="button" class="rank-btn" data-act="set-rank" data-rank="' +
        rank.id +
        '" aria-pressed="' +
        (onRank ? 'true' : 'false') +
        '">' +
        esc(rank.label) +
        '</button>';
    });

    var note = settingsNote
      ? '<p class="settings-note" role="status">' + esc(settingsNote) + '</p>'
      : '';
    var tab = settingsTab || 'rank';
    var body = '';
    if (tab === 'lessons') {
      body =
        '<p class="plain-note">What to practice. Still one short quest.</p>' +
        focusButton('addition', '➕ Addition') +
        focusButton('subtraction', '➖ Subtraction') +
        focusButton('multiplication', '✖️ Tables') +
        focusButton('reading', '📖 Reading') +
        partButton('warmup', 'Warmup') +
        partButton('reading', 'Story') +
        partButton('multiply', 'Times tables') +
        note;
    } else if (tab === 'tables') {
      body =
        '<p class="plain-note">Which tables to use. At least one stays on.</p>' +
        '<div class="table-grid">' + chips + '</div>' +
        '<p class="week-hint">A quest already started stays until tomorrow.</p>' +
        note;
    } else if (tab === 'grownups') {
      body =
        '<p class="plain-note">Sound</p>' +
        '<button type="button" class="btn secondary" data-act="toggle-sound">' +
        (state.soundOn ? '♪ Sound on' : '🔇 Sound off') + '</button>' +
        '<button type="button" class="btn danger" data-act="reset-confirm">Reset all progress</button>' +
        '<p class="fine-print">Clears the pet, quests, and history on this device.</p>';
    } else {
      body =
        '<p class="plain-note">Scout is the gentlest. Champion is the fullest. It changes only when you pick it.</p>' +
        '<div class="rank-list">' + ranks + '</div>' +
        readyCardHtml(true) +
        note;
    }
    function tabBtn(id, label) {
      return '<button type="button" class="btn ' + (tab === id ? 'primary' : 'secondary') +
        '" data-act="settings-tab" data-tab="' + id + '">' + label + '</button>';
    }
    app.innerHTML =
      headerBar('Settings', { back: true }) +
      '<main class="panel settings fit-col">' +
      '<div class="tabs">' +
      tabBtn('rank', 'Rank') +
      tabBtn('lessons', 'Lessons') +
      tabBtn('tables', 'Tables') +
      tabBtn('grownups', 'Grown-ups') +
      '</div>' +
      '<div class="tab-body">' + body + '</div>' +
      '</main>';
  }

  function rerenderSettings() {
    var y = window.scrollY || 0;
    render();
    if (screen === 'settings') window.scrollTo(0, y);
  }

  function renderBank(app) {
    var coins = PQBank.getCoins(state);
    var shop = PQWorld.isPlaceOpen(state, 'store')
      ? '<button type="button" class="btn primary lg" data-act="open-shop">Visit the general store</button>'
      : '<p class="plain-note">The general store appears after a quest. Your coins wait safely until then.</p>';
    app.innerHTML =
      headerBar('Bank', { back: true }) +
      '<main class="panel bank fit-col">' +
      PQBank.piggySvg() +
      '<h2>' + coins + ' coins</h2>' +
      '<p class="lede">Coins are gifts for playing. A mistake never takes them away.</p>' +
      calendarHtml() +
      shop +
      '<button type="button" class="btn secondary" data-act="open-album">📒 Stickers</button>' +
      '</main>';
  }

  function renderShop(app) {
    if (!PQWorld.isPlaceOpen(state, 'store')) {
      go('home');
      return;
    }
    var grade = state.courses && state.courses.grade;
    var coins = PQBank.getCoins(state);
    if (!shopItemId) {
      var items = PQShop.catalog(state);
      var per = (window.innerWidth || 390) >= 700 ? 8 : 6;
      var pages = pageCount(items.length || 1, per);
      shelfPage = clampPage(shelfPage, pages);
      var slice = items.slice(shelfPage * per, shelfPage * per + per);
      var shelf = slice.length
        ? slice.map(function (item) {
          return '<button type="button" class="btn secondary shop-item" data-act="shop-item" data-item="' +
            item.id + '">' + esc(String(item.name).replace(/^an?\s+/i, '')) + ' · ' + item.price + '</button>';
        }).join('')
        : '<p class="lede">The shelves are resting. You already brought these things home.</p>';
      var gentleShop = shopNote ? '<div class="hint-strip gentle" role="status"><p>' + esc(shopNote) + '</p></div>' : '';
      app.innerHTML =
        headerBar('Shop', { back: true }) +
        '<main class="panel shop fit-col">' +
        gentleShop +
        '<p class="lede">🪙 ' + coins + ' coins. Pick something, then make the price.</p>' +
        '<div class="shelf-grid">' + shelf + '</div>' +
        pagerHtml(shelfPage, items.length ? pages : 1, 'shelf-page') +
        '</main>';
      return;
    }
    var item = PQShop.itemById(shopItemId);
    if (!item || !shopProblem) {
      shopItemId = null;
      renderShop(app);
      return;
    }
    var body = '';
    if (shopProblem.mode === 'coins') {
      var picked = PQShop.sumCoins(shopCoins);
      var coinBtns = shopProblem.coins.map(function (n) {
        return '<button type="button" class="coin-btn" data-act="shop-coin" data-coin="' + n + '">' +
          PQShop.coinSvg(n) + '<span>' + n + ' coin</span></button>';
      }).join('');
      var pickedRow = shopCoins.length
        ? shopCoins.map(function (n, i) {
          return '<button type="button" class="coin-mini" data-act="shop-uncoint" data-idx="' + i + '" aria-label="Take back ' + n + '">' +
            n + '</button>';
        }).join('')
        : '<span class="plain-note">No coins picked yet.</span>';
      body =
        '<p class="prompt">' + esc(shopProblem.prompt) + '</p>' +
        '<div class="coin-row">' + coinBtns + '</div>' +
        '<p class="lede">Picked: ' + picked + '</p>' +
        '<div class="coin-picked">' + pickedRow + '</div>' +
        '<button type="button" class="btn primary" data-act="shop-pay">🪙 Use these coins</button>';
    } else {
      var answer = shopProblem.answer;
      var options = [answer, answer + 1, Math.max(0, answer - 1), answer + 2];
      var s = 0;
      var oi;
      for (oi = options.length - 1; oi > 0; oi--) {
        s = (s + 3 + oi) % (oi + 1);
        var swap = options[oi];
        options[oi] = options[s];
        options[s] = swap;
      }
      var seen = {};
      var buttons = '';
      options.forEach(function (n) {
        if (seen[n]) return;
        seen[n] = true;
        buttons += '<button type="button" class="choice-btn" data-act="shop-value" data-value="' + n + '">' + n + '</button>';
      });
      body =
        '<p class="question">' + esc(shopProblem.prompt) + '</p>' +
        '<div class="choices">' + buttons + '</div>';
    }
    app.innerHTML =
      headerBar('Pay', { back: true }) +
      '<main class="panel shop fit-col">' +
      (shopNote ? '<div class="hint-strip gentle" role="status"><p>' + esc(shopNote) + '</p></div>' : '') +
      '<p class="eyebrow">' + esc(item.name) + ' · ' + item.price + ' coins</p>' +
      '<p class="lede">Bank: ' + coins + '</p>' +
      body +
      '<button type="button" class="btn secondary" data-act="shop-back">⬅️ Shelves</button>' +
      '</main>';
  }

  function renderGame(app) {
    if (!gameRound) {
      go(houseId ? 'house' : 'home');
      return;
    }
    var step = PQGames.currentStep(gameRound);
    if (!step) {
      app.innerHTML =
        headerBar(gameRound.title, { back: true }) +
        '<main class="panel fit-col">' +
        '<div class="pet-face">' +
        PQPets.renderPetSvg(state.petId, state.growthStage || 0, { label: PQPets.displayName(state), mood: 'happy' }) +
        '</div>' +
        '<h2>You finished</h2>' +
        '<p class="lede">' + gameRound.reward + ' coins go in the bank.</p>' +
        '</main>';
      return;
    }
    var choices = step.choices.map(function (choice, i) {
      return '<button type="button" class="choice-btn" data-act="game-choice" data-idx="' + i + '">' +
        esc(choice.label) + '</button>';
    }).join('');
    app.innerHTML =
      headerBar(gameRound.title, { back: true }) +
      '<main class="panel game fit-col">' +
      (shopNote ? '<div class="hint-strip gentle" role="status"><p>' + esc(shopNote) + '</p></div>' : '') +
      (step.detail ? '<div class="recipe-card"><p>' + esc(step.detail) + '</p></div>' : '') +
      '<h2 class="question">' + esc(step.prompt) + '</h2>' +
      '<div class="choices">' + choices + '</div>' +
      '</main>';
  }

  function renderAlbum(app) {
    var book = PQDays.collection(state);
    var list = book.stickers.length ? book.stickers : [{ name: 'Your book is ready for the first sticker.' }];
    var per = 5;
    var pages = pageCount(list.length, per);
    albumPage = clampPage(albumPage, pages);
    var stickers = list.slice(albumPage * per, albumPage * per + per).map(function (sticker) {
      return '<li>' + esc(sticker.name) + '</li>';
    }).join('');
    app.innerHTML =
      headerBar('Stickers', { back: true }) +
      '<main class="panel fit-col">' +
      '<p class="lede">' + book.decor + (book.decor === 1 ? ' decoration' : ' decorations') + ' to place.</p>' +
      '<ul class="soft-list">' + stickers + '</ul>' +
      pagerHtml(albumPage, pages, 'album-page') +
      '</main>';
  }

  /* ---------- Actions ---------- */

  function placedItemsHtml(placeId) {
    var list = PQWorld.placementsFor(state, placeId);
    return list.map(function (entry) {
      var item = PQWorld.itemById(entry.itemId);
      if (!item) return '';
      var picked = pickedId === item.id ? ' is-picked' : '';
      return '<button type="button" class="placed-item' + picked + '" data-item="' + item.id +
        '" style="left:' + entry.x + '%;top:' + entry.y + '%" aria-label="' + esc(item.name) + '">' +
        PQWorld.renderItemIcon(item) + '</button>';
    }).join('');
  }

  function shortItemName(name) {
    return String(name || '').replace(/^an?\s+/i, '');
  }

  function wheelHtml() {
    var groups = PQWorld.wheelGroups(state);
    if (!groups.length) return '';
    if (wheelList) {
      var flat = [];
      groups.forEach(function (group) {
        group.items.forEach(function (item) { flat.push(item); });
      });
      var perList = 6;
      var listPages = pageCount(flat.length, perList);
      wheelPage = clampPage(wheelPage, listPages);
      var listSlice = flat.slice(wheelPage * perList, wheelPage * perList + perList);
      var blocks = listSlice.map(function (item) {
        return '<button type="button" class="btn secondary wheel-item" data-act="wheel-pick" data-item="' +
          item.id + '">' + PQWorld.renderItemIcon(item) + '<span>' + esc(shortItemName(item.name)) + '</span></button>';
      }).join('');
      return '<div class="wheel-pop" role="dialog" aria-label="My items">' +
        '<div class="wheel-top"><strong>My items</strong>' +
        '<button type="button" class="btn secondary" data-act="wheel-mode">🎡 Wheel</button>' +
        '<button type="button" class="btn ghost" data-act="wheel-close">Close</button></div>' +
        '<div class="wheel-list">' + blocks + '</div>' +
        pagerHtml(wheelPage, listPages, 'wheel-page') +
        '</div>';
    }
    var source = null;
    var i;
    if (wheelCat) {
      for (i = 0; i < groups.length; i++) if (groups[i].id === wheelCat) source = groups[i];
    }
    var entries = source ? source.items : groups;
    var pageSize = 6;
    var pages = Math.max(1, Math.ceil(entries.length / pageSize));
    if (wheelPage >= pages) wheelPage = 0;
    var slice = entries.slice(wheelPage * pageSize, wheelPage * pageSize + pageSize);
    var spots = slice.map(function (entry, index) {
      var angle = (-90 + (360 / slice.length) * index) * Math.PI / 180;
      var left = 50 + Math.cos(angle) * 34;
      var top = 48 + Math.sin(angle) * 34;
      if (source) {
        return '<button type="button" class="wheel-spot" style="left:' + left + '%;top:' + top + '%" data-act="wheel-pick" data-item="' +
          entry.id + '">' + PQWorld.renderItemIcon(entry) + '<span>' + esc(shortItemName(entry.name)) + '</span></button>';
      }
      return '<button type="button" class="wheel-spot" style="left:' + left + '%;top:' + top + '%" data-act="wheel-cat" data-cat="' +
        entry.id + '"><strong>' + esc(entry.label) + '</strong><em>' + entry.count + '</em></button>';
    }).join('');
    var center = source
      ? '<button type="button" class="wheel-center" data-act="wheel-back">Back</button>'
      : '<button type="button" class="wheel-center" data-act="wheel-close">Close</button>';
    var title = source ? source.label + ' · ' + source.count : 'Your things';
    return '<div class="wheel-pop" role="dialog" aria-label="Things you can place">' +
      '<div class="wheel-top"><strong>' + esc(title) + '</strong>' +
      '<button type="button" class="btn secondary" data-act="wheel-mode">📋 Items</button></div>' +
      '<div class="wheel-ring">' + spots + center + '</div>' +
      pagerHtml(wheelPage, pages, 'wheel-page') +
      '</div>';
  }

  function renderLog(app) {
    PQWorld.ensureWorld(state);
    var entries = (state.world.log || []).slice();
    if (!entries.length) entries = [{ text: 'Nothing new yet. Play a little and notes will show up here.' }];
    var per = 4;
    var pages = pageCount(entries.length, per);
    logPage = clampPage(logPage, pages);
    var rows = entries.slice(logPage * per, logPage * per + per).map(function (entry) {
      return '<li>' + esc(entry.text) + '</li>';
    }).join('');
    app.innerHTML =
      headerBar('What happened', { back: true }) +
      '<main class="panel fit-col">' +
      '<ul class="soft-list log-list">' + rows + '</ul>' +
      pagerHtml(logPage, pages, 'log-page') +
      '</main>';
  }

  function boardKeypad() {
    var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Del', '0', 'Go'];
    return '<div class="keypad" role="group" aria-label="Number keypad">' +
      keys.map(function (k) {
        var cls = 'key';
        var act = 'board-key';
        if (k === 'Del') cls += ' key-back';
        else if (k === 'Go') { cls += ' key-go'; act = 'board-go'; }
        return '<button type="button" class="' + cls + '" data-act="' + act + '" data-key="' + k + '">' + k + '</button>';
      }).join('') + '</div>';
  }

  function boardPromptHtml() {
    if (!board || !board.prompt || board.finished || board.done || board.armed) return '';
    if (board.prompt.type === 'read') {
      var choices = (board.prompt.choices || []).map(function (choice, i) {
        return '<button type="button" class="choice-btn" data-act="board-choice" data-idx="' + i + '">' + esc(choice) + '</button>';
      }).join('');
      return '<h2 class="question">' + esc(board.prompt.prompt) + '</h2><div class="choices">' + choices + '</div>';
    }
    return '<div class="prompt" aria-live="polite">' + esc(board.prompt.prompt) + ' = ?</div>' +
      '<div class="answer-display" aria-live="polite">' + (boardEntry || ' ') + '</div>' +
      boardKeypad();
  }

  function renderFour() {
    var cols = '';
    var c;
    var r;
    for (c = 0; c < 7; c++) {
      var cells = '';
      for (r = 0; r < 6; r++) {
        var owner = board.board[r][c];
        var cls = owner === 1 ? ' p1' : (owner === 2 ? ' p2' : '');
        cells += '<span class="four-cell' + cls + '"></span>';
      }
      cols += '<button type="button" class="four-col" data-act="four-drop" data-col="' + c + '" aria-label="Column ' + (c + 1) + '">' + cells + '</button>';
    }
    var ready = board.armed ? '<p class="place-hint">Tap a column to drop your disc.</p>' : '';
    return '<div class="four-board" aria-label="Four in a Row">' + cols + '</div>' + ready + boardPromptHtml();
  }

  function renderRace() {
    var spaces = '';
    var i;
    for (i = 0; i <= board.home; i++) {
      var who = '';
      if (board.pawns.kid === i) who += '<b class="pawn kid">You</b>';
      if (board.pawns.pet === i) who += '<b class="pawn pet">Pet</b>';
      var label = i === board.home ? 'Home' : (i === 0 ? 'Start' : String(i));
      spaces += '<div class="race-space' + (i === board.home ? ' is-home' : '') + '"><span>' + label + '</span>' + who + '</div>';
    }
    var den = '';
    if (board.pawns.kid == null) den += '<b class="pawn kid">You</b>';
    if (board.pawns.pet == null) den += '<b class="pawn pet">Pet</b>';
    return '<div class="race-den">Den ' + (den || '<span class="plain-note">empty</span>') + '</div>' +
      '<div class="race-track">' + spaces + '</div>' +
      boardPromptHtml();
  }

  function renderBingo() {
    var cells = board.cells.map(function (cell, index) {
      var cls = cell.free ? ' free' : (cell.marked ? ' marked' : '');
      var label = cell.free ? 'Free' : String(cell.answer);
      return '<button type="button" class="bingo-cell' + cls + '" data-act="bingo-tap" data-idx="' + index + '">' + esc(label) + '</button>';
    }).join('');
    var ask = board.prompt ? '<h2 class="question">' + esc(board.prompt.prompt) + '</h2>' : '';
    return ask + '<div class="bingo-grid">' + cells + '</div>';
  }

  function renderMemory() {
    var cards = board.cards.map(function (card, index) {
      var up = card.up || card.matched;
      return '<button type="button" class="memory-card' + (up ? ' up' : '') + (card.matched ? ' matched' : '') +
        '" data-act="memory-flip" data-idx="' + index + '">' + (up ? esc(card.text) : '?') + '</button>';
    }).join('');
    return '<p class="week-hint">Match each word with its meaning.</p><div class="memory-grid">' + cards + '</div>';
  }

  function renderArray() {
    var rows = '';
    var targetRows = board.rows;
    var r;
    for (r = 0; r < targetRows; r++) {
      var count = board.built[r] || 0;
      var dots = '';
      var d;
      for (d = 0; d < board.cols; d++) {
        dots += '<i class="' + (d < count ? 'on' : '') + '"></i>';
      }
      rows += '<div class="array-row">' + dots + '</div>';
    }
    return '<h2 class="question">' + esc(board.prompt.prompt) + '</h2>' +
      '<div class="array-build" aria-hidden="true">' + rows + '</div>' +
      '<div class="array-actions">' +
      '<button type="button" class="btn primary" data-act="array-act" data-array="dot">➕ Add a dot</button>' +
      '<button type="button" class="btn secondary" data-act="array-act" data-array="row">➡️ Next row</button>' +
      '<button type="button" class="btn secondary" data-act="array-act" data-array="back">⬅️ Take one back</button>' +
      '<button type="button" class="btn secondary" data-act="array-act" data-array="check">✅ This is it</button>' +
      '</div>';
  }

  function renderBoard(app) {
    if (!board) {
      go(houseId ? 'house' : 'home');
      return;
    }
    var body = '';
    if (board.id === 'four') body = renderFour();
    else if (board.id === 'race') body = renderRace();
    else if (board.id === 'bingo') body = renderBingo();
    else if (board.id === 'memory') body = renderMemory();
    else if (board.id === 'array') body = renderArray();
    var done = board.finished || board.done;
    app.innerHTML =
      headerBar(board.title, { back: true }) +
      '<main class="panel game fit-col">' +
      (board.hint ? '<div class="hint-strip gentle" role="status"><p>' + esc(board.hint) + '</p></div>' : '') +
      body +
      (done ? '<button type="button" class="btn primary" data-act="board-again">🔁 Play again</button>' : '') +
      '</main>';
  }

  function settleBoard(result) {
    if (!board || !result) return;
    if (result.needsContinue && board.id === 'memory') {
      board.hint = result.hint || '';
      queueToast('gentle', result.message || 'Not a pair yet.', '', function () {
        if (board && board.needsContinue) {
          PQBoards.memoryContinue(board);
          board.hint = '';
          render();
        }
      });
      PQAudio.play('gentle', state.soundOn);
      save();
      render();
      return;
    }
    var quiet = result.ok && !result.done && (
      board.id === 'array' ||
      board.id === 'bingo' ||
      (board.id === 'memory' && !result.matched)
    );
    if (result.ok) board.hint = '';
    else board.hint = result.hint || result.message || '';
    if (!result.ok) {
      queueToast('gentle', result.message || 'Not yet.', '');
      PQAudio.play('gentle', state.soundOn);
    } else if (result.done && !board.rewarded) {
      var kidWon = result.winner !== 2 && result.winner !== 'draw';
      var prize = PQBoards.reward(kidWon);
      PQBank.addCoins(state, prize.coins);
      var extra = '';
      if (prize.mayDecor && Math.random() < 0.45) {
        var item = PQWorld.grantDecor(state, Math.random);
        if (item) extra = ' You found ' + item.name + ' to place.';
      }
      board.rewarded = true;
      board.banner = (result.message || 'Nice work.') + ' ' + prize.message + extra;
      queueToast('good', board.banner, '');
      PQAudio.play('celebrate', state.soundOn);
    } else if (!quiet && result.message) {
      queueToast('good', result.message, '');
      PQAudio.play('correct', state.soundOn);
    } else if (result.ok) {
      PQAudio.play('tap', state.soundOn);
    }
    save();
    render();
  }

  function overTray(stage, clientX, clientY) {
    if (!stage) return false;
    var tray = stage.querySelector('.put-away');
    if (!tray) return false;
    var rect = tray.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  }

  function pointInStage(stage, clientX, clientY) {
    var rect = stage.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100
    };
  }

  function bindGlobal() {
    var app = $('#app');
    if (!app || app._bound) return;
    app._bound = true;
    app.addEventListener('click', onClick);
    app.addEventListener('pointerdown', onPointerDown, { passive: false });
    app.addEventListener('pointermove', onPointerMove, { passive: false });
    app.addEventListener('pointerup', onPointerUp);
    app.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerDown(e) {
    var map = e.target.closest ? e.target.closest('.town-map') : null;
    if (map && screen === 'home') {
      townSwipe = { x: e.clientX, y: e.clientY, pid: e.pointerId };
    } else {
      townSwipe = null;
    }
    var stage = e.target.closest ? e.target.closest('.room-stage') : null;
    if (!stage || screen !== 'house') return;
    var item = e.target.closest ? e.target.closest('.placed-item') : null;
    if (item) {
      e.preventDefault();
      drag = {
        id: item.getAttribute('data-item'),
        pid: e.pointerId,
        stage: stage,
        startX: e.clientX,
        startY: e.clientY,
        moved: false
      };
      try { item.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      return;
    }
    if (!pickedId) return;
    if (e.target.closest && e.target.closest('button')) return;
    e.preventDefault();
    if (overTray(stage, e.clientX, e.clientY)) {
      PQWorld.returnItem(state, houseId, pickedId);
      queueToast('good', 'You put it away. It is still yours.', '');
      pickedId = null;
      save();
      render();
      return;
    }
    var spot = pointInStage(stage, e.clientX, e.clientY);
    PQWorld.setItemPosition(state, houseId, pickedId, spot.x, spot.y);
    pickedId = null;
    save();
    render();
  }

  function onPointerMove(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    var dx = e.clientX - drag.startX;
    var dy = e.clientY - drag.startY;
    if (!drag.moved && (dx * dx + dy * dy) < 64) return;
    drag.moved = true;
    e.preventDefault();
    var el = drag.stage.querySelector('.placed-item[data-item="' + drag.id + '"]');
    if (!el) return;
    var spot = pointInStage(drag.stage, e.clientX, e.clientY);
    el.style.left = spot.x + '%';
    el.style.top = spot.y + '%';
    el.classList.add('is-dragging');
    var tray = drag.stage.querySelector('.put-away');
    if (tray) tray.classList.toggle('is-hot', overTray(drag.stage, e.clientX, e.clientY));
  }

  function onPointerUp(e) {
    if (townSwipe && e.pointerId === townSwipe.pid) {
      var swipeDx = e.clientX - townSwipe.x;
      var swipeDy = e.clientY - townSwipe.y;
      townSwipe = null;
      if (screen === 'home' && homePane === 'map' && Math.abs(swipeDx) > 56 && Math.abs(swipeDx) > Math.abs(swipeDy)) {
        ignoreClick = true;
        setTimeout(function () { ignoreClick = false; }, 350);
        turnTown(swipeDx < 0 ? 1 : -1);
      }
    }
    if (!drag || (e.pointerId != null && e.pointerId !== drag.pid)) return;
    var info = drag;
    drag = null;
    if (!info.moved) {
      pickedId = pickedId === info.id ? null : info.id;
      render();
      return;
    }
    ignoreClick = true;
    setTimeout(function () { ignoreClick = false; }, 350);
    if (overTray(info.stage, e.clientX, e.clientY)) {
      PQWorld.returnItem(state, houseId, info.id);
      pickedId = null;
      queueToast('good', 'You put it away. It is still yours.', '');
      save();
      render();
      return;
    }
    var spot = pointInStage(info.stage, e.clientX, e.clientY);
    PQWorld.setItemPosition(state, houseId, info.id, spot.x, spot.y);
    pickedId = null;
    save();
    render();
  }

  function onClick(e) {
    if (ignoreClick) return;
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    if (act !== 'toast-close' && act !== 'toast-speak') PQAudio.play('tap', state.soundOn);

    if (act === 'toggle-sound') {
      state.soundOn = !state.soundOn;
      save();
      render();
      return;
    }
    if (act === 'toast-close') {
      dismissToast();
      return;
    }
    if (act === 'toast-speak') {
      if (toast) {
        notices.pause();
        var spoken = toast.message + (toast.hint ? '. ' + toast.hint : '');
        var started = PQAudio.speak(spoken, true, function () {
          notices.resume();
        });
        if (!started) notices.resume();
      }
      return;
    }
    if (act === 'home-pane') {
      homePane = t.getAttribute('data-pane') || 'map';
      notePage = 0;
      render();
      return;
    }
    if (act === 'town-page') {
      var townPages = pageCount(PQWorld.visiblePlaces(state).length, townPerPage());
      townPage = readPager(t, townPage, townPages);
      render();
      return;
    }
    if (act === 'note-page') {
      notePage = readPager(t, notePage, 12);
      render();
      return;
    }
    if (act === 'action-page') {
      actionPage = readPager(t, actionPage, 12);
      render();
      return;
    }
    if (act === 'settings-tab') {
      settingsTab = t.getAttribute('data-tab') || 'rank';
      render();
      return;
    }
    if (act === 'read-next') {
      readStep += 1;
      render();
      return;
    }
    if (act === 'read-step') {
      readStep = readPager(t, readStep, 12);
      render();
      return;
    }
    if (act === 'story-next') {
      storyStep = 1;
      render();
      return;
    }
    if (act === 'peek-story') {
      peeking = true;
      readStep = 0;
      render();
      return;
    }
    if (act === 'peek-back') {
      peeking = false;
      render();
      return;
    }
    if (act === 'book-next') {
      bookStep += 1;
      render();
      return;
    }
    if (act === 'book-step') {
      bookStep = readPager(t, bookStep, 12);
      render();
      return;
    }
    if (act === 'learn-next') {
      learnStep += 1;
      render();
      return;
    }
    if (act === 'learn-step') {
      learnStep = readPager(t, learnStep, 12);
      render();
      return;
    }
    if (act === 'shelf-page') {
      shelfPage = readPager(t, shelfPage, 8);
      render();
      return;
    }
    if (act === 'album-page') {
      albumPage = readPager(t, albumPage, 12);
      render();
      return;
    }
    if (act === 'log-page') {
      logPage = readPager(t, logPage, 12);
      render();
      return;
    }
    if (act === 'open-log') {
      logFrom = screen === 'log' ? 'home' : screen;
      go('log');
      return;
    }
    if (act === 'toggle-wheel') {
      wheelOpen = !wheelOpen;
      wheelList = false;
      wheelCat = null;
      wheelPage = 0;
      render();
      return;
    }
    if (act === 'wheel-close') {
      wheelOpen = false;
      wheelCat = null;
      render();
      return;
    }
    if (act === 'wheel-mode') {
      wheelList = !wheelList;
      wheelCat = null;
      wheelPage = 0;
      render();
      return;
    }
    if (act === 'wheel-back') {
      wheelCat = null;
      wheelPage = 0;
      render();
      return;
    }
    if (act === 'wheel-page') {
      wheelPage = readPager(t, wheelPage, 12);
      render();
      return;
    }
    if (act === 'wheel-cat') {
      wheelCat = t.getAttribute('data-cat');
      wheelPage = 0;
      render();
      return;
    }
    if (act === 'wheel-pick') {
      var picked = PQWorld.placeItem(state, houseId, t.getAttribute('data-item'));
      wheelOpen = false;
      wheelCat = null;
      if (!picked) {
        queueToast('gentle', 'This room is full. Drag something to Put away first.', '');
      } else {
        pickedId = picked.itemId;
        queueToast('good', 'It is in the room. Drag it, or tap it and then tap a spot.', '');
      }
      save();
      render();
      return;
    }
    if (act === 'put-away') {
      if (!pickedId) {
        queueToast('good', 'Drag something here, or tap it first.', '');
        render();
        return;
      }
      PQWorld.returnItem(state, houseId, pickedId);
      pickedId = null;
      queueToast('good', 'You put it away. It is still yours.', '');
      save();
      render();
      return;
    }
    if (act === 'open-house' || act === 'open-board' || act === 'open-game' || act === 'open-activity' || act === 'open-solitaire' || act === 'open-shop') {
      dismissToast();
    }
    if (act === 'open-board') {
      var gameId = t.getAttribute('data-game');
      var allowed = PQBoards.forPlace(state, houseId);
      var meta = null;
      var gi;
      for (gi = 0; gi < allowed.length; gi++) if (allowed[gi].id === gameId) meta = allowed[gi];
      if (!meta) return;
      board = PQBoards.create(gameId, state, Math.random);
      boardEntry = '';
      if (!board) return;
      go('board');
      return;
    }
    if (act === 'board-again') {
      if (!board) return;
      var againId = board.id;
      board = PQBoards.create(againId, state, Math.random);
      boardEntry = '';
      go('board');
      return;
    }
    if (act === 'board-key') {
      var key = t.getAttribute('data-key');
      if (key === 'Del') boardEntry = boardEntry.slice(0, -1);
      else if (boardEntry.length < 4) boardEntry += key;
      render();
      return;
    }
    if (act === 'board-go') {
      if (!board) return;
      if (boardEntry === '') {
        queueToast('gentle', 'Type an answer, then tap Go.', '');
        render();
        return;
      }
      var typed = boardEntry;
      boardEntry = '';
      settleBoard(PQBoards.answer(board, typed, Math.random, state));
      return;
    }
    if (act === 'board-choice') {
      if (!board) return;
      settleBoard(PQBoards.answer(board, t.getAttribute('data-idx'), Math.random, state));
      return;
    }
    if (act === 'four-drop') {
      if (!board) return;
      settleBoard(PQBoards.dropFour(board, parseInt(t.getAttribute('data-col'), 10), Math.random, state));
      return;
    }
    if (act === 'bingo-tap') {
      if (!board) return;
      settleBoard(PQBoards.tapBingo(board, parseInt(t.getAttribute('data-idx'), 10), Math.random, state));
      return;
    }
    if (act === 'memory-flip') {
      if (!board) return;
      settleBoard(PQBoards.flipMemory(board, parseInt(t.getAttribute('data-idx'), 10)));
      return;
    }
    if (act === 'memory-continue') {
      if (!board) return;
      PQBoards.memoryContinue(board);
      render();
      return;
    }
    if (act === 'array-act') {
      if (!board) return;
      settleBoard(PQBoards.arrayAct(board, t.getAttribute('data-array')));
      return;
    }
    if (act === 'back') {
      if (screen === 'log') {
        var backTo = logFrom && logFrom !== 'log' ? logFrom : 'home';
        go(backTo);
        return;
      }
      if (screen === 'board') {
        board = null;
        boardEntry = '';
        go(houseId ? 'house' : 'home');
        return;
      }
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
      if (screen === 'learn' || screen === 'solitaire') {
        go(houseId ? 'house' : 'home');
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
      if (screen === 'bank' || screen === 'shop' || screen === 'album') {
        shopItemId = null;
        shopProblem = null;
        shopCoins = [];
        shopNote = '';
        go(houseId && screen !== 'bank' && screen !== 'album' ? 'house' : 'home');
        return;
      }
      if (screen === 'game') {
        gameRound = null;
        shopNote = '';
        go(houseId ? 'house' : 'home');
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
        houseId = null;
        go('home');
        return;
      }
      roleplayNote = '';
      go('house');
      return;
    }
    if (act === 'open-locked') {
      go('home');
      return;
    }
    if (act === 'place-item') {
      var placed = PQWorld.placeItem(state, houseId, t.getAttribute('data-item'));
      roleplayNote = placed
        ? 'You placed it. You can move it or put it back.'
        : 'This room is full. You can put something back first.';
      save();
      render();
      return;
    }
    if (act === 'move-item') {
      PQWorld.moveItem(state, houseId, t.getAttribute('data-item'));
      roleplayNote = 'You moved it to a new spot.';
      save();
      render();
      return;
    }
    if (act === 'return-item') {
      PQWorld.returnItem(state, houseId, t.getAttribute('data-item'));
      roleplayNote = 'You put it back with your things.';
      save();
      render();
      return;
    }
    if (act === 'open-activity') {
      openActivity();
      return;
    }
    if (act === 'open-solitaire') {
      openSolitaire();
      return;
    }
    if (act === 'town') {
      learn = null;
      go('home');
      return;
    }
    if (act === 'learn-continue') {
      applyLearn({ type: 'continue' });
      return;
    }
    if (act === 'learn-choice') {
      applyLearn({ type: 'choice', index: parseInt(t.getAttribute('data-idx'), 10) });
      return;
    }
    if (act === 'learn-left') {
      if (!learn) return;
      learn.pick = t.getAttribute('data-id');
      learn.note = 'Now tap the match.';
      learn.hint = '';
      render();
      return;
    }
    if (act === 'learn-right') {
      if (!learn || !learn.pick) {
        if (learn) {
          learn.note = 'Tap a clue first.';
          learn.hint = '';
          render();
        }
        return;
      }
      var picked = learn.pick;
      learn.pick = null;
      applyLearn({ type: 'pair', left: picked, right: t.getAttribute('data-id') });
      return;
    }
    if (act === 'learn-part') {
      applyLearn({ type: 'part', id: t.getAttribute('data-id') });
      return;
    }
    if (act === 'learn-color') {
      applyLearn({ type: 'color', id: t.getAttribute('data-id') });
      return;
    }
    if (act === 'sol-draw') {
      if (!solitaire) return;
      if (solitaire.stock && solitaire.stock.length) applySol({ type: 'draw' });
      else applySol({ type: 'recycle' });
      return;
    }
    if (act === 'sol-hint') {
      if (!solitaire) return;
      var hintMove = PQSolitaire.findMove(solitaire);
      if (!hintMove) {
        solitaireHint = PQSolitaire.hintMessage(solitaire);
        render();
        return;
      }
      solitaireHint = '';
      applySol(hintMove);
      return;
    }
    if (act === 'sol-waste') {
      if (!solitaire) return;
      applySol({ type: 'waste-foundation' });
      return;
    }
    if (act === 'sol-tab') {
      if (!solitaire) return;
      var col = parseInt(t.getAttribute('data-col'), 10);
      var index = parseInt(t.getAttribute('data-index'), 10);
      var pile = solitaire.tableau[col] || [];
      if (index === pile.length - 1) {
        var lifted = PQSolitaire.applyMove(solitaire, { type: 'tableau-foundation', column: col });
        if (lifted.ok) {
          solitaireHint = '';
          if (lifted.message) queueToast('good', lifted.message, '');
          PQAudio.play(lifted.won ? 'celebrate' : 'tap', state.soundOn);
          save();
          render();
          return;
        }
      }
      if (solitaire.pick && solitaire.pick.kind === 'tableau' && solitaire.pick.column !== col) {
        var fromPick = solitaire.pick;
        solitaire.pick = null;
        applySol({ type: 'tableau-tableau', from: fromPick.column, to: col, index: fromPick.index });
        return;
      }
      if (solitaire.pick && solitaire.pick.kind === 'waste') {
        solitaire.pick = null;
        applySol({ type: 'waste-tableau', column: col });
        return;
      }
      solitaire.pick = { kind: 'tableau', column: col, index: index };
      solitaireNote = 'Tap the column where this card should go.';
      render();
      return;
    }
    if (act === 'sol-col') {
      if (!solitaire || !solitaire.pick) return;
      var targetCol = parseInt(t.getAttribute('data-col'), 10);
      var drop = solitaire.pick;
      solitaire.pick = null;
      if (drop.kind === 'waste') applySol({ type: 'waste-tableau', column: targetCol });
      else applySol({ type: 'tableau-tableau', from: drop.column, to: targetCol, index: drop.index });
      return;
    }
    if (act === 'sol-foundation') {
      if (!solitaire) return;
      if (solitaire.pick && solitaire.pick.kind === 'tableau') {
        applySol({ type: 'tableau-foundation', column: solitaire.pick.column });
        solitaire.pick = null;
        return;
      }
      applySol({ type: 'waste-foundation' });
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
      if (chosen && chosen.nav === 'shop') {
        shopItemId = null;
        shopNote = '';
        go('shop');
        return;
      }
      var played = PQWorld.playAction(houseId, actionId, state, {
        petName: PQPets.displayName(state),
        step: roleplayStep,
        dateKey: PQStorage.localDateKey()
      });
      roleplayStep += 1;
      roleplayNote = played.message;
      queueToast(played.prize ? 'good' : 'good', played.message, '');
      if (played.opened && played.opened.length) {
        freshPlace = played.opened[0];
        neighborhoodNote = played.opened[0].openLine;
      }
      if (chosen && chosen.play) {
        var playedSurprise = applySurprise(PQWorld.tryPlaySurprise(state, PQStorage.localDateKey(), Math.random));
        if (playedSurprise) {
          roleplayNote = played.message + ' ' + playedSurprise;
          queueToast('good', playedSurprise, '');
        }
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
    if (act === 'toggle-focus') {
      toggleFocus(t.getAttribute('data-focus'));
      return;
    }
    if (act === 'open-bank') {
      go('bank');
      return;
    }
    if (act === 'open-shop') {
      if (!PQWorld.isPlaceOpen(state, 'store')) return;
      shopItemId = null;
      shopProblem = null;
      shopCoins = [];
      shopNote = '';
      go('shop');
      return;
    }
    if (act === 'open-album') {
      go('album');
      return;
    }
    if (act === 'open-gift') {
      var gift = PQDays.openGift(state, PQStorage.localDateKey());
      neighborhoodNote = gift.message;
      queueToast('good', gift.message, '');
      PQAudio.play('celebrate', state.soundOn);
      save();
      go('home');
      return;
    }
    if (act === 'greet-pet') {
      var hello = PQDays.greet(state, PQStorage.localDateKey(), PQPets.displayName(state));
      if (!hello.already && hello.growth) {
        state.growthPoints = (state.growthPoints || 0) + hello.growth;
        state.growthStage = PQQuest.stageFromPoints(state.growthPoints);
      }
      neighborhoodNote = hello.message;
      queueToast('good', hello.message, '');
      PQAudio.play('soft', state.soundOn);
      save();
      render();
      return;
    }
    if (act === 'claim-week') {
      var weekNow = PQStorage.weeklyProgress(state);
      var claimed = PQDays.claimWeekly(state, weekNow.weekKey, weekNow.met);
      neighborhoodNote = claimed.message;
      queueToast('good', claimed.message, '');
      if (claimed.coins) PQAudio.play('celebrate', state.soundOn);
      save();
      go('home');
      return;
    }
    if (act === 'play-item') {
      roleplayNote = applySurprise(PQWorld.tryPlaySurprise(state, PQStorage.localDateKey(), Math.random)) ||
        'You play together. It feels nice.';
      queueToast('good', roleplayNote, '');
      PQAudio.play('soft', state.soundOn);
      save();
      render();
      return;
    }
    if (act === 'open-game') {
      var meta = PQGames.forPlace(state, houseId);
      if (!meta) return;
      gameRound = PQGames.roundFor(houseId, state.courses && state.courses.grade, Math.random);
      shopNote = '';
      go('game');
      return;
    }
    if (act === 'game-choice') {
      if (!gameRound) return;
      var gameResult = PQGames.checkStep(gameRound, parseInt(t.getAttribute('data-idx'), 10));
      if (gameResult.ok && gameResult.done && !gameRound.rewarded) {
        gameRound.rewarded = true;
        PQBank.addCoins(state, gameRound.reward || 8);
        PQAudio.play('celebrate', state.soundOn);
        shopNote = '';
        queueToast('good', 'You finished. ' + (gameRound.reward || 8) + ' coins go in the bank.', '', function () {
          if (screen === 'game') go(houseId ? 'house' : 'home');
        });
      } else if (gameResult.ok) {
        shopNote = '';
        PQAudio.play('correct', state.soundOn);
      } else {
        shopNote = gameResult.hint || gameResult.message;
        queueToast('gentle', gameResult.message || 'Not yet.', '');
        PQAudio.play('gentle', state.soundOn);
      }
      save();
      render();
      return;
    }
    if (act === 'shop-item') {
      var shelfItem = PQShop.itemById(t.getAttribute('data-item'));
      if (!shelfItem) return;
      shopItemId = shelfItem.id;
      shopProblem = PQShop.problemFor(shelfItem, state.courses && state.courses.grade, Math.random);
      shopCoins = [];
      shopNote = '';
      render();
      return;
    }
    if (act === 'shop-coin') {
      shopCoins.push(parseInt(t.getAttribute('data-coin'), 10));
      shopNote = '';
      render();
      return;
    }
    if (act === 'shop-uncoint') {
      var dropAt = parseInt(t.getAttribute('data-idx'), 10);
      if (dropAt >= 0 && dropAt < shopCoins.length) shopCoins.splice(dropAt, 1);
      shopNote = '';
      render();
      return;
    }
    if (act === 'shop-back') {
      shopItemId = null;
      shopProblem = null;
      shopCoins = [];
      shopNote = '';
      render();
      return;
    }
    if (act === 'shop-pay' || act === 'shop-value') {
      if (!shopItemId || !shopProblem) return;
      var payInput = { problem: shopProblem, coins: shopCoins.slice() };
      if (act === 'shop-value') payInput.value = t.getAttribute('data-value');
      var bought = PQShop.buy(state, shopItemId, payInput, state.courses && state.courses.grade);
      if (bought.ok) {
        shopNote = '';
        shopItemId = null;
        shopProblem = null;
        shopCoins = [];
        queueToast('good', bought.message, '');
        PQAudio.play('celebrate', state.soundOn);
      } else {
        shopNote = bought.hint;
        queueToast('gentle', 'Not yet.', '');
        PQAudio.play('gentle', state.soundOn);
      }
      save();
      render();
      return;
    }
    if (act === 'toggle-table') {
      toggleTable(parseInt(t.getAttribute('data-table'), 10));
      return;
    }
    if (act === 'set-rank') {
      setRank(t.getAttribute('data-rank'));
      return;
    }
    if (act === 'set-grade') {
      setGrade(parseInt(t.getAttribute('data-grade'), 10));
      return;
    }
    if (act === 'try-next-rank' || act === 'try-next-grade') {
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
      bookStep = 0;
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
        board = null;
        pickedId = null;
        wheelOpen = false;
        toast = null;
        go('welcome');
      }
      return;
    }
    if (act === 'read-aloud') {
      if (screen === 'learn' && learn && learn.activity && learn.activity.reading) {
        PQAudio.speak(learn.activity.reading, true);
        return;
      }
      if (screen === 'library') {
        var book = currentBook();
        if (book && book.text) PQAudio.speak(book.text, true);
        return;
      }
      var task = currentTask();
      if (task && task.text) {
        var aloud = task.text;
        if (task.words && task.words.length) {
          aloud = task.words.map(function (word) {
            return word.word + '. ' + word.say;
          }).join(' ') + ' ' + task.text;
        }
        PQAudio.speak(aloud, true);
      }
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
    armLeave(function () {
      if (screen === 'celebrate') go('home');
    });
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
    partyNote = '';
    cardNeedsContinue = !!result.needsContinue;
    if (result.needsContinue) {
      queueToast('gentle', result.message || 'Not a pair.', '', function () {
        if (cardDeck && cardNeedsContinue) {
          PQParty.turnBack(cardDeck);
          cardNeedsContinue = false;
          render();
        }
      });
    } else if (result.cleared && !cardRewarded) {
      cardRewarded = true;
      var award = PQParty.finishCardRound(state, PQStorage.localDateKey());
      queueToast('good', award.message, '');
      save();
      PQAudio.play('party', state.soundOn);
    } else if (result.matched) {
      queueToast('good', result.message || 'A pair.', '');
      PQAudio.play('correct', state.soundOn);
    } else if (result.message) {
      queueToast('good', result.message, '');
    }
    render();
  }

  function doSpin() {
    var result = PQParty.spin(state, Math.random, PQStorage.localDateKey());
    if (result.reels) spinReels = result.reels;
    partyNote = '';
    if (result.message) queueToast(result.prize ? 'good' : 'gentle', result.message, '');
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
    partyNote = '';
    queueToast('good', lines[partyStep % lines.length], '');
    partyStep += 1;
    PQAudio.play('party', state.soundOn);
    if (screen !== 'party') go('party');
    render();
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
      PQBank.addCoins(state, 1);
      PQAudio.play('correct', state.soundOn);
      feedback = { kind: 'good', message: result.message, coins: 1 };
      queueToast('good', result.message + ' +1 coin.', '');
      save();
      setTimeout(function () {
        advanceTask();
      }, 1100);
      render();
      return;
    }
    noteDailyAnswer(task, false);
    PQBank.noteMistake(state);
    PQAudio.play('gentle', state.soundOn);
    feedback = { kind: 'gentle', message: result.message, hint: result.hint };
    queueToast('gentle', result.message, result.hint);
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
      var gain = wasFirstTry ? 2 : 1;
      PQBank.addCoins(state, gain);
      PQAudio.play('correct', state.soundOn);
      feedback = { kind: 'good', message: result.message, fact: result.fact, coins: gain };
      queueToast('good', result.message + (result.fact ? ' ' + result.fact : '') + ' +' + gain + (gain === 1 ? ' coin.' : ' coins.'), '');
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
      }, 1100);
      render();
      return;
    }

    // Incorrect — coins stay put
    noteDailyAnswer(task, false);
    PQBank.noteMistake(state);
    PQAudio.play('gentle', state.soundOn);
    feedback = { kind: 'gentle', message: result.message, hint: result.hint };
    queueToast('gentle', result.message, result.hint);
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

  function applySurprise(surprise) {
    if (!surprise) return '';
    if (surprise.coins) PQBank.addCoins(state, surprise.coins);
    if (surprise.item) PQAudio.play('party', state.soundOn);
    return surprise.message || '';
  }

  function toggleFocus(key) {
    PQQuest.normalizeCourses(state);
    var focus = state.courses.lessonFocus;
    var keys = ['addition', 'subtraction', 'multiplication', 'reading'];
    if (!focus || keys.indexOf(key) === -1) return;
    if (focus[key]) {
      var still = 0;
      var i;
      for (i = 0; i < keys.length; i++) if (focus[keys[i]]) still += 1;
      if (still <= 1) {
        settingsNote = 'Leave at least one lesson on.';
        rerenderSettings();
        return;
      }
    }
    focus[key] = !focus[key];
    settingsNote = 'Today’s quest will follow this lesson focus.';
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

  function rankNote(grade, started) {
    var label = PQStorage.rankLabel(grade);
    if (started) return label + ' starts with tomorrow\u2019s quest.';
    return label + ' is on for today\u2019s quest.';
  }

  function setRank(rankId) {
    var grade = PQStorage.gradeFromRank(rankId);
    if (!grade) return;
    setGrade(grade);
  }

  function setGrade(grade) {
    if (!(grade >= 1 && grade <= 5)) return;
    PQQuest.normalizeCourses(state);
    var today = PQStorage.localDateKey();
    var started = !!(state.daily && state.daily.dateKey === today && PQQuest.questStarted(state.daily));
    if (state.courses.grade === grade) {
      state.courses.rank = PQStorage.rankFromGrade(grade);
      if (screen === 'settings') rerenderSettings();
      return;
    }
    state.courses.grade = grade;
    state.courses.rank = PQStorage.rankFromGrade(grade);
    PQQuest.stampGradeProgress(state);
    settingsNote = rankNote(grade, started);
    neighborhoodNote = settingsNote;
    state._practiceTask = null;
    PQQuest.ensureTodayQuest(state);
    save();
    if (screen === 'settings') rerenderSettings();
    else render();
  }

  function tryNextGrade() {
    var info = PQQuest.gradeReadiness(state);
    if (!info.ready || !info.next) return;
    var nextLabel = PQStorage.rankLabel(info.next);
    var currentLabel = PQStorage.rankLabel(info.grade);
    if (!window.confirm('Try the ' + nextLabel + ' rank? You can come back to ' + currentLabel + ' whenever you like.')) return;
    var ok = PQQuest.applyNextGrade(state);
    if (!ok) return;
    state.courses.rank = PQStorage.rankFromGrade(state.courses.grade);
    neighborhoodNote = nextLabel + ' is the rank for now.';
    settingsNote = neighborhoodNote;
    state._practiceTask = null;
    PQQuest.ensureTodayQuest(state);
    save();
    PQAudio.play('celebrate', state.soundOn);
    if (screen === 'settings') rerenderSettings();
    else render();
  }

  function applyLearn(input) {
    if (!learn || !learn.activity) return;
    var result = PQLearn.act(learn.activity, learn.progress, input);
    learn.progress = result.progress;
    if (result.hint) {
      learn.note = result.message || 'Not yet.';
      learn.hint = result.hint;
    } else {
      learn.note = '';
      learn.hint = '';
      if (result.message) queueToast(result.done ? 'good' : 'good', result.message, '');
    }
    if (result.message) PQAudio.play(result.done ? 'correct' : 'tap', state.soundOn);
    render();
  }

  function openActivity() {
    var activity = PQLearn.forPlace(state, houseId);
    if (!activity) return;
    learn = { activity: activity, progress: PQLearn.begin(activity), note: '', hint: '', pick: null };
    go('learn');
  }

  function openSolitaire() {
    if (!PQSolitaire.canPlay(state)) return;
    if (solitaire && !solitaire.won) {
      go('solitaire');
      return;
    }
    var opened = PQSolitaire.openGame(state, Math.random, PQStorage.localDateKey());
    solitaire = opened.game;
    solitaireNote = opened.message;
    if (opened.ok) save();
    go('solitaire');
  }

  function applySol(move) {
    if (!solitaire) return;
    var result = PQSolitaire.applyMove(solitaire, move);
    solitaireNote = result.message || '';
    if (!result.ok) {
      solitaireHint = result.message || 'Not yet.';
    } else {
      solitaireHint = '';
      if (result.message) queueToast(result.won ? 'good' : 'good', result.message, '');
      PQAudio.play(result.won ? 'celebrate' : 'tap', state.soundOn);
    }
    render();
  }

  function missionDoneCopy(mission) {
    if (mission === 'warmup') return 'Kitchen warmup is done. You can look around or visit another house.';
    if (mission === 'reading') return 'That story is finished. Nice reading.';
    if (mission === 'multiply') return 'Times tables in the schoolhouse are done for now.';
    return 'That part is done. The town is still here.';
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
      houseId = PQWorld.houseIdForMission(finishedMission, state) || houseId;
      roleplayNote = missionDoneCopy(finishedMission);
      queueToast('good', roleplayNote, '');
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
    PQBank.addCoins(state, 12);
    freshUnlock = PQWorld.grantNextUnlock(state);
    var openedPlaces = PQWorld.noteQuestFinished(state, PQStorage.localDateKey());
    freshPlace = openedPlaces && openedPlaces.length ? openedPlaces[0] : freshPlace;
    if (freshPlace) neighborhoodNote = freshPlace.openLine;
    var questNews = 'Quest complete. 12 coins go in the bank.';
    if (freshUnlock && freshUnlock.line) questNews += ' ' + freshUnlock.line;
    if (freshPlace && freshPlace.openLine) questNews += ' ' + freshPlace.openLine;
    queueToast('good', questNews, '');
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

  function fillDemo() {
    state.onboardingDone = true;
    state.petId = state.petId || 'bunny';
    state.petName = state.petName || 'Bunny';
    if (!state.growthStage) state.growthStage = 2;
    state.soundOn = true;
    PQQuest.normalizeCourses(state);
    PQWorld.ensureWorld(state);
    state.world.questsFinished = Math.max(state.world.questsFinished || 0, 30);
    state.world.activitiesDone = Math.max(state.world.activitiesDone || 0, 30);
    if ((state.bank.coins || 0) < 24) state.bank.coins = 24;
    PQWorld.checkPlaceUnlocks(state);
    ['pet-bowl', 'red-rug', 'blue-lamp', 'fern-plant', 'toy-ball', 'star-poster', 'soft-pillow', 'wood-chair', 'cozy-basket', 'little-teapot'].forEach(function (id) {
      if (state.world.unlocks.indexOf(id) === -1) state.world.unlocks.push(id);
    });
    if (!PQWorld.placementsFor(state, 'pet').length) PQWorld.placeItem(state, 'pet', 'red-rug');
    PQQuest.ensureTodayQuest(state);
    var today = PQStorage.localDateKey();
    if (state.days.visitDates.indexOf(today) === -1) state.days.visitDates.push(today);
  }

  function taskAt(type, extra) {
    fillDemo();
    var tasks = state.daily.tasks || [];
    var i;
    for (i = 0; i < tasks.length; i++) {
      if (tasks[i].type === type) {
        state.daily.taskIndex = i;
        tasks[i].cleared = false;
        state.daily.completed = false;
        return tasks[i];
      }
    }
    var made = extra || { type: type, mission: 'warmup', prompt: '3 + 4', answer: 7, missCount: 0 };
    made.type = type;
    made.cleared = false;
    tasks.unshift(made);
    state.daily.tasks = tasks;
    state.daily.taskIndex = 0;
    state.daily.completed = false;
    return made;
  }

  function preview(which) {
    toastAfter = null;
    if (notices.isOpen()) notices.dismiss();
    which = which || 'town';
    if (which === 'welcome') {
      state.onboardingDone = false;
      state.petId = null;
      go('welcome');
      return;
    }
    fillDemo();
    if (which === 'town') {
      homePane = 'map';
      townPage = 0;
      go('home');
      return;
    }
    if (which === 'town-next') {
      homePane = 'map';
      townPage = 1;
      go('home');
      return;
    }
    if (which === 'today') {
      homePane = 'today';
      visitNote = 'The general store can wait. There is no rush. Today includes warmup math, a pet story, and times tables.';
      go('home');
      return;
    }
    if (which === 'week') {
      homePane = 'week';
      go('home');
      return;
    }
    if (which === 'quest') {
      taskAt('add', { type: 'add', mission: 'warmup', prompt: '6 + 7', answer: 13, a: 6, b: 7, missCount: 0 });
      go('quest');
      storyStep = 1;
      render();
      return;
    }
    if (which === 'story') {
      var storyTask = taskAt('add', {
        type: 'add', mission: 'warmup', prompt: '2 + 2', answer: 4, a: 2, b: 2, missCount: 0
      });
      storyTask.story = { text: 'Bunny finds 2 berries and then 2 more.', count: 4, icon: 'berry' };
      go('quest');
      storyStep = 0;
      render();
      return;
    }
    if (which === 'reading') {
      taskAt('reading-pass', {
        type: 'reading-pass',
        mission: 'reading',
        title: 'The Quiet Platform',
        words: [{ word: 'platform', say: 'A platform is where you wait for a train.' }],
        text: 'The train station was bright and not crowded. A board listed two trains. The red train would leave at 2 and stop by the pond.\n\nFern pointed at the blue line and then at the clock. There was still time. They sat on a bench and shared a small apple.\n\nWhen the blue train arrived, they let other riders step off first. Then they found two seats by a window.',
        cleared: false
      });
      go('quest');
      return;
    }
    if (which === 'question') {
      taskAt('reading-q', {
        type: 'reading-q',
        mission: 'reading',
        title: 'The Quiet Platform',
        question: 'Which train should Bunny take to the beach?',
        choices: ['The blue train', 'The red train', 'A boat', 'Neither train'],
        answer: 0,
        text: 'The blue train stops by the beach.',
        missCount: 0,
        cleared: false
      });
      go('quest');
      return;
    }
    if (which === 'room') {
      houseId = 'pet';
      go('house');
      wheelOpen = true;
      wheelList = false;
      wheelCat = null;
      wheelPage = 0;
      render();
      return;
    }
    if (which === 'four' || which === 'race' || which === 'bingo' || which === 'memory' || which === 'array') {
      state.courses.grade = 5;
      state.courses.rank = 'champion';
      houseId = which === 'memory' ? 'library' : (which === 'bingo' || which === 'array' ? 'school' : 'parlor');
      board = PQBoards.create(which, state, function () { return 0.2; });
      go('board');
      return;
    }
    if (which === 'shop') {
      shopItemId = null;
      shopProblem = null;
      shopNote = '';
      go('shop');
      return;
    }
    if (which === 'shop-pay') {
      var shelfItem = PQShop.catalog(state)[0];
      shopItemId = shelfItem ? shelfItem.id : null;
      shopProblem = shelfItem ? PQShop.problemFor(shelfItem, state.courses.grade, function () { return 0.2; }) : null;
      shopCoins = [];
      shopNote = '';
      go('shop');
      return;
    }
    if (which === 'library') {
      bookIndex = 0;
      bookStep = 0;
      go('library');
      return;
    }
    if (which === 'settings' || which === 'settings-lessons' || which === 'settings-tables' || which === 'settings-grownups') {
      settingsTab = which === 'settings' ? 'rank' : which.replace('settings-', '');
      if (settingsTab === 'settings') settingsTab = 'rank';
      go('settings');
      return;
    }
    if (which === 'toast') {
      homePane = 'map';
      go('home');
      queueToast('good', 'You get a paw-print sticker. It is saved on this device.', '');
      render();
      return;
    }
    if (which === 'party') {
      go('party');
      return;
    }
    if (which === 'party-cards') {
      cardDeck = PQParty.createCardDeck(function () { return 0.4; });
      cardNeedsContinue = false;
      go('party-cards');
      return;
    }
    if (which === 'bank') {
      go('bank');
      return;
    }
    if (which === 'album') {
      go('album');
      return;
    }
    if (which === 'log') {
      if (!state.world.log.length) PQWorld.pushLog(state, 'You looked around the house.');
      go('log');
      return;
    }
    if (which === 'game') {
      houseId = 'bakery';
      gameRound = PQGames.roundFor('bakery', 2, function () { return 0.3; });
      shopNote = '';
      go('game');
      return;
    }
    if (which === 'solitaire') {
      state.courses.grade = 5;
      houseId = 'parlor';
      var opened = PQSolitaire.openGame(state, function () { return 0.4; }, PQStorage.localDateKey());
      solitaire = opened.game;
      solitaireHint = '';
      go('solitaire');
      return;
    }
    if (which === 'celebrate') {
      go('celebrate');
      return;
    }
    if (which === 'practice') {
      state._practiceTask = null;
      go('practice');
      return;
    }
    if (which === 'pets') {
      selectedPet = 'bunny';
      go('pick-pet');
      return;
    }
    if (which === 'learn') {
      houseId = 'museum';
      learn = null;
      var activity = PQLearn.forPlace(state, 'museum');
      if (activity) {
        learn = { activity: activity, progress: PQLearn.begin(activity), note: '', hint: '', pick: null };
        go('learn');
      } else go('home');
      return;
    }
    go('home');
  }

  window.PetQuests = {
    boot: boot,
    getState: function () {
      return state;
    },
    render: render,
    preview: preview,
    NOTICE_MS: PQNotices.NOTICE_MS
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
