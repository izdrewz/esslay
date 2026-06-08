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

  function evidenceFor(state, bucket) {
    var key = bucketId(bucket, 0);
    return arr(state.sourceMine.evidenceGems).filter(function (gem) {
      return gem.bucketId === key || clean(gem.bucket, 80).toLowerCase() === clean(bucket, 80).toLowerCase();
    });
  }

  function saveInfo(state) {
    return '<p class="save-status"><strong>Browser save:</strong> ' + esc(state.lastSavedAt || "Not saved yet") + ' · ' + esc(state.lastAction || "Ready") + '</p>';
  }

  function styles() {
    return '<style data-source-mine-slots>' +
      '.source-mine-card{width:min(620px,48vw)!important;max-height:calc(100% - 96px)!important;overflow:auto!important;}' +
      '.source-bucket-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0;}' +
      '.source-bucket-card{padding:9px;border-radius:14px;border:1px solid rgba(255,231,171,.36);background:rgba(7,10,18,.68);}' +
      '.source-bucket-card strong{display:block;color:#fff7df;margin-bottom:3px;}' +
      '.source-bucket-card p{margin:3px 0!important;font-size:.88rem;}' +
      '.source-bucket-card button{margin-top:5px;}' +
      '.source-gem-count{display:inline-block;padding:3px 7px;border-radius:999px;background:rgba(255,231,171,.9);color:#2f2118;font-weight:900;font-size:.78rem;}' +
      '.source-small-note{font-size:.88rem;opacity:.92;}' +
      '@media(max-width:820px){.source-mine-card{width:calc(100% - 24px)!important;max-height:calc(100% - 86px)!important}.source-bucket-grid{grid-template-columns:1fr;}}' +
      '</style>';
  }

  function bucketCards(state, buckets) {
    return '<div class="source-bucket-grid">' + buckets.map(function (bucket, index) {
      var gems = evidenceFor(state, bucket);
      return '<article class="source-bucket-card">' +
        '<strong>' + esc(bucket) + '</strong>' +
        '<span class="source-gem-count">' + gems.length + ' evidence gem' + (gems.length === 1 ? '' : 's') + '</span>' +
        '<p>Find a quote, paraphrase, example, or source note for this bucket.</p>' +
        '<button type="button" data-action="source-open-evidence" data-bucket-index="' + index + '">Add evidence</button>' +
        '</article>';
    }).join('') + '</div>';
  }

  function renderSourceMine(extra) {
    var state = load();
    var node = stage();
    if (!node) return;
    closePanels();
    node.hidden = false;
    var buckets = getBuckets(state);
    state.current = "source-mine";
    state.sourceMine.started = Boolean(state.sourceMine.started);
    save(state, state.lastAction || "Source Mine opened");
    node.innerHTML = styles() + '<section class="simple-room source-mine-room">' +
      '<p class="scene-label">Source Mine</p>' +
      '<button type="button" class="flow-hotspot hotspot-parchment" data-action="source-open-notes" data-hotspot-label="Source Notes">Source Notes</button>' +
      '<button type="button" class="flow-hotspot hotspot-brief-loot" data-action="open-task-map" data-hotspot-label="Task Map">Task Map</button>' +
      '<button type="button" class="flow-hotspot hotspot-brief-flag" data-action="return-cave-base" data-hotspot-label="Cave Base">Cave Base</button>' +
      '<article class="stage-card simple-card source-mine-card">' +
      '<h2>Source Mine</h2>' +
      '<p>Gather evidence for each bucket from Brief Fog. Each bucket is a crystal slot.</p>' +
      '<p><strong>Sources:</strong> ' + state.sourceMine.sources.length + ' · <strong>Evidence gems:</strong> ' + state.sourceMine.evidenceGems.length + '</p>' +
      saveInfo(state) +
      '<h3>Brief Fog buckets</h3>' + bucketCards(state, buckets) +
      '<p class="source-small-note">You do not need to complete every slot now. Add one source first, then mine evidence into the matching bucket.</p>' +
      '<div class="simple-actions">' +
      '<button type="button" data-action="source-begin">Begin Source Mine</button>' +
      '<button type="button" data-action="source-open-notes">Add Source</button>' +
      '<button type="button" data-action="return-cave-base">Cave Base</button>' +
      '<button type="button" data-action="open-task-map">Task Map</button>' +
      '</div></article>' + (extra || '') + '</section>';
  }

  function drawer(title, body) {
    return '<section class="simple-drawer" role="dialog" aria-label="' + esc(title) + '" data-drawer-context="source-mine">' +
      '<button type="button" class="simple-close" data-action="source-close-drawer" aria-label="Close panel">×</button>' +
      '<h2>' + esc(title) + '</h2>' + body + '</section>';
  }

  function openNotes() {
    var state = load();
    renderSourceMine(drawer("Add Source", saveInfo(state) +
      '<form data-source-form>' +
      '<label>Source title / page / link<input name="title" placeholder="Book, article, page, website, lecture note…"></label>' +
      '<label>Source note<textarea name="note" rows="5" placeholder="What is this source useful for?"></textarea></label>' +
      '<div class="simple-actions"><button type="button" data-action="source-save-note">Save source</button><button type="button" data-action="source-close-drawer">Close</button></div>' +
      '</form>'));
  }

  function saveSource() {
    var form = document.querySelector('[data-source-form]');
    if (!form) return;
    var data = new FormData(form);
    var state = load();
    state.sourceMine.sources.push({ id: uid(), title: clean(data.get('title'), 240) || 'Untitled source', note: clean(data.get('note'), 900), createdAt: new Date().toISOString() });
    state.sourceMine.started = true;
    save(state, "Source saved");
    renderSourceMine(drawer("Source Saved", '<p>Source saved. Now add evidence to a bucket.</p>' + saveInfo(state)));
  }

  function openEvidence(index) {
    var state = load();
    var buckets = getBuckets(state);
    var bucket = buckets[Number(index)] || buckets[0] || "evidence bucket";
    var sourceOptions = state.sourceMine.sources.length ? state.sourceMine.sources.map(function (source) {
      return '<option value="' + esc(source.id) + '">' + esc(source.title || 'Untitled source') + '</option>';
    }).join('') : '<option value="">No source saved yet</option>';
    renderSourceMine(drawer("Add Evidence Gem", saveInfo(state) +
      '<p><strong>Bucket:</strong> ' + esc(bucket) + '</p>' +
      '<form data-evidence-form data-bucket="' + esc(bucket) + '">' +
      '<label>Source<select name="sourceId">' + sourceOptions + '</select></label>' +
      '<label>Evidence / quote / paraphrase / example<textarea name="evidence" rows="5" placeholder="Paste or write the evidence here."></textarea></label>' +
      '<label>How this helps the bucket<textarea name="link" rows="4" placeholder="Explain why this evidence supports this bucket."></textarea></label>' +
      '<div class="simple-actions"><button type="button" data-action="source-save-evidence">Save evidence gem</button><button type="button" data-action="source-open-notes">Add Source first</button><button type="button" data-action="source-close-drawer">Close</button></div>' +
      '</form>'));
  }

  function saveEvidence() {
    var form = document.querySelector('[data-evidence-form]');
    if (!form) return;
    var data = new FormData(form);
    var bucket = clean(form.dataset.bucket, 100);
    var state = load();
    state.sourceMine.evidenceGems.push({
      id: uid(),
      bucket: bucket,
      bucketId: bucketId(bucket, 0),
      sourceId: clean(data.get('sourceId'), 120),
      evidence: clean(data.get('evidence'), 1600),
      link: clean(data.get('link'), 900),
      createdAt: new Date().toISOString()
    });
    state.sourceMine.started = true;
    save(state, "Evidence gem saved");
    renderSourceMine(drawer("Evidence Saved", '<p>Evidence gem saved for <strong>' + esc(bucket) + '</strong>.</p>' + saveInfo(state)));
  }

  function beginSourceMine() {
    var state = load();
    state.sourceMine.started = true;
    save(state, "Source Mine begun");
    renderSourceMine();
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button) return;
    var action = button.dataset.action || "";

    if (action === "open-source-mine") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return renderSourceMine();
    }
    if (action === "source-begin") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return beginSourceMine();
    }
    if (action === "source-open-notes" || action === "source-placeholder") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return openNotes();
    }
    if (action === "source-save-note") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveSource();
    }
    if (action === "source-open-evidence") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return openEvidence(button.dataset.bucketIndex);
    }
    if (action === "source-save-evidence") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveEvidence();
    }
    if (action === "source-close-drawer") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return renderSourceMine();
    }
  }, true);
})();
