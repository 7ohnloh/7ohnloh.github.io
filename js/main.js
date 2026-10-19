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

// Floating avatar: greets after a moment, hides while About is on screen.
(function () {
  var buddy = document.getElementById('buddy');
  if (!buddy) return;
  var bubble = document.getElementById('buddy-bubble');
  var close = document.getElementById('buddy-close');
  var avatar = buddy.querySelector('.buddy-avatar');
  var KEY = 'buddy-dismissed';
  function dismissed() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function dismiss() {
    bubble.hidden = true;
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
  }
  if (!dismissed()) setTimeout(function () { bubble.hidden = false; }, 2500);
  close.addEventListener('click', dismiss);
  avatar.addEventListener('click', dismiss);

  var about = document.getElementById('about');
  if (about && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      buddy.classList.toggle('is-away', entries[0].isIntersecting);
    }, { threshold: 0.2 }).observe(about);
  }
})();
