const CHARACTER_HOUSE_SAVE_KEY = "esslay-house-state-v4";
const CHARACTER_FINAL_AVATAR_PATH = "assets/characters/academic-adventurer/final";
const CHARACTER_AVATAR_VERSION = "v=2";

const characterBuiltInOutfits = [
  {
    id: "base-neutral",
    name: "Base model",
    src: CHARACTER_FINAL_AVATAR_PATH + "/avatar_base_neutral.png?" + CHARACTER_AVATAR_VERSION
  },
  {
    id: "teal-adventurer",
    name: "Default teal explorer",
    src: CHARACTER_FINAL_AVATAR_PATH + "/avatar_default_teal_explorer.png?" + CHARACTER_AVATAR_VERSION
  },
  {
    id: "plaid-bodice-trousers",
    name: "Plaid bodice trousers",
    src: CHARACTER_FINAL_AVATAR_PATH + "/avatar_alt_plaid_bodice_trousers.png?" + CHARACTER_AVATAR_VERSION
  },
  {
    id: "plaid-skirt-outfit",
    name: "Plaid skirt outfit",
    src: CHARACTER_FINAL_AVATAR_PATH + "/avatar_alt_plaid_skirt_outfit.png?" + CHARACTER_AVATAR_VERSION
  },
  {
    id: "dark-adventurer",
    name: "Revised dark scholar",
    src: CHARACTER_FINAL_AVATAR_PATH + "/avatar_alt_dark_scholar_revised.png?" + CHARACTER_AVATAR_VERSION
  },
  {
    id: "babydoll-pink",
    name: "Pink adventurer dress",
    src: CHARACTER_FINAL_AVATAR_PATH + "/avatar_alt_pink_adventurer_dress.png?" + CHARACTER_AVATAR_VERSION
  }
];

const characterRoomDefaults = {
  "house": null,
  "edit-room": "teal-adventurer",
  "edit-room-layered-test": "teal-adventurer",
  "edit-room-avatar-test": "teal-adventurer"
};

function readCharacterState() {
  try {
    return JSON.parse(localStorage.getItem(CHARACTER_HOUSE_SAVE_KEY)) || {};
  } catch {
    return {};
  }
}

function allCharacterOutfits(state) {
  const importedOutfits = Array.isArray(state.importedOutfits) ? state.importedOutfits : [];
  return characterBuiltInOutfits.concat(importedOutfits);
}

function roomOverrideId(state, roomId) {
  const overrides = state.roomOutfitOverrides || {};
  const override = overrides[roomId];

  if (typeof override === "string") return override;
  if (override && override.enabled !== false && override.outfitId) return override.outfitId;

  return characterRoomDefaults[roomId] || null;
}

function currentCharacterOutfit(roomId) {
  const state = readCharacterState();
  const allOutfits = allCharacterOutfits(state);
  const selectedId = roomOverrideId(state, roomId) || state.outfit || "teal-adventurer";
  return allOutfits.find((outfit) => outfit.id === selectedId) || characterBuiltInOutfits[1];
}

function renderCharacterLayers() {
  document.querySelectorAll("[data-character-layer]").forEach((image) => {
    const roomId = image.dataset.roomId || document.body.dataset.roomId || "house";
    const outfit = currentCharacterOutfit(roomId);

    image.src = outfit.src;
    image.alt = outfit.name || "Current character outfit";
    image.dataset.outfit = outfit.id || "selected-outfit";
  });
}

renderCharacterLayers();

window.addEventListener("storage", (event) => {
  if (event.key === CHARACTER_HOUSE_SAVE_KEY) renderCharacterLayers();
});
