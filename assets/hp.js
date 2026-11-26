/* Homepage variant events. Reads the tym_hp cookie. Posts to /api/event. */
(function () {
  function variant() {
    var match = document.cookie.match(/(?:^|; )tym_hp=(a|b)(?:;|$)/);
    return match ? match[1] : '';
  }

  function track(name) {
    if (!name) return;
    var body = JSON.stringify({
      name: name,
      variant: variant(),
      path: location.pathname || '/'
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' }));
        return;
      }
    } catch (e) {}
    fetch('/api/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: body,
      keepalive: true
    }).catch(function () {});
  }

  window.tymTrack = track;
  window.tymHpVariant = variant;

  document.addEventListener('click', function (event) {
    var el = event.target && event.target.closest ? event.target.closest('[data-hp]') : null;
    if (!el) return;
    var kind = el.getAttribute('data-hp');
    if (kind === 'hero') track('hero_cta_click');
    else if (kind === 'secondary') track('secondary_link_click');
  });

  if (!document.body || !document.body.classList.contains('hp')) return;
  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;
  function closeMenu() {
    menu.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', function () {
    if (menu.classList.contains('open')) closeMenu();
    else {
      menu.classList.add('open');
      toggle.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    }
  });
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });
})();
