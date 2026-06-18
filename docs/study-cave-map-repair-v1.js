(function () {
  function repairMapImage() {
    document.querySelectorAll('link[data-study-cave-map-asset], link[href*="study-cave-map-asset-v1.css"]').forEach(function (link) {
      link.remove();
    });

    document.querySelectorAll('.study-cave-art-map__image').forEach(function (imageLayer) {
      imageLayer.style.setProperty('background-image', 'url("assets/study-cave/study-cave-map-v01.jpg?v=2")', 'important');
      imageLayer.style.setProperty('background-size', 'contain', 'important');
      imageLayer.style.setProperty('background-position', 'center center', 'important');
      imageLayer.style.setProperty('background-repeat', 'no-repeat', 'important');
      imageLayer.style.setProperty('background-color', '#d8ad6b', 'important');
    });
  }

  function scheduleRepair() {
    window.setTimeout(repairMapImage, 0);
    window.setTimeout(repairMapImage, 80);
    window.setTimeout(repairMapImage, 250);
    window.setTimeout(repairMapImage, 600);
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-action="open-task-map"]')) scheduleRepair();
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleRepair);
  } else {
    scheduleRepair();
  }
})();
