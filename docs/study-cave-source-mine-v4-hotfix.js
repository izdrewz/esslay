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
    return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
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
    state.sourceMine.quotes = arr(state.sourceMine.quotes);
    state.sourceMine.evidenceGems = arr(state.sourceMine.evidenceGems);
    state.sourceMine.sourceLibrary = arr(state.sourceMine.sourceLibrary);
    state.sourceMine.sieveQueue = arr(state.sourceMine.sieveQueue);
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

  function bucketId(bucket, index) {
    var stem = clean(bucket, 80).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return stem || "bucket-" + index;
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

  function defaultTerms(bucket) {
    var key = clean(bucket, 80).toLowerCase();
    var defaults = {
      "planning": ["plan", "planning", "structure", "outline", "order", "organise", "organising", "prepare", "preparation", "route", "task"],
      "source notes": ["source", "sources", "note", "notes", "note taking", "keywords", "key words", "search", "find", "highlight", "paraphrase", "own words", "reader", "module materials"],
      "drafting": ["draft", "drafts", "drafting", "write", "writing", "sentence", "sentences", "paragraph", "paragraphs", "academic style", "phrasing", "structure"],
      "proofreading": ["proofread", "proofreading", "check", "checking", "grammar", "complete sentence", "subject", "verb", "mistake", "errors", "edit"],
      "referencing habits": ["reference", "referencing", "citation", "cite", "acknowledgement", "acknowledge", "source", "copy", "copying", "paste", "own words", "reader", "module materials"],
      "children's voice": ["views", "wishes", "feelings", "participation", "listen", "listened", "asked", "point of view", "taken seriously", "child-centred", "children's voice"],
      "children’s voice": ["views", "wishes", "feelings", "participation", "listen", "listened", "asked", "point of view", "taken seriously", "child-centred", "children's voice"],
      "childhood as social construction": ["social construction", "constructed", "assumptions", "ideas about childhood", "expectations", "stereotypes", "varies", "time", "place", "culture", "different childhoods"],
      "children's rights": ["uncrc", "rights", "best interests", "participation", "views", "protection", "provision", "education", "health", "play", "family", "non-discrimination"],
      "children’s rights": ["uncrc", "rights", "best interests", "participation", "views", "protection", "provision", "education", "health", "play", "family", "non-discrimination"],
      "young carers": ["care", "carer", "caring", "caring responsibilities", "adult responsibilities", "household", "emotional support", "resilience", "school attendance", "support worker"],
      "attachment": ["mummy", "mother", "parent", "separation", "distress", "hospital", "comfort object", "nurse", "crying", "care", "emotional response"]
    };
    if (defaults[key]) return defaults[key].slice();
    return tokenise(key).concat([key]).filter(Boolean);
  }

  function tokenise(text) {
    var stop = {};
    "a an and are as at be by can could for from has have how in into is it of on or should that the their this to use using was were what when where which who why with would".split(" ").forEach(function (word) { stop[word] = true; });
    return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(function (token) {
      return token.length > 2 && !stop[token];
    });
  }

  function allConstellations(state, buckets) {
    var list = arr(state.sourceMine.wordConstellations).map(function (group) {
      return {
        bucket: clean(group.bucket, 80),
        terms: arr(group.terms).map(function (term) { return clean(term, 60).toLowerCase(); }).filter(Boolean)
      };
    }).filter(function (group) { return group.bucket; });

    buckets.forEach(function (bucket) {
      var exists = list.some(function (group) { return group.bucket.toLowerCase() === bucket.toLowerCase(); });
      if (!exists) list.push({ bucket: bucket, terms: defaultTerms(bucket) });
    });

    return list;
  }

  function termsForBucket(state, bucket) {
    var groups = allConstellations(state, getBuckets(state));
    var match = groups.find(function (group) { return group.bucket.toLowerCase() === clean(bucket, 80).toLowerCase(); });
    return match ? arr(match.terms) : defaultTerms(bucket);
  }

  function matchCardToBuckets(state, text) {
    var buckets = getBuckets(state);
    var lower = String(text || "").toLowerCase();
    var cards = buckets.map(function (bucket) {
      var terms = termsForBucket(state, bucket);
      var hits = [];
      terms.forEach(function (term) {
        var cleanTerm = clean(term, 60).toLowerCase();
        if (cleanTerm && lower.indexOf(cleanTerm) !== -1 && hits.indexOf(cleanTerm) === -1) hits.push(cleanTerm);
      });
      tokenise(bucket).forEach(function (term) {
        if (lower.indexOf(term) !== -1 && hits.indexOf(term) === -1) hits.push(term);
      });
      return { bucket: bucket, score: hits.length, matchWords: hits.slice(0, 10) };
    }).filter(function (item) { return item.score > 0; }).sort(function (a, b) { return b.score - a.score; });

    return cards.slice(0, 4);
  }

  function splitSourceText(text) {
    var raw = String(text || "").replace(/\r/g, "\n").split(/\n{2,}/).map(function (part) { return clean(part, 1200); }).filter(Boolean);
    var chunks = [];
    raw.forEach(function (paragraph) {
      if (paragraph.length <= 420) {
        chunks.push(paragraph);
      } else {
        paragraph.split(/(?<=[.!?])\s+/).map(function (sentence) { return clean(sentence, 500); }).filter(function (sentence) { return sentence.length > 30; }).forEach(function (sentence) { chunks.push(sentence); });
      }
    });
    if (!chunks.length) {
      chunks = String(text || "").split(/(?<=[.!?])\s+/).map(function (sentence) { return clean(sentence, 500); }).filter(function (sentence) { return sentence.length > 30; });
    }
    return chunks.slice(0, 80);
  }

  function evidenceFor(state, bucket) {
    var key = bucketId(bucket, 0);
    return arr(state.sourceMine.evidenceGems).filter(function (gem) {
      return gem.bucketId === key || clean(gem.bucket, 80).toLowerCase() === clean(bucket, 80).toLowerCase();
    });
  }

  function sourceById(state, sourceId) {
    return arr(state.sourceMine.sourceLibrary).find(function (source) { return source.id === sourceId; }) || arr(state.sourceMine.sources).find(function (source) { return source.id === sourceId; }) || null;
  }

  function activeCard(state) {
    var cardId = state.sourceMine.activeCardId;
    var queue = arr(state.sourceMine.sieveQueue).filter(function (card) { return card.status !== "sorted" && card.status !== "discarded" && card.status !== "parked"; });
    if (cardId) {
      var found = queue.find(function (card) { return card.id === cardId; });
      if (found) return found;
    }
    return queue[0] || null;
  }

  function saveInfo(state) {
    return '<p class="save-status"><strong>Browser save:</strong> ' + esc(state.lastSavedAt || "Not saved yet") + ' · ' + esc(state.lastAction || "Ready") + '</p>';
  }

  function styles() {
    return '<style data-source-mine-sieve>' +
      '.source-mine-card{width:min(560px,42vw)!important;max-height:calc(100% - 92px)!important;overflow:auto!important;padding:14px!important;}' +
      '.source-mine-card h2{margin-bottom:6px!important}.source-mine-card h3{margin:10px 0 6px!important}.source-mine-card p{margin:5px 0!important;line-height:1.22!important;}' +
      '.source-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 10px}.source-tabs button{border:1px solid rgba(236,215,170,.75);border-radius:999px;padding:6px 9px;background:rgba(25,16,10,.88);color:#fff7df;font-weight:900;cursor:pointer}.source-tabs button[aria-current="true"]{background:rgba(255,231,171,.92);color:#2f2118;}' +
      '.source-bucket-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0;}' +
      '.source-bucket-card{padding:9px;border-radius:14px;border:1px solid rgba(255,231,171,.36);background:rgba(7,10,18,.68);}' +
      '.source-bucket-card strong{display:block;color:#fff7df;margin-bottom:3px;}.source-bucket-card p{font-size:.88rem;}' +
      '.source-gem-count,.source-chip{display:inline-block;padding:3px 7px;border-radius:999px;background:rgba(255,231,171,.9);color:#2f2118;font-weight:900;font-size:.78rem;margin:2px;}' +
      '.source-sieve-card{padding:10px;border-radius:14px;border:1px solid rgba(255,231,171,.38);background:rgba(7,10,18,.72);}' +
      '.source-card-text{max-height:170px;overflow:auto;padding:8px;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);font-size:.9rem;}' +
      '.source-suggestions{display:grid;grid-template-columns:1fr;gap:5px;margin:8px 0}.source-suggestions label{display:flex;gap:7px;align-items:flex-start;padding:6px;border-radius:10px;border:1px solid rgba(255,231,171,.26);background:rgba(255,255,255,.06);font-weight:800}.source-suggestions small{display:block;opacity:.82;font-weight:700;margin-top:2px;}' +
      '.source-small-note{font-size:.86rem;opacity:.92;}.source-review-list{margin:0;padding-left:18px}.source-review-list li{margin:6px 0;}' +
      '.source-constellation{padding:8px;margin:7px 0;border-radius:12px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14)}.source-constellation textarea{width:100%;min-height:52px;margin-top:5px;box-sizing:border-box;}' +
      '.source-mine-card textarea,.source-mine-card input{width:100%;box-sizing:border-box;margin-top:4px;padding:8px;border-radius:10px;border:1px solid rgba(236,215,170,.36);font:inherit}.source-mine-card label{display:block;margin:8px 0;font-weight:900;}' +
      '@media(max-width:920px){.source-mine-card{width:calc(100% - 28px)!important;max-height:calc(100% - 86px)!important}.source-bucket-grid{grid-template-columns:1fr;}}' +
      '</style>';
  }

  function tabs(active) {
    var items = [
      ["sieve", "Crystal Sieve"],
      ["vault", "Bucket Vault"],
      ["add", "Add Source"],
      ["words", "Word Constellations"],
      ["review", "Review Cart"]
    ];
    return '<nav class="source-tabs" aria-label="Source Mine tabs">' + items.map(function (item) {
      return '<button type="button" data-action="source-tab" data-tab="' + item[0] + '" aria-current="' + (active === item[0] ? "true" : "false") + '">' + item[1] + '</button>';
    }).join('') + '</nav>';
  }

  function bucketCards(state, buckets) {
    return '<div class="source-bucket-grid">' + buckets.map(function (bucket) {
      var gems = evidenceFor(state, bucket);
      return '<article class="source-bucket-card">' +
        '<strong>' + esc(bucket) + '</strong>' +
        '<span class="source-gem-count">' + gems.length + ' evidence gem' + (gems.length === 1 ? '' : 's') + '</span>' +
        '<p>Saved evidence for this bucket will be used later in Draft Route.</p>' +
        '</article>';
    }).join('') + '</div>';
  }

  function addSourcePanel(state) {
    return '<h3>Add / paste source</h3>' +
      '<p class="source-small-note">Paste a source, transcript, notes, or copied PDF text. The mine will cut it into cards and suggest bucket matches. MP3/MP4 need a transcript first.</p>' +
      '<form data-source-library-form>' +
      '<label>Source title<input name="title" placeholder="Unit 1, Ann Phoenix interview, UNCRC summary…"></label>' +
      '<label>Citation/source label<input name="citationLabel" placeholder="Short label to keep attached to evidence gems"></label>' +
      '<label>Source text<textarea name="sourceText" rows="8" placeholder="Paste text or transcript here."></textarea></label>' +
      '<div class="simple-actions">' +
      '<button type="button" data-action="source-save-library">Create sieve cards</button>' +
      '<button type="button" data-action="source-seed-demo">Seed demo cards</button>' +
      '</div>' +
      '</form>';
  }

  function sievePanel(state) {
    var card = activeCard(state);
    var queueCount = arr(state.sourceMine.sieveQueue).filter(function (item) { return item.status !== "sorted" && item.status !== "discarded" && item.status !== "parked"; }).length;
    if (!card) {
      return '<h3>Crystal Sieve</h3>' +
        '<p>No source cards waiting. Add/paste a source, or seed demo cards for testing.</p>' +
        '<p><strong>Reviewed:</strong> ' + state.sourceMine.reviewedCount + ' · <strong>Waiting:</strong> ' + queueCount + '</p>' +
        '<div class="simple-actions"><button type="button" data-action="source-tab" data-tab="add">Add Source</button><button type="button" data-action="source-seed-demo">Seed demo cards</button></div>';
    }

    var buckets = getBuckets(state);
    var matches = arr(card.matchBuckets);
    if (!matches.length) matches = matchCardToBuckets(state, card.text);
    var source = sourceById(state, card.sourceId);
    var sourceTitle = card.sourceTitle || (source && source.title) || "Untitled source";
    var citationLabel = card.citationLabel || (source && source.citationLabel) || sourceTitle;
    var matchSummary = matches.length ? matches.map(function (match) { return '<span class="source-chip">' + esc(match.bucket) + '</span>'; }).join('') : '<span class="source-chip">needs sorting</span>';
    var boxes = buckets.map(function (bucket, index) {
      var match = matches.find(function (item) { return item.bucket.toLowerCase() === bucket.toLowerCase(); });
      var checked = match || (!matches.length && index === 0) ? ' checked' : '';
      var words = match && arr(match.matchWords).length ? '<small>Matched: ' + esc(match.matchWords.join(", ")) + '</small>' : '';
      return '<label><input type="checkbox" name="bucket" value="' + esc(bucket) + '"' + checked + '> <span>' + esc(bucket) + words + '</span></label>';
    }).join('');

    return '<h3>Crystal Sieve</h3>' +
      '<p><strong>Waiting:</strong> ' + queueCount + ' · <strong>Reviewed:</strong> ' + state.sourceMine.reviewedCount + '</p>' +
      '<article class="source-sieve-card" data-sieve-card="' + esc(card.id) + '">' +
      '<p><strong>Source:</strong> ' + esc(sourceTitle) + '</p>' +
      '<p><strong>Suggested:</strong> ' + matchSummary + '</p>' +
      '<div class="source-card-text">' + esc(card.text) + '</div>' +
      '<form data-sieve-sort-form data-card-id="' + esc(card.id) + '">' +
      '<div class="source-suggestions">' + boxes + '</div>' +
      '<label>Your note / why useful<textarea name="note" rows="3" placeholder="Optional: why this evidence helps"></textarea></label>' +
      '<p class="source-small-note">Saved gems keep this source label attached: <strong>' + esc(citationLabel) + '</strong></p>' +
      '<div class="simple-actions">' +
      '<button type="button" data-action="source-sort-card">Save gem to selected bucket(s)</button>' +
      '<button type="button" data-action="source-park-card">Park</button>' +
      '<button type="button" data-action="source-discard-card">Discard</button>' +
      '</div>' +
      '</form>' +
      '</article>';
  }

  function vaultPanel(state) {
    var buckets = getBuckets(state);
    var body = '<h3>Bucket Vault</h3>' + bucketCards(state, buckets);
    buckets.forEach(function (bucket) {
      var gems = evidenceFor(state, bucket);
      if (!gems.length) return;
      body += '<h4>' + esc(bucket) + '</h4><ul class="source-review-list">' + gems.slice(0, 8).map(function (gem) {
        var source = sourceById(state, gem.sourceId);
        var label = gem.citationLabel || (source && source.citationLabel) || (source && source.title) || "source";
        return '<li><strong>' + esc(label) + ':</strong> ' + esc(clean(gem.evidence, 190)) + (gem.note ? '<br><em>' + esc(clean(gem.note, 170)) + '</em>' : '') + '</li>';
      }).join('') + '</ul>';
    });
    return body;
  }

  function wordsPanel(state) {
    var buckets = getBuckets(state);
    var groups = allConstellations(state, buckets);
    return '<h3>Word Constellations</h3>' +
      '<p class="source-small-note">These are reusable related-word groups. They help future source cards auto-suggest buckets.</p>' +
      '<form data-constellation-form>' +
      groups.map(function (group, index) {
        return '<section class="source-constellation">' +
          '<label>Bucket<input name="bucket-' + index + '" value="' + esc(group.bucket) + '"></label>' +
          '<label>Related words<textarea name="terms-' + index + '">' + esc(arr(group.terms).join(", ")) + '</textarea></label>' +
          '</section>';
      }).join('') +
      '<div class="simple-actions"><button type="button" data-action="source-save-constellations">Save word groups</button></div>' +
      '</form>';
  }

  function reviewPanel(state) {
    var parked = arr(state.sourceMine.parkedChunks);
    var discarded = arr(state.sourceMine.discardedChunks);
    var body = '<h3>Review Cart</h3>' +
      '<p><strong>Parked:</strong> ' + parked.length + ' · <strong>Discarded:</strong> ' + discarded.length + '</p>';
    body += '<h4>Parked</h4>' + (parked.length ? '<ul class="source-review-list">' + parked.slice(0, 12).map(function (card) {
      return '<li>' + esc(clean(card.text, 170)) + '<br><button type="button" data-action="source-restore-card" data-card-id="' + esc(card.id) + '">Restore to sieve</button></li>';
    }).join('') + '</ul>' : '<p>No parked cards.</p>');
    body += '<h4>Discarded</h4>' + (discarded.length ? '<ul class="source-review-list">' + discarded.slice(0, 12).map(function (card) {
      return '<li>' + esc(clean(card.text, 170)) + '<br><button type="button" data-action="source-restore-card" data-card-id="' + esc(card.id) + '">Restore to sieve</button></li>';
    }).join('') + '</ul>' : '<p>No discarded cards.</p>');
    return body;
  }

  function panelFor(state, tab) {
    if (tab === "add") return addSourcePanel(state);
    if (tab === "vault") return vaultPanel(state);
    if (tab === "words") return wordsPanel(state);
    if (tab === "review") return reviewPanel(state);
    return sievePanel(state);
  }

  function renderSourceMine(tab) {
    var state = load();
    var node = stage();
    if (!node) return;
    closePanels();
    node.hidden = false;
    state.current = "source-mine";
    state.sourceMine.started = Boolean(state.sourceMine.started);
    var currentTab = tab || state.sourceMine.activeTab || "sieve";
    state.sourceMine.activeTab = currentTab;
    save(state, state.lastAction || "Source Mine opened");
    node.innerHTML = styles() + '<section class="simple-room source-mine-room">' +
      '<p class="scene-label">Source Mine</p>' +
      '<button type="button" class="flow-hotspot hotspot-parchment" data-action="source-tab" data-tab="add" data-hotspot-label="Add Source">Add Source</button>' +
      '<button type="button" class="flow-hotspot hotspot-brief-loot" data-action="source-tab" data-tab="vault" data-hotspot-label="Bucket Vault">Bucket Vault</button>' +
      '<button type="button" class="flow-hotspot hotspot-brief-flag" data-action="return-cave-base" data-hotspot-label="Cave Base">Cave Base</button>' +
      '<article class="stage-card simple-card source-mine-card">' +
      '<h2>Source Mine</h2>' +
      '<p>Crystal Sieve: sort source cards into Brief Fog buckets. Save useful cards as evidence gems.</p>' +
      '<p><strong>Sources:</strong> ' + state.sourceMine.sourceLibrary.length + ' · <strong>Evidence gems:</strong> ' + state.sourceMine.evidenceGems.length + '</p>' +
      saveInfo(state) + tabs(currentTab) + panelFor(state, currentTab) +
      '<div class="simple-actions">' +
      '<button type="button" data-action="return-cave-base">Cave Base</button>' +
      '<button type="button" data-action="open-task-map">Task Map</button>' +
      '</div></article></section>';
  }

  function createSourceCards(title, citationLabel, text) {
    var state = load();
    var chunks = splitSourceText(text);
    var source = {
      id: uid(),
      title: clean(title, 240) || "Untitled source",
      citationLabel: clean(citationLabel, 240) || clean(title, 240) || "source",
      type: "pasted-text",
      chunkCount: chunks.length,
      createdAt: new Date().toISOString()
    };
    var cards = chunks.map(function (chunk, index) {
      return {
        id: uid(),
        sourceId: source.id,
        sourceTitle: source.title,
        citationLabel: source.citationLabel,
        index: index,
        text: chunk,
        matchBuckets: matchCardToBuckets(state, chunk),
        status: "new",
        createdAt: new Date().toISOString()
      };
    });
    source.preview = clean(chunks[0] || "", 220);
    state.sourceMine.sourceLibrary.push(source);
    state.sourceMine.sources.push({ id: source.id, title: source.title, note: "Imported into Crystal Sieve", citationLabel: source.citationLabel, createdAt: source.createdAt });
    state.sourceMine.sieveQueue = arr(state.sourceMine.sieveQueue).concat(cards);
    state.sourceMine.started = true;
    state.sourceMine.activeTab = "sieve";
    state.sourceMine.activeCardId = cards.length ? cards[0].id : "";
    save(state, "Source imported; " + cards.length + " cards created");
    renderSourceMine("sieve");
  }

  function saveLibrarySource() {
    var form = document.querySelector("[data-source-library-form]");
    if (!form) return;
    var data = new FormData(form);
    var text = clean(data.get("sourceText"), 120000);
    if (!text) {
      var state = load();
      save(state, "Paste source text first");
      return renderSourceMine("add");
    }
    createSourceCards(data.get("title"), data.get("citationLabel"), text);
  }

  function seedDemo() {
    var demo = [
      "Planning helps a writer decide the order of ideas before drafting, so the response has a clearer route.",
      "Taking source notes in your own words helps you understand the material and avoids copied wording sliding into assignments without acknowledgement.",
      "Drafting gives the writer space to build paragraphs before final polishing.",
      "Proofreading helps check whether sentences are complete, clear, and grammatically accurate.",
      "Referencing habits keep the source attached to the idea so the evidence can be acknowledged later."
    ].join("\n\n");
    createSourceCards("Demo Study Skills Source", "Demo source", demo);
  }

  function saveConstellations() {
    var form = document.querySelector("[data-constellation-form]");
    if (!form) return;
    var data = new FormData(form);
    var groups = [];
    for (var i = 0; i < 80; i += 1) {
      if (!data.has("bucket-" + i)) continue;
      var bucket = clean(data.get("bucket-" + i), 80);
      var terms = String(data.get("terms-" + i) || "").split(/[,;\n]+/).map(function (term) { return clean(term, 60).toLowerCase(); }).filter(Boolean);
      if (bucket && terms.length) groups.push({ bucket: bucket, terms: terms });
    }
    var state = load();
    state.sourceMine.wordConstellations = groups;
    save(state, "Word constellations saved");
    renderSourceMine("words");
  }

  function getSelectedBuckets(form) {
    return Array.prototype.slice.call(form.querySelectorAll('input[name="bucket"]:checked')).map(function (input) { return clean(input.value, 80); }).filter(Boolean);
  }

  function removeCardFromLists(state, cardId) {
    var found = null;
    ["sieveQueue", "parkedChunks", "discardedChunks"].forEach(function (name) {
      state.sourceMine[name] = arr(state.sourceMine[name]).filter(function (card) {
        if (card.id === cardId) found = found || card;
        return card.id !== cardId;
      });
    });
    return found;
  }

  function sortCard() {
    var form = document.querySelector("[data-sieve-sort-form]");
    if (!form) return;
    var cardId = form.dataset.cardId;
    var state = load();
    var card = removeCardFromLists(state, cardId);
    if (!card) return renderSourceMine("sieve");
    var buckets = getSelectedBuckets(form);
    if (!buckets.length) {
      state.sourceMine.sieveQueue.unshift(card);
      state.sourceMine.activeCardId = card.id;
      save(state, "Choose at least one bucket");
      return renderSourceMine("sieve");
    }
    var note = clean(new FormData(form).get("note"), 900);
    buckets.forEach(function (bucket) {
      var match = arr(card.matchBuckets).find(function (item) { return item.bucket.toLowerCase() === bucket.toLowerCase(); });
      state.sourceMine.evidenceGems.push({
        id: uid(),
        bucket: bucket,
        bucketId: bucketId(bucket, 0),
        sourceId: card.sourceId,
        sourceTitle: card.sourceTitle,
        citationLabel: card.citationLabel,
        evidence: clean(card.text, 1600),
        note: note,
        link: note,
        matchWords: match ? arr(match.matchWords) : [],
        createdAt: new Date().toISOString()
      });
    });
    state.sourceMine.reviewedCount += 1;
    state.sourceMine.activeCardId = "";
    state.sourceMine.activeTab = "sieve";
    save(state, "Evidence gem saved");
    renderSourceMine("sieve");
  }

  function moveCard(kind) {
    var form = document.querySelector("[data-sieve-sort-form]");
    var cardId = form && form.dataset.cardId;
    if (!cardId) return;
    var state = load();
    var card = removeCardFromLists(state, cardId);
    if (!card) return renderSourceMine("sieve");
    card.status = kind;
    card.reviewedAt = new Date().toISOString();
    if (kind === "parked") state.sourceMine.parkedChunks.unshift(card);
    if (kind === "discarded") state.sourceMine.discardedChunks.unshift(card);
    state.sourceMine.reviewedCount += 1;
    state.sourceMine.activeCardId = "";
    save(state, kind === "parked" ? "Card parked" : "Card discarded");
    renderSourceMine("sieve");
  }

  function restoreCard(cardId) {
    var state = load();
    var card = removeCardFromLists(state, cardId);
    if (card) {
      card.status = "new";
      state.sourceMine.sieveQueue.unshift(card);
      state.sourceMine.activeCardId = card.id;
      save(state, "Card restored");
    }
    renderSourceMine("sieve");
  }

  function beginSourceMine() {
    var state = load();
    state.sourceMine.started = true;
    state.sourceMine.activeTab = "sieve";
    save(state, "Source Mine begun");
    renderSourceMine("sieve");
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button) return;
    var action = button.dataset.action || "";

    if (action === "open-source-mine") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return renderSourceMine("sieve");
    }
    if (action === "source-begin") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return beginSourceMine();
    }
    if (action === "source-tab") {
      event.preventDefault();
      event.stopImmediatePropagation();
      var state = load();
      state.sourceMine.activeTab = button.dataset.tab || "sieve";
      save(state, "Source Mine opened " + state.sourceMine.activeTab);
      return renderSourceMine(state.sourceMine.activeTab);
    }
    if (action === "source-open-notes" || action === "source-placeholder") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return renderSourceMine("add");
    }
    if (action === "source-save-note" || action === "source-save-library") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveLibrarySource();
    }
    if (action === "source-seed-demo") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return seedDemo();
    }
    if (action === "source-save-constellations") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveConstellations();
    }
    if (action === "source-sort-card") {
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
      return restoreCard(button.dataset.cardId);
    }
    if (action === "source-open-evidence") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return renderSourceMine("sieve");
    }
    if (action === "source-close-drawer") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return renderSourceMine("sieve");
    }
  }, true);
})();