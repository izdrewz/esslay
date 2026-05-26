const EsslayGame = (() => {
  const STORAGE_KEY = "esslay-game-state-v1";

  const checkpointDefinitions = {
    "demo-tma-battle": [
      { id: "capture-task", label: "Capture task question", type: "academic", xp: 10, gold: 5, note: "Task question captured." },
      { id: "command-words", label: "Highlight command words", type: "academic", xp: 10, gold: 5, note: "Command words identified." },
      { id: "quote-geodes", label: "Build quote geodes", type: "academic", xp: 10, gold: 8, note: "Useful quote/source areas collected." },
      { id: "plan-created", label: "Create plan checkpoint", type: "academic", xp: 10, gold: 10, note: "Template or plan created." },
      { id: "paragraph-drafted", label: "Draft paragraph", type: "academic", xp: 10, gold: 10, note: "A draft paragraph exists." },
      { id: "citation-notes", label: "Add/check citation-style notes", type: "academic", xp: 10, gold: 8, note: "Citation notes checked." },
      { id: "flow-diary", label: "Use Flow Diary", type: "academic", xp: 10, gold: 10, note: "Sentence-by-sentence flow check completed." },
      { id: "submitted", label: "Confirm submitted", type: "submission", xp: 100, gold: 40, note: "Submission confirmed. This is the only point where the full draft counts as finished." }
    ],
    "domestic-demo": [
      { id: "start-task", label: "Start domestic quest", type: "domestic", xp: 10, gold: 3, note: "Domestic quest started." },
      { id: "halfway", label: "Reach halfway point", type: "domestic", xp: 10, gold: 5, note: "Domestic quest halfway complete." },
      { id: "done", label: "Finish domestic quest", type: "domestic", xp: 10, gold: 8, note: "Domestic quest finished." }
    ],
    "training-demo": [
      { id: "save-training-note", label: "Save training note", type: "training", xp: 10, gold: 3, note: "Training note saved." },
      { id: "tag-training-note", label: "Tag note by module/topic", type: "training", xp: 10, gold: 5, note: "Training note tagged." },
      { id: "source-reminder", label: "Add original-source reminder", type: "training", xp: 10, gold: 5, note: "Reminder added: Notebook material is study material, not citation-ready evidence." }
    ]
  };

  const rewardDefinitions = [
    {
      id: "plan-little-treat",
      name: "Little treat after planning",
      category: "Little treat",
      description: "Permission to claim a small reward once the plan checkpoint is complete.",
      condition: { questId: "demo-tma-battle", checkpointId: "plan-created" }
    },
    {
      id: "flow-medium-reward",
      name: "Reward after Flow Diary",
      category: "Reward",
      description: "Permission to claim a medium reward after the sentence-by-sentence check.",
      condition: { questId: "demo-tma-battle", checkpointId: "flow-diary" }
    },
    {
      id: "submission-bounty",
      name: "Submission bounty",
      category: "Bounty",
      description: "Large reward unlocked only after you confirm the work has actually been submitted.",
      condition: { questId: "demo-tma-battle", checkpointId: "submitted" }
    }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function buildDefaultQuest(id, title, kind) {
    return {
      id,
      title,
      kind,
      status: "not started",
      percent: 0,
      checkpoints: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  function defaultState() {
    return {
      version: 1,
      player: {
        xp: 0,
        gold: 75,
        level: 1,
        submittedDrafts: 0
      },
      quests: {
        "demo-tma-battle": buildDefaultQuest("demo-tma-battle", "Tiny fake TMA battle", "academic"),
        "domestic-demo": buildDefaultQuest("domestic-demo", "Domestic quest demo", "domestic"),
        "training-demo": buildDefaultQuest("training-demo", "Notebook Shrine training demo", "training")
      },
      rewards: {},
      customRewards: [],
      history: []
    };
  }

  function normaliseState(rawState) {
    const base = defaultState();
    const state = { ...base, ...(rawState || {}) };
    state.player = { ...base.player, ...(state.player || {}) };
    state.quests = { ...base.quests, ...(state.quests || {}) };
    state.rewards = state.rewards || {};
    state.customRewards = state.customRewards || [];
    state.history = state.history || [];
    state.player.level = calculateLevel(state.player.xp);
    return state;
  }

  function loadState() {
    try {
      return normaliseState(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch {
      return defaultState();
    }
  }

  function saveState(state) {
    state.player.level = calculateLevel(state.player.xp);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("esslay-state-changed", { detail: state }));
    return state;
  }

  function calculateLevel(xp) {
    return Math.max(1, Math.floor((Number(xp) || 0) / 100) + 1);
  }

  function checkpointList(questId) {
    return clone(checkpointDefinitions[questId] || []);
  }

  function allRewards() {
    const state = loadState();
    return [...clone(rewardDefinitions), ...clone(state.customRewards)];
  }

  function ensureQuest(state, questId) {
    if (!state.quests[questId]) {
      state.quests[questId] = buildDefaultQuest(questId, questId, "custom");
    }
    return state.quests[questId];
  }

  function recalculateQuest(quest, questId) {
    const defs = checkpointDefinitions[questId] || [];
    const doneCount = defs.filter((definition) => quest.checkpoints?.[definition.id]?.done).length;
    quest.percent = defs.length ? Math.round((doneCount / defs.length) * 100) : 0;
    quest.updatedAt = new Date().toISOString();

    if (quest.checkpoints?.submitted?.done) {
      quest.status = "submitted";
    } else if (doneCount > 0) {
      quest.status = "in progress";
    } else {
      quest.status = quest.status || "not started";
    }
  }

  function addHistory(state, entry) {
    state.history.unshift({ ...entry, at: new Date().toISOString() });
    state.history = state.history.slice(0, 80);
  }

  function completeCheckpoint(questId, checkpointId, options = {}) {
    const state = loadState();
    const quest = ensureQuest(state, questId);
    const definition = (checkpointDefinitions[questId] || []).find((item) => item.id === checkpointId);

    if (!definition) {
      return { ok: false, changed: false, message: "Checkpoint not found.", state };
    }

    if (quest.checkpoints[checkpointId]?.done) {
      return { ok: true, changed: false, message: `${definition.label} was already complete.`, state };
    }

    const xp = Number(options.xp ?? definition.xp ?? 10);
    const gold = Number(options.gold ?? definition.gold ?? 0);

    quest.checkpoints[checkpointId] = {
      done: true,
      label: definition.label,
      xp,
      gold,
      completedAt: new Date().toISOString(),
      note: options.note || definition.note || ""
    };

    if (checkpointId === "submitted") {
      state.player.submittedDrafts += 1;
    }

    state.player.xp += xp;
    state.player.gold += gold;
    recalculateQuest(quest, questId);
    addHistory(state, { type: "checkpoint-complete", questId, checkpointId, label: definition.label, xp, gold });
    saveState(state);

    return { ok: true, changed: true, message: `${definition.label} complete. +${xp} XP, +${gold} gold.`, state };
  }

  function setQuestStatus(questId, status) {
    const state = loadState();
    const quest = ensureQuest(state, questId);
    quest.status = status;
    quest.updatedAt = new Date().toISOString();
    addHistory(state, { type: "quest-status", questId, status });
    saveState(state);
    return state;
  }

  function isConditionMet(condition, state = loadState()) {
    if (!condition) return false;
    const quest = state.quests?.[condition.questId];
    return Boolean(quest?.checkpoints?.[condition.checkpointId]?.done);
  }

  function rewardStatus(reward, state = loadState()) {
    const claimed = Boolean(state.rewards?.[reward.id]?.claimed);
    const unlocked = isConditionMet(reward.condition, state);
    return { claimed, unlocked, blocked: !unlocked, claimable: unlocked && !claimed };
  }

  function claimReward(rewardId) {
    const state = loadState();
    const reward = [...rewardDefinitions, ...state.customRewards].find((item) => item.id === rewardId);

    if (!reward) {
      return { ok: false, changed: false, message: "Reward not found.", state };
    }

    const status = rewardStatus(reward, state);
    if (status.blocked) {
      return { ok: false, changed: false, message: `${reward.name} is still blocked. Complete the linked checkpoint first.`, state };
    }

    if (status.claimed) {
      return { ok: true, changed: false, message: `${reward.name} was already claimed.`, state };
    }

    state.rewards[reward.id] = {
      claimed: true,
      claimedAt: new Date().toISOString(),
      name: reward.name,
      category: reward.category
    };
    addHistory(state, { type: "reward-claimed", rewardId, name: reward.name, category: reward.category });
    saveState(state);
    return { ok: true, changed: true, message: `${reward.name} claimed.`, state };
  }

  function addCustomReward(reward) {
    const state = loadState();
    const id = `custom-reward-${Date.now()}`;
    state.customRewards.push({
      id,
      name: reward.name || "Custom reward",
      category: reward.category || "Reward",
      description: reward.description || "Custom real-life reward.",
      link: reward.link || "",
      condition: reward.condition || { questId: "demo-tma-battle", checkpointId: "submitted" }
    });
    addHistory(state, { type: "custom-reward-added", rewardId: id, name: reward.name || "Custom reward" });
    saveState(state);
    return { id, state };
  }

  function resetGameState() {
    const state = defaultState();
    saveState(state);
    return state;
  }

  function exportState() {
    return JSON.stringify(loadState(), null, 2);
  }

  function importState(jsonText) {
    const parsed = JSON.parse(jsonText);
    const state = normaliseState(parsed);
    saveState(state);
    return state;
  }

  return {
    STORAGE_KEY,
    loadState,
    saveState,
    resetGameState,
    checkpointList,
    completeCheckpoint,
    setQuestStatus,
    allRewards,
    rewardStatus,
    claimReward,
    addCustomReward,
    exportState,
    importState,
    calculateLevel
  };
})();
