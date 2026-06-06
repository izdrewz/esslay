(function () {
  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button || button.dataset.action !== "source-begin") return;

    setTimeout(function () {
      var addSource = document.querySelector('button[data-action="source-open-notes"]');
      if (addSource) addSource.click();
    }, 60);
  }, true);
})();
