(function () {
  "use strict";

  var SAVE_KEY = "esslay-study-cave-simple-v1";
  var IMPORT_FORMAT = "esslay-source-library";
  var IMPORT_VERSION = 1;
  var MAX_IMPORTED_CARDS = 500;

  function arr(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }

  function clean(value, limit) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit || 500);
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>\"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character];
    });
  }

  function uid() {
    return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function now() {
    return new Date().toISOString();
  }

  function load() {
    var state = null;
    try { state = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (error) { state = null; }
    if (!state || typeof state !== "object") state = {};
    state.completed = arr(state.completed);
    state.unlocked = arr(state.unlocked);
    state.sourceMine = state.sourceMine && typeof state.sourceMine === "object" ? state.sourceMine : {};
    state.sourceMine.sources = arr(state.sourceMine.sources);
    state.sourceMine.sourceLibrary = arr(state.sourceMine.sourceLibrary);
    state.sourceMine.sieveQueue = arr(state.sourceMine.sieveQueue);
    state.sourceMine.evidenceGems = arr(state.sourceMine.evidenceGems);
    state.sourceMine.parkedChunks = arr(state.sourceMine.parkedChunks);
    state.sourceMine.discardedChunks = arr(state.sourceMine.discardedChunks);
    state.sourceMine.wordConstellations = arr(state.sourceMine.wordConstellations);
    state.sourceMine.reviewedCount = Number(state.sourceMine.reviewedCount || 0);
    state.lastSavedAt = state.lastSavedAt || "Not saved yet";
    state.lastAction = state.lastAction || "Ready";
    return state;
  }

  function save(state, message) {
    state.lastSavedAt = now();
    state.lastAction = message || "Saved locally";
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function splitSource(text) {
    var paragraphs = String(text || "").replace(/\r/g, "\n").split(/\n{2,}/).map(function (part) {
      return clean(part, 1100);
    }).filter(Boolean);
    var chunks = [];
    paragraphs.forEach(function (paragraph) {
      if (paragraph.length <= 420) {
        chunks.push(paragraph);
        return;
      }
      var sentencePieces = paragraph.match(/[^.!?]+[.!?]?/g) || [paragraph];
      sentencePieces.map(function (part) { return clean(part, 500); }).filter(function (part) {
        return part.length > 30;
      }).forEach(function (part) { chunks.push(part); });
    });
    if (!chunks.length) {
      chunks = (String(text || "").match(/[^.!?]+[.!?]?/g) || []).map(function (part) {
        return clean(part, 500);
      }).filter(function (part) { return part.length > 30; });
    }
    return chunks.slice(0, 80);
  }

  function pageText(content) {
    var lines = [];
    var line = "";
    var lastY = null;
    arr(content && content.items).forEach(function (item) {
      var text = clean(item && item.str, 4000);
      if (!text) return;
      var y = item && item.transform ? Math.round(Number(item.transform[5]) || 0) : null;
      var newLine = lastY !== null && y !== null && Math.abs(y - lastY) > 3;
      if (newLine && line) {
        lines.push(line);
        line = "";
      }
      line += (line && !/[-\u2010\u2011]$/.test(line) ? " " : "") + text;
      if (item && item.hasEOL && line) {
        lines.push(line);
        line = "";
      }
      lastY = y;
    });
    if (line) lines.push(line);
    return lines.map(function (value) { return clean(value, 5000); }).filter(Boolean).join("\n\n");
  }

  async function pdfJs() {
    if (window.EsslayPdfReady && typeof window.EsslayPdfReady.then === "function") {
      return window.EsslayPdfReady;
    }
    if (window.pdfjsLib) return window.pdfjsLib;

    window.EsslayPdfReady = import("./assets/vendor/pdfjs/pdf.mjs").then(function (pdfjsLib) {
      if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "./assets/vendor/pdfjs/pdf.worker.mjs";
      }
      return pdfjsLib;
    });

    return window.EsslayPdfReady;
  }

  async function extractPdf(file, progress) {
    if (!file || !/\.pdf$/i.test(file.name || "")) {
      throw new Error("Choose a PDF file first.");
    }

    var pdfjs = await pdfJs();
    if (!pdfjs || typeof pdfjs.getDocument !== "function") {
      throw new Error("The local PDF reader did not load.");
    }

    var bytes = new Uint8Array(await file.arrayBuffer());
    var task = pdfjs.getDocument({ data: bytes });
    var documentProxy;
    try {
      documentProxy = await task.promise;
    } catch (error) {
      if (error && (error.name === "PasswordException" || error.code === 1 || error.code === 2)) {
        throw new Error("This PDF is password-protected. Unlock it first, then import it again.");
      }
      throw new Error("This file could not be read as a PDF.");
    }

    var pages = [];
    var meaningfulCharacters = 0;
    for (var pageNumber = 1; pageNumber <= documentProxy.numPages; pageNumber += 1) {
      if (typeof progress === "function") progress(pageNumber, documentProxy.numPages);
      var page = await documentProxy.getPage(pageNumber);
      var content = await page.getTextContent();
      var text = pageText(content);
      meaningfulCharacters += text.replace(/\s/g, "").length;
      if (text) pages.push({ pageNumber: pageNumber, text: text });
    }
    var pageCount = documentProxy.numPages;
    if (documentProxy.destroy) documentProxy.destroy();

    if (meaningfulCharacters < 80 || !pages.length) {
      var ocrError = new Error("OCR needed: no readable text was found in this PDF. Use an OCR version of the file or paste copied text instead.");
      ocrError.code = "ocr-needed";
      throw ocrError;
    }

    return { pageCount: pageCount, pages: pages };
  }

  function sourceById(state, sourceId) {
    return arr(state.sourceMine.sourceLibrary).find(function (source) { return source.id === sourceId; }) || null;
  }

  function cardById(state, cardId) {
    var collections = ["sieveQueue", "parkedChunks", "discardedChunks"];
    for (var i = 0; i < collections.length; i += 1) {
      var card = arr(state.sourceMine[collections[i]]).find(function (candidate) { return candidate.id === cardId; });
      if (card) return card;
    }
    return null;
  }

  function removeCard(state, cardId) {
    var found = null;
    ["sieveQueue", "parkedChunks", "discardedChunks"].forEach(function (key) {
      state.sourceMine[key] = arr(state.sourceMine[key]).filter(function (card) {
        if (card.id === cardId) found = found || card;
        return card.id !== cardId;
      });
    });
    return found;
  }

  function selectedBuckets(form) {
    return Array.prototype.slice.call(form.querySelectorAll('input[name="bucket"]:checked')).map(function (input) {
      return clean(input.value, 80);
    }).filter(Boolean);
  }

  function bucketId(bucket) {
    return clean(bucket, 80).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "bucket";
  }

  function openTab(tab) {
    var state = load();
    state.sourceMine.activeTab = tab;
    if (tab === "sieve") state.sourceMine.userOpenedEmptySieve = true;
    save(state, state.lastAction);
    var button = document.querySelector('[data-action="source-tab"][data-tab="' + tab + '"]');
    if (button) button.click();
  }

  function field(form, name) {
    var input = form && form.querySelector('[name="' + name + '"]');
    return input ? input.value : "";
  }

  function defaultTitle(filename) {
    return clean(String(filename || "").replace(/\.pdf$/i, "").replace(/[_-]+/g, " "), 240) || "Untitled PDF source";
  }

  function createPdfCards(file, title, citationLabel, extracted) {
    var state = load();
    var pages = arr(extracted.pages);
    var importedCards = [];
    var limited = false;

    pages.forEach(function (page) {
      if (limited) return;
      splitSource(page.text).forEach(function (chunk, index) {
        if (importedCards.length >= MAX_IMPORTED_CARDS) {
          limited = true;
          return;
        }
        importedCards.push({
          text: chunk,
          pageNumber: page.pageNumber,
          chunkIndex: index + 1
        });
      });
    });

    if (!importedCards.length) {
      throw new Error("OCR needed: this PDF did not contain enough readable text to make source cards.");
    }

    var source = {
      id: uid(),
      title: clean(title, 240) || defaultTitle(file.name),
      citationLabel: clean(citationLabel, 240) || clean(title, 240) || defaultTitle(file.name),
      type: "pdf-text",
      importType: "pdf-text",
      originalFilename: clean(file.name, 260),
      pageCount: Number(extracted.pageCount || pages.length || 0),
      chunkCount: importedCards.length,
      preview: clean(importedCards[0].text, 220),
      createdAt: now(),
      limitedAtCardCount: limited ? MAX_IMPORTED_CARDS : null
    };

    var cards = importedCards.map(function (item) {
      return {
        id: uid(),
        sourceId: source.id,
        sourceTitle: source.title,
        citationLabel: source.citationLabel,
        originalFilename: source.originalFilename,
        pageNumber: item.pageNumber,
        chunkIndex: item.chunkIndex,
        index: item.chunkIndex - 1,
        text: item.text,
        matchBuckets: [],
        status: "new",
        createdAt: source.createdAt
      };
    });

    state.sourceMine.sourceLibrary.push(source);
    state.sourceMine.sources.push({
      id: source.id,
      title: source.title,
      note: "Imported from local PDF into Crystal Sieve",
      citationLabel: source.citationLabel,
      originalFilename: source.originalFilename,
      importType: source.importType,
      pageCount: source.pageCount,
      createdAt: source.createdAt
    });
    state.sourceMine.sieveQueue = arr(state.sourceMine.sieveQueue).concat(cards);
    state.sourceMine.activeCardId = cards[0].id;
    state.sourceMine.activeTab = "sieve";
    state.sourceMine.userOpenedEmptySieve = true;
    save(state, "Created " + cards.length + " PDF source card" + (cards.length === 1 ? "" : "s") + (limited ? " (first " + MAX_IMPORTED_CARDS + " only)" : ""));
    openTab("sieve");
  }

  function status(text) {
    var node = document.querySelector("[data-pdf-import-status]");
    if (node) node.textContent = text;
  }

  async function importPdf() {
    var form = document.querySelector("[data-source-library-form]");
    var fileInput = form && form.querySelector("[data-source-pdf-file]");
    var file = fileInput && fileInput.files ? fileInput.files[0] : null;
    if (!file) return status("Choose a PDF file first.");

    status("Reading “" + clean(file.name, 120) + "”…");
    try {
      var extracted = await extractPdf(file, function (current, total) {
        status("Reading page " + current + " of " + total + "…");
      });
      createPdfCards(file, field(form, "title"), field(form, "citationLabel"), extracted);
    } catch (error) {
      status(error && error.message ? error.message : "The PDF could not be imported.");
    }
  }

  function download(filename, text, mimeType) {
    var blob = new Blob([text], { type: mimeType || "application/json" });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  function exportLibrary() {
    var state = load();
    var sourceMine = state.sourceMine;
    var payload = {
      format: IMPORT_FORMAT,
      version: IMPORT_VERSION,
      exportedAt: now(),
      sourceMine: {
        sources: sourceMine.sources,
        sourceLibrary: sourceMine.sourceLibrary,
        sieveQueue: sourceMine.sieveQueue,
        evidenceGems: sourceMine.evidenceGems,
        parkedChunks: sourceMine.parkedChunks,
        discardedChunks: sourceMine.discardedChunks,
        wordConstellations: sourceMine.wordConstellations,
        reviewedCount: sourceMine.reviewedCount
      }
    };
    var stamp = new Date().toISOString().slice(0, 10);
    download("esslay-source-library-" + stamp + ".json", JSON.stringify(payload, null, 2));
    status("Source Library JSON exported. Keep it somewhere safe.");
  }

  function validRecord(record) {
    return record && typeof record === "object" && clean(record.id, 200);
  }

  function validSource(source) {
    return validRecord(source) && clean(source.title, 240) && clean(source.citationLabel || source.title, 240);
  }

  function validCard(card) {
    return validRecord(card) && clean(card.sourceId, 200) && clean(card.text, 1600);
  }

  function validGem(gem) {
    return validRecord(gem) && clean(gem.sourceId, 200) && clean(gem.evidence, 1600) && clean(gem.bucket, 80);
  }

  function mergeById(current, incoming, validator) {
    var seen = {};
    arr(current).forEach(function (item) { if (item && item.id) seen[item.id] = true; });
    arr(incoming).filter(validator).forEach(function (item) {
      if (!seen[item.id]) {
        current.push(item);
        seen[item.id] = true;
      }
    });
  }

  function importPayload(payload) {
    if (!payload || payload.format !== IMPORT_FORMAT || Number(payload.version) !== IMPORT_VERSION || !payload.sourceMine || typeof payload.sourceMine !== "object") {
      throw new Error("That is not a valid Esslay Source Library backup.");
    }

    var incoming = payload.sourceMine;
    var sourceCount = arr(incoming.sourceLibrary).filter(validSource).length;
    var cardCount = arr(incoming.sieveQueue).filter(validCard).length + arr(incoming.parkedChunks).filter(validCard).length + arr(incoming.discardedChunks).filter(validCard).length;
    if (!sourceCount && !cardCount) {
      throw new Error("This backup has no valid sources or source cards to import.");
    }

    var state = load();
    mergeById(state.sourceMine.sourceLibrary, incoming.sourceLibrary, validSource);
    mergeById(state.sourceMine.sources, incoming.sources, validRecord);
    mergeById(state.sourceMine.sieveQueue, incoming.sieveQueue, validCard);
    mergeById(state.sourceMine.evidenceGems, incoming.evidenceGems, validGem);
    mergeById(state.sourceMine.parkedChunks, incoming.parkedChunks, validCard);
    mergeById(state.sourceMine.discardedChunks, incoming.discardedChunks, validCard);
    var existingGroups = {};
    state.sourceMine.wordConstellations.forEach(function (group) {
      if (group && clean(group.bucket, 80)) existingGroups[clean(group.bucket, 80).toLowerCase()] = true;
    });
    arr(incoming.wordConstellations).forEach(function (group) {
      var key = group && clean(group.bucket, 80).toLowerCase();
      if (key && arr(group.terms).length && !existingGroups[key]) {
        state.sourceMine.wordConstellations.push(group);
        existingGroups[key] = true;
      }
    });
    state.sourceMine.reviewedCount = Math.max(state.sourceMine.reviewedCount, Number(incoming.reviewedCount || 0));
    save(state, "Merged Source Library backup");
    openTab("add");
  }

  function chooseBackup() {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          importPayload(JSON.parse(String(reader.result || "")));
        } catch (error) {
          status(error && error.message ? error.message : "The backup could not be imported.");
        }
      };
      reader.onerror = function () { status("The backup file could not be read."); };
      reader.readAsText(file);
    });
    input.click();
  }

  function sortWithProvenance(button) {
    var form = button.closest("[data-sieve-sort-form]");
    if (!form) return;
    var state = load();
    var card = removeCard(state, form.dataset.cardId);
    if (!card) return openTab("sieve");
    var buckets = selectedBuckets(form);
    if (!buckets.length) {
      state.sourceMine.sieveQueue.unshift(card);
      state.sourceMine.activeCardId = card.id;
      save(state, "Choose at least one bucket");
      return openTab("sieve");
    }

    var note = clean(new FormData(form).get("note"), 900);
    var source = sourceById(state, card.sourceId) || {};
    buckets.forEach(function (bucket) {
      state.sourceMine.evidenceGems.push({
        id: uid(),
        bucket: bucket,
        bucketId: bucketId(bucket),
        sourceId: card.sourceId,
        sourceCardId: card.id,
        sourceTitle: card.sourceTitle || source.title || "source",
        citationLabel: card.citationLabel || source.citationLabel || card.sourceTitle || "source",
        originalFilename: card.originalFilename || source.originalFilename || "",
        importType: card.importType || source.importType || source.type || "pasted-text",
        pageNumber: Number(card.pageNumber || 0) || null,
        chunkIndex: Number(card.chunkIndex || card.index || 0) || 0,
        evidence: clean(card.text, 1600),
        note: note,
        link: note,
        matchWords: arr(card.matchBuckets).filter(function (match) {
          return clean(match.bucket, 80).toLowerCase() === clean(bucket, 80).toLowerCase();
        }).map(function (match) { return arr(match.matchWords); })[0] || [],
        createdAt: now()
      });
    });
    state.sourceMine.reviewedCount += 1;
    if (state.unlocked.indexOf("draft-route") === -1) state.unlocked.push("draft-route");
    state.sourceMine.activeCardId = "";
    save(state, "Evidence gem saved with source details");
    openTab("sieve");
  }

  function addStyles() {
    if (document.querySelector("style[data-source-pdf-import-v1]")) return;
    var style = document.createElement("style");
    style.setAttribute("data-source-pdf-import-v1", "");
    style.textContent = ".source-pdf-import{margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,231,171,.32)}.source-pdf-import input[type=file]{padding:7px;background:rgba(255,255,255,.92)}.source-pdf-status{min-height:1.3em;font-size:.86rem;font-weight:800}.source-backup-actions{margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,231,171,.24)}.source-card-provenance{font-size:.84rem;opacity:.9}";
    document.head.appendChild(style);
  }

  function enhance() {
    addStyles();
    var form = document.querySelector("[data-source-library-form]");
    if (form && !form.querySelector("[data-source-pdf-file]")) {
      var pdfControls = document.createElement("section");
      pdfControls.className = "source-pdf-import";
      pdfControls.innerHTML =
        '<p class="source-small-note"><strong>Import PDF locally:</strong> choose a selectable-text PDF. It is read in this browser only and is not uploaded to GitHub or a server.</p>' +
        '<label>Choose PDF<input type="file" accept="application/pdf,.pdf" data-source-pdf-file></label>' +
        '<p class="source-pdf-status" data-pdf-import-status aria-live="polite"></p>' +
        '<div class="simple-actions"><button type="button" data-action="source-import-pdf">Read PDF into Crystal Sieve</button></div>';
      form.appendChild(pdfControls);

      var backups = document.createElement("section");
      backups.className = "source-backup-actions";
      backups.innerHTML = '<p class="source-small-note"><strong>Source Library backup:</strong> export only Source Mine data, then merge it safely in another browser.</p><div class="simple-actions"><button type="button" data-action="source-export-library">Export Source Library JSON</button><button type="button" data-action="source-import-library">Import Source Library JSON</button></div>';
      form.parentNode.appendChild(backups);
    }

    document.querySelectorAll('[data-action="source-sort-card"]').forEach(function (button) {
      button.dataset.action = "source-sort-card-with-source-meta";
    });

    var sieveForm = document.querySelector("[data-sieve-sort-form]");
    if (sieveForm && !sieveForm.parentNode.querySelector("[data-source-card-provenance]")) {
      var state = load();
      var card = cardById(state, sieveForm.dataset.cardId);
      if (card && card.pageNumber) {
        var meta = document.createElement("p");
        meta.className = "source-card-provenance";
        meta.setAttribute("data-source-card-provenance", "");
        meta.innerHTML = "<strong>PDF location:</strong> " + esc(card.originalFilename || "PDF") + " · page " + esc(card.pageNumber) + " · chunk " + esc(card.chunkIndex || 1);
        sieveForm.parentNode.insertBefore(meta, sieveForm);
      }
    }
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button) return;
    var action = button.dataset.action || "";
    if (action === "source-import-pdf") {
      event.preventDefault();
      event.stopImmediatePropagation();
      importPdf();
    }
    if (action === "source-export-library") {
      event.preventDefault();
      event.stopImmediatePropagation();
      exportLibrary();
    }
    if (action === "source-import-library") {
      event.preventDefault();
      event.stopImmediatePropagation();
      chooseBackup();
    }
    if (action === "source-sort-card-with-source-meta") {
      event.preventDefault();
      event.stopImmediatePropagation();
      sortWithProvenance(button);
    }
  }, true);

  var stage = document.getElementById("stage-scene");
  if (stage && window.MutationObserver) {
    new MutationObserver(function () { enhance(); }).observe(stage, { childList: true, subtree: true });
  }
  document.addEventListener("DOMContentLoaded", enhance);
  window.setTimeout(enhance, 0);
})();
