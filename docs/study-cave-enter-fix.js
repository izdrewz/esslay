(() => {
  const KEY = "esslay-study-cave-save-v01";
  const QUEST_ID = "study-skills-trial";
  const TOTAL = 7;
  const SAMPLE = "Write an 800-word practice response explaining how a student can use planning, source notes, drafting, proofreading, and referencing habits to improve the quality of an academic assignment.";

  const cats = [
    "Command word / action word",
    "Topic keyword",
    "Scope / limit",
    "Evidence / source requirement",
    "Format / output rule",
    "Word count / deadline rule",
    "Marking / quality clue",
    "Optional / context wording",
    "Dismissed wording",
    "Unsure"
  ];
  const states = [
    "Not started",
    "In progress",
    "Fully unpacked",
    "Dismissed with reason",
    "Flagged for later",
    "Parked as missed loot",
    "Partially unpacked - warning accepted"
  ];
  const typeLabels = [
    "Main question",
    "Task instruction",
    "Guidance note",
    "Marking instruction",
    "Source requirement",
    "Format instruction",
    "Word count / deadline instruction",
    "Submission instruction",
    "Tutor feedback instruction",
    "Reflection instruction",
    "Unknown"
  ];
  const resolvedStates = [
    "Fully unpacked",
    "Dismissed with reason",
    "Flagged for later",
    "Parked as missed loot",
    "Partially unpacked - warning accepted"
  ];

  const now = () => new Date().toISOString();
  const id = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const esc = (value) => String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  const options = (items, selected) => items.map((item) => `<option${item === selected ? " selected" : ""}>${esc(item)}</option>`).join("");
  const unique = (items, item) => Array.from(new Set([...(Array.isArray(items) ? items : []), item]));

  function blankFog() {
    return {
      taskTitle: "Study Skills Trial",
      assessmentType: "practice task",
      rawTaskText: SAMPLE,
      chunks: [],
      highlights: [],
      notes: [],
      dismissed: [],
      flags: [],
      missedLoot: [],
      outputCards: {
        commandWordCards: [],
        keywordCards: [],
        scopeLimitCards: [],
        sourceRequirementCards: [],
        taskDemandSummary: null
      },
      status: "unlocked",
      clearedAt: null
    };
  }

  function baseState() {
    return {
      version: "0.1",
      activeQuestId: QUEST_ID,
      selectedQuestId: QUEST_ID,
      quests: {
        [QUEST_ID]: {
          questId: QUEST_ID,
          questTitle: "Study Skills Trial",
          status: "not_started",
          questStatus: "task-map-started",
          currentRouteLocation: "task_map_threshold",
          currentChamberId: "brief-fog",
          currentChamberLabel: "Brief Fog / Question-Unpacking Chamber",
          completedChambers: [],
          unlockedChambers: ["cave-base", "brief-fog"],
          flags: [],
          missedLoot: [],
          collectedLoot: [],
          progressLog: [],
          nextAction: "Enter Cave Base",
          buttonLabel: "Open Test Quest",
          taskMapSummary: {
            currentChamber: "Brief Fog / Question-Unpacking Chamber",
            progress: "0 / 7 chambers complete",
            nextAction: "Enter Cave Base"
          },
          briefFog: blankFog(),
          chamberSaves: { briefFog: { rawTaskText: SAMPLE, wordCount: 800 } },
          createdAt: now(),
          updatedAt: now()
        }
      },
      caveBase: {},
      globalProgressLog: [],
      lastSavedAt: now()
    };
  }

  function load() {
    let stored;
    try { stored = JSON.parse(localStorage.getItem(KEY)); } catch { stored = null; }
    const base = baseState();
    const save = { ...base, ...(stored || {}) };
    save.quests = { ...base.quests, ...(save.quests || {}) };
    const quest = { ...base.quests[QUEST_ID], ...(save.quests[QUEST_ID] || {}) };
    quest.completedChambers = Array.isArray(quest.completedChambers) ? quest.completedChambers : [];
    quest.unlockedChambers = Array.isArray(quest.unlockedChambers) && quest.unlockedChambers.length ? quest.unlockedChambers : ["cave-base", "brief-fog"];
    quest.flags = Array.isArray(quest.flags) ? quest.flags : [];
    quest.missedLoot = Array.isArray(quest.missedLoot) ? quest.missedLoot : [];
    quest.progressLog = Array.isArray(quest.progressLog) ? quest.progressLog : [];
    quest.briefFog = { ...blankFog(), ...(quest.briefFog || {}) };
    quest.briefFog.chunks = Array.isArray(quest.briefFog.chunks) ? quest.briefFog.chunks : [];
    quest.briefFog.highlights = Array.isArray(quest.briefFog.highlights) ? quest.briefFog.highlights : [];
    quest.briefFog.notes = Array.isArray(quest.briefFog.notes) ? quest.briefFog.notes : [];
    quest.briefFog.dismissed = Array.isArray(quest.briefFog.dismissed) ? quest.briefFog.dismissed : [];
    quest.briefFog.flags = Array.isArray(quest.briefFog.flags) ? quest.briefFog.flags : [];
    quest.briefFog.missedLoot = Array.isArray(quest.briefFog.missedLoot) ? quest.briefFog.missedLoot : [];
    quest.briefFog.outputCards = { ...blankFog().outputCards, ...(quest.briefFog.outputCards || {}) };
    save.quests[QUEST_ID] = quest;
    return save;
  }

  const getQuest = (save) => save.quests[QUEST_ID];
  const getFog = (save) => getQuest(save).briefFog;
  const progressLabel = (quest) => `${quest.completedChambers.length} / ${TOTAL} chambers complete`;
  const chamberLabel = (idValue) => idValue === "source-mine" ? "Source Mine" : idValue === "brief-fog" ? "Brief Fog / Question-Unpacking Chamber" : "Cave Base";

  function saveState(save) {
    const quest = getQuest(save);
    save.lastSavedAt = now();
    quest.updatedAt = save.lastSavedAt;
    save.caveBase = {
      activeQuestId: QUEST_ID,
      currentChamberId: quest.currentChamberId,
      currentRouteLocation: quest.currentRouteLocation,
      completedChambers: quest.completedChambers,
      unlockedChambers: quest.unlockedChambers,
      missedLoot: quest.missedLoot,
      openFlags: quest.flags.filter((flag) => flag.status === "open"),
      lastSavedAt: save.lastSavedAt
    };
    localStorage.setItem(KEY, JSON.stringify(save));
    updateStaticQuestCard(save);
  }

  function updateStaticQuestCard(save) {
    const quest = getQuest(save);
    document.querySelectorAll("[data-flow-progress]").forEach((node) => { node.textContent = `${quest.completedChambers.length} / ${TOTAL}`; });
    const card = document.querySelector('[data-open-quest="study-skills-trial"]')?.closest(".quest-board-card");
    if (!card) return;
    const started = quest.completedChambers.includes("brief-fog");
    card.querySelector(".quest-card-task").textContent = `Neutral 800-word practice task. Current chamber: ${chamberLabel(quest.currentChamberId)}. Progress: ${progressLabel(quest)}.`;
    card.querySelector(".quest-card-status").innerHTML = `<strong>Status:</strong> ${started ? "In progress" : "Not started"} · <strong>Flags:</strong> ${quest.flags.length} · <strong>Missed loot:</strong> ${quest.missedLoot.length}`;
    card.querySelector('[data-open-quest="study-skills-trial"]').textContent = started ? "Continue Test Quest" : "Open Test Quest";
  }

  function stage() { return document.getElementById("stage-scene"); }
  function openStage(markup) {
    document.querySelectorAll("details[open]").forEach((details) => { details.open = false; });
    const node = stage();
    node.innerHTML = markup;
    node.hidden = false;
  }
  function closeStage() {
    const node = stage();
    node.innerHTML = "";
    node.hidden = true;
  }
  function drawer(title, body, wide = false) {
    return `<aside class="scene-drawer ${wide ? "wide-drawer" : "compact-drawer"}"><button type="button" class="drawer-close" data-close-drawer>×</button><h2>${esc(title)}</h2>${body}</aside>`;
  }
  function list(items, key) {
    return items.length ? `<ul>${items.map((item) => `<li>${esc(item[key] || "item")}</li>`).join("")}</ul>` : `<p>None yet.</p>`;
  }

  function caveBase(save, activeDrawer = "") {
    const quest = getQuest(save);
    return `<section class="stage-room cave-base-room"><button class="stage-close" data-close-stage>×</button><span class="scene-label">Cave Base · safe hub</span><div class="stage-character stage-character-base"></div><button class="flow-hotspot hotspot-chest" data-hotspot-label="Outfit chest" data-base-panel="outfit">Outfit chest</button><button class="flow-hotspot hotspot-ledger" data-hotspot-label="Journal" data-base-panel="ledger">Journal</button><button class="flow-hotspot hotspot-shelf" data-hotspot-label="Completed" data-base-panel="completed">Completed</button><button class="flow-hotspot hotspot-flags" data-hotspot-label="Flags" data-base-panel="flags">Flags</button><button class="flow-hotspot hotspot-continue" data-hotspot-label="Continue" data-continue-quest>Continue</button><button class="flow-hotspot hotspot-return" data-hotspot-label="Task map" data-open-task-map>Task map</button><article class="stage-card"><h2>Cave Base</h2><p><strong>Active quest:</strong> ${esc(quest.questTitle)}</p><p><strong>Current chamber:</strong> ${esc(chamberLabel(quest.currentChamberId))}</p><p><strong>Progress:</strong> ${esc(progressLabel(quest))}</p><p><strong>Completed:</strong> ${esc(quest.completedChambers.join(", ") || "none yet")}</p><p><strong>Flags:</strong> ${quest.flags.length} · <strong>Missed loot:</strong> ${quest.missedLoot.length}</p></article>${activeDrawer}</section>`;
  }

  function basePanel(save, type) {
    const quest = getQuest(save);
    if (type === "outfit") return drawer("Outfit Chest", `<p>Study Cave outfit changing will live here. For v0.1 this is a placeholder and does not change progress.</p>`);
    if (type === "ledger") return drawer("Cave Journal / Route Ledger", `<p><strong>Current:</strong> ${esc(chamberLabel(quest.currentChamberId))}</p><p><strong>Progress:</strong> ${esc(progressLabel(quest))}</p><p><strong>Unlocked:</strong> ${esc(quest.unlockedChambers.join(", "))}</p>`);
    if (type === "completed") return drawer("Completed Chamber Summary", quest.completedChambers.includes("brief-fog") ? `<p>Brief Fog / Question-Unpacking Chamber is completed and reviewable.</p><button data-review-brief-fog>Review Brief Fog</button>` : `<p>No chambers completed yet.</p>`);
    return drawer("Flags / Missed Loot", `<h3>Flags</h3>${list(quest.flags, "note")}<h3>Missed loot</h3>${list(quest.missedLoot, "itemMissed")}`);
  }

  function patchClass(fog, index) {
    const chunk = fog.chunks[index];
    if (!chunk) return "empty";
    if (chunk.state === "Fully unpacked" || chunk.state === "Partially unpacked - warning accepted") return "cleared";
    if (chunk.state === "Flagged for later") return "flagged";
    if (chunk.state === "Parked as missed loot") return "missed";
    if (chunk.state === "Dismissed with reason") return "dismissed";
    if (chunk.state === "In progress") return "processing";
    return "unprocessed";
  }

  function nextChunkIndex(fog) {
    const index = fog.chunks.findIndex((chunk) => !resolvedStates.includes(chunk.state));
    return index >= 0 ? index : Math.max(0, fog.chunks.length - 1);
  }

  function briefFog(save, activeDrawer = "", activeIndex = null) {
    const fog = getFog(save);
    const done = fog.chunks.filter((chunk) => resolvedStates.includes(chunk.state)).length;
    const activeClass = activeIndex !== null ? "cutscene-active" : "";
    const patch = (index) => `<span class="fog-patch visual-fog-patch fog-patch-${index + 1} ${patchClass(fog, index)} ${activeIndex === index ? "cutscene-target" : ""}" aria-hidden="true"></span>`;
    return `<section class="stage-room brief-fog-room ${activeClass}"><button class="stage-close" data-return-cave-base>×</button><span class="scene-label">Brief Fog · Question-Unpacking Chamber</span><div class="stage-character stage-character-brief"></div><span class="light-beam ${activeIndex !== null ? "active" : ""}"></span><button class="flow-hotspot hotspot-parchment" data-hotspot-label="Task Brief" data-brief-panel="task">Task</button>${patch(0)}${patch(1)}${patch(2)}${patch(3)}<button class="flow-hotspot hotspot-brief-flag" data-hotspot-label="Flags" data-brief-panel="flags">Flags</button><button class="flow-hotspot hotspot-brief-loot" data-hotspot-label="Missed loot" data-brief-panel="flags">Loot</button><button class="flow-hotspot hotspot-forward ${canClear(fog) ? "ready" : "locked"}" data-hotspot-label="Route forward" data-brief-panel="summary">Route</button><article class="stage-card"><h2>Brief Fog</h2><p><strong>Chunks:</strong> ${fog.chunks.length} · <strong>Resolved:</strong> ${done}/${fog.chunks.length}</p><p><strong>Cards:</strong> ${fog.outputCards.commandWordCards.length} command · ${fog.outputCards.keywordCards.length} keyword · ${fog.outputCards.scopeLimitCards.length} scope · ${fog.outputCards.sourceRequirementCards.length} source</p><p>This chamber is for understanding the task, not writing the answer.</p><div class="stage-card-actions"><button type="button" data-next-chunk>${fog.chunks.length ? "Work next chunk" : "Start task"}</button><button type="button" data-brief-panel="task">Task Brief</button><button type="button" data-brief-panel="summary">Summary</button></div></article>${activeDrawer}</section>`;
  }

  function taskPanel(save) {
    const fog = getFog(save);
    return drawer("Task Brief", `<p>Paste or adjust the task, question, brief, guidance, or marking notes. Fog patches are created from this text when the quest starts.</p><form data-task-form><label>Task title<input name="taskTitle" value="${esc(fog.taskTitle)}"></label><label>Assessment type<input name="assessmentType" value="${esc(fog.assessmentType)}"></label><label>Paste task / question / guidance<textarea name="rawTaskText" rows="7">${esc(fog.rawTaskText)}</textarea></label><div class="drawer-actions"><button data-save-task type="button">Save task brief</button><button data-suggest-chunks type="button">Refresh fog chunks</button><button data-add-chunk type="button">Add chunk manually</button></div></form><h3>Chunk list</h3>${fog.chunks.length ? `<ol class="chunk-list">${fog.chunks.map((chunk, index) => `<li><button data-open-chunk="${index}">${esc(chunk.originalText.slice(0, 70))}${chunk.originalText.length > 70 ? "…" : ""}</button> <small>${esc(chunk.state)}</small></li>`).join("")}</ol>` : `<p>No chunks yet.</p>`}`, true);
  }

  function note(fog, chunkId, type) {
    return fog.notes.find((noteItem) => noteItem.chunkId === chunkId && noteItem.type === type)?.text || "";
  }

  function chunkPanel(save, index) {
    const fog = getFog(save);
    const chunk = fog.chunks[index];
    if (!chunk) return taskPanel(save);
    const highlights = fog.highlights.filter((highlight) => highlight.chunkId === chunk.id);
    const flags = fog.flags.filter((flag) => flag.chunkId === chunk.id);
    const missed = fog.missedLoot.filter((loot) => loot.chunkId === chunk.id);
    const dismissed = fog.dismissed.filter((entry) => entry.chunkId === chunk.id);
    return drawer(`Chunk ${index + 1}`, `<form data-chunk-form data-index="${index}" class="chunk-drawer"><p class="drawer-kicker">Cut-scene target: fog patch ${index + 1}</p><label>Original wording<textarea name="originalText" rows="4">${esc(chunk.originalText)}</textarea></label><div class="drawer-grid"><label>Chunk type<select name="type">${options(typeLabels, chunk.type)}</select></label><label>Chunk state<select name="state">${options(states, chunk.state)}</select></label></div><label>Plain-meaning note<textarea name="plain" rows="3">${esc(note(fog, chunk.id, "plain"))}</textarea></label><label>Action-created note<textarea name="action" rows="3">${esc(note(fog, chunk.id, "action"))}</textarea></label><details open><summary>Add highlight</summary><label>Selected wording<input name="highlightedText"></label><label>Highlight category<select name="category">${options(cats, cats[0])}</select></label><label>Confidence<select name="confidence"><option>Sure</option><option>Unsure</option><option>Needs checking</option></select></label><label>Highlight note<input name="highlightNote"></label><button data-add-highlight type="button">Add highlight</button></details><h3>Selected highlights</h3>${list(highlights.map((highlight) => ({ text: `${highlight.text} — ${highlight.category}` })), "text")}<details><summary>Flags, missed loot, dismissed wording</summary><label>Flag note<input name="flagNote"></label><button data-add-flag type="button">Add flag</button><label>Missed loot note<input name="missedNote"></label><button data-add-missed type="button">Add missed loot</button><label>Dismissed wording<input name="dismissedText"></label><button data-dismiss-wording type="button">Dismiss wording</button></details><h3>Flags</h3>${list(flags, "note")}<h3>Missed loot</h3>${list(missed, "itemMissed")}<h3>Dismissed wording</h3>${list(dismissed, "text")}<div class="drawer-actions sticky-actions"><button data-save-chunk type="button">Save chunk</button><button data-mark-full type="button">Mark fully unpacked</button><button data-park type="button">Park for later</button><button data-open-chunk="${Math.max(0, index - 1)}" type="button">Previous chunk</button><button data-open-chunk="${Math.min(fog.chunks.length - 1, index + 1)}" type="button">Next chunk</button></div></form>`, true);
  }

  function flagsPanel(save) {
    const quest = getQuest(save);
    return drawer("Flags / Missed Loot", `<p>Flags and missed loot do not undo completion.</p><h3>Flags</h3>${list(quest.flags, "note")}<h3>Missed loot</h3>${list(quest.missedLoot, "itemMissed")}`);
  }

  function summaryPanel(save, cleared = false) {
    const quest = getQuest(save);
    const fog = getFog(save);
    const warningList = warnings(fog);
    return drawer(cleared ? "Brief Fog Cleared" : "Brief Fog Summary", `${cleared ? `<p>Source Mine is now unlocked. Progress updated to ${esc(progressLabel(quest))}.</p>` : `<p>Check every chunk has a decision before moving forward.</p>`}<dl class="summary-grid"><div><dt>Task title</dt><dd>${esc(fog.taskTitle)}</dd></div><div><dt>Assessment type</dt><dd>${esc(fog.assessmentType)}</dd></div><div><dt>Number of chunks</dt><dd>${fog.chunks.length}</dd></div><div><dt>Command words found</dt><dd>${fog.outputCards.commandWordCards.length}</dd></div><div><dt>Topic keywords found</dt><dd>${fog.outputCards.keywordCards.length}</dd></div><div><dt>Open flags</dt><dd>${quest.flags.length}</dd></div><div><dt>Missed loot</dt><dd>${quest.missedLoot.length}</dd></div></dl><h3>Task demand summary</h3><p>${esc(fog.outputCards.taskDemandSummary?.summaryText || "No summary yet.")}</p>${warningList.length ? `<section class="warning-list"><h3>Warnings</h3><ul>${warningList.map((warning) => `<li>${esc(warning)}</li>`).join("")}</ul></section>` : `<p class="success-note">Every chunk has a decision and the route can continue.</p>`}<div class="drawer-actions"><button data-finish-brief-fog type="button" ${warningList.length ? "disabled" : ""}>Finish Brief Fog</button><button data-export="md" type="button">Export .md</button><button data-export="txt" type="button">Export .txt</button><button data-export="doc" type="button">Export .doc</button>${quest.unlockedChambers.includes("source-mine") ? `<button data-open-source-mine type="button">Continue to Source Mine</button>` : ""}<button data-return-cave-base type="button">Stay in Cave Base</button></div>`, true);
  }

  function sourceMine(save) {
    const quest = getQuest(save);
    return `<section class="stage-room source-mine-room brief-fog-room"><button class="stage-close" data-return-cave-base>×</button><span class="scene-label">Source Mine · placeholder</span><article class="stage-card"><h2>Source Mine</h2><p>This chamber will hold source gathering, source notes, quote preparation, and source-to-task links. For v0.1 this is a placeholder.</p><p><strong>Progress:</strong> ${esc(progressLabel(quest))}</p><button data-return-cave-base>X Return to Cave Base</button></article></section>`;
  }

  function canClear(fog) {
    return fog.chunks.length && fog.chunks.every((chunk) => resolvedStates.includes(chunk.state)) && fog.outputCards.taskDemandSummary;
  }

  function warnings(fog) {
    const result = [];
    if (!fog.chunks.length) result.push("No chunks have been created yet. Split the task into chunks before entering Brief Fog.");
    fog.chunks.forEach((chunk, index) => {
      if (!resolvedStates.includes(chunk.state)) result.push(`Chunk ${index + 1} has no decision yet.`);
      if (!["Dismissed with reason", "Parked as missed loot"].includes(chunk.state) && !note(fog, chunk.id, "plain")) result.push(`Chunk ${index + 1} has no plain-meaning note.`);
      if (!["Dismissed with reason", "Parked as missed loot"].includes(chunk.state) && !note(fog, chunk.id, "action")) result.push(`Chunk ${index + 1} does not say what action it creates.`);
    });
    if (fog.chunks.length && !fog.outputCards.taskDemandSummary) result.push("Task demand summary has not been created yet. Save a chunk to generate it.");
    return result;
  }

  function splitText(text) {
    const clean = String(text || SAMPLE).trim();
    const units = clean.split(/\n+/).filter(Boolean).length > 1 ? clean.split(/\n+/).filter(Boolean) : clean.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).filter(Boolean);
    return units.map((unit, index) => ({
      id: id("chunk"),
      order: index,
      originalText: unit.replace(/^[-*•\d.)\s]+/, "").trim(),
      type: /source|reference|reading/i.test(unit) ? "Source requirement" : /word|deadline|due/i.test(unit) ? "Word count / deadline instruction" : /write|explain|discuss|evaluate|compare|describe|analyse|identify/i.test(unit) ? "Task instruction" : "Guidance note",
      state: "Not started",
      createdAt: now(),
      updatedAt: now()
    }));
  }

  function ensureAutoChunks(save) {
    const fog = getFog(save);
    if (!fog.rawTaskText) fog.rawTaskText = SAMPLE;
    if (!fog.chunks.length) {
      fog.chunks = splitText(fog.rawTaskText);
      fog.highlights = [];
      fog.notes = [];
      fog.dismissed = [];
      fog.outputCards = blankFog().outputCards;
    }
    return save;
  }

  function ensureSummary(fog) {
    if (!fog.outputCards.taskDemandSummary) {
      fog.outputCards.taskDemandSummary = {
        summaryText: note(fog, fog.chunks[0]?.id, "plain") || "The task has been broken into fog patches and each patch needs a decision.",
        createdAt: now()
      };
    }
  }

  function addOutputCard(fog, highlight) {
    const card = { text: highlight.text, summaryText: highlight.note || highlight.text, createdAt: now() };
    if (highlight.category === cats[0]) fog.outputCards.commandWordCards.push({ ...card, commandWord: highlight.text });
    else if (highlight.category === cats[1]) fog.outputCards.keywordCards.push({ ...card, keyword: highlight.text });
    else if ([cats[2], cats[4], cats[5], cats[6]].includes(highlight.category)) fog.outputCards.scopeLimitCards.push({ ...card, scopeText: highlight.text });
    else if (highlight.category === cats[3]) fog.outputCards.sourceRequirementCards.push({ ...card, requirementText: highlight.text });
  }

  function saveChunk(form, action) {
    const save = load();
    const fog = getFog(save);
    const quest = getQuest(save);
    const index = Number(form.dataset.index);
    const chunk = fog.chunks[index];
    const data = new FormData(form);
    chunk.originalText = String(data.get("originalText") || chunk.originalText);
    chunk.type = String(data.get("type") || chunk.type);
    chunk.state = String(data.get("state") || chunk.state);

    const plain = String(data.get("plain") || "").trim();
    const actionNote = String(data.get("action") || "").trim();
    fog.notes = fog.notes.filter((noteItem) => !(noteItem.chunkId === chunk.id && ["plain", "action"].includes(noteItem.type)));
    if (plain) fog.notes.push({ id: id("note"), chunkId: chunk.id, type: "plain", text: plain, createdAt: now() });
    if (actionNote) fog.notes.push({ id: id("note"), chunkId: chunk.id, type: "action", text: actionNote, createdAt: now() });

    if (action === "highlight" && String(data.get("highlightedText") || "").trim()) {
      const highlight = { id: id("highlight"), chunkId: chunk.id, text: String(data.get("highlightedText")).trim(), category: String(data.get("category")), confidence: String(data.get("confidence")), note: String(data.get("highlightNote") || ""), createdAt: now() };
      fog.highlights.push(highlight);
      addOutputCard(fog, highlight);
    }
    if (action === "flag") {
      const flag = { id: id("flag"), chunkId: chunk.id, note: String(data.get("flagNote") || "This chunk needs checking later."), status: "open", createdAt: now() };
      fog.flags.push(flag);
      quest.flags.push(flag);
      chunk.state = "Flagged for later";
    }
    if (action === "missed" || action === "park") {
      const missed = { id: id("missed"), chunkId: chunk.id, itemMissed: String(data.get("missedNote") || "Useful task work left for later."), status: "missed", createdAt: now() };
      fog.missedLoot.push(missed);
      quest.missedLoot.push(missed);
      chunk.state = "Parked as missed loot";
    }
    if (action === "dismiss") {
      fog.dismissed.push({ id: id("dismissed"), chunkId: chunk.id, text: String(data.get("dismissedText") || chunk.originalText), createdAt: now() });
      chunk.state = "Dismissed with reason";
    }
    if (action === "full") chunk.state = actionNote ? "Partially unpacked - warning accepted" : "Fully unpacked";
    if (chunk.state === "Not started") chunk.state = "In progress";
    ensureSummary(fog);
    chunk.updatedAt = now();
    quest.progressLog.unshift({ id: id("log"), summary: `Saved Brief Fog chunk ${index + 1}.`, createdAt: now() });
    saveState(save);
    openStage(briefFog(save, chunkPanel(save, index), index));
  }

  function clearFog() {
    const save = load();
    const quest = getQuest(save);
    const fog = getFog(save);
    ensureSummary(fog);
    if (warnings(fog).length) return openStage(briefFog(save, summaryPanel(save)));
    fog.status = "cleared";
    fog.clearedAt = now();
    quest.completedChambers = unique(quest.completedChambers, "brief-fog");
    quest.unlockedChambers = unique(quest.unlockedChambers, "source-mine");
    quest.currentChamberId = "source-mine";
    quest.currentChamberLabel = "Source Mine";
    quest.currentRouteLocation = "cave_base";
    quest.status = "in_progress";
    quest.questStatus = "in-cave";
    quest.nextAction = "Continue to Source Mine";
    quest.buttonLabel = "Continue Test Quest";
    quest.progressLog.unshift({ id: id("log"), summary: "Brief Fog / Question-Unpacking Chamber cleared. Source Mine unlocked.", createdAt: now() });
    saveState(save);
    openStage(caveBase(save, summaryPanel(save, true)));
  }

  function exportPanel(format) {
    const save = load();
    const quest = getQuest(save);
    const fog = getFog(save);
    const content = `Brief Fog / Question-Unpacking Chamber Export\n\nQuest: ${quest.questTitle}\nExport date: ${now()}\nCurrent chamber: ${chamberLabel(quest.currentChamberId)}\nStatus: ${fog.status}\n\nRaw task text\n${fog.rawTaskText}\n\nChunks\n${fog.chunks.map((chunk, index) => `${index + 1}. ${chunk.originalText}\nState: ${chunk.state}\nPlain meaning: ${note(fog, chunk.id, "plain") || "None"}\nAction created: ${note(fog, chunk.id, "action") || "None"}`).join("\n\n")}\n\nFlags: ${quest.flags.map((flag) => flag.note).join("; ") || "None"}\nMissed loot: ${quest.missedLoot.map((loot) => loot.itemMissed).join("; ") || "None"}\nNext action: ${quest.nextAction || "Continue route"}`;
    const name = `${new Date().toISOString().slice(0, 10)}_Study-Skills-Trial_Brief-Fog-Export.${format}`;
    const mime = format === "md" ? "text/markdown" : format === "doc" ? "application/msword" : "text/plain";
    const href = `data:${mime};charset=utf-8,${encodeURIComponent(format === "doc" ? `<!doctype html><meta charset='utf-8'><pre>${esc(content)}</pre>` : content)}`;
    return drawer(`Export .${format}`, `<p>Download or copy this export.</p><a class="download-link" download="${esc(name)}" href="${href}">Download ${esc(name)}</a><textarea rows="12" readonly>${esc(content)}</textarea>`, true);
  }

  function enterBase(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const save = load();
    const quest = getQuest(save);
    quest.currentRouteLocation = "cave_base";
    quest.currentChamberId = quest.completedChambers.includes("brief-fog") ? "source-mine" : "brief-fog";
    quest.nextAction = quest.currentChamberId === "source-mine" ? "Continue to Source Mine" : "Continue to Brief Fog";
    saveState(save);
    openStage(caveBase(save));
  }

  function continueRoute(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const save = ensureAutoChunks(load());
    const quest = getQuest(save);
    quest.currentRouteLocation = "working_chamber";
    saveState(save);
    openStage(quest.currentChamberId === "source-mine" ? sourceMine(save) : briefFog(save));
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-enter-cave-base]")) return enterBase(event);
    if (event.target.closest("[data-continue-quest]")) return continueRoute(event);
    if (event.target.closest("[data-close-stage]")) { event.preventDefault(); event.stopImmediatePropagation(); return closeStage(); }
    if (event.target.closest("[data-return-cave-base]")) { event.preventDefault(); event.stopImmediatePropagation(); const save = load(); getQuest(save).currentRouteLocation = "cave_base"; saveState(save); return openStage(caveBase(save)); }
    if (event.target.closest("[data-open-task-map]") && stage()?.hidden === false) { event.preventDefault(); event.stopImmediatePropagation(); closeStage(); const panel = document.getElementById("map-board-panel"); if (panel) panel.open = true; return; }

    const baseButton = event.target.closest("[data-base-panel]");
    if (baseButton) { event.preventDefault(); event.stopImmediatePropagation(); const save = load(); return openStage(caveBase(save, basePanel(save, baseButton.dataset.basePanel))); }

    const briefButton = event.target.closest("[data-brief-panel]");
    if (briefButton) { event.preventDefault(); event.stopImmediatePropagation(); const save = load(); const type = briefButton.dataset.briefPanel; return openStage(briefFog(save, type === "task" ? taskPanel(save) : type === "flags" ? flagsPanel(save) : summaryPanel(save))); }

    if (event.target.closest("[data-next-chunk]")) { event.preventDefault(); event.stopImmediatePropagation(); const save = ensureAutoChunks(load()); const index = nextChunkIndex(getFog(save)); saveState(save); return openStage(briefFog(save, chunkPanel(save, index), index)); }

    const openChunkButton = event.target.closest("[data-open-chunk]");
    if (openChunkButton && stage()?.hidden === false) { event.preventDefault(); event.stopImmediatePropagation(); const save = load(); const index = Number(openChunkButton.dataset.openChunk); return openStage(briefFog(save, chunkPanel(save, index), index)); }

    if (event.target.closest("[data-close-drawer]")) { event.preventDefault(); event.stopImmediatePropagation(); const save = load(); return openStage(getQuest(save).currentRouteLocation === "working_chamber" ? briefFog(save) : caveBase(save)); }

    if (event.target.closest("[data-save-task]") || event.target.closest("[data-suggest-chunks]")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const form = event.target.closest("form");
      const data = new FormData(form);
      const save = load();
      const fog = getFog(save);
      fog.taskTitle = String(data.get("taskTitle") || fog.taskTitle);
      fog.assessmentType = String(data.get("assessmentType") || fog.assessmentType);
      fog.rawTaskText = String(data.get("rawTaskText") || fog.rawTaskText);
      if (event.target.closest("[data-suggest-chunks]")) {
        fog.chunks = splitText(fog.rawTaskText);
        fog.highlights = [];
        fog.notes = [];
        fog.outputCards = blankFog().outputCards;
      }
      saveState(save);
      return openStage(briefFog(save, taskPanel(save)));
    }

    if (event.target.closest("[data-add-chunk]")) { event.preventDefault(); event.stopImmediatePropagation(); const save = load(); const fog = getFog(save); fog.chunks.push({ id: id("chunk"), order: fog.chunks.length, originalText: "New chunk — edit this wording.", type: "Unknown", state: "Not started", createdAt: now(), updatedAt: now() }); saveState(save); return openStage(briefFog(save, chunkPanel(save, fog.chunks.length - 1), fog.chunks.length - 1)); }

    const chunkForm = event.target.closest("form[data-chunk-form]");
    if (chunkForm) {
      if (event.target.closest("[data-save-chunk]")) { event.preventDefault(); event.stopImmediatePropagation(); return saveChunk(chunkForm, "save"); }
      if (event.target.closest("[data-add-highlight]")) { event.preventDefault(); event.stopImmediatePropagation(); return saveChunk(chunkForm, "highlight"); }
      if (event.target.closest("[data-add-flag]")) { event.preventDefault(); event.stopImmediatePropagation(); return saveChunk(chunkForm, "flag"); }
      if (event.target.closest("[data-add-missed]")) { event.preventDefault(); event.stopImmediatePropagation(); return saveChunk(chunkForm, "missed"); }
      if (event.target.closest("[data-dismiss-wording]")) { event.preventDefault(); event.stopImmediatePropagation(); return saveChunk(chunkForm, "dismiss"); }
      if (event.target.closest("[data-mark-full]")) { event.preventDefault(); event.stopImmediatePropagation(); return saveChunk(chunkForm, "full"); }
      if (event.target.closest("[data-park]")) { event.preventDefault(); event.stopImmediatePropagation(); return saveChunk(chunkForm, "park"); }
    }

    if (event.target.closest("[data-finish-brief-fog]")) { event.preventDefault(); event.stopImmediatePropagation(); return clearFog(); }
    const exportButton = event.target.closest("[data-export]");
    if (exportButton) { event.preventDefault(); event.stopImmediatePropagation(); const save = load(); return openStage(briefFog(save, exportPanel(exportButton.dataset.export))); }
    if (event.target.closest("[data-open-source-mine]")) { event.preventDefault(); event.stopImmediatePropagation(); const save = load(); return openStage(sourceMine(save)); }
    if (event.target.closest("[data-review-brief-fog]")) { event.preventDefault(); event.stopImmediatePropagation(); const save = load(); return openStage(briefFog(save, summaryPanel(save))); }
  }, true);

  document.addEventListener("DOMContentLoaded", () => updateStaticQuestCard(load()));
})();
