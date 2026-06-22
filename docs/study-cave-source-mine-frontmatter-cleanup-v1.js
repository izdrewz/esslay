(function () {
  "use strict";

  var SAVE_KEY = "esslay-study-cave-simple-v1";
  var rerendering = false;

  if (window.__esslaySourceMineFrontmatterCleanupV1) return;
  window.__esslaySourceMineFrontmatterCleanupV1 = true;

  function arr(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }

  function clean(value, limit) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit || 500);
  }

  function load() {
    var state = null;
    try { state = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (error) { state = null; }
    if (!state || typeof state !== "object") state = {};
    state.sourceMine = state.sourceMine && typeof state.sourceMine === "object" ? state.sourceMine : {};
    state.sourceMine.sources = arr(state.sourceMine.sources);
    state.sourceMine.sourceLibrary = arr(state.sourceMine.sourceLibrary);
    state.sourceMine.sieveQueue = arr(state.sourceMine.sieveQueue);
    state.sourceMine.parkedChunks = arr(state.sourceMine.parkedChunks);
    state.sourceMine.discardedChunks = arr(state.sourceMine.discardedChunks);
    state.sourceMine.evidenceGems = arr(state.sourceMine.evidenceGems);
    return state;
  }

  function save(state, message) {
    state.lastSavedAt = new Date().toISOString();
    state.lastAction = message || "Saved locally";
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function removeTrailingReferenceLabel(text) {
    return clean(String(text || "").split(/reference label for testing only:/i)[0], 2000);
  }

  function isTestBoilerplate(text) {
    var value = clean(text, 2200).toLowerCase();
    if (!value) return true;
    return [
      "selectable-text pdf for source mine testing",
      "original practice source for pdf import",
      "suggested citation label",
      "designed to test selectable text",
      "this is not a real academic publication",
      "practice essay question",
      "use this reading as a test source in the source mine",
      "using the source in source mine",
      "questions to use while testing",
      "reference label for testing only",
      "original test material created for esslay pdf import testing"
    ].some(function (phrase) { return value.indexOf(phrase) !== -1; });
  }

  function activeSourceId(state) {
    var active = String(state.sourceMine.activeCardId || "");
    var activeCard = arr(state.sourceMine.sieveQueue).find(function (card) { return card.id === active; });
    if (activeCard && activeCard.importType === "pdf-text") return activeCard.sourceId;
    var firstPdf = arr(state.sourceMine.sieveQueue).find(function (card) { return card.importType === "pdf-text"; });
    return firstPdf ? firstPdf.sourceId : "";
  }

  function reindex(cards) {
    var pageCounts = {};
    return cards.map(function (card, index) {
      var page = Number(card.pageNumber || 0) || 1;
      pageCounts[page] = Number(pageCounts[page] || 0) + 1;
      card.index = index;
      card.chunkIndex = pageCounts[page];
      return card;
    });
  }

  function cleanOneImportedSource() {
    if (rerendering) return;
    var state = load();
    var sourceId = activeSourceId(state);
    if (!sourceId) return;
    var source = arr(state.sourceMine.sourceLibrary).find(function (item) { return item.id === sourceId; });
    if (!source || source.importType !== "pdf-text" || source.frontmatterCleanupV1) return;

    var originalQueue = arr(state.sourceMine.sieveQueue);
    var queue = originalQueue.map(function (card) {
      if (card.sourceId !== sourceId) return card;
      card.text = removeTrailingReferenceLabel(card.text);
      return card;
    }).filter(function (card) {
      return card.sourceId !== sourceId || (card.text.length >= 170 && !isTestBoilerplate(card.text));
    });

    var keptForSource = reindex(queue.filter(function (card) { return card.sourceId === sourceId; }));
    var byId = {};
    keptForSource.forEach(function (card) { byId[card.id] = card; });
    state.sourceMine.sieveQueue = queue.map(function (card) {
      return card.sourceId === sourceId && byId[card.id] ? byId[card.id] : card;
    });

    source.chunkCount = keptForSource.length;
    source.preview = clean(keptForSource[0] && keptForSource[0].text, 220);
    source.frontmatterCleanupV1 = true;
    if (!keptForSource.length) {
      state.sourceMine.activeCardId = "";
      save(state, "No readable evidence passages remained after PDF cleanup");
      return;
    }
    if (!byId[state.sourceMine.activeCardId]) state.sourceMine.activeCardId = keptForSource[0].id;
    save(state, "Filtered PDF headings and test boilerplate");

    rerendering = true;
    var sieve = document.querySelector('[data-action="source-tab"][data-tab="sieve"]');
    if (sieve) sieve.click();
    window.setTimeout(function () { rerendering = false; }, 0);
  }

  function normaliseSuggestionUi() {
    var form = document.querySelector("[data-sieve-sort-form]");
    if (!form) return;
    var state = load();
    var card = arr(state.sourceMine.sieveQueue).find(function (item) { return item.id === form.dataset.cardId; });
    if (!card || card.importType !== "pdf-text") return;

    var high = card.suggestionConfidence === "high" && arr(card.matchBuckets).length === 1;
    if (!high) {
      form.querySelectorAll('input[name="bucket"]').forEach(function (box) { box.checked = false; });
      form.parentNode.querySelectorAll(".source-suggestions small").forEach(function (node) { node.remove(); });
      var suggestionLine = Array.prototype.slice.call(form.parentNode.querySelectorAll("p")).find(function (node) {
        return /Suggested bucket:/i.test(node.textContent || "");
      });
      if (suggestionLine) suggestionLine.innerHTML = "<strong>Suggested bucket:</strong> <span class=\"source-chip\">needs sorting</span>";
    }
  }

  function run() {
    window.setTimeout(function () {
      cleanOneImportedSource();
      normaliseSuggestionUi();
    }, 0);
  }

  var stage = document.getElementById("stage-scene");
  if (stage && window.MutationObserver) {
    new MutationObserver(run).observe(stage, { childList: true, subtree: true });
  }
  document.addEventListener("DOMContentLoaded", run);
})();
