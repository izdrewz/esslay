(function () {
  function loadMapAsset() {
    if (document.querySelector('link[data-study-cave-map-asset]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'study-cave-map-asset-v1.css?v=1';
    link.dataset.studyCaveMapAsset = 'true';
    document.head.appendChild(link);
  }

  function addStyle() {
    if (document.querySelector('style[data-study-cave-map-image-fix]')) return;
    var style = document.createElement('style');
    style.dataset.studyCaveMapImageFix = 'true';
    style.textContent = [
      'body .game-cave.room-viewport-frame{transform:scale(1.08)!important;transform-origin:center center!important;}',
      'body .cave-opening-screen .map-board-panel{position:absolute!important;inset:16px!important;left:16px!important;right:16px!important;top:16px!important;bottom:16px!important;width:auto!important;max-width:none!important;height:auto!important;margin:0!important;padding:54px 14px 14px!important;overflow:hidden!important;transform:none!important;z-index:9500!important;border:4px solid #5a3825!important;border-radius:20px!important;background:#d8ad6b!important;color:#2f2118!important;box-shadow:0 24px 80px rgba(0,0,0,.52)!important;}',
      'body .cave-opening-screen .map-board-panel summary{position:absolute!important;top:12px!important;left:18px!important;right:60px!important;padding:0!important;margin:0!important;border:0!important;color:#4b2b16!important;background:transparent!important;font-family:Georgia,"Times New Roman",serif!important;font-size:1.15rem!important;font-weight:900!important;}',
      'body .cave-opening-screen .map-board-panel .panel-close{position:absolute!important;top:8px!important;right:8px!important;width:38px!important;height:38px!important;display:grid!important;place-items:center!important;margin:0!important;float:none!important;border-radius:999px!important;background:#fff!important;color:#2f2118!important;z-index:5!important;}',
      'body .cave-opening-screen [data-task-map]{position:relative!important;width:100%!important;height:100%!important;overflow:hidden!important;}',
      'body .cave-opening-screen .task-map-grid{position:relative!important;width:100%!important;height:100%!important;min-height:520px!important;border:3px solid rgba(75,43,22,.42)!important;border-radius:18px!important;overflow:hidden!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;}',
      'body .cave-opening-screen .task-map-grid>.flow-card{display:none!important;}',
      'body .cave-opening-screen .task-map-grid:after{content:"Click the cave chambers on the illustrated map";position:absolute;left:14px;bottom:12px;z-index:4;padding:8px 10px;border-radius:999px;background:rgba(48,29,14,.82);color:#fff1cf;font:800 .78rem Georgia,"Times New Roman",serif;}',
      '@media(max-width:760px){body .cave-opening-screen .map-board-panel{inset:8px 8px 8px 48px!important}.study-cave-map-status{font-size:.68rem;border-radius:14px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function showImageMap() {
    var grid = document.querySelector('.map-board-panel[open] .task-map-grid') || document.querySelector('.task-map-grid');
    if (!grid) return;
    grid.classList.add('study-cave-art-map__image');
  }

  function closePanels() {
    document.querySelectorAll('.quest-board-panel[open],.map-board-panel[open],.flags-panel[open]').forEach(function (panel) { panel.open = false; });
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-action="open-task-map"]')) {
      setTimeout(showImageMap, 0);
      setTimeout(showImageMap, 80);
      setTimeout(showImageMap, 250);
    }
    var close = event.target.closest('[data-close-panel]');
    if (close) {
      event.preventDefault();
      event.stopImmediatePropagation();
      var panel = close.closest('details');
      if (panel) panel.open = false;
    }
  }, true);

  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closePanels(); });

  function init() {
    loadMapAsset();
    addStyle();
    closePanels();
    setTimeout(showImageMap, 200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
