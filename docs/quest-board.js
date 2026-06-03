const EsslayQuestBoard = (() => {
  const STORAGE_KEY = "esslay-quest-board-v01";
  const categories = [
    ["upcoming", "Due Soon"],
    ["in_progress", "In Progress"],
    ["completed", "Completed"],
    ["feedback_repair", "Feedback Repair"],
    ["archive_test", "Archive / Test"]
  ];

  const defaultQuests = [
    {
      id: "k102-tma04",
      title: "K102 TMA04",
      moduleCode: "K102",
      assessmentCode: "TMA04",
      boardCategory: "upcoming",
      questType: "assignment",
      taskSummary: "Discuss biopsychosocial challenges in adolescence.",
      dueDate: "2026-06-14",
      completedDate: null,
      submittedDate: null,
      status: "Not started",
      currentStageLabel: "Task Intake Chamber",
      progressLabel: "0 / 8 chambers",
      openFlagsCount: 0,
      missedLootCount: 0,
      feedbackAvailable: false,
      feedbackQuestId: null,
      archiveReason: ""
    },
    {
      id: "e104-tma03",
      title: "E104 TMA03",
      moduleCode: "E104",
      assessmentCode: "TMA03",
      boardCategory: "in_progress",
      questType: "assignment",
      taskSummary: "Current chamber: Source Mine.",
      dueDate: "2026-06-09",
      completedDate: null,
      submittedDate: null,
      status: "In progress",
      currentStageLabel: "Source Mine",
      progressLabel: "3 / 8 chambers complete",
      openFlagsCount: 2,
      missedLootCount: 1,
      feedbackAvailable: false,
      feedbackQuestId: null,
      archiveReason: ""
    },
    {
      id: "k102-tma05",
      title: "K102 TMA05",
      moduleCode: "K102",
      assessmentCode: "TMA05",
      boardCategory: "completed",
      questType: "assignment",
      taskSummary: "Completed assignment archive.",
      dueDate: null,
      completedDate: "2026-05-22",
      submittedDate: "2026-05-22",
      status: "Completed / submitted",
      currentStageLabel: "Quest Report Exit",
      progressLabel: "Complete",
      openFlagsCount: 0,
      missedLootCount: 0,
      feedbackAvailable: true,
      feedbackQuestId: "k102-tma05-repair",
      archiveReason: "Completed original quest"
    },
    {
      id: "k102-tma05-repair",
      title: "K102 TMA05 Feedback Repair",
      moduleCode: "K102",
      assessmentCode: "TMA05 Repair",
      boardCategory: "feedback_repair",
      questType: "feedback_repair",
      taskSummary: "Repair focus: source explanation, paragraph flow, and citation accuracy.",
      dueDate: null,
      completedDate: null,
      submittedDate: null,
      status: "Not started",
      currentStageLabel: "Feedback Pattern Vault",
      progressLabel: "0 / repair route",
      openFlagsCount: 0,
      missedLootCount: 0,
      feedbackAvailable: false,
      feedbackQuestId: null,
      archiveReason: "Linked to K102 TMA05"
    },
    {
      id: "study-skills-trial",
      title: "Study Skills Trial",
      moduleCode: "Practice",
      assessmentCode: "Test Quest",
      boardCategory: "archive_test",
      questType: "test",
      taskSummary: "Neutral 800-word practice task for testing the StudyQuest route.",
      dueDate: null,
      completedDate: null,
      submittedDate: null,
      status: "Archived test quest",
      currentStageLabel: "StudyQuest Entrance",
      progressLabel: "Test route",
      openFlagsCount: 0,
      missedLootCount: 0,
      feedbackAvailable: false,
      feedbackQuestId: null,
      archiveReason: "Test quest"
    }
  ];

  function load() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(stored) && stored.length) return stored;
    } catch {}
    return defaultQuests;
  }

  function save(quests) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  }

  function daysUntil(dateString) {
    if (!dateString) return null;
    const due = new Date(`${dateString}T23:59:59`);
    if (Number.isNaN(due.getTime())) return null;
    const now = new Date();
    const ms = due.getTime() - now.getTime();
    return Math.ceil(ms / 86400000);
  }

  function dueText(quest) {
    if (!quest.dueDate) return "No due date set";
    const days = daysUntil(quest.dueDate);
    if (days === null) return `Due: ${quest.dueDate}`;
    if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `Due in ${days} days`;
  }

  function categoryTitle(key) {
    return categories.find(([id]) => id === key)?.[1] || key;
  }

  function actionText(quest) {
    if (quest.boardCategory === "upcoming") return "Start task intake";
    if (quest.boardCategory === "in_progress") return "Continue quest";
    if (quest.boardCategory === "completed" && quest.feedbackAvailable) return "Open summary / repair";
    if (quest.boardCategory === "completed") return "Open completed quest";
    if (quest.boardCategory === "feedback_repair") return "Open repair route";
    return "Open test quest";
  }

  function renderCard(quest) {
    const completed = quest.completedDate ? `Completed: ${quest.completedDate}` : "";
    const submitted = quest.submittedDate ? `Submitted: ${quest.submittedDate}` : "";
    const feedback = quest.feedbackAvailable ? "Feedback available" : "No feedback linked";
    return `<article class="quest-board-card" data-category="${escapeHtml(quest.boardCategory)}" data-quest-card="${escapeHtml(quest.id)}">
      <div class="quest-card-kicker">${escapeHtml(categoryTitle(quest.boardCategory))} · ${escapeHtml(dueText(quest))}</div>
      <h4 class="quest-card-title">${escapeHtml(quest.title)}</h4>
      <p class="quest-card-meta">${escapeHtml(quest.moduleCode || "")} ${escapeHtml(quest.assessmentCode || "")}</p>
      <p class="quest-card-task">${escapeHtml(quest.taskSummary)}</p>
      <p class="quest-card-status"><strong>Status:</strong> ${escapeHtml(quest.status)}</p>
      <div class="quest-card-stats">
        ${quest.currentStageLabel ? `<span class="quest-pill">${escapeHtml(quest.currentStageLabel)}</span>` : ""}
        ${quest.progressLabel ? `<span class="quest-pill">${escapeHtml(quest.progressLabel)}</span>` : ""}
        <span class="quest-pill">🚩 ${Number(quest.openFlagsCount) || 0} flags</span>
        <span class="quest-pill">💎 ${Number(quest.missedLootCount) || 0} missed loot</span>
        ${completed ? `<span class="quest-pill">${escapeHtml(completed)}</span>` : ""}
        ${submitted ? `<span class="quest-pill">${escapeHtml(submitted)}</span>` : ""}
        ${quest.boardCategory === "completed" ? `<span class="quest-pill">${feedback}</span>` : ""}
      </div>
      <div class="quest-card-actions">
        <button type="button" data-open-quest="${escapeHtml(quest.id)}">${escapeHtml(actionText(quest))}</button>
        <button type="button" class="secondary-button" data-edit-quest="${escapeHtml(quest.id)}">Edit</button>
      </div>
    </article>`;
  }

  function render() {
    const mount = document.querySelector("[data-quest-board]");
    if (!mount) return;
    const quests = load();
    mount.innerHTML = `<section class="quest-board-ui">
      <h2 class="quest-board-title">Quest Board</h2>
      <div class="quest-board-tools">
        <button type="button" data-add-quest>Add editable quest card</button>
        <button type="button" class="secondary-button" data-reset-quest-board>Reset board examples</button>
      </div>
      <div data-edit-form-mount></div>
      ${categories.map(([category, title]) => {
        const cards = quests.filter((quest) => quest.boardCategory === category);
        return `<section class="quest-board-section" data-board-section="${category}">
          <h3>${title}</h3>
          <div class="quest-card-grid">${cards.length ? cards.map(renderCard).join("") : `<p class="empty-board-note">No cards yet.</p>`}</div>
        </section>`;
      }).join("")}
    </section>`;
    bindEvents();
  }

  function bindEvents() {
    document.querySelector("[data-add-quest]")?.addEventListener("click", () => showEditForm());
    document.querySelector("[data-reset-quest-board]")?.addEventListener("click", () => {
      if (confirm("Reset the manual quest board example cards?")) {
        save(defaultQuests);
        render();
      }
    });
    document.querySelectorAll("[data-edit-quest]").forEach((button) => {
      button.addEventListener("click", () => showEditForm(button.dataset.editQuest));
    });
    document.querySelectorAll("[data-open-quest]").forEach((button) => {
      button.addEventListener("click", () => openQuestPlaceholder(button.dataset.openQuest));
    });
  }

  function blankQuest() {
    return {
      id: `quest-${Date.now()}`,
      title: "New StudyQuest",
      moduleCode: "",
      assessmentCode: "",
      boardCategory: "upcoming",
      questType: "assignment",
      taskSummary: "Describe the task here.",
      dueDate: "",
      completedDate: "",
      submittedDate: "",
      status: "Not started",
      currentStageLabel: "Task Intake Chamber",
      progressLabel: "0 / 8 chambers",
      openFlagsCount: 0,
      missedLootCount: 0,
      feedbackAvailable: false,
      feedbackQuestId: "",
      archiveReason: ""
    };
  }

  function showEditForm(questId) {
    const quests = load();
    const quest = questId ? quests.find((item) => item.id === questId) : blankQuest();
    const mount = document.querySelector("[data-edit-form-mount]");
    if (!mount || !quest) return;
    mount.innerHTML = `<form class="quest-edit-form" data-quest-edit-form data-editing-id="${escapeHtml(quest.id)}" data-is-new="${questId ? "false" : "true"}">
      <h3>${questId ? "Edit quest card" : "Add quest card"}</h3>
      <div class="form-grid">
        <label>Title<input name="title" value="${escapeHtml(quest.title)}"></label>
        <label>Module code<input name="moduleCode" value="${escapeHtml(quest.moduleCode || "")}"></label>
        <label>Assessment code<input name="assessmentCode" value="${escapeHtml(quest.assessmentCode || "")}"></label>
        <label>Board category<select name="boardCategory">${categories.map(([id, label]) => `<option value="${id}" ${quest.boardCategory === id ? "selected" : ""}>${label}</option>`).join("")}</select></label>
        <label>Quest type<input name="questType" value="${escapeHtml(quest.questType)}"></label>
        <label>Due date<input name="dueDate" type="date" value="${escapeHtml(quest.dueDate || "")}"></label>
        <label>Completed date<input name="completedDate" type="date" value="${escapeHtml(quest.completedDate || "")}"></label>
        <label>Submitted date<input name="submittedDate" type="date" value="${escapeHtml(quest.submittedDate || "")}"></label>
        <label>Status<input name="status" value="${escapeHtml(quest.status || "")}"></label>
        <label>Current chamber<input name="currentStageLabel" value="${escapeHtml(quest.currentStageLabel || "")}"></label>
        <label>Progress<input name="progressLabel" value="${escapeHtml(quest.progressLabel || "")}"></label>
        <label>Open flags<input name="openFlagsCount" type="number" min="0" value="${Number(quest.openFlagsCount) || 0}"></label>
        <label>Missed loot<input name="missedLootCount" type="number" min="0" value="${Number(quest.missedLootCount) || 0}"></label>
        <label>Feedback available<select name="feedbackAvailable"><option value="false" ${!quest.feedbackAvailable ? "selected" : ""}>No</option><option value="true" ${quest.feedbackAvailable ? "selected" : ""}>Yes</option></select></label>
        <label>Feedback quest ID<input name="feedbackQuestId" value="${escapeHtml(quest.feedbackQuestId || "")}"></label>
        <label>Archive/link note<input name="archiveReason" value="${escapeHtml(quest.archiveReason || "")}"></label>
      </div>
      <label>Task summary<textarea name="taskSummary">${escapeHtml(quest.taskSummary || "")}</textarea></label>
      <div class="room-actions">
        <button type="submit">Save card</button>
        <button type="button" class="secondary-button" data-cancel-edit>Cancel</button>
      </div>
    </form>`;
    mount.querySelector("[data-cancel-edit]").addEventListener("click", () => mount.innerHTML = "");
    mount.querySelector("[data-quest-edit-form]").addEventListener("submit", saveForm);
    mount.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function saveForm(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const quests = load();
    const next = {
      id: form.dataset.editingId,
      title: data.title,
      moduleCode: data.moduleCode,
      assessmentCode: data.assessmentCode,
      boardCategory: data.boardCategory,
      questType: data.questType,
      taskSummary: data.taskSummary,
      dueDate: data.dueDate || null,
      completedDate: data.completedDate || null,
      submittedDate: data.submittedDate || null,
      status: data.status,
      currentStageLabel: data.currentStageLabel,
      progressLabel: data.progressLabel,
      openFlagsCount: Number(data.openFlagsCount) || 0,
      missedLootCount: Number(data.missedLootCount) || 0,
      feedbackAvailable: data.feedbackAvailable === "true",
      feedbackQuestId: data.feedbackQuestId || null,
      archiveReason: data.archiveReason || ""
    };
    const existingIndex = quests.findIndex((quest) => quest.id === next.id);
    if (existingIndex >= 0) quests[existingIndex] = next;
    else quests.push(next);
    save(quests);
    render();
  }

  function openQuestPlaceholder(questId) {
    const quest = load().find((item) => item.id === questId);
    const panel = document.querySelector("#quest-placeholder-panel");
    const content = document.querySelector("[data-quest-placeholder]");
    if (!quest || !panel || !content) return;
    const placeholder = {
      upcoming: "Task Intake Chamber placeholder",
      in_progress: `${quest.currentStageLabel || "Current chamber"} placeholder`,
      completed: "Completed Quest Summary placeholder",
      feedback_repair: "Feedback Repair Route placeholder",
      archive_test: "Archived/Test Quest placeholder"
    }[quest.boardCategory] || "StudyQuest placeholder";
    content.innerHTML = `<h2>${escapeHtml(quest.title)}</h2>
      <p><strong>${escapeHtml(placeholder)}</strong></p>
      <p>${escapeHtml(quest.taskSummary)}</p>
      <p>Status: ${escapeHtml(quest.status)}</p>
      ${quest.feedbackAvailable ? `<p>Feedback is available. Repair quest: ${escapeHtml(quest.feedbackQuestId || "not linked yet")}</p>` : ""}
      <p>This is a manual v0.1 board action. Full StudyQuest loading comes later.</p>`;
    panel.open = true;
    panel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function init() {
    if (!localStorage.getItem(STORAGE_KEY)) save(defaultQuests);
    render();
  }

  return { init, render, load, save };
})();

document.addEventListener("DOMContentLoaded", EsslayQuestBoard.init);

(() => {
  const SAVE_KEY = "esslay-study-cave-save-v01";
  const QUEST_ID = "study-skills-trial";
  const MAX_SAFE_SAVE_CHARS = 350000;
  const MAX_TASK_TEXT = 12000;
  const MAX_RENDERED_CHUNKS = 30;
  const SAMPLE = "Write an 800-word practice response explaining how a student can use planning, source notes, drafting, proofreading, and referencing habits to improve the quality of an academic assignment.";

  const esc = (value) => String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  const trimText = (value, max = MAX_TASK_TEXT) => String(value ?? "").slice(0, max);
  const chunkPreview = (value) => {
    const text = String(value ?? "Recovered chunk").replace(/\s+/g, " ").trim();
    return text.length > 70 ? `${text.slice(0, 70)}…` : text;
  };

  function blankSafeState(reason = "") {
    return {
      safeMode: true,
      warning: reason,
      taskTitle: "Study Skills Trial",
      assessmentType: "practice task",
      rawTaskText: SAMPLE,
      chunks: []
    };
  }

  function safeBriefState() {
    let raw = "";
    try { raw = localStorage.getItem(SAVE_KEY) || ""; } catch { return blankSafeState("The saved Study Cave data could not be read, so Task Brief opened in safe mode."); }
    if (raw.length > MAX_SAFE_SAVE_CHARS) return blankSafeState("The saved Study Cave data is too large to open safely. Use Reset Brief Fog save below, then reopen the chamber.");
    let saved;
    try { saved = raw ? JSON.parse(raw) : null; } catch { return blankSafeState("The saved Study Cave data is malformed. Use Reset Brief Fog save below, then reopen the chamber."); }
    const fog = saved?.quests?.[QUEST_ID]?.briefFog || {};
    const chunks = Array.isArray(fog.chunks) ? fog.chunks.slice(0, MAX_RENDERED_CHUNKS) : [];
    return {
      safeMode: false,
      warning: "",
      taskTitle: trimText(fog.taskTitle || "Study Skills Trial", 180),
      assessmentType: trimText(fog.assessmentType || "practice task", 180),
      rawTaskText: trimText(fog.rawTaskText || SAMPLE),
      chunks
    };
  }

  function renderTaskBriefDrawer(state) {
    const chunks = state.chunks.length ? `<ol class="chunk-list">${state.chunks.map((chunk, index) => `<li><button type="button" data-open-chunk="${index}">${esc(chunkPreview(chunk.originalText || chunk.text))}</button> <small>${esc(chunk.state || "Not started")}</small></li>`).join("")}</ol>` : `<p>No chunks yet.</p>`;
    const warning = state.warning ? `<section class="warning-list"><h3>Task Brief safe mode</h3><p>${esc(state.warning)}</p></section>` : "";
    return `<aside class="scene-drawer wide-drawer emergency-task-drawer"><button type="button" class="drawer-close" data-guard-close-task>×</button><h2>Task Brief</h2>${warning}<p>Paste or adjust the task, question, brief, guidance, or marking notes. This safe drawer avoids rendering oversized saved data.</p><form data-guard-task-form><label>Task title<input name="taskTitle" value="${esc(state.taskTitle)}"></label><label>Assessment type<input name="assessmentType" value="${esc(state.assessmentType)}"></label><label>Paste task / question / guidance<textarea name="rawTaskText" rows="7">${esc(state.rawTaskText)}</textarea></label><div class="drawer-actions"><button type="button" data-guard-save-task>Save task brief</button><button type="button" data-guard-reset-brief>Reset Brief Fog save</button></div></form><h3>Chunk list</h3>${chunks}</aside>`;
  }

  function openGuardTaskBrief(event) {
    const taskButton = event.target.closest('[data-brief-panel="task"]');
    if (!taskButton) return;
    const room = document.querySelector("#stage-scene .brief-fog-room");
    if (!room) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    room.querySelectorAll(".emergency-task-drawer").forEach((drawer) => drawer.remove());
    room.insertAdjacentHTML("beforeend", renderTaskBriefDrawer(safeBriefState()));
  }

  function saveGuardTask(event) {
    const saveButton = event.target.closest("[data-guard-save-task]");
    if (!saveButton) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const form = saveButton.closest("form");
    const data = new FormData(form);
    let raw = "";
    let saved = null;
    try { raw = localStorage.getItem(SAVE_KEY) || ""; } catch {}
    if (raw.length <= MAX_SAFE_SAVE_CHARS) {
      try { saved = raw ? JSON.parse(raw) : null; } catch { saved = null; }
    }
    if (!saved || !saved.quests || !saved.quests[QUEST_ID]) {
      saved = { activeQuestId: QUEST_ID, selectedQuestId: QUEST_ID, quests: { [QUEST_ID]: { questTitle: "Study Skills Trial", currentRouteLocation: "working_chamber", currentChamberId: "brief-fog", completedChambers: [], unlockedChambers: ["cave-base", "brief-fog"], flags: [], missedLoot: [], briefFog: {} } } };
    }
    const quest = saved.quests[QUEST_ID];
    quest.briefFog = quest.briefFog || {};
    quest.briefFog.taskTitle = trimText(data.get("taskTitle") || "Study Skills Trial", 180);
    quest.briefFog.assessmentType = trimText(data.get("assessmentType") || "practice task", 180);
    quest.briefFog.rawTaskText = trimText(data.get("rawTaskText") || SAMPLE);
    quest.briefFog.chunks = [];
    quest.briefFog.highlights = [];
    quest.briefFog.notes = [];
    quest.briefFog.dismissed = [];
    quest.briefFog.outputCards = { commandWordCards: [], keywordCards: [], scopeLimitCards: [], sourceRequirementCards: [], taskDemandSummary: null };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(saved)); } catch {}
    const room = document.querySelector("#stage-scene .brief-fog-room");
    if (room) {
      room.querySelectorAll(".emergency-task-drawer").forEach((drawer) => drawer.remove());
      room.insertAdjacentHTML("beforeend", renderTaskBriefDrawer(safeBriefState()));
    }
  }

  function resetBriefFog(event) {
    const resetButton = event.target.closest("[data-guard-reset-brief]");
    if (!resetButton) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    try { localStorage.removeItem(SAVE_KEY); } catch {}
    const room = document.querySelector("#stage-scene .brief-fog-room");
    if (room) {
      room.querySelectorAll(".emergency-task-drawer").forEach((drawer) => drawer.remove());
      room.insertAdjacentHTML("beforeend", renderTaskBriefDrawer(blankSafeState("Brief Fog save was reset. Close and re-enter Brief Fog if the route panel needs refreshing.")));
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("click", openGuardTaskBrief, true);
    window.addEventListener("click", saveGuardTask, true);
    window.addEventListener("click", resetBriefFog, true);
    window.addEventListener("click", (event) => {
      const closeButton = event.target.closest("[data-guard-close-task]");
      if (!closeButton) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      closeButton.closest(".emergency-task-drawer")?.remove();
    }, true);
  });
})();
