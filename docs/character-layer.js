const CHARACTER_HOUSE_SAVE_KEY = "esslay-house-state-v4";
const CHARACTER_FINAL_AVATAR_PATH = "assets/characters/academic-adventurer/final";

const characterBuiltInOutfits = [
  {
    id: "base-neutral",
    name: "Base model",
    src: CHARACTER_FINAL_AVATAR_PATH + "/avatar_base_neutral.png?v=1"
  },
  {
    id: "teal-adventurer",
    name: "Default teal explorer",
    src: CHARACTER_FINAL_AVATAR_PATH + "/avatar_default_teal_explorer.png?v=1"
  },
  {
    id: "plaid-bodice-trousers",
    name: "Plaid bodice trousers",
    src: CHARACTER_FINAL_AVATAR_PATH + "/avatar_alt_plaid_bodice_trousers.png?v=1"
  },
  {
    id: "plaid-skirt-outfit",
    name: "Plaid skirt outfit",
    src: CHARACTER_FINAL_AVATAR_PATH + "/avatar_alt_plaid_skirt_outfit.png?v=1"
  },
  {
    id: "dark-adventurer",
    name: "Revised dark scholar",
    src: CHARACTER_FINAL_AVATAR_PATH + "/avatar_alt_dark_scholar_revised.png?v=1"
  },
  {
    id: "babydoll-pink",
    name: "Pink adventurer dress",
    src: CHARACTER_FINAL_AVATAR_PATH + "/avatar_alt_pink_adventurer_dress.png?v=1"
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
  const allOutfits = characterBuiltInOutfits.concat(importedOutfits);
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
