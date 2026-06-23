(function () {
  var SAVE_KEY = "esslay-study-cave-simple-v1";

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char];
    });
  }

  function clean(value, limit) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit || 500);
  }

  function arr(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }

  function uid() {
    return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function stamp() {
    try {
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch (error) {
      return new Date().toISOString();
    }
  }

  function load() {
    var state = null;
    try { state = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (error) { state = null; }
    if (!state || typeof state !== "object") state = {};
    state.completed = arr(state.completed);
    state.unlocked = arr(state.unlocked);
    state.briefFog = state.briefFog && typeof state.briefFog === "object" ? state.briefFog : {};
    state.briefFog.chunks = arr(state.briefFog.chunks);
    state.briefFog.taskMap = state.briefFog.taskMap && typeof state.briefFog.taskMap === "object" ? state.briefFog.taskMap : null;
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
    state.lastSavedAt = stamp();
    state.lastAction = message || "Saved locally";
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (error) {}
    document.querySelectorAll("[data-flow-progress]").forEach(function (node) {
      node.textContent = arr(state.completed).length + " / 7";
    });
  }

  function stage() {
    return document.getElementById("stage-scene");
  }

  function closePanels() {
    document.querySelectorAll("details[open]").forEach(function (details) { details.open = false; });
  }

  function getBuckets(state) {
    var mapBuckets = state.briefFog.taskMap && arr(state.briefFog.taskMap.buckets).length ? state.briefFog.taskMap.buckets : [];
    var chunkBuckets = arr(state.briefFog.chunks).map(function (chunk) { return clean(chunk.text || chunk.action || chunk.plain, 80); }).filter(Boolean);
    var buckets = arr(mapBuckets).length ? mapBuckets : chunkBuckets;
    if (!buckets.length) buckets = ["planning", "source notes", "drafting", "proofreading", "referencing habits"];
    var seen = {};
    return buckets.map(function (bucket) { return clean(bucket, 80); }).filter(function (bucket) {
      var key = bucket.toLowerCase();
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function bucketId(bucket) {
    return clean(bucket, 80).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "bucket";
  }

  function tokenise(text) {
    var stop = {};
    "a an and are as at be by can could for from has have how in into is it of on or should that the their this to use using was were what when where which who why with would".split(" ").forEach(function (word) { stop[word] = true; });
    return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(function (token) {
      return token.length > 2 && !stop[token];
    });
  }

  function defaultTerms(bucket) {
    var key = clean(bucket, 80).toLowerCase();
    var defaults = {
      "planning": ["plan", "planning", "structure", "outline", "order", "organise", "prepare", "preparation", "route"],
      "source notes": ["source", "sources", "note", "notes", "keywords", "search", "highlight", "paraphrase", "own words", "module materials"],
      "drafting": ["draft", "drafts", "drafting", "write", "writing", "sentence", "paragraph", "paragraphs", "phrasing"],
      "proofreading": ["proofread", "proofreading", "check", "checking", "grammar", "mistake", "errors", "edit", "complete sentence"],
      "referencing habits": ["reference", "referencing", "citation", "cite", "acknowledge", "acknowledgement", "source", "copy", "own words"],
      "children's voice": ["views", "wishes", "feelings", "participation", "listen", "asked", "taken seriously", "child-centred"],
      "children’s voice": ["views", "wishes", "feelings", "participation", "listen", "asked", "taken seriously", "child-centred"],
      "childhood as social construction": ["social construction", "constructed", "assumptions", "ideas about childhood", "expectations", "stereotypes", "culture"],
      "children's rights": ["uncrc", "rights", "best interests", "participation", "protection", "education", "health", "play", "family"],
      "children’s rights": ["uncrc", "rights", "best interests", "participation", "protection", "education", "health", "play", "family"],
      "young carers": ["care", "carer", "caring", "responsibilities", "household", "emotional support", "school attendance"],
      "attachment": ["mummy", "mother", "parent", "separation", "distress", "hospital", "comfort", "nurse", "crying"]
    };
    return defaults[key] ? defaults[key].slice() : tokenise(key).concat([key]).filter(Boolean);
  }

  function constellationTerms(state, bucket) {
    var saved = arr(state.sourceMine.wordConstellations).find(function (group) {
      return clean(group.bucket, 80).toLowerCase() === clean(bucket, 80).toLowerCase();
    });
    if (saved && arr(saved.terms).length) return arr(saved.terms).map(function (term) { return clean(term, 60).toLowerCase(); }).filter(Boolean);
    return defaultTerms(bucket);
  }

  function matchesForCard(state, text) {
    var lower = String(text || "").toLowerCase();
    return getBuckets(state).map(function (bucket) {
      var hits = [];
      constellationTerms(state, bucket).forEach(function (term) {
        var t = clean(term, 60).toLowerCase();
        if (t && lower.indexOf(t) !== -1 && hits.indexOf(t) === -1) hits.push(t);
      });
      tokenise(bucket).forEach(function (term) {
        if (lower.indexOf(term) !== -1 && hits.indexOf(term) === -1) hits.push(term);
      });
      return { bucket: bucket, score: hits.length, matchWords: hits.slice(0, 8) };
    }).filter(function (match) { return match.score > 0; }).sort(function (a, b) { return b.score - a.score; }).slice(0, 4);
  }

  function splitSource(text) {
    var paragraphs = String(text || "").replace(/\r/g, "\n").split(/\n{2,}/).map(function (part) { return clean(part, 1100); }).filter(Boolean);
    var chunks = [];
    paragraphs.forEach(function (paragraph) {
      if (paragraph.length <= 420) {
        chunks.push(paragraph);
      } else {
        var sentencePieces = paragraph.match(/[^.!?]+[.!?]?/g) || [paragraph];
        sentencePieces.map(function (part) { return clean(part, 500); }).filter(function (part) { return part.length > 30; }).forEach(function (part) { chunks.push(part); });
      }
    });
    if (!chunks.length) {
      chunks = (String(text || "").match(/[^.!?]+[.!?]?/g) || []).map(function (part) { return clean(part, 500); }).filter(function (part) { return part.length > 30; });
    }
    return chunks.slice(0, 80);
  }

  function activeCards(state) {
    return arr(state.sourceMine.sieveQueue).filter(function (card) {
      return card.status !== "sorted" && card.status !== "parked" && card.status !== "discarded";
    });
  }

  function activeCard(state) {
    var queue = activeCards(state);
    var activeId = state.sourceMine.activeCardId;
    if (activeId) {
      var chosen = queue.find(function (card) { return card.id === activeId; });
      if (chosen) return chosen;
    }
    return queue[0] || null;
  }

  function sourceById(state, sourceId) {
    return arr(state.sourceMine.sourceLibrary).find(function (source) { return source.id === sourceId; }) || arr(state.sourceMine.sources).find(function (source) { return source.id === sourceId; }) || null;
  }

  function evidenceFor(state, bucket) {
    return arr(state.sourceMine.evidenceGems).filter(function (gem) {
      return clean(gem.bucket, 80).toLowerCase() === clean(bucket, 80).toLowerCase() || gem.bucketId === bucketId(bucket);
    });
  }

  function saveInfo(state) {
    return '<p class="save-status"><strong>Browser save:</strong> ' + esc(state.lastSavedAt) + ' · ' + esc(state.lastAction) + '</p>';
  }

  function styles() {
    return '<style data-source-mine-sieve-v2>' +
      '.source-mine-card{width:min(560px,42vw)!important;max-height:calc(100% - 92px)!important;overflow:auto!important;padding:14px!important;}' +
      '.source-mine-card h2{margin-bottom:6px!important}.source-mine-card h3{margin:10px 0 6px!important}.source-mine-card p{margin:5px 0!important;line-height:1.22!important;}' +
      '.source-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 10px}.source-tabs button{border:1px solid rgba(236,215,170,.75);border-radius:999px;padding:6px 9px;background:rgba(25,16,10,.88);color:#fff7df;font-weight:900;cursor:pointer}.source-tabs button[aria-current="true"]{background:rgba(255,231,171,.92);color:#2f2118;}' +
      '.source-empty-sieve,.source-sieve-card,.source-bucket-card,.source-constellation{padding:10px;border-radius:14px;border:1px solid rgba(255,231,171,.38);background:rgba(7,10,18,.72);margin:8px 0;}' +
      '.source-card-text{max-height:155px;overflow:auto;padding:8px;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);font-size:.9rem;}' +
      '.source-chip,.source-gem-count{display:inline-block;padding:3px 7px;border-radius:999px;background:rgba(255,231,171,.9);color:#2f2118;font-weight:900;font-size:.78rem;margin:2px;}' +
      '.source-bucket-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:8px 0}.source-bucket-card strong{display:block;color:#fff7df;margin-bottom:4px;}' +
      '.source-vault-gem{list-style:none;margin:8px 0;padding:8px;border:1px solid rgba(255,231,171,.22);border-radius:10px;background:rgba(255,255,255,.05)}.source-vault-evidence{font-weight:800}.source-vault-note,.source-vault-meta{font-size:.82rem;line-height:1.3;opacity:.94;overflow-wrap:anywhere;}.source-vault-meta{margin-top:4px!important;}' +
      '.source-suggestions{display:grid;grid-template-columns:1fr;gap:5px;margin:8px 0}.source-suggestions label{display:block;padding:6px;border-radius:10px;border:1px solid rgba(255,231,171,.26);background:rgba(255,255,255,.06);font-weight:800}.source-suggestions select{display:block;width:100%;box-sizing:border-box;margin-top:4px;padding:8px;border-radius:10px;border:1px solid rgba(236,215,170,.36);font:inherit;background:#fff;color:#2f2118}.source-suggestions small{display:block;opacity:.82;font-weight:700;margin-top:2px;}' +
      '.source-small-note{font-size:.86rem;opacity:.92}.source-review-list{margin:0;padding-left:18px}.source-review-list li{margin:6px 0}' +
      '.source-mine-card textarea,.source-mine-card input,.source-mine-card select{width:100%;box-sizing:border-box;margin-top:4px;padding:8px;border-radius:10px;border:1px solid rgba(236,215,170,.36);font:inherit}.source-mine-card label{display:block;margin:8px 0;font-weight:900}.source-constellation textarea{min-height:48px;}' +
      '@media(max-width:920px){.source-mine-card{width:calc(100% - 28px)!important;max-height:calc(100% - 86px)!important}.source-bucket-grid{grid-template-columns:1fr}}' +
      '</style>';
  }

  function tabs(active) {
    var items = [["sieve", "Crystal Sieve"], ["add", "Add Source"], ["vault", "Bucket Vault"], ["words", "Word Groups"], ["review", "Review Cart"]];
    return '<nav class="source-tabs" aria-label="Source Mine tabs">' + items.map(function (item) {
      return '<button type="button" data-action="source-tab" data-tab="' + item[0] + '" aria-current="' + (active === item[0] ? "true" : "false") + '">' + item[1] + '</button>';
    }).join('') + '</nav>';
  }

  function addPanel() {
    return '<h3>Add Source</h3>' +
      '<p class="source-small-note">Paste copied PDF text, source notes, or a transcript. Then the game cuts it into source cards for the Crystal Sieve.</p>' +
      '<form data-source-library-form>' +
      '<label>Source title<input name="title" placeholder="Unit 1 reading, UNCRC notes, transcript…"></label>' +
      '<label>Citation/source label<input name="citationLabel" placeholder="Short label kept with every evidence gem"></label>' +
      '<label>Source text<textarea name="sourceText" rows="7" placeholder="Paste source text here"></textarea></label>' +
      '<div class="simple-actions"><button type="button" data-action="source-save-library">Create sieve cards</button><button type="button" data-action="source-seed-demo">Seed demo cards</button></div>' +
      '</form>';
  }

  function sievePanel(state) {
    var card = activeCard(state);
    var waiting = activeCards(state).length;
    if (!card) {
      return '<h3>Crystal Sieve</h3>' +
        '<section class="source-empty-sieve">' +
        '<p><strong>The sieve is empty.</strong></p>' +
        '<p>Clicking Crystal Sieve only opens the sorter. It needs source cards before it can show anything to sort.</p>' +
        '<p><strong>Waiting:</strong> ' + waiting + ' · <strong>Reviewed:</strong> ' + state.sourceMine.reviewedCount + '</p>' +
        '<div class="simple-actions"><button type="button" data-action="source-tab" data-tab="add">Add/paste source</button><button type="button" data-action="source-seed-demo">Seed demo cards</button></div>' +
        '</section>';
    }
    var matches = arr(card.matchBuckets).length ? arr(card.matchBuckets) : matchesForCard(state, card.text);
    var buckets = getBuckets(state);
    var source = sourceById(state, card.sourceId);
    var label = card.citationLabel || (source && source.citationLabel) || (source && source.title) || card.sourceTitle || "source";
    var options = buckets.map(function (bucket) {
      return '<option value="' + esc(bucket) + '">' + esc(bucket) + '</option>';
    }).join('');
    var suggested = matches.length ? matches.map(function (match) { return '<span class="source-chip">' + esc(match.bucket) + '</span>'; }).join('') : '<span class="source-chip">needs sorting</span>';
    return '<h3>Crystal Sieve</h3>' +
      '<p><strong>Waiting:</strong> ' + waiting + ' · <strong>Reviewed:</strong> ' + state.sourceMine.reviewedCount + '</p>' +
      '<article class="source-sieve-card">' +
      '<p><strong>Source:</strong> ' + esc(label) + '</p>' +
      '<p><strong>Suggested bucket:</strong> ' + suggested + '</p>' +
      '<div class="source-card-text">' + esc(card.text) + '</div>' +
      '<form data-sieve-sort-form data-card-id="' + esc(card.id) + '">' +
      '<div class="source-suggestions"><label>Save this evidence in<select name="bucket"><option value="">Choose a bucket</option>' + options + '</select></label></div>' +
      '<label>Your note / why useful<textarea name="note" rows="3" placeholder="Optional"></textarea></label>' +
      '<div class="simple-actions"><button type="button" data-action="source-sort-card-select">Save gem</button><button type="button" data-action="source-park-card">Park</button><button type="button" data-action="source-discard-card">Discard</button></div>' +
      '</form></article>';
  }

  function vaultGemMarkup(gem) {
    var title = clean(gem.sourceTitle, 240) || "Source title not stored for this older gem";
    var citation = clean(gem.citationLabel, 240) || "Citation label not stored for this older gem";
    var filename = clean(gem.originalFilename, 260);
    var page = Number(gem.pageNumber || 0);
    var chunk = Number(gem.chunkIndex || 0);
    var note = clean(gem.note || gem.link, 900);
    var location = [];
    if (filename) location.push("PDF file: " + filename);
    if (page) location.push("page " + page);
    if (chunk) location.push("chunk " + chunk);
    if (!location.length) location.push("Pasted source or older gem with no PDF location stored");
    return '<li class="source-vault-gem">' +
      '<p class="source-vault-evidence">' + esc(clean(gem.evidence, 500)) + '</p>' +
      '<p class="source-vault-note"><strong>Your note:</strong> ' + esc(note || "No note added") + '</p>' +
      '<p class="source-vault-meta"><strong>Source title:</strong> ' + esc(title) + '</p>' +
      '<p class="source-vault-meta"><strong>Citation label:</strong> ' + esc(citation) + '</p>' +
      '<p class="source-vault-meta"><strong>Location:</strong> ' + esc(location.join(" · ")) + '</p>' +
      '</li>';
  }

  function vaultPanel(state) {
    var buckets = getBuckets(state);
    var html = '<h3>Bucket Vault</h3><div class="source-bucket-grid">';
    buckets.forEach(function (bucket) {
      var gems = evidenceFor(state, bucket);
      html += '<article class="source-bucket-card"><strong>' + esc(bucket) + '</strong><span class="source-gem-count">' + gems.length + ' evidence gem' + (gems.length === 1 ? '' : 's') + '</span>';
      if (gems.length) {
        html += '<ul class="source-review-list">' + gems.map(vaultGemMarkup).join('') + '</ul>';
      }
      html += '</article>';
    });
    return html + '</div>';
  }

  function wordsPanel(state) {
    var buckets = getBuckets(state);
    return '<h3>Word Groups</h3><p class="source-small-note">These words help future source cards match buckets.</p><form data-constellation-form>' +
      buckets.map(function (bucket, index) {
        var terms = constellationTerms(state, bucket);
        return '<section class="source-constellation"><label>Bucket<input name="bucket-' + index + '" value="' + esc(bucket) + '"></label><label>Related words<textarea name="terms-' + index + '">' + esc(terms.join(', ')) + '</textarea></label></section>';
      }).join('') +
      '<div class="simple-actions"><button type="button" data-action="source-save-constellations">Save word groups</button></div></form>';
  }

  function reviewPanel(state) {
    var parked = arr(state.sourceMine.parkedChunks);
    var discarded = arr(state.sourceMine.discardedChunks);
    function list(cards) {
      if (!cards.length) return '<p>None.</p>';
      return '<ul class="source-review-list">' + cards.slice(0, 12).map(function (card) {
        return '<li>' + esc(clean(card.text, 150)) + '<br><button type="button" data-action="source-restore-card" data-card-id="' + esc(card.id) + '">Restore</button></li>';
      }).join('') + '</ul>';
    }
    return '<h3>Review Cart</h3><p><strong>Parked:</strong> ' + parked.length + ' · <strong>Discarded:</strong> ' + discarded.length + '</p><h4>Parked</h4>' + list(parked) + '<h4>Discarded</h4>' + list(discarded);
  }

  function panelFor(state, tab) {
    if (tab === "add") return addPanel(state);
    if (tab === "vault") return vaultPanel(state);
    if (tab === "words") return wordsPanel(state);
    if (tab === "review") return reviewPanel(state);
    return sievePanel(state);
  }

  function render(tab, message) {
    var state = load();
    var node = stage();
    if (!node) return;
    closePanels();
    node.hidden = false;
    state.current = "source-mine";
    state.sourceMine.started = true;
    var chosenTab = tab || state.sourceMine.activeTab || "add";
    if (!state.sourceMine.sourceLibrary.length && !activeCards(state).length && chosenTab === "sieve" && !state.sourceMine.userOpenedEmptySieve) {
      chosenTab = "add";
    }
    state.sourceMine.activeTab = chosenTab;
    save(state, message || ("Source Mine opened: " + chosenTab));
    node.innerHTML = styles() + '<section class="simple-room source-mine-room"><p class="scene-label">Source Mine</p>' +
      '<button type="button" class="flow-hotspot hotspot-parchment" data-action="source-tab" data-tab="add" data-hotspot-label="Add Source">Add Source</button>' +
      '<button type="button" class="flow-hotspot hotspot-brief-loot" data-action="source-tab" data-tab="vault" data-hotspot-label="Bucket Vault">Bucket Vault</button>' +
      '<button type="button" class="flow-hotspot hotspot-brief-flag" data-action="return-cave-base" data-hotspot-label="Cave Base">Cave Base</button>' +
      '<article class="stage-card simple-card source-mine-card"><h2>Source Mine</h2>' +
      '<p>Sort source cards into Brief Fog buckets. Saved cards become evidence gems.</p>' +
      '<p><strong>Sources:</strong> ' + state.sourceMine.sourceLibrary.length + ' · <strong>Cards waiting:</strong> ' + activeCards(state).length + ' · <strong>Evidence gems:</strong> ' + state.sourceMine.evidenceGems.length + '</p>' +
      saveInfo(state) + tabs(chosenTab) + panelFor(state, chosenTab) +
      '<div class="simple-actions"><button type="button" data-action="return-cave-base">Cave Base</button><button type="button" data-action="open-task-map">Task Map</button>' +
      (state.sourceMine.evidenceGems.length ? '<button type="button" data-action="source-draft-route">Draft Route</button>' : "") +
      '</div>' +
      '</article></section>';
  }

  function createCards(title, citationLabel, text) {
    var state = load();
    var chunks = splitSource(text);
    var source = { id: uid(), title: clean(title, 240) || "Untitled source", citationLabel: clean(citationLabel, 240) || clean(title, 240) || "source", type: "pasted-text", chunkCount: chunks.length, preview: clean(chunks[0] || "", 220), createdAt: new Date().toISOString() };
    var cards = chunks.map(function (chunk, index) {
      return { id: uid(), sourceId: source.id, sourceTitle: source.title, citationLabel: source.citationLabel, index: index, text: chunk, matchBuckets: matchesForCard(state, chunk), status: "new", createdAt: new Date().toISOString() };
    });
    state.sourceMine.sourceLibrary.push(source);
    state.sourceMine.sources.push({ id: source.id, title: source.title, note: "Imported into Crystal Sieve", citationLabel: source.citationLabel, createdAt: source.createdAt });
    state.sourceMine.sieveQueue = arr(state.sourceMine.sieveQueue).concat(cards);
    state.sourceMine.activeCardId = cards.length ? cards[0].id : "";
    state.sourceMine.activeTab = "sieve";
    state.sourceMine.userOpenedEmptySieve = true;
    save(state, "Created " + cards.length + " sieve cards");
    render("sieve", "Created " + cards.length + " sieve cards");
  }

  function saveLibrary() {
    var form = document.querySelector("[data-source-library-form]");
    if (!form) return;
    var data = new FormData(form);
    var text = String(data.get("sourceText") || "").trim();
    if (!text) return render("add", "Paste source text first");
    createCards(data.get("title"), data.get("citationLabel"), text);
  }

  function seedDemo() {
    createCards("Demo Study Skills Source", "Demo source", [
      "Planning helps a writer decide the order of ideas before drafting, so the response has a clearer route.",
      "Taking source notes in your own words helps you understand the material and avoids copied wording sliding into assignments without acknowledgement.",
      "Drafting gives the writer space to build paragraphs before final polishing.",
      "Proofreading helps check whether sentences are complete, clear, and grammatically accurate.",
      "Referencing habits keep the source attached to the idea so the evidence can be acknowledged later."
    ].join("\n\n"));
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
    var select = form.querySelector('select[name="bucket"]');
    var bucket = clean(select && select.value, 80);
    return bucket ? [bucket] : [];
  }

  function sortCard() {
    var form = document.querySelector("[data-sieve-sort-form]");
    if (!form) return;
    var state = load();
    var card = removeCard(state, form.dataset.cardId);
    if (!card) return render("sieve", "Card was already handled");
    var buckets = selectedBuckets(form);
    if (!buckets.length) {
      state.sourceMine.sieveQueue.unshift(card);
      state.sourceMine.activeCardId = card.id;
      save(state, "Choose a bucket");
      return render("sieve", "Choose a bucket");
    }
    var note = clean(new FormData(form).get("note"), 900);
    var source = sourceById(state, card.sourceId) || {};
    buckets.forEach(function (bucket) {
      var match = arr(card.matchBuckets).find(function (item) { return item.bucket.toLowerCase() === bucket.toLowerCase(); });
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
        matchWords: match ? arr(match.matchWords) : [],
        createdAt: new Date().toISOString()
      });
    });
    state.sourceMine.reviewedCount += 1;
    if (state.unlocked.indexOf("draft-route") === -1) state.unlocked.push("draft-route");
    state.sourceMine.activeCardId = "";
    save(state, "Evidence gem saved");
    render("sieve", "Evidence gem saved");
  }

  function moveCard(kind) {
    var form = document.querySelector("[data-sieve-sort-form]");
    if (!form) return;
    var state = load();
    var card = removeCard(state, form.dataset.cardId);
    if (!card) return render("sieve", "Card was already handled");
    card.status = kind;
    card.reviewedAt = new Date().toISOString();
    if (kind === "parked") state.sourceMine.parkedChunks.unshift(card);
    if (kind === "discarded") state.sourceMine.discardedChunks.unshift(card);
    state.sourceMine.reviewedCount += 1;
    if (state.unlocked.indexOf("draft-route") === -1) state.unlocked.push("draft-route");
    state.sourceMine.activeCardId = "";
    save(state, kind === "parked" ? "Card parked" : "Card discarded");
    render("sieve", kind === "parked" ? "Card parked" : "Card discarded");
  }

  function restore(cardId) {
    var state = load();
    var card = removeCard(state, cardId);
    if (card) {
      card.status = "new";
      state.sourceMine.sieveQueue.unshift(card);
      state.sourceMine.activeCardId = card.id;
      save(state, "Card restored");
    }
    render("sieve", "Card restored");
  }

  function saveWords() {
    var form = document.querySelector("[data-constellation-form]");
    if (!form) return;
    var data = new FormData(form);
    var groups = [];
    for (var i = 0; i < 40; i += 1) {
      if (!data.has("bucket-" + i)) continue;
      var bucket = clean(data.get("bucket-" + i), 80);
      var terms = String(data.get("terms-" + i) || "").split(/[,;\n]+/).map(function (term) { return clean(term, 60).toLowerCase(); }).filter(Boolean);
      if (bucket && terms.length) groups.push({ bucket: bucket, terms: terms });
    }
    var state = load();
    state.sourceMine.wordConstellations = groups;
    save(state, "Word groups saved");
    render("words", "Word groups saved");
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button) return;
    var action = button.dataset.action || "";
    if (action === "open-source-mine") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render(null, "Source Mine opened");
    }
    if (action === "source-begin") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render("add", "Source Mine begun");
    }
    if (action === "source-tab") {
      event.preventDefault();
      event.stopImmediatePropagation();
      var state = load();
      state.sourceMine.activeTab = button.dataset.tab || "sieve";
      if (state.sourceMine.activeTab === "sieve") state.sourceMine.userOpenedEmptySieve = true;
      save(state, "Opened " + state.sourceMine.activeTab);
      return render(state.sourceMine.activeTab, "Opened " + state.sourceMine.activeTab);
    }
    if (action === "source-open-notes" || action === "source-placeholder") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render("add", "Add Source opened");
    }
    if (action === "source-save-library" || action === "source-save-note") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveLibrary();
    }
    if (action === "source-seed-demo") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return seedDemo();
    }
    if (action === "source-sort-card-select") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return sortCard();
    }
    if (action === "source-park-card") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return moveCard("parked");
    }
    if (action === "source-discard-card") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return moveCard("discarded");
    }
    if (action === "source-restore-card") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return restore(button.dataset.cardId);
    }
    if (action === "source-save-constellations") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveWords();
    }
  }, true);
})();
