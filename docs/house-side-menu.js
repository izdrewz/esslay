(function () {
  function qs(selector) {
    return document.querySelector(selector);
  }

  function menu() {
    return qs("[data-house-side-menu]");
  }

  function menuButton() {
    return qs("[data-house-side-menu-open]");
  }

  function openMenu() {
    var panel = menu();
    var button = menuButton();
    if (!panel) return;
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    if (button) button.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    var panel = menu();
    var button = menuButton();
    if (!panel) return;
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    if (button) button.setAttribute("aria-expanded", "false");
  }

  function openAssetLibrary() {
    closeMenu();
    qs(".asset-library")?.classList.add("open");
  }

  function syncGold() {
    var mainGold = qs("#gold-count");
    var sideGold = qs("[data-house-side-gold]");
    if (mainGold && sideGold) sideGold.textContent = mainGold.textContent;
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-house-side-menu-open]")) {
      event.preventDefault();
      openMenu();
      syncGold();
      return;
    }

    if (event.target.closest("[data-house-side-menu-close]")) {
      event.preventDefault();
      closeMenu();
      return;
    }

    var panel = menu();
    if (panel && panel.classList.contains("open") && event.target === panel) {
      closeMenu();
      return;
    }

    if (event.target.closest("[data-open-asset-library]")) {
      event.preventDefault();
      openAssetLibrary();
    }
  });

  document.addEventListener("click", function (event) {
    if (event.target.closest("#life-task-panel, #life-admin-room-panel, .asset-library")) return;
    if (event.target.closest("[data-open-life-task-board], [data-open-life-admin-rooms], .house-side-menu a")) closeMenu();
  }, true);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  syncGold();
})();
