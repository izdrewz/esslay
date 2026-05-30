const HOUSE_SAVE_KEY = "esslay-house-state-v4";
const finalAvatarPath = "assets/characters/academic-adventurer/final";
const avatarVersion = "v=4";

const builtInOutfits = [
  {
    id: "base-neutral",
    type: "built-in",
    name: "Base model",
    note: "Approved neutral base avatar layer for customisation.",
    src: `${finalAvatarPath}/avatar_base_neutral.png?${avatarVersion}`
  },
  {
    id: "teal-adventurer",
    type: "built-in",
    name: "Default teal explorer",
    note: "Approved default academic-adventurer outfit.",
    src: `${finalAvatarPath}/avatar_default_teal_explorer.png?${avatarVersion}`
  },
  {
    id: "plaid-bodice-trousers",
    type: "built-in",
    name: "Plaid bodice trousers",
    note: "Approved alternate outfit with trousers.",
    src: `${finalAvatarPath}/avatar_alt_plaid_bodice_trousers.png?${avatarVersion}`
  },
  {
    id: "plaid-skirt-outfit",
    type: "built-in",
    name: "Plaid skirt outfit",
    note: "Approved alternate skirt outfit.",
    src: `${finalAvatarPath}/avatar_alt_plaid_skirt_outfit.png?${avatarVersion}`
  },
  {
    id: "dark-adventurer",
    type: "built-in",
    name: "Revised dark scholar",
    note: "Approved revised dark scholar outfit.",
    src: `${finalAvatarPath}/avatar_alt_dark_scholar_revised.png?${avatarVersion}`
  },
  {
    id: "babydoll-pink",
    type: "built-in",
    name: "Pink adventurer dress",
    note: "Approved pink dress alternate outfit.",
    src: `${finalAvatarPath}/avatar_alt_pink_adventurer_dress.png?${avatarVersion}`
  }
];

const builtInHomeItems = [
  {
    id: "starter-writing-desk",
    type: "built-in",
    name: "Writing desk",
    category: "study",
    note: "Built-in Esslay starter asset.",
    src: "assets/packs/starter-cottage/furniture/writing-desk.svg?v=1",
    cost: 25,
    license: "Original app asset",
    source: "Starter Cottage Pack",
    starterUnlocked: false,
    place: { x: 8, y: 58, w: 18 }
  },
  {
    id: "starter-geode-shelf",
    type: "built-in",
    name: "Geode shelf",
    category: "loot-display",
    note: "Built-in Esslay starter asset.",
    src: "assets/packs/starter-cottage/furniture/geode-shelf.svg?v=1",
    cost: 40,
    license: "Original app asset",
    source: "Starter Cottage Pack",
    starterUnlocked: false,
    place: { x: 29, y: 20, w: 18 }
  },
  {
    id: "starter-potted-ivy",
    type: "built-in",
    name: "Potted ivy",
    category: "decor",
    note: "Starter item, already unlocked.",
    src: "assets/packs/starter-cottage/furniture/potted-ivy.svg?v=1",
    cost: 10,
    license: "Original app asset",
    source: "Starter Cottage Pack",
    starterUnlocked: true,
    place: { x: 72, y: 58, w: 13 }
  }
];

const safeLicenses = new Set([
  "Own art",
  "Commissioned with permission",
  "CC0",
  "CC-BY",
  "MIT",
  "Permission granted",
  "Original app asset"
]);

const avatarLayer = document.querySelector("#avatar-layer");
const placedItems = document.querySelector("#placed-items");
const mirrorPanel = document.querySelector("#mirror-panel");
const outfitGrid = document.querySelector("#outfit-grid");
const openMirror = document.querySelector("#open-mirror");
const closeMirror = document.querySelector("#close-mirror");
const importAvatarForm = document.querySelector("#import-avatar-form");
const importAvatarFile = document.querySelector("#import-avatar-file");
const importAvatarName = document.querySelector("#import-avatar-name");
const importStatus = document.querySelector("#import-status");
const assetGrid = document.querySelector("#asset-grid");
const goldCount = document.querySelector("#gold-count");
const importItemForm = document.querySelector("#import-item-form");
const importItemName = document.querySelector("#import-item-name");
const importItemCategory = document.querySelector("#import-item-category");
const importItemLicense = document.querySelector("#import-item-license");
const importItemSource = document.querySelector("#import-item-source");
const importItemCost = document.querySelector("#import-item-cost");
const importItemFile = document.querySelector("#import-item-file");
const importItemStatus = document.querySelector("#import-item-status");
const shopButton = document.querySelector(".desk-hotspot");

function defaultHouseState() {
  return {
    outfit: "teal-adventurer",
    importedOutfits: [],
    gold: 75,
    unlockedItemIds: ["starter-potted-ivy"],
    placedItemIds: ["starter-potted-ivy"],
    importedItems: []
  };
}

function loadHouseState() {
  try {
    const saved = JSON.parse(localStorage.getItem(HOUSE_SAVE_KEY));
    return { ...defaultHouseState(), ...(saved || {}) };
  } catch {
    return defaultHouseState();
  }
}

function saveHouseState(state) {
  localStorage.setItem(HOUSE_SAVE_KEY, JSON.stringify(state));
}

let houseState = loadHouseState();

function allOutfits() {
  return builtInOutfits.concat(
    (houseState.importedOutfits || []).map((outfit) => ({ ...outfit, type: "imported" }))
  );
}

function allItems() {
  return builtInHomeItems.concat(
    (houseState.importedItems || []).map((item) => ({ ...item, type: "imported" }))
  );
}

function currentOutfit() {
  return allOutfits().find((outfit) => outfit.id === houseState.outfit) || builtInOutfits[1];
}

function isUnlocked(item) {
  return item.starterUnlocked || houseState.unlockedItemIds.includes(item.id);
}

function isPlaced(item) {
  return houseState.placedItemIds.includes(item.id);
}

function setStatus(message) {
  if (importItemStatus) importItemStatus.textContent = message;
}

function applyOutfit() {
  const outfit = currentOutfit();
  if (avatarLayer) {
    avatarLayer.src = outfit.src;
    avatarLayer.alt = outfit.name;
  }

  document.querySelectorAll(".outfit-card").forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.outfit === outfit.id ? "true" : "false");
  });
}

function renderOutfitGrid() {
  if (!outfitGrid) return;
  outfitGrid.innerHTML = "";

  allOutfits().forEach((outfit) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "outfit-card";
    button.dataset.outfit = outfit.id;
    button.setAttribute("aria-pressed", outfit.id === houseState.outfit ? "true" : "false");
    button.innerHTML = `
      <img src="${outfit.src}" alt="">
      <strong>${outfit.name}</strong>
      <span>${outfit.note || "Imported paper-doll artwork."}</span>
      <small>${outfit.type === "imported" ? "Imported artwork" : "Approved avatar art"}</small>
    `;
    button.addEventListener("click", () => {
      houseState.outfit = outfit.id;
      saveHouseState(houseState);
      applyOutfit();
    });
    outfitGrid.appendChild(button);
  });
}

function renderGold() {
  if (goldCount) goldCount.textContent = houseState.gold;
}

function renderPlacedItems() {
  if (!placedItems) return;
  placedItems.innerHTML = "";

  allItems().filter((item) => isUnlocked(item) && isPlaced(item)).forEach((item) => {
    const img = document.createElement("img");
    const place = item.place || { x: 62, y: 58, w: 14 };
    img.className = "placed-item";
    img.src = item.src;
    img.alt = item.name;
    img.style.left = `${place.x}%`;
    img.style.top = `${place.y}%`;
    img.style.width = `${place.w}%`;
    img.dataset.item = item.id;
    placedItems.appendChild(img);
  });
}

function renderAssetGrid() {
  if (!assetGrid) return;
  assetGrid.innerHTML = "";

  allItems().forEach((item) => {
    const unlocked = isUnlocked(item);
    const placed = isPlaced(item);
    const safe = safeLicenses.has(item.license);
    const card = document.createElement("article");
    card.className = "asset-card";
    card.dataset.locked = unlocked ? "false" : "true";
    card.dataset.safe = safe ? "true" : "false";

    const actionLabel = unlocked ? (placed ? "Remove from room" : "Place in room") : `Buy for ${item.cost} gold`;
    const lockText = unlocked ? "Unlocked" : "Locked";
    const safeText = safe ? "Safe for use" : "Reference only / do not commit";

    card.innerHTML = `
      <div class="asset-preview"><img src="${item.src}" alt=""></div>
      <div class="asset-info">
        <strong>${item.name}</strong>
        <span>${item.category}</span>
        <small>${lockText} · ${safeText}</small>
        <small>${item.license}</small>
      </div>
      <button type="button" class="asset-action">${actionLabel}</button>
    `;

    card.querySelector(".asset-action").addEventListener("click", () => handleAssetAction(item));
    assetGrid.appendChild(card);
  });
}

function handleAssetAction(item) {
  if (!isUnlocked(item)) {
    if (houseState.gold < item.cost) {
      setStatus(`${item.name} is still blocked. You need ${item.cost} gold.`);
      return;
    }
    houseState.gold -= item.cost;
    houseState.unlockedItemIds.push(item.id);
    saveHouseState(houseState);
    setStatus(`${item.name} unlocked. It is now available to place.`);
    renderAll();
    return;
  }

  if (isPlaced(item)) {
    houseState.placedItemIds = houseState.placedItemIds.filter((id) => id !== item.id);
    setStatus(`${item.name} removed from the room.`);
  } else {
    houseState.placedItemIds.push(item.id);
    setStatus(`${item.name} placed in the room.`);
  }

  saveHouseState(houseState);
  renderAll();
}

function setMirrorOpen(open) {
  if (!mirrorPanel) return;
  mirrorPanel.classList.toggle("open", open);
  mirrorPanel.setAttribute("aria-hidden", open ? "false" : "true");
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

function resizeImageDataUrl(dataUrl, maxHeight = 780) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = image.height > maxHeight ? maxHeight / image.height : 1;
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => reject(new Error("Could not load image."));
    image.src = dataUrl;
  });
}

async function importAvatar(event) {
  event.preventDefault();
  const file = importAvatarFile.files?.[0];
  if (!file) {
    importStatus.textContent = "Choose an image first.";
    return;
  }

  importStatus.textContent = "Importing artwork...";

  try {
    const rawDataUrl = await readImageFile(file);
    const resizedDataUrl = await resizeImageDataUrl(rawDataUrl);
    const name = importAvatarName.value.trim() || file.name.replace(/\.[^.]+$/, "") || "Imported avatar";
    const id = `imported-avatar-${Date.now()}`;

    houseState.importedOutfits.push({
      id,
      name,
      note: "Imported paper-doll artwork saved in this browser.",
      src: resizedDataUrl
    });
    houseState.outfit = id;
    saveHouseState(houseState);
    renderOutfitGrid();
    applyOutfit();

    importAvatarForm.reset();
    importStatus.textContent = "Imported and selected. The room background stayed unchanged.";
  } catch (error) {
    importStatus.textContent = error.message || "Import failed.";
  }
}

async function importHomeItem(event) {
  event.preventDefault();
  const file = importItemFile.files?.[0];
  if (!file) {
    setStatus("Choose an item image first.");
    return;
  }

  const license = importItemLicense.value;
  const safe = safeLicenses.has(license);
  setStatus("Importing home item...");

  try {
    const rawDataUrl = await readImageFile(file);
    const resizedDataUrl = await resizeImageDataUrl(rawDataUrl, 520);
    const name = importItemName.value.trim() || file.name.replace(/\.[^.]+$/, "") || "Imported item";
    const cost = Math.max(0, Number(importItemCost.value || 0));
    const id = `imported-item-${Date.now()}`;

    houseState.importedItems.push({
      id,
      name,
      category: importItemCategory.value,
      note: safe ? "Imported item saved in this browser." : "Reference only. Do not commit unless permission is confirmed.",
      src: resizedDataUrl,
      cost,
      license,
      source: importItemSource.value.trim() || "No source note added",
      starterUnlocked: false,
      place: { x: 62, y: 58, w: 15 }
    });

    saveHouseState(houseState);
    importItemForm.reset();
    setStatus(safe ? "Imported as a locked item. Buy or unlock it before placing." : "Imported as reference-only and locked. Do not add it to the public repo unless permission is confirmed.");
    renderAll();
  } catch (error) {
    setStatus(error.message || "Import failed.");
  }
}

function renderAll() {
  renderGold();
  renderPlacedItems();
  renderAssetGrid();
}

if (openMirror) openMirror.addEventListener("click", () => setMirrorOpen(true));
if (closeMirror) closeMirror.addEventListener("click", () => setMirrorOpen(false));
if (mirrorPanel) {
  mirrorPanel.addEventListener("click", (event) => {
    if (event.target === mirrorPanel) setMirrorOpen(false);
  });
}

if (shopButton) {
  shopButton.addEventListener("click", () => {
    document.querySelector(".asset-library")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (importAvatarForm) importAvatarForm.addEventListener("submit", importAvatar);
if (importItemForm) importItemForm.addEventListener("submit", importHomeItem);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMirrorOpen(false);
});

renderOutfitGrid();
applyOutfit();
renderAll();



