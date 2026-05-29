const editRoomLightingModes = {
  auto: { label: "Auto", note: "Uses the computer time." },
  morning: { label: "Morning", note: "Soft warm daylight." },
  afternoon: { label: "Afternoon", note: "Warm settled daylight." },
  evening: { label: "Evening", note: "Amber candle mood." },
  night: { label: "Night", note: "Darker candlelit mood." },
  rainy: { label: "Rainy", note: "Cool window light with warm room glow." }
};

const editRoomLightingStorageKey = "esslay-edit-room-lighting-mode";

function getEditRoomLightingFromClock() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function getEffectiveEditRoomLighting(choice) {
  return choice === "auto" ? getEditRoomLightingFromClock() : choice;
}

function setEditRoomLighting(choice) {
  const safeChoice = editRoomLightingModes[choice] ? choice : "auto";
  const effectiveChoice = getEffectiveEditRoomLighting(safeChoice);
  const stage = document.querySelector(".edit-room-stage");

  if (stage) {
    stage.dataset.lightingMode = effectiveChoice;
    stage.dataset.lightingChoice = safeChoice;
  }

  document.querySelectorAll("[data-lighting-option]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.lightingOption === safeChoice));
  });

  localStorage.setItem(editRoomLightingStorageKey, safeChoice);
}

function buildEditRoomLightingControls() {
  const header = document.querySelector(".edit-room-header");
  if (!header || document.querySelector(".lighting-controls")) return;

  const controls = document.createElement("section");
  controls.className = "lighting-controls";
  controls.setAttribute("aria-label", "Edit room lighting");

  const label = document.createElement("span");
  label.className = "lighting-controls-label";
  label.textContent = "Lighting";
  controls.appendChild(label);

  Object.entries(editRoomLightingModes).forEach(([mode, info]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.lightingOption = mode;
    button.textContent = info.label;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => setEditRoomLighting(mode));
    controls.appendChild(button);
  });

  header.appendChild(controls);
}

buildEditRoomLightingControls();
setEditRoomLighting(localStorage.getItem(editRoomLightingStorageKey) || "auto");
