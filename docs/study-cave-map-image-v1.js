// Illustrated Study Cave Task Map.
// This does nothing on normal cave load. It replaces the existing Task Map
// content and styles only after the native Task Map details panel opens.
(function () {
  var PANEL_ID = "map-board-panel";
  var MAP_IMAGE = "assets/study-cave/study-cave-map-v01.jpg?v=3";

  function hotspot(label, action, left, top, width, height) {
    return '<button type="button" data-action="' + action + '" aria-label="' + label + '" title="' + label + '" style="position:absolute;left:' + left + '%;top:' + top + '%;width:' + width + '%;height:' + height + '%;z-index:2;border:0;border-radius:14px;background:transparent;color:transparent;cursor:pointer;"></button>';
  }

  function applyMapOverlayStyle(panel) {
    var summary = panel.querySelector("summary");
    var closeButton = panel.querySelector(".panel-close");

    panel.style.cssText = [
      "position:absolute !important",
      "left:48.5% !important",
      "top:48% !important",
      "width:min(580px, calc(100% - 42px)) !important",
      "max-width:none !important",
      "max-height:calc(100% - 28px) !important",
      "overflow:visible !important",
      "transform:translate(-50%, -50%) !important",
      "margin:0 !important",
      "padding:0 !important",
      "z-index:170 !important",
      "border:0 !important",
      "border-radius:0 !important",
      "background:transparent !important",
      "box-shadow:none !important",
      "color:inherit !important"
    ].join(";");

    if (summary) {
      summary.style.cssText = "display:none !important;";
    }

    if (closeButton) {
      closeButton.style.cssText = [
        "position:absolute !important",
        "top:-16px !important",
        "right:-16px !important",
        "float:none !important",
        "margin:0 !important",
        "z-index:6 !important",
        "width:42px !important",
        "height:42px !important",
        "border:2px solid rgba(255,232,177,.92) !important",
        "border-radius:999px !important",
        "background:rgba(43,29,23,.96) !important",
        "color:#fff1cf !important",
        "font-size:1.35rem !important",
        "font-weight:900 !important",
        "line-height:1 !important",
        "cursor:pointer !important",
        "box-shadow:0 5px 16px rgba(0,0,0,.42) !important"
      ].join(";");
    }
  }

  function renderImageMap() {
    var panel = document.getElementById(PANEL_ID);
    var mount = panel && panel.querySelector("[data-task-map]");
    if (!panel || !panel.open || !mount) return;

    applyMapOverlayStyle(panel);

    mount.style.cssText = "padding:0 !important;margin:0 !important;width:100% !important;";
    mount.innerHTML = '' +
      '<section aria-label="Illustrated Study Cave map" style="position:relative;width:100%;aspect-ratio:4 / 3;min-height:0;overflow:hidden;border-radius:18px;background:transparent;box-shadow:0 20px 52px rgba(0,0,0,.52);">' +
        '<img src="' + MAP_IMAGE + '" alt="Illustrated Study Cave task map" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;">' +
        hotspot("Open Cave Base", "enter-cave-base", 4, 9, 28, 26) +
        hotspot("Open Brief Fog", "open-brief-fog", 35, 12, 28, 21) +
        hotspot("Open Source Mine", "open-source-mine", 70, 8, 25, 26) +
        hotspot("Open Draft Route", "open-draft-route", 5, 36, 30, 24) +
        hotspot("Open Paragraph Forge", "open-paragraph-forge", 37, 38, 26, 21) +
        hotspot("Open Bridge Hall", "open-bridge-hall", 68, 34, 29, 27) +
        hotspot("Open Citation Vault", "open-citation-vault", 4, 64, 31, 27) +
        hotspot("Open Polish Pool", "open-polish-pool", 37, 66, 28, 25) +
        hotspot("Open Submission Gate", "open-submission-gate", 67, 64, 27, 28) +
      '</section>';
  }

  function observeMapPanel() {
    var panel = document.getElementById(PANEL_ID);
    if (!panel || typeof MutationObserver === "undefined") return;

    var observer = new MutationObserver(function () {
      if (panel.open) window.setTimeout(renderImageMap, 0);
    });

    observer.observe(panel, { attributes: true, attributeFilter: ["open"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observeMapPanel);
  } else {
    observeMapPanel();
  }
})();
