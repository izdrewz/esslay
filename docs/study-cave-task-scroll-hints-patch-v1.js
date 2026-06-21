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

  core.__currentBossHintPatch = true;
})();
