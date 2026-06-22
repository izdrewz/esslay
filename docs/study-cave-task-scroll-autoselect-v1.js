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

  function loadAutoFog() {
    if (window.__esslayTaskScrollAutoFogLoading || window.__esslayTaskScrollAutoFogLoaded) return;
    window.__esslayTaskScrollAutoFogLoading = true;
    var paths = [
      "study-cave-task-scroll-auto-fog-v1.js?v=1",
      "study-cave-task-scroll-auto-fog-ui-v2.js?v=1"
    ];
    var index = 0;

    function next() {
      if (index >= paths.length) return;
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
  document.addEventListener("click", function () { window.setTimeout(scan, 0); }, true);

  var stage = document.getElementById("stage-scene");
  if (stage && window.MutationObserver) {
    new MutationObserver(scan).observe(stage, { childList: true, subtree: true });
  }

  window.setTimeout(function () {
    scan();
    loadAutoFog();
  }, 0);
})();
