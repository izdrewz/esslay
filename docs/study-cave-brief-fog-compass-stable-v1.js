(function () {
  var SAVE_KEY = "esslay-study-cave-simple-v1";
  var SAMPLE_TASK = "Write an 800-word practice response explaining how a student can use planning, source notes, drafting, proofreading, and referencing habits to improve the quality of an academic assignment.";

  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function clean(v, n) { return String(v || "").replace(/\s+/g, " ").trim().slice(0, n || 500); }
  function arr(v) { return Array.isArray(v) ? v.filter(Boolean) : []; }
  function id() { return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7); }
  function stamp() { try { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); } catch (e) { return new Date().toISOString(); } }

  function load() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
    if (!s || typeof s !== "object") s = { questTitle: "Study Skills Trial", current: "brief-fog", completed: [], unlocked: ["cave-base", "brief-fog"], flags: [], missedLoot: [], lastSavedAt: "Not saved yet", lastAction: "Ready", briefFog: { rawTaskText: SAMPLE_TASK, chunks: [], sceneState: "opening", routeChoice: "" }, sourceMine: { started: false, sources: [], quotes: [] } };
    s.completed = arr(s.completed); s.unlocked = arr(s.unlocked).length ? arr(s.unlocked) : ["cave-base", "brief-fog"]; s.flags = arr(s.flags); s.missedLoot = arr(s.missedLoot);
    s.briefFog = s.briefFog && typeof s.briefFog === "object" ? s.briefFog : {}; s.briefFog.rawTaskText = String(s.briefFog.rawTaskText || SAMPLE_TASK); s.briefFog.chunks = arr(s.briefFog.chunks); s.briefFog.chunkTags = s.briefFog.chunkTags && typeof s.briefFog.chunkTags === "object" ? s.briefFog.chunkTags : {};
    s.sourceMine = s.sourceMine && typeof s.sourceMine === "object" ? s.sourceMine : { started: false, sources: [], quotes: [] }; s.sourceMine.sources = arr(s.sourceMine.sources); s.sourceMine.quotes = arr(s.sourceMine.quotes);
    return s;
  }

  function save(s, msg) {
    s.lastSavedAt = stamp(); s.lastAction = msg || "Saved locally";
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) {}
    document.querySelectorAll("[data-flow-progress]").forEach(function (n) { n.textContent = s.completed.length + " / 7"; });
  }

  function splitList(t) { return clean(t, 1000).replace(/\band\b/gi, ",").split(/[,;\n]+/).map(function (x) { return clean(x, 80); }).filter(Boolean).slice(0, 10); }

  function infer(s) {
    var raw = String(s.briefFog.rawTaskText || SAMPLE_TASK);
    var command = /\b(analyse|analyze|analysing|analyzing)\b/i.test(raw) ? "analyse" : /\b(evaluate|evaluating)\b/i.test(raw) ? "evaluate" : /\b(compare|comparing)\b/i.test(raw) ? "compare" : /\b(discuss|discussing)\b/i.test(raw) ? "discuss" : /\b(describe|describing)\b/i.test(raw) ? "describe" : "explain";
    var focus = /\bhow\b/i.test(raw) ? "how" : /\bwhy\b/i.test(raw) ? "why" : /\bto what extent\b/i.test(raw) ? "to what extent" : "main focus";
    var out = raw.match(/\b(\d{2,5})\s*(?:-|\s)?word\s+(essay|response|report|reflection|practice response)?\b/i);
    var process = raw.match(/use\s+(.+?)\s+to\s+(improve|develop|support|create|achieve)\b/i) || raw.match(/using\s+(.+?)\s+to\s+(improve|develop|support|create|achieve)\b/i);
    var outcome = raw.match(/\bto\s+(improve\s+.+?)(?:\.|\?|$)/i) || raw.match(/\bto\s+(develop\s+.+?)(?:\.|\?|$)/i) || raw.match(/\bto\s+(support\s+.+?)(?:\.|\?|$)/i);
    return {
      output: out ? out[1] + "-word " + clean(out[2] || "response", 80) : "assignment response",
      command: command,
      focus: focus,
      subject: /\bstudent\b/i.test(raw) ? "a student" : "the subject / actor",
      process: process ? clean(process[1], 500) : "main process / method",
      outcome: outcome ? clean(outcome[1], 500) : "the assignment outcome",
      buckets: process ? splitList(process[1]) : ["main point 1", "main point 2", "main point 3"],
      reason: process ? "I found the list after “use” and before “to improve”, so those become Source Mine evidence buckets." : "I could not confidently find a list. Edit the buckets before continuing."
    };
  }

  function staleMap(m) {
    if (!m || typeof m !== "object") return true;
    var b = arr(m.buckets).join(" ").toLowerCase();
    return /main point 1/.test(b) || /main process \/ method/.test(String(m.process || "")) || /assignment outcome/.test(String(m.outcome || ""));
  }

  function map(s) {
    var inferred = infer(s);
    var saved = s.briefFog.taskMap && typeof s.briefFog.taskMap === "object" ? s.briefFog.taskMap : null;
    var m = staleMap(saved) ? inferred : saved;
    m.buckets = arr(m.buckets).length ? arr(m.buckets) : inferred.buckets;
    return m;
  }

  function applyMap(s, m) {
    s.briefFog.taskMap = m; s.briefFog.chunkTags = {};
    s.briefFog.chunks = arr(m.buckets).map(function (bucket, i) {
      var stem = clean(bucket, 80).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      var cid = stem ? "bucket-" + stem : "bucket-" + i + "-" + id();
      s.briefFog.chunkTags[cid] = { subject: m.subject, command: m.command, focus: m.focus, action: bucket, target: m.outcome, outcome: m.outcome, keyAreas: bucket };
      return { id: cid, text: bucket, plain: "Find evidence or examples for " + bucket + ".", action: "Use Source Mine to gather at least one evidence gem for " + bucket + ".", state: "unpacked" };
    });
  }

  function stage() { return document.getElementById("stage-scene"); }
  function closePanels() { document.querySelectorAll("details[open]").forEach(function (d) { d.open = false; }); }
  function info(s) { return '<p class="save-status"><strong>Browser save:</strong> ' + esc(s.lastSavedAt || "Not saved yet") + ' · ' + esc(s.lastAction || "Ready") + '</p>'; }
  function chips(b) { return '<div class="bf-compass-buckets">' + arr(b).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join("") + '</div>'; }

  function explainBox() {
    return '<details class="bf-compass-help" open><summary>What these boxes mean</summary><p><strong>Output</strong> is what you have to produce. <strong>Command</strong> is the instruction word. <strong>Focus</strong> is the angle of the answer. <strong>Subject</strong> is who or what the answer is about. <strong>Process</strong> is the method or steps. <strong>Outcome</strong> is what the answer has to show happens. <strong>Evidence buckets</strong> are the source-finding slots for Source Mine.</p></details>';
  }

  function styles() { return '<style data-bf-compass-stable>.bf-compass-card{width:min(620px,50vw)!important}.bf-question-full{padding:10px;border-radius:14px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.15);line-height:1.35}.bf-compass-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0}.bf-compass-grid div{padding:8px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12)}.bf-compass-grid strong{display:block;font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;opacity:.78}.bf-compass-buckets{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 10px}.bf-compass-buckets span{display:inline-block;padding:6px 9px;border-radius:999px;background:rgba(255,231,171,.90);color:#2f2118;font-weight:900}.bf-compass-note,.bf-compass-help{padding:8px;border-radius:12px;background:rgba(255,231,171,.18);border:1px solid rgba(255,231,171,.34);margin:8px 0}.bf-compass-help summary{cursor:pointer;font-weight:900}.bf-compass-drawer textarea{min-height:80px}@media(max-width:820px){.bf-compass-card{width:calc(100% - 24px)!important;top:auto!important;bottom:12px!important}.bf-compass-grid{grid-template-columns:1fr}}</style>'; }

  function summary(m, s) {
    return '<section><h3>Full question</h3><p class="bf-question-full">' + esc(s.briefFog.rawTaskText || SAMPLE_TASK) + '</p>' + explainBox() + '<p><strong>Plain English version:</strong><br>' + esc(m.command) + ' ' + esc(m.focus) + ' ' + esc(m.subject) + ' can use ' + esc(m.process) + ' to ' + esc(m.outcome) + '.</p><div class="bf-compass-grid"><div><strong>Output</strong>' + esc(m.output) + '</div><div><strong>Command</strong>' + esc(m.command) + '</div><div><strong>Focus</strong>' + esc(m.focus) + '</div><div><strong>Subject</strong>' + esc(m.subject) + '</div><div><strong>Process</strong>' + esc(m.process) + '</div><div><strong>Outcome</strong>' + esc(m.outcome) + '</div></div><h3>Source Mine evidence buckets</h3>' + chips(m.buckets) + '<p class="bf-compass-note">' + esc(m.reason) + '</p></section>';
  }

  function drawer(title, body) { return '<section class="simple-drawer bf-compass-drawer" role="dialog" aria-label="' + esc(title) + '"><button type="button" class="simple-close" data-action="bf-compass-close" aria-label="Close panel">×</button><h2>' + esc(title) + '</h2>' + body + '</section>'; }

  function render(extra) {
    var s = load(); var m = map(s); var n = stage(); if (!n) return;
    closePanels(); n.hidden = false; s.briefFog.routeChoice = "vanquish"; s.briefFog.sceneState = "compass"; s.briefFog.taskMap = m; save(s, "Brief Fog Quest Compass opened");
    n.innerHTML = styles() + '<section class="simple-room brief-fog-room bf-vn-room bf-scene-compass"><p class="scene-label">Brief Fog · Quest Compass</p><article class="stage-card simple-card bf-compass-card"><h2>Brief Fog</h2><p>Check the full question, check the map, then send the buckets to Source Mine.</p>' + summary(m, s) + info(s) + '<div class="simple-actions"><button type="button" data-action="bf-compass-edit">Edit map</button><button type="button" data-action="bf-compass-reread">Re-read question</button><button type="button" data-action="bf-compass-confirm">Confirm map → Source Mine</button><button type="button" data-action="bf-compass-flag">Flag confusion</button><button type="button" data-action="bf-read-scroll">Choices</button></div></article>' + (extra || "") + '</section>';
  }

  function edit() { var s = load(); var m = map(s); render(drawer("Edit Quest Compass", info(s) + '<form data-bf-compass-form><label>Full question<textarea name="rawTaskText" rows="5">' + esc(s.briefFog.rawTaskText || SAMPLE_TASK) + '</textarea></label><label>Output<input name="output" value="' + esc(m.output) + '"></label><label>Command<input name="command" value="' + esc(m.command) + '"></label><label>Focus<input name="focus" value="' + esc(m.focus) + '"></label><label>Subject<input name="subject" value="' + esc(m.subject) + '"></label><label>Process<textarea name="process" rows="3">' + esc(m.process) + '</textarea></label><label>Outcome<textarea name="outcome" rows="3">' + esc(m.outcome) + '</textarea></label><label>Evidence buckets<textarea name="buckets" rows="6">' + esc(arr(m.buckets).join("\n")) + '</textarea></label><div class="simple-actions"><button type="button" data-action="bf-compass-save">Save map</button><button type="button" data-action="bf-compass-reread">Re-read question</button><button type="button" data-action="bf-compass-confirm">Confirm map → Source Mine</button></div></form>')); }

  function formMap() { var f = document.querySelector("[data-bf-compass-form]"); if (!f) return null; var d = new FormData(f); return { output: clean(d.get("output"), 180), command: clean(d.get("command"), 80), focus: clean(d.get("focus"), 120), subject: clean(d.get("subject"), 160), process: clean(d.get("process"), 600), outcome: clean(d.get("outcome"), 500), buckets: String(d.get("buckets") || "").split(/[\n;,]/).map(function (x) { return clean(x, 80); }).filter(Boolean), reason: "Edited manually." }; }

  function reread() { var s = load(); var f = document.querySelector("[data-bf-compass-form]"); if (f) { var d = new FormData(f); s.briefFog.rawTaskText = String(d.get("rawTaskText") || s.briefFog.rawTaskText || SAMPLE_TASK); } delete s.briefFog.taskMap; save(s, "Brief Fog re-read the question"); render(); }
  function saveCompass() { var s = load(); var f = document.querySelector("[data-bf-compass-form]"); if (f) { var d = new FormData(f); s.briefFog.rawTaskText = String(d.get("rawTaskText") || s.briefFog.rawTaskText || SAMPLE_TASK); } var m = formMap() || map(s); applyMap(s, m); save(s, "Brief Fog Quest Compass saved"); render(drawer("Map Saved", '<p>Saved. Source Mine will use these buckets.</p>' + summary(m, s) + info(s))); }
  function confirm() { var s = load(); var m = formMap() || map(s); applyMap(s, m); if (s.completed.indexOf("brief-fog") === -1) s.completed.push("brief-fog"); if (s.unlocked.indexOf("source-mine") === -1) s.unlocked.push("source-mine"); s.current = "source-mine"; save(s, "Brief Fog cleared; Source Mine unlocked"); click("open-source-mine"); }
  function flag() { var s = load(); var m = map(s); s.flags.push({ id: id(), text: "Brief Fog confusion: check Quest Compass buckets: " + arr(m.buckets).join(", ") }); save(s, "Brief Fog confusion flagged"); render(drawer("Confusion Flagged", '<p>Flag saved.</p>' + info(s))); }

  function click(action, data) { var b = document.createElement("button"); b.type = "button"; b.dataset.action = action; Object.keys(data || {}).forEach(function (k) { b.dataset[k] = String(data[k]); }); document.body.appendChild(b); b.click(); b.remove(); }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("button, a"); if (!b) return; var a = b.dataset.action || "";
    if (["bf-vanquish", "open-task-brief", "work-next-chunk", "open-summary", "finish-brief-fog"].indexOf(a) >= 0) { e.preventDefault(); e.stopImmediatePropagation(); return render(); }
    if (a === "bf-compass-edit") { e.preventDefault(); e.stopImmediatePropagation(); return edit(); }
    if (a === "bf-compass-save") { e.preventDefault(); e.stopImmediatePropagation(); return saveCompass(); }
    if (a === "bf-compass-reread") { e.preventDefault(); e.stopImmediatePropagation(); return reread(); }
    if (a === "bf-compass-confirm") { e.preventDefault(); e.stopImmediatePropagation(); return confirm(); }
    if (a === "bf-compass-flag") { e.preventDefault(); e.stopImmediatePropagation(); return flag(); }
    if (a === "bf-compass-close") { e.preventDefault(); e.stopImmediatePropagation(); return render(); }
  }, true);
})();
