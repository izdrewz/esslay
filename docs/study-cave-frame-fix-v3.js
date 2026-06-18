(function () {
  function fit() {
    var shell = document.querySelector('.studyquest-shell.scene-first');
    var frame = document.querySelector('.game-cave.room-viewport-frame');
    if (!frame) return;

    var aspect = 16 / 9;
    var vw = Math.max(320, window.innerWidth || 320);
    var vh = Math.max(240, window.innerHeight || 240);
    var width = Math.min(1700, vw - 8, (vh - 8) * aspect);
    var height = width / aspect;
    if (height > vh - 8) {
      height = vh - 8;
      width = height * aspect;
    }
    var zoom = vw > 760 ? 1.08 : 1.02;

    try {
      var settings = JSON.parse(localStorage.getItem('esslay-room-viewport-settings-v1') || '{}');
      if (settings.cave) {
        delete settings.cave.scale;
        delete settings.cave.mode;
        localStorage.setItem('esslay-room-viewport-settings-v1', JSON.stringify(settings));
      }
    } catch (error) {}

    document.documentElement.style.setProperty('overflow', 'hidden', 'important');
    document.body.style.setProperty('overflow', 'hidden', 'important');
    document.body.style.setProperty('background', '#120c10', 'important');

    if (shell) {
      shell.style.setProperty('height', '100dvh', 'important');
      shell.style.setProperty('min-height', '0', 'important');
      shell.style.setProperty('display', 'grid', 'important');
      shell.style.setProperty('place-items', 'center', 'important');
      shell.style.setProperty('padding', '4px', 'important');
      shell.style.setProperty('overflow', 'hidden', 'important');
    }

    frame.style.setProperty('width', Math.round(width) + 'px', 'important');
    frame.style.setProperty('height', Math.round(height) + 'px', 'important');
    frame.style.setProperty('max-width', 'calc(100vw - 8px)', 'important');
    frame.style.setProperty('max-height', 'calc(100dvh - 8px)', 'important');
    frame.style.setProperty('aspect-ratio', 'auto', 'important');
    frame.style.setProperty('transform', 'scale(' + zoom + ')', 'important');
    frame.style.setProperty('transform-origin', 'center center', 'important');
    frame.style.setProperty('overflow', 'hidden', 'important');
    frame.style.setProperty('background-image', 'url(assets/study-cave-opening.jpg?v=4)', 'important');
    frame.style.setProperty('background-size', '100% 100%', 'important');
    frame.style.setProperty('background-position', 'center', 'important');
    frame.style.setProperty('background-repeat', 'no-repeat', 'important');
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
    setTimeout(fit, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
