(function () {
  function addStyle() {
    if (document.querySelector('style[data-cave-frame-fix-v2]')) return;
    var style = document.createElement('style');
    style.dataset.caveFrameFixV2 = 'true';
    style.textContent = 'body .game-cave.room-viewport-frame{transform:scale(1.08)!important;transform-origin:center center!important;}';
    document.head.appendChild(style);
  }

  function closePanels() {
    document.querySelectorAll('.quest-board-panel[open],.map-board-panel[open],.flags-panel[open]').forEach(function (panel) {
      panel.open = false;
    });
  }

  document.addEventListener('click', function (event) {
    var close = event.target.closest('[data-close-panel]');
    if (!close) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    var panel = close.closest('details');
    if (panel) panel.open = false;
  }, true);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closePanels();
  });

  function init() {
    addStyle();
    closePanels();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
