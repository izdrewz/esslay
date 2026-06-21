(function () {
  "use strict";

  function core() { return window.EsslayTaskScrollCore; }
  function esc(value) { return String(value == null ? "" : value).replace(/[&<>\"]/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function stage() { return document.getElementById("stage-scene"); }

  function closePanels() { document.querySelectorAll("details[open]").forEach(function (item) { item.open = false; }); }
  function lock(node) {
    node.hidden = false;
    node.style.position = "fixed";
    node.style.inset = "0";
    node.style.zIndex = "9999";
    node.style.width = "100vw";
    node.style.height = "100dvh";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function styles() {
    return '<style data-task-scroll-pdf-v1>.ts-card{top:46px!important;left:10px!important;width:min(520px,calc(100vw - 20px))!important;max-height:calc(100dvh - 58px)!important;overflow:auto!important;padding:12px!important}.ts-card h2{margin:0!important}.ts-card h3{margin:10px 0 5px!important}.ts-card p{margin:5px 0!important;line-height:1.25!important}.ts-card label{display:block;margin:9px 0;font-weight:900}.ts-card input,.ts-card textarea,.ts-card select{display:block;width:100%;box-sizing:border-box;margin-top:4px;padding:8px;border-radius:10px;border:1px solid rgba(236,215,170,.4);font:inherit;background:#fff;color:#2f2118}.ts-close{position:fixed!important;right:8px!important;top:8px!important;z-index:10020!important;width:34px!important;height:34px!important;border:1px solid rgba(236,215,170,.75)!important;border-radius:999px!important;background:rgba(25,16,10,.92)!important;color:#fff7df!important;font-weight:900!important;cursor:pointer!important}.ts-box,.ts-fragment,.ts-section{margin:9px 0;padding:9px;border-radius:13px;border:1px solid rgba(255,231,171,.36);background:rgba(7,10,18,.72)}.ts-meta{font-size:.8rem;opacity:.86}.ts-text{max-height:260px;overflow:auto;padding:9px;border-radius:10px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.14);line-height:1.3}.ts-status{min-height:1.3em;font-weight:800}.ts-note,.ts-warning{padding:7px;border-radius:9px;background:rgba(255,231,171,.18);border:1px solid rgba(255,231,171,.34)}.ts-warning{background:rgba(201,135,74,.24)}.ts-list{margin:0;padding-left:18px}.ts-list li{margin:7px 0}.ts-list small,.ts-list em{display:block;font-size:.82rem;opacity:.85}.ts-open-button{background:rgba(255,231,171,.92)!important;color:#2f2118!important}@media(max-width:700px){.ts-card{left:8px!important;top:48px!important;width:calc(100vw - 16px)!important;max-height:calc(100dvh - 60px)!important}}</style>';
  }

  function render(body) {
    var node = stage();
    if (!node) return;
    closePanels();
    lock(node);
    node.innerHTML = styles() + '<section class="simple-room brief-fog-room task-scroll-room"><button type="button" class="ts-close" data-action="task-scroll-return" aria-label="Return to Quest Compass">×</button><p class="scene-label">Brief Fog · Quest Scroll</p>' + body + "</section>";
  }

  function meta(scroll, item) {
    var parts = [];
    if (scroll.originalFilename) parts.push(scroll.originalFilename);
    if (item.pageNumber) parts.push("page " + item.pageNumber);
    if (item.chunkIndex) parts.push("fragment " + item.chunkIndex);
    return parts.length ? parts.join(" · ") : "Pasted Quest Scroll · fragment " + (item.chunkIndex || 1);
  }

  function options(selected, suggested) {
    var c = core();
    return Object.keys(c.ROLES).map(function (role) {
      return '<option value="' + esc(role) + '"' + (selected === role ? " selected" : "") + '>' + esc(c.ROLES[role] + (role && role === suggested ? " (suggested)" : "")) + "</option>";
    }).join("");
  }

  function listView(scroll, items, empty) {
    var c = core();
    if (!items.length) return '<p>' + esc(empty) + '</p>';
    return '<ul class="ts-list">' + items.map(function (item) {
      return '<li><strong>' + esc(c.text(item.text,170)) + '</strong><small>' + esc(meta(scroll,item)) + '</small>' + (item.note ? '<em>' + esc(item.note) + '</em>' : '') + '</li>';
    }).join("") + "</ul>";
  }

  function home(message) {
    var c = core();
    var scroll = c.load().briefFog.taskScroll;
    var existing = scroll.fragments.length;
    render('<article class="stage-card simple-card ts-card"><h2>Brief Fog</h2><p><strong>Bring Your Quest Scroll</strong></p><p>Import the assignment brief. The Fog Sieve cuts it into instruction fragments. You decide what becomes the current boss, spell ingredients, rules, success conditions, or later notes.</p><label>Quest title<input id="task-scroll-title" value="' + esc(scroll.title) + '" placeholder="emTMA 04, essay brief, exam task…"></label><section class="ts-box"><h3>Import assignment PDF locally</h3><p>Read only in this browser. It is not uploaded to GitHub or a server.</p><input type="file" accept="application/pdf,.pdf" data-task-scroll-file><div class="simple-actions"><button type="button" data-action="task-scroll-import-pdf">Read Quest Scroll</button></div></section><details class="ts-box"><summary>Paste task text instead</summary><textarea data-task-scroll-paste rows="7" placeholder="Paste an assignment brief, exam paper, guidance, or marking criteria."></textarea><div class="simple-actions"><button type="button" data-action="task-scroll-import-paste">Create Fog fragments</button></div></details><p class="ts-status" data-task-scroll-status>' + esc(message || (existing ? "Saved Quest Scroll: " + existing + " fragments." : "")) + '</p>' + (existing ? '<section class="ts-box"><p><strong>Current scroll:</strong> ' + esc(scroll.title || "Quest Scroll") + '</p><p>' + esc(scroll.originalFilename || "Pasted text") + " · " + existing + ' fragments</p><div class="simple-actions"><button type="button" data-action="task-scroll-sieve">Open Fog Sieve</button><button type="button" data-action="task-scroll-recipe">Open Spell Recipe</button><button type="button" data-action="task-scroll-export">Export Quest Scroll JSON</button><button type="button" data-action="task-scroll-replace">Replace scroll</button></div></section>' : '') + '<section class="ts-box"><p><strong>Quest Scroll backup:</strong> restore this scroll without replacing unrelated cave progress.</p><div class="simple-actions"><button type="button" data-action="task-scroll-import-json">Import Quest Scroll JSON</button></div></section><div class="simple-actions"><button type="button" data-action="task-scroll-return">Return to Quest Compass</button></div></article>');
  }

  function sieve() {
    var c = core();
    var scroll = c.load().briefFog.taskScroll;
    if (!scroll.fragments.length) return home("Bring a Quest Scroll before opening the Fog Sieve.");
    var item = c.unsorted(scroll)[0];
    if (!item) return recipeView();
    render('<article class="stage-card simple-card ts-card"><h2>Brief Fog</h2><p><strong>Fog Sieve</strong> · Reviewed: ' + (scroll.fragments.length - c.unsorted(scroll).length) + ' · Unsorted: ' + c.unsorted(scroll).length + '</p><section class="ts-fragment"><p class="ts-meta">' + esc(meta(scroll,item)) + '</p><div class="ts-text">' + esc(item.text) + '</div><form data-task-scroll-form data-id="' + esc(item.id) + '"><label>What does this fragment do?<select name="role">' + options(item.role,item.suggestedRole) + '</select></label><p class="ts-note">' + (item.suggestedRole ? 'Possible role: <strong>' + esc(c.ROLES[item.suggestedRole]) + '</strong>. You decide.' : "No role suggested. Decide what it is for, or park it.") + '</p><label>Your note / why it matters<textarea name="note" rows="3" placeholder="Optional"></textarea></label><div class="simple-actions"><button type="button" data-action="task-scroll-save">Keep in recipe → next</button><button type="button" data-action="task-scroll-park">Park for later → next</button><button type="button" data-action="task-scroll-recipe">Check Spell Recipe</button></div></form></section><div class="simple-actions"><button type="button" data-action="task-scroll-home">Quest Scroll</button></div></article>');
  }

  function recipeView(message) {
    var c = core();
    var scroll = c.load().briefFog.taskScroll;
    if (!scroll.fragments.length) return home("Bring a Quest Scroll before opening the Spell Recipe.");
    var data = c.recipe(scroll);
    var ready = data.bosses.length === 1 && data.ingredients.length > 0;
    render('<article class="stage-card simple-card ts-card"><h2>Brief Fog</h2><p><strong>Spell Recipe</strong></p><p>Only Required Evidence and Key Scope ingredients are passed into Source Mine as crystal slots.</p><section class="ts-section"><h3>Current Boss</h3>' + listView(scroll,data.bosses,"Choose one Current Boss for this run.") + '</section><section class="ts-section"><h3>Quest Parts</h3>' + listView(scroll,data.parts,"No separate parts saved.") + '</section><section class="ts-section"><h3>Spell Ingredients for Source Mine</h3>' + listView(scroll,data.ingredients,"Save Required Evidence or Key Scope fragments.") + '</section><section class="ts-section"><h3>Crafting Rules</h3>' + listView(scroll,data.crafting,"No crafting rules saved.") + '</section><section class="ts-section"><h3>Reference Rules</h3>' + listView(scroll,data.references,"No reference rules saved.") + '</section><section class="ts-section"><h3>Boss Success Conditions</h3>' + listView(scroll,data.success,"No marking targets saved.") + '</section><details class="ts-section"><summary>Admin details and parked fragments</summary><h3>Admin details</h3>' + listView(scroll,data.admin,"None.") + '<h3>Parked</h3>' + listView(scroll,data.parked,"None.") + '</details>' + (data.unsorted.length ? '<p class="ts-warning">' + data.unsorted.length + ' fragments are still unsorted.</p>' : '') + (data.bosses.length > 1 ? '<p class="ts-warning">Choose one Current Boss. Keep other task parts under Quest Parts.</p>' : '') + '<p class="ts-status">' + esc(message || (ready ? "Recipe is ready for Source Mine." : "Choose one Current Boss and at least one Source Mine ingredient.")) + '</p><div class="simple-actions"><button type="button" data-action="task-scroll-sieve">Return to Fog Sieve</button><button type="button" data-action="task-scroll-confirm"' + (ready ? "" : " disabled") + '>Confirm Recipe → Source Mine</button><button type="button" data-action="task-scroll-home">Quest Scroll</button></div></article>');
  }

  window.EsslayTaskScrollUI = { home:home, sieve:sieve, recipe:recipeView, render:render, meta:meta };
})();
