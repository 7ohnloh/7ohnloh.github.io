// Light/dark switch. The page follows the device setting until the visitor picks a theme.
(function () {
  var root = document.documentElement;
  var button = document.getElementById('theme-toggle');
  if (!button) return;
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  function current() { return root.getAttribute('data-theme') || (media.matches ? 'dark' : 'light'); }
  function label() {
    var next = current() === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    button.setAttribute('title', 'Switch to ' + next + ' mode');
  }
  button.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    label();
  });
  if (media.addEventListener) media.addEventListener('change', label);
  label();
})();
