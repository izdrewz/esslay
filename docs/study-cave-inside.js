(() => {
  const STORAGE_KEY = "esslay-inside-cave-v01";
  const QUEST_BOARD_KEY = "esslay-quest-board-v01";

  const chamberOrder = ["task-intake", "command-word-gate", "keyword-lanterns", "source-mine", "quote-bank-vault", "draft-route-map", "dirty-draft-tunnel", "boss-fight"];

  const route = [
    ["task-intake", "Task Intake Chamber"],
    ["command-word-gate", "Command Word Gate"],
    ["keyword-lanterns", "Keyword Lanterns"],
    ["source-mine", "Source Mine"],
    ["quote-bank-vault", "Quote Bank Vault"],
    ["draft-route-map", "Draft Route Map"],
    ["dirty-draft-tunnel", "Dirty Draft Tunnel"],
    ["boss-fight", "Boss Fight / Weaving Chamber"]
  ];

  const defaultIntake = {
    taskTitle: "The Study Skills Trial",
    taskType: "test-task",
    moduleCode: "Practice",
    wordCount: 800,
    dueDate: "",
    taskBrief: "A neutral 800-word practice task used to test the Study Cave route.",
    userNotes: "",
    unclearPoints: "",
    nextAction: "Clear the Task Intake Chamber and move to the Command Word Chamber."
  };

  const defaultCommandGate = {
    commandWord: "explain",
    commandMeaning: "Make the idea clear by showing how or why it works, using examples or reasons.",
    taskDemand: "Explain how planning, source notes, drafting, proofreading, and referencing habits can improve an academic assignment.",
    keywords: "planning, source notes, drafting, proofreading, referencing, academic assignment quality",
    limitsScope: "Keep this as a neutral 800-word practice response, not a real module submission.",
    unclearWording: "",
    notes: "",
    nextAction: "Move to Keyword Lanterns and turn the task wording into planning keywords."
  };

  const chamberConfigs = {
    "task-intake": {
      id: "task-intake",
      title: "Task Intake Chamber",
      blocker: "Brief Fog",
      purpose: "Bring the task in, lay it out, and make the next move clear before planning.",
      stateKey: "taskIntake",
      nextId: "command-word-gate",
      nextTitle: "Command Word Gate",
      visualClass: "task-intake-stage",
      requiredAlert: "Task Intake Chamber still needs: ",
      lootTasks: [
        { id: "task-title", label: "Task title confirmed", field: "taskTitle", loot: "gold coin", required: true, missingText: "Task title not confirmed" },
        { id: "task-type", label: "Task type identified", field: "taskType", loot: "blue geode", required: true, missingText: "Task type not identified" },
        { id: "word-count", label: "Word count captured", field: "wordCount", loot: "small chest", required: true, missingText: "Word count not captured" },
        { id: "task-brief", label: "Task brief captured", field: "taskBrief", loot: "scroll crate", required: true, missingText: "Task brief or task note not captured" },
        { id: "next-action", label: "Next action written", field: "nextAction", loot: "route lantern", required: true, missingText: "Next action not written" },
        { id: "module-context", label: "Module/context added", field: "moduleCode", loot: "wooden barrel", required: false, missingText: "Module/context left unfinished" },
        { id: "due-date", label: "Due date checked", field: "dueDate", loot: "silver coin pouch", required: false, missingText: "Due date left blank" },
        { id: "extra-notes", label: "Extra notes added", field: "userNotes", loot: "note crate", required: false, missingText: "Extra notes left unfinished" },
        { id: "unclear-points", label: "Unclear points named", field: "unclearPoints", loot: "warning geode", required: false, missingText: "Unclear points not named" }
      ]
    },
    "command-word-gate": {
      id: "command-word-gate",
      title: "Command Word Gate",
      blocker: "Command Imp",
      purpose: "Work out what the task is actually asking before collecting keywords or planning the answer.",
      stateKey: "commandGate",
      nextId: "keyword-lanterns",
      nextTitle: "Keyword Lanterns",
      visualClass: "command-gate-stage",
      requiredAlert: "Command Word Gate still needs: ",
      lootTasks: [
        { id: "command-word", label: "Command word identified", field: "commandWord", loot: "command geode", required: true, missingText: "Command word not identified" },
        { id: "command-meaning", label: "Meaning written in own words", field: "commandMeaning", loot: "meaning scroll", required: true, missingText: "Command word meaning not written" },
        { id: "task-demand", label: "Task demand explained", field: "taskDemand", loot: "gold chest", required: true, missingText: "Task demand not explained" },
        { id: "keywords", label: "Keywords pulled from task", field: "keywords", loot: "keyword lantern", required: true, missingText: "Keywords not pulled from the task" },
        { id: "next-action", label: "Next action written", field: "nextAction", loot: "route key", required: true, missingText: "Next action not written" },
        { id: "limits-scope", label: "Limits/scope added", field: "limitsScope", loot: "boundary barrel", required: false, missingText: "Limits/scope left unfinished" },
        { id: "unclear-wording", label: "Unclear wording named", field: "unclearWording", loot: "warning crystal", required: false, missingText: "Unclear wording not named" },
        { id: "notes", label: "Extra command notes added", field: "notes", loot: "note crate", required: false, missingText: "Extra command notes left unfinished" }
      ]
    }
  };

  function now() { return new Date().toISOString(); }
  function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`; }

  function defaultState() {
    return {
      activeQuestId: "study-skills-trial",
      selectedQuestId: "study-skills-trial",
      currentChamberId: "task-intake",
      studyQuestOpen: false,
      taskIntake: { ...defaultIntake, status: "not_started" },
      commandGate: { ...defaultCommandGate, status: "not_started" },
      completedChambers: [],
      unlockedChambers: ["task-intake"],
      flags: [],
      missedLoot: [],
      progressLog: [],
      lastSavedAt: now()
    };
  }

  function loadState() {
    try { return normaliseState(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
    catch { return defaultState(); }
  }

  function normaliseState(stored) {
    const base = defaultState();
    const state = { ...base, ...(stored || {}) };
    state.taskIntake = { ...base.taskIntake, ...(state.taskIntake || {}) };
    state.commandGate = { ...base.commandGate, ...(state.commandGate || {}) };
    state.completedChambers = Array.isArray(state.completedChambers) ? state.completedChambers : [];
    state.unlockedChambers = Array.isArray(state.unlockedChambers) && state.unlockedChambers.length ? state.unlockedChambers : ["task-intake"];
    if (state.completedChambers.includes("task-intake") && !state.unlockedChambers.includes("command-word-gate")) state.unlockedChambers.push("command-word-gate");
    if (state.completedChambers.includes("command-word-gate") && !state.unlockedChambers.includes("keyword-lanterns")) state.unlockedChambers.push("keyword-lanterns");
    state.flags = Array.isArray(state.flags) ? state.flags : [];
    state.missedLoot = Array.isArray(state.missedLoot) ? state.missedLoot : [];
    state.progressLog = Array.isArray(state.progressLog) ? state.progressLog : [];
    return state;
  }

  function saveState(state) {
    state.lastSavedAt = now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    syncStudyQuestStore(state);
    syncQuestBoardCard(state);
    return state;
  }

  function addLog(state, chamberId, action, summary) {
    state.progressLog.unshift({ id: uid("progress"), timestamp: now(), chamber: chamberId, action, summary });
    state.progressLog = state.progressLog.slice(0, 100);
  }

  function getConfig(chamberId) { return chamberConfigs[chamberId] || chamberConfigs["task-intake"]; }
  function getChamberData(state, chamberId) { return state[getConfig(chamberId).stateKey] || {}; }
  function setChamberData(state, chamberId, data) { state[getConfig(chamberId).stateKey] = data; }

  function taskValueComplete(data, task) {
    if (task.field === "wordCount") return Number(data.wordCount) > 0;
    if (task.id === "task-brief") return Boolean((data.taskBrief || data.userNotes || "").trim());
    return Boolean(String(data[task.field] || "").trim());
  }

  function missingLootTasks(state, chamberId, options = {}) {
    const config = getConfig(chamberId);
    const data = getChamberData(state, chamberId);
    const includeRequired = options.includeRequired === true;
    return config.lootTasks.filter((task) => (includeRequired || !task.required) && !taskValueComplete(data, task));
  }

  function requiredMissingTasks(state, chamberId) {
    const config = getConfig(chamberId);
    const data = getChamberData(state, chamberId);
    return config.lootTasks.filter((task) => task.required && !taskValueComplete(data, task));
  }

  function completedLootTaskCount(state, chamberId) {
    const config = getConfig(chamberId);
    const data = getChamberData(state, chamberId);
    return config.lootTasks.filter((task) => taskValueComplete(data, task)).length;
  }

  function chamberStarted(state, chamberId) {
    const current = getChamberData(state, chamberId);
    const defaults = chamberId === "command-word-gate" ? defaultCommandGate : defaultIntake;
    return Object.keys(defaults).some((key) => String(current[key] || "") !== String(defaults[key] || "")) || state.progressLog.some((item) => item.chamber === chamberId);
  }

  function chamberStatus(state, chamberId) {
    if (state.completedChambers.includes(chamberId)) return "complete";
    if (chamberStarted(state, chamberId)) return "in-progress";
    return "not-started";
  }

  function progressCount(state) { return state.completedChambers.length; }
  function currentChamberLabel(state) { return (route.find(([id]) => id === state.currentChamberId) || route[0])[1]; }
  function statusLabel(state) { return state.completedChambers.length || chamberStarted(state, "task-intake") ? "In progress" : "Not started"; }
  function escapeHtml(value) { return String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char])); }

  function buildShell() {
    const cave = document.querySelector(".game-cave");
    if (!cave || document.querySelector("#inside-cave-overlay")) return;
    cave.insertAdjacentHTML("beforeend", `
      <section class="inside-cave-overlay" id="inside-cave-overlay" aria-hidden="true">
        <div class="inside-cave-backdrop" data-close-inside-cave></div>
        <section class="inside-cave-window" role="dialog" aria-modal="true" aria-labelledby="inside-cave-title">
          <button type="button" class="panel-close inside-close" data-close-inside-cave aria-label="Close inside cave">×</button>
          <div class="inside-cave-route" id="inside-route-view"></div>
          <div class="inside-cave-chamber is-hidden" id="inside-chamber-view"></div>
        </section>
      </section>
    `);
  }

  function renderAll() {
    const state = loadState();
    updateOpeningHud(state);
    renderRoute(state);
    renderChamber(state, state.currentChamberId);
  }

  function updateOpeningHud(state) {
    const title = document.querySelector("[data-quest-title]");
    const progress = document.querySelector("[data-quest-progress]");
    if (title) title.textContent = "The Study Skills Trial";
    if (progress) progress.textContent = `${progressCount(state)} / 8`;
  }

  function renderRoute(state) {
    const mount = document.querySelector("#inside-route-view");
    if (!mount) return;
    const currentConfig = getConfig(state.currentChamberId);
    const nodes = route.map(([id, label], index) => {
      const complete = state.completedChambers.includes(id);
      const unlocked = state.unlockedChambers.includes(id);
      const active = id === state.currentChamberId;
      const stateLabel = complete ? "Complete" : active ? "Current" : unlocked ? "Unlocked" : "Locked";
      return `<button type="button" class="inside-route-node ${complete ? "complete" : ""} ${active ? "active" : ""}" ${unlocked ? `data-open-chamber-node="${escapeHtml(id)}"` : "disabled"}>
        <strong>${index + 1}. ${escapeHtml(label)}</strong>
        <span>${escapeHtml(stateLabel)}</span>
      </button>`;
    }).join("");
    mount.innerHTML = `
      <div class="inside-route-header">
        <p class="eyebrow">StudyQuest route</p>
        <h2 id="inside-cave-title">Study Skills Trial</h2>
        <p>Current chamber: <strong>${escapeHtml(currentChamberLabel(state))}</strong></p>
      </div>
      <section class="inside-route-summary" aria-label="StudyQuest route summary">
        <div><span>Progress</span><strong>${progressCount(state)} / 8 chambers complete</strong></div>
        <div><span>Current loot</span><strong>${completedLootTaskCount(state, currentConfig.id)} / ${currentConfig.lootTasks.length} collected</strong></div>
        <div><span>Open flags</span><strong>${state.flags.length}</strong></div>
        <div><span>Missed loot</span><strong>${state.missedLoot.length}</strong></div>
        <div><span>Next action</span><strong>${escapeHtml(nextActionLabel(state))}</strong></div>
      </section>
      <section class="inside-chamber-stage ${escapeHtml(currentConfig.visualClass)}" aria-label="${escapeHtml(currentConfig.title)} visual placeholder">
        <div class="inside-cave-depth"></div>
        <button type="button" class="inside-hotspot intake-desk" data-open-chamber-node="task-intake"><span>Task intake desk</span></button>
        <button type="button" class="inside-hotspot command-gate-hotspot" ${state.unlockedChambers.includes("command-word-gate") ? "" : "disabled"} data-open-chamber-node="command-word-gate"><span>Command gate</span></button>
        <button type="button" class="inside-hotspot brief-fog" data-show-blocker><span>${escapeHtml(currentConfig.blocker)}</span></button>
        <button type="button" class="inside-hotspot flag-nook" data-focus-add-flag><span>Flag marker</span></button>
        <button type="button" class="inside-hotspot missed-loot-stash" data-focus-missed-loot><span>Missed loot stash</span></button>
        <button type="button" class="inside-hotspot onward-route" ${state.unlockedChambers.includes(currentConfig.nextId) ? "" : "disabled"} data-open-next-placeholder><span>Next chamber</span></button>
      </section>
      <section class="inside-route-map" aria-label="Cave route nodes">${nodes}</section>
      <div class="inside-route-actions">
        <button type="button" data-open-chamber-node="${escapeHtml(state.currentChamberId)}">Open current chamber</button>
        <button type="button" class="secondary-button" data-export-current-inside data-export-format="md">Export .md</button>
        <button type="button" class="secondary-button" data-export-current-inside data-export-format="txt">Export .txt</button>
        <button type="button" class="secondary-button" data-export-current-inside data-export-format="doc">Export Word .doc</button>
        <button type="button" class="secondary-button" data-reset-inside-cave>Reset test quest</button>
      </div>`;
  }

  function nextActionLabel(state) {
    if (state.currentChamberId === "task-intake" && !state.completedChambers.includes("task-intake")) return "Complete task intake";
    if (state.currentChamberId === "command-word-gate" && !state.completedChambers.includes("command-word-gate")) return "Clear Command Word Gate";
    if (state.completedChambers.includes("command-word-gate")) return "Open Keyword Lanterns";
    if (state.completedChambers.includes("task-intake")) return "Open Command Word Gate";
    return "Complete task intake";
  }

  function renderChamber(state, chamberId) {
    const mount = document.querySelector("#inside-chamber-view");
    if (!mount) return;
    if (chamberId === "command-word-gate") {
      renderCommandGate(state, mount);
      return;
    }
    renderTaskIntake(state, mount);
  }

  function chamberHeaderHtml(state, chamberId) {
    const config = getConfig(chamberId);
    return `<button type="button" class="panel-close chamber-close" data-return-route aria-label="Return to route">×</button>
      <p class="eyebrow">Inside cave chamber</p>
      <h2>${escapeHtml(config.title)}</h2>
      <p class="inside-status-line">Blocker: <strong>${escapeHtml(config.blocker)}</strong> · Status: <strong>${escapeHtml(chamberStatus(state, chamberId))}</strong></p>
      <p class="inside-chamber-purpose">${escapeHtml(config.purpose)} Each job is tied to loot; unfinished optional jobs auto-log as missed loot when you move on.</p>
      <section class="loot-task-grid" aria-label="${escapeHtml(config.title)} loot list">${lootTaskHtml(state, chamberId)}</section>`;
  }

  function renderTaskIntake(state, mount) {
    const intake = state.taskIntake;
    mount.innerHTML = `
      <div class="inside-chamber-card">
        ${chamberHeaderHtml(state, "task-intake")}
        <form class="task-intake-form" data-task-intake-form>
          <div class="form-grid">
            <label>Task title<input name="taskTitle" value="${escapeHtml(intake.taskTitle)}"></label>
            <label>Task type<select name="taskType">${["essay", "essay-plan", "reflection", "exam-prep", "test-task", "other"].map((type) => `<option value="${type}" ${intake.taskType === type ? "selected" : ""}>${type}</option>`).join("")}</select></label>
            <label>Module / context<input name="moduleCode" value="${escapeHtml(intake.moduleCode)}"></label>
            <label>Word count<input name="wordCount" type="number" min="0" value="${Number(intake.wordCount) || 0}"></label>
            <label>Due date<input name="dueDate" type="date" value="${escapeHtml(intake.dueDate)}"></label>
          </div>
          <label>Task brief / task note<textarea name="taskBrief">${escapeHtml(intake.taskBrief)}</textarea></label>
          <label>User notes<textarea name="userNotes">${escapeHtml(intake.userNotes)}</textarea></label>
          <label>Unclear points / details to flag<textarea name="unclearPoints">${escapeHtml(intake.unclearPoints)}</textarea></label>
          <label>Next action<input name="nextAction" value="${escapeHtml(intake.nextAction)}"></label>
          ${actionRowHtml("task-intake")}
        </form>
        ${manualFormsHtml()}
        <section class="inside-log"><h3>Chamber record</h3>${recordHtml(state)}</section>
      </div>`;
  }

  function renderCommandGate(state, mount) {
    const command = state.commandGate;
    mount.innerHTML = `
      <div class="inside-chamber-card command-gate-card">
        ${chamberHeaderHtml(state, "command-word-gate")}
        <form class="task-intake-form command-word-form" data-command-gate-form>
          <div class="form-grid">
            <label>Command word<input name="commandWord" value="${escapeHtml(command.commandWord)}" placeholder="e.g. explain, compare, evaluate"></label>
            <label>Meaning in your own words<input name="commandMeaning" value="${escapeHtml(command.commandMeaning)}" placeholder="What does this command ask you to do?"></label>
          </div>
          <label>Task demand / what the task wants<textarea name="taskDemand">${escapeHtml(command.taskDemand)}</textarea></label>
          <label>Keywords from the brief<textarea name="keywords">${escapeHtml(command.keywords)}</textarea></label>
          <label>Limits / scope<textarea name="limitsScope">${escapeHtml(command.limitsScope)}</textarea></label>
          <label>Unclear wording / bits to check<textarea name="unclearWording">${escapeHtml(command.unclearWording)}</textarea></label>
          <label>Extra notes<textarea name="notes">${escapeHtml(command.notes)}</textarea></label>
          <label>Next action<input name="nextAction" value="${escapeHtml(command.nextAction)}"></label>
          ${actionRowHtml("command-word-gate")}
        </form>
        ${manualFormsHtml()}
        <section class="inside-log"><h3>Chamber record</h3>${recordHtml(state)}</section>
      </div>`;
  }

  function actionRowHtml(chamberId) {
    const clearLabel = chamberId === "command-word-gate" ? "Clear Command Word Gate" : "Clear chamber";
    return `<section class="inside-save-row" aria-label="Chamber actions">
      <button type="submit">Save loot</button>
      <button type="button" class="secondary-button" data-clear-chamber="${escapeHtml(chamberId)}">${escapeHtml(clearLabel)}</button>
      <button type="button" class="secondary-button" data-export-current-inside data-export-format="md">Export .md</button>
      <button type="button" class="secondary-button" data-export-current-inside data-export-format="txt">Export .txt</button>
      <button type="button" class="secondary-button" data-export-current-inside data-export-format="doc">Export Word .doc</button>
    </section>`;
  }

  function manualFormsHtml() {
    return `<section class="inside-two-column">
      <form data-inside-flag-form class="mini-form">
        <h3>Flag marker</h3>
        <label>Problem/detail needing attention<input name="text" type="text" placeholder="e.g. wording may need checking"></label>
        <button type="submit">Add flag detail</button>
      </form>
      <form data-inside-missed-loot-form class="mini-form">
        <h3>Manual missed loot</h3>
        <label>Left unfinished<input name="text" type="text" placeholder="e.g. scope left rough for later"></label>
        <button type="submit">Mark missed loot</button>
      </form>
    </section>`;
  }

  function lootTaskHtml(state, chamberId) {
    const config = getConfig(chamberId);
    const data = getChamberData(state, chamberId);
    return config.lootTasks.map((task) => {
      const complete = taskValueComplete(data, task);
      const autoMissed = state.missedLoot.some((item) => item.autoTaskId === task.id && item.chamber === chamberId);
      const status = complete ? "Collected" : autoMissed ? "Missed loot" : task.required ? "Required" : "Optional";
      return `<article class="loot-task ${complete ? "complete" : ""} ${autoMissed ? "missed" : ""}">
        <span class="loot-icon" aria-hidden="true">${escapeHtml(task.loot)}</span>
        <strong>${escapeHtml(task.label)}</strong>
        <small>${escapeHtml(status)}</small>
      </article>`;
    }).join("");
  }

  function recordHtml(state) {
    const flags = state.flags.length ? `<ul>${state.flags.map((flag) => `<li>${escapeHtml(currentRouteLabel(flag.chamber))}: ${escapeHtml(flag.note || flag.text)}</li>`).join("")}</ul>` : "<p>No open flags.</p>";
    const loot = state.missedLoot.length ? `<ul>${state.missedLoot.map((item) => `<li>${escapeHtml(currentRouteLabel(item.chamber))}: ${escapeHtml(item.itemMissed || item.text)}${item.source === "auto" ? " <em>(auto)</em>" : ""}</li>`).join("")}</ul>` : "<p>No missed loot recorded.</p>";
    const progress = state.progressLog.length ? `<ul>${state.progressLog.slice(0, 8).map((item) => `<li>${escapeHtml(currentRouteLabel(item.chamber))}: ${escapeHtml(item.summary || item.action)}</li>`).join("")}</ul>` : "<p>No progress log yet.</p>";
    return `<div class="inside-record-grid"><div><h4>Flags</h4>${flags}</div><div><h4>Missed loot</h4>${loot}</div><div><h4>Progress log</h4>${progress}</div></div>`;
  }

  function currentRouteLabel(chamberId) {
    return (route.find(([id]) => id === chamberId) || [chamberId, chamberId])[1];
  }

  function openInsideRoute() {
    buildShell();
    const state = loadState();
    state.studyQuestOpen = true;
    state.activeQuestId = "study-skills-trial";
    state.selectedQuestId = "study-skills-trial";
    if (!state.progressLog.length) addLog(state, "task-intake", "entered-route", "Entered StudyQuest route for The Study Skills Trial.");
    saveState(state);
    renderAll();
    closeNativePanels();
    const overlay = document.querySelector("#inside-cave-overlay");
    document.querySelector("#inside-route-view")?.classList.remove("is-hidden");
    document.querySelector("#inside-chamber-view")?.classList.add("is-hidden");
    if (overlay) overlay.setAttribute("aria-hidden", "false");
  }

  function openChamber(chamberId, focusMode) {
    const state = loadState();
    if (!state.unlockedChambers.includes(chamberId)) {
      alert(`${currentRouteLabel(chamberId)} is locked.`);
      return;
    }
    if (!chamberConfigs[chamberId]) {
      state.currentChamberId = chamberId;
      saveState(state);
      alert(`${currentRouteLabel(chamberId)} is unlocked, but it is a placeholder for the next build.`);
      renderAll();
      return;
    }
    state.currentChamberId = chamberId;
    const data = getChamberData(state, chamberId);
    if (data.status === "not_started") data.status = "in-progress";
    setChamberData(state, chamberId, data);
    const action = `entered-${chamberId}`;
    if (!state.progressLog.some((item) => item.action === action)) addLog(state, chamberId, action, `Entered ${currentRouteLabel(chamberId)}.`);
    saveState(state);
    renderAll();
    document.querySelector("#inside-route-view")?.classList.add("is-hidden");
    document.querySelector("#inside-chamber-view")?.classList.remove("is-hidden");
    if (focusMode === "flag") setTimeout(() => document.querySelector("[data-inside-flag-form] input")?.focus(), 80);
    if (focusMode === "missedLoot") setTimeout(() => document.querySelector("[data-inside-missed-loot-form] input")?.focus(), 80);
  }

  function closeInsideCave() { document.querySelector("#inside-cave-overlay")?.setAttribute("aria-hidden", "true"); }
  function closeNativePanels() { document.querySelectorAll(".work-drawer, .quest-board-panel, .quest-placeholder-panel, .map-board-panel, .quest-bag").forEach((panel) => { panel.open = false; }); }
  function returnToRoute() { renderAll(); document.querySelector("#inside-chamber-view")?.classList.add("is-hidden"); document.querySelector("#inside-route-view")?.classList.remove("is-hidden"); }

  function saveTaskIntake(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    const state = loadState();
    state.taskIntake = {
      ...state.taskIntake,
      taskTitle: data.taskTitle || "",
      taskType: data.taskType || "test-task",
      moduleCode: data.moduleCode || "",
      wordCount: Number(data.wordCount) || 0,
      dueDate: data.dueDate || "",
      taskBrief: data.taskBrief || "",
      userNotes: data.userNotes || "",
      unclearPoints: data.unclearPoints || "",
      nextAction: data.nextAction || ""
    };
    state.taskIntake.status = requiredMissingTasks(state, "task-intake").length ? "in-progress" : "ready";
    addLog(state, "task-intake", "saved-task-intake", `Saved Task Intake loot: ${completedLootTaskCount(state, "task-intake")} / ${getConfig("task-intake").lootTasks.length} tasks collected.`);
    saveState(state);
    renderAll();
    openChamber("task-intake");
  }

  function saveCommandGate(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    const state = loadState();
    state.commandGate = {
      ...state.commandGate,
      commandWord: data.commandWord || "",
      commandMeaning: data.commandMeaning || "",
      taskDemand: data.taskDemand || "",
      keywords: data.keywords || "",
      limitsScope: data.limitsScope || "",
      unclearWording: data.unclearWording || "",
      notes: data.notes || "",
      nextAction: data.nextAction || ""
    };
    state.commandGate.status = requiredMissingTasks(state, "command-word-gate").length ? "in-progress" : "ready";
    addLog(state, "command-word-gate", "saved-command-gate", `Saved Command Word Gate loot: ${completedLootTaskCount(state, "command-word-gate")} / ${getConfig("command-word-gate").lootTasks.length} tasks collected.`);
    saveState(state);
    renderAll();
    openChamber("command-word-gate");
  }

  function autoLogMissedLoot(state, chamberId) {
    const missingOptional = missingLootTasks(state, chamberId);
    let added = 0;
    missingOptional.forEach((task) => {
      const alreadyLogged = state.missedLoot.some((item) => item.autoTaskId === task.id && item.chamber === chamberId);
      if (alreadyLogged) return;
      state.missedLoot.push({
        id: uid("loot"),
        chamber: chamberId,
        autoTaskId: task.id,
        lootType: task.loot,
        itemMissed: `${task.loot}: ${task.missingText}`,
        reasonLeft: `Auto-logged because ${currentRouteLabel(chamberId)} was cleared while this optional task was unfinished.`,
        returnLater: true,
        priority: "low",
        source: "auto",
        createdAt: now()
      });
      added += 1;
    });
    if (added) addLog(state, chamberId, "auto-missed-loot", `${added} unfinished optional task${added === 1 ? "" : "s"} auto-logged as missed loot.`);
  }

  function completeChamber(chamberId) {
    const state = loadState();
    const config = getConfig(chamberId);
    const missingRequired = requiredMissingTasks(state, chamberId);
    if (missingRequired.length) {
      alert(`${config.requiredAlert}${missingRequired.map((task) => task.label).join(", ")}.`);
      return;
    }
    autoLogMissedLoot(state, chamberId);
    const data = getChamberData(state, chamberId);
    data.status = "complete";
    setChamberData(state, chamberId, data);
    if (!state.completedChambers.includes(chamberId)) state.completedChambers.push(chamberId);
    if (config.nextId && !state.unlockedChambers.includes(config.nextId)) state.unlockedChambers.push(config.nextId);
    state.currentChamberId = config.nextId || chamberId;
    addLog(state, chamberId, `completed-${chamberId}`, `${config.title} marked complete. Next action: move to ${config.nextTitle}.`);
    saveState(state);
    renderAll();
    returnToRoute();
  }

  function addFlag(text) {
    const state = loadState();
    const chamberId = state.currentChamberId;
    state.flags.push({ id: uid("flag"), type: "detail", chamber: chamberId, note: text || `${currentRouteLabel(chamberId)} needs more detail.`, status: "open", priority: "medium", createdAt: now() });
    addLog(state, chamberId, "saved-flag", `Flag detail saved in ${currentRouteLabel(chamberId)}.`);
    saveState(state);
    renderAll();
    openChamber(chamberId);
  }

  function addMissedLoot(text) {
    const state = loadState();
    const chamberId = state.currentChamberId;
    state.missedLoot.push({ id: uid("loot"), chamber: chamberId, lootType: "manual crate", itemMissed: text || "Something was deliberately left rough.", reasonLeft: "Manually saved for later so the quest can keep moving.", returnLater: true, priority: "low", source: "manual", createdAt: now() });
    addLog(state, chamberId, "saved-missed-loot", `Manual missed loot saved in ${currentRouteLabel(chamberId)}.`);
    saveState(state);
    renderAll();
    openChamber(chamberId);
  }

  function resetInsideCave() {
    if (!confirm("Reset only The Study Skills Trial cave test state?")) return;
    const state = defaultState();
    addLog(state, "task-intake", "reset-test-quest", "Reset The Study Skills Trial cave test state.");
    saveState(state);
    renderAll();
    openInsideRoute();
  }

  function fieldLinesForExport(state, chamberId) {
    if (chamberId === "command-word-gate") {
      const data = state.commandGate;
      return [
        `Command word: ${data.commandWord || "Not set"}`,
        `Meaning in own words: ${data.commandMeaning || "Not set"}`,
        `Task demand: ${data.taskDemand || "Not set"}`,
        `Keywords: ${data.keywords || "Not set"}`,
        `Limits/scope: ${data.limitsScope || "Not set"}`,
        `Unclear wording: ${data.unclearWording || "None added."}`,
        `Notes: ${data.notes || "None added."}`,
        `Next action: ${data.nextAction || "Open Keyword Lanterns."}`
      ].join("\n");
    }
    const data = state.taskIntake;
    return [
      `Task title: ${data.taskTitle || "Not set"}`,
      `Task type: ${data.taskType || "Not set"}`,
      `Module code: ${data.moduleCode || "Not set"}`,
      `Word count: ${data.wordCount || "Not set"}`,
      `Due date: ${data.dueDate || "Not set"}`,
      `Task brief: ${data.taskBrief || "None added."}`,
      `User notes: ${data.userNotes || "None added."}`,
      `Unclear points: ${data.unclearPoints || "None added."}`,
      `Next action: ${data.nextAction || "Move to Command Word Gate."}`
    ].join("\n");
  }

  function buildChamberMarkdown(state, chamberId) {
    const config = getConfig(chamberId);
    const data = getChamberData(state, chamberId);
    const date = new Date().toISOString().slice(0, 10);
    const chamberFlags = state.flags.filter((flag) => flag.chamber === chamberId);
    const chamberLoot = state.missedLoot.filter((item) => item.chamber === chamberId);
    const chamberLog = state.progressLog.filter((item) => item.chamber === chamberId);
    const flags = chamberFlags.length ? chamberFlags.map((flag) => `- ${flag.note || flag.text}`).join("\n") : "No open flags.";
    const loot = chamberLoot.length ? chamberLoot.map((item) => `- ${item.itemMissed || item.text}${item.source === "auto" ? " (auto)" : ""}`).join("\n") : "No missed loot recorded.";
    const tasks = config.lootTasks.map((task) => `- ${taskValueComplete(data, task) ? "[x]" : "[ ]"} ${task.label} — ${task.loot}${task.required ? " (required)" : " (optional)"}`).join("\n");
    const log = chamberLog.length ? chamberLog.slice().reverse().map((item) => `- ${item.summary || item.action}`).join("\n") : "No progress log yet.";
    return `# ${config.title} Export

Quest: The Study Skills Trial
Current chamber: ${config.title}
Chamber status: ${chamberStatus(state, chamberId)}
Export date: ${date}

## Saved answers

${fieldLinesForExport(state, chamberId)}

## Loot tasks

${tasks}

## Flags

${flags}

## Missed loot

${loot}

## Progress log

${log}

## Next action

${data.nextAction || config.nextTitle || "Open next chamber."}
`;
  }

  function exportCurrentChamber(format = "md") {
    const state = loadState();
    const chamberId = chamberConfigs[state.currentChamberId] ? state.currentChamberId : "task-intake";
    const config = getConfig(chamberId);
    const date = new Date().toISOString().slice(0, 10);
    const safeTitle = config.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    const baseName = `${date}_The-Study-Skills-Trial_${safeTitle}`;
    const markdown = buildChamberMarkdown(state, chamberId);
    if (format === "txt") {
      downloadFile(`${baseName}.txt`, markdown.replace(/^# /gm, "").replace(/^## /gm, "\n"), "text/plain");
      return;
    }
    if (format === "doc") {
      downloadFile(`${baseName}.doc`, wordHtml(markdown), "application/msword");
      return;
    }
    downloadFile(`${baseName}.md`, markdown, "text/markdown");
  }

  function wordHtml(markdown) {
    const html = escapeHtml(markdown)
      .replace(/^# (.*)$/gm, "<h1>$1</h1>")
      .replace(/^## (.*)$/gm, "<h2>$1</h2>")
      .replace(/^- \[x\] (.*)$/gm, "<p>☑ $1</p>")
      .replace(/^- \[ \] (.*)$/gm, "<p>☐ $1</p>")
      .replace(/^- (.*)$/gm, "<p>• $1</p>")
      .replace(/\n{2,}/g, "</p><p>")
      .replace(/\n/g, "<br>");
    return `<!doctype html><html><head><meta charset="utf-8"><title>StudyQuest Export</title></head><body>${html}</body></html>`;
  }

  function downloadFile(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function syncQuestBoardCard(state) {
    let quests;
    try { quests = JSON.parse(localStorage.getItem(QUEST_BOARD_KEY)); } catch { quests = null; }
    if (!Array.isArray(quests)) return;
    const index = quests.findIndex((quest) => quest.id === "study-skills-trial");
    if (index < 0) return;
    quests[index] = {
      ...quests[index],
      title: "Study Skills Trial",
      moduleCode: "Practice",
      assessmentCode: "Test Quest",
      boardCategory: "archive_test",
      questType: "test",
      taskSummary: "Neutral 800-word practice task for testing the StudyQuest route.",
      dueDate: null,
      status: statusLabel(state),
      currentStageLabel: currentChamberLabel(state),
      progressLabel: `${progressCount(state)} / 8 chambers complete`,
      openFlagsCount: state.flags.length,
      missedLootCount: state.missedLoot.length,
      feedbackAvailable: false,
      archiveReason: "Test quest"
    };
    localStorage.setItem(QUEST_BOARD_KEY, JSON.stringify(quests));
    if (window.EsslayQuestBoard?.render) window.EsslayQuestBoard.render();
  }

  function syncStudyQuestStore(state) {
    if (!window.EsslayStudyQuest?.loadQuest || !window.EsslayStudyQuest?.saveQuest) return;
    const quest = window.EsslayStudyQuest.loadQuest();
    quest.currentRoomId = state.completedChambers.includes("command-word-gate") ? "command-words" : state.completedChambers.includes("task-intake") ? "command-words" : "task-intake";
    quest.taskType = state.taskIntake.taskType || quest.taskType;
    quest.wordCount = Number(state.taskIntake.wordCount) || quest.wordCount;
    quest.task = { ...quest.task, prompt: state.taskIntake.taskBrief || quest.task.prompt, outputFormat: state.taskIntake.taskType || quest.task.outputFormat, moduleArea: state.taskIntake.moduleCode || quest.task.moduleArea, officialSubmission: false };
    quest.commandWords = state.commandGate.commandWord ? [{ id: "inside-command-word-gate", word: state.commandGate.commandWord, meaning: state.commandGate.commandMeaning, taskFocus: state.commandGate.taskDemand, keywords: state.commandGate.keywords }] : (quest.commandWords || []);
    const nextStatus = { ...(quest.roomStatus || {}) };
    if (state.completedChambers.includes("task-intake")) nextStatus["task-intake"] = { status: "complete", completedAt: now() };
    if (state.completedChambers.includes("command-word-gate")) nextStatus["command-words"] = { status: "complete", completedAt: now() };
    quest.roomStatus = nextStatus;
    quest.flags = [ ...(quest.flags || []).filter((item) => !["task-intake", "command-word-gate", "command-words"].includes(item.stage) && !["task-intake", "command-word-gate"].includes(item.chamber)), ...state.flags.map((flag) => ({ id: flag.id, text: flag.note, stage: flag.chamber === "command-word-gate" ? "command-words" : flag.chamber, createdAt: flag.createdAt })) ];
    quest.missedLoot = [ ...(quest.missedLoot || []).filter((item) => !["task-intake", "command-word-gate", "command-words"].includes(item.stage) && !["task-intake", "command-word-gate"].includes(item.chamber)), ...state.missedLoot.map((item) => ({ id: item.id, text: item.itemMissed, stage: item.chamber === "command-word-gate" ? "command-words" : item.chamber, createdAt: item.createdAt })) ];
    quest.progressLog = [ ...state.progressLog.map((item) => ({ id: item.id, type: item.action, message: item.summary, roomId: item.chamber === "command-word-gate" ? "command-words" : item.chamber, at: item.timestamp })), ...(quest.progressLog || []).filter((item) => !["task-intake", "command-words"].includes(item.roomId)) ].slice(0, 120);
    window.EsslayStudyQuest.saveQuest(quest);
  }

  function openNextPlaceholder() {
    const state = loadState();
    const nextId = getConfig(state.currentChamberId).nextId;
    if (!state.unlockedChambers.includes(nextId)) {
      alert(`${currentRouteLabel(nextId)} unlocks after ${currentRouteLabel(state.currentChamberId)} is cleared.`);
      return;
    }
    if (chamberConfigs[nextId]) openChamber(nextId);
    else alert(`${currentRouteLabel(nextId)} is unlocked, but it is a placeholder for the next build.`);
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const studyTrialButton = event.target.closest('[data-open-quest="study-skills-trial"]');
      if (studyTrialButton) { event.preventDefault(); event.stopImmediatePropagation(); openInsideRoute(); return; }
      if (event.target.closest("[data-open-work-drawer]")) { event.preventDefault(); event.stopImmediatePropagation(); openInsideRoute(); return; }
      if (event.target.closest("[data-close-inside-cave]")) { event.preventDefault(); closeInsideCave(); return; }
      const chamberButton = event.target.closest("[data-open-chamber-node]");
      if (chamberButton) { event.preventDefault(); openChamber(chamberButton.dataset.openChamberNode); return; }
      if (event.target.closest("[data-return-route]")) { event.preventDefault(); returnToRoute(); return; }
      const clearButton = event.target.closest("[data-clear-chamber]");
      if (clearButton) { event.preventDefault(); completeChamber(clearButton.dataset.clearChamber); return; }
      const exportButton = event.target.closest("[data-export-current-inside]");
      if (exportButton) { event.preventDefault(); exportCurrentChamber(exportButton.dataset.exportFormat || "md"); return; }
      if (event.target.closest("[data-reset-inside-cave]")) { event.preventDefault(); resetInsideCave(); return; }
      if (event.target.closest("[data-show-blocker]")) { event.preventDefault(); const state = loadState(); const config = getConfig(state.currentChamberId); alert(`${config.blocker}: clear the required loot tasks to move on. Optional unfinished jobs become missed loot when you move on.`); return; }
      if (event.target.closest("[data-focus-add-flag]")) { event.preventDefault(); openChamber(loadState().currentChamberId, "flag"); return; }
      if (event.target.closest("[data-focus-missed-loot]")) { event.preventDefault(); openChamber(loadState().currentChamberId, "missedLoot"); return; }
      if (event.target.closest("[data-open-next-placeholder]")) { event.preventDefault(); openNextPlaceholder(); }
    }, true);

    document.addEventListener("submit", (event) => {
      if (event.target.matches("[data-task-intake-form]")) { event.preventDefault(); saveTaskIntake(event.target); }
      if (event.target.matches("[data-command-gate-form]")) { event.preventDefault(); saveCommandGate(event.target); }
      if (event.target.matches("[data-inside-flag-form]")) { event.preventDefault(); const value = new FormData(event.target).get("text"); event.target.reset(); addFlag(value); }
      if (event.target.matches("[data-inside-missed-loot-form]")) { event.preventDefault(); const value = new FormData(event.target).get("text"); event.target.reset(); addMissedLoot(value); }
    });
  }

  function init() {
    buildShell();
    saveState(loadState());
    renderAll();
    bindEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
