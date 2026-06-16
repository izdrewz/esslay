(function () {
  var STORAGE_KEY = "esslay-room-viewport-settings-v1";
  var MIN_SCALE = 0.72;
  var MAX_SCALE = 1;

  function numberFrom(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function roomKey(shell) {
    return shell.dataset.roomId || document.body.dataset.roomId || "default-room";
  }

  function roomScale(shell) {
    var settings = loadSettings();
    var saved = settings[roomKey(shell)] || {};
    var fallback = numberFrom(shell.dataset.roomDefaultScale, 0.92);
    return clamp(numberFrom(saved.scale, fallback), MIN_SCALE, MAX_SCALE);
  }

  function safeBottom(shell) {
    var desktopFallback = window.innerWidth > 780 ? 76 : 10;
    return numberFrom(shell.dataset.roomSafeBottom, desktopFallback);
  }

  function reserveTop(shell) {
    return numberFrom(shell.dataset.roomReserveTop, 0);
  }

  function fitShell(shell) {
    var frame = shell.querySelector("[data-room-viewport-frame]") || shell.querySelector(".room-viewport-frame");
    if (!frame) return;

    var aspect = numberFrom(shell.dataset.roomAspect, 16 / 9);
    var maxWidth = numberFrom(shell.dataset.roomMaxWidth, 1540);
    var padding = numberFrom(shell.dataset.roomViewportPadding, window.innerWidth > 780 ? 10 : 5);
    var availableWidth = Math.max(260, window.innerWidth - padding * 2);
    var availableHeight = Math.max(180, window.innerHeight - padding * 2 - safeBottom(shell) - reserveTop(shell));
    var scale = roomScale(shell);
    var width = Math.min(maxWidth, availableWidth, availableHeight * aspect) * scale;
    var height = width / aspect;

    if (height > availableHeight) {
      height = availableHeight;
      width = height * aspect;
    }

    width = Math.max(240, Math.min(availableWidth, width));
    height = Math.max(160, Math.min(availableHeight, height));

    frame.style.setProperty("width", Math.round(width) + "px", "important");
    frame.style.setProperty("height", Math.round(height) + "px", "important");
    frame.style.setProperty("aspect-ratio", "auto", "important");
    frame.dataset.roomViewportMode = "fit";
    shell.dataset.roomViewportMode = "fit";
    shell.style.setProperty("--room-viewport-frame-width", Math.round(width) + "px");
    shell.style.setProperty("--room-viewport-frame-height", Math.round(height) + "px");
  }

  function installAll() {
    document.querySelectorAll("[data-room-viewport]").forEach(fitShell);
    document.body.dataset.roomViewportReady = "true";
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(installAll, 80);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installAll);
  } else {
    installAll();
  }

  window.esslayRoomViewportFit = installAll;
})();
