(function () {
  "use strict";

  var core = window.EsslayTaskScrollCore;
  if (!core || core.__flatFragmentSplitPatch) return;

  function sentences(raw) {
    var value = String(raw || "").replace(/\s+/g, " ").trim();
    if (!value) return [];
    var parts = value.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [value];
    return parts.map(function (part) { return core.text(part, 2200); }).filter(function (part) { return part.length >= 24; });
  }

  function shouldSplit(fragment) {
    var value = String(fragment && fragment.text || "");
    var punctuation = (value.match(/[.!?]/g) || []).length;
    return !fragment.role && fragment.status !== "parked" && value.length > 360 && punctuation >= 3;
  }

  function roleHint(fragment) {
    var value = String(fragment.text || "").toLowerCase();
    if (/\bcurrent boss\b|\btask i am doing now\b/.test(value)) {
      fragment.suggestedRole = "current-boss";
    }
    return fragment;
  }

  function splitFragments(fragments) {
    var output = [];
    fragments.forEach(function (fragment) {
      if (!shouldSplit(fragment)) {
        output.push(roleHint(fragment));
        return;
      }
      var pieces = sentences(fragment.text);
      if (pieces.length < 2) {
        output.push(roleHint(fragment));
        return;
      }
      pieces.forEach(function (piece, index) {
        var next = core.fragment(piece, fragment.pageNumber, Number(fragment.chunkIndex || 0) + index);
        next.createdAt = fragment.createdAt || core.iso();
        output.push(roleHint(next));
      });
    });
    return output;
  }

  function repairSavedScroll() {
    var state = core.load();
    var scroll = state && state.briefFog && state.briefFog.taskScroll;
    if (!scroll || !Array.isArray(scroll.fragments)) return;
    var hasDecision = scroll.fragments.some(function (fragment) { return fragment.role || fragment.status === "parked"; });
    if (hasDecision || !scroll.fragments.some(shouldSplit)) return;
    scroll.fragments = splitFragments(scroll.fragments);
    core.save(state, "Quest Scroll fragments separated for the Fog Sieve");
  }

  var originalCreateScroll = core.createScroll;
  core.createScroll = function (data) {
    if (data && Array.isArray(data.fragments)) data.fragments = splitFragments(data.fragments);
    return originalCreateScroll(data);
  };

  var originalExtractPdf = core.extractPdf;
  core.extractPdf = async function (file, progress) {
    var result = await originalExtractPdf(file, progress);
    if (result && Array.isArray(result.fragments)) result.fragments = splitFragments(result.fragments);
    return result;
  };

  repairSavedScroll();
  core.__flatFragmentSplitPatch = true;
})();
