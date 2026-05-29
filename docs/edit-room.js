const editRoomHotspots = [
  {
    id: "interior_design_board",
    label: "Interior Design Board",
    target: "interior-design-board-placeholder",
    rect: { x: 0.31, y: 0.07, width: 0.41, height: 0.43 },
    unlocked: true,
    placeholder: true,
    message: "Interior Design Board is a Version 0.1 placeholder. Later it will hold room ideas, furniture ideas, wallpaper, carpet, colour swatches, pattern swatches, wall decor, creative design notes, and planning scraps."
  },
  {
    id: "desk",
    label: "Desk",
    target: "writing-desk-placeholder",
    rect: { x: 0.59, y: 0.54, width: 0.34, height: 0.39 },
    unlocked: true,
    placeholder: true,
    message: "Desk is a Version 0.1 placeholder. Later it will open the writing, editing, dirty-draft, and repair workspace."
  },
  {
    id: "door",
    label: "Back to House",
    target: "house-hub",
    rect: { x: 0.00, y: 0.15, width: 0.16, height: 0.62 },
    unlocked: true,
    placeholder: false,
    message: "Return to the house hub."
  },
  {
    id: "source_shelf",
    label: "Sources",
    target: "source-library-placeholder",
    rect: { x: 0.72, y: 0.17, width: 0.11, height: 0.42 },
    unlocked: true,
    placeholder: true,
    message: "Sources is a Version 0.1 placeholder. Later it can connect to tmazing-style source storage, quote geodes, and evidence loot."
  },
  {
    id: "chest",
    label: "Scraps",
    target: "scraps-placeholder",
    rect: { x: 0.00, y: 0.72, width: 0.14, height: 0.26 },
    unlocked: true,
    placeholder: true,
    message: "Scraps is a Version 0.1 placeholder. Later it will hold fix-later notes, missed loot, rough fragments, and saved ideas."
  }
];

const titleNode = document.querySelector("#edit-room-message-title");
const messageNode = document.querySelector("#edit-room-message");

function announceHotspot(hotspot) {
  if (titleNode) titleNode.textContent = hotspot.label;
  if (messageNode) messageNode.textContent = hotspot.message;
}

document.querySelectorAll("[data-edit-hotspot]").forEach((button) => {
  button.addEventListener("click", () => {
    const hotspot = editRoomHotspots.find((item) => item.id === button.dataset.editHotspot);
    if (hotspot) announceHotspot(hotspot);
  });
});
