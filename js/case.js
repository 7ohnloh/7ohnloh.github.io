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

// GrantPal demos share this: skip the step-by-step animation when motion is reduced.
var calmMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// GrantPal CheckerPal demo: sample projects checked against a sample grant. Met counts 1, partly 0.5.
(function () {
  var box = document.querySelector('[data-checker]');
  if (!box) return;
  var projects = {
    cards: {
      summary: 'A conversation card game for schools and workplaces. About 450 players over 9 months, asking for $15,000.',
      results: [
        ['met', 'Registered as a social enterprise, according to the project document.'],
        ['met', 'Each round asks players to share stories about their culture and faith.'],
        ['part', 'Plans for about 450 players. One more partner school would clear 500.'],
        ['met', 'Runs over 9 months.'],
        ['met', 'Asks for $15,000.']
      ],
      verdict: 'Strong match. Worth applying, once the reach gap is closed.'
    },
    visits: {
      summary: 'Guided virtual visits to places of worship for community groups. About 1,500 viewers over 18 months, asking for $26,000.',
      results: [
        ['met', 'Registered as a social enterprise, according to the project document.'],
        ['met', 'Visits cover temples, mosques, churches and gurdwaras.'],
        ['met', 'Plans for about 1,500 viewers.'],
        ['no', 'Planned over 18 months. Splitting it into two phases would fit.'],
        ['part', 'Asks for $26,000. Phase one alone could come in under $20,000.']
      ],
      verdict: 'Possible match. Phase the project to fit the timeline and the budget.'
    }
  };
  var current = 'cards', running = false;
  var items = box.querySelectorAll('.ck-reqs li');
  var run = box.querySelector('.ck-run');
  var meter = box.querySelector('.ck-meter span');
  var pct = box.querySelector('#ck-pct'), verdict = box.querySelector('#ck-verdict');
  function reset() {
    items.forEach(function (li) { li.removeAttribute('data-s'); li.querySelector('p').textContent = ''; });
    meter.style.setProperty('--pct', '0%');
    pct.textContent = '–';
    verdict.textContent = 'Run the check to see the match.';
    run.textContent = 'Check eligibility';
    box.querySelector('#ck-project').textContent = projects[current].summary;
  }
  function finish() {
    var p = projects[current], score = 0;
    p.results.forEach(function (r) { score += r[0] === 'met' ? 1 : r[0] === 'part' ? 0.5 : 0; });
    var value = Math.round(100 * score / p.results.length);
    meter.style.setProperty('--pct', value + '%');
    pct.textContent = value + '%';
    verdict.textContent = p.verdict;
    run.textContent = 'Check again';
    run.disabled = false;
    running = false;
  }
  function check() {
    if (running) return;
    running = true;
    reset();
    run.disabled = true;
    run.textContent = 'Checking…';
    var results = projects[current].results, i = 0;
    (function next() {
      if (i === results.length) return finish();
      var li = items[i], r = results[i];
      li.setAttribute('data-s', r[0]);
      li.querySelector('p').textContent = r[1];
      i++;
      calmMotion ? next() : setTimeout(next, 380);
    })();
  }
  box.querySelectorAll('[data-project]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (running) return;
      current = b.getAttribute('data-project');
      box.querySelectorAll('[data-project]').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      reset();
    });
  });
  run.addEventListener('click', check);
  reset();
})();

// GrantPal AnswerPal demo: pre-written drafts, with regenerate, pick a version, edit and a word count.
(function () {
  var box = document.querySelector('[data-answer]');
  if (!box) return;
  var LIMIT = 120;
  var drafts = [
    [
      'Our card game turns hard conversations about race and faith into something people want to take part in. Each session ends with a short reflection, so players leave understanding one new thing about someone else. We will train teachers and HR staff to run sessions on their own, so the game keeps being played after the funding ends. Before-and-after surveys will show how comfortable players feel talking about culture and faith.',
      'Lasting impact comes from habits, not one-off events. We will train 20 facilitators in schools and workplaces to run the game themselves, and leave every partner with a set of cards and a session guide. Because the facilitators stay on after the grant ends, each set of cards can keep starting new conversations for years.',
      'The game gives people a safe way to ask the questions they would normally avoid. By training facilitators and leaving the cards with every partner, we make sure the conversations continue after the project ends.'
    ],
    [
      'We designed the card game and have run every session ourselves, so we know what makes a session work and what does not. We have partnered with schools, community groups and companies, and we adapt the game for each group we meet. As a small team, we work closely with every partner from the first call to the last session.',
      'Our team brings together community work and game design. We wrote and tested every card with real players, and refined the game after each round of feedback. Partners who have hosted us before have asked us back, so we can start quickly once funding is confirmed.',
      'We created the game, we run it, and we have learned from every session what works. That experience, and partners who already want more sessions, means we can deliver from day one.'
    ]
  ];
  var state = drafts.map(function () { return { shown: [], pick: -1 }; });
  var q = 0, typing = false;
  var text = box.querySelector('#ap-text'), count = box.querySelector('#ap-count');
  var draftBtn = box.querySelector('.ap-draft'), exportBtn = box.querySelector('.ap-export');
  var versions = box.querySelector('.ap-versions'), note = box.querySelector('#ap-note');
  function words(s) { var m = s.trim().match(/\S+/g); return m ? m.length : 0; }
  function updateCount() {
    var n = words(text.value);
    count.textContent = n + ' / ' + LIMIT + ' words';
    count.classList.toggle('over', n > LIMIT);
  }
  function render() {
    var s = state[q];
    versions.innerHTML = '';
    s.shown.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = 'Version ' + (i + 1);
      b.setAttribute('aria-pressed', String(i === s.pick));
      b.addEventListener('click', function () {
        if (typing) return;
        s.pick = i;
        render();
      });
      versions.appendChild(b);
    });
    text.value = s.pick >= 0 ? s.shown[s.pick] : '';
    text.disabled = s.pick < 0 || typing;
    exportBtn.disabled = s.pick < 0 || typing;
    var all = s.shown.length === drafts[q].length;
    draftBtn.textContent = s.shown.length === 0 ? 'Draft answer' : all ? 'All 3 versions drafted' : 'Regenerate';
    draftBtn.disabled = typing || all;
    updateCount();
  }
  function generate() {
    var s = state[q];
    if (typing || s.shown.length === drafts[q].length) return;
    var full = drafts[q][s.shown.length];
    s.shown.push('');
    s.pick = s.shown.length - 1;
    note.hidden = true;
    typing = true;
    render();
    draftBtn.textContent = 'Writing…';
    var parts = full.split(/(\s+)/), i = 0, qAtStart = q;
    function done() { s.shown[s.pick] = full; typing = false; if (q === qAtStart) render(); }
    if (calmMotion) return done();
    (function step() {
      if (q !== qAtStart) return done();
      i += 2;
      text.value = parts.slice(0, i).join('');
      updateCount();
      i < parts.length ? setTimeout(step, 35) : done();
    })();
  }
  text.addEventListener('input', function () {
    var s = state[q];
    if (s.pick >= 0) s.shown[s.pick] = text.value;
    updateCount();
  });
  box.querySelectorAll('[data-q]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (typing) return;
      q = +b.getAttribute('data-q');
      box.querySelectorAll('[data-q]').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      note.hidden = true;
      render();
    });
  });
  draftBtn.addEventListener('click', generate);
  exportBtn.addEventListener('click', function () {
    var n = words(text.value);
    note.textContent = n > LIMIT
      ? 'This answer is ' + (n - LIMIT) + ' words over the limit. Trim it before exporting.'
      : 'Ready to export. In the real app, this saves Version ' + (state[q].pick + 1) + ' as a Word document.';
    note.hidden = false;
  });
  render();
})();
