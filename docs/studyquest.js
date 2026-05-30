const EsslayStudyQuest = (() => {
  const STORAGE_KEY = "esslay-studyquest-v01";

  const studyStages = [
    {
      id: "entrance",
      title: "StudyQuest Entrance",
      stage: "Quest start",
      blocker: "Quest Lock",
      problem: "No reusable StudyQuest route has been selected yet.",
      purpose: "Start or review the test quest. This page uses The Study Skills Trial so the system is not built around a current assessment.",
      fields: "entrance"
    },
    {
      id: "task-intake",
      title: "Task Intake Chamber",
      stage: "Task intake",
      blocker: "Brief Fog",
      problem: "The task is not captured clearly yet.",
      purpose: "Capture the task type, brief, word count, output format, and any support materials before planning.",
      fields: "intake"
    },
    {
      id: "command-words",
      title: "Command Word Chamber",
      stage: "Question breakdown",
      blocker: "Command Imp",
      problem: "A command word is misunderstood or left vague.",
      purpose: "Store command words and what each one asks the work to do.",
      fields: "commandWords"
    },
    {
      id: "marking-grid",
      title: "Marking Grid Chamber",
      stage: "Criteria check",
      blocker: "Rubric Stone Golem",
      problem: "The marking grid feels vague, heavy, or detached from the work route.",
      purpose: "Turn marking criteria, guidance, or success checks into practical quest requirements.",
      fields: "markingGrid"
    },
    {
      id: "feedback-vault",
      title: "Feedback Pattern Vault",
      stage: "Personal repair patterns",
      blocker: "Echo Wraith",
      problem: "A past feedback pattern may repeat unnoticed.",
      purpose: "Store recurring feedback risks such as task drift, weak source-to-point links, paragraph flow, referencing checks, and over-editing.",
      fields: "feedbackPatterns"
    },
    {
      id: "source-room",
      title: "Source and Referencing Room",
      stage: "Evidence loot",
      blocker: "Source Troll and Citation Skeleton",
      problem: "Sources are not connected to the task, or reference details are missing.",
      purpose: "Add source cards, evidence geodes, reference notes, and manual source-to-point links.",
      fields: "sources"
    },
    {
      id: "draft-route",
      title: "Draft Route Builder",
      stage: "Plan route",
      blocker: "Structure Golem",
      problem: "Ideas exist but are not arranged into a workable route.",
      purpose: "Create paragraph, section, slide, reflection, repair, or exam-answer tiles depending on the task type.",
      fields: "draftRoute"
    },
    {
      id: "dirty-draft",
      title: "Dirty Draft Area",
      stage: "Rough writing",
      blocker: "Perfection Slime",
      problem: "Drafting is blocked by over-polishing.",
      purpose: "Write rough sections and mark unfinished smoothing as missed loot instead of stopping progress.",
      fields: "dirtyDraft"
    },
    {
      id: "coherence-boss",
      title: "Coherence/Focus Boss",
      stage: "Boss fight",
      blocker: "Coherence Dragon",
      problem: "The draft or plan lacks focus, flow, or source-to-point links.",
      purpose: "Check focus, paragraph flow, source links, task fit, and areas that need repair before submission checks.",
      fields: "coherence"
    },
    {
      id: "submission-gate",
      title: "Submission Gate",
      stage: "Final checks",
      blocker: "Gatekeeper of Almost Done",
      problem: "Final checks are incomplete or confused with official submission readiness.",
      purpose: "Check word count, format, references, attachments, and guidance. Game exports are process files, not official submission files.",
      fields: "submission"
    },
    {
      id: "quest-report",
      title: "Quest Report Exit",
      stage: "Progress report",
      blocker: "Archivist Door",
      problem: "Progress is not exported or clear enough to return to later.",
      purpose: "Export readable Markdown reports, save the central quest data, and record what is left to do.",
      fields: "report"
    }
  ];

  const defaultChecks = {
    coherence: [
      "Each route tile still answers the task wording.",
      "Each source/evidence geode has a clear reason for being used.",
      "Paragraph or section order makes sense.",
      "Any rough but useful area has a flag or missed-loot note.",
      "The draft is allowed to stay dirty until the repair pass."
    ],
    submission: [
      "Word count has been checked against the real task rules.",
      "Required format has been checked against module guidance.",
      "Reference details that need checking are marked clearly.",
      "Attachments or extra files are listed if needed.",
      "Process exports are separated from official submission files."
    ]
  };

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function now() {
    return new Date().toISOString();
  }

  function defaultQuest() {
    return {
      version: "0.1",
      id: "study-skills-trial",
      title: "The Study Skills Trial",
      status: "test",
      taskType: "essay",
      wordCount: 800,
      createdAt: now(),
      updatedAt: now(),
      currentRoomId: "entrance",
      task: {
        prompt: "Write an 800-word practice response explaining how a student can use planning, source notes, drafting, proofreading, and referencing habits to improve the quality of an academic assignment.",
        outputFormat: "practice response",
        moduleArea: "Reusable study skills support material",
        officialSubmission: false
      },
      roomStatus: {},
      intakeMaterials: [
        {
          id: uid("support"),
          materialType: "support_material",
          title: "Study skills guide",
          note: "Reusable support material for understanding questions, action words, planning, note taking, structuring, writing in own words, proofreading, and referencing.",
          addedAt: now()
        }
      ],
      commandWords: [],
      markingCriteria: [],
      feedbackPatterns: [],
      sourceCards: [],
      evidenceCards: [],
      referencingNotes: [],
      sourceToPointLinks: [],
      draftRouteTiles: [],
      dirtyDraftSections: [],
      flags: [],
      missedLoot: [],
      coherenceChecks: defaultChecks.coherence.map((label) => ({ id: uid("coherence-check"), label, done: false })),
      submissionChecks: defaultChecks.submission.map((label) => ({ id: uid("submission-check"), label, done: false })),
      progressLog: []
    };
  }

  function loadQuest() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return normaliseQuest(stored);
    } catch {
      return defaultQuest();
    }
  }

  function saveQuest(quest) {
    quest.updatedAt = now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quest));
    return quest;
  }

  function normaliseQuest(rawQuest) {
    const base = defaultQuest();
    const quest = { ...base, ...(rawQuest || {}) };
    quest.task = { ...base.task, ...(quest.task || {}) };
    quest.roomStatus = quest.roomStatus || {};
    quest.intakeMaterials = quest.intakeMaterials || [];
    quest.commandWords = quest.commandWords || [];
    quest.markingCriteria = quest.markingCriteria || [];
    quest.feedbackPatterns = quest.feedbackPatterns || [];
    quest.sourceCards = quest.sourceCards || [];
    quest.evidenceCards = quest.evidenceCards || [];
    quest.referencingNotes = quest.referencingNotes || [];
    quest.sourceToPointLinks = quest.sourceToPointLinks || [];
    quest.draftRouteTiles = quest.draftRouteTiles || [];
    quest.dirtyDraftSections = quest.dirtyDraftSections || [];
    quest.flags = quest.flags || [];
    quest.missedLoot = quest.missedLoot || [];
    quest.coherenceChecks = quest.coherenceChecks?.length ? quest.coherenceChecks : base.coherenceChecks;
    quest.submissionChecks = quest.submissionChecks?.length ? quest.submissionChecks : base.submissionChecks;
    quest.progressLog = quest.progressLog || [];
    return quest;
  }

  function addProgress(quest, type, message, roomId = quest.currentRoomId) {
    quest.progressLog.unshift({ id: uid("progress"), type, message, roomId, at: now() });
    quest.progressLog = quest.progressLog.slice(0, 120);
  }

  function completeRoom(roomId) {
    const quest = loadQuest();
    quest.roomStatus[roomId] = { status: "complete", completedAt: now() };
    addProgress(quest, "room-complete", `${roomTitle(roomId)} completed.`, roomId);
    saveQuest(quest);
    return quest;
  }

  function roomTitle(roomId) {
    return studyStages.find((stage) => stage.id === roomId)?.title || roomId;
  }

  function progressPercent(quest) {
    const completeCount = studyStages.filter((stage) => quest.roomStatus?.[stage.id]?.status === "complete").length;
    return Math.round((completeCount / studyStages.length) * 100);
  }

  function setCurrentRoom(roomId) {
    const quest = loadQuest();
    quest.currentRoomId = roomId;
    saveQuest(quest);
    render();
  }

  function appendItem(collectionName, item, message) {
    const quest = loadQuest();
    quest[collectionName].push({ id: uid(collectionName), ...item, createdAt: now(), roomId: quest.currentRoomId });
    addProgress(quest, collectionName, message || `Saved ${collectionName}.`);
    saveQuest(quest);
    render();
  }

  function updateTask(partialTask) {
    const quest = loadQuest();
    quest.task = { ...quest.task, ...partialTask };
    if (partialTask.taskType) quest.taskType = partialTask.taskType;
    if (partialTask.wordCount) quest.wordCount = Number(partialTask.wordCount) || quest.wordCount;
    addProgress(quest, "task-update", "Task intake updated.");
    saveQuest(quest);
    render();
  }

  function toggleCheck(collectionName, checkId, done) {
    const quest = loadQuest();
    quest[collectionName] = quest[collectionName].map((check) => check.id === checkId ? { ...check, done } : check);
    addProgress(quest, "check-update", `${collectionName} updated.`);
    saveQuest(quest);
    render();
  }

  function resetQuest() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultQuest()));
    render();
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  }

  function render() {
    const quest = loadQuest();
    const currentStage = studyStages.find((stage) => stage.id === quest.currentRoomId) || studyStages[0];

    document.querySelector("[data-quest-title]").textContent = quest.title;
    document.querySelector("[data-quest-task-type]").textContent = quest.taskType;
    document.querySelector("[data-quest-word-count]").textContent = quest.wordCount;
    document.querySelector("[data-quest-progress]").textContent = `${progressPercent(quest)}%`;

    renderMap(quest, currentStage.id);
    renderRoom(quest, currentStage);
    renderLog(quest);
  }

  function renderMap(quest, currentRoomId) {
    const map = document.querySelector("[data-room-map]");
    map.innerHTML = studyStages.map((stage, index) => {
      const complete = quest.roomStatus?.[stage.id]?.status === "complete";
      const active = stage.id === currentRoomId;
      return `<button type="button" class="room-node ${complete ? "complete" : ""} ${active ? "active" : ""}" data-open-room="${stage.id}">
        <strong>${index + 1}. ${escapeHtml(stage.title)}</strong>
        <small>${complete ? "Complete" : active ? "Open" : "Not complete"}</small>
      </button>`;
    }).join("");

    map.querySelectorAll("[data-open-room]").forEach((button) => {
      button.addEventListener("click", () => setCurrentRoom(button.dataset.openRoom));
    });
  }

  function renderRoom(quest, stage) {
    document.querySelector("[data-room-stage]").textContent = stage.stage;
    document.querySelector("[data-room-title]").textContent = stage.title;
    document.querySelector("[data-blocker-name]").textContent = stage.blocker;
    document.querySelector("[data-blocker-problem]").textContent = stage.problem;
    document.querySelector("[data-room-purpose]").textContent = stage.purpose;
    document.querySelector("[data-room-status]").textContent = quest.roomStatus?.[stage.id]?.status === "complete" ? "Complete" : "Not complete";
    document.querySelector("[data-room-workspace]").innerHTML = workspaceHtml(quest, stage.fields);
    bindWorkspaceEvents(stage.fields);
  }

  function workspaceHtml(quest, fields) {
    if (fields === "entrance") {
      return `<div class="saved-card">
        <h3>Prototype rule</h3>
        <p>This is a reusable StudyQuest test. It is not tied to a current module assessment and does not use the old Alex task as the default model.</p>
      </div>
      <div class="saved-card">
        <h3>Practice task</h3>
        <p>${escapeHtml(quest.task.prompt)}</p>
      </div>`;
    }

    if (fields === "intake") {
      return `<form data-task-form class="card-list">
        <div class="form-grid">
          <label>Quest title<input name="title" value="${escapeHtml(quest.title)}"></label>
          <label>Task type
            <select name="taskType">
              ${["essay", "essay_plan", "reflection", "presentation", "source_task", "feedback_repair", "exam_prep", "multi_part_assignment"].map((type) => `<option value="${type}" ${quest.taskType === type ? "selected" : ""}>${type}</option>`).join("")}
            </select>
          </label>
          <label>Word count<input name="wordCount" type="number" min="0" value="${Number(quest.wordCount) || 0}"></label>
          <label>Output format<input name="outputFormat" value="${escapeHtml(quest.task.outputFormat || "")}"></label>
        </div>
        <label>Task prompt<textarea name="prompt">${escapeHtml(quest.task.prompt || "")}</textarea></label>
        <label>Module / support area<textarea name="moduleArea">${escapeHtml(quest.task.moduleArea || "")}</textarea></label>
        <button type="submit">Save task intake</button>
      </form>
      ${listHtml("Support/intake materials", quest.intakeMaterials, (item) => `${item.title}: ${item.note}`)}`;
    }

    if (fields === "commandWords") {
      return `<form data-command-form class="form-grid">
        <label>Command word<input name="word" placeholder="e.g. explain"></label>
        <label>What it asks the work to do<input name="meaning" placeholder="e.g. make clear how or why something happens"></label>
        <label>Task focus<textarea name="taskFocus" placeholder="How this command word applies to this StudyQuest"></textarea></label>
        <button type="submit">Save command word</button>
      </form>
      ${listHtml("Command word cards", quest.commandWords, (item) => `${item.word}: ${item.meaning}\n${item.taskFocus || ""}`)}`;
    }

    if (fields === "markingGrid") {
      return `<form data-marking-form class="form-grid">
        <label>Criterion / guidance point<input name="criterion" placeholder="e.g. answer the question directly"></label>
        <label>Practical check<textarea name="check" placeholder="What will I look for in the draft?"></textarea></label>
        <button type="submit">Save marking check</button>
      </form>
      ${listHtml("Marking grid checks", quest.markingCriteria, (item) => `${item.criterion}\nCheck: ${item.check}`)}`;
    }

    if (fields === "feedbackPatterns") {
      return `<form data-feedback-form class="form-grid">
        <label>Feedback pattern<input name="pattern" placeholder="e.g. task drift"></label>
        <label>Repair action<textarea name="repair" placeholder="How the game should remind me to fix it"></textarea></label>
        <button type="submit">Save feedback pattern</button>
      </form>
      ${listHtml("Feedback pattern cards", quest.feedbackPatterns, (item) => `${item.pattern}\nRepair: ${item.repair}`)}`;
    }

    if (fields === "sources") {
      return `<form data-source-form class="form-grid">
        <label>Source title<input name="title" placeholder="e.g. Study skills guide"></label>
        <label>Source type<input name="sourceType" placeholder="guide, module material, transcript, etc."></label>
        <label>Reference status<select name="referenceStatus"><option>needs_checking</option><option>complete</option><option>incomplete</option></select></label>
        <label>Source note<textarea name="note" placeholder="Why this source is useful"></textarea></label>
        <button type="submit">Save source card</button>
      </form>
      <form data-evidence-form class="form-grid">
        <label>Evidence / extract<textarea name="extract" placeholder="Paste quote, paraphrase note, or useful extract"></textarea></label>
        <label>Label<input name="label" placeholder="e.g. planning helps break tasks down"></label>
        <label>Source title / ID<input name="sourceRef" placeholder="Manual link for now"></label>
        <label>Use<input name="evidenceUse" placeholder="definition, example, supporting point, etc."></label>
        <button type="submit">Save evidence geode</button>
      </form>
      <form data-reference-note-form class="form-grid">
        <label>Reference issue<input name="issue" placeholder="e.g. page number missing"></label>
        <label>Action needed<textarea name="action" placeholder="What must be checked later?"></textarea></label>
        <button type="submit">Save reference note</button>
      </form>
      ${listHtml("Source cards", quest.sourceCards, (item) => `${item.title} [${item.sourceType}]\nReference: ${item.referenceStatus}\n${item.note || ""}`)}
      ${listHtml("Evidence geodes", quest.evidenceCards, (item) => `${item.label}\n${item.extract}\nSource: ${item.sourceRef || "manual"}\nUse: ${item.evidenceUse || ""}`, "geode-card")}
      ${listHtml("Referencing notes", quest.referencingNotes, (item) => `${item.issue}\nAction: ${item.action}`)}`;
    }

    if (fields === "draftRoute") {
      return `<form data-tile-form class="form-grid">
        <label>Tile title<input name="title" placeholder="e.g. Paragraph 1: planning"></label>
        <label>Point / job<textarea name="point" placeholder="What should this paragraph, section, slide, or repair tile do?"></textarea></label>
        <label>Target words<input name="targetWords" type="number" min="0" placeholder="optional"></label>
        <label>Linked evidence note<textarea name="linkedEvidenceNote" placeholder="Manual source-to-point link placeholder"></textarea></label>
        <button type="submit">Save draft route tile</button>
      </form>
      ${listHtml("Draft route tiles", quest.draftRouteTiles, (item) => `${item.title}\nPoint: ${item.point}\nTarget words: ${item.targetWords || "not set"}\nEvidence link: ${item.linkedEvidenceNote || "not linked yet"}`, "tile-card")}`;
    }

    if (fields === "dirtyDraft") {
      return `<form data-draft-form class="card-list">
        <label>Section title<input name="title" placeholder="e.g. Rough introduction"></label>
        <label>Dirty draft text<textarea name="text" placeholder="Write rough. Do not polish everything now."></textarea></label>
        <button type="submit">Save dirty draft section</button>
      </form>
      ${listHtml("Dirty draft sections", quest.dirtyDraftSections, (item) => `${item.title}\n${item.text}`)}`;
    }

    if (fields === "coherence") {
      return `<div class="checklist">
        ${quest.coherenceChecks.map((check) => `<label class="check-row"><input type="checkbox" data-check="coherenceChecks" data-check-id="${check.id}" ${check.done ? "checked" : ""}> ${escapeHtml(check.label)}</label>`).join("")}
      </div>`;
    }

    if (fields === "submission") {
      return `<div class="saved-card">
        <h3>Submission boundary</h3>
        <p>The game can export process files and reminders. It must not pretend that a process export is automatically ready to submit.</p>
      </div>
      <div class="checklist">
        ${quest.submissionChecks.map((check) => `<label class="check-row"><input type="checkbox" data-check="submissionChecks" data-check-id="${check.id}" ${check.done ? "checked" : ""}> ${escapeHtml(check.label)}</label>`).join("")}
      </div>`;
    }

    if (fields === "report") {
      return `<div class="saved-card">
        <h3>Quest report summary</h3>
        <p>${escapeHtml(summaryText(quest))}</p>
      </div>
      <div class="export-buttons">
        <button type="button" data-export-report>Export progress report</button>
        <button type="button" data-export-all-markdown>Export all Markdown sections</button>
        <button type="button" class="secondary-button" data-export-json>Export quest.json</button>
      </div>`;
    }

    return "";
  }

  function listHtml(title, items, renderItem, extraClass = "") {
    if (!items.length) {
      return `<section class="card-list"><h3>${escapeHtml(title)}</h3><div class="saved-card"><p>Nothing saved yet.</p></div></section>`;
    }
    return `<section class="card-list"><h3>${escapeHtml(title)}</h3>${items.map((item) => `<article class="saved-card ${extraClass}"><h4>${escapeHtml(item.title || item.word || item.pattern || item.criterion || item.label || item.issue || "Saved card")}</h4><p>${escapeHtml(renderItem(item))}</p></article>`).join("")}</section>`;
  }

  function bindWorkspaceEvents(fields) {
    const taskForm = document.querySelector("[data-task-form]");
    if (taskForm) {
      taskForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(taskForm).entries());
        const quest = loadQuest();
        quest.title = data.title || quest.title;
        saveQuest(quest);
        updateTask(data);
      });
    }

    bindSimpleForm("[data-command-form]", "commandWords", (data) => ({ word: data.word, meaning: data.meaning, taskFocus: data.taskFocus }), "Command word saved.");
    bindSimpleForm("[data-marking-form]", "markingCriteria", (data) => ({ criterion: data.criterion, check: data.check }), "Marking check saved.");
    bindSimpleForm("[data-feedback-form]", "feedbackPatterns", (data) => ({ pattern: data.pattern, repair: data.repair }), "Feedback pattern saved.");
    bindSimpleForm("[data-source-form]", "sourceCards", (data) => ({ title: data.title, sourceType: data.sourceType, referenceStatus: data.referenceStatus, note: data.note }), "Source card saved.");
    bindSimpleForm("[data-evidence-form]", "evidenceCards", (data) => ({ extract: data.extract, label: data.label, sourceRef: data.sourceRef, evidenceUse: data.evidenceUse, linkedTileIds: [] }), "Evidence geode saved.");
    bindSimpleForm("[data-reference-note-form]", "referencingNotes", (data) => ({ issue: data.issue, action: data.action }), "Reference note saved.");
    bindSimpleForm("[data-tile-form]", "draftRouteTiles", (data) => ({ title: data.title, point: data.point, targetWords: data.targetWords, linkedEvidenceNote: data.linkedEvidenceNote }), "Draft route tile saved.");
    bindSimpleForm("[data-draft-form]", "dirtyDraftSections", (data) => ({ title: data.title, text: data.text }), "Dirty draft section saved.");

    document.querySelectorAll("[data-check]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => toggleCheck(checkbox.dataset.check, checkbox.dataset.checkId, checkbox.checked));
    });

    const exportReport = document.querySelector("[data-export-report]");
    if (exportReport) exportReport.addEventListener("click", () => downloadMarkdown("ProgressReport", progressReportMarkdown(loadQuest())));

    const exportAll = document.querySelector("[data-export-all-markdown]");
    if (exportAll) exportAll.addEventListener("click", exportAllMarkdown);

    const exportJson = document.querySelector("[data-export-json]");
    if (exportJson) exportJson.addEventListener("click", () => downloadFile(fileName("quest", "json"), JSON.stringify(loadQuest(), null, 2), "application/json"));
  }

  function bindSimpleForm(selector, collectionName, itemBuilder, message) {
    const form = document.querySelector(selector);
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      appendItem(collectionName, itemBuilder(data), message);
    });
  }

  function bindGlobalEvents() {
    document.querySelector("[data-reset-demo]").addEventListener("click", () => {
      if (confirm("Reset The Study Skills Trial test quest?")) resetQuest();
    });

    document.querySelector("[data-complete-room]").addEventListener("click", () => {
      const quest = loadQuest();
      completeRoom(quest.currentRoomId);
      render();
    });

    document.querySelector("[data-export-current]").addEventListener("click", () => {
      const quest = loadQuest();
      const stage = studyStages.find((item) => item.id === quest.currentRoomId) || studyStages[0];
      downloadMarkdown(stage.title.replace(/[^a-z0-9]+/gi, ""), roomMarkdown(quest, stage));
    });

    document.querySelector("[data-flag-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      appendItem("flags", { text: data.text, stage: loadQuest().currentRoomId }, "Flag saved.");
    });

    document.querySelector("[data-missed-loot-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      appendItem("missedLoot", { text: data.text, stage: loadQuest().currentRoomId }, "Missed loot saved.");
    });
  }

  function renderLog(quest) {
    const log = document.querySelector("[data-quest-log]");
    log.innerHTML = `
      ${logSection("Flags", quest.flags.map((item) => `${roomTitle(item.stage)}: ${item.text}`))}
      ${logSection("Missed loot", quest.missedLoot.map((item) => `${roomTitle(item.stage)}: ${item.text}`))}
      ${logSection("Evidence geodes", quest.evidenceCards.map((item) => item.label || item.extract))}
      ${logSection("Draft route tiles", quest.draftRouteTiles.map((item) => item.title || item.point))}
      ${logSection("Recent progress", quest.progressLog.slice(0, 8).map((item) => item.message))}
    `;
  }

  function logSection(title, items) {
    const content = items.length ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : `<p>Nothing saved yet.</p>`;
    return `<section class="log-section"><h3>${escapeHtml(title)}</h3>${content}</section>`;
  }

  function summaryText(quest) {
    return `Progress: ${progressPercent(quest)}%\nFlags: ${quest.flags.length}\nMissed loot: ${quest.missedLoot.length}\nEvidence geodes: ${quest.evidenceCards.length}\nDraft route tiles: ${quest.draftRouteTiles.length}\nDirty draft sections: ${quest.dirtyDraftSections.length}`;
  }

  function frontMatter(quest, title) {
    return `# ${title}\n\nQuest: ${quest.title}\nTask type: ${quest.taskType}\nStatus: ${quest.status}\nWord count target: ${quest.wordCount}\nExported: ${new Date().toLocaleString()}\n\n`;
  }

  function progressReportMarkdown(quest) {
    return `${frontMatter(quest, "StudyQuest Progress Report")}${summaryText(quest)}\n\n## Completed rooms\n${studyStages.filter((stage) => quest.roomStatus?.[stage.id]?.status === "complete").map((stage) => `- ${stage.title}`).join("\n") || "None yet."}\n\n## Flags\n${quest.flags.map((item) => `- ${roomTitle(item.stage)}: ${item.text}`).join("\n") || "None."}\n\n## Missed loot\n${quest.missedLoot.map((item) => `- ${roomTitle(item.stage)}: ${item.text}`).join("\n") || "None."}\n\n## Next useful step\nOpen the first incomplete cave room and continue manually.\n`;
  }

  function roomMarkdown(quest, stage) {
    return `${frontMatter(quest, stage.title)}## Blocker\n${stage.blocker}: ${stage.problem}\n\n## Purpose\n${stage.purpose}\n\n## Saved content\n${sectionForStage(quest, stage.fields)}\n`;
  }

  function sectionForStage(quest, fields) {
    const lines = [];
    if (fields === "intake" || fields === "entrance") lines.push(`Prompt: ${quest.task.prompt}`, `Output format: ${quest.task.outputFormat}`, `Module/support area: ${quest.task.moduleArea}`);
    if (fields === "commandWords") lines.push(...quest.commandWords.map((item) => `- ${item.word}: ${item.meaning}. ${item.taskFocus || ""}`));
    if (fields === "markingGrid") lines.push(...quest.markingCriteria.map((item) => `- ${item.criterion}: ${item.check}`));
    if (fields === "feedbackPatterns") lines.push(...quest.feedbackPatterns.map((item) => `- ${item.pattern}: ${item.repair}`));
    if (fields === "sources") {
      lines.push("Sources:", ...quest.sourceCards.map((item) => `- ${item.title} [${item.sourceType}] Reference: ${item.referenceStatus}`));
      lines.push("Evidence geodes:", ...quest.evidenceCards.map((item) => `- ${item.label}: ${item.extract}`));
      lines.push("Reference notes:", ...quest.referencingNotes.map((item) => `- ${item.issue}: ${item.action}`));
    }
    if (fields === "draftRoute") lines.push(...quest.draftRouteTiles.map((item) => `- ${item.title}: ${item.point}. Evidence link: ${item.linkedEvidenceNote || "not linked"}`));
    if (fields === "dirtyDraft") lines.push(...quest.dirtyDraftSections.map((item) => `## ${item.title}\n${item.text}`));
    if (fields === "coherence") lines.push(...quest.coherenceChecks.map((item) => `- [${item.done ? "x" : " "}] ${item.label}`));
    if (fields === "submission") lines.push(...quest.submissionChecks.map((item) => `- [${item.done ? "x" : " "}] ${item.label}`));
    if (fields === "report") lines.push(progressReportMarkdown(quest));
    return lines.join("\n") || "Nothing saved for this room yet.";
  }

  function exportAllMarkdown() {
    const quest = loadQuest();
    downloadMarkdown("TaskIntake", roomMarkdown(quest, studyStages.find((stage) => stage.id === "task-intake")));
    setTimeout(() => downloadMarkdown("CommandWords", roomMarkdown(quest, studyStages.find((stage) => stage.id === "command-words"))), 150);
    setTimeout(() => downloadMarkdown("MarkingChecks", roomMarkdown(quest, studyStages.find((stage) => stage.id === "marking-grid"))), 300);
    setTimeout(() => downloadMarkdown("FeedbackPatterns", roomMarkdown(quest, studyStages.find((stage) => stage.id === "feedback-vault"))), 450);
    setTimeout(() => downloadMarkdown("SourceBank", roomMarkdown(quest, studyStages.find((stage) => stage.id === "source-room"))), 600);
    setTimeout(() => downloadMarkdown("DraftRoute", roomMarkdown(quest, studyStages.find((stage) => stage.id === "draft-route"))), 750);
    setTimeout(() => downloadMarkdown("DirtyDraft", roomMarkdown(quest, studyStages.find((stage) => stage.id === "dirty-draft"))), 900);
    setTimeout(() => downloadMarkdown("FlagsAndMissedLoot", flagsMarkdown(quest)), 1050);
    setTimeout(() => downloadMarkdown("SubmissionChecks", roomMarkdown(quest, studyStages.find((stage) => stage.id === "submission-gate"))), 1200);
    setTimeout(() => downloadMarkdown("ProgressReport", progressReportMarkdown(quest)), 1350);
  }

  function flagsMarkdown(quest) {
    return `${frontMatter(quest, "Flags and Missed Loot")}## Flags\n${quest.flags.map((item) => `- ${roomTitle(item.stage)}: ${item.text}`).join("\n") || "None."}\n\n## Missed loot\n${quest.missedLoot.map((item) => `- ${roomTitle(item.stage)}: ${item.text}`).join("\n") || "None."}\n`;
  }

  function fileDate() {
    return new Date().toISOString().slice(0, 10);
  }

  function fileName(area, extension) {
    return `${fileDate()}_StudySkillsTrial_${area}.${extension}`;
  }

  function downloadMarkdown(area, content) {
    downloadFile(fileName(area, "md"), content, "text/markdown");
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

  function init() {
    if (!localStorage.getItem(STORAGE_KEY)) saveQuest(defaultQuest());
    bindGlobalEvents();
    render();
  }

  return { init, loadQuest, saveQuest, resetQuest };
})();

document.addEventListener("DOMContentLoaded", EsslayStudyQuest.init);
