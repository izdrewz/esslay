(function () {
  function fit() {
    var shell = document.querySelector('.studyquest-shell.scene-first');
    var frame = document.querySelector('.game-cave.room-viewport-frame');
    if (!frame) return;

    try {
      var settings = JSON.parse(localStorage.getItem('esslay-room-viewport-settings-v1') || '{}');
      if (settings.cave) {
        delete settings.cave.scale;
        delete settings.cave.mode;
        localStorage.setItem('esslay-room-viewport-settings-v1', JSON.stringify(settings));
      }
    } catch (error) {}

    var aspect = 16 / 9;
    var vw = Math.max(320, window.innerWidth || 320);
    var vh = Math.max(240, window.innerHeight || 240);
    var width = Math.min(1700, vw - 8, (vh - 8) * aspect);
    var height = width / aspect;
    if (height > vh - 8) {
      height = vh - 8;
      width = height * aspect;
    }
    var zoom = vw > 760 ? 1.18 : 1.06;

    document.documentElement.style.cssText += ';overflow:hidden!important';
    document.body.style.cssText += ';overflow:hidden!important;background:#120c10!important';
    if (shell) shell.style.cssText += ';height:100dvh!important;min-height:0!important;display:grid!important;place-items:center!important;padding:4px!important;overflow:hidden!important';
    frame.style.cssText += ';width:' + Math.round(width) + 'px!important;height:' + Math.round(height) + 'px!important;max-width:calc(100vw - 8px)!important;max-height:calc(100dvh - 8px)!important;aspect-ratio:auto!important;transform:scale(' + zoom + ')!important;transform-origin:center center!important;overflow:hidden!important;background-image:url(assets/study-cave-opening.jpg?v=4)!important;background-size:100% 100%!important;background-position:center!important;background-repeat:no-repeat!important';
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

  window.addEventListener('resize', function () {
    requestAnimationFrame(fit);
  });

  function init() {
    closePanels();
    fit();
    setTimeout(fit, 100);
    setTimeout(fit, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
