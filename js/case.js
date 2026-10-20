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
