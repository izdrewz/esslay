const CHARACTER_HOUSE_SAVE_KEY = "esslay-house-state-v4";

const characterBuiltInOutfits = [
  {
    id: "base-neutral",
    name: "Base model",
    src: "assets/avatar/paperdoll/base-neutral.svg?v=1"
  },
  {
    id: "teal-adventurer",
    name: "Teal adventurer",
    src: "assets/avatar/paperdoll/teal-adventurer.svg?v=1"
  },
  {
    id: "dark-adventurer",
    name: "Dark bodice adventurer",
    src: "assets/avatar/paperdoll/dark-adventurer.svg?v=1"
  },
  {
    id: "babydoll-pink",
    name: "Pink babydoll dress",
    src: "assets/avatar/paperdoll/babydoll-pink.svg?v=1"
  }
];

function readCharacterState() {
  try {
    return JSON.parse(localStorage.getItem(CHARACTER_HOUSE_SAVE_KEY)) || {};
  } catch {
    return {};
  }
}

function currentCharacterOutfit() {
  const state = readCharacterState();
  const importedOutfits = Array.isArray(state.importedOutfits) ? state.importedOutfits : [];
  const allOutfits = [...characterBuiltInOutfits, ...importedOutfits];
  const selectedId = state.outfit || "teal-adventurer";
  return allOutfits.find((outfit) => outfit.id === selectedId) || characterBuiltInOutfits[1];
}

function renderCharacterLayers() {
  const outfit = currentCharacterOutfit();

  document.querySelectorAll("[data-character-layer]").forEach((image) => {
    image.src = outfit.src;
    image.alt = outfit.name || "Current character outfit";
    image.dataset.outfit = outfit.id || "selected-outfit";
  });
}

renderCharacterLayers();

window.addEventListener("storage", (event) => {
  if (event.key === CHARACTER_HOUSE_SAVE_KEY) renderCharacterLayers();
});
