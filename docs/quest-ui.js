const EsslayQuestUI = (() => {
  function formatStatus(status) {
    return status ? status.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Not started";
  }

  function renderPlayerPanel(target = document) {
    const state = EsslayGame.loadState();
    target.querySelectorAll("[data-esslay-xp]").forEach((node) => { node.textContent = state.player.xp; });
    target.querySelectorAll("[data-esslay-gold]").forEach((node) => { node.textContent = state.player.gold; });
    target.querySelectorAll("[data-esslay-level]").forEach((node) => { node.textContent = state.player.level; });
    target.querySelectorAll("[data-esslay-submitted]").forEach((node) => { node.textContent = state.player.submittedDrafts; });
  }

  function renderQuestProgress(questId, target = document) {
    const state = EsslayGame.loadState();
    const quest = state.quests[questId];
    if (!quest) return;

    target.querySelectorAll(`[data-quest-status="${questId}"]`).forEach((node) => { node.textContent = formatStatus(quest.status); });
    target.querySelectorAll(`[data-quest-percent="${questId}"]`).forEach((node) => { node.textContent = `${quest.percent}%`; });
    target.querySelectorAll(`[data-quest-progress-bar="${questId}"]`).forEach((node) => { node.style.width = `${quest.percent}%`; });
  }

  function wireCheckpointButtons(questId, target = document) {
    const buttons = target.querySelectorAll("[data-checkpoint-id]");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const checkpointId = button.dataset.checkpointId;
        const result = EsslayGame.completeCheckpoint(questId, checkpointId);
        renderAll(target);
        announce(result.message, target);
      });
    });
  }

  function renderCheckpointButtons(questId, target = document) {
    const state = EsslayGame.loadState();
    const quest = state.quests[questId];
    target.querySelectorAll("[data-checkpoint-id]").forEach((button) => {
      const checkpointId = button.dataset.checkpointId;
      const done = Boolean(quest?.checkpoints?.[checkpointId]?.done);
      button.dataset.done = done ? "true" : "false";
      button.setAttribute("aria-pressed", done ? "true" : "false");
      if (done) {
        button.classList.add("checkpoint-complete");
      } else {
        button.classList.remove("checkpoint-complete");
      }
    });
  }

  function renderRewards(target = document) {
    const rewardGrid = target.querySelector("[data-reward-grid]");
    if (!rewardGrid) return;

    const state = EsslayGame.loadState();
    rewardGrid.innerHTML = "";

    EsslayGame.allRewards().forEach((reward) => {
      const status = EsslayGame.rewardStatus(reward, state);
      const card = document.createElement("article");
      card.className = "reward-card";
      card.dataset.blocked = status.blocked ? "true" : "false";
      card.dataset.claimed = status.claimed ? "true" : "false";
      card.innerHTML = `
        <div>
          <strong>${reward.name}</strong>
          <span>${reward.category}</span>
          <p>${reward.description}</p>
        </div>
        <button type="button" data-reward-id="${reward.id}">${status.claimed ? "Claimed" : status.blocked ? "Blocked" : "Claim reward"}</button>
      `;
      card.querySelector("button").addEventListener("click", () => {
        const result = EsslayGame.claimReward(reward.id);
        renderAll(target);
        announce(result.message, target);
      });
      rewardGrid.appendChild(card);
    });
  }

  function renderHistory(target = document) {
    const historyList = target.querySelector("[data-history-list]");
    if (!historyList) return;

    const state = EsslayGame.loadState();
    historyList.innerHTML = "";
    state.history.slice(0, 8).forEach((entry) => {
      const item = document.createElement("li");
      const label = entry.label || entry.name || entry.status || entry.type;
      const reward = entry.xp || entry.gold ? ` · +${entry.xp || 0} XP, +${entry.gold || 0} gold` : "";
      item.textContent = `${label}${reward}`;
      historyList.appendChild(item);
    });
  }

  function announce(message, target = document) {
    const node = target.querySelector("[data-quest-announcement]");
    if (node) node.textContent = message;
  }

  function renderAll(target = document) {
    renderPlayerPanel(target);
    ["demo-tma-battle", "domestic-demo", "training-demo"].forEach((questId) => renderQuestProgress(questId, target));
    ["demo-tma-battle", "domestic-demo", "training-demo"].forEach((questId) => renderCheckpointButtons(questId, target));
    renderRewards(target);
    renderHistory(target);
  }

  function init(options = {}) {
    const questId = options.questId || document.body.dataset.questId;
    if (questId) wireCheckpointButtons(questId);
    renderAll();
    window.addEventListener("esslay-state-changed", () => renderAll());
  }

  return { init, renderAll, announce };
})();
