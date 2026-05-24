const HOUSE_SAVE_KEY = "esslay-house-state-v2";

const outfits = [
  {
    id: "base-neutral",
    name: "Base model",
    note: "Neutral avatar layer for customisation.",
    src: "assets/avatar/paperdoll/base-neutral.svg?v=1"
  },
  {
    id: "teal-adventurer",
    name: "Teal adventurer",
    note: "Teal academic-adventurer outfit with satchel.",
    src: "assets/avatar/paperdoll/teal-adventurer.svg?v=1"
  },
  {
    id: "dark-adventurer",
    name: "Dark bodice adventurer",
    note: "Dark bodice and boots outfit.",
    src: "assets/avatar/paperdoll/dark-adventurer.svg?v=1"
  },
  {
    id: "babydoll-pink",
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
  return outfits.find((outfit) => outfit.id === houseState.outfit) || outfits[1];
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
