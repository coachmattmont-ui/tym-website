/* Shared floor-plan sales demo. List prices match the Layout catalog. */
(function () {
  var MARKUP = "<div class=\"demo-stage\">\n            <svg class=\"plan-svg\" viewBox=\"0 0 760 520\" role=\"img\" aria-label=\"Invented floor plan with an entry, great room, kitchen, bedroom, closet, and bath\">\n              <rect width=\"760\" height=\"520\" fill=\"#fff\"/>\n              <g fill=\"#111\">\n                <rect x=\"48\" y=\"40\" width=\"102\" height=\"4\"/>\n                <rect x=\"270\" y=\"40\" width=\"290\" height=\"4\"/>\n                <rect x=\"660\" y=\"40\" width=\"64\" height=\"4\"/>\n                <rect x=\"48\" y=\"480\" width=\"42\" height=\"4\"/>\n                <rect x=\"150\" y=\"480\" width=\"190\" height=\"4\"/>\n                <rect x=\"450\" y=\"480\" width=\"274\" height=\"4\"/>\n                <rect x=\"48\" y=\"40\" width=\"4\" height=\"50\"/>\n                <rect x=\"48\" y=\"170\" width=\"4\" height=\"314\"/>\n                <rect x=\"720\" y=\"40\" width=\"4\" height=\"260\"/>\n                <rect x=\"720\" y=\"350\" width=\"4\" height=\"20\"/>\n                <rect x=\"720\" y=\"450\" width=\"4\" height=\"34\"/>\n                <rect x=\"48\" y=\"292\" width=\"112\" height=\"4\"/>\n                <rect x=\"210\" y=\"292\" width=\"250\" height=\"4\"/>\n                <rect x=\"470\" y=\"292\" width=\"254\" height=\"4\"/>\n                <rect x=\"470\" y=\"40\" width=\"4\" height=\"150\"/>\n                <rect x=\"470\" y=\"240\" width=\"4\" height=\"80\"/>\n                <rect x=\"470\" y=\"380\" width=\"4\" height=\"104\"/>\n                <rect x=\"230\" y=\"296\" width=\"4\" height=\"64\"/>\n                <rect x=\"230\" y=\"410\" width=\"4\" height=\"74\"/>\n              </g>\n              <g fill=\"none\" stroke=\"#111\" stroke-width=\"1.15\">\n                <path d=\"M160 292 A 24 24 0 0 0 184 316\"/>\n                <path d=\"M470 220 A 20 20 0 0 0 490 200\"/>\n                <path d=\"M90 480 A 28 28 0 0 0 118 452\"/>\n                <path d=\"M720 320 A 20 20 0 0 0 700 340\"/>\n                <path d=\"M360 292 A 22 22 0 0 1 382 314\"/>\n                <rect x=\"486\" y=\"200\" width=\"96\" height=\"84\"/>\n                <path d=\"M500 292 A 16 16 0 0 0 516 276\"/>\n                <path d=\"M498 242 H568\"/>\n                <rect x=\"598\" y=\"200\" width=\"114\" height=\"84\"/>\n                <path d=\"M598 230 A 16 16 0 0 1 582 246\"/>\n              </g>\n              <g stroke=\"#111\" stroke-width=\"1\" fill=\"none\">\n                <path d=\"M150 40 V50 M150 58 V68 M270 40 V50 M270 58 V68\"/>\n                <path d=\"M154 46 H266 M154 54 H266\"/>\n                <path d=\"M560 40 V50 M560 58 V68 M660 40 V50 M660 58 V68\"/>\n                <path d=\"M564 46 H656 M564 54 H656\"/>\n                <path d=\"M48 90 H58 M66 90 H76 M48 170 H58 M66 170 H76\"/>\n                <path d=\"M54 94 V166 M62 94 V166\"/>\n                <path d=\"M340 480 V470 M340 462 V452 M450 480 V470 M450 462 V452\"/>\n                <path d=\"M344 474 H446 M344 466 H446\"/>\n                <path d=\"M720 370 H710 M702 370 H692 M720 450 H710 M702 450 H692\"/>\n                <path d=\"M714 374 V446 M706 374 V446\"/>\n              </g>\n              <g fill=\"none\" stroke=\"#c4c4c4\" stroke-width=\"1.1\">\n                <rect x=\"108\" y=\"92\" width=\"16\" height=\"48\"/>\n                <rect x=\"250\" y=\"92\" width=\"16\" height=\"48\"/>\n                <rect x=\"122\" y=\"100\" width=\"130\" height=\"32\"/>\n                <path d=\"M128 110 H246 M128 120 H246\"/>\n                <rect x=\"150\" y=\"168\" width=\"72\" height=\"32\"/>\n                <rect x=\"520\" y=\"62\" width=\"120\" height=\"78\"/>\n                <path d=\"M520 86 H640\"/>\n                <rect x=\"292\" y=\"350\" width=\"120\" height=\"72\"/>\n                <rect x=\"278\" y=\"368\" width=\"14\" height=\"22\"/>\n                <rect x=\"278\" y=\"404\" width=\"14\" height=\"22\"/>\n                <rect x=\"412\" y=\"368\" width=\"14\" height=\"22\"/>\n                <rect x=\"412\" y=\"404\" width=\"14\" height=\"22\"/>\n                <rect x=\"318\" y=\"336\" width=\"22\" height=\"14\"/>\n                <rect x=\"364\" y=\"336\" width=\"22\" height=\"14\"/>\n                <rect x=\"318\" y=\"422\" width=\"22\" height=\"14\"/>\n                <rect x=\"364\" y=\"422\" width=\"22\" height=\"14\"/>\n                <path d=\"M500 310 H700 V348 H500 Z\"/>\n                <ellipse cx=\"560\" cy=\"329\" rx=\"16\" ry=\"10\"/>\n                <rect x=\"630\" y=\"316\" width=\"36\" height=\"24\"/>\n                <circle cx=\"640\" cy=\"328\" r=\"3\"/><circle cx=\"656\" cy=\"328\" r=\"3\"/>\n                <rect x=\"612\" y=\"214\" width=\"64\" height=\"26\"/>\n                <ellipse cx=\"690\" cy=\"248\" rx=\"9\" ry=\"14\"/>\n                <circle cx=\"640\" cy=\"268\" r=\"8\"/>\n              </g>\n              <g fill=\"none\" stroke=\"#111\" stroke-width=\".8\">\n                <path d=\"M48 18 V40 M470 18 V40\"/>\n                <path d=\"M48 24 H470\"/>\n                <path d=\"M48 20 V28 M470 20 V28\"/>\n                <text x=\"259\" y=\"20\" text-anchor=\"middle\" fill=\"#111\" font-family=\"Helvetica\" font-size=\"11\">16'-0\"</text>\n                <path d=\"M470 18 V40 M724 18 V40\"/>\n                <path d=\"M470 24 H724\"/>\n                <path d=\"M470 20 V28 M724 20 V28\"/>\n                <text x=\"597\" y=\"20\" text-anchor=\"middle\" fill=\"#111\" font-family=\"Helvetica\" font-size=\"11\">9'-0\"</text>\n                <path d=\"M28 40 H48 M28 292 H48\"/>\n                <path d=\"M34 40 V292\"/>\n                <path d=\"M30 40 H38 M30 292 H38\"/>\n                <text x=\"26\" y=\"170\" text-anchor=\"middle\" fill=\"#111\" font-family=\"Helvetica\" font-size=\"11\" transform=\"rotate(-90 26 170)\">12'-0\"</text>\n                <path d=\"M28 292 H48 M28 484 H48\"/>\n                <path d=\"M34 292 V484\"/>\n                <path d=\"M30 292 H38 M30 484 H38\"/>\n                <text x=\"26\" y=\"392\" text-anchor=\"middle\" fill=\"#111\" font-family=\"Helvetica\" font-size=\"11\" transform=\"rotate(-90 26 392)\">8'-0\"</text>\n                <path d=\"M230 498 V484 M470 498 V484\"/>\n                <path d=\"M230 492 H470\"/>\n                <path d=\"M230 488 V496 M470 488 V496\"/>\n                <text x=\"350\" y=\"508\" text-anchor=\"middle\" fill=\"#111\" font-family=\"Helvetica\" font-size=\"11\">10'-6\"</text>\n                <path d=\"M736 292 H720 M736 484 H720\"/>\n                <path d=\"M730 292 V484\"/>\n                <path d=\"M726 292 H734 M726 484 H734\"/>\n                <text x=\"734\" y=\"392\" text-anchor=\"middle\" fill=\"#111\" font-family=\"Helvetica\" font-size=\"11\" transform=\"rotate(-90 734 392)\">8'-0\"</text>\n              </g>\n              <g font-family=\"Helvetica\" font-weight=\"700\" font-size=\"14\" fill=\"#fff\">\n                <rect x=\"300\" y=\"214\" width=\"118\" height=\"24\" rx=\"2\" fill=\"#1e88e5\"/><text x=\"359\" y=\"231\" text-anchor=\"middle\">GREAT ROOM</text>\n                <rect x=\"548\" y=\"78\" width=\"92\" height=\"24\" rx=\"2\" fill=\"#1e88e5\"/><text x=\"594\" y=\"95\" text-anchor=\"middle\">BEDROOM</text>\n                <rect x=\"70\" y=\"304\" width=\"62\" height=\"24\" rx=\"2\" fill=\"#1e88e5\"/><text x=\"101\" y=\"321\" text-anchor=\"middle\">ENTRY</text>\n                <rect x=\"520\" y=\"400\" width=\"84\" height=\"24\" rx=\"2\" fill=\"#1e88e5\"/><text x=\"562\" y=\"417\" text-anchor=\"middle\">KITCHEN</text>\n                <rect x=\"500\" y=\"228\" width=\"70\" height=\"22\" rx=\"2\" fill=\"#1e88e5\"/><text x=\"535\" y=\"244\" text-anchor=\"middle\" font-size=\"12\">CLOSET</text>\n                <rect x=\"640\" y=\"214\" width=\"52\" height=\"22\" rx=\"2\" fill=\"#1e88e5\"/><text x=\"666\" y=\"230\" text-anchor=\"middle\" font-size=\"12\">BATH</text>\n              </g>\n            </svg>\n            <span class=\"demo-dev sp-l\" style=\"left:12%;top:24%\"><svg viewBox=\"-16 -16 32 32\"><circle r=\"11\" fill=\"#1e88e5\" stroke=\"#0d47a1\" stroke-width=\"1.6\"/><text y=\"1.2\" font-size=\"3.3\" text-anchor=\"middle\" fill=\"#fff\" font-family=\"Helvetica\" font-weight=\"bold\">SPEAKER</text></svg><em class=\"demo-tag\">Speaker</em></span>\n            <span class=\"demo-dev sp-r\" style=\"left:38%;top:24%\"><svg viewBox=\"-16 -16 32 32\"><circle r=\"11\" fill=\"#1e88e5\" stroke=\"#0d47a1\" stroke-width=\"1.6\"/><text y=\"1.2\" font-size=\"3.3\" text-anchor=\"middle\" fill=\"#fff\" font-family=\"Helvetica\" font-weight=\"bold\">SPEAKER</text></svg><em class=\"demo-tag\">Speaker</em></span>\n            <span class=\"demo-dev wide tv\" style=\"left:24%;top:11%\"><svg viewBox=\"-40 -14 80 28\"><rect x=\"-34\" y=\"-7\" width=\"68\" height=\"14\" fill=\"#f5a623\" stroke=\"#8a5200\" stroke-width=\"2\"/></svg><em class=\"demo-tag\">TV</em></span>\n            <span class=\"demo-dev wide bar\" style=\"left:24%;top:17%\"><svg viewBox=\"-40 -14 80 28\"><rect x=\"-32\" y=\"-6\" width=\"64\" height=\"12\" fill=\"#7ed321\" stroke=\"#2e6b0a\" stroke-width=\"2\"/></svg><em class=\"demo-tag\">Soundbar</em></span>\n            <span class=\"demo-dev touch\" style=\"left:18%;top:74%\"><svg class=\"c4-mark\" viewBox=\"-18 -14 36 28\"><rect x=\"-14\" y=\"-9\" width=\"28\" height=\"18\" rx=\"2\" fill=\"#3fb6b0\" stroke=\"#14605c\" stroke-width=\"1.8\"/></svg><svg class=\"josh-mark\" viewBox=\"-16 -16 32 32\"><rect x=\"-9\" y=\"-6\" width=\"18\" height=\"12\" rx=\"2\" fill=\"#3fb6b0\" stroke=\"#14605c\" stroke-width=\"1.6\"/></svg><em class=\"demo-tag\">Control4</em></span>\n            <span class=\"demo-dev ap\" style=\"left:32%;top:42%\"><svg viewBox=\"-16 -16 32 32\"><circle r=\"11\" fill=\"#fff\" stroke=\"#e94ca8\" stroke-width=\"2.2\" stroke-dasharray=\"1.8 2.2\"/><circle r=\"3.6\" fill=\"#e94ca8\"/></svg><em class=\"demo-tag\">Wi-Fi</em></span>\n            <span class=\"demo-dev wide kp\" style=\"left:12%;top:90%\"><svg class=\"c4-mark\" viewBox=\"-22 -12 44 24\"><rect x=\"-16\" y=\"-5\" width=\"32\" height=\"10\" fill=\"#e02020\" stroke=\"#7a0000\" stroke-width=\"1.8\"/></svg><svg class=\"josh-mark\" viewBox=\"-16 -16 32 32\"><circle r=\"11\" fill=\"#3fb6b0\" stroke=\"#14605c\" stroke-width=\"1.6\"/><path d=\"M-5 0H5M-3.2 -4H3.2M-1.4 4H1.4\" stroke=\"#fff\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></svg><em class=\"demo-tag\">Keypad</em></span>\n            <span class=\"demo-dev cam\" style=\"left:86%;top:68%\"><svg class=\"fov\" viewBox=\"-48 -24 52 48\"><path d=\"M2 0 L-40 -16 L-40 16 Z\" fill=\"rgba(224,32,32,.35)\"/></svg><svg viewBox=\"-18 -16 40 32\"><rect x=\"-14\" y=\"-9\" width=\"20\" height=\"18\" rx=\"2\" fill=\"#e02020\" stroke=\"#7a0000\" stroke-width=\"1.8\"/><path d=\"M6 -6 L16 -11 V11 L6 6 Z\" fill=\"#e02020\" stroke=\"#7a0000\" stroke-width=\"1.8\"/></svg><em class=\"demo-tag\">Camera</em></span>\n            <p class=\"demo-prompt\"><span class=\"demo-prompt-text\"></span></p>\n            <div class=\"demo-cursor\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\"><path d=\"M5 3 L5 19 L9.2 15.2 L12.6 21.4 L14.8 20.4 L11.4 14.2 L17.4 14.2 Z\" fill=\"#121212\" stroke=\"#fff\" stroke-width=\"1.2\"/></svg><span class=\"demo-click\"></span></div><div class=\"demo-pop\"><div class=\"tp-h\"></div><div class=\"tp-rows\"></div><div class=\"tp-n\"></div></div><p class=\"demo-total\"><span>Total</span><b>$0</b></p>\n            </div>\n          <p class=\"demo-latest\"><span class=\"demo-latest-name\"></span><span class=\"demo-latest-price\"></span></p>";
  var FALLBACK = {
    'SP-6': { name: 'TruAudio Shadow 6.5" in-ceiling speaker', cents: 12398 },
    'PG-6': { name: 'TruAudio Phantom 6.5" in-ceiling speaker', cents: 27550 },
    'GHT-66P': { name: 'TruAudio Ghost HT in-wall LCR speaker', cents: 82650 },
    'K65XR50': { name: 'Sony BRAVIA 65" 4K TV (K65XR50)', cents: 149999 },
    'SONOS-ARC-2-BL': { name: 'Sonos Arc Ultra soundbar', cents: 109900 },
    'C4-CORE-LITE-RSK': { name: 'Control4 CORE lite + SR260 remote bundle', cents: 93635 },
    'AP6': { name: 'Alta Labs AP6 Wi-Fi 6 access point', cents: 12025 },
    'C4-KD120': { name: 'Control4 keypad dimmer, 120V', cents: 34099 },
    'UVC-G6-Pro-Turret-W': { name: 'UniFi Protect G6 Pro Turret camera', cents: 47900 },
    'J-EDG-1': { name: 'Josh Edge remote', cents: 59900 },
    'J-WHT-100': { name: 'Josh Micro (room voice endpoint)', cents: 89900 },
    'PH-ECHODOT': { name: 'Alexa smart speaker (Echo Dot)', cents: 5000 }
  };
  var SPECS = [
    { key: 'PG-6', sel: '.sp-l', role: 'speaker' },
    { key: 'PG-6', sel: '.sp-r', role: 'speaker' },
    { key: 'K65XR50', sel: '.tv', role: '' },
    { key: 'SONOS-ARC-2-BL', sel: '.bar', role: '' },
    { key: 'C4-CORE-LITE-RSK', sel: '.touch', role: 'remote' },
    { key: 'AP6', sel: '.ap', role: '' },
    { key: 'C4-KD120', sel: '.kp', role: 'keypad' },
    { key: 'UVC-G6-Pro-Turret-W', sel: '.cam', role: '' }
  ];

  function fromCatalog(catalog, key) {
    var items = catalog && catalog.items;
    var it = items && items[key];
    if (!it || it.list == null || it.list === '') return null;
    return { name: it.name, cents: Math.round(Number(it.list) * 100) };
  }

  function money(cents) {
    if (cents == null) return 'TBD';
    var safe = Math.max(0, Math.round(Number(cents) || 0));
    var dollars = Math.floor(safe / 100);
    var frac = String(safe % 100).padStart(2, '0');
    var body = '$' + dollars.toLocaleString();
    return frac === '00' ? body : body + '.' + frac;
  }

  function start(root, options) {
    if (!root || root.dataset.ready) return;
    root.dataset.ready = '1';
    if (!root.querySelector('.demo-stage')) root.insertAdjacentHTML('beforeend', MARKUP);
    var opts = options || {};
    var catalog = opts.catalog || null;
    var source = opts.source || root.getAttribute('data-demo-source') || '';
    function priced(key) {
      return fromCatalog(catalog, key) || FALLBACK[key];
    }
    var shadow = priced('SP-6');
    var phantom = priced('PG-6');
    var ghost = priced('GHT-66P');
    var joshRemote = priced('J-EDG-1');
    var joshMicro = priced('J-WHT-100');
    var echoDot = priced('PH-ECHODOT');
    var items = SPECS.map(function (spec) {
      var row = priced(spec.key);
      if (!row || row.cents == null || !shadow || !phantom || !ghost || !joshRemote || !joshMicro || !echoDot) return null;
      return { name: row.name, cents: row.cents, sel: spec.sel, role: spec.role };
    }).filter(Boolean);
    var latest = root.querySelector('.demo-latest');
    var latestName = root.querySelector('.demo-latest-name');
    var latestPrice = root.querySelector('.demo-latest-price');
    var totalEl = root.querySelector('.demo-total b');
    var promptEl = root.querySelector('.demo-prompt');
    var promptText = root.querySelector('.demo-prompt-text');
    var popEl = root.querySelector('.demo-pop');
    var popHead = root.querySelector('.demo-pop .tp-h');
    var popRows = root.querySelector('.demo-pop .tp-rows');
    var popNote = root.querySelector('.demo-pop .tp-n');
    var cursorEl = root.querySelector('.demo-cursor');
    var shownKey = '';
    var popKind = '';
    var dots = items.map(function (it) { return root.querySelector(it.sel); }).filter(Boolean);
    var DROP = 800, TICK = 260, TYPE = 800, BEAT = 400, FADE = 400;
    var N = items.length;
    var LAND = DROP * N;
    var P1 = LAND + 1200;
    var P1_APPLY = P1 + 2820;
    var P2 = P1_APPLY + BEAT + 700;
    var P2_APPLY = P2 + 2720;
    var CYCLE = P2_APPLY + BEAT + 1800 + FADE;
    function rowCents(it, mode) {
      if (it.role === 'speaker' && mode.upgraded) return ghost.cents;
      if (it.role === 'remote' && mode.josh) return joshRemote.cents;
      if (it.role === 'keypad' && mode.josh) return joshMicro.cents;
      return it.cents;
    }
    function rowName(it, mode) {
      if (it.role === 'speaker' && mode.upgraded) return ghost.name;
      if (it.role === 'remote' && mode.josh) return joshRemote.name;
      if (it.role === 'keypad' && mode.josh) return joshMicro.name;
      return it.name;
    }
    function sumTo(n, mode) {
      var total = 0;
      var cap = Math.max(0, Math.min(N, n));
      for (var i = 0; i < cap; i++) total += rowCents(items[i], mode);
      return total;
    }
    function paint(elapsed) {
      var span = Math.max(1, CYCLE);
      var t = ((elapsed % span) + span) % span;
      var fading = t >= CYCLE - FADE;
      var step = fading ? 0 : Math.min(N, Math.floor(t / DROP));
      var base = { upgraded: false, josh: false };
      var speakers = { upgraded: true, josh: false };
      var swapped = { upgraded: true, josh: true };
      var mode = base;
      if (!fading && t >= P2_APPLY) mode = swapped;
      else if (!fading && t >= P1_APPLY) mode = speakers;
      var into = t - step * DROP;
      var p1 = t - P1_APPLY;
      var p2 = t - P2_APPLY;
      var from = 0, to = 0, u = 1;
      if (fading || step === 0) {
        from = 0; to = 0; u = 1;
      } else if (p2 >= 0 && p2 < BEAT) {
        from = sumTo(N, speakers); to = sumTo(N, swapped); u = p2 / BEAT;
      } else if (p1 >= 0 && p1 < BEAT) {
        from = sumTo(N, base); to = sumTo(N, speakers); u = p1 / BEAT;
      } else if (t < P1 && into < TICK) {
        from = sumTo(step - 1, base); to = sumTo(step, base); u = into / TICK;
      } else {
        from = sumTo(step, mode); to = from; u = 1;
      }
      u = Math.max(0, Math.min(1, u));
      var lo = Math.min(from, to), hi = Math.max(from, to);
      var display = Math.round(Math.max(lo, Math.min(hi, from + (to - from) * u)));
      root.classList.toggle('is-reset', fading);
      dots.forEach(function (dot, i) {
        dot.classList.toggle('on', !fading && i < step);
        dot.classList.toggle('pulse', !fading && items[i].role === 'speaker' && p1 >= 0 && p1 < 600);
        if (items[i].role === 'remote' || items[i].role === 'keypad') dot.classList.toggle('is-josh', !fading && mode.josh);
        var tag = dot.querySelector('.demo-tag');
        if (tag && items[i].role === 'remote') tag.textContent = mode.josh ? 'Josh' : 'Control4';
        if (tag && items[i].role === 'keypad') tag.textContent = mode.josh ? 'Josh' : 'Keypad';
      });
      var focus = null;
      if (!fading && step > 0) {
        if (t >= P2_APPLY) focus = { name: joshRemote.name, cents: joshRemote.cents };
        else if (t >= P1_APPLY) focus = { name: ghost.name, cents: ghost.cents };
        else focus = { name: rowName(items[step - 1], mode), cents: rowCents(items[step - 1], mode) };
      }
      var key = focus ? focus.name + '|' + focus.cents : '';
      if (latest && key !== shownKey) {
        shownKey = key;
        if (latestName) latestName.textContent = focus ? focus.name : '';
        if (latestPrice) latestPrice.textContent = focus ? money(focus.cents) : '';
        latest.classList.remove('is-swap');
        if (focus) {
          void latest.offsetWidth;
          latest.classList.add('is-swap');
        }
      }
      var prompt = '';
      var typeStart = 0;
      if (!fading && t >= P1 && t < P1_APPLY + BEAT) { prompt = 'Upgrade the speakers'; typeStart = P1; }
      else if (!fading && t >= P2 && t < P2_APPLY + BEAT) { prompt = 'Switch from Control4 to Josh.ai'; typeStart = P2; }
      if (promptEl) promptEl.classList.toggle('on', !!prompt);
      if (promptText) {
        if (!prompt) promptText.textContent = '';
        else {
          var typed = Math.min(prompt.length, Math.max(1, Math.ceil((t - typeStart) / TYPE * prompt.length)));
          promptText.textContent = prompt.slice(0, typed) + (typed < prompt.length ? '|' : '');
        }
      }
      var pop = '';
      var selected = '';
      var hot = '';
      var clicking = false;
      var cursor = null;
      function ease(v){ v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); }
      function glide(t0, t1, ax, ay, bx, by){
        if (t < t0 || t >= t1) return null;
        var k = ease((t - t0) / (t1 - t0));
        return { x: ax + (bx - ax) * k, y: ay + (by - ay) * k };
      }
      if (!fading && t >= P1 && t < P1_APPLY + 160) {
        pop = 'speakers';
        var a = t - P1;
        selected = a < 2600 ? 'better' : 'best';
        hot = (a >= 700 && a < 1900) ? 'better' : (a >= 2600 ? 'best' : '');
        clicking = a >= 2600 && a < 2820;
        cursor = glide(P1, P1 + 700, 16, 18, 30, 108) || glide(P1 + 700, P1 + 1900, 30, 108, 30, 108) || glide(P1 + 1900, P1 + 2600, 30, 108, 30, 140) || { x: 30, y: 140 };
      } else if (!fading && t >= P2 && t < P2_APPLY + 160) {
        pop = 'platform';
        var b = t - P2;
        selected = b < 2500 ? 'c4' : 'josh';
        hot = (b >= 700 && b < 1600) ? 'c4' : (b >= 2500 ? 'josh' : '');
        clicking = (b >= 1400 && b < 1600) || (b >= 2500 && b < 2720);
        cursor = glide(P2, P2 + 700, 16, 18, 30, 76) || glide(P2 + 700, P2 + 1600, 30, 76, 30, 76) || glide(P2 + 1600, P2 + 2500, 30, 76, 30, 108) || { x: 30, y: 108 };
      }
      if (popEl) {
        popEl.classList.toggle('on', !!pop);
        if (pop && popKind !== pop) {
          popKind = pop;
          var rows = pop === 'speakers'
            ? [
              { id: 'good', tier: 'Good', name: shadow.name, price: money(shadow.cents) },
              { id: 'better', tier: 'Better', name: phantom.name, price: money(phantom.cents) },
              { id: 'best', tier: 'Best', name: ghost.name, price: money(ghost.cents) }
            ]
            : [
              { id: 'c4', tier: 'Control4', name: 'CORE lite + keypad', price: money(rowCents(items.filter(function (it) { return it.role === 'remote'; })[0], base) + rowCents(items.filter(function (it) { return it.role === 'keypad'; })[0], base)) },
              { id: 'josh', tier: 'Josh.ai', name: 'Edge remote + Micro', price: money(joshRemote.cents + joshMicro.cents) },
              { id: 'alexa', tier: 'Alexa', name: 'Echo Dot', price: money(echoDot.cents) }
            ];
          if (popHead) popHead.textContent = pop === 'speakers' ? 'Choose a tier' : 'Choose a platform';
          if (popRows) popRows.innerHTML = rows.map(function (row) {
            return '<button type="button" data-id="' + row.id + '"><b>' + row.tier + '</b><span>' + row.name + '</span><em>' + row.price + '</em></button>';
          }).join('');
          if (popNote) popNote.textContent = pop === 'speakers' ? 'Best uses an in-wall speaker, the closest match for a ceiling pair.' : '';
        }
        if (!pop) popKind = '';
        if (popRows) popRows.querySelectorAll('button').forEach(function (btn) {
          var id = btn.getAttribute('data-id');
          btn.classList.toggle('on', id === selected);
          btn.classList.toggle('hover', id === hot);
          btn.classList.toggle('click', clicking && id === selected);
        });
      }
      if (cursorEl) {
        var showCursor = !!cursor && !fading;
        cursorEl.classList.toggle('on', showCursor);
        cursorEl.classList.toggle('clicking', showCursor && clicking);
        if (cursor) { cursorEl.style.left = cursor.x + 'px'; cursorEl.style.top = cursor.y + 'px'; }
      }
      if (totalEl) totalEl.textContent = money(fading ? 0 : display);
    }
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !items.length) {
      paint(P2_APPLY + BEAT + 200);
    } else {
      var timers = [];
      var raf = 0;
      var last = 0;
      function show(elapsed) {
        var safe = Number.isFinite(elapsed) ? elapsed : last;
        if (safe < 0) safe = 0;
        if (safe < last) safe = last;
        last = safe;
        paint(safe);
      }
      function kick() {
        timers.forEach(clearTimeout);
        if (raf) cancelAnimationFrame(raf);
        timers = [];
        last = 0;
        paint(0);
        var marks = [P1, P1 + 400, P1_APPLY, P1_APPLY + BEAT, P2, P2 + 400, P2_APPLY, P2_APPLY + BEAT, CYCLE - FADE - 50];
        for (var i = 1; i <= N; i++) { marks.push(DROP * i); marks.push(DROP * i + TICK); }
        marks.forEach(function (at) { timers.push(setTimeout(function () { show(at); }, at)); });
        timers.push(setTimeout(kick, CYCLE));
        var prev = null;
        var origin = performance.now();
        function loop(now) {
          if (prev === null) prev = now;
          var delta = now - prev;
          prev = now;
          if (Number.isFinite(delta) && delta >= 0 && delta < 2000) show(now - origin);
          raf = requestAnimationFrame(loop);
        }
        raf = requestAnimationFrame(loop);
      }
      kick();
    }
    function track() {
      if (!window.tymTrack) return;
      if (source === 'home') window.tymTrack('demo_viewed', { source: 'home' });
      else window.tymTrack('demo_viewed');
    }
    if ('IntersectionObserver' in window) {
      var watch = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) { track(); watch.disconnect(); }
      }, { threshold: 0.35 });
      watch.observe(root);
    } else track();
  }

  window.tymStartSaleDemo = start;
})();
