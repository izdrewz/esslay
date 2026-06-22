(function () {
  "use strict";

  var SAVE_KEY = "esslay-study-cave-simple-v1";
  var MAX_IMPORTED_CARDS = 120;
  var TARGET_MIN = 180;
  var TARGET_MAX = 760;

  if (window.__esslaySourceMineImportFixV1) return;
  window.__esslaySourceMineImportFixV1 = true;

  function arr(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }

  function clean(value, limit) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit || 500);
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character];
    });
  }

  function uid() {
    return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function load() {
    var state = null;
    try { state = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (error) { state = null; }
    if (!state || typeof state !== "object") state = {};
    state.completed = arr(state.completed);
    state.unlocked = arr(state.unlocked);
    state.briefFog = state.briefFog && typeof state.briefFog === "object" ? state.briefFog : {};
    state.briefFog.chunks = arr(state.briefFog.chunks);
    state.sourceMine = state.sourceMine && typeof state.sourceMine === "object" ? state.sourceMine : {};
    state.sourceMine.sources = arr(state.sourceMine.sources);
    state.sourceMine.sourceLibrary = arr(state.sourceMine.sourceLibrary);
    state.sourceMine.sieveQueue = arr(state.sourceMine.sieveQueue);
    state.sourceMine.evidenceGems = arr(state.sourceMine.evidenceGems);
    state.sourceMine.parkedChunks = arr(state.sourceMine.parkedChunks);
    state.sourceMine.discardedChunks = arr(state.sourceMine.discardedChunks);
    state.sourceMine.wordConstellations = arr(state.sourceMine.wordConstellations);
    state.sourceMine.reviewedCount = Number(state.sourceMine.reviewedCount || 0);
    return state;
  }

  function save(state, message) {
    state.lastSavedAt = new Date().toISOString();
    state.lastAction = message || "Saved locally";
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function sourceTitle(filename) {
    return clean(String(filename || "").replace(/\.pdf$/i, "").replace(/[_-]+/g, " "), 240) || "Untitled PDF source";
  }

  function getBuckets(state) {
    var map = state.briefFog && state.briefFog.taskMap;
    var buckets = map && arr(map.buckets).length ? arr(map.buckets) : arr(state.briefFog.chunks).map(function (chunk) {
      return clean(chunk.text || chunk.action || chunk.plain, 80);
    });
    var seen = {};
    return buckets.map(function (bucket) { return clean(bucket, 80); }).filter(function (bucket) {
      var key = bucket.toLowerCase();
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function defaultTerms(bucket) {
    var key = clean(bucket, 80).toLowerCase();
    var terms = {
      "task clarity evidence": ["question", "task", "clarify", "clarity", "asking", "interpret", "focus", "provisional answer"],
      "evidence organisation": ["organise", "organising", "organisation", "organize", "evidence", "extract", "group", "sections", "order", "structure"],
      "flexible revision": ["flexible", "revise", "revision", "revised", "adjust", "changes", "change", "direction", "working guide"],
      "avoid over-planning": ["limitation", "limit", "delay", "perfect", "too broad", "simplified", "action", "next step"],
      "planning": ["plan", "planning", "structure", "outline", "order", "organise", "organising", "prepare"],
      "source notes": ["source", "sources", "note", "notes", "keywords", "search", "highlight", "paraphrase", "own words"],
      "drafting": ["draft", "drafting", "write", "writing", "sentence", "paragraph", "paragraphs"],
      "proofreading": ["proofread", "proofreading", "check", "checking", "grammar", "mistake", "errors", "edit"],
      "referencing habits": ["reference", "referencing", "citation", "cite", "acknowledge", "source", "own words"]
    };
    return terms[key] ? terms[key].slice() : key.split(/\s+/).filter(function (term) { return term.length > 2; });
  }

  function suggestionFor(text, buckets) {
    var lower = " " + clean(text, 4000).toLowerCase() + " ";
    var matches = buckets.map(function (bucket) {
      var hits = [];
      defaultTerms(bucket).forEach(function (term) {
        var escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        var boundary = new RegExp("(^|[^a-z])" + escaped + "([^a-z]|$)", "i");
        if (boundary.test(lower) && hits.indexOf(term) === -1) hits.push(term);
      });
      return { bucket: bucket, score: hits.length, matchWords: hits };
    }).filter(function (match) { return match.score > 0; }).sort(function (a, b) {
      return b.score - a.score;
    });

    var top = matches[0];
    var next = matches[1];
    var isHigh = !!top && top.score >= 2 && (!next || top.score > next.score);
    return {
      confidence: isHigh ? "high" : (top ? "low" : "none"),
      highMatch: isHigh ? top : null,
      matches: matches.slice(0, 3)
    };
  }

  function median(values) {
    var sorted = values.filter(function (value) { return value > 0 && isFinite(value); }).sort(function (a, b) { return a - b; });
    if (!sorted.length) return 16;
    var middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function lineData(content) {
    var lines = [];
    var current = "";
    var currentY = null;
    var lastY = null;

    arr(content && content.items).forEach(function (item) {
      var text = clean(item && item.str, 4000);
      if (!text) return;
      var y = item && item.transform ? Number(item.transform[5]) : null;
      var newLine = current && y !== null && lastY !== null && Math.abs(y - lastY) > 3;
      if (newLine) {
        lines.push({ text: clean(current, 5000), y: currentY });
        current = "";
        currentY = y;
      }
      if (!current) currentY = y;
      current += (current && !/[-\u2010\u2011]$/.test(current) ? " " : "") + text;
      if (item && item.hasEOL && current) {
        lines.push({ text: clean(current, 5000), y: currentY });
        current = "";
        currentY = null;
      }
      lastY = y;
    });
    if (current) lines.push({ text: clean(current, 5000), y: currentY });
    return lines.filter(function (line) { return line.text; });
  }

  function headerKey(text) {
    return clean(text, 220).toLowerCase().replace(/\bpage\s+\d+\b/g, "page #").replace(/\d+/g, "#");
  }

  function isPageLabel(text) {
    var value = clean(text, 240);
    return /^page\s*\d+$/i.test(value) || (/page\s*\d+$/i.test(value) && value.length < 180);
  }

  function isHeading(text) {
    var value = clean(text, 240);
    if (!value || value.length > 105 || /[.!?;:]$/.test(value)) return false;
    var words = value.split(/\s+/);
    if (words.length > 13) return false;
    var letters = value.replace(/[^A-Za-z]/g, "");
    var capitals = (value.match(/[A-Z]/g) || []).length;
    return words.length <= 8 || (letters && capitals / letters.length > 0.14);
  }

  function paragraphise(lines, repeatedHeaders) {
    var cleanLines = lines.filter(function (line) {
      var key = headerKey(line.text);
      return !isPageLabel(line.text) && !repeatedHeaders[key];
    });
    var gaps = [];
    for (var i = 1; i < cleanLines.length; i += 1) {
      if (cleanLines[i].y !== null && cleanLines[i - 1].y !== null) gaps.push(Math.abs(cleanLines[i].y - cleanLines[i - 1].y));
    }
    var regularGap = median(gaps);
    var paragraphGap = Math.max(22, regularGap * 1.45);
    var groups = [];
    var current = [];
    cleanLines.forEach(function (line, index) {
      var previous = cleanLines[index - 1];
      var gap = previous && line.y !== null && previous.y !== null ? Math.abs(line.y - previous.y) : 0;
      if (current.length && gap > paragraphGap) {
        groups.push(current);
        current = [];
      }
      current.push(line.text);
    });
    if (current.length) groups.push(current);

    var paragraphs = [];
    var pendingHeading = "";
    groups.forEach(function (group) {
      var value = clean(group.join(" "), 5000);
      if (!value) return;
      if (isHeading(value)) {
        pendingHeading = pendingHeading ? pendingHeading + " — " + value : value;
        return;
      }
      if (pendingHeading) {
        value = pendingHeading + " — " + value;
        pendingHeading = "";
      }
      if (value.length >= 70) paragraphs.push(value);
    });
    return paragraphs;
  }

  function sentenceParts(text) {
    return (String(text || "").match(/[^.!?]+[.!?]+(?:["”']+)?|[^.!?]+$/g) || [text]).map(function (part) {
      return clean(part, 1400);
    }).filter(function (part) { return part.length >= 30; });
  }

  function semanticChunks(paragraphs) {
    var chunks = [];
    var pending = "";

    function pushLongParagraph(paragraph) {
      if (paragraph.length <= TARGET_MAX) {
        chunks.push(paragraph);
        return;
      }
      var buffer = "";
      sentenceParts(paragraph).forEach(function (sentence) {
        if (buffer && buffer.length + sentence.length + 1 > TARGET_MAX) {
          chunks.push(buffer);
          buffer = "";
        }
        buffer = clean(buffer + " " + sentence, TARGET_MAX + TARGET_MIN);
      });
      if (buffer) chunks.push(buffer);
    }

    paragraphs.forEach(function (paragraph) {
      if (paragraph.length < 80) return;
      if (paragraph.length < TARGET_MIN) {
        pending = clean(pending + " " + paragraph, TARGET_MAX);
        if (pending.length >= TARGET_MIN) {
          chunks.push(pending);
          pending = "";
        }
        return;
      }
      if (pending) {
        if (pending.length + paragraph.length + 1 <= TARGET_MAX) {
          paragraph = clean(pending + " " + paragraph, TARGET_MAX);
          pending = "";
        } else {
          chunks.push(pending);
          pending = "";
        }
      }
      pushLongParagraph(paragraph);
    });
    if (pending) {
      if (chunks.length && pending.length < TARGET_MIN) {
        chunks[chunks.length - 1] = clean(chunks[chunks.length - 1] + " " + pending, TARGET_MAX + TARGET_MIN);
      } else {
        chunks.push(pending);
      }
    }
    return chunks.filter(function (chunk) {
      return chunk.length >= TARGET_MIN && !isHeading(chunk) && !isPageLabel(chunk);
    });
  }

  async function pdfJs() {
    if (window.EsslayPdfReady && typeof window.EsslayPdfReady.then === "function") return window.EsslayPdfReady;
    if (window.pdfjsLib) return window.pdfjsLib;
    window.EsslayPdfReady = import("./assets/vendor/pdfjs/pdf.mjs").then(function (pdfjsLib) {
      if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) pdfjsLib.GlobalWorkerOptions.workerSrc = "./assets/vendor/pdfjs/pdf.worker.mjs";
      return pdfjsLib;
    });
    return window.EsslayPdfReady;
  }

  async function extractPdf(file, progress) {
    if (!file || !/\.pdf$/i.test(file.name || "")) throw new Error("Choose a PDF file first.");
    var pdfjs = await pdfJs();
    var bytes = new Uint8Array(await file.arrayBuffer());
    var task = pdfjs.getDocument({ data: bytes });
    var documentProxy;
    try {
      documentProxy = await task.promise;
    } catch (error) {
      if (error && (error.name === "PasswordException" || error.code === 1 || error.code === 2)) throw new Error("This PDF is password-protected. Unlock it first, then import it again.");
      throw new Error("This file could not be read as a PDF.");
    }

    var rawPages = [];
    var meaningful = 0;
    for (var pageNumber = 1; pageNumber <= documentProxy.numPages; pageNumber += 1) {
      if (typeof progress === "function") progress(pageNumber, documentProxy.numPages);
      var page = await documentProxy.getPage(pageNumber);
      var lines = lineData(await page.getTextContent());
      meaningful += lines.map(function (line) { return line.text; }).join("").replace(/\s/g, "").length;
      rawPages.push({ pageNumber: pageNumber, lines: lines });
    }
    var pageCount = documentProxy.numPages;
    if (documentProxy.destroy) documentProxy.destroy();
    if (meaningful < 80) {
      var ocr = new Error("OCR needed: no readable text was found in this PDF. Use an OCR version of the file or paste copied text instead.");
      ocr.code = "ocr-needed";
      throw ocr;
    }

    var headerCounts = {};
    rawPages.forEach(function (page) {
      var seen = {};
      page.lines.forEach(function (line) {
        var key = headerKey(line.text);
        if (!key || line.text.length > 180 || seen[key]) return;
        seen[key] = true;
        headerCounts[key] = Number(headerCounts[key] || 0) + 1;
      });
    });
    var repeatedHeaders = {};
    Object.keys(headerCounts).forEach(function (key) {
      if (headerCounts[key] >= 2) repeatedHeaders[key] = true;
    });

    return {
      pageCount: pageCount,
      pages: rawPages.map(function (page) {
        return { pageNumber: page.pageNumber, paragraphs: paragraphise(page.lines, repeatedHeaders) };
      })
    };
  }

  function status(text) {
    var node = document.querySelector("[data-pdf-import-status]");
    if (node) node.textContent = text;
  }

  function createPdfCards(file, title, citationLabel, extracted) {
    var state = load();
    var buckets = getBuckets(state);
    var source = {
      id: uid(),
      title: clean(title, 240) || sourceTitle(file.name),
      citationLabel: clean(citationLabel, 240) || clean(title, 240) || sourceTitle(file.name),
      type: "pdf-text",
      importType: "pdf-text",
      originalFilename: clean(file.name, 260),
      pageCount: Number(extracted.pageCount || 0),
      chunkCount: 0,
      preview: "",
      createdAt: new Date().toISOString()
    };
    var imported = [];
    arr(extracted.pages).forEach(function (page) {
      semanticChunks(arr(page.paragraphs)).forEach(function (text) {
        if (imported.length >= MAX_IMPORTED_CARDS) return;
        var suggestion = suggestionFor(text, buckets);
        imported.push({
          id: uid(),
          sourceId: source.id,
          sourceTitle: source.title,
          citationLabel: source.citationLabel,
          originalFilename: source.originalFilename,
          importType: source.importType,
          pageNumber: page.pageNumber,
          chunkIndex: imported.filter(function (card) { return card.pageNumber === page.pageNumber; }).length + 1,
          index: imported.length,
          text: text,
          matchBuckets: suggestion.highMatch ? [suggestion.highMatch] : [],
          suggestionConfidence: suggestion.confidence,
          suggestionMatches: suggestion.matches,
          status: "new",
          createdAt: source.createdAt
        });
      });
    });
    if (!imported.length) throw new Error("OCR needed: this PDF did not contain enough readable paragraph text to make source cards.");
    source.chunkCount = imported.length;
    source.preview = clean(imported[0].text, 220);

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
    state.sourceMine.sieveQueue = arr(state.sourceMine.sieveQueue).concat(imported);
    state.sourceMine.activeCardId = imported[0].id;
    state.sourceMine.activeTab = "sieve";
    state.sourceMine.userOpenedEmptySieve = true;
    save(state, "Created " + imported.length + " readable PDF source card" + (imported.length === 1 ? "" : "s"));
    var tab = document.querySelector('[data-action="source-tab"][data-tab="sieve"]');
    if (tab) tab.click();
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
      createPdfCards(file, form.querySelector('[name="title"]').value, form.querySelector('[name="citationLabel"]').value, extracted);
    } catch (error) {
      status(error && error.message ? error.message : "The PDF could not be imported.");
    }
  }

  function cardSuggestionState() {
    var form = document.querySelector("[data-sieve-sort-form]");
    if (!form) return;
    var state = load();
    var cardId = form.dataset.cardId;
    var all = arr(state.sourceMine.sieveQueue).concat(arr(state.sourceMine.parkedChunks), arr(state.sourceMine.discardedChunks));
    var item = all.find(function (candidate) { return candidate.id === cardId; });
    if (!item) return;

    var boxes = Array.prototype.slice.call(form.querySelectorAll('input[name="bucket"]'));
    var high = item.suggestionConfidence === "high" && arr(item.matchBuckets).length === 1 ? item.matchBuckets[0] : null;
    boxes.forEach(function (box) {
      box.checked = !!high && clean(box.value, 80).toLowerCase() === clean(high.bucket, 80).toLowerCase();
    });

    var host = form.parentNode;
    var existing = host.querySelector("[data-source-import-confidence]");
    if (existing) existing.remove();
    var note = document.createElement("p");
    note.className = "source-small-note";
    note.setAttribute("data-source-import-confidence", "");
    if (high) {
      note.innerHTML = "<strong>High-confidence suggestion:</strong> " + esc(high.bucket) + ". Matched: " + esc(high.matchWords.join(", ")) + ". You can change it.";
    } else if (item.suggestionMatches && item.suggestionMatches.length) {
      note.innerHTML = "<strong>No bucket selected yet.</strong> The wording has a weak or mixed match, so choose only if it genuinely helps.";
    } else {
      note.innerHTML = "<strong>No bucket selected yet.</strong> This card has no reliable automatic match.";
    }
    host.insertBefore(note, form);
  }

  function installStyles() {
    if (document.querySelector("style[data-source-mine-import-fix-v1]")) return;
    var style = document.createElement("style");
    style.setAttribute("data-source-mine-import-fix-v1", "");
    style.textContent = ".source-small-note[data-source-import-confidence]{margin:8px 0;padding:7px 9px;border:1px solid rgba(255,231,171,.32);border-radius:10px;background:rgba(255,255,255,.06)}";
    document.head.appendChild(style);
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button || button.dataset.action !== "source-import-pdf") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    importPdf();
  }, true);

  var stage = document.getElementById("stage-scene");
  if (stage && window.MutationObserver) {
    new MutationObserver(function () {
      installStyles();
      window.setTimeout(cardSuggestionState, 0);
    }).observe(stage, { childList: true, subtree: true });
  }
  document.addEventListener("DOMContentLoaded", function () {
    installStyles();
    window.setTimeout(cardSuggestionState, 0);
  });
})();
