(function () {
  function closePanels() {
    document.querySelectorAll("details[open].quest-board-panel, details[open].map-board-panel, details[open].flags-panel").forEach(function (panel) {
      panel.open = false;
    });
  }

  function addStyle() {
    if (document.querySelector("style[data-study-cave-ui-fix]")) return;
    var style = document.createElement("style");
    style.dataset.studyCaveUiFix = "true";
    style.textContent = [
      'html,body{height:100%;overflow:hidden!important;background:#120c10!important;}',
      'body .studyquest-shell.scene-first{height:100dvh!important;min-height:0!important;display:grid!important;place-items:center!important;padding:4px!important;overflow:hidden!important;background:radial-gradient(circle at 50% 50%,rgba(58,38,68,.5),transparent 42%),linear-gradient(180deg,#211728 0%,#09070d 100%)!important;}',
      'body .studyquest-header.compact-header{display:none!important;}',
      'body .game-cave.room-viewport-frame{width:min(1700px,calc(100vw - 8px),calc((100dvh - 8px)*16/9))!important;height:min(calc(100dvh - 8px),calc((100vw - 8px)*9/16))!important;max-width:calc(100vw - 8px)!important;max-height:calc(100dvh - 8px)!important;aspect-ratio:16/9!important;transform:scale(1.08)!important;transform-origin:center center!important;border:6px solid #382215!important;border-radius:20px!important;box-shadow:0 0 0 2px rgba(218,169,91,.45),0 0 0 12px rgba(22,12,16,.95),0 22px 74px rgba(0,0,0,.58)!important;overflow:hidden!important;}',
      'body .quest-board-panel,body .map-board-panel,body .flags-panel{position:absolute!important;top:14px!important;right:14px!important;bottom:14px!important;left:auto!important;z-index:8500!important;width:min(430px,calc(100% - 28px))!important;overflow:auto!important;padding:50px 14px 14px!important;border:4px solid #5a3825!important;border-radius:20px!important;background:linear-gradient(180deg,rgba(255,246,226,.98),rgba(224,199,151,.98))!important;color:#2f2118!important;box-shadow:0 24px 80px rgba(0,0,0,.52)!important;}',
      'body .quest-board-panel:not([open]),body .map-board-panel:not([open]),body .flags-panel:not([open]){display:none!important;}',
      'body .quest-board-panel summary,body .map-board-panel summary,body .flags-panel summary{position:absolute!important;top:12px!important;left:16px!important;right:62px!important;padding:0!important;font-weight:900!important;font-family:Georgia,serif!important;font-size:1rem!important;line-height:1.2!important;cursor:pointer!important;}',
      'body .quest-board-panel .panel-close,body .map-board-panel .panel-close,body .flags-panel .panel-close{display:grid!important;place-items:center!important;position:absolute!important;top:8px!important;right:8px!important;z-index:9000!important;width:38px!important;height:38px!important;border-radius:999px!important;border:1px solid rgba(97,70,45,.24)!important;background:#fff!important;color:#2f2118!important;font-size:1.1rem!important;font-weight:900!important;cursor:pointer!important;opacity:1!important;visibility:visible!important;}',
      '@media (max-width:760px){body .game-cave.room-viewport-frame{transform:scale(1.04)!important;}body .quest-board-panel,body .map-board-panel,body .flags-panel{left:48px!important;right:8px!important;width:auto!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  document.addEventListener("click", function (event) {
    var closeButton = event.target.closest("[data-close-panel]");
    if (closeButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      var panel = closeButton.closest("details");
      if (panel) panel.open = false;
      return;
    }
  }, true);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closePanels();
  });

  document.addEventListener("DOMContentLoaded", function () {
    addStyle();
    closePanels();
    if (window.esslayRoomViewportFit) window.esslayRoomViewportFit();
  });
})();
