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
      'body .cave-opening-screen .quest-card-grid,body .cave-opening-screen .flow-form-grid,body .cave-opening-screen .chunk-meta-grid{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;width:100%!important;max-width:100%!important;}',
      'body .cave-opening-screen .quest-board-card,body .cave-opening-screen .flow-card,body .cave-opening-screen .route-node-card,body .cave-opening-screen .chunk-card{min-width:0!important;min-height:0!important;max-width:100%!important;padding:10px!important;border-width:2px!important;border-radius:14px!important;box-sizing:border-box!important;box-shadow:none!important;}',
      'body .cave-opening-screen .quest-card-actions,body .cave-opening-screen .flow-actions,body .cave-opening-screen .export-row{position:static!important;display:grid!important;grid-template-columns:1fr!important;gap:8px!important;margin-top:8px!important;}',
      'body .cave-opening-screen .quest-card-actions button,body .cave-opening-screen .flow-actions button,body .cave-opening-screen .flow-card button,body .cave-opening-screen .chunk-card button{width:100%!important;min-width:0!important;padding:9px 10px!important;border-radius:999px!important;font-size:.86rem!important;line-height:1.1!important;white-space:normal!important;box-shadow:none!important;}',
      'body .cave-opening-screen .map-board-panel,html body .studyquest-shell.scene-first .game-cave.room-viewport-frame .map-board-panel{left:50%!important;right:auto!important;top:28px!important;bottom:28px!important;inset:28px auto 28px 50%!important;width:min(980px,calc(100% - 86px))!important;max-width:980px!important;transform:translateX(-50%)!important;padding:56px 16px 16px!important;background:radial-gradient(circle at 50% 18%,rgba(255,255,255,.45),transparent 190px),linear-gradient(135deg,#f8e7bd,#d8ad6b)!important;}',
      'body .cave-opening-screen .map-board-panel summary{left:22px!important;right:58px!important;font-size:1.18rem!important;color:#4b2b16!important;letter-spacing:.02em!important;}',
      'body .cave-opening-screen [data-task-map]{height:100%!important;overflow:hidden!important;}',
      'body .cave-opening-screen .task-map-grid{position:relative!important;display:block!important;width:100%!important;height:100%!important;min-height:520px!important;overflow:hidden!important;border:3px solid rgba(75,43,22,.42)!important;border-radius:22px!important;background:radial-gradient(circle at 20% 25%,rgba(101,65,30,.14),transparent 120px),radial-gradient(circle at 75% 70%,rgba(40,78,71,.18),transparent 160px),linear-gradient(135deg,rgba(255,248,222,.72),rgba(221,176,105,.72))!important;box-shadow:inset 0 0 32px rgba(86,48,18,.18)!important;}',
      'body .cave-opening-screen .task-map-grid:before{content:"";position:absolute;left:14%;right:12%;top:34%;height:42%;border-top:5px dotted rgba(92,55,24,.55);border-right:5px dotted rgba(92,55,24,.55);border-bottom:5px dotted rgba(92,55,24,.55);border-radius:45% 38% 44% 35%;transform:rotate(-5deg);opacity:.85;}',
      'body .cave-opening-screen .task-map-grid:after{content:"Study route";position:absolute;left:22px;bottom:18px;padding:7px 10px;border-radius:999px;background:rgba(68,39,18,.82);color:#fff1cf;font-family:Georgia,"Times New Roman",serif;font-weight:900;letter-spacing:.08em;text-transform:uppercase;font-size:.74rem;}',
      'body .cave-opening-screen .task-map-grid>.flow-card:first-child{position:absolute!important;left:18px!important;top:18px!important;width:min(250px,31%)!important;z-index:3!important;background:rgba(255,248,226,.72)!important;border:2px solid rgba(91,55,31,.38)!important;border-radius:16px!important;color:#2f2118!important;box-shadow:0 8px 24px rgba(75,43,22,.12)!important;}',
      'body .cave-opening-screen .task-map-grid>.flow-card:first-child .eyebrow{margin:0 0 5px!important;color:#8a5a18!important;font-size:.65rem!important;letter-spacing:.13em!important;text-transform:uppercase!important;}',
      'body .cave-opening-screen .task-map-grid>.flow-card:first-child h2{margin:0 0 6px!important;font-size:1rem!important;line-height:1.05!important;color:#2f2118!important;}',
      'body .cave-opening-screen .task-map-grid>.flow-card:first-child p{margin:4px 0!important;font-size:.78rem!important;line-height:1.2!important;}',
      'body .cave-opening-screen .task-map-grid>.flow-card:first-child .flow-actions{display:flex!important;flex-wrap:wrap!important;gap:5px!important;margin-top:8px!important;}',
      'body .cave-opening-screen .task-map-grid>.flow-card:first-child .flow-actions button{width:auto!important;flex:1 1 92px!important;padding:7px 8px!important;font-size:.72rem!important;}',
      'body .cave-opening-screen .task-map-grid>.flow-card:nth-child(2){position:absolute!important;inset:0!important;z-index:2!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;}',
      'body .cave-opening-screen .task-map-grid>.flow-card:nth-child(2)>h3{position:absolute!important;right:20px!important;top:18px!important;margin:0!important;color:#5b371f!important;font-family:Georgia,"Times New Roman",serif!important;letter-spacing:.08em!important;text-transform:uppercase!important;font-size:.88rem!important;}',
      'body .cave-opening-screen .route-node-grid{position:absolute!important;inset:74px 24px 34px 24px!important;display:block!important;width:auto!important;height:auto!important;}',
      'body .cave-opening-screen .route-node-card{position:absolute!important;width:128px!important;min-height:74px!important;padding:10px 8px!important;text-align:center!important;border:3px solid #5b371f!important;border-radius:22px!important;background:linear-gradient(180deg,#fff5d4,#d7ae70)!important;color:#2f2118!important;box-shadow:0 5px 0 rgba(75,43,22,.30)!important;}',
      'body .cave-opening-screen .route-node-card strong{display:block!important;font-family:Georgia,"Times New Roman",serif!important;font-size:.86rem!important;line-height:1.05!important;}',
      'body .cave-opening-screen .route-node-card p{margin:6px 0 0!important;font-size:.72rem!important;font-weight:900!important;letter-spacing:.05em!important;text-transform:uppercase!important;}',
      'body .cave-opening-screen .route-node-card.complete{background:linear-gradient(180deg,#e8f6c7,#9fcb6b)!important;}',
      'body .cave-opening-screen .route-node-card.unlocked{background:linear-gradient(180deg,#fff5d4,#e4bd75)!important;}',
      'body .cave-opening-screen .route-node-card.locked{opacity:.72!important;background:linear-gradient(180deg,#d7c7ac,#a9977f)!important;}',
      'body .cave-opening-screen .route-node-card.current{outline:4px solid rgba(255,208,110,.9)!important;box-shadow:0 5px 0 rgba(75,43,22,.30),0 0 0 7px rgba(255,208,110,.22)!important;}',
      'body .cave-opening-screen .route-node-card:nth-child(1){left:8%!important;top:54%!important;}body .cave-opening-screen .route-node-card:nth-child(2){left:24%!important;top:36%!important;}body .cave-opening-screen .route-node-card:nth-child(3){left:43%!important;top:52%!important;}body .cave-opening-screen .route-node-card:nth-child(4){left:60%!important;top:30%!important;}body .cave-opening-screen .route-node-card:nth-child(5){left:73%!important;top:54%!important;}body .cave-opening-screen .route-node-card:nth-child(6){left:48%!important;top:76%!important;}body .cave-opening-screen .route-node-card:nth-child(7){left:74%!important;top:8%!important;}',
      '@media(max-width:760px){body .cave-opening-screen .quest-board-panel,body .cave-opening-screen .flags-panel{inset:8px 8px 8px 48px!important;width:auto!important;max-width:none!important;}body .cave-opening-screen .map-board-panel{inset:8px 8px 8px 48px!important;left:48px!important;right:8px!important;top:8px!important;bottom:8px!important;width:auto!important;max-width:none!important;transform:none!important;}body .cave-opening-screen .task-map-grid{min-height:620px!important;overflow:auto!important;}body .cave-opening-screen .task-map-grid>.flow-card:first-child{position:relative!important;left:auto!important;top:auto!important;width:auto!important;margin-bottom:10px!important;}body .cave-opening-screen .route-node-grid{position:relative!important;inset:auto!important;display:grid!important;grid-template-columns:1fr!important;gap:8px!important;}body .cave-opening-screen .route-node-card{position:relative!important;left:auto!important;top:auto!important;width:auto!important;}}'
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
