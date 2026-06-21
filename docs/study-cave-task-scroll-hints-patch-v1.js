(function () {
  "use strict";

  var core = window.EsslayTaskScrollCore;
  if (!core || core.__currentBossHintPatch) return;

  function correct(fragment) {
    var value = String(fragment && fragment.text || "").toLowerCase();
    if (/\bcurrent boss\b|\btask i am doing now\b/.test(value)) {
      fragment.suggestedRole = "current-boss";
    }
    return fragment;
  }

  function repairSavedScroll() {
    var state = core.load();
    var scroll = state && state.briefFog && state.briefFog.taskScroll;
    if (!scroll || !Array.isArray(scroll.fragments)) return;
    var changed = false;
    scroll.fragments.forEach(function (fragment) {
      var before = fragment.suggestedRole;
      correct(fragment);
      if (fragment.suggestedRole !== before) changed = true;
    });
    if (changed) core.save(state, "Quest Scroll Current Boss hint repaired");
  }

  var originalCreateScroll = core.createScroll;
  core.createScroll = function (data) {
    if (data && Array.isArray(data.fragments)) data.fragments.forEach(correct);
    return originalCreateScroll(data);
  };

  var originalExtractPdf = core.extractPdf;
  core.extractPdf = async function (file, progress) {
    var result = await originalExtractPdf(file, progress);
    if (result && Array.isArray(result.fragments)) result.fragments.forEach(correct);
    return result;
  };

  repairSavedScroll();
  core.__currentBossHintPatch = true;
})();
