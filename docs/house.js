const HOUSE_SAVE_KEY = "esslay-house-state-v1";

const outfits = [
  {
    id: "teal-adventurer",
    name: "Teal adventurer",
    note: "Small pixel sprite with teal adventurer outfit.",
    src: "assets/avatar/outfits/teal-adventurer.svg?v=2"
  },
  {
    id: "scholar-burgundy",
    name: "Scholar burgundy",
    note: "Small pixel sprite with darker scholar outfit.",
    src: "assets/avatar/outfits/scholar-burgundy.svg?v=2"
  }
];

const avatarLayer = document.querySelector("#avatar-layer");
const mirrorPanel = document.querySelector("#mirror-panel");
const outfitGrid = document.querySelector("#outfit-grid");
const openMirror = document.querySelector("#open-mirror");
const closeMirror = document.querySelector("#close-mirror");

function loadHouseState() {
  try {
    return JSON.parse(localStorage.getItem(HOUSE_SAVE_KEY)) || { outfit: "teal-adventurer" };
  } catch {
    return { outfit: "teal-adventurer" };
  }
}

function saveHouseState(state) {
  localStorage.setItem(HOUSE_SAVE_KEY, JSON.stringify(state));
}

let houseState = loadHouseState();

function currentOutfit() {
  return outfits.find((outfit) => outfit.id === houseState.outfit) || outfits[0];
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

  outfits.forEach((outfit) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "outfit-card";
    button.dataset.outfit = outfit.id;
    button.setAttribute("aria-pressed", outfit.id === houseState.outfit ? "true" : "false");
    button.innerHTML = `
      <img src="${outfit.src}" alt="">
      <strong>${outfit.name}</strong>
      <span>${outfit.note}</span>
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

openMirror.addEventListener("click", () => setMirrorOpen(true));
closeMirror.addEventListener("click", () => setMirrorOpen(false));
mirrorPanel.addEventListener("click", (event) => {
  if (event.target === mirrorPanel) setMirrorOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMirrorOpen(false);
});

renderOutfitGrid();
applyOutfit();
