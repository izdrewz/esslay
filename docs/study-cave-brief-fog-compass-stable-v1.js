(function () {
  var SAVE_KEY = "esslay-study-cave-simple-v1";
  var MEMORY_KEY = "esslay-study-cave-taskmap-memory-v1";
  var SAMPLE_TASK = "Write an 800-word practice response explaining how a student can use planning, source notes, drafting, proofreading, and referencing habits to improve the quality of an academic assignment.";
  var FIELD_TIPS = {
    output: "What you have to make: essay, report, response, presentation, word count.",
    command: "The instruction word. Explain, analyse, evaluate, compare, and discuss need different answer moves.",
    focus: "The angle of the answer: how, why, to what extent, whether, causes, effects, or importance.",
    subject: "Who or what the answer is about.",
    process: "The methods, habits, causes, factors, or steps the answer needs to use.",
    outcome: "The result the answer needs to show.",
    buckets: "The Source Mine slots. Gather evidence, examples, or reasons for each one."
  };

  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function clean(v, n) { return String(v || "").replace(/\s+/g, " ").trim().slice(0, n || 500); }
  function arr(v) { return Array.isArray(v) ? v.filter(Boolean) : []; }
  function uid() { return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7); }
  function stamp() { try { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); } catch (e) { return new Date().toISOString(); } }
  function weakQuestion(text) { text = clean(text, 9000); return !text || /neutral\s+800-word\s+practice\s+task/i.test(text) || (text.length < 70 && !/\b(explain|analyse|analyze|evaluate|compare|discuss|use|using|improve)\b/i.test(text)); }

  function load() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
    if (!s || typeof s !== "object") s = { questTitle: "Study Skills Trial", current: "brief-fog", completed: [], unlocked: ["cave-base", "brief-fog"], flags: [], missedLoot: [], lastSavedAt: "Not saved yet", lastAction: "Ready", briefFog: { rawTaskText: SAMPLE_TASK, chunks: [], sceneState: "opening", routeChoice: "" }, sourceMine: { started: false, sources: [], quotes: [] } };
    s.completed = arr(s.completed);
    s.unlocked = arr(s.unlocked).length ? arr(s.unlocked) : ["cave-base", "brief-fog"];
    s.flags = arr(s.flags);
    s.missedLoot = arr(s.missedLoot);
    s.briefFog = s.briefFog && typeof s.briefFog === "object" ? s.briefFog : {};
    s.briefFog.rawTaskText = weakQuestion(s.briefFog.rawTaskText) ? SAMPLE_TASK : String(s.briefFog.rawTaskText);
    s.briefFog.chunks = arr(s.briefFog.chunks);
    s.briefFog.chunkTags = s.briefFog.chunkTags && typeof s.briefFog.chunkTags === "object" ? s.briefFog.chunkTags : {};
    s.sourceMine = s.sourceMine && typeof s.sourceMine === "object" ? s.sourceMine : { started: false, sources: [], quotes: [] };
    s.sourceMine.sources = arr(s.sourceMine.sources);
    s.sourceMine.quotes = arr(s.sourceMine.quotes);
    return s;
  }

  function save(s, msg) {
    s.lastSavedAt = stamp();
    s.lastAction = msg || "Saved locally";
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) {}
    document.querySelectorAll("[data-flow-progress]").forEach(function (n) { n.textContent = s.completed.length + " / 7"; });
  }

  function splitList(t) { return clean(t, 1000).replace(/\band\b/gi, ",").split(/[,;\n]+/).map(function (x) { return clean(x, 80); }).filter(Boolean).slice(0, 10); }
  function genericMap(m) { var b = arr(m && m.buckets).join(" ").toLowerCase(); return !m || /main point 1/.test(b) || /main process \/ method/.test(String(m.process || "")) || /assignment outcome/.test(String(m.outcome || "")); }

  function tokens(text) {
    var stop = "a an and are as at be by can could for from how in into is it of on or should that the their this to use using what when where which who why with would word words".split(" ");
    var blocked = {}; stop.forEach(function (x) { blocked[x] = true; });
    return clean(text, 9000).toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(function (x) { return x.length > 2 && !blocked[x]; });
  }
  function loadMemory() { try { return arr(JSON.parse(localStorage.getItem(MEMORY_KEY))); } catch (e) { return []; } }
  function memoryScore(raw, item) { var a = tokens(raw), b = tokens(item.rawTaskText || ""), seen = {}, overlap = 0; if (!a.length || !b.length) return 0; a.forEach(function (x) { seen[x] = true; }); b.forEach(function (x) { if (seen[x]) overlap += 1; }); return overlap / Math.max(a.length, b.length); }
  function bestMemory(raw) { var best = null; loadMemory().forEach(function (item) { var score = memoryScore(raw, item); if (!best || score > best.score) best = { score: score, item: item }; }); return best && best.score >= 0.24 ? best : null; }
  function rememberMap(s, m) { var raw = String(s.briefFog.rawTaskText || SAMPLE_TASK).slice(0, 9000); var memory = loadMemory().filter(function (item) { return clean(item.rawTaskText, 9000) !== clean(raw, 9000); }); memory.unshift({ rawTaskText: raw, map: m, savedAt: new Date().toISOString() }); try { localStorage.setItem(MEMORY_KEY, JSON.stringify(memory.slice(0, 30))); } catch (e) {} }

  function infer(s) {
    var raw = String(s.briefFog.rawTaskText || SAMPLE_TASK);
    var command = /\b(analyse|analyze|analysing|analyzing)\b/i.test(raw) ? "analyse" : /\b(evaluate|evaluating)\b/i.test(raw) ? "evaluate" : /\b(compare|comparing)\b/i.test(raw) ? "compare" : /\b(discuss|discussing)\b/i.test(raw) ? "discuss" : /\b(describe|describing)\b/i.test(raw) ? "describe" : "explain";
    var focus = /\bto what extent\b/i.test(raw) ? "to what extent" : /\bhow\b/i.test(raw) ? "how" : /\bwhy\b/i.test(raw) ? "why" : "main focus";
    var out = raw.match(/\b(\d{2,5})\s*(?:-|\s)?word\s+(essay|practice response|response|report|reflection)?\b/i);
    var process = raw.match(/use\s+(.+?)\s+to\s+(improve|develop|support|create|achieve)\b/i) || raw.match(/using\s+(.+?)\s+to\s+(improve|develop|support|create|achieve)\b/i);
    var outcome = raw.match(/\bto\s+(improve\s+.+?)(?:\.|\?|$)/i) || raw.match(/\bto\s+(develop\s+.+?)(?:\.|\?|$)/i) || raw.match(/\bto\s+(support\s+.+?)(?:\.|\?|$)/i);
    var m = { output: out ? out[1] + "-word " + clean(out[2] || "response", 80) : "assignment response", command: command, focus: focus, subject: /\bstudent\b/i.test(raw) ? "a student" : "the subject / actor", process: process ? clean(process[1], 500) : "main process / method", outcome: outcome ? clean(outcome[1], 500) : "the assignment outcome", buckets: process ? splitList(process[1]) : ["main point 1", "main point 2", "main point 3"], reason: process ? "Found list after “use” and before “to improve”." : "Could not find a list. Edit buckets before continuing.", learnedFromMemory: false };
    var old = bestMemory(raw);
    if (old && old.item && old.item.map && genericMap(m) && !genericMap(old.item.map)) m = Object.assign({}, old.item.map, { reason: "Used a similar approved question map from browser history.", learnedFromMemory: true, memoryScore: Math.round(old.score * 100) });
    return m;
  }

  function map(s) { var inferred = infer(s), saved = s.briefFog.taskMap && typeof s.briefFog.taskMap === "object" ? s.briefFog.taskMap : null, m = genericMap(saved) ? inferred : saved; m.buckets = arr(m.buckets).length ? arr(m.buckets) : inferred.buckets; return m; }
  function applyMap(s, m) { s.briefFog.taskMap = m; s.briefFog.chunkTags = {}; s.briefFog.chunks = arr(m.buckets).map(function (bucket, i) { var stem = clean(bucket, 80).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); var cid = stem ? "bucket-" + stem : "bucket-" + i + "-" + uid(); s.briefFog.chunkTags[cid] = { subject: m.subject, command: m.command, focus: m.focus, action: bucket, target: m.outcome, outcome: m.outcome, keyAreas: bucket }; return { id: cid, text: bucket, plain: "Find evidence or examples for " + bucket + ".", action: "Use Source Mine to gather at least one evidence gem for " + bucket + ".", state: "unpacked" }; }); }

  function stage() { return document.getElementById("stage-scene"); }
  function lockStage(n) { n.style.position = "fixed"; n.style.inset = "0"; n.style.zIndex = "9999"; n.style.width = "100vw"; n.style.height = "100dvh"; document.documentElement.style.overflow = "hidden"; document.body.style.overflow = "hidden"; }
  function unlockStage() { document.documentElement.style.overflow = ""; document.body.style.overflow = ""; }
  function closePanels() { document.querySelectorAll("details[open]").forEach(function (d) { d.open = false; }); }
  function info(s) { return '<p class="save-status bf-save"><strong>Saved:</strong> ' + esc(s.lastSavedAt || "Not saved yet") + '</p>'; }
  function chips(b) { return '<div class="bf-compass-buckets">' + arr(b).map(function (x) { return '<span title="' + esc(FIELD_TIPS.buckets) + '">' + esc(x) + '</span>'; }).join("") + '</div>'; }
  function field(key, label, value) { return '<div class="bf-field" title="' + esc(FIELD_TIPS[key]) + '" data-tip="' + esc(FIELD_TIPS[key]) + '"><strong>' + esc(label) + '</strong>' + esc(value) + '</div>'; }

  function styles() { return '<style data-bf-compass-stable>.bf-stage-exit,.bf-fullscreen-fixed{position:fixed!important;top:8px;z-index:10020;border:1px solid rgba(236,215,170,.75);border-radius:999px;background:rgba(25,16,10,.92);color:#fff7df;font-weight:900;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.35)}.bf-stage-exit{right:8px;width:34px;height:34px;font-size:1.1rem}.bf-fullscreen-fixed{right:50px;padding:7px 10px;font-size:.75rem}.bf-compass-card{top:46px!important;left:10px!important;width:min(400px,calc(100vw - 20px))!important;max-height:calc(100dvh - 58px)!important;overflow:auto!important;padding:7px!important;font-size:.72rem}.bf-compass-card h2{margin:0!important;font-size:1.05rem!important}.bf-compass-card h3{margin:4px 0 2px!important;font-size:.86rem!important}.bf-compass-card p{margin:3px 0!important;line-height:1.18!important}.bf-compact-question{margin:3px 0}.bf-compact-question summary,.bf-more-details summary{cursor:pointer;font-weight:900}.bf-question-full{padding:6px;border-radius:9px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.15);line-height:1.2}.bf-compass-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;margin:4px 0}.bf-field{position:relative;padding:5px;border-radius:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);line-height:1.1}.bf-field strong{display:block;font-size:.58rem;text-transform:uppercase;letter-spacing:.04em;opacity:.78}.bf-field:hover::after,.bf-field:focus-within::after{content:attr(data-tip);position:absolute;left:0;top:100%;z-index:300;width:min(280px,70vw);padding:6px;border-radius:8px;background:rgba(250,242,225,.98);color:#2f2118;border:1px solid rgba(97,70,45,.32);box-shadow:0 10px 30px rgba(0,0,0,.35);font-size:.78rem;line-height:1.2;text-transform:none;letter-spacing:0}.bf-compass-buckets{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}.bf-compass-buckets span{display:inline-block;padding:4px 6px;border-radius:999px;background:rgba(255,231,171,.90);color:#2f2118;font-weight:900}.bf-compass-note{padding:5px;border-radius:8px;background:rgba(255,231,171,.18);border:1px solid rgba(255,231,171,.34);margin:4px 0}.bf-memory-note,.bf-save{font-size:.7rem}.bf-compass-card .simple-actions{gap:4px!important;margin-top:5px!important}.bf-compass-card .simple-actions button{padding:5px 7px!important;font-size:.7rem!important}.bf-compass-drawer{top:46px!important;right:10px!important;bottom:10px!important;width:min(440px,calc(100vw - 20px))!important;padding:12px!important}.bf-compass-drawer textarea{min-height:55px}@media(max-width:700px){.bf-compass-card{top:48px!important;width:calc(100vw - 16px)!important;left:8px!important;max-height:calc(100dvh - 60px)!important;font-size:.7rem}.bf-compass-grid{grid-template-columns:1fr}.bf-fullscreen-fixed{right:48px}}</style>'; }

  function summary(m, s) { var memory = m.learnedFromMemory ? '<p class="bf-memory-note"><strong>Learned:</strong> reused similar approved map.</p>' : ''; return '<section><details class="bf-compact-question"><summary>Show full question</summary><p class="bf-question-full">' + esc(s.briefFog.rawTaskText || SAMPLE_TASK) + '</p></details><p><strong>Plain English:</strong> ' + esc(m.command) + ' ' + esc(m.focus) + ' ' + esc(m.subject) + ' can use ' + esc(m.process) + ' to ' + esc(m.outcome) + '.</p><h3 title="' + esc(FIELD_TIPS.buckets) + '">Source Mine buckets</h3>' + chips(m.buckets) + '<details class="bf-more-details"><summary>Map details</summary><div class="bf-compass-grid">' + field('output', 'Output', m.output) + field('command', 'Command', m.command) + field('focus', 'Focus', m.focus) + field('subject', 'Subject', m.subject) + field('process', 'Process', m.process) + field('outcome', 'Outcome', m.outcome) + '</div></details><p class="bf-compass-note">' + esc(m.reason) + '</p>' + memory + '</section>'; }
  function drawer(title, body) { return '<section class="simple-drawer bf-compass-drawer" role="dialog" aria-label="' + esc(title) + '"><button type="button" class="simple-close" data-action="bf-compass-close" aria-label="Close panel">×</button><h2>' + esc(title) + '</h2>' + body + '</section>'; }

  function render(extra) { var s = load(), m = map(s), n = stage(); if (!n) return; closePanels(); n.hidden = false; lockStage(n); s.briefFog.routeChoice = "vanquish"; s.briefFog.sceneState = "compass"; s.briefFog.taskMap = m; save(s, "Brief Fog Quest Compass opened"); n.innerHTML = styles() + '<section class="simple-room brief-fog-room bf-vn-room bf-scene-compass"><button type="button" class="bf-stage-exit" data-action="bf-compass-exit" aria-label="Close room">×</button><button type="button" class="bf-fullscreen-fixed" data-action="bf-compass-fullscreen">Full</button><p class="scene-label">Brief Fog · Quest Compass</p><article class="stage-card simple-card bf-compass-card"><h2>Brief Fog</h2><p>Check buckets. Hover for help.</p>' + summary(m, s) + info(s) + '<div class="simple-actions"><button type="button" data-action="bf-compass-edit">Edit</button><button type="button" data-action="bf-compass-reread">Re-read</button><button type="button" data-action="bf-compass-confirm">Confirm → Source Mine</button><button type="button" data-action="bf-compass-flag">Flag</button><button type="button" data-action="bf-read-scroll">Choices</button></div></article>' + (extra || "") + '</section>'; }
  function edit() { var s = load(), m = map(s); render(drawer("Edit Quest Compass", info(s) + '<form data-bf-compass-form><label>Full question<textarea name="rawTaskText" rows="5">' + esc(s.briefFog.rawTaskText || SAMPLE_TASK) + '</textarea></label><label>Output<input name="output" value="' + esc(m.output) + '"></label><label>Command<input name="command" value="' + esc(m.command) + '"></label><label>Focus<input name="focus" value="' + esc(m.focus) + '"></label><label>Subject<input name="subject" value="' + esc(m.subject) + '"></label><label>Process<textarea name="process" rows="3">' + esc(m.process) + '</textarea></label><label>Outcome<textarea name="outcome" rows="3">' + esc(m.outcome) + '</textarea></label><label>Evidence buckets<textarea name="buckets" rows="6">' + esc(arr(m.buckets).join("\n")) + '</textarea></label><div class="simple-actions"><button type="button" data-action="bf-compass-save">Save map</button><button type="button" data-action="bf-compass-reread">Re-read</button><button type="button" data-action="bf-compass-confirm">Confirm → Source Mine</button></div></form>')); }
  function formMap() { var f = document.querySelector("[data-bf-compass-form]"); if (!f) return null; var d = new FormData(f); return { output: clean(d.get("output"), 180), command: clean(d.get("command"), 80), focus: clean(d.get("focus"), 120), subject: clean(d.get("subject"), 160), process: clean(d.get("process"), 600), outcome: clean(d.get("outcome"), 500), buckets: String(d.get("buckets") || "").split(/[\n;,]/).map(function (x) { return clean(x, 80); }).filter(Boolean), reason: "Edited manually." }; }
  function reread() { var s = load(), f = document.querySelector("[data-bf-compass-form]"); if (f) { var d = new FormData(f); s.briefFog.rawTaskText = weakQuestion(d.get("rawTaskText")) ? SAMPLE_TASK : String(d.get("rawTaskText") || SAMPLE_TASK); } delete s.briefFog.taskMap; save(s, "Brief Fog re-read the question"); render(); }
  function saveCompass() { var s = load(), f = document.querySelector("[data-bf-compass-form]"); if (f) { var d = new FormData(f); s.briefFog.rawTaskText = weakQuestion(d.get("rawTaskText")) ? SAMPLE_TASK : String(d.get("rawTaskText") || SAMPLE_TASK); } var m = formMap() || map(s); applyMap(s, m); rememberMap(s, m); save(s, "Brief Fog Quest Compass saved and learned"); render(drawer("Map Saved", '<p>Saved. Future similar questions can reuse this pattern.</p>' + summary(m, s) + info(s))); }
  function confirm() { var s = load(), m = formMap() || map(s); applyMap(s, m); rememberMap(s, m); if (s.completed.indexOf("brief-fog") === -1) s.completed.push("brief-fog"); if (s.unlocked.indexOf("source-mine") === -1) s.unlocked.push("source-mine"); s.current = "source-mine"; unlockStage(); save(s, "Brief Fog cleared; Source Mine unlocked"); click("open-source-mine"); }
  function flag() { var s = load(), m = map(s); s.flags.push({ id: uid(), text: "Brief Fog confusion: check Quest Compass buckets: " + arr(m.buckets).join(", ") }); save(s, "Brief Fog confusion flagged"); render(drawer("Confusion Flagged", '<p>Flag saved.</p>' + info(s))); }
  function exitCompass() { var n = stage(); unlockStage(); if (n) { n.hidden = true; n.innerHTML = ""; } }
  function goFullscreen() { var el = document.querySelector(".game-cave") || stage() || document.documentElement; if (el.requestFullscreen) el.requestFullscreen().catch(function () {}); }
  function click(action, data) { var b = document.createElement("button"); b.type = "button"; b.dataset.action = action; Object.keys(data || {}).forEach(function (k) { b.dataset[k] = String(data[k]); }); document.body.appendChild(b); b.click(); b.remove(); }
  document.addEventListener("click", function (e) { var b = e.target.closest("button, a"); if (!b) return; var a = b.dataset.action || ""; if (["bf-vanquish", "open-task-brief", "work-next-chunk", "open-summary", "finish-brief-fog"].indexOf(a) >= 0) { e.preventDefault(); e.stopImmediatePropagation(); return render(); } if (a === "bf-compass-edit") { e.preventDefault(); e.stopImmediatePropagation(); return edit(); } if (a === "bf-compass-save") { e.preventDefault(); e.stopImmediatePropagation(); return saveCompass(); } if (a === "bf-compass-reread") { e.preventDefault(); e.stopImmediatePropagation(); return reread(); } if (a === "bf-compass-confirm") { e.preventDefault(); e.stopImmediatePropagation(); return confirm(); } if (a === "bf-compass-flag") { e.preventDefault(); e.stopImmediatePropagation(); return flag(); } if (a === "bf-compass-fullscreen") { e.preventDefault(); e.stopImmediatePropagation(); return goFullscreen(); } if (a === "bf-compass-exit") { e.preventDefault(); e.stopImmediatePropagation(); return exitCompass(); } if (a === "bf-compass-close") { e.preventDefault(); e.stopImmediatePropagation(); return render(); } }, true);
})();
