(() => {
  const STORAGE_KEY = "esslay-inside-cave-v01";
  const QUEST_BOARD_KEY = "esslay-quest-board-v01";

  const defaultIntake = {
    taskTitle: "The Study Skills Trial",
    taskType: "test-task",
    moduleCode: "Practice",
    wordCount: 800,
    dueDate: "",
    taskBrief: "A neutral 800-word practice task used to test the Study Cave route.",
    userNotes: "",
    nextAction: "Clear the Task Intake Chamber and move to the Command Word Chamber."
  };

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

  function now() { return new Date().toISOString(); }
  function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`; }

  function defaultState() {
    return {
      activeQuestId: "study-skills-trial",
      selectedQuestId: "study-skills-trial",
      currentChamberId: "task-intake",
      studyQuestOpen: false,
      taskIntake: { ...defaultIntake, status: "not_started" },
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
    state.completedChambers = Array.isArray(state.completedChambers) ? state.completedChambers : [];
    state.unlockedChambers = Array.isArray(state.unlockedChambers) && state.unlockedChambers.length ? state.unlockedChambers : ["task-intake"];
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

  function addLog(state, action, summary) {
    state.progressLog.unshift({ id: uid("progress"), timestamp: now(), chamber: "task-intake", action, summary });
    state.progressLog = state.progressLog.slice(0, 80);
  }

  function isTaskIntakeStarted(state) {
    const intake = state.taskIntake || {};
    return Object.keys(defaultIntake).some((key) => String(intake[key] || "") !== String(defaultIntake[key] || ""));
  }

  function isTaskIntakeComplete(state) {
    const intake = state.taskIntake || {};
    return Boolean(intake.taskTitle && intake.taskType && Number(intake.wordCount) && (intake.taskBrief || intake.userNotes) && intake.nextAction);
  }

  function chamberStatus(state) {
    if (state.completedChambers.includes("task-intake")) return "complete";
    if (isTaskIntakeStarted(state)) return "in-progress";
    return "not-started";
  }

  function progressCount(state) { return state.completedChambers.length; }
  function statusLabel(state) { return state.completedChambers.includes("task-intake") || isTaskIntakeStarted(state) ? "In progress" : "Not started"; }
  function currentChamberLabel(state) { return (route.find(([id]) => id === state.currentChamberId) || route[0])[1]; }
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
    renderTaskChamber(state);
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
        <div><span>Open flags</span><strong>${state.flags.length}</strong></div>
        <div><span>Missed loot</span><strong>${state.missedLoot.length}</strong></div>
        <div><span>Next action</span><strong>${state.completedChambers.includes("task-intake") ? "Open Command Word Gate" : "Complete task intake"}</strong></div>
      </section>
      <section class="inside-chamber-stage" aria-label="Task Intake Chamber visual placeholder">
        <div class="inside-cave-depth"></div>
        <button type="button" class="inside-hotspot intake-desk" data-open-chamber-node="task-intake"><span>Task intake desk</span></button>
        <button type="button" class="inside-hotspot brief-fog" data-show-brief-fog><span>Brief Fog</span></button>
        <button type="button" class="inside-hotspot flag-nook" data-focus-add-flag><span>Flag marker</span></button>
        <button type="button" class="inside-hotspot missed-loot-stash" data-focus-missed-loot><span>Missed loot stash</span></button>
        <button type="button" class="inside-hotspot onward-route" ${state.unlockedChambers.includes("command-word-gate") ? "" : "disabled"} data-open-command-word><span>Next chamber</span></button>
      </section>
      <section class="inside-route-map" aria-label="Cave route nodes">${nodes}</section>
      <div class="inside-route-actions">
        <button type="button" data-open-chamber-node="task-intake">${state.completedChambers.includes("task-intake") ? "Review Task Intake" : "Open Task Intake Chamber"}</button>
        <button type="button" class="secondary-button" data-export-task-intake>Export this room</button>
        <button type="button" class="secondary-button" data-reset-inside-cave>Reset test quest</button>
      </div>`;
  }

  function renderTaskChamber(state) {
    const mount = document.querySelector("#inside-chamber-view");
    if (!mount) return;
    const intake = state.taskIntake;
    mount.innerHTML = `
      <div class="inside-chamber-card">
        <button type="button" class="panel-close chamber-close" data-return-route aria-label="Return to route">×</button>
        <p class="eyebrow">Inside cave chamber</p>
        <h2>Task Intake Chamber</h2>
        <p class="inside-status-line">Blocker: <strong>Brief Fog</strong> · Status: <strong>${escapeHtml(chamberStatus(state))}</strong></p>
        <p class="inside-chamber-purpose">Bring the task in, lay it out, and make the next move clear before planning.</p>
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
          <label>Next action<input name="nextAction" value="${escapeHtml(intake.nextAction)}"></label>
          <section class="inside-save-row" aria-label="Task intake actions">
            <button type="submit">Save loot</button>
            <button type="button" class="secondary-button" data-clear-task-intake>Clear chamber</button>
            <button type="button" class="secondary-button" data-export-task-intake>Export this room</button>
          </section>
        </form>
        <section class="inside-two-column">
          <form data-inside-flag-form class="mini-form">
            <h3>Flag marker</h3>
            <label>Problem needing attention<input name="text" type="text" placeholder="e.g. task brief may need checking"></label>
            <button type="submit">Add flag</button>
          </form>
          <form data-inside-missed-loot-form class="mini-form">
            <h3>Missed loot stash</h3>
            <label>Left for later<input name="text" type="text" placeholder="e.g. due date left blank because this is a test"></label>
            <button type="submit">Mark missed loot</button>
          </form>
        </section>
        <section class="inside-log"><h3>Chamber record</h3>${recordHtml(state)}</section>
      </div>`;
  }

  function recordHtml(state) {
    const flags = state.flags.length ? `<ul>${state.flags.map((flag) => `<li>${escapeHtml(flag.note || flag.text)}</li>`).join("")}</ul>` : "<p>No open flags.</p>";
    const loot = state.missedLoot.length ? `<ul>${state.missedLoot.map((item) => `<li>${escapeHtml(item.itemMissed || item.text)}</li>`).join("")}</ul>` : "<p>No missed loot recorded.</p>";
    const progress = state.progressLog.length ? `<ul>${state.progressLog.slice(0, 8).map((item) => `<li>${escapeHtml(item.summary || item.action)}</li>`).join("")}</ul>` : "<p>No progress log yet.</p>";
    return `<div class="inside-record-grid"><div><h4>Flags</h4>${flags}</div><div><h4>Missed loot</h4>${loot}</div><div><h4>Progress log</h4>${progress}</div></div>`;
  }

  function openInsideRoute() {
    buildShell();
    const state = loadState();
    state.studyQuestOpen = true;
    state.activeQuestId = "study-skills-trial";
    state.selectedQuestId = "study-skills-trial";
    if (!state.progressLog.length) addLog(state, "entered-route", "Entered StudyQuest route for The Study Skills Trial.");
    saveState(state);
    renderAll();
    closeNativePanels();
    const overlay = document.querySelector("#inside-cave-overlay");
    document.querySelector("#inside-route-view")?.classList.remove("is-hidden");
    document.querySelector("#inside-chamber-view")?.classList.add("is-hidden");
    if (overlay) overlay.setAttribute("aria-hidden", "false");
  }

  function openTaskChamber(focusMode) {
    const state = loadState();
    state.currentChamberId = "task-intake";
    if (state.taskIntake.status === "not_started") state.taskIntake.status = "in-progress";
    if (!state.progressLog.some((item) => item.action === "entered-task-intake")) addLog(state, "entered-task-intake", "Entered Task Intake Chamber.");
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
      nextAction: data.nextAction || ""
    };
    state.taskIntake.status = isTaskIntakeComplete(state) ? "ready" : "in-progress";
    addLog(state, "saved-task-intake", `Saved task intake answers for ${state.taskIntake.taskTitle || "this quest"}.`);
    saveState(state);
    renderAll();
    openTaskChamber();
  }

  function completeTaskIntake() {
    const state = loadState();
    if (!isTaskIntakeComplete(state)) {
      alert("Task Intake Chamber still needs task title, task type, word count, task brief or note, and next action.");
      return;
    }
    state.taskIntake.status = "complete";
    if (!state.completedChambers.includes("task-intake")) state.completedChambers.push("task-intake");
    if (!state.unlockedChambers.includes("command-word-gate")) state.unlockedChambers.push("command-word-gate");
    state.currentChamberId = "command-word-gate";
    addLog(state, "completed-task-intake", "Task Intake Chamber marked complete. Next action: move to Command Word Gate.");
    saveState(state);
    renderAll();
    returnToRoute();
  }

  function addFlag(text) {
    const state = loadState();
    state.flags.push({ id: uid("flag"), type: "leave-for-later", chamber: "task-intake", note: text || "Task intake needs attention.", status: "open", priority: "medium", createdAt: now() });
    addLog(state, "saved-flag", "Flag saved in Task Intake Chamber.");
    saveState(state);
    renderAll();
    openTaskChamber();
  }

  function addMissedLoot(text) {
    const state = loadState();
    state.missedLoot.push({ id: uid("loot"), chamber: "task-intake", itemMissed: text || "Something was deliberately left rough.", reasonLeft: "Saved for later so the quest can keep moving.", returnLater: true, priority: "low", createdAt: now() });
    addLog(state, "saved-missed-loot", "Missed loot saved in Task Intake Chamber.");
    saveState(state);
    renderAll();
    openTaskChamber();
  }

  function resetInsideCave() {
    if (!confirm("Reset only The Study Skills Trial cave test state?")) return;
    const state = defaultState();
    addLog(state, "reset-test-quest", "Reset The Study Skills Trial cave test state.");
    saveState(state);
    renderAll();
    openInsideRoute();
  }

  function exportTaskIntake() {
    const state = loadState();
    const intake = state.taskIntake;
    const date = new Date().toISOString().slice(0, 10);
    const flags = state.flags.length ? state.flags.map((flag) => `- ${flag.note || flag.text}`).join("\n") : "No open flags.";
    const loot = state.missedLoot.length ? state.missedLoot.map((item) => `- ${item.itemMissed || item.text}`).join("\n") : "No missed loot recorded.";
    const log = state.progressLog.length ? state.progressLog.slice().reverse().map((item) => `- ${item.summary || item.action}`).join("\n") : "No progress log yet.";
    const markdown = `# Task Intake Chamber Export

Quest: The Study Skills Trial
Current chamber: Task Intake Chamber
Chamber status: ${chamberStatus(state)}
Export date: ${date}

## Task intake answers

Task title: ${intake.taskTitle || "Not set"}
Task type: ${intake.taskType || "Not set"}
Module code: ${intake.moduleCode || "Not set"}
Word count: ${intake.wordCount || "Not set"}
Due date: ${intake.dueDate || "Not set"}

## Task brief

${intake.taskBrief || "None added."}

## User notes

${intake.userNotes || "None added."}

## Flags

${flags}

## Missed loot

${loot}

## Progress log

${log}

## Next action

${intake.nextAction || "Move to Command Word Gate."}
`;
    downloadFile(`${date}_The-Study-Skills-Trial_Task-Intake-Chamber.md`, markdown, "text/markdown");
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
    const completeCount = progressCount(state);
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
      progressLabel: `${completeCount} / 8 chambers complete`,
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
    quest.currentRoomId = state.completedChambers.includes("task-intake") ? "command-words" : "task-intake";
    quest.taskType = state.taskIntake.taskType || quest.taskType;
    quest.wordCount = Number(state.taskIntake.wordCount) || quest.wordCount;
    quest.task = { ...quest.task, prompt: state.taskIntake.taskBrief || quest.task.prompt, outputFormat: state.taskIntake.taskType || quest.task.outputFormat, moduleArea: state.taskIntake.moduleCode || quest.task.moduleArea, officialSubmission: false };
    if (state.completedChambers.includes("task-intake")) quest.roomStatus = { ...(quest.roomStatus || {}), "task-intake": { status: "complete", completedAt: now() } };
    quest.flags = [ ...(quest.flags || []).filter((item) => item.stage !== "task-intake" && item.chamber !== "task-intake"), ...state.flags.map((flag) => ({ id: flag.id, text: flag.note, stage: "task-intake", createdAt: flag.createdAt })) ];
    quest.missedLoot = [ ...(quest.missedLoot || []).filter((item) => item.stage !== "task-intake" && item.chamber !== "task-intake"), ...state.missedLoot.map((item) => ({ id: item.id, text: item.itemMissed, stage: "task-intake", createdAt: item.createdAt })) ];
    quest.progressLog = [ ...state.progressLog.map((item) => ({ id: item.id, type: item.action, message: item.summary, roomId: "task-intake", at: item.timestamp })), ...(quest.progressLog || []).filter((item) => item.roomId !== "task-intake") ].slice(0, 120);
    window.EsslayStudyQuest.saveQuest(quest);
  }

  function openCommandWordPlaceholder() {
    const state = loadState();
    if (!state.unlockedChambers.includes("command-word-gate")) {
      alert("Command Word Gate unlocks after Task Intake Chamber is cleared.");
      return;
    }
    alert("Command Word Gate is unlocked, but it is a placeholder for the next build.");
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const studyTrialButton = event.target.closest('[data-open-quest="study-skills-trial"]');
      if (studyTrialButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openInsideRoute();
        return;
      }
      if (event.target.closest("[data-open-work-drawer]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openInsideRoute();
        return;
      }
      if (event.target.closest("[data-close-inside-cave]")) { event.preventDefault(); closeInsideCave(); return; }
      const chamberButton = event.target.closest("[data-open-chamber-node]");
      if (chamberButton) { event.preventDefault(); chamberButton.dataset.openChamberNode === "task-intake" ? openTaskChamber() : openCommandWordPlaceholder(); return; }
      if (event.target.closest("[data-return-route]")) { event.preventDefault(); returnToRoute(); return; }
      if (event.target.closest("[data-clear-task-intake]")) { event.preventDefault(); completeTaskIntake(); return; }
      if (event.target.closest("[data-export-task-intake]")) { event.preventDefault(); exportTaskIntake(); return; }
      if (event.target.closest("[data-reset-inside-cave]")) { event.preventDefault(); resetInsideCave(); return; }
      if (event.target.closest("[data-show-brief-fog]")) { event.preventDefault(); alert("Brief Fog means the task is still vague. Save the required task intake fields to clear it."); return; }
      if (event.target.closest("[data-focus-add-flag]")) { event.preventDefault(); openTaskChamber("flag"); return; }
      if (event.target.closest("[data-focus-missed-loot]")) { event.preventDefault(); openTaskChamber("missedLoot"); return; }
      if (event.target.closest("[data-open-command-word]")) { event.preventDefault(); openCommandWordPlaceholder(); }
    }, true);

    document.addEventListener("submit", (event) => {
      if (event.target.matches("[data-task-intake-form]")) { event.preventDefault(); saveTaskIntake(event.target); }
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