const EsslayCharacterDisplay = (() => {
  function poseEntry(poseId) {
    const poses = window.EsslayCharacterPoses || {};
    return poses[poseId] || poses.idle_house || null;
  }

  function renderOne(node) {
    const poseId = node.dataset.characterPose || "idle_house";
    const entry = poseEntry(poseId);
    if (!entry) return;

    node.src = entry.src;
    node.alt = entry.label || poseId;
    node.dataset.characterPoseLoaded = poseId;
    node.title = entry.use || entry.label || poseId;
  }

  function renderAll(root = document) {
    root.querySelectorAll("img[data-character-pose]").forEach(renderOne);
  }

  function setPose(node, poseId) {
    node.dataset.characterPose = poseId;
    renderOne(node);
  }

  return { renderAll, setPose };
})();

document.addEventListener("DOMContentLoaded", () => {
  EsslayCharacterDisplay.renderAll();
});

window.EsslayCharacterDisplay = EsslayCharacterDisplay;
