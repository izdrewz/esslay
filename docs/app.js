const STORAGE_KEY = "esslay-game-save-v1";

const defaultState = {
  player: { xp: 0, gold: 0 },
  assignment: {
    name: "",
    module: "",
    deadline: "",
    targetWords: "",
    question: "",
    guidance: "",
    sources: "",
    keywords: []
  },
  battleQuests: [
    { id: uid(), title: "TMA file selected", detail: "Choose or paste the task file details.", xp: 20, gold: 10, loot: "Map fragment", complete: false },
    { id: uid(), title: "Task question extracted", detail: "Save the exact task question.", xp: 30, gold: 15, loot: "Quest scroll", complete: false },
    { id: uid(), title: "Key command words marked", detail: "Add words such as discuss, explain, describe, compare, challenges, support.", xp: 30, gold: 15, loot: "Focus charm", complete: false },
    { id: uid(), title: "Guidance and marking criteria extracted", detail: "Save guidance, learning outcomes, or tutor notes.", xp: 35, gold: 20, loot: "Criteria lens", complete: false },
    { id: uid(), title: "Quote bank started", detail: "Add the first useful source geode.", xp: 35, gold: 20, loot: "Unopened geode", complete: false },
    { id: uid(), title: "Mind map completed", detail: "Turn task ideas into a shape you can use.", xp: 45, gold: 30, loot: "Battle compass", complete: false },
    { id: uid(), title: "Template plan created", detail: "Build the answer skeleton before drafting.", xp: 50, gold: 35, loot: "Plan blade", complete: false },
    { id: uid(), title: "Introduction draft created", detail: "Write a working opening.", xp: 40, gold: 25, loot: "Opening rune", complete: false },
    { id: uid(), title: "Main paragraph 1 created", detail: "Draft the first main point.", xp: 45, gold: 30, loot: "Paragraph shard", complete: false },
    { id: uid(), title: "Main paragraph 2 created", detail: "Draft the next main point.", xp: 45, gold: 30, loot: "Paragraph shard", complete: false },
    { id: uid(), title: "Citations added", detail: "Open quote geodes and place evidence into the draft.", xp: 60, gold: 40, loot: "Citation crystal", complete: false },
    { id: uid(), title: "Flow diary completed", detail: "Check sentence flow, coherence, and relevance.", xp: 70, gold: 50, loot: "Polished gem", complete: false }
  ],
  quotes: [],
  notes: [],
  domestic: [],
  rewards: [],
  homeItems: [],
  loot: [],
  draftSentences: [],
  currentSentence: 0,
  repoLink: "",
  calendarLink: "",
  personalDictionary: []
};

let state = loadState();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultState);
  try {
    return mergeState(structuredClone(defaultState), JSON.parse(saved));
  } catch {
    return structuredClone(defaultState);
  }
}

function mergeState(base, saved) {
  return { ...base, ...saved, assignment: { ...base.assignment, ...(saved.assignment || {}) }, player: { ...base.player, ...(saved.player || {}) } };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrateInputs() {
  $("#assignment-name").value = state.assignment.name || "";
  $("#assignment-module").value = state.assignment.module || "";
  $("#assignment-deadline").value = state.assignment.deadline || "";
  $("#target-words").value = state.assignment.targetWords || "";
  $("#task-question").value = state.assignment.question || "";
  $("#task-guidance").value = state.assignment.guidance || "";
  $("#task-sources").value = state.assignment.sources || "";
  $("#repo-link").value = state.repoLink || "";
  $("#calendar-link").value = state.calendarLink || "";
}

function bindAutosave() {
  const assignmentFields = [
    ["#assignment-name", "name"],
    ["#assignment-module", "module"],
    ["#assignment-deadline", "deadline"],
    ["#target-words", "targetWords"],
    ["#task-question", "question"],
    ["#task-guidance", "guidance"],
    ["#task-sources", "sources"]
  ];

  assignmentFields.forEach(([selector, key]) => {
    $(selector).addEventListener("input", (event) => {
      state.assignment[key] = event.target.value;
      if (key === "question" && event.target.value.trim()) autoCompleteQuest("Task question extracted");
      if (key === "guidance" && event.target.value.trim()) autoCompleteQuest("Guidance and marking criteria extracted");
      saveState();
      render();
    });
  });

  $("#repo-link").addEventListener("input", (event) => {
    state.repoLink = event.target.value;
    saveState();
  });

  $("#calendar-link").addEventListener("input", (event) => {
    state.calendarLink = event.target.value;
    saveState();
  });
}

function bindTabs() {
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((item) => item.classList.remove("active"));
      $$(".panel").forEach((panel) => panel.classList.remove("active-panel"));
      tab.classList.add("active");
      $(`#${tab.dataset.tab}`).classList.add("active-panel");
    });
  });
}

function bindButtons() {
  $("#add-keyword").addEventListener("click", addKeyword);
  $("#add-quote").addEventListener("click", addQuote);
  $("#add-note").addEventListener("click", addNote);
  $("#add-domestic").addEventListener("click", addDomesticQuest);
  $("#add-reward").addEventListener("click", addReward);
  $("#add-home-item").addEventListener("click", addHomeItem);
  $("#split-draft").addEventListener("click", splitDraft);
  $("#prev-sentence").addEventListener("click", () => moveSentence(-1));
  $("#next-sentence").addEventListener("click", () => moveSentence(1));
  $("#save-sentence").addEventListener("click", saveSentenceEdit);
  $("#check-sentence").addEventListener("click", checkCurrentSentence);
  $("#export-draft").addEventListener("click", exportDraft);
  $("#export-data").addEventListener("click", exportData);
  $("#copy-summary").addEventListener("click", copySummary);
  $("#import-button").addEventListener("click", importData);
}

function addKeyword() {
  const input = $("#keyword-input");
  const value = input.value.trim();
  if (!value) return;
  if (!state.assignment.keywords.includes(value)) state.assignment.keywords.push(value);
  input.value = "";
  autoCompleteQuest("Key command words marked");
  award(8, 3, null, "Keyword added");
  saveState();
  render();
}

function addQuote() {
  const source = $("#quote-source").value.trim();
  const area = $("#quote-area").value.trim();
  const text = $("#quote-text").value.trim();
  const purpose = $("#quote-purpose").value.trim();
  if (!text) return toast("Add the quote or evidence first.");

  state.quotes.push({ id: uid(), source, area, text, purpose, opened: false, sold: false });
  clearFields(["#quote-source", "#quote-area", "#quote-text", "#quote-purpose"]);
  autoCompleteQuest("Quote bank started");
  award(20, 10, "Unopened geode", "Quote geode added");
  saveState();
  render();
}

function addNote() {
  const title = $("#note-title").value.trim();
  const type = $("#note-type").value;
  const body = $("#note-body").value.trim();
  if (!title && !body) return toast("Add a note title or note text first.");

  state.notes.push({ id: uid(), title: title || "Untitled note", type, body, date: new Date().toISOString() });
  clearFields(["#note-title", "#note-body"]);
  award(25, 8, "Training token", "Training note completed");
  saveState();
  render();
}

function addDomesticQuest() {
  const title = $("#domestic-title").value.trim();
  const category = $("#domestic-category").value;
  const xp = Number($("#domestic-difficulty").value);
  const progress = clamp(Number($("#domestic-progress").value) || 0, 0, 100);
  if (!title) return toast("Add the domestic quest name first.");

  state.domestic.push({ id: uid(), title, category, xp, gold: Math.ceil(xp / 2), progress, complete: progress === 100 });
  clearFields(["#domestic-title"]);
  $("#domestic-progress").value = 0;
  if (progress === 100) award(xp, Math.ceil(xp / 2), "Home spark", "Domestic quest completed");
  saveState();
  render();
}

function addReward() {
  const name = $("#reward-name").value.trim();
  const vibe = $("#reward-vibe").value;
  const cost = Number($("#reward-cost").value) || 0;
  const link = $("#reward-link").value.trim();
  const description = $("#reward-description").value.trim();
  if (!name) return toast("Add the reward name first.");

  state.rewards.push({ id: uid(), name, vibe, cost, link, description, claimed: false });
  clearFields(["#reward-name", "#reward-link", "#reward-description"]);
  saveState();
  render();
}

function addHomeItem() {
  const name = $("#home-item-name").value.trim();
  const cost = Number($("#home-item-cost").value) || 0;
  const image = $("#home-item-image").value.trim();
  const category = $("#home-item-category").value;
  if (!name) return toast("Add the home item name first.");

  state.homeItems.push({ id: uid(), name, cost, image, category, owned: false, displayed: false });
  clearFields(["#home-item-name", "#home-item-image"]);
  saveState();
  render();
}

function completeBattleQuest(id) {
  const quest = state.battleQuests.find((item) => item.id === id);
  if (!quest || quest.complete) return;
  quest.complete = true;
  award(quest.xp, quest.gold, quest.loot, `${quest.title} complete`);
  if (quest.title.includes("draft")) updateDictionaryFromText($("#draft-input").value);
  saveState();
  render();
}

function autoCompleteQuest(title) {
  const quest = state.battleQuests.find((item) => item.title === title);
  if (quest && !quest.complete) completeBattleQuest(quest.id);
}

function updateDomestic(id, progress) {
  const quest = state.domestic.find((item) => item.id === id);
  if (!quest) return;
  const wasComplete = quest.complete;
  quest.progress = clamp(Number(progress) || 0, 0, 100);
  quest.complete = quest.progress === 100;
  if (!wasComplete && quest.complete) award(quest.xp, quest.gold, "Home spark", `${quest.title} completed`);
  saveState();
  render();
}

function openGeode(id) {
  const quote = state.quotes.find((item) => item.id === id);
  if (!quote || quote.opened) return;
  quote.opened = true;
  award(15, 12, "Citation crystal", "Geode opened");
  saveState();
  render();
}

function sellGeode(id) {
  const quote = state.quotes.find((item) => item.id === id);
  if (!quote || quote.sold) return;
  quote.sold = true;
  award(0, quote.opened ? 20 : 8, null, "Geode sold");
  saveState();
  render();
}

function claimReward(id) {
  const reward = state.rewards.find((item) => item.id === id);
  if (!reward || reward.claimed) return;
  if (state.player.gold < reward.cost) return toast("Not enough gold yet.");
  state.player.gold -= reward.cost;
  reward.claimed = true;
  toast(`Reward unlocked: ${reward.name}`);
  saveState();
  render();
}

function buyHomeItem(id) {
  const item = state.homeItems.find((entry) => entry.id === id);
  if (!item || item.owned) return;
  if (state.player.gold < item.cost) return toast("Not enough gold yet.");
  state.player.gold -= item.cost;
  item.owned = true;
  item.displayed = true;
  toast(`Home item unlocked: ${item.name}`);
  saveState();
  render();
}

function toggleDisplayHomeItem(id) {
  const item = state.homeItems.find((entry) => entry.id === id);
  if (!item || !item.owned) return;
  item.displayed = !item.displayed;
  saveState();
  render();
}

function splitDraft() {
  const text = $("#draft-input").value.trim();
  if (!text) return toast("Paste a draft first.");
  state.draftSentences = splitIntoSentences(text);
  state.currentSentence = 0;
  $("#sentence-workbench").classList.remove("hidden");
  updateDictionaryFromText(text);
  award(20, 8, "Draft page", "Draft loaded into diary");
  saveState();
  renderSentenceWorkbench();
  render();
}

function splitIntoSentences(text) {
  const matches = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  return matches.map((sentence) => sentence.trim()).filter(Boolean);
}

function moveSentence(direction) {
  if (!state.draftSentences.length) return;
  saveSentenceEdit(false);
  state.currentSentence = clamp(state.currentSentence + direction, 0, state.draftSentences.length - 1);
  saveState();
  renderSentenceWorkbench();
}

function saveSentenceEdit(showToast = true) {
  if (!state.draftSentences.length) return;
  state.draftSentences[state.currentSentence] = $("#sentence-editor").value.trim();
  updateDictionaryFromText(state.draftSentences[state.currentSentence]);
  saveState();
  if (showToast) toast("Sentence saved.");
}

function checkCurrentSentence() {
  const text = $("#sentence-editor").value.trim();
  const suggestions = checkWriting(text, 32);
  const box = $("#sentence-suggestions");
  if (!suggestions.length) {
    box.innerHTML = `<div class="item suggestion"><p>No review prompts for this sentence.</p></div>`;
    return;
  }
  box.innerHTML = suggestions.map(renderSuggestion).join("");
}

function exportDraft() {
  saveSentenceEdit(false);
  const draft = state.draftSentences.join(" ");
  $("#export-output").textContent = draft;
  navigator.clipboard?.writeText(draft);
  autoCompleteQuest("Flow diary completed");
  toast("Edited draft copied if clipboard access is available.");
  saveState();
  render();
}

function updateDictionaryFromText(text) {
  const words = (text || "").toLowerCase().match(/\b[a-z][a-z'-]{2,}\b/g) || [];
  words.forEach((word) => {
    if (!state.personalDictionary.includes(word) && state.personalDictionary.length < 2500) {
      state.personalDictionary.push(word);
    }
  });
}

function checkWriting(text, maxWords) {
  const found = [];
  const repeated = /\b([A-Za-z]+)\s+\1\b/gi;
  for (const match of text.matchAll(repeated)) {
    found.push({ rule: "Repeated word", message: `'${match[1]}' appears twice in a row.`, suggestion: `Remove one '${match[1]}' unless it is intentional.`, excerpt: match[0] });
  }
  const fillers = new Map([
    ["basically", "Use a more precise word or remove it."],
    ["actually", "Remove it unless it changes the meaning."],
    ["really", "Replace it with a specific description."],
    ["very", "Replace it with a stronger or more exact word."],
    ["in order to", "Use 'to' unless the longer phrase is needed."],
    ["it is important to note that", "State the point directly."],
    ["due to the fact that", "Use 'because'."]
  ]);
  fillers.forEach((suggestion, phrase) => {
    const pattern = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "gi");
    for (const match of text.matchAll(pattern)) {
      found.push({ rule: "Filler phrase", message: `'${match[0]}' may weaken the sentence.`, suggestion, excerpt: match[0] });
    }
  });
  const words = text.match(/\b[\w']+\b/g) || [];
  if (words.length > maxWords) found.push({ rule: "Long sentence", message: `This sentence has ${words.length} words.`, suggestion: "Split it or make the cause and effect easier to follow.", excerpt: shorten(text) });
  if ((text.match(/,/g) || []).length >= 3) found.push({ rule: "List-heavy sentence", message: "This sentence may be listing more than explaining.", suggestion: "Check whether two examples are enough and use the saved space for explanation.", excerpt: shorten(text) });
  return found;
}

function exportData() {
  saveState();
  const payload = JSON.stringify(state, null, 2);
  $("#export-output").textContent = payload;
  navigator.clipboard?.writeText(payload);
  toast("Save data copied if clipboard access is available. You can paste it into the phone version.");
}

function copySummary() {
  const summary = buildSummary();
  $("#export-output").textContent = summary;
  navigator.clipboard?.writeText(summary);
  toast("Summary copied if clipboard access is available.");
}

function importData() {
  const text = $("#import-data").value.trim();
  if (!text) return toast("Paste exported JSON first.");
  try {
    state = mergeState(structuredClone(defaultState), JSON.parse(text));
    saveState();
    hydrateInputs();
    render();
    renderSentenceWorkbench();
    toast("Save data imported.");
  } catch {
    toast("That import data was not valid JSON.");
  }
}

function buildSummary() {
  const lines = [];
  lines.push(`# ${state.assignment.name || "Untitled assignment"}`);
  if (state.assignment.module) lines.push(`Module: ${state.assignment.module}`);
  if (state.assignment.deadline) lines.push(`Deadline: ${state.assignment.deadline}`);
  if (state.assignment.targetWords) lines.push(`Target words: ${state.assignment.targetWords}`);
  lines.push("\n## Task question\n" + (state.assignment.question || ""));
  lines.push("\n## Guidance and marking criteria\n" + (state.assignment.guidance || ""));
  lines.push("\n## Keywords\n" + state.assignment.keywords.join(", "));
  lines.push("\n## Quote bank");
  state.quotes.forEach((quote, index) => lines.push(`${index + 1}. ${quote.source || "Unknown source"} / ${quote.area || "Unplaced"}: ${quote.text}\nPurpose: ${quote.purpose || ""}`));
  lines.push("\n## Completed checkpoints");
  state.battleQuests.filter((quest) => quest.complete).forEach((quest) => lines.push(`- ${quest.title}`));
  return lines.join("\n");
}

function award(xp, gold, lootName, reason) {
  state.player.xp += xp;
  state.player.gold += gold;
  if (lootName) state.loot.push({ id: uid(), name: lootName, reason, date: new Date().toISOString() });
  toast(`${reason}: +${xp} XP, +${gold} gold${lootName ? `, loot: ${lootName}` : ""}`);
}

function levelFromXp(xp) {
  return Math.floor(xp / 100) + 1;
}

function render() {
  renderStats();
  renderKeywords();
  renderBattleQuests();
  renderQuotes();
  renderNotes();
  renderDomestic();
  renderRewards();
  renderHome();
}

function renderStats() {
  const level = levelFromXp(state.player.xp);
  const levelStart = (level - 1) * 100;
  const nextLevel = level * 100;
  const progress = ((state.player.xp - levelStart) / 100) * 100;
  $("#level-line").textContent = `Level ${level} ${level < 5 ? "apprentice planner" : level < 10 ? "battle scholar" : "TMA knight"}`;
  $("#xp-total").textContent = state.player.xp;
  $("#gold-total").textContent = state.player.gold;
  $("#loot-total").textContent = state.loot.length;
  $("#reward-total").textContent = state.rewards.filter((reward) => reward.claimed).length;
  $("#next-level-text").textContent = `${state.player.xp - levelStart} / ${nextLevel - levelStart} XP`;
  $("#level-progress").style.width = `${clamp(progress, 0, 100)}%`;
}

function renderKeywords() {
  $("#keyword-list").innerHTML = state.assignment.keywords.map((keyword) => `<button class="chip" type="button" data-delete-keyword="${escapeHtml(keyword)}">${escapeHtml(keyword)} ×</button>`).join("");
  $$('[data-delete-keyword]').forEach((button) => button.addEventListener("click", () => {
    state.assignment.keywords = state.assignment.keywords.filter((keyword) => keyword !== button.dataset.deleteKeyword);
    saveState();
    render();
  }));
}

function renderBattleQuests() {
  $("#battle-quests").innerHTML = state.battleQuests.map((quest) => `
    <article class="quest ${quest.complete ? "complete" : ""}">
      <div class="quest-head"><div><div class="quest-title">${escapeHtml(quest.title)}</div><p>${escapeHtml(quest.detail)}</p></div><span class="badge">${quest.xp} XP / ${quest.gold} gold</span></div>
      <div class="quest-actions">
        <button class="mini-button" type="button" data-complete-battle="${quest.id}" ${quest.complete ? "disabled" : ""}>${quest.complete ? "Complete" : "Mark complete"}</button>
        <span class="badge">Loot: ${escapeHtml(quest.loot)}</span>
      </div>
    </article>
  `).join("");
  $$('[data-complete-battle]').forEach((button) => button.addEventListener("click", () => completeBattleQuest(button.dataset.completeBattle)));
}

function renderQuotes() {
  $("#quote-list").innerHTML = state.quotes.map((quote) => `
    <article class="item ${quote.opened ? "owned" : ""}">
      <div class="item-head"><div><div class="item-title">${escapeHtml(quote.source || "Quote geode")}</div><p>${escapeHtml(quote.area || "Unplaced")}</p></div><span class="badge">${quote.opened ? "Opened" : "Unopened geode"}</span></div>
      <p>${escapeHtml(quote.text)}</p>
      <p class="helper">${escapeHtml(quote.purpose || "No purpose note yet.")}</p>
      <div class="item-actions">
        <button class="mini-button" type="button" data-open-geode="${quote.id}" ${quote.opened ? "disabled" : ""}>Open geode</button>
        <button class="mini-button" type="button" data-sell-geode="${quote.id}" ${quote.sold ? "disabled" : ""}>Sell</button>
        <button class="mini-button delete-button" type="button" data-delete-quote="${quote.id}">Delete</button>
      </div>
    </article>
  `).join("");
  bindListButtons("open-geode", openGeode);
  bindListButtons("sell-geode", sellGeode);
  bindDelete("quote", "quotes");
}

function renderNotes() {
  $("#note-list").innerHTML = state.notes.map((note) => `
    <article class="item"><div class="item-title">${escapeHtml(note.title)}</div><span class="badge">${escapeHtml(note.type)}</span><p>${escapeHtml(shorten(note.body, 180))}</p><button class="mini-button delete-button" type="button" data-delete-note="${note.id}">Delete</button></article>
  `).join("");
  bindDelete("note", "notes");
}

function renderDomestic() {
  $("#domestic-list").innerHTML = state.domestic.map((quest) => `
    <article class="quest ${quest.complete ? "complete" : ""}">
      <div class="quest-head"><div><div class="quest-title">${escapeHtml(quest.title)}</div><p>${escapeHtml(quest.category)}</p></div><span class="badge">${quest.xp} XP</span></div>
      <label>Progress %<input type="number" min="0" max="100" value="${quest.progress}" data-domestic-progress="${quest.id}"></label>
      <div class="quest-actions"><button class="mini-button" type="button" data-domestic-done="${quest.id}">Mark 100%</button><button class="mini-button delete-button" type="button" data-delete-domestic="${quest.id}">Delete</button></div>
    </article>
  `).join("");
  $$('[data-domestic-progress]').forEach((input) => input.addEventListener("change", () => updateDomestic(input.dataset.domesticProgress, input.value)));
  $$('[data-domestic-done]').forEach((button) => button.addEventListener("click", () => updateDomestic(button.dataset.domesticDone, 100)));
  bindDelete("domestic", "domestic");
}

function renderRewards() {
  $("#reward-list").innerHTML = state.rewards.map((reward) => `
    <article class="item ${reward.claimed ? "owned" : ""}"><div class="item-head"><div><div class="item-title">${escapeHtml(reward.name)}</div><p>${escapeHtml(reward.vibe)}</p></div><span class="badge">${reward.cost} gold</span></div><p>${escapeHtml(reward.description || "")}</p>${reward.link ? `<p><a href="${escapeAttr(reward.link)}" target="_blank" rel="noreferrer">Open link</a></p>` : ""}<div class="item-actions"><button class="mini-button" type="button" data-claim-reward="${reward.id}" ${reward.claimed ? "disabled" : ""}>Unlock</button><button class="mini-button delete-button" type="button" data-delete-reward="${reward.id}">Delete</button></div></article>
  `).join("");
  bindListButtons("claim-reward", claimReward);
  bindDelete("reward", "rewards");
}

function renderHome() {
  const displayed = state.homeItems.filter((item) => item.owned && item.displayed);
  const slots = Array.from({ length: 8 }, (_, index) => displayed[index]);
  $("#room").innerHTML = slots.map((item) => `<div class="room-slot">${item ? renderRoomItem(item) : "Empty slot"}</div>`).join("");
  $("#home-shop").innerHTML = state.homeItems.map((item) => `
    <article class="item ${item.owned ? "owned" : ""}"><div class="item-head"><div><div class="item-title">${escapeHtml(item.name)}</div><p>${escapeHtml(item.category)}</p></div><span class="badge">${item.cost} gold</span></div>${item.image ? `<img class="item-image" src="${escapeAttr(item.image)}" alt="">` : ""}<div class="item-actions"><button class="mini-button" type="button" data-buy-home="${item.id}" ${item.owned ? "disabled" : ""}>Buy</button><button class="mini-button" type="button" data-display-home="${item.id}" ${item.owned ? "" : "disabled"}>${item.displayed ? "Hide" : "Display"}</button><button class="mini-button delete-button" type="button" data-delete-home="${item.id}">Delete</button></div></article>
  `).join("");
  bindListButtons("buy-home", buyHomeItem);
  bindListButtons("display-home", toggleDisplayHomeItem);
  bindDelete("home", "homeItems");
}

function renderRoomItem(item) {
  if (item.image) return `<div><img src="${escapeAttr(item.image)}" alt=""><div>${escapeHtml(item.name)}</div></div>`;
  return `<div>✦<br>${escapeHtml(item.name)}</div>`;
}

function renderSentenceWorkbench() {
  if (!state.draftSentences.length) return;
  $("#sentence-workbench").classList.remove("hidden");
  $("#sentence-count").textContent = `Sentence ${state.currentSentence + 1} of ${state.draftSentences.length}`;
  $("#sentence-editor").value = state.draftSentences[state.currentSentence] || "";
  $("#sentence-suggestions").innerHTML = "";
}

function renderSuggestion(item) {
  return `<article class="item suggestion"><div class="item-title">${escapeHtml(item.rule)}</div><p>${escapeHtml(item.message)}</p><p class="helper">Suggestion: ${escapeHtml(item.suggestion)}</p><p>${escapeHtml(item.excerpt)}</p></article>`;
}

function bindListButtons(name, handler) {
  $$(`[data-${name}]`).forEach((button) => button.addEventListener("click", () => handler(button.dataset[toCamel(name)])));
}

function bindDelete(kind, stateKey) {
  $$(`[data-delete-${kind}]`).forEach((button) => button.addEventListener("click", () => {
    state[stateKey] = state[stateKey].filter((item) => item.id !== button.dataset[toCamel(`delete-${kind}`)]);
    saveState();
    render();
  }));
}

function toCamel(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function clearFields(selectors) {
  selectors.forEach((selector) => { $(selector).value = ""; });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function shorten(text, limit = 120) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  return clean.length <= limit ? clean : `${clean.slice(0, limit - 1)}…`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function toast(message) {
  const old = document.querySelector(".toast");
  if (old) old.remove();
  const box = document.createElement("div");
  box.className = "toast";
  box.textContent = message;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3200);
}

hydrateInputs();
bindTabs();
bindAutosave();
bindButtons();
render();
renderSentenceWorkbench();
