/* deck.js — navegação de slides (bd-relacional) */
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  if (!slides.length) return;
  var i = 0;
  var prog = document.querySelector('.deck-prog');
  var count = document.querySelector('.deck-count');
  var bPrev = document.querySelector('[data-prev]');
  var bNext = document.querySelector('[data-next]');

  function renderMermaid() {
    if (!window.mermaid || !window.mermaid.run) return;
    var pend = Array.prototype.slice.call(slides[i].querySelectorAll('.mermaid:not([data-processed])'));
    if (pend.length) { try { window.mermaid.run({ nodes: pend }); } catch (e) {} }
  }

  function render() {
    slides.forEach(function (s, k) { s.classList.toggle('active', k === i); });
    if (prog) prog.style.width = ((i + 1) / slides.length * 100) + '%';
    if (count) count.textContent = (i + 1) + ' / ' + slides.length;
    if (bPrev) bPrev.disabled = i === 0;
    if (bNext) bNext.disabled = i === slides.length - 1;
    if (location.hash !== '#' + (i + 1)) history.replaceState(null, '', '#' + (i + 1));
    renderMermaid();
  }
  function go(n) { i = Math.max(0, Math.min(slides.length - 1, n)); render(); }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { go(i + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { go(i - 1); e.preventDefault(); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(slides.length - 1);
  });
  if (bPrev) bPrev.addEventListener('click', function () { go(i - 1); });
  if (bNext) bNext.addEventListener('click', function () { go(i + 1); });

  var sx = null;
  document.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 60) go(i + (dx < 0 ? 1 : -1));
    sx = null;
  }, { passive: true });

  var start = parseInt((location.hash || '').replace('#', ''), 10);
  if (start >= 1 && start <= slides.length) i = start - 1;
  render();
})();
