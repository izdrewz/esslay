(function () {
  function addDrawerOverrides() {
    if (document.querySelector('style[data-cave-compact-drawers]')) return;
    var style = document.createElement('style');
    style.dataset.caveCompactDrawers = 'true';
    style.textContent = [
      'body .cave-opening-screen .quest-board-panel,body .cave-opening-screen .map-board-panel,body .cave-opening-screen .flags-panel,html body .studyquest-shell.scene-first .game-cave.room-viewport-frame .quest-board-panel,html body .studyquest-shell.scene-first .game-cave.room-viewport-frame .map-board-panel,html body .studyquest-shell.scene-first .game-cave.room-viewport-frame .flags-panel{position:absolute!important;inset:12px 12px 12px auto!important;left:auto!important;top:12px!important;right:12px!important;bottom:12px!important;width:min(380px,calc(100% - 24px))!important;min-width:0!important;max-width:380px!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;padding:52px 12px 12px!important;overflow:auto!important;overflow-x:hidden!important;transform:none!important;z-index:9000!important;border:4px solid #5a3825!important;border-radius:20px!important;background:linear-gradient(180deg,rgba(255,246,226,.98),rgba(224,199,151,.98))!important;color:#2f2118!important;box-shadow:0 24px 80px rgba(0,0,0,.52)!important;}',
      'body .cave-opening-screen .quest-board-panel:not([open]),body .cave-opening-screen .map-board-panel:not([open]),body .cave-opening-screen .flags-panel:not([open]){display:none!important;}',
      'body .cave-opening-screen .quest-board-panel summary,body .cave-opening-screen .map-board-panel summary,body .cave-opening-screen .flags-panel summary,html body .studyquest-shell.scene-first .game-cave.room-viewport-frame .quest-board-panel summary,html body .studyquest-shell.scene-first .game-cave.room-viewport-frame .map-board-panel summary,html body .studyquest-shell.scene-first .game-cave.room-viewport-frame .flags-panel summary{position:absolute!important;top:12px!important;left:14px!important;right:58px!important;z-index:2!important;display:block!important;padding:0!important;margin:0!important;border:0!important;color:#2f2118!important;background:transparent!important;font-family:Georgia,"Times New Roman",serif!important;font-size:1rem!important;font-weight:900!important;line-height:1.15!important;text-align:left!important;cursor:pointer!important;}',
      'body .cave-opening-screen .panel-close,html body .studyquest-shell.scene-first .game-cave.room-viewport-frame .panel-close{position:absolute!important;top:8px!important;right:8px!important;z-index:3!important;width:38px!important;height:38px!important;display:grid!important;place-items:center!important;margin:0!important;float:none!important;border:1px solid rgba(97,70,45,.24)!important;border-radius:999px!important;background:#fff!important;color:#2f2118!important;font-size:1.1rem!important;font-weight:900!important;line-height:1!important;box-shadow:none!important;opacity:1!important;visibility:visible!important;cursor:pointer!important;}',
      'body .cave-opening-screen .quest-board-ui,body .cave-opening-screen .quest-board-section,body .cave-opening-screen .flow-content,body .cave-opening-screen [data-task-map],body .cave-opening-screen [data-flags-loot-panel]{width:100%!important;max-width:100%!important;overflow-x:hidden!important;box-sizing:border-box!important;}',
      'body .cave-opening-screen .quest-board-ui,body .cave-opening-screen .quest-board-section{padding:0!important;margin:0!important;border:0!important;background:transparent!important;color:#2f2118!important;box-shadow:none!important;}',
      'body .cave-opening-screen .quest-board-title,body .cave-opening-screen .quest-board-section h3{color:#5b371f!important;text-shadow:none!important;text-align:left!important;font-size:1rem!important;letter-spacing:.08em!important;}',
      'body .cave-opening-screen .quest-card-grid,body .cave-opening-screen .task-map-grid,body .cave-opening-screen .route-node-grid,body .cave-opening-screen .flow-form-grid,body .cave-opening-screen .chunk-meta-grid{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;width:100%!important;max-width:100%!important;}',
      'body .cave-opening-screen .quest-board-card,body .cave-opening-screen .flow-card,body .cave-opening-screen .route-node-card,body .cave-opening-screen .chunk-card{min-width:0!important;min-height:0!important;max-width:100%!important;padding:10px!important;border-width:2px!important;border-radius:14px!important;box-sizing:border-box!important;box-shadow:none!important;}',
      'body .cave-opening-screen .quest-card-actions,body .cave-opening-screen .flow-actions,body .cave-opening-screen .export-row{position:static!important;display:grid!important;grid-template-columns:1fr!important;gap:8px!important;margin-top:8px!important;}',
      'body .cave-opening-screen .quest-card-actions button,body .cave-opening-screen .flow-actions button,body .cave-opening-screen .flow-card button,body .cave-opening-screen .chunk-card button{width:100%!important;min-width:0!important;padding:9px 10px!important;border-radius:999px!important;font-size:.86rem!important;line-height:1.1!important;white-space:normal!important;box-shadow:none!important;}',
      '@media(max-width:760px){body .cave-opening-screen .quest-board-panel,body .cave-opening-screen .map-board-panel,body .cave-opening-screen .flags-panel{inset:8px 8px 8px 48px!important;width:auto!important;max-width:none!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function fit() {
    var frame = document.querySelector('.game-cave.room-viewport-frame');
    if (!frame) return;
    frame.style.setProperty('transform', 'scale(1.08)', 'important');
    frame.style.setProperty('transform-origin', 'center center', 'important');
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
    addDrawerOverrides();
    closePanels();
    fit();
    setTimeout(addDrawerOverrides, 100);
    setTimeout(fit, 100);
    setTimeout(addDrawerOverrides, 600);
    setTimeout(fit, 600);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('resize', fit);
})();
