(function () {
  function qs(selector) {
    return document.querySelector(selector);
  }

  function closeAssetLibrary() {
    qs(".asset-library")?.classList.remove("open");
  }

  function openAssetLibrary() {
    qs(".asset-library")?.classList.add("open");
  }

  function addLifeAdminHotspot() {
    var stage = qs("#room-stage");
    if (!stage || stage.querySelector("[data-open-life-admin-rooms].life-admin-room-hotspot")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "room-hotspot life-admin-room-hotspot";
    button.dataset.openLifeAdminRooms = "true";
    button.setAttribute("aria-label", "Open Life Admin room map");
    button.textContent = "Life Admin";
    stage.appendChild(button);
  }

  function addAssetLibraryClose() {
    var header = qs(".asset-library-header");
    if (!header || header.querySelector("[data-close-asset-library]")) return;
    var close = document.createElement("button");
    close.type = "button";
    close.className = "asset-library-close";
    close.dataset.closeAssetLibrary = "true";
    close.textContent = "Close";
    header.appendChild(close);
  }

  function addAvatarPausedNote() {
    var stage = qs("#room-stage");
    if (!stage || stage.querySelector(".house-avatar-paused-note")) return;
    var note = document.createElement("p");
    note.className = "house-avatar-paused-note";
    note.textContent = "Avatar hidden until approved house outfit/layer is chosen.";
    stage.appendChild(note);
  }

  function installHoverHelp() {
    var headerCopy = qs(".house-header > div");
    var headerNote = qs(".house-header p:not(.eyebrow)");
    if (headerCopy && headerNote) {
      var help = headerNote.textContent.trim();
      headerCopy.dataset.hoverHelp = help;
      headerCopy.title = help;
      headerCopy.tabIndex = 0;
      headerNote.setAttribute("aria-hidden", "true");
    }

    var roomTitle = qs("#room-level-title");
    var roomNote = qs("#room-level-note");
    if (roomTitle && roomNote) {
      var fullTitle = roomTitle.textContent.trim();
      var note = roomNote.textContent.trim();
      roomTitle.textContent = "Living room";
      roomTitle.dataset.hoverHelp = fullTitle + ": " + note;
      roomTitle.title = roomTitle.dataset.hoverHelp;
      roomTitle.tabIndex = 0;
      roomNote.setAttribute("aria-hidden", "true");
    }

    var wallet = qs(".layer-note");
    if (wallet) {
      var walletText = wallet.textContent.replace(/\s+/g, " ").trim();
      wallet.dataset.hoverHelp = walletText || "Wallet and rewards.";
      wallet.title = wallet.dataset.hoverHelp;
      wallet.tabIndex = 0;
    }
  }

  function retargetWardrobeButton() {
    var wardrobe = qs(".desk-hotspot");
    if (!wardrobe || wardrobe.dataset.houseNoScrollReady === "true") return;
    wardrobe.dataset.houseNoScrollReady = "true";
    wardrobe.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openAssetLibrary();
    }, true);
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-close-asset-library]")) {
      event.preventDefault();
      closeAssetLibrary();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeAssetLibrary();
  });

  addLifeAdminHotspot();
  addAssetLibraryClose();
  addAvatarPausedNote();
  installHoverHelp();
  retargetWardrobeButton();
})();