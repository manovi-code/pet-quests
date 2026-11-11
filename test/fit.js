/**
 * Headless viewport check: every main screen fits without page scroll.
 * Run: node test/fit.js
 */
'use strict';

var http = require('http');
var path = require('path');
var fs = require('fs');
var child = require('child_process');

var ROOT = path.join(__dirname, '..');
var PORT = 8765;
var DEBUG_PORT = 9333;
var CHROME = process.env.CHROME || 'google-chrome';

var SIZES = [
  { name: 'phone-390x844', width: 390, height: 844 },
  { name: 'phone-360x740', width: 360, height: 740 },
  { name: 'tablet-820x1180', width: 820, height: 1180 },
  { name: 'tablet-1180x820', width: 1180, height: 820 }
];

var SCREENS = [
  'welcome', 'pets', 'town', 'town-next', 'today', 'week',
  'quest', 'reading', 'question', 'story',
  'room', 'four', 'race', 'bingo', 'memory', 'array',
  'shop', 'shop-pay', 'library',
  'settings', 'settings-lessons', 'settings-tables', 'settings-grownups',
  'toast', 'party', 'party-cards', 'bank', 'album', 'log',
  'game', 'solitaire', 'celebrate', 'practice', 'learn'
];

function contentType(file) {
  if (file.endsWith('.html')) return 'text/html; charset=utf-8';
  if (file.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (file.endsWith('.css')) return 'text/css; charset=utf-8';
  if (file.endsWith('.svg')) return 'image/svg+xml';
  if (file.endsWith('.png')) return 'image/png';
  if (file.endsWith('.webmanifest')) return 'application/manifest+json';
  return 'application/octet-stream';
}

function startServer() {
  return new Promise(function (resolve) {
    var server = http.createServer(function (req, res) {
      var urlPath = decodeURIComponent(req.url.split('?')[0]);
      if (urlPath === '/') urlPath = '/index.html';
      var file = path.join(ROOT, urlPath);
      if (!file.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('no');
        return;
      }
      fs.readFile(file, function (err, data) {
        if (err) {
          res.writeHead(404);
          res.end('missing');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType(file), 'Cache-Control': 'no-store' });
        res.end(data);
      });
    });
    server.listen(PORT, '127.0.0.1', function () { resolve(server); });
  });
}

function getJson(url) {
  return new Promise(function (resolve, reject) {
    http.get(url, function (res) {
      var body = '';
      res.on('data', function (chunk) { body += chunk; });
      res.on('end', function () {
        try { resolve(JSON.parse(body)); } catch (err) { reject(err); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function connect(url) {
  return new Promise(function (resolve, reject) {
    var ws = new WebSocket(url);
    var seq = 0;
    var pending = new Map();
    var listeners = [];
    ws.addEventListener('open', function () { resolve(api); });
    ws.addEventListener('error', function () { reject(new Error('websocket failed')); });
    ws.addEventListener('message', function (ev) {
      var msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        var waiter = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) waiter.reject(new Error(msg.error.message || 'cdp error'));
        else waiter.resolve(msg.result);
        return;
      }
      listeners.forEach(function (fn) { fn(msg); });
    });
    var api = {
      send: function (method, params) {
        var id = ++seq;
        return new Promise(function (res, rej) {
          pending.set(id, { resolve: res, reject: rej });
          ws.send(JSON.stringify({ id: id, method: method, params: params || {} }));
        });
      },
      on: function (fn) { listeners.push(fn); },
      close: function () { try { ws.close(); } catch (err) { /* ignore */ } }
    };
  });
}

var MEASURE = [
  '(() => {',
  '  var se = document.scrollingElement;',
  '  var clipped = [];',
  '  var nodes = [];',
  '  var app = document.getElementById("app");',
  '  if (app) nodes.push(app);',
  '  document.querySelectorAll("main, .wheel-pop, .wheel-list, .town-map").forEach(function (el) { nodes.push(el); });',
  '  nodes.forEach(function (el) {',
  '    if (el.scrollHeight > el.clientHeight + 2) {',
  '      clipped.push((el.id || el.className || el.tagName) + " " + el.scrollHeight + ">" + el.clientHeight);',
  '    }',
  '  });',
  '  var scrollers = [];',
  '  document.querySelectorAll("*").forEach(function (el) {',
  '    var style = getComputedStyle(el);',
  '    if ((style.overflowY === "auto" || style.overflowY === "scroll") && el.scrollHeight > el.clientHeight + 2) {',
  '      scrollers.push(el.className || el.tagName);',
  '    }',
  '  });',
  '  return {',
  '    scrollHeight: se ? se.scrollHeight : 0,',
  '    innerHeight: window.innerHeight,',
  '    scrollWidth: se ? se.scrollWidth : 0,',
  '    innerWidth: window.innerWidth,',
  '    clipped: clipped,',
  '    scrollers: scrollers',
  '  };',
  '})()'
].join('\n');

async function main() {
  var server = await startServer();
  var userDir = fs.mkdtempSync('/tmp/pq-chrome-');
  var chrome = child.spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--disable-extensions',
    '--user-data-dir=' + userDir,
    '--remote-debugging-port=' + DEBUG_PORT,
    '--window-size=390,844',
    'about:blank'
  ], { stdio: 'ignore' });

  var failures = [];
  var cdp = null;
  try {
    var tabs = null;
    var tries = 0;
    while (!tabs && tries < 40) {
      tries += 1;
      await sleep(150);
      try { tabs = await getJson('http://127.0.0.1:' + DEBUG_PORT + '/json'); } catch (err) { tabs = null; }
    }
    if (!tabs || !tabs.length) throw new Error('Chrome did not open a debug port');
    cdp = await connect(tabs[0].webSocketDebuggerUrl);
    var errors = [];
    cdp.on(function (msg) {
      if (msg.method === 'Runtime.exceptionThrown') {
        var text = msg.params && msg.params.exceptionDetails
          ? (msg.params.exceptionDetails.exception && msg.params.exceptionDetails.exception.description) || msg.params.exceptionDetails.text
          : 'exception';
        errors.push(String(text).split('\n')[0]);
      }
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params && msg.params.type === 'error') {
        var args = (msg.params.args || []).map(function (arg) { return arg.value || arg.description || ''; }).join(' ');
        errors.push(args || 'console.error');
      }
    });
    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    await cdp.send('Log.enable');
    await cdp.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/index.html' });
    await sleep(400);
    var ready = await cdp.send('Runtime.evaluate', {
      expression: '!!(window.PetQuests && window.PetQuests.preview)',
      returnByValue: true
    });
    if (!ready.result || !ready.result.value) {
      throw new Error('Pet Quests did not boot');
    }

    var sizeIndex;
    var screenIndex;
    for (sizeIndex = 0; sizeIndex < SIZES.length; sizeIndex++) {
      var size = SIZES[sizeIndex];
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: size.width,
        height: size.height,
        deviceScaleFactor: 1,
        mobile: true
      });
      for (screenIndex = 0; screenIndex < SCREENS.length; screenIndex++) {
        var name = SCREENS[screenIndex];
        var before = errors.length;
        var shown = await cdp.send('Runtime.evaluate', {
          expression: '(function () { try { window.PetQuests.preview(' + JSON.stringify(name) + '); return true; } catch (err) { return String(err && err.stack || err); } })()',
          returnByValue: true
        });
        if (!shown.result || shown.result.value !== true) {
          failures.push(size.name + ' ' + name + ' threw ' + (shown.result && shown.result.value));
          continue;
        }
        var measured = await cdp.send('Runtime.evaluate', {
          expression: 'new Promise(function (resolve) { requestAnimationFrame(function () { requestAnimationFrame(function () { resolve(' + MEASURE + '); }); }); })',
          awaitPromise: true,
          returnByValue: true
        });
        var box = measured.result && measured.result.value;
        if (!box) {
          failures.push(size.name + ' ' + name + ' had no measurement');
          continue;
        }
        var freshErrors = errors.slice(before).filter(function (line) {
          return line && !/favicon|service worker|Failed to register/i.test(line);
        });
        var pageOk = box.scrollHeight <= box.innerHeight + 2 && box.scrollWidth <= box.innerWidth + 2;
        if (!pageOk || (box.clipped && box.clipped.length) || (box.scrollers && box.scrollers.length) || freshErrors.length) {
          failures.push(
            size.name + ' ' + name +
            ' scroll ' + box.scrollHeight + '/' + box.innerHeight +
            ' wide ' + box.scrollWidth + '/' + box.innerWidth +
            (box.clipped && box.clipped.length ? ' clipped ' + box.clipped.join('; ') : '') +
            (box.scrollers && box.scrollers.length ? ' scrollers ' + box.scrollers.join(',') : '') +
            (freshErrors.length ? ' errors ' + freshErrors.join(' | ') : '')
          );
        } else {
          console.log('  fit  ' + size.name + '  ' + name + '  ' + box.scrollHeight + '<=' + box.innerHeight);
        }
      }
    }
  } finally {
    if (cdp) cdp.close();
    chrome.kill('SIGKILL');
    server.close();
  }

  if (failures.length) {
    console.log('\nViewport fit failures: ' + failures.length);
    failures.forEach(function (line) { console.log('  FAIL  ' + line); });
    process.exit(1);
  }
  console.log('\nAll screens fit at phone and tablet sizes.');
}

main().catch(function (err) {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
