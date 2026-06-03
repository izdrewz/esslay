const EsslayCharacterDisplay = (() => {
  const fallbackPose = {
    src: "assets/characters/academic-adventurer/final/avatar_default_teal_explorer.png?v=4",
    label: "Default teal explorer",
    use: "Fallback avatar used when a requested pose image is not available yet."
  };

  function poseEntry(poseId) {
    const poses = window.EsslayCharacterPoses || {};
    return poses[poseId] || poses.idle_house || fallbackPose;
  }

  function applyFallback(node, requestedPoseId, requestedEntry) {
    if (node.dataset.characterPoseFallbackApplied === "true") return;

    node.dataset.characterPoseFallbackApplied = "true";
    node.dataset.characterPoseLoaded = "fallback-avatar";
    node.src = fallbackPose.src;
    node.alt = `${requestedEntry.label || requestedPoseId} unavailable; ${fallbackPose.label} fallback`;
    node.title = fallbackPose.use;
  }

  function renderOne(node) {
    const poseId = node.dataset.characterPose || "idle_house";
    const entry = poseEntry(poseId);
    if (!entry) return;

    node.dataset.characterPoseFallbackApplied = "false";
    node.onerror = () => applyFallback(node, poseId, entry);
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
