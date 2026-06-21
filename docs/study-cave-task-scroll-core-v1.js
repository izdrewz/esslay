(function () {
  "use strict";

  var SAVE_KEY = "esslay-study-cave-simple-v1";
  var FORMAT = "esslay-task-scroll";
  var VERSION = 1;
  var MAX = 160;
  var ROLES = {
    "": "Choose a role",
    "current-boss": "Current Boss / task I am doing now",
    "quest-part": "Quest Part / separate subtask",
    "required-evidence": "Required Evidence / ingredient to gather",
    "key-scope": "Key Scope / concept ingredient",
    "crafting-rule": "Crafting Rule / structure or style",
    "reference-rule": "Reference Rule",
    "boss-success-condition": "Boss Success Condition / marking target",
    "admin-detail": "Admin Detail / deadline or submission fact",
    "parked": "Park for later"
  };

  function list(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
  function text(value, limit) { return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit || 700); }
  function id() { return "task-scroll-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8); }
  function iso() { return new Date().toISOString(); }
  function stamp() { try { return new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit", second:"2-digit"}); } catch (error) { return iso(); } }

  function emptyScroll() {
    return { version: VERSION, title: "", originalFilename: "", importType: "", pageCount: 0, fragments: [], createdAt: "", updatedAt: "", recipeConfirmedAt: "" };
  }

  function normalise(scroll) {
    if (!scroll || typeof scroll !== "object") return emptyScroll();
    scroll.version = Number(scroll.version || VERSION);
    scroll.title = text(scroll.title, 240);
    scroll.originalFilename = text(scroll.originalFilename, 260);
    scroll.importType = text(scroll.importType, 40);
    scroll.pageCount = Number(scroll.pageCount || 0);
    scroll.fragments = list(scroll.fragments).map(function (fragment) {
      return {
        id: text(fragment.id, 160) || id(),
        text: text(fragment.text, 2200),
        pageNumber: Number(fragment.pageNumber || 0) || null,
        chunkIndex: Number(fragment.chunkIndex || 0) || 0,
        role: ROLES[fragment.role] ? fragment.role : "",
        note: text(fragment.note, 900),
        suggestedRole: ROLES[fragment.suggestedRole] ? fragment.suggestedRole : "",
        status: fragment.status === "parked" ? "parked" : (fragment.role ? "kept" : "unsorted"),
        createdAt: fragment.createdAt || scroll.createdAt || iso(),
        decidedAt: fragment.decidedAt || ""
      };
    }).filter(function (fragment) { return fragment.text; });
    return scroll;
  }

  function load() {
    var state = null;
    try { state = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (error) { state = null; }
    if (!state || typeof state !== "object") state = {};
    state.completed = list(state.completed);
    state.unlocked = list(state.unlocked);
    state.flags = list(state.flags);
    state.missedLoot = list(state.missedLoot);
    state.briefFog = state.briefFog && typeof state.briefFog === "object" ? state.briefFog : {};
    state.briefFog.chunks = list(state.briefFog.chunks);
    state.briefFog.chunkTags = state.briefFog.chunkTags && typeof state.briefFog.chunkTags === "object" ? state.briefFog.chunkTags : {};
    state.briefFog.taskScroll = normalise(state.briefFog.taskScroll);
    state.lastSavedAt = state.lastSavedAt || "Not saved yet";
    state.lastAction = state.lastAction || "Ready";
    return state;
  }

  function save(state, message) {
    state.lastSavedAt = stamp();
    state.lastAction = message || "Saved locally";
    state.briefFog.taskScroll = normalise(state.briefFog.taskScroll);
    state.briefFog.taskScroll.updatedAt = iso();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    document.querySelectorAll("[data-flow-progress]").forEach(function (node) { node.textContent = list(state.completed).length + " / 7"; });
  }

  function loadPdfJs() {
    if (window.EsslayPdfReady && typeof window.EsslayPdfReady.then === "function") return window.EsslayPdfReady;
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    window.EsslayPdfReady = import("./assets/vendor/pdfjs/pdf.mjs").then(function (pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "./assets/vendor/pdfjs/pdf.worker.mjs";
      return pdfjsLib;
    });
    return window.EsslayPdfReady;
  }

  function pageText(content) {
    var out = [], line = "", previousY = null;
    list(content && content.items).forEach(function (item) {
      var value = text(item && item.str, 4000);
      if (!value) return;
      var y = item && item.transform ? Math.round(Number(item.transform[5]) || 0) : null;
      if (previousY !== null && y !== null && Math.abs(y - previousY) > 3 && line) { out.push(line); line = ""; }
      line += (line && !/[-\u2010\u2011]$/.test(line) ? " " : "") + value;
      if (item && item.hasEOL && line) { out.push(line); line = ""; }
      previousY = y;
    });
    if (line) out.push(line);
    return out.map(function (value) { return text(value, 5000); }).filter(Boolean).join("\n\n");
  }

  function heading(value) {
    return /^(part\s*\d+\b|task\b|emTMA\b|TMA\b|important\b|guidance\b|marking grid\b|writing style\b|engaging with\b|resubmission\b|overall word limit\b|module pass threshold\b|reflection\b)/i.test(text(value, 220));
  }

  function splitTaskText(raw) {
    var lines = String(raw || "").replace(/\r/g, "\n").split(/\n+/).map(function (value) { return text(value, 900); }).filter(Boolean);
    var chunks = [], current = "";
    function push() { var value = text(current, 1800); if (value.length >= 24) chunks.push(value); current = ""; }
    lines.forEach(function (line) {
      if (heading(line) && current) push();
      if (!current) current = line;
      else if (current.length + line.length + 1 <= 700) current += " " + line;
      else { push(); current = line; }
    });
    push();
    return chunks.slice(0, MAX);
  }

  function suggest(raw) {
    var value = String(raw || "").toLowerCase();
    if (/\bpart\s+\d+\b/.test(value)) return "quest-part";
    if (/\b(task|evaluate|analyse|analyze|compare|discuss|explain|write an essay|write a report)\b/.test(value)) return "current-boss";
    if (/\bmust include|at least one|at least two|required|specific evidence|videos?|transcripts?\b/.test(value)) return "required-evidence";
    if (/\bbiological|neurological|psychological|social context|scope|focus on\b/.test(value)) return "key-scope";
    if (/\bthird person|first person|objective writing|introduction|conclusion|structure|paragraph\b/.test(value)) return "crafting-rule";
    if (/\breference|referencing|citation|reference list|own words|paraphras\b/.test(value)) return "reference-rule";
    if (/\bmarking grid|focus on the task|understanding of concepts|quality of writing|use of evidence|pass\b/.test(value)) return "boss-success-condition";
    if (/\bdeadline|cut-off|per cent|resubmission|overall assessment|submit\b/.test(value)) return "admin-detail";
    return "";
  }

  function fragment(raw, pageNumber, chunkIndex) {
    return { id:id(), text:text(raw, 2200), pageNumber:pageNumber || null, chunkIndex:chunkIndex || 0, role:"", note:"", suggestedRole:suggest(raw), status:"unsorted", createdAt:iso(), decidedAt:"" };
  }

  async function extractPdf(file, progress) {
    if (!file || !/\.pdf$/i.test(file.name || "")) throw new Error("Choose an assignment PDF first.");
    var pdfjs = await loadPdfJs();
    var task = pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())});
    var documentProxy;
    try {
      documentProxy = await task.promise;
    } catch (error) {
      if (error && (error.name === "PasswordException" || error.code === 1 || error.code === 2)) {
        throw new Error("This PDF is password-protected. Unlock it first, then import it again.");
      }
      throw new Error("This file could not be read as an assignment PDF.");
    }
    var pageCount = documentProxy.numPages, totalText = 0, fragments = [];
    for (var page = 1; page <= pageCount; page += 1) {
      if (progress) progress(page, pageCount);
      var pdfPage = await documentProxy.getPage(page);
      var pageValue = pageText(await pdfPage.getTextContent());
      totalText += pageValue.replace(/\s/g, "").length;
      splitTaskText(pageValue).forEach(function (chunk, index) { if (fragments.length < MAX) fragments.push(fragment(chunk, page, index + 1)); });
    }
    if (documentProxy.destroy) documentProxy.destroy();
    if (totalText < 80 || !fragments.length) throw new Error("OCR needed: no readable task text was found in this PDF. Use an OCR version or paste the brief text instead.");
    return {pageCount:pageCount, fragments:fragments};
  }

  function createScroll(data) {
    var state = load();
    state.briefFog.taskScroll = normalise({ version:VERSION, title:text(data.title, 240) || "Quest Scroll", originalFilename:text(data.originalFilename, 260), importType:data.importType || "pasted-text", pageCount:Number(data.pageCount || 0), fragments:data.fragments || [], createdAt:iso(), updatedAt:iso(), recipeConfirmedAt:"" });
    state.current = "brief-fog";
    save(state, "Quest Scroll ready for the Fog Sieve");
    return state;
  }

  function unsorted(scroll) { return list(scroll.fragments).filter(function (item) { return !item.role && item.status !== "parked"; }); }
  function group(scroll, role) { return list(scroll.fragments).filter(function (item) { return item.role === role; }); }
  function recipe(scroll) { return { bosses:group(scroll,"current-boss"), parts:group(scroll,"quest-part"), ingredients:group(scroll,"required-evidence").concat(group(scroll,"key-scope")), crafting:group(scroll,"crafting-rule"), references:group(scroll,"reference-rule"), success:group(scroll,"boss-success-condition"), admin:group(scroll,"admin-detail"), parked:group(scroll,"parked"), unsorted:unsorted(scroll) }; }

  window.EsslayTaskScrollCore = {
    SAVE_KEY: SAVE_KEY,
    FORMAT: FORMAT,
    VERSION: VERSION,
    ROLES: ROLES,
    list: list,
    text: text,
    id: id,
    iso: iso,
    load: load,
    save: save,
    emptyScroll: emptyScroll,
    normalise: normalise,
    extractPdf: extractPdf,
    splitTaskText: splitTaskText,
    fragment: fragment,
    createScroll: createScroll,
    unsorted: unsorted,
    recipe: recipe
  };
})();
