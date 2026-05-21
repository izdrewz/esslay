const STORAGE_KEY = "esslay-game-save-v2";
const LEGACY_STORAGE_KEY = "esslay-game-save-v1";

const dictionaryChapters = [
  "approvedWording",
  "usefulPhrases",
  "sentencePatterns",
  "sourceLinkedTerms",
  "avoidedWording",
  "ignoreWords",
  "moduleVocabulary",
  "finishedDraftWording"
];

const sectionKeys = [
  "taskQuestion",
  "commandWord",
  "guidance",
  "learningOutcome",
  "markingCriteria",
  "wordCount",
  "sourceRequirement",
  "quote"
];

const sectionLabels = {
  taskQuestion: "Task question",
  commandWord: "Key task words",
  guidance: "Guidance",
  learningOutcome: "Learning outcomes",
  markingCriteria: "Marking criteria",
  wordCount: "Word count",
  sourceRequirement: "Source requirements",
  quote: "Useful source areas"
};

const defaultAcademicQuests = [
  { key: "file", title: "TMA/task file selected", detail: "Add the task file or pasted task material.", xp: 10, gold: 5, status: "not started", progress: 0, loot: "Map fragment" },
  { key: "task", title: "Task question captured", detail: "Highlight or paste the exact task question.", xp: 10, gold: 5, status: "not started", progress: 0, loot: "Quest scroll" },
  { key: "keywords", title: "Task words identified", detail: "Highlight command words and key content words.", xp: 10, gold: 5, status: "not started", progress: 0, loot: "Focus charm" },
  { key: "guidance", title: "Guidance and criteria captured", detail: "Highlight guidance, outcomes, criteria, word count, and source rules.", xp: 10, gold: 5, status: "not started", progress: 0, loot: "Criteria lens" },
  { key: "quoteBank", title: "Quote bank built", detail: "Add useful quotes or source areas as geodes.", xp: 10, gold: 5, status: "not started", progress: 0, loot: "Unopened geode" },
  { key: "mindMap", title: "Mind map completed", detail: "Build rough answer shape and idea links.", xp: 10, gold: 5, status: "not started", progress: 0, loot: "Battle compass" },
  { key: "templatePlan", title: "Template plan created", detail: "Create the paragraph-by-paragraph structure.", xp: 10, gold: 5, status: "not started", progress: 0, loot: "Plan blade" },
  { key: "intro", title: "Introduction drafted", detail: "Draft the introduction or opening framing.", xp: 10, gold: 5, status: "not started", progress: 0, loot: "Opening rune" },
  { key: "paragraphs", title: "Main paragraphs drafted", detail: "Draft the main body paragraphs.", xp: 10, gold: 5, status: "not started", progress: 0, loot: "Paragraph shard" },
  { key: "citations", title: "Citations added and checked", detail: "Open source geodes and place/check citations.", xp: 10, gold: 5, status: "not started", progress: 0, loot: "Citation crystal" },
  { key: "flow", title: "Flow and relevance checked", detail: "Use the diary for sentence-level flow and relevance checks.", xp: 10, gold: 5, status: "not started", progress: 0, loot: "Polished gem" },
  { key: "finalReview", title: "Final review completed", detail: "Do the last task-fit, source, word count, and submission-readiness check.", xp: 10, gold: 5, status: "not started", progress: 0, loot: "Review seal" },
  { key: "submitted", title: "Submitted", detail: "Only mark finished after you confirm the assignment has been submitted.", xp: 100, gold: 50, status: "not started", progress: 0, loot: "Submission crown" }
];

const starterHomeItems = [
  { id: "starter-desk", name: "Study Desk", category: "Desk", cost: 0, builtIn: true, owned: true, displayed: true, position: 0, icon: "▣" },
  { id: "starter-bed", name: "Rest Nook", category: "Comfort", cost: 0, builtIn: true, owned: true, displayed: true, position: 1, icon: "▤" },
  { id: "starter-lamp", name: "Focus Lamp", category: "Decor", cost: 15, builtIn: true, owned: false, displayed: false, position: null, icon: "✦" },
  { id: "starter-rug", name: "Quest Rug", category: "Decor", cost: 20, builtIn: true, owned: false, displayed: false, position: null, icon: "▧" },
  { id: "starter-shelf", name: "Geode Shelf", category: "Loot display", cost: 25, builtIn: true, owned: false, displayed: false, position: null, icon: "▥" },
  { id: "starter-banner", name: "Battle Banner", category: "Wall", cost: 30, builtIn: true, owned: false, displayed: false, position: null, icon: "⚑" }
];

const defaultState = {
  schemaVersion: 2,
  player: { xp: 0, gold: 0 },
  xpDefaults: { minimal: 10, prep: 10, checkpoint: 10, submitted: 100 },
  assignment: { name: "", module: "", deadline: "", targetWords: "" },
  sections: Object.fromEntries(sectionKeys.map((key) => [key, []])),
  documents: [],
  activeDocumentId: null,
  academicQuests: defaultAcademicQuests,
  quotes: [],
  notes: [],
  domestic: [],
  rewards: [],
  homeItems: starterHomeItems,
  loot: [],
  mindMap: "",
  templatePlan: "",
  draft: "",
  draftSentences: [],
  currentSentence: 0,
  sentenceNotes: {},
  dictionary: Object.fromEntries(dictionaryChapters.map((chapter) => [chapter, []])),
  integration: { tmazingLink: "", workbenchLink: "", repoLink: "", calendarLink: "" }
};

let state = loadState();
let uploadedHomeImage = "";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return clone(defaultState);
  try {
    return mergeState(clone(defaultState), JSON.parse(raw));
  } catch {
    return clone(defaultState);
  }
}

function mergeState(base, saved) {
  const merged = { ...base, ...saved };
  merged.player = { ...base.player, ...(saved.player || {}) };
  merged.xpDefaults = { ...base.xpDefaults, ...(saved.xpDefaults || {}) };
  merged.assignment = { ...base.assignment, ...(saved.assignment || {}) };
  merged.sections = { ...base.sections, ...(saved.sections || {}) };
  merged.integration = { ...base.integration, ...(saved.integration || {}) };
  merged.dictionary = { ...base.dictionary, ...(saved.dictionary || {}) };
  merged.academicQuests = mergeQuests(base.academicQuests, saved.academicQuests || saved.battleQuests || []);
  merged.homeItems = mergeHomeItems(base.homeItems, saved.homeItems || []);
  merged.documents = saved.documents || [];
  merged.quotes = saved.quotes || [];
  merged.notes = saved.notes || [];
  merged.domestic = saved.domestic || [];
  merged.rewards = saved.rewards || [];
  merged.loot = saved.loot || [];
  merged.draft = saved.draft || "";
  merged.mindMap = saved.mindMap || "";
  merged.templatePlan = saved.templatePlan || "";
  merged.draftSentences = saved.draftSentences || [];
  merged.sentenceNotes = saved.sentenceNotes || {};
  merged.currentSentence = saved.currentSentence || 0;
  if (!merged.sections.taskQuestion.length && saved.assignment?.question) merged.sections.taskQuestion.push(makeHighlight("Migrated task question", saved.assignment.question));
  if (!merged.sections.guidance.length && saved.assignment?.guidance) merged.sections.guidance.push(makeHighlight("Migrated guidance", saved.assignment.guidance));
  if (!merged.sections.sourceRequirement.length && saved.assignment?.sources) merged.sections.sourceRequirement.push(makeHighlight("Migrated source requirements", saved.assignment.sources));
  if (!merged.sections.commandWord.length && Array.isArray(saved.assignment?.keywords)) {
    merged.sections.commandWord = saved.assignment.keywords.map((word) => makeHighlight("Migrated keyword", word));
  }
  return merged;
}

function mergeQuests(baseQuests, savedQuests) {
  return baseQuests.map((baseQuest) => {
    const saved = savedQuests.find((quest) => quest.key === baseQuest.key || quest.title === baseQuest.title);
    if (!saved) return { ...baseQuest, id: baseQuest.id || uid() };
    return {
      ...baseQuest,
      ...saved,
      id: saved.id || baseQuest.id || uid(),
      key: baseQuest.key,
      title: baseQuest.title,
      detail: baseQuest.detail,
      xp: Number(saved.xp ?? baseQuest.xp),
      gold: Number(saved.gold ?? baseQuest.gold),
      status: normalizeStatus(saved.status || (saved.complete ? "done" : baseQuest.status)),
      progress: Number(saved.progress ?? (saved.complete ? 100 : baseQuest.progress))
    };
  });
}

function mergeHomeItems(baseItems, savedItems) {
  const byId = new Map();
  baseItems.forEach((item) => byId.set(item.id, { ...item }));
  savedItems.forEach((item) => byId.set(item.id || uid(), { ...item, id: item.id || uid() }));
  return Array.from(byId.values());
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function makeHighlight(label, text, extra = {}) {
  return { id: uid(), label, text, documentId: null, documentName: "manual entry", linkTarget: "unlinked", date: new Date().toISOString(), ...extra };
}

function normalizeStatus(status) {
  const allowed = ["not started", "scheduled", "in progress", "done", "skipped", "unplanned"];
  return allowed.includes(status) ? status : "not started";
}

function isComplete(item) {
  return item.status === "done" || item.progress >= 100 || item.complete === true;
}

function hydrateInputs() {
  setValue("#assignment-name", state.assignment.name);
  setValue("#assignment-module", state.assignment.module);
  setValue("#assignment-deadline", state.assignment.deadline);
  setValue("#target-words", state.assignment.targetWords);
  setValue("#xp-minimal", state.xpDefaults.minimal);
  setValue("#xp-prep", state.xpDefaults.prep);
  setValue("#xp-checkpoint", state.xpDefaults.checkpoint);
  setValue("#xp-submitted", state.xpDefaults.submitted);
  setValue("#mind-map", state.mindMap);
  setValue("#template-plan", state.templatePlan);
  setValue("#draft-input", state.draft);
  setValue("#tmazing-link", state.integration.tmazingLink);
  setValue("#workbench-link", state.integration.workbenchLink);
  setValue("#repo-link", state.integration.repoLink);
  setValue("#calendar-link", state.integration.calendarLink);
}

function setValue(selector, value) {
  const element = $(selector);
  if (element) element.value = value || "";
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

function bindAutosave() {
  [
    ["#assignment-name", "assignment", "name"],
    ["#assignment-module", "assignment", "module"],
    ["#assignment-deadline", "assignment", "deadline"],
    ["#target-words", "assignment", "targetWords"],
    ["#mind-map", null, "mindMap"],
    ["#template-plan", null, "templatePlan"],
    ["#draft-input", null, "draft"],
    ["#tmazing-link", "integration", "tmazingLink"],
    ["#workbench-link", "integration", "workbenchLink"],
    ["#repo-link", "integration", "repoLink"],
    ["#calendar-link", "integration", "calendarLink"]
  ].forEach(([selector, group, key]) => {
    const element = $(selector);
    if (!element) return;
    element.addEventListener("input", (event) => {
      if (group) state[group][key] = event.target.value;
      else state[key] = event.target.value;
      saveState();
    });
  });

  [
    ["#xp-minimal", "minimal"],
    ["#xp-prep", "prep"],
    ["#xp-checkpoint", "checkpoint"],
    ["#xp-submitted", "submitted"]
  ].forEach(([selector, key]) => {
    $(selector).addEventListener("input", (event) => {
      state.xpDefaults[key] = Number(event.target.value) || 0;
      if (key === "checkpoint") applyCheckpointDefault();
      if (key === "submitted") applySubmittedDefault();
      saveState();
      render();
    });
  });
}

function applyCheckpointDefault() {
  state.academicQuests.forEach((quest) => {
    if (!isComplete(quest) && quest.key !== "submitted") quest.xp = state.xpDefaults.checkpoint;
  });
}

function applySubmittedDefault() {
  const submitted = state.academicQuests.find((quest) => quest.key === "submitted");
  if (submitted && !isComplete(submitted)) submitted.xp = state.xpDefaults.submitted;
}

function bindButtons() {
  $("#file-input").addEventListener("change", handleFileUpload);
  $("#add-pasted-document").addEventListener("click", addPastedDocument);
  $("#download-active-document").addEventListener("click", downloadActiveDocument);
  $("#save-highlight").addEventListener("click", saveSelectedHighlight);
  $("#send-highlight-quote").addEventListener("click", sendSelectedTextToQuoteBank);
  $("#add-quote").addEventListener("click", addQuote);
  $("#complete-mind-map").addEventListener("click", () => completeQuest("mindMap"));
  $("#complete-template-plan").addEventListener("click", () => completeQuest("templatePlan"));
  $("#mark-citations-added").addEventListener("click", () => completeQuest("citations"));
  $("#mark-final-review").addEventListener("click", () => completeQuest("finalReview"));
  $("#confirm-submitted").addEventListener("click", confirmSubmitted);
  $("#download-draft").addEventListener("click", () => downloadText(`${state.assignment.name || "draft"}.txt`, state.draft || $("#draft-input").value));
  $("#split-draft").addEventListener("click", splitDraft);
  $("#prev-sentence").addEventListener("click", () => moveSentence(-1));
  $("#next-sentence").addEventListener("click", () => moveSentence(1));
  $("#save-sentence").addEventListener("click", saveSentenceEdit);
  $("#check-sentence").addEventListener("click", checkCurrentSentence);
  $("#mark-flow-checked").addEventListener("click", () => completeQuest("flow"));
  $("#export-draft").addEventListener("click", exportDraft);
  $("#add-note").addEventListener("click", addNote);
  $("#add-domestic").addEventListener("click", addDomesticQuest);
  $("#add-reward").addEventListener("click", addReward);
  $("#home-item-upload").addEventListener("change", handleHomeImageUpload);
  $("#add-home-item").addEventListener("click", addHomeItem);
  $("#add-dictionary-entry").addEventListener("click", addDictionaryEntry);
  $("#export-data").addEventListener("click", exportData);
  $("#copy-summary").addEventListener("click", copySummary);
  $("#download-summary").addEventListener("click", () => downloadText(`${state.assignment.name || "tma-summary"}.txt`, buildSummary()));
  $("#download-ics").addEventListener("click", downloadIcs);
  $("#import-button").addEventListener("click", importData);
  document.addEventListener("keydown", handleSpaceNavigation);
}

async function handleFileUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    toast(`Extracting ${file.name}...`);
    const text = await extractFileText(file);
    addDocument(file.name, file.type || file.name.split(".").pop(), text, "file");
    completeQuest("file");
    toast(`Added ${file.name}`);
  } catch (error) {
    toast(error.message || "Could not extract this file. Paste the text instead.");
  } finally {
    event.target.value = "";
  }
}

async function extractFileText(file) {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".text") || file.type.startsWith("text/")) {
    return file.text();
  }
  if (lower.endsWith(".pdf") || file.type === "application/pdf") {
    return extractPdfText(file);
  }
  if (lower.endsWith(".docx") || file.type.includes("wordprocessingml")) {
    return extractDocxText(file);
  }
  throw new Error("Unsupported file type. Use PDF, DOCX, Markdown, TXT, or paste copied text.");
}

async function extractPdfText(file) {
  if (!window.pdfjsLib) throw new Error("PDF extraction library has not loaded. Paste copied PDF text instead.");
  const arrayBuffer = await file.arrayBuffer();
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(" "));
  }
  return pages.join("\n\n");
}

async function extractDocxText(file) {
  if (!window.mammoth) throw new Error("DOCX extraction library has not loaded. Paste copied Word text instead.");
  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  return result.value || "";
}

function addPastedDocument() {
  const text = $("#paste-text").value.trim();
  const label = $("#paste-label").value.trim() || "Pasted text";
  if (!text) return toast("Paste some text first.");
  addDocument(label, "pasted text", text, "paste");
  clearFields(["#paste-text", "#paste-label"]);
  completeQuest("file");
  toast("Pasted document added.");
}

function addDocument(name, type, text, sourceKind) {
  const document = { id: uid(), name, type, text, sourceKind, date: new Date().toISOString() };
  state.documents.push(document);
  state.activeDocumentId = document.id;
  saveState();
  render();
  loadActiveDocumentText();
}

function loadActiveDocumentText() {
  const active = getActiveDocument();
  $("#document-viewer").value = active?.text || "";
}

function getActiveDocument() {
  return state.documents.find((document) => document.id === state.activeDocumentId) || state.documents[0] || null;
}

function saveSelectedHighlight() {
  const selection = getSelectedDocumentText();
  if (!selection) return toast("Select text in the document box first.");
  const type = $("#highlight-type").value;
  const active = getActiveDocument();
  const linkTarget = $("#highlight-link-target").value || "unlinked";
  const entry = makeHighlight(sectionLabels[type] || type, selection, {
    documentId: active?.id || null,
    documentName: active?.name || "manual entry",
    linkTarget
  });
  state.sections[type].push(entry);
  if (type === "taskQuestion") completeQuest("task");
  if (type === "commandWord") completeQuest("keywords");
  if (["guidance", "learningOutcome", "markingCriteria", "wordCount", "sourceRequirement"].includes(type)) completeQuest("guidance");
  if (type === "wordCount") captureWordCount(selection);
  saveState();
  render();
  toast("Highlight saved.");
}

function getSelectedDocumentText() {
  const viewer = $("#document-viewer");
  const selected = viewer.value.slice(viewer.selectionStart, viewer.selectionEnd).trim();
  return selected;
}

function captureWordCount(text) {
  const match = text.match(/\b\d{3,5}\b/);
  if (match && !state.assignment.targetWords) {
    state.assignment.targetWords = match[0];
    setValue("#target-words", match[0]);
  }
}

function sendSelectedTextToQuoteBank() {
  const selection = getSelectedDocumentText();
  if (!selection) return toast("Select text in the document box first.");
  const active = getActiveDocument();
  setValue("#quote-source", active?.name || "Selected document");
  setValue("#quote-text", selection);
  const target = $("#highlight-link-target").value;
  if (target) setValue("#quote-link-target", target);
  showTab("sources");
}

function addQuote() {
  const source = $("#quote-source").value.trim();
  const area = $("#quote-area").value.trim();
  const text = $("#quote-text").value.trim();
  const purpose = $("#quote-purpose").value.trim();
  const linkTarget = $("#quote-link-target").value || "unlinked";
  const citation = $("#quote-citation").value.trim();
  if (!text) return toast("Add the quote, paraphrase, or source area first.");
  state.quotes.push({ id: uid(), source, area, text, purpose, linkTarget, citation, opened: false, sold: false, displayed: false });
  state.sections.quote.push(makeHighlight("Quote geode", text, { documentName: source || "manual quote", linkTarget }));
  clearFields(["#quote-source", "#quote-area", "#quote-text", "#quote-purpose", "#quote-citation"]);
  completeQuest("quoteBank");
  award(Number(state.xpDefaults.prep) || 10, 5, "Unopened geode", "Quote geode added");
  saveState();
  render();
}

function completeQuest(key) {
  const quest = state.academicQuests.find((item) => item.key === key);
  if (!quest || isComplete(quest)) return;
  quest.status = "done";
  quest.progress = 100;
  award(Number(quest.xp) || 0, Number(quest.gold) || 0, quest.loot, `${quest.title} complete`);
  saveState();
  render();
}

function updateQuestField(id, field, value) {
  const quest = state.academicQuests.find((item) => item.id === id);
  if (!quest) return;
  if (field === "xp" || field === "gold" || field === "progress") quest[field] = Number(value) || 0;
  else quest[field] = normalizeStatus(value);
  if (field === "status" && value === "done" && !quest.awarded) {
    quest.progress = 100;
    quest.awarded = true;
    award(Number(quest.xp) || 0, Number(quest.gold) || 0, quest.loot, `${quest.title} complete`);
  }
  if (field === "progress" && quest.progress >= 100 && !quest.awarded) {
    quest.status = "done";
    quest.awarded = true;
    award(Number(quest.xp) || 0, Number(quest.gold) || 0, quest.loot, `${quest.title} complete`);
  }
  saveState();
  render();
}

function confirmSubmitted() {
  const ready = ["task", "guidance", "templatePlan", "citations", "flow", "finalReview"].every((key) => isComplete(state.academicQuests.find((quest) => quest.key === key) || {}));
  if (!ready && !confirm("Some earlier checkpoints are not marked done. Confirm submitted anyway?")) return;
  state.draft = $("#draft-input").value;
  completeQuest("submitted");
  saveDraftToDictionary(state.draft);
  saveState();
  render();
}

function saveDraftToDictionary(text) {
  if (!text.trim()) return;
  addDictionaryValue("finishedDraftWording", text.trim());
  splitIntoSentences(text).forEach((sentence) => addDictionaryValue("approvedWording", sentence));
  const phrases = text.match(/\b[A-Za-z][A-Za-z'-]+(?:\s+[A-Za-z][A-Za-z'-]+){1,4}\b/g) || [];
  phrases.slice(0, 40).forEach((phrase) => addDictionaryValue("usefulPhrases", phrase.toLowerCase()));
}

function addNote() {
  const title = $("#note-title").value.trim();
  const type = $("#note-type").value;
  const body = $("#note-body").value.trim();
  const xp = Number($("#note-xp").value) || 0;
  if (!title && !body) return toast("Add a note title or note text first.");
  state.notes.push({ id: uid(), title: title || "Untitled note", type, body, xp, date: new Date().toISOString() });
  award(xp, Math.ceil(xp / 2), "Training token", "Training note completed");
  clearFields(["#note-title", "#note-body"]);
  saveState();
  render();
}

function addDomesticQuest() {
  const title = $("#domestic-title").value.trim();
  const category = $("#domestic-category").value;
  const status = normalizeStatus($("#domestic-status").value);
  const progress = clamp(Number($("#domestic-progress").value) || 0, 0, 100);
  const xp = Number($("#domestic-xp").value) || 0;
  if (!title) return toast("Add the domestic quest name first.");
  const item = { id: uid(), title, category, status, progress, xp, gold: Math.ceil(xp / 2), awarded: false };
  state.domestic.push(item);
  clearFields(["#domestic-title"]);
  if (status === "done" || progress >= 100) updateDomestic(item.id, "progress", 100);
  saveState();
  render();
}

function updateDomestic(id, field, value) {
  const task = state.domestic.find((item) => item.id === id);
  if (!task) return;
  if (field === "status") task.status = normalizeStatus(value);
  if (field === "progress") task.progress = clamp(Number(value) || 0, 0, 100);
  if ((task.status === "done" || task.progress >= 100) && !task.awarded) {
    task.status = "done";
    task.progress = 100;
    task.awarded = true;
    award(task.xp, task.gold, "Home spark", `${task.title} completed`);
  }
  saveState();
  render();
}

function addReward() {
  const name = $("#reward-name").value.trim();
  const category = $("#reward-category").value;
  const cost = Number($("#reward-cost").value) || 0;
  const requirement = $("#reward-requirement").value || "none";
  const link = $("#reward-link").value.trim();
  const description = $("#reward-description").value.trim();
  if (!name) return toast("Add the reward name first.");
  state.rewards.push({ id: uid(), name, category, cost, requirement, link, description, claimed: false });
  clearFields(["#reward-name", "#reward-link", "#reward-description"]);
  saveState();
  render();
}

function canClaimReward(reward) {
  const requirementMet = reward.requirement === "none" || isRequirementMet(reward.requirement);
  return requirementMet && state.player.gold >= reward.cost && !reward.claimed;
}

function isRequirementMet(requirement) {
  if (requirement.startsWith("quest:")) {
    const key = requirement.replace("quest:", "");
    return isComplete(state.academicQuests.find((quest) => quest.key === key) || {});
  }
  return false;
}

function claimReward(id) {
  const reward = state.rewards.find((item) => item.id === id);
  if (!reward) return;
  if (!canClaimReward(reward)) return toast("This reward is still blocked or costs more gold than you have.");
  state.player.gold -= reward.cost;
  reward.claimed = true;
  toast(`Reward unlocked: ${reward.name}`);
  saveState();
  render();
}

async function handleHomeImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  uploadedHomeImage = await fileToDataUrl(file);
  toast("Image loaded. Add the item to put it in the shop.");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function addHomeItem() {
  const name = $("#home-item-name").value.trim();
  const cost = Number($("#home-item-cost").value) || 0;
  const image = uploadedHomeImage || $("#home-item-image").value.trim();
  const category = $("#home-item-category").value;
  if (!name) return toast("Add the home item name first.");
  state.homeItems.push({ id: uid(), name, cost, image, category, builtIn: false, owned: false, displayed: false, position: null, icon: "✦" });
  uploadedHomeImage = "";
  clearFields(["#home-item-name", "#home-item-image"]);
  $("#home-item-upload").value = "";
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
  item.position = firstEmptyRoomSlot();
  toast(`Home item unlocked: ${item.name}`);
  saveState();
  render();
}

function firstEmptyRoomSlot() {
  const used = new Set(state.homeItems.filter((item) => item.displayed).map((item) => item.position));
  for (let index = 0; index < 12; index += 1) {
    if (!used.has(index)) return index;
  }
  return null;
}

function moveHomeItem(id, direction) {
  const item = state.homeItems.find((entry) => entry.id === id);
  if (!item || !item.owned) return;
  const current = Number.isInteger(item.position) ? item.position : firstEmptyRoomSlot();
  item.position = clamp(current + direction, 0, 11);
  item.displayed = true;
  saveState();
  render();
}

function toggleDisplayHomeItem(id) {
  const item = state.homeItems.find((entry) => entry.id === id);
  if (!item || !item.owned) return;
  item.displayed = !item.displayed;
  if (item.displayed && item.position === null) item.position = firstEmptyRoomSlot();
  saveState();
  render();
}

function displayQuoteGeode(id) {
  const quote = state.quotes.find((item) => item.id === id);
  if (!quote || !quote.opened) return toast("Open the geode before displaying it.");
  quote.displayed = !quote.displayed;
  saveState();
  render();
}

function openGeode(id) {
  const quote = state.quotes.find((item) => item.id === id);
  if (!quote || quote.opened) return;
  quote.opened = true;
  award(10, 8, "Citation crystal", "Geode opened");
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

function splitDraft() {
  state.draft = $("#draft-input").value.trim();
  if (!state.draft) return toast("Paste or write a draft first.");
  state.draftSentences = splitIntoSentences(state.draft);
  state.currentSentence = 0;
  $("#sentence-workbench").classList.remove("hidden");
  award(10, 5, "Draft page", "Draft loaded into diary");
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
  state.sentenceNotes[state.currentSentence] = $("#sentence-relevance").value.trim();
  state.draft = state.draftSentences.join(" ");
  setValue("#draft-input", state.draft);
  saveState();
  if (showToast) toast("Sentence saved.");
}

function checkCurrentSentence() {
  const text = $("#sentence-editor").value.trim();
  const relevance = $("#sentence-relevance").value.trim();
  const suggestions = checkWriting(text, relevance, 32);
  const box = $("#sentence-suggestions");
  if (!suggestions.length) {
    box.innerHTML = `<div class="item suggestion"><p>No review prompts for this sentence.</p></div>`;
    return;
  }
  box.innerHTML = suggestions.map(renderSuggestion).join("");
}

function checkWriting(text, relevance, maxWords) {
  const found = [];
  const repeated = /\b([A-Za-z]+)\s+\1\b/gi;
  for (const match of text.matchAll(repeated)) found.push({ rule: "Repeated word", message: `'${match[1]}' appears twice in a row.`, suggestion: `Remove one '${match[1]}' unless it is intentional.`, excerpt: match[0] });
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
    for (const match of text.matchAll(pattern)) found.push({ rule: "Filler phrase", message: `'${match[0]}' may weaken the sentence.`, suggestion, excerpt: match[0] });
  });
  const words = text.match(/\b[\w']+\b/g) || [];
  if (words.length > maxWords) found.push({ rule: "Long sentence", message: `This sentence has ${words.length} words.`, suggestion: "Split it or make the cause and effect easier to follow.", excerpt: shorten(text) });
  if ((text.match(/,/g) || []).length >= 3) found.push({ rule: "List-heavy sentence", message: "This sentence may be listing more than explaining.", suggestion: "Check whether two examples are enough and use the saved space for explanation.", excerpt: shorten(text) });
  if (/\b(is|are|was|were|be|been|being)\s+([a-z]+ed|known|seen|made|given|taken|shown)\b/i.test(text)) found.push({ rule: "Passive voice hint", message: "This may be passive voice.", suggestion: "Check whether the sentence needs the actor, or keep it if the actor is not relevant.", excerpt: shorten(text) });
  if (!relevance) found.push({ rule: "Relevance note", message: "No relevance note has been added.", suggestion: "Add how this sentence serves the task, guidance, or paragraph purpose.", excerpt: shorten(text) });
  return found;
}

function exportDraft() {
  saveSentenceEdit(false);
  completeQuest("flow");
  downloadText(`${state.assignment.name || "edited-draft"}.txt`, state.draftSentences.join(" "));
}

function handleSpaceNavigation(event) {
  const target = event.target;
  const isTyping = ["TEXTAREA", "INPUT", "SELECT", "BUTTON"].includes(target.tagName) || target.isContentEditable;
  if (event.code === "Space" && !isTyping && $("#diary").classList.contains("active-panel")) {
    event.preventDefault();
    moveSentence(1);
  }
}

function addDictionaryEntry() {
  const chapter = $("#dictionary-chapter").value;
  const entry = $("#dictionary-entry").value.trim();
  if (!entry) return toast("Add dictionary text first.");
  addDictionaryValue(chapter, entry);
  clearFields(["#dictionary-entry"]);
  saveState();
  render();
}

function addDictionaryValue(chapter, value) {
  if (!dictionaryChapters.includes(chapter)) return;
  const clean = String(value || "").trim();
  if (!clean) return;
  if (!state.dictionary[chapter].includes(clean)) state.dictionary[chapter].push(clean);
}

function exportData() {
  saveState();
  const payload = JSON.stringify(state, null, 2);
  $("#export-output").textContent = payload;
  navigator.clipboard?.writeText(payload);
  toast("Save data copied if clipboard access is available.");
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
    state = mergeState(clone(defaultState), JSON.parse(text));
    saveState();
    hydrateInputs();
    render();
    renderSentenceWorkbench();
    loadActiveDocumentText();
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
  sectionKeys.forEach((key) => {
    lines.push(`\n## ${sectionLabels[key]}`);
    state.sections[key].forEach((entry, index) => lines.push(`${index + 1}. ${entry.text}`));
  });
  lines.push("\n## Quote bank");
  state.quotes.forEach((quote, index) => lines.push(`${index + 1}. ${quote.source || "Unknown source"} / ${quote.area || "Unplaced"}: ${quote.text}\nPurpose: ${quote.purpose || ""}\nCitation: ${quote.citation || ""}`));
  lines.push("\n## Template plan\n" + (state.templatePlan || ""));
  lines.push("\n## Draft\n" + (state.draft || ""));
  lines.push("\n## Quest status");
  state.academicQuests.forEach((quest) => lines.push(`- ${quest.title}: ${quest.status}, ${quest.progress}%`));
  return lines.join("\n");
}

function downloadIcs() {
  if (!state.assignment.deadline) return toast("Add a deadline first.");
  const date = state.assignment.deadline.replaceAll("-", "");
  const title = escapeIcsText(state.assignment.name || "TMA deadline");
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Esslay//TMA Quest//EN",
    "BEGIN:VEVENT",
    `UID:${uid()}@esslay`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;VALUE=DATE:${date}`,
    `SUMMARY:${title}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
  downloadText(`${state.assignment.name || "deadline"}.ics`, content, "text/calendar");
}

function escapeIcsText(value) {
  return String(value).replace(/[\\,;]/g, "\\$&").replace(/\n/g, "\\n");
}

function downloadActiveDocument() {
  const active = getActiveDocument();
  if (!active) return toast("Select or add a document first.");
  downloadText(`${active.name || "document"}.txt`, active.text || "");
}

function downloadText(filename, text, type = "text/plain") {
  const blob = new Blob([text || ""], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = safeFilename(filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function safeFilename(value) {
  return String(value || "download.txt").replace(/[^a-z0-9._-]+/gi, "-").replace(/-+/g, "-");
}

function award(xp, gold, lootName, reason) {
  state.player.xp += Number(xp) || 0;
  state.player.gold += Number(gold) || 0;
  if (lootName) state.loot.push({ id: uid(), name: lootName, reason, date: new Date().toISOString() });
  toast(`${reason}: +${xp || 0} XP, +${gold || 0} gold${lootName ? `, loot: ${lootName}` : ""}`);
}

function render() {
  renderStats();
  renderLinkTargets();
  renderAcademicQuests();
  renderDocuments();
  renderSections();
  renderQuotes();
  renderNotes();
  renderDomestic();
  renderRewards();
  renderHome();
  renderDictionary();
}

function renderStats() {
  const level = Math.floor(state.player.xp / 100) + 1;
  const levelStart = (level - 1) * 100;
  const progress = state.player.xp - levelStart;
  $("#level-line").textContent = `Level ${level} ${level < 5 ? "apprentice planner" : level < 10 ? "battle scholar" : "TMA knight"}`;
  $("#xp-total").textContent = state.player.xp;
  $("#gold-total").textContent = state.player.gold;
  $("#loot-total").textContent = state.loot.length;
  $("#submitted-total").textContent = state.academicQuests.filter((quest) => quest.key === "submitted" && isComplete(quest)).length;
  $("#next-level-text").textContent = `${progress} / 100 XP`;
  $("#level-progress").style.width = `${clamp(progress, 0, 100)}%`;
}

function renderLinkTargets() {
  const targets = ["unlinked", ...sectionKeys.flatMap((key) => state.sections[key].map((entry) => `${key}:${entry.id}`)), ...state.academicQuests.map((quest) => `quest:${quest.key}`)];
  const labels = Object.fromEntries(targets.map((target) => [target, labelForTarget(target)]));
  ["#highlight-link-target", "#quote-link-target", "#reward-requirement"].forEach((selector) => {
    const select = $(selector);
    if (!select) return;
    const current = select.value;
    select.innerHTML = targets.map((target) => `<option value="${escapeAttr(target)}">${escapeHtml(labels[target])}</option>`).join("");
    if (selector === "#reward-requirement") select.insertAdjacentHTML("afterbegin", `<option value="none">No requirement</option>`);
    select.value = current || (selector === "#reward-requirement" ? "none" : "unlinked");
  });
}

function labelForTarget(target) {
  if (target === "unlinked") return "Unlinked";
  if (target === "none") return "No requirement";
  if (target.startsWith("quest:")) {
    const key = target.replace("quest:", "");
    const quest = state.academicQuests.find((item) => item.key === key);
    return quest ? `Quest: ${quest.title}` : target;
  }
  const [section, id] = target.split(":");
  const entry = state.sections[section]?.find((item) => item.id === id);
  return entry ? `${sectionLabels[section]}: ${shorten(entry.text, 45)}` : target;
}

function renderAcademicQuests() {
  $("#academic-quests").innerHTML = state.academicQuests.map((quest) => `
    <article class="quest ${isComplete(quest) ? "complete" : ""}">
      <div class="quest-head"><div><div class="quest-title">${escapeHtml(quest.title)}</div><p>${escapeHtml(quest.detail)}</p></div><span class="badge">${escapeHtml(quest.loot)}</span></div>
      <div class="form-grid compact-grid">
        <label>Status<select data-quest-status="${quest.id}">${statusOptions(quest.status)}</select></label>
        <label>Progress %<input type="number" min="0" max="100" value="${quest.progress}" data-quest-progress="${quest.id}"></label>
        <label>XP<input type="number" min="0" value="${quest.xp}" data-quest-xp="${quest.id}" ${isComplete(quest) ? "disabled" : ""}></label>
        <label>Gold<input type="number" min="0" value="${quest.gold}" data-quest-gold="${quest.id}" ${isComplete(quest) ? "disabled" : ""}></label>
      </div>
      <div class="quest-actions"><button class="mini-button" type="button" data-complete-quest="${quest.key}" ${isComplete(quest) ? "disabled" : ""}>Mark done</button></div>
    </article>`).join("");
  bindQuestControls();
}

function bindQuestControls() {
  $$('[data-quest-status]').forEach((input) => input.addEventListener("change", () => updateQuestField(input.dataset.questStatus, "status", input.value)));
  $$('[data-quest-progress]').forEach((input) => input.addEventListener("change", () => updateQuestField(input.dataset.questProgress, "progress", input.value)));
  $$('[data-quest-xp]').forEach((input) => input.addEventListener("change", () => updateQuestField(input.dataset.questXp, "xp", input.value)));
  $$('[data-quest-gold]').forEach((input) => input.addEventListener("change", () => updateQuestField(input.dataset.questGold, "gold", input.value)));
  $$('[data-complete-quest]').forEach((button) => button.addEventListener("click", () => completeQuest(button.dataset.completeQuest)));
}

function statusOptions(current) {
  return ["not started", "scheduled", "in progress", "done", "skipped", "unplanned"].map((status) => `<option ${status === current ? "selected" : ""}>${status}</option>`).join("");
}

function renderDocuments() {
  $("#document-list").innerHTML = state.documents.map((document) => `
    <article class="item ${document.id === state.activeDocumentId ? "owned" : ""}"><div class="item-title">${escapeHtml(document.name)}</div><p>${escapeHtml(document.type || document.sourceKind || "document")}</p><div class="item-actions"><button class="mini-button" data-open-document="${document.id}" type="button">Open</button><button class="mini-button" data-download-document="${document.id}" type="button">Download .txt</button><button class="mini-button delete-button" data-delete-document="${document.id}" type="button">Delete</button></div></article>`).join("");
  $$('[data-open-document]').forEach((button) => button.addEventListener("click", () => { state.activeDocumentId = button.dataset.openDocument; saveState(); render(); loadActiveDocumentText(); }));
  $$('[data-download-document]').forEach((button) => button.addEventListener("click", () => { const doc = state.documents.find((item) => item.id === button.dataset.downloadDocument); if (doc) downloadText(`${doc.name}.txt`, doc.text); }));
  bindDelete("document", "documents");
}

function renderSections() {
  $("#section-summary").innerHTML = sectionKeys.map((key) => `
    <article class="section-box"><h3>${sectionLabels[key]}</h3>${state.sections[key].length ? state.sections[key].map((entry) => `<p><strong>${escapeHtml(entry.documentName || "manual")}</strong>: ${escapeHtml(shorten(entry.text, 130))}</p><button class="mini-button delete-button" data-delete-section="${key}:${entry.id}" type="button">Delete</button>`).join("") : `<p class="helper">Nothing saved yet.</p>`}</article>`).join("");
  $$('[data-delete-section]').forEach((button) => button.addEventListener("click", () => {
    const [section, id] = button.dataset.deleteSection.split(":");
    state.sections[section] = state.sections[section].filter((entry) => entry.id !== id);
    saveState();
    render();
  }));
}

function renderQuotes() {
  $("#quote-list").innerHTML = state.quotes.map((quote) => `
    <article class="item ${quote.opened ? "owned" : ""}"><div class="item-head"><div><div class="item-title">${escapeHtml(quote.source || "Quote geode")}</div><p>${escapeHtml(quote.area || "Unplaced")} / ${escapeHtml(labelForTarget(quote.linkTarget || "unlinked"))}</p></div><span class="badge">${quote.opened ? "Opened" : "Unopened"}</span></div><p>${escapeHtml(quote.text)}</p><p class="helper">${escapeHtml(quote.purpose || "No purpose note yet.")}</p>${quote.citation ? `<p>Citation: ${escapeHtml(quote.citation)}</p>` : ""}<div class="item-actions"><button class="mini-button" data-open-geode="${quote.id}" ${quote.opened ? "disabled" : ""}>Open geode</button><button class="mini-button" data-display-geode="${quote.id}" ${quote.opened ? "" : "disabled"}>${quote.displayed ? "Remove from base" : "Display in base"}</button><button class="mini-button" data-sell-geode="${quote.id}" ${quote.sold ? "disabled" : ""}>Sell</button><button class="mini-button delete-button" data-delete-quote="${quote.id}">Delete</button></div></article>`).join("");
  bindListButtons("open-geode", openGeode);
  bindListButtons("display-geode", displayQuoteGeode);
  bindListButtons("sell-geode", sellGeode);
  bindDelete("quote", "quotes");
}

function renderNotes() {
  $("#note-list").innerHTML = state.notes.map((note) => `<article class="item"><div class="item-title">${escapeHtml(note.title)}</div><span class="badge">${escapeHtml(note.type)} / ${note.xp} XP</span><p>${escapeHtml(shorten(note.body, 180))}</p><button class="mini-button delete-button" data-delete-note="${note.id}">Delete</button></article>`).join("");
  bindDelete("note", "notes");
}

function renderDomestic() {
  $("#domestic-list").innerHTML = state.domestic.map((task) => `<article class="quest ${isComplete(task) ? "complete" : ""}"><div class="quest-head"><div><div class="quest-title">${escapeHtml(task.title)}</div><p>${escapeHtml(task.category)}</p></div><span class="badge">${task.xp} XP</span></div><div class="form-grid compact-grid"><label>Status<select data-domestic-status="${task.id}">${statusOptions(task.status)}</select></label><label>Progress %<input type="number" min="0" max="100" value="${task.progress}" data-domestic-progress="${task.id}"></label></div><div class="quest-actions"><button class="mini-button" data-domestic-done="${task.id}">Mark done</button><button class="mini-button delete-button" data-delete-domestic="${task.id}">Delete</button></div></article>`).join("");
  $$('[data-domestic-status]').forEach((input) => input.addEventListener("change", () => updateDomestic(input.dataset.domesticStatus, "status", input.value)));
  $$('[data-domestic-progress]').forEach((input) => input.addEventListener("change", () => updateDomestic(input.dataset.domesticProgress, "progress", input.value)));
  $$('[data-domestic-done]').forEach((button) => button.addEventListener("click", () => updateDomestic(button.dataset.domesticDone, "progress", 100)));
  bindDelete("domestic", "domestic");
}

function renderRewards() {
  $("#reward-list").innerHTML = state.rewards.map((reward) => {
    const blocked = !canClaimReward(reward);
    return `<article class="item ${reward.claimed ? "owned" : ""}"><div class="item-head"><div><div class="item-title">${escapeHtml(reward.name)}</div><p>${escapeHtml(reward.category)}</p></div><span class="badge">${reward.cost} gold</span></div><p>${escapeHtml(reward.description || "")}</p><p class="helper">Requirement: ${escapeHtml(labelForTarget(reward.requirement || "none"))}</p>${reward.link ? `<p><a href="${escapeAttr(reward.link)}" target="_blank" rel="noreferrer">Open reward link</a></p>` : ""}<div class="item-actions"><button class="mini-button" data-claim-reward="${reward.id}" ${blocked ? "disabled" : ""}>${reward.claimed ? "Claimed" : blocked ? "Blocked" : "Claim reward"}</button><button class="mini-button delete-button" data-delete-reward="${reward.id}">Delete</button></div></article>`;
  }).join("");
  bindListButtons("claim-reward", claimReward);
  bindDelete("reward", "rewards");
}

function renderHome() {
  const slots = Array.from({ length: 12 }, (_, index) => state.homeItems.find((item) => item.owned && item.displayed && item.position === index));
  const displayedGeodes = state.quotes.filter((quote) => quote.opened && quote.displayed).slice(0, 4);
  $("#room").innerHTML = slots.map((item, index) => `<div class="room-slot">${item ? renderRoomItem(item) : displayedGeodes[index] ? `◆<br>${escapeHtml(shorten(displayedGeodes[index].source || "Geode", 24))}` : "Empty slot"}</div>`).join("");
  $("#home-shop").innerHTML = state.homeItems.map((item) => `<article class="item ${item.owned ? "owned" : ""}"><div class="item-head"><div><div class="item-title">${escapeHtml(item.name)}</div><p>${escapeHtml(item.category)} ${item.builtIn ? "/ built-in" : "/ imported"}</p></div><span class="badge">${item.cost} gold</span></div>${renderItemImage(item)}<div class="item-actions"><button class="mini-button" data-buy-home="${item.id}" ${item.owned ? "disabled" : ""}>Buy/unlock</button><button class="mini-button" data-display-home="${item.id}" ${item.owned ? "" : "disabled"}>${item.displayed ? "Remove" : "Display"}</button><button class="mini-button" data-move-left="${item.id}" ${item.owned ? "" : "disabled"}>Move left</button><button class="mini-button" data-move-right="${item.id}" ${item.owned ? "" : "disabled"}>Move right</button><button class="mini-button delete-button" data-delete-home="${item.id}" ${item.builtIn ? "disabled" : ""}>Delete</button></div></article>`).join("");
  bindListButtons("buy-home", buyHomeItem);
  bindListButtons("display-home", toggleDisplayHomeItem);
  bindListButtons("move-left", (id) => moveHomeItem(id, -1));
  bindListButtons("move-right", (id) => moveHomeItem(id, 1));
  bindDelete("home", "homeItems");
}

function renderItemImage(item) {
  if (item.image) return `<img class="item-image" src="${escapeAttr(item.image)}" alt="">`;
  return `<div class="pixel-icon">${escapeHtml(item.icon || "✦")}</div>`;
}

function renderRoomItem(item) {
  if (item.image) return `<div><img src="${escapeAttr(item.image)}" alt=""><div>${escapeHtml(shorten(item.name, 24))}</div></div>`;
  return `<div>${escapeHtml(item.icon || "✦")}<br>${escapeHtml(shorten(item.name, 24))}</div>`;
}

function renderDictionary() {
  $("#dictionary-list").innerHTML = dictionaryChapters.map((chapter) => `<article class="section-box"><h3>${chapterLabel(chapter)}</h3>${state.dictionary[chapter].length ? state.dictionary[chapter].slice(-30).map((entry) => `<p>${escapeHtml(shorten(entry, 160))}</p><button class="mini-button delete-button" data-delete-dictionary="${chapter}:${hashText(entry)}">Delete</button>`).join("") : `<p class="helper">No entries yet.</p>`}</article>`).join("");
  $$('[data-delete-dictionary]').forEach((button) => button.addEventListener("click", () => {
    const [chapter, hash] = button.dataset.deleteDictionary.split(":");
    state.dictionary[chapter] = state.dictionary[chapter].filter((entry) => hashText(entry) !== hash);
    saveState();
    render();
  }));
}

function renderSentenceWorkbench() {
  if (!state.draftSentences.length) return;
  $("#sentence-workbench").classList.remove("hidden");
  $("#sentence-count").textContent = `Sentence ${state.currentSentence + 1} of ${state.draftSentences.length}`;
  setValue("#sentence-editor", state.draftSentences[state.currentSentence] || "");
  setValue("#sentence-relevance", state.sentenceNotes[state.currentSentence] || "");
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
    const id = button.dataset[toCamel(`delete-${kind}`)];
    state[stateKey] = state[stateKey].filter((item) => item.id !== id);
    if (stateKey === "documents" && state.activeDocumentId === id) state.activeDocumentId = state.documents[0]?.id || null;
    saveState();
    render();
    if (stateKey === "documents") loadActiveDocumentText();
  }));
}

function showTab(tabName) {
  const tab = $(`[data-tab="${tabName}"]`);
  if (tab) tab.click();
}

function clearFields(selectors) {
  selectors.forEach((selector) => { const element = $(selector); if (element) element.value = ""; });
}

function hashText(value) {
  let hash = 0;
  String(value).split("").forEach((char) => { hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0; });
  return String(hash);
}

function chapterLabel(chapter) {
  return chapter.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function toCamel(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
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
  setTimeout(() => box.remove(), 3600);
}

hydrateInputs();
bindTabs();
bindAutosave();
bindButtons();
render();
loadActiveDocumentText();
renderSentenceWorkbench();
