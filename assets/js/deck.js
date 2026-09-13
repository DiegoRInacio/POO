/* deck.js — navegação de slides (bd-relacional) */
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  if (!slides.length) return;
  var i = 0;
  var prog = document.querySelector('.deck-prog');
  var count = document.querySelector('.deck-count');
  var bPrev = document.querySelector('[data-prev]');
  var bNext = document.querySelector('[data-next]');

  function corrigirProporcaoMermaid(nodes) {
    // so agora, com o mermaid ja tendo medido o texto e fechado o layout
    // (viewBox definitivo), e que dimensionamos o svg — fazer isso via CSS
    // ANTES do render confunde a medicao interna do mermaid (caixas ficam
    // estreitas e o texto corta).
    //
    // Ja tentei "adivinhar" quanto de altura sobra no slide (2 vezes — via
    // getBoundingClientRect manual, depois via clientHeight do card) e as
    // duas vezes deu certo no meu teste e errado na tela real do usuário
    // (janela com proporcao diferente da testada). CONCLUSAO: parar de
    // tentar prever a altura disponivel.
    //
    // Em vez disso: o svg ocupa 100% da LARGURA do card (que tem
    // max-width:820px, nao estica sem limite em tela larga) e a altura
    // acompanha a proporcao (height:auto). O card `.mermaid` NAO E MAIS
    // flex:1 1 auto (nao e forcado a preencher/encolher pra um tamanho
    // "disponivel") — ver `.slide .mermaid{flex:0 0 auto}` no deck.css —
    // entao ele cresce pra caber o diagrama inteiro, do tamanho que for. Se
    // isso deixar o slide mais alto que a tela, `.slide.active` ja rola
    // (overflow-y:auto) — like qualquer pagina web normal, em vez de cortar
    // ou esticar o diagrama de um jeito estranho.
    nodes.forEach(function (n) {
      var svg = n.querySelector('svg');
      if (!svg) return;
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.maxWidth = '100%';
    });
  }

  function renderMermaid() {
    if (!window.mermaid || !window.mermaid.run) return;
    var pend = Array.prototype.slice.call(slides[i].querySelectorAll('.mermaid:not([data-processed])'));
    if (!pend.length) return;
    var depoisDoLayout = function () {
      requestAnimationFrame(function () { requestAnimationFrame(function () { corrigirProporcaoMermaid(pend); }); });
    };
    try {
      var r = window.mermaid.run({ nodes: pend });
      if (r && r.then) r.then(depoisDoLayout);
      else depoisDoLayout();
    } catch (e) {}
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

  function estaDigitando(e) {
    var t = e.target;
    if (!t) return false;
    var tag = t.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable;
  }

  document.addEventListener('keydown', function (e) {
    if (estaDigitando(e)) return; // não rouba o foco de campos de exercício
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
