(function () {
  "use strict";

  function core() { return window.EsslayTaskScrollCore; }
  function ui() { return window.EsslayTaskScrollUI; }
  function stage() { return document.getElementById("stage-scene"); }
  function field(idValue) { var node = document.getElementById(idValue); return node ? node.value : ""; }
  function status(message) { var node = document.querySelector("[data-task-scroll-status]"); if (node) node.textContent = message; }

  function click(action) {
    var button = document.createElement("button");
    button.type = "button";
    button.dataset.action = action;
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  async function importPdf() {
    var c = core();
    var input = document.querySelector("[data-task-scroll-file]");
    var file = input && input.files ? input.files[0] : null;
    if (!file) return status("Choose an assignment PDF first.");
    status("Opening “" + c.text(file.name, 120) + "”…");
    try {
      var result = await c.extractPdf(file, function (page, pageCount) {
        status("Reading page " + page + " of " + pageCount + "…");
      });
      c.createScroll({
        title: field("task-scroll-title") || c.text(file.name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " "), 240),
        originalFilename: file.name,
        importType: "pdf-text",
        pageCount: result.pageCount,
        fragments: result.fragments
      });
      ui().sieve();
    } catch (error) {
      status(error && error.message ? error.message : "The task PDF could not be imported.");
    }
  }

  function pasteScroll() {
    var c = core();
    var source = document.querySelector("[data-task-scroll-paste]");
    var raw = c.text(source && source.value, 16000);
    if (!raw) return status("Paste task scroll text first.");
    c.createScroll({
      title: field("task-scroll-title") || "Pasted Quest Scroll",
      originalFilename: "",
      importType: "pasted-text",
      pageCount: 0,
      fragments: c.splitTaskText(raw).map(function (chunk, index) { return c.fragment(chunk, null, index + 1); })
    });
    ui().sieve();
  }

  function saveFragment(park) {
    var c = core();
    var form = document.querySelector("[data-task-scroll-form]");
    if (!form) return;
    var state = c.load(), scroll = state.briefFog.taskScroll;
    var item = scroll.fragments.find(function (fragment) { return fragment.id === form.dataset.id; });
    if (!item) return ui().sieve();
    var data = new FormData(form);
    var role = park ? "parked" : String(data.get("role") || "");
    if (!c.ROLES[role] || !role) return status("Choose what this fragment is for, or park it for later.");
    item.role = role;
    item.status = role === "parked" ? "parked" : "kept";
    item.note = c.text(data.get("note"), 900);
    item.decidedAt = c.iso();
    scroll.recipeConfirmedAt = "";
    c.save(state, "Quest Scroll fragment saved as " + c.ROLES[role]);
    ui().sieve();
  }

  function command(value) {
    var lower = String(value || "").toLowerCase();
    return ["evaluate", "analyse", "analyze", "compare", "discuss", "explain", "describe"].find(function (word) {
      return lower.indexOf(word) !== -1;
    }) || "understand";
  }

  function ingredientRecord(c, item) {
    return {
      id: item.id,
      label: c.text(item.note || item.text, 180),
      text: c.text(item.text, 2200),
      role: item.role,
      pageNumber: item.pageNumber || null,
      chunkIndex: item.chunkIndex || 0,
      originalFilename: ""
    };
  }

  function confirmRecipe() {
    var c = core();
    var state = c.load(), scroll = state.briefFog.taskScroll, data = c.recipe(scroll);
    if (data.bosses.length !== 1 || !data.ingredients.length) return ui().recipe("Choose one Current Boss and at least one ingredient first.");
    var ingredients = data.ingredients.map(function (item) {
      var record = ingredientRecord(c, item);
      record.originalFilename = scroll.originalFilename || "";
      return record;
    });
    var names = [];
    ingredients.forEach(function (ingredient) {
      if (ingredient.label && names.indexOf(ingredient.label) === -1) names.push(ingredient.label);
    });
    var boss = data.bosses[0];
    state.briefFog.taskMap = {
      output: "assignment response",
      command: command(boss.text),
      focus: "current boss task",
      subject: scroll.title || "assignment",
      process: "gather the selected spell ingredients in Source Mine",
      outcome: "complete the selected boss task",
      buckets: names,
      reason: "Built from player-confirmed Quest Scroll fragments.",
      taskScroll: {
        title: scroll.title,
        originalFilename: scroll.originalFilename,
        currentBossId: boss.id,
        ingredientIds: ingredients.map(function (ingredient) { return ingredient.id; }),
        ingredients: ingredients,
        recipeConfirmedAt: c.iso()
      }
    };
    state.briefFog.chunks = names.map(function (name, index) {
      var key = "ingredient-" + c.text(name,80).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") + "-" + index;
      state.briefFog.chunkTags[key] = {
        subject: state.briefFog.taskMap.subject,
        command: state.briefFog.taskMap.command,
        focus: state.briefFog.taskMap.focus,
        action: name,
        target: state.briefFog.taskMap.outcome,
        outcome: state.briefFog.taskMap.outcome,
        keyAreas: name
      };
      return {
        id: key,
        text: name,
        plain: "Gather source evidence for this spell ingredient.",
        action: "Use Source Mine to collect evidence crystals for this ingredient.",
        state: "unpacked"
      };
    });
    scroll.recipeConfirmedAt = c.iso();
    if (state.completed.indexOf("brief-fog") === -1) state.completed.push("brief-fog");
    if (state.unlocked.indexOf("source-mine") === -1) state.unlocked.push("source-mine");
    state.current = "source-mine";
    c.save(state, "Spell Recipe confirmed; Source Mine ingredients prepared");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    click("open-source-mine");
  }

  function exportScroll() {
    var c = core();
    var state = c.load(), scroll = state.briefFog.taskScroll;
    if (!scroll.fragments.length) return ui().home("Bring a Quest Scroll before exporting it.");
    var payload = { format:c.FORMAT, version:c.VERSION, exportedAt:c.iso(), taskScroll:scroll, taskMap:state.briefFog.taskMap || null };
    var blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
    var url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url;
    link.download = "esslay-quest-scroll-" + c.iso().slice(0,10) + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
    ui().home("Quest Scroll JSON exported. Keep it with your assignment materials.");
  }

  function importScroll() {
    var c = core();
    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.style.display = "none";
    document.body.appendChild(input);
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) { input.remove(); return; }
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var payload = JSON.parse(String(reader.result || ""));
          if (!payload || payload.format !== c.FORMAT || Number(payload.version) !== c.VERSION || !payload.taskScroll) {
            throw new Error("That is not a valid Esslay Quest Scroll backup.");
          }
          var state = c.load(), scroll = c.normalise(payload.taskScroll);
          if (!scroll.fragments.length) throw new Error("This Quest Scroll backup has no readable fragments.");
          state.briefFog.taskScroll = scroll;
          if (payload.taskMap && typeof payload.taskMap === "object") state.briefFog.taskMap = payload.taskMap;
          c.save(state, "Quest Scroll backup restored");
          ui().recipe("Quest Scroll backup restored. Check the Spell Recipe before Source Mine.");
        } catch (error) {
          ui().home(error && error.message ? error.message : "The Quest Scroll backup could not be imported.");
        }
        input.remove();
      };
      reader.onerror = function () {
        input.remove();
        ui().home("The Quest Scroll backup could not be read.");
      };
      reader.readAsText(file);
    });
    input.click();
  }

  function replaceScroll() {
    var c = core(), state = c.load();
    state.briefFog.taskScroll = c.emptyScroll();
    c.save(state, "Quest Scroll ready to replace");
    ui().home("Choose another PDF or paste a different assignment brief.");
  }

  function returnCompass() {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    click("bf-vanquish");
  }

  function addCompassButtons() {
    var c = core();
    var card = document.querySelector(".bf-compass-card");
    if (!card) return;
    var actions = card.querySelector(".simple-actions");
    if (!actions) return;
    if (!actions.querySelector('[data-action="task-scroll-open"]')) {
      var button = document.createElement("button");
      button.type = "button";
      button.dataset.action = "task-scroll-open";
      button.className = "ts-open-button";
      button.textContent = c.load().briefFog.taskScroll.fragments.length ? "Quest Scroll" : "Bring Quest Scroll";
      actions.insertBefore(button, actions.firstChild);
    }
    if (c.load().briefFog.taskScroll.fragments.length) {
      var confirm = actions.querySelector('[data-action="bf-compass-confirm"]');
      if (confirm) {
        confirm.dataset.action = "task-scroll-continue";
        confirm.textContent = "Spell Recipe → Source Mine";
      }
    }
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button) return;
    var action = button.dataset.action || "";
    if (action === "task-scroll-open") { event.preventDefault(); event.stopImmediatePropagation(); return ui().home(); }
    if (action === "task-scroll-continue") { event.preventDefault(); event.stopImmediatePropagation(); return ui().recipe(); }
    if (action === "task-scroll-import-pdf") { event.preventDefault(); event.stopImmediatePropagation(); return importPdf(); }
    if (action === "task-scroll-import-paste") { event.preventDefault(); event.stopImmediatePropagation(); return pasteScroll(); }
    if (action === "task-scroll-home") { event.preventDefault(); event.stopImmediatePropagation(); return ui().home(); }
    if (action === "task-scroll-sieve") { event.preventDefault(); event.stopImmediatePropagation(); return ui().sieve(); }
    if (action === "task-scroll-recipe") { event.preventDefault(); event.stopImmediatePropagation(); return ui().recipe(); }
    if (action === "task-scroll-save") { event.preventDefault(); event.stopImmediatePropagation(); return saveFragment(false); }
    if (action === "task-scroll-park") { event.preventDefault(); event.stopImmediatePropagation(); return saveFragment(true); }
    if (action === "task-scroll-confirm") { event.preventDefault(); event.stopImmediatePropagation(); return confirmRecipe(); }
    if (action === "task-scroll-export") { event.preventDefault(); event.stopImmediatePropagation(); return exportScroll(); }
    if (action === "task-scroll-import-json") { event.preventDefault(); event.stopImmediatePropagation(); return importScroll(); }
    if (action === "task-scroll-replace") { event.preventDefault(); event.stopImmediatePropagation(); return replaceScroll(); }
    if (action === "task-scroll-return") { event.preventDefault(); event.stopImmediatePropagation(); return returnCompass(); }
  }, true);

  var node = stage();
  if (node && window.MutationObserver) new MutationObserver(addCompassButtons).observe(node, {childList:true, subtree:true});
  document.addEventListener("DOMContentLoaded", addCompassButtons);
  window.setTimeout(addCompassButtons, 0);
})();
