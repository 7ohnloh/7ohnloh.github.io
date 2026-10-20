// Case studies: reading progress bar and an "On this page" menu built from the section headings.
(function () {
  var bar = document.createElement('div');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<span></span>';
  document.body.appendChild(bar);
  var fill = bar.firstChild;
  function update() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    fill.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  var rail = document.querySelector('.rail');
  var headings = Array.prototype.slice.call(document.querySelectorAll('.cs-section > h2[id]'));
  if (!rail || headings.length < 2) return;
  var nav = document.createElement('nav');
  nav.className = 'toc cs-toc';
  nav.setAttribute('aria-label', 'On this page');
  var title = document.createElement('p');
  title.className = 'eyebrow';
  title.textContent = 'On this page';
  var links = headings.map(function (h) {
    var a = document.createElement('a');
    a.href = '#' + h.id;
    var eyebrow = h.parentElement.querySelector('.eyebrow');
    a.textContent = eyebrow ? eyebrow.textContent.replace(/^My part · /, '') : h.textContent;
    nav.appendChild(a);
    return a;
  });
  var wrap = document.createElement('div');
  wrap.className = 'cs-toc-wrap';
  wrap.appendChild(title);
  wrap.appendChild(nav);
  rail.appendChild(wrap);
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var active = links[headings.indexOf(entry.target)];
        if (active) active.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    headings.forEach(function (h) { observer.observe(h); });
  }
})();

// Before/after sliders.
document.querySelectorAll('[data-compare]').forEach(function (fig) {
  var frame = fig.querySelector('.cs-frame');
  var range = fig.querySelector('.cs-range');
  if (!frame || !range) return;
  function set() { frame.style.setProperty('--pos', range.value + '%'); }
  range.addEventListener('input', set);
  set();
});

// Contrast checker: WCAG 2.x relative luminance and contrast ratio.
(function () {
  var box = document.querySelector('[data-contrast]');
  if (!box) return;
  var fg = box.querySelector('#cd-fg'), bg = box.querySelector('#cd-bg');
  var preview = box.querySelector('.cd-preview');
  function lum(hex) {
    var c = [1, 3, 5].map(function (i) { return parseInt(hex.substr(i, 2), 16) / 255; })
      .map(function (v) { return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function update() {
    var a = lum(fg.value), b = lum(bg.value);
    var ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    preview.style.setProperty('--cd-fg', fg.value);
    preview.style.setProperty('--cd-bg', bg.value);
    box.querySelector('#cd-fg-hex').textContent = fg.value.toUpperCase();
    box.querySelector('#cd-bg-hex').textContent = bg.value.toUpperCase();
    box.querySelector('#cd-ratio').textContent = (Math.floor(ratio * 100) / 100).toFixed(2);
    box.querySelectorAll('.cd-checks li').forEach(function (li) {
      li.classList.toggle('pass', ratio >= parseFloat(li.getAttribute('data-min')));
    });
  }
  fg.addEventListener('input', update);
  bg.addEventListener('input', update);
  box.querySelectorAll('.cd-presets button[data-fg]').forEach(function (btn) {
    btn.addEventListener('click', function () { fg.value = btn.getAttribute('data-fg'); bg.value = btn.getAttribute('data-bg'); update(); });
  });
  box.querySelector('.cd-swap').addEventListener('click', function () { var t = fg.value; fg.value = bg.value; bg.value = t; update(); });
  update();
})();

// NomQuest A/B chart: switch between satisfaction and ease.
(function () {
  var fig = document.querySelector('[data-ab]');
  if (!fig) return;
  var data = JSON.parse(fig.getAttribute('data-ab'));
  var nA = +fig.getAttribute('data-na'), nB = +fig.getAttribute('data-nb'), MAX = 40;
  var captions = {
    sat: 'Satisfaction: both groups gave high scores equally often, but a quarter of Version A gave a low score, against one in eighteen for Version B.',
    ease: 'Ease: Version B had more high scores, and twice the share of perfect 7s (28% against 14%).'
  };
  function pct(c, n) { return Math.round(100 * c / n); }
  function sum(arr, from, to) { return arr.slice(from, to).reduce(function (a, b) { return a + b; }, 0); }
  function show(metric) {
    var d = data[metric];
    fig.querySelectorAll('.ab-bar').forEach(function (bar) {
      var i = +bar.getAttribute('data-i'), v = bar.getAttribute('data-v');
      var p = pct(d[v][i], v === 'a' ? nA : nB);
      bar.style.setProperty('--h', (Math.min(p, MAX) / MAX * 100).toFixed(1) + '%');
      bar.querySelector('em').textContent = p + '%';
      bar.setAttribute('title', (v === 'a' ? 'Version A' : 'Version B') + ', score ' + (i + 1) + ': ' + p + '% (' + d[v][i] + ' people)');
    });
    fig.querySelector('.ab-low-a').textContent = pct(sum(d.a, 0, 3), nA) + '%';
    fig.querySelector('.ab-low-b').textContent = pct(sum(d.b, 0, 3), nB) + '%';
    fig.querySelector('.ab-high-a').textContent = pct(sum(d.a, 4, 7), nA) + '%';
    fig.querySelector('.ab-high-b').textContent = pct(sum(d.b, 4, 7), nB) + '%';
    fig.querySelector('.ab-caption').textContent = captions[metric];
    fig.querySelectorAll('.ab-toggle button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-metric') === metric)); });
  }
  fig.querySelectorAll('.ab-toggle button').forEach(function (b) {
    b.addEventListener('click', function () { show(b.getAttribute('data-metric')); });
  });
  show('sat');
})();
