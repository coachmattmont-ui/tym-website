/* Shared floor-plan sales demo. List prices match the Layout catalog. */
(function () {
  var MARKUP = "<div class=\"demo-stage\">\n            <svg class=\"plan-svg\" viewBox=\"0 0 760 520\" role=\"img\" aria-label=\"Invented floor plan with an entry, great room, kitchen, bedroom, closet, and bath\">\n              <rect width=\"760\" height=\"520\" fill=\"#fff\"/>\n              <g fill=\"#111\">\n                <rect x=\"48\" y=\"40\" width=\"102\" height=\"4\"/>\n                <rect x=\"270\" y=\"40\" width=\"290\" height=\"4\"/>\n                <rect x=\"660\" y=\"40\" width=\"64\" height=\"4\"/>\n                <rect x=\"48\" y=\"480\" width=\"42\" height=\"4\"/>\n                <rect x=\"150\" y=\"480\" width=\"190\" height=\"4\"/>\n                <rect x=\"450\" y=\"480\" width=\"274\" height=\"4\"/>\n                <rect x=\"48\" y=\"40\" width=\"4\" height=\"50\"/>\n                <rect x=\"48\" y=\"170\" width=\"4\" height=\"314\"/>\n                <rect x=\"720\" y=\"40\" width=\"4\" height=\"260\"/>\n                <rect x=\"720\" y=\"350\" width=\"4\" height=\"20\"/>\n                <rect x=\"720\" y=\"450\" width=\"4\" height=\"34\"/>\n                <rect x=\"48\" y=\"292\" width=\"112\" height=\"4\"/>\n                <rect x=\"210\" y=\"292\" width=\"250\" height=\"4\"/>\n                <rect x=\"470\" y=\"292\" width=\"254\" height=\"4\"/>\n                <rect x=\"470\" y=\"40\" width=\"4\" height=\"150\"/>\n                <rect x=\"470\" y=\"240\" width=\"4\" height=\"80\"/>\n                <rect x=\"470\" y=\"380\" width=\"4\" height=\"104\"/>\n                <rect x=\"230\" y=\"296\" width=\"4\" height=\"64\"/>\n                <rect x=\"230\" y=\"410\" width=\"4\" height=\"74\"/>\n              </g>\n              <g fill=\"none\" stroke=\"#111\" stroke-width=\"1.15\">\n                <path d=\"M160 292 A 24 24 0 0 0 184 316\"/>\n                <path d=\"M470 220 A 20 20 0 0 0 490 200\"/>\n                <path d=\"M90 480 A 28 28 0 0 0 118 452\"/>\n                <path d=\"M720 320 A 20 20 0 0 0 700 340\"/>\n                <path d=\"M360 292 A 22 22 0 0 1 382 314\"/>\n                <rect x=\"486\" y=\"200\" width=\"96\" height=\"84\"/>\n                <path d=\"M500 292 A 16 16 0 0 0 516 276\"/>\n                <path d=\"M498 242 H568\"/>\n                <rect x=\"598\" y=\"200\" width=\"114\" height=\"84\"/>\n                <path d=\"M598 230 A 16 16 0 0 1 582 246\"/>\n              </g>\n              <g stroke=\"#111\" stroke-width=\"1\" fill=\"none\">\n                <path d=\"M150 40 V50 M150 58 V68 M270 40 V50 M270 58 V68\"/>\n                <path d=\"M154 46 H266 M154 54 H266\"/>\n                <path d=\"M560 40 V50 M560 58 V68 M660 40 V50 M660 58 V68\"/>\n                <path d=\"M564 46 H656 M564 54 H656\"/>\n                <path d=\"M48 90 H58 M66 90 H76 M48 170 H58 M66 170 H76\"/>\n                <path d=\"M54 94 V166 M62 94 V166\"/>\n                <path d=\"M340 480 V470 M340 462 V452 M450 480 V470 M450 462 V452\"/>\n                <path d=\"M344 474 H446 M344 466 H446\"/>\n                <path d=\"M720 370 H710 M702 370 H692 M720 450 H710 M702 450 H692\"/>\n                <path d=\"M714 374 V446 M706 374 V446\"/>\n              </g>\n              <g fill=\"none\" stroke=\"#c4c4c4\" stroke-width=\"1.1\">\n                <rect x=\"108\" y=\"92\" width=\"16\" height=\"48\"/>\n                <rect x=\"250\" y=\"92\" width=\"16\" height=\"48\"/>\n                <rect x=\"122\" y=\"100\" width=\"130\" height=\"32\"/>\n                <path d=\"M128 110 H246 M128 120 H246\"/>\n                <rect x=\"150\" y=\"168\" width=\"72\" height=\"32\"/>\n                <rect x=\"520\" y=\"62\" width=\"120\" height=\"78\"/>\n                <path d=\"M520 86 H640\"/>\n                <rect x=\"292\" y=\"350\" width=\"120\" height=\"72\"/>\n                <rect x=\"278\" y=\"368\" width=\"14\" height=\"22\"/>\n                <rect x=\"278\" y=\"404\" width=\"14\" height=\"22\"/>\n                <rect x=\"412\" y=\"368\" width=\"14\" height=\"22\"/>\n                <rect x=\"412\" y=\"404\" width=\"14\" height=\"22\"/>\n                <rect x=\"318\" y=\"336\" width=\"22\" height=\"14\"/>\n                <rect x=\"364\" y=\"336\" width=\"22\" height=\"14\"/>\n                <rect x=\"318\" y=\"422\" width=\"22\" height=\"14\"/>\n                <rect x=\"364\" y=\"422\" width=\"22\" height=\"14\"/>\n                <path d=\"M500 310 H700 V348 H500 Z\"/>\n                <ellipse cx=\"560\" cy=\"329\" rx=\"16\" ry=\"10\"/>\n                <rect x=\"630\" y=\"316\" width=\"36\" height=\"24\"/>\n                <circle cx=\"640\" cy=\"328\" r=\"3\"/><circle cx=\"656\" cy=\"328\" r=\"3\"/>\n                <rect x=\"612\" y=\"214\" width=\"64\" height=\"26\"/>\n                <ellipse cx=\"690\" cy=\"248\" rx=\"9\" ry=\"14\"/>\n                <circle cx=\"640\" cy=\"268\" r=\"8\"/>\n              </g>\n              <g fill=\"none\" stroke=\"#111\" stroke-width=\".8\">\n                <path d=\"M48 18 V40 M470 18 V40\"/>\n                <path d=\"M48 24 H470\"/>\n                <path d=\"M48 20 V28 M470 20 V28\"/>\n                <text x=\"259\" y=\"20\" text-anchor=\"middle\" fill=\"#111\" font-family=\"Helvetica\" font-size=\"11\">16'-0\"</text>\n                <path d=\"M470 18 V40 M724 18 V40\"/>\n                <path d=\"M470 24 H724\"/>\n                <path d=\"M470 20 V28 M724 20 V28\"/>\n                <text x=\"597\" y=\"20\" text-anchor=\"middle\" fill=\"#111\" font-family=\"Helvetica\" font-size=\"11\">9'-0\"</text>\n                <path d=\"M28 40 H48 M28 292 H48\"/>\n                <path d=\"M34 40 V292\"/>\n                <path d=\"M30 40 H38 M30 292 H38\"/>\n                <text x=\"26\" y=\"170\" text-anchor=\"middle\" fill=\"#111\" font-family=\"Helvetica\" font-size=\"11\" transform=\"rotate(-90 26 170)\">12'-0\"</text>\n                <path d=\"M28 292 H48 M28 484 H48\"/>\n                <path d=\"M34 292 V484\"/>\n                <path d=\"M30 292 H38 M30 484 H38\"/>\n                <text x=\"26\" y=\"392\" text-anchor=\"middle\" fill=\"#111\" font-family=\"Helvetica\" font-size=\"11\" transform=\"rotate(-90 26 392)\">8'-0\"</text>\n                <path d=\"M230 498 V484 M470 498 V484\"/>\n                <path d=\"M230 492 H470\"/>\n                <path d=\"M230 488 V496 M470 488 V496\"/>\n                <text x=\"350\" y=\"508\" text-anchor=\"middle\" fill=\"#111\" font-family=\"Helvetica\" font-size=\"11\">10'-6\"</text>\n                <path d=\"M736 292 H720 M736 484 H720\"/>\n                <path d=\"M730 292 V484\"/>\n                <path d=\"M726 292 H734 M726 484 H734\"/>\n                <text x=\"734\" y=\"392\" text-anchor=\"middle\" fill=\"#111\" font-family=\"Helvetica\" font-size=\"11\" transform=\"rotate(-90 734 392)\">8'-0\"</text>\n              </g>\n              <g font-family=\"Helvetica\" font-weight=\"700\" font-size=\"14\" fill=\"#fff\">\n                <rect x=\"300\" y=\"214\" width=\"118\" height=\"24\" rx=\"2\" fill=\"#1e88e5\"/><text x=\"359\" y=\"231\" text-anchor=\"middle\">GREAT ROOM</text>\n                <rect x=\"548\" y=\"78\" width=\"92\" height=\"24\" rx=\"2\" fill=\"#1e88e5\"/><text x=\"594\" y=\"95\" text-anchor=\"middle\">BEDROOM</text>\n                <rect x=\"70\" y=\"304\" width=\"62\" height=\"24\" rx=\"2\" fill=\"#1e88e5\"/><text x=\"101\" y=\"321\" text-anchor=\"middle\">ENTRY</text>\n                <rect x=\"520\" y=\"400\" width=\"84\" height=\"24\" rx=\"2\" fill=\"#1e88e5\"/><text x=\"562\" y=\"417\" text-anchor=\"middle\">KITCHEN</text>\n                <rect x=\"500\" y=\"228\" width=\"70\" height=\"22\" rx=\"2\" fill=\"#1e88e5\"/><text x=\"535\" y=\"244\" text-anchor=\"middle\" font-size=\"12\">CLOSET</text>\n                <rect x=\"640\" y=\"214\" width=\"52\" height=\"22\" rx=\"2\" fill=\"#1e88e5\"/><text x=\"666\" y=\"230\" text-anchor=\"middle\" font-size=\"12\">BATH</text>\n              </g>\n            </svg>\n            <span class=\"demo-dev sp-l\" style=\"left:12%;top:24%\"><svg viewBox=\"-16 -16 32 32\"><circle r=\"11\" fill=\"#1e88e5\" stroke=\"#0d47a1\" stroke-width=\"1.6\"/><text y=\"1.2\" font-size=\"3.3\" text-anchor=\"middle\" fill=\"#fff\" font-family=\"Helvetica\" font-weight=\"bold\">SPEAKER</text></svg><em class=\"demo-tag\">Speaker</em></span>\n            <span class=\"demo-dev sp-r\" style=\"left:38%;top:24%\"><svg viewBox=\"-16 -16 32 32\"><circle r=\"11\" fill=\"#1e88e5\" stroke=\"#0d47a1\" stroke-width=\"1.6\"/><text y=\"1.2\" font-size=\"3.3\" text-anchor=\"middle\" fill=\"#fff\" font-family=\"Helvetica\" font-weight=\"bold\">SPEAKER</text></svg><em class=\"demo-tag\">Speaker</em></span>\n            <span class=\"demo-dev wide tv\" style=\"left:24%;top:11%\"><svg viewBox=\"-40 -14 80 28\"><rect x=\"-34\" y=\"-7\" width=\"68\" height=\"14\" fill=\"#f5a623\" stroke=\"#8a5200\" stroke-width=\"2\"/></svg><em class=\"demo-tag\">TV</em></span>\n            <span class=\"demo-dev wide bar\" style=\"left:24%;top:17%\"><svg viewBox=\"-40 -14 80 28\"><rect x=\"-32\" y=\"-6\" width=\"64\" height=\"12\" fill=\"#7ed321\" stroke=\"#2e6b0a\" stroke-width=\"2\"/></svg><em class=\"demo-tag\">Soundbar</em></span>\n            <span class=\"demo-dev touch\" style=\"left:18%;top:74%\"><svg viewBox=\"-18 -14 36 28\"><rect x=\"-14\" y=\"-9\" width=\"28\" height=\"18\" rx=\"2\" fill=\"#3fb6b0\" stroke=\"#14605c\" stroke-width=\"1.8\"/></svg><em class=\"demo-tag\">Remote</em></span>\n            <span class=\"demo-dev ap\" style=\"left:32%;top:42%\"><svg viewBox=\"-16 -16 32 32\"><circle r=\"11\" fill=\"#fff\" stroke=\"#e94ca8\" stroke-width=\"2.2\" stroke-dasharray=\"1.8 2.2\"/><circle r=\"3.6\" fill=\"#e94ca8\"/></svg><em class=\"demo-tag\">Wi-Fi</em></span>\n            <span class=\"demo-dev wide kp\" style=\"left:12%;top:90%\"><svg viewBox=\"-22 -12 44 24\"><rect x=\"-16\" y=\"-5\" width=\"32\" height=\"10\" fill=\"#e02020\" stroke=\"#7a0000\" stroke-width=\"1.8\"/></svg><em class=\"demo-tag\">Keypad</em></span>\n            <span class=\"demo-dev cam\" style=\"left:86%;top:68%\"><svg class=\"fov\" viewBox=\"-48 -24 52 48\"><path d=\"M2 0 L-40 -16 L-40 16 Z\" fill=\"rgba(224,32,32,.35)\"/></svg><svg viewBox=\"-18 -16 40 32\"><rect x=\"-14\" y=\"-9\" width=\"20\" height=\"18\" rx=\"2\" fill=\"#e02020\" stroke=\"#7a0000\" stroke-width=\"1.8\"/><path d=\"M6 -6 L16 -11 V11 L6 6 Z\" fill=\"#e02020\" stroke=\"#7a0000\" stroke-width=\"1.8\"/></svg><em class=\"demo-tag\">Camera</em></span>\n          </div>\n          <div class=\"demo-bill\">\n            <p class=\"demo-total\"><span class=\"side-kicker\">Package total</span><b id=\"demoTotal\">$0</b></p>\n            <p class=\"demo-count\" id=\"demoCount\"></p>\n            <ol class=\"demo-lines\" id=\"demoLines\"></ol>\n          </div>";
  var FALLBACK = {
    'PG-6': { name: 'TruAudio Phantom 6.5" in-ceiling speaker', cents: 27550 },
    'K65XR50': { name: 'Sony BRAVIA 65" 4K TV (K65XR50)', cents: 149999 },
    'SONOS-ARC-2-BL': { name: 'Sonos Arc Ultra soundbar', cents: 109900 },
    'J-EDG-1': { name: 'Josh Edge remote', cents: 59900 },
    'AP6': { name: 'Alta Labs AP6 Wi-Fi 6 access point', cents: 12025 },
    'C4-KD120': { name: 'Control4 keypad dimmer, 120V', cents: 34099 },
    'UVC-G6-Pro-Turret-W': { name: 'UniFi Protect G6 Pro Turret camera', cents: 47900 }
  };
  var SPECS = [
    { key: 'PG-6', sel: '.sp-l' },
    { key: 'PG-6', sel: '.sp-r' },
    { key: 'K65XR50', sel: '.tv' },
    { key: 'SONOS-ARC-2-BL', sel: '.bar' },
    { key: 'J-EDG-1', sel: '.touch' },
    { key: 'AP6', sel: '.ap' },
    { key: 'C4-KD120', sel: '.kp' },
    { key: 'UVC-G6-Pro-Turret-W', sel: '.cam' }
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
    var items = SPECS.map(function (spec) {
      var priced = fromCatalog(catalog, spec.key) || FALLBACK[spec.key];
      if (!priced || priced.cents == null) return null;
      return { name: priced.name, cents: priced.cents, sel: spec.sel };
    }).filter(Boolean);
    var lines = root.querySelector('.demo-lines');
    var totalEl = root.querySelector('.demo-total b');
    var countEl = root.querySelector('.demo-count');
    var dots = items.map(function (it) { return root.querySelector(it.sel); }).filter(Boolean);
    function sumTo(n) {
      var total = 0;
      var cap = Math.max(0, Math.min(items.length, n));
      for (var i = 0; i < cap; i++) total += items[i].cents || 0;
      return total;
    }
    var STEP = 1000, TICK = 280, HOLD = 4000, FADE = 500;
    var LAND = STEP * items.length;
    var CYCLE = LAND + HOLD + FADE;
    function paint(elapsed) {
      var span = Math.max(1, CYCLE);
      var t = ((elapsed % span) + span) % span;
      var fading = t >= LAND + HOLD;
      var step = 0;
      var into = 0;
      if (!fading) {
        step = Math.max(0, Math.min(items.length, Math.floor(t / STEP)));
        into = t - step * STEP;
        if (step > 0 && step < items.length && into === 0) { step -= 1; into = STEP; }
      }
      var prev = sumTo(Math.max(0, step - 1));
      var next = sumTo(step);
      var u = step === 0 ? 1 : Math.max(0, Math.min(1, into / TICK));
      var raw = prev + (next - prev) * u;
      var lo = Math.min(prev, next);
      var hi = Math.max(prev, next);
      var display = Math.round(Math.max(lo, Math.min(hi, raw)));
      root.classList.toggle('is-reset', fading);
      dots.forEach(function (dot, i) { dot.classList.toggle('on', !fading && i < step); });
      var shown = items.slice(0, step);
      if (countEl) countEl.textContent = shown.length ? shown.length + (shown.length === 1 ? ' item' : ' items') : '';
      if (lines) {
        var tail = shown.slice(-4);
        var offset = shown.length - tail.length;
        lines.innerHTML = tail.map(function (it, i) {
          return '<li' + (offset + i === shown.length - 1 ? ' class="flash"' : '') + '><span>' + it.name + '</span><span>' + money(it.cents) + '</span></li>';
        }).join('');
      }
      if (totalEl) totalEl.textContent = money(fading ? 0 : display);
    }
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !items.length) {
      paint(LAND + HOLD - 1);
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
        var marks = [];
        for (var i = 1; i <= items.length; i++) { marks.push(STEP * i); marks.push(STEP * i + TICK); }
        marks.push(LAND + Math.min(500, HOLD - 1));
        marks.push(LAND + HOLD - 1);
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
