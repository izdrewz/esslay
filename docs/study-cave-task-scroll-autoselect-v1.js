(function () {
  "use strict";

  if (window.__esslayTaskScrollAutoselectLoaded) return;
  window.__esslayTaskScrollAutoselectLoaded = true;

  function applyEstimate(form) {
    if (!form || form.dataset.estimateReady === "true") return;
    var select = form.querySelector('select[name="role"]');
    if (!select || select.value) return;
    var suggested = Array.prototype.slice.call(select.options).find(function (option) {
      return option.value && /\(suggested\)\s*$/.test(option.textContent || "");
    });
    if (!suggested) return;
    select.value = suggested.value;
    form.dataset.estimateReady = "true";
    var explanation = form.querySelector(".ts-note");
    if (explanation) {
      explanation.innerHTML = "<strong>Estimated role:</strong> " + suggested.textContent.replace(/\s*\(suggested\)\s*$/, "") + ". It is selected for you. Change it only if it does not fit.";
    }
    var save = form.querySelector('[data-action="task-scroll-save"]');
    if (save) save.textContent = "Keep estimated role → next";
    select.addEventListener("change", function () {
      if (save) save.textContent = "Keep chosen role → next";
      if (explanation) explanation.textContent = "Your chosen role will be saved. You can still edit it later in Review / edit fragments.";
    }, { once: true });
  }

  function scan() {
    document.querySelectorAll("[data-task-scroll-form]").forEach(applyEstimate);
  }

  function scrollReady() {
    var core = window.EsslayTaskScrollCore;
    if (!core || typeof core.load !== "function") return false;
    var state = core.load();
    return !!(state && state.briefFog && state.briefFog.taskScroll && Array.isArray(state.briefFog.taskScroll.fragments) && state.briefFog.taskScroll.fragments.length);
  }

  function installPrimaryTaskGuard() {
    var fog = window.EsslayTaskScrollAutoFog;
    if (!fog || fog.__primaryTaskGuard) return;
    fog.__primaryTaskGuard = true;
    var primary = ["current", "boss"].join("-");
    var originalGroup = fog.group;

    function routeChoice(fragment) {
      var value = String(fragment && fragment.text || "").toLowerCase();
      return value.indexOf("use part") !== -1 && value.indexOf("only as the current") !== -1;
    }

    function correctedGroup(state) {
      var groups = originalGroup(state);
      var moved = [];
      groups.bright = groups.bright.filter(function (fragment) {
        if (!fragment.auto || fragment.auto.role !== primary || !routeChoice(fragment)) return true;
        fragment.auto.role = "quest-part";
        fragment.auto.confidence = "medium";
        fragment.auto.signals = ["part selection", "route instruction"];
        fragment.auto.alternatives = [{ role: primary, score: fragment.auto.score || 0 }];
        moved.push(fragment);
        return false;
      });
      if (moved.length) groups.knots = moved.concat(groups.knots);
      return groups;
    }

    fog.group = correctedGroup;
    fog.acceptBright = function (state) {
      var groups = correctedGroup(state);
      groups.bright.forEach(function (fragment) {
        fog.choose(state, fragment.id, fragment.auto.role, fragment.note, "auto");
      });
      return groups.bright.length;
    };
  }

  function showAutomaticFogAfterImport() {
    var attempts = 0;
    function tryOpen() {
      var autoUi = window.EsslayTaskScrollAutoFogUI;
      installPrimaryTaskGuard();
      if (scrollReady() && autoUi && typeof autoUi.reading === "function") {
        autoUi.reading();
        return;
      }
      attempts += 1;
      if (attempts < 120) window.setTimeout(tryOpen, 50);
    }
    window.setTimeout(tryOpen, 0);
  }

  function loadAutoFog() {
    if (window.__esslayTaskScrollAutoFogLoading || window.__esslayTaskScrollAutoFogLoaded) return;
    window.__esslayTaskScrollAutoFogLoading = true;
    var paths = [
      "study-cave-task-scroll-auto-fog-v1.js?v=1",
      "study-cave-task-scroll-auto-fog-ui-v2.js?v=1"
    ];
    var index = 0;
    function next() {
      if (index >= paths.length) {
        window.__esslayTaskScrollAutoFogLoaded = true;
        installPrimaryTaskGuard();
        return;
      }
      var script = document.createElement("script");
      script.src = paths[index];
      script.onload = function () {
        index += 1;
        next();
      };
      script.onerror = function () {
        window.__esslayTaskScrollAutoFogLoading = false;
        console.error("Esslay automatic Fog module failed to load:", paths[index]);
      };
      document.head.appendChild(script);
    }
    next();
  }

  document.addEventListener("DOMContentLoaded", function () {
    scan();
    loadAutoFog();
  });
  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (button && (button.dataset.action === "task-scroll-import-pdf" || button.dataset.action === "task-scroll-import-paste")) {
      showAutomaticFogAfterImport();
    }
    window.setTimeout(scan, 0);
  }, true);

  var stage = document.getElementById("stage-scene");
  if (stage && window.MutationObserver) {
    new MutationObserver(scan).observe(stage, { childList: true, subtree: true });
  }

  window.setTimeout(function () {
    scan();
    loadAutoFog();
    installPrimaryTaskGuard();
  }, 0);
})();
