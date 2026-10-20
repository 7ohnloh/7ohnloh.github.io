// Highlight the rail link for the section in view.
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
  if (!links.length || !('IntersectionObserver' in window)) return;
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (a) { a.removeAttribute('aria-current'); });
      var link = byId[entry.target.id];
      if (link) link.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  Object.keys(byId).forEach(function (id) {
    var section = document.getElementById(id);
    if (section) observer.observe(section);
  });
})();

// Copy the email address; fall back to selecting it.
(function () {
  var button = document.querySelector('button.copy');
  var email = document.querySelector('.email');
  if (!button || !email) return;
  function selectEmail() {
    var range = document.createRange();
    range.selectNodeContents(email);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
  button.addEventListener('click', function () {
    var text = email.textContent.trim();
    var done = function () { button.textContent = 'Copied'; setTimeout(function () { button.textContent = 'Copy email'; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { selectEmail(); button.textContent = 'Press ⌘C to copy'; });
    } else {
      selectEmail();
      button.textContent = 'Press ⌘C to copy';
    }
  });
})();

document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

// Floating avatar: greets once, links to About, hides while About is on screen.
(function () {
  var buddy = document.getElementById('buddy');
  if (!buddy) return;
  var bubble = document.getElementById('buddy-bubble');
  var GREETED = 'buddy-greeted';
  var greeted = false;
  try { greeted = localStorage.getItem(GREETED) === '1'; } catch (e) {}
  if (!greeted) setTimeout(function () {
    if (buddy.classList.contains('is-away')) return;
    bubble.hidden = false;
    setTimeout(function () { bubble.hidden = true; }, 7000);
    try { localStorage.setItem(GREETED, '1'); } catch (e) {}
  }, 2500);
  document.getElementById('buddy-close').addEventListener('click', function () { bubble.hidden = true; });
  document.getElementById('buddy-avatar').addEventListener('click', function () { bubble.hidden = true; });

  var about = document.getElementById('about');
  if (about && 'IntersectionObserver' in window) new IntersectionObserver(function (entries) {
    var inAbout = entries[0].isIntersecting;
    buddy.classList.toggle('is-away', inAbout);
    if (inAbout) bubble.hidden = true;
  }, { threshold: 0.2 }).observe(about);
})();

// Headline: cycle the last word.
(function () {
  var word = document.querySelector('.rotator');
  if (!word || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var words = ['use.', 'trust.', 'love.'];
  var i = 0;
  setInterval(function () {
    word.classList.add('is-out');
    setTimeout(function () {
      i = (i + 1) % words.length;
      word.textContent = words[i];
      word.classList.remove('is-out');
    }, 280);
  }, 2800);
})();

// Project cards: tilt slightly toward the cursor, with a soft highlight.
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.project-link .cover').forEach(function (cover) {
    cover.addEventListener('pointermove', function (e) {
      var r = cover.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      cover.style.setProperty('--rx', ((0.5 - y) * 5).toFixed(2) + 'deg');
      cover.style.setProperty('--ry', ((x - 0.5) * 7).toFixed(2) + 'deg');
      cover.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      cover.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      cover.classList.add('is-tilting');
    });
    cover.addEventListener('pointerleave', function () {
      cover.classList.remove('is-tilting');
      cover.style.setProperty('--rx', '0deg');
      cover.style.setProperty('--ry', '0deg');
    });
  });
})();

// Easter egg: click the About photo five times.
(function () {
  var photo = document.querySelector('.portrait');
  if (!photo) return;
  var clicks = 0, timer;
  photo.style.cursor = 'pointer';
  photo.addEventListener('click', function () {
    clicks++;
    clearTimeout(timer);
    timer = setTimeout(function () { clicks = 0; }, 1500);
    if (clicks < 5) return;
    clicks = 0;
    photo.classList.remove('is-spinning'); void photo.offsetWidth; photo.classList.add('is-spinning');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var r = photo.getBoundingClientRect();
    var colors = ['#39ff88', '#9cc3ab', '#e5ebe6', '#4f7560'];
    for (var n = 0; n < 40; n++) {
      var bit = document.createElement('span');
      bit.className = 'confetti';
      bit.style.left = (r.left + r.width / 2) + 'px';
      bit.style.top = (r.top + r.height / 2) + 'px';
      bit.style.background = colors[n % colors.length];
      var angle = Math.random() * Math.PI * 2, dist = 80 + Math.random() * 140;
      bit.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      bit.style.setProperty('--dy', Math.sin(angle) * dist - 60 + 'px');
      bit.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      document.body.appendChild(bit);
      setTimeout(function (b) { b.remove(); }, 1200, bit);
    }
  });
})();
