(function () {
  var STORAGE_KEY = "esslay-room-viewport-settings-v1";
  var MIN_SCALE = 0.72;
  var MAX_SCALE = 1;
  var STEP = 0.04;
  var MODES = ["fit", "wide", "fill"];

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

  function defaultMode(shell) {
    return MODES.indexOf(shell.dataset.roomDefaultMode) !== -1 ? shell.dataset.roomDefaultMode : "fit";
  }

  function roomSettings(shell) {
    var settings = loadSettings();
    var key = roomKey(shell);
    settings[key] = settings[key] || {};
    return { all: settings, key: key, room: settings[key] };
  }

  function roomScale(shell) {
    var parts = roomSettings(shell);
    var fallback = numberFrom(shell.dataset.roomDefaultScale, 0.92);
    return clamp(numberFrom(parts.room.scale, fallback), MIN_SCALE, MAX_SCALE);
  }

  function roomMode(shell) {
    var parts = roomSettings(shell);
    var mode = parts.room.mode || defaultMode(shell);
    return MODES.indexOf(mode) !== -1 ? mode : "fit";
  }

  function setRoomScale(shell, scale) {
    var parts = roomSettings(shell);
    parts.room.scale = clamp(scale, MIN_SCALE, MAX_SCALE);
    saveSettings(parts.all);
    fitShell(shell);
  }

  function setRoomMode(shell, mode) {
    if (MODES.indexOf(mode) === -1) return;
    var parts = roomSettings(shell);
    parts.room.mode = mode;
    saveSettings(parts.all);
    fitShell(shell);
  }

  function resetRoom(shell) {
    var parts = roomSettings(shell);
    parts.room.scale = clamp(numberFrom(shell.dataset.roomDefaultScale, 0.92), MIN_SCALE, MAX_SCALE);
    parts.room.mode = defaultMode(shell);
    saveSettings(parts.all);
    fitShell(shell);
  }

  function safeBottom(shell) {
    var desktopFallback = window.innerWidth > 780 ? 76 : 10;
    return numberFrom(shell.dataset.roomSafeBottom, desktopFallback);
  }

  function reserveTop(shell) {
    return numberFrom(shell.dataset.roomReserveTop, 0);
  }

  function setFrameSize(shell, frame, width, height, mode) {
    frame.style.setProperty("width", Math.round(width) + "px", "important");
    frame.style.setProperty("height", Math.round(height) + "px", "important");
    frame.style.setProperty("aspect-ratio", "auto", "important");
    frame.dataset.roomViewportMode = mode;
    shell.dataset.roomViewportMode = mode;
    shell.style.setProperty("--room-viewport-frame-width", Math.round(width) + "px");
    shell.style.setProperty("--room-viewport-frame-height", Math.round(height) + "px");
    updateControls(shell);
  }

  function fitShell(shell) {
    var frame = shell.querySelector("[data-room-viewport-frame]") || shell.querySelector(".room-viewport-frame");
    if (!frame) return;

    var aspect = numberFrom(shell.dataset.roomAspect, 16 / 9);
    var maxWidth = numberFrom(shell.dataset.roomMaxWidth, 1540);
    var padding = numberFrom(shell.dataset.roomViewportPadding, window.innerWidth > 780 ? 10 : 5);
    var bottom = safeBottom(shell);
    var top = reserveTop(shell);
    var availableWidth = Math.max(260, window.innerWidth - padding * 2);
    var availableHeight = Math.max(180, window.innerHeight - padding * 2 - bottom - top);
    var scale = roomScale(shell);
    var mode = roomMode(shell);
    var width;
    var height;

    if (mode === "wide") {
      width = Math.min(maxWidth, availableWidth) * scale;
      height = width / aspect;
      if (height > availableHeight) height = availableHeight;
      width = Math.min(availableWidth, width);
    } else if (mode === "fill") {
      width = Math.min(maxWidth, availableWidth) * scale;
      height = availableHeight * scale;
      if (height > availableHeight) height = availableHeight;
    } else {
      width = Math.min(maxWidth, availableWidth, availableHeight * aspect) * scale;
      height = width / aspect;
      if (height > availableHeight) {
        height = availableHeight;
        width = height * aspect;
      }
    }

    width = Math.max(240, Math.min(availableWidth, width));
    height = Math.max(160, Math.min(availableHeight, height));
    setFrameSize(shell, frame, width, height, mode);
  }

  function controlsMarkup() {
    return '<span>View</span><button type="button" data-room-viewport-mode-button="fit" aria-label="Fit whole room">Fit</button><button type="button" data-room-viewport-mode-button="wide" aria-label="Use more horizontal room">Wide</button><button type="button" data-room-viewport-mode-button="fill" aria-label="Fill available room space">Fill</button><button type="button" data-room-viewport-size="smaller" aria-label="Make room view smaller">−</button><button type="button" data-room-viewport-size="reset" aria-label="Reset room view size">Reset</button><button type="button" data-room-viewport-size="larger" aria-label="Make room view larger">+</button>';
  }

  function updateControls(shell) {
    var mode = roomMode(shell);
    shell.querySelectorAll("[data-room-viewport-mode-button]").forEach(function (button) {
      var active = button.dataset.roomViewportModeButton === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function addControls(shell) {
    if (shell.dataset.roomViewportControls === "false") return;
    if (shell.querySelector(".room-viewport-controls")) {
      updateControls(shell);
      return;
    }

    var slot = shell.querySelector("[data-room-viewport-controls-slot]");
    var controls = document.createElement("div");
    controls.className = "room-viewport-controls";
    controls.setAttribute("aria-label", "Room view size controls");
    controls.innerHTML = controlsMarkup();

    if (slot) {
      controls.classList.add("room-viewport-controls--inline");
      slot.appendChild(controls);
    } else {
      controls.classList.add("room-viewport-controls--floating");
      shell.appendChild(controls);
    }

    updateControls(shell);
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
    var modeButton = event.target.closest("[data-room-viewport-mode-button]");
    var sizeButton = event.target.closest("[data-room-viewport-size]");
    var button = modeButton || sizeButton;
    if (!button) return;

    var shell = button.closest("[data-room-viewport]") || document.querySelector("[data-room-viewport]");
    if (!shell) return;

    event.preventDefault();

    if (modeButton) {
      setRoomMode(shell, modeButton.dataset.roomViewportModeButton);
      return;
    }

    var action = sizeButton.dataset.roomViewportSize;
    var current = roomScale(shell);
    if (action === "smaller") setRoomScale(shell, current - STEP);
    if (action === "larger") setRoomScale(shell, current + STEP);
    if (action === "reset") resetRoom(shell);
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
