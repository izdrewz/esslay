(function () {
  var STORAGE_KEY = "esslay-room-viewport-settings-v1";
  var MIN_SCALE = 0.72;
  var MAX_SCALE = 1;
  var STEP = 0.04;

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function numberFrom(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function roomKey(shell) {
    return shell.dataset.roomId || document.body.dataset.roomId || "default-room";
  }

  function roomScale(shell) {
    var settings = loadSettings();
    var key = roomKey(shell);
    var fallback = numberFrom(shell.dataset.roomDefaultScale, 0.92);
    return clamp(numberFrom(settings[key] && settings[key].scale, fallback), MIN_SCALE, MAX_SCALE);
  }

  function setRoomScale(shell, scale) {
    var settings = loadSettings();
    var key = roomKey(shell);
    settings[key] = settings[key] || {};
    settings[key].scale = clamp(scale, MIN_SCALE, MAX_SCALE);
    saveSettings(settings);
    fitShell(shell);
  }

  function resetRoomScale(shell) {
    var settings = loadSettings();
    var key = roomKey(shell);
    var fallback = numberFrom(shell.dataset.roomDefaultScale, 0.92);
    settings[key] = settings[key] || {};
    settings[key].scale = clamp(fallback, MIN_SCALE, MAX_SCALE);
    saveSettings(settings);
    fitShell(shell);
  }

  function safeBottom(shell) {
    var desktopFallback = window.innerWidth > 780 ? 76 : 10;
    return numberFrom(shell.dataset.roomSafeBottom, desktopFallback);
  }

  function fitShell(shell) {
    var frame = shell.querySelector("[data-room-viewport-frame]") || shell.querySelector(".room-viewport-frame");
    if (!frame) return;

    var aspect = numberFrom(shell.dataset.roomAspect, 16 / 9);
    var maxWidth = numberFrom(shell.dataset.roomMaxWidth, 1540);
    var padding = numberFrom(shell.dataset.roomViewportPadding, window.innerWidth > 780 ? 10 : 5);
    var bottom = safeBottom(shell);
    var availableWidth = Math.max(260, window.innerWidth - padding * 2);
    var availableHeight = Math.max(180, window.innerHeight - padding * 2 - bottom);
    var baseWidth = Math.min(maxWidth, availableWidth, availableHeight * aspect);
    var scale = roomScale(shell);
    var width = Math.min(availableWidth, Math.max(240, Math.round(baseWidth * scale)));
    var height = Math.round(width / aspect);

    if (height > availableHeight) {
      height = Math.floor(availableHeight);
      width = Math.floor(height * aspect);
    }

    frame.style.width = width + "px";
    frame.style.height = height + "px";
    frame.style.aspectRatio = "auto";
    shell.style.setProperty("--room-viewport-frame-width", width + "px");
    shell.style.setProperty("--room-viewport-frame-height", height + "px");
  }

  function addControls(shell) {
    if (shell.dataset.roomViewportControls === "false") return;
    if (shell.querySelector(".room-viewport-controls")) return;

    var controls = document.createElement("div");
    controls.className = "room-viewport-controls";
    controls.setAttribute("aria-label", "Room view size controls");
    controls.innerHTML = '<span>View</span><button type="button" data-room-viewport-size="smaller" aria-label="Make room view smaller">−</button><button type="button" data-room-viewport-size="reset" aria-label="Reset room view size">Reset</button><button type="button" data-room-viewport-size="larger" aria-label="Make room view larger">+</button>';
    shell.appendChild(controls);
  }

  function installShell(shell) {
    addControls(shell);
    fitShell(shell);
  }

  function installAll() {
    document.querySelectorAll("[data-room-viewport]").forEach(installShell);
    document.body.dataset.roomViewportReady = "true";
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-room-viewport-size]");
    if (!button) return;

    var shell = button.closest("[data-room-viewport]") || document.querySelector("[data-room-viewport]");
    if (!shell) return;

    event.preventDefault();

    var action = button.dataset.roomViewportSize;
    var current = roomScale(shell);
    if (action === "smaller") setRoomScale(shell, current - STEP);
    if (action === "larger") setRoomScale(shell, current + STEP);
    if (action === "reset") resetRoomScale(shell);
  });

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
