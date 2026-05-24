const HOUSE_SAVE_KEY = "esslay-house-state-v3";

const builtInOutfits = [
  {
    id: "base-neutral",
    type: "built-in",
    name: "Base model",
    note: "Neutral avatar layer for customisation.",
    src: "assets/avatar/paperdoll/base-neutral.svg?v=1"
  },
  {
    id: "teal-adventurer",
    type: "built-in",
    name: "Teal adventurer",
    note: "Teal academic-adventurer outfit with satchel.",
    src: "assets/avatar/paperdoll/teal-adventurer.svg?v=1"
  },
  {
    id: "dark-adventurer",
    type: "built-in",
    name: "Dark bodice adventurer",
    note: "Dark bodice and boots outfit.",
    src: "assets/avatar/paperdoll/dark-adventurer.svg?v=1"
  },
  {
    id: "babydoll-pink",
    type: "built-in",
    name: "Pink babydoll dress",
    note: "Pink dress outfit with satchel and boots.",
    src: "assets/avatar/paperdoll/babydoll-pink.svg?v=1"
  }
];

const avatarLayer = document.querySelector("#avatar-layer");
const mirrorPanel = document.querySelector("#mirror-panel");
const outfitGrid = document.querySelector("#outfit-grid");
const openMirror = document.querySelector("#open-mirror");
const closeMirror = document.querySelector("#close-mirror");
const importAvatarForm = document.querySelector("#import-avatar-form");
const importAvatarFile = document.querySelector("#import-avatar-file");
const importAvatarName = document.querySelector("#import-avatar-name");
const importStatus = document.querySelector("#import-status");

function defaultHouseState() {
  return {
    outfit: "teal-adventurer",
    importedOutfits: []
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
  return [
    ...builtInOutfits,
    ...houseState.importedOutfits.map((outfit) => ({ ...outfit, type: "imported" }))
  ];
}

function currentOutfit() {
  return allOutfits().find((outfit) => outfit.id === houseState.outfit) || builtInOutfits[1];
}

function applyOutfit() {
  const outfit = currentOutfit();
  avatarLayer.src = outfit.src;
  avatarLayer.alt = outfit.name;

  document.querySelectorAll(".outfit-card").forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.outfit === outfit.id ? "true" : "false");
  });
}

function renderOutfitGrid() {
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
      <span>${outfit.note}</span>
      <small>${outfit.type === "imported" ? "Imported artwork" : "Built-in placeholder"}</small>
    `;
    button.addEventListener("click", () => {
      houseState.outfit = outfit.id;
      saveHouseState(houseState);
      applyOutfit();
    });
    outfitGrid.appendChild(button);
  });
}

function setMirrorOpen(open) {
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
    const id = `imported-${Date.now()}`;

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

openMirror.addEventListener("click", () => setMirrorOpen(true));
closeMirror.addEventListener("click", () => setMirrorOpen(false));
mirrorPanel.addEventListener("click", (event) => {
  if (event.target === mirrorPanel) setMirrorOpen(false);
});

if (importAvatarForm) {
  importAvatarForm.addEventListener("submit", importAvatar);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMirrorOpen(false);
});

renderOutfitGrid();
applyOutfit();
