const RUG_STORAGE_KEY = "esslay-interior-design-rug-main";

const rugLabels = {
  default_rug: "Default Rug",
  rose_rug: "Rose Rug Test",
  forest_rug: "Forest Rug Test"
};

const savedTitle = document.querySelector("#saved-rug-title");
const savedMessage = document.querySelector("#saved-rug-message");

function applyRugStyle(styleId) {
  const safeStyle = rugLabels[styleId] ? styleId : "default_rug";
  document.body.dataset.rugStyle = safeStyle;
  localStorage.setItem(RUG_STORAGE_KEY, safeStyle);

  if (savedTitle) savedTitle.textContent = `${rugLabels[safeStyle]} saved`;
  if (savedMessage) savedMessage.textContent = `Saved rug_main as ${safeStyle}. This is only a placeholder save test for the future fixed-slot room system.`;
}

document.querySelectorAll("[data-rug-style]").forEach((button) => {
  button.addEventListener("click", () => applyRugStyle(button.dataset.rugStyle));
});

const existingRugStyle = localStorage.getItem(RUG_STORAGE_KEY);
if (existingRugStyle) {
  applyRugStyle(existingRugStyle);
}
