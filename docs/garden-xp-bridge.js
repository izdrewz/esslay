(function () {
  var PLANNER_KEY = "focus-week-planner-v2";
  var OLD_PLANNER_KEY = "focus-week-planner-v1";
  var GARDEN_KEY = "esslay-garden-state-v1";
  var XP_PER_HOME_TASK = 5;

  function todayWeekKey(date) {
    var d = new Date(date || new Date());
    d.setHours(0, 0, 0, 0);
    var mondayOffset = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - mondayOffset);
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  }

  function loadPlanner() {
    var raw = localStorage.getItem(PLANNER_KEY) || localStorage.getItem(OLD_PLANNER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function loadGarden() {
    try {
      var saved = JSON.parse(localStorage.getItem(GARDEN_KEY));
      if (saved && typeof saved === "object") return saved;
    } catch (error) {}
    return { xp: 0, creditedHomeTaskIds: [] };
  }

  function saveGarden(garden) {
    localStorage.setItem(GARDEN_KEY, JSON.stringify(garden));
  }

  function instanceIsDone(instanceId) {
    var planner = loadPlanner();
    var key = todayWeekKey();
    var instances = planner && planner.weeks && planner.weeks[key] && planner.weeks[key].instances;
    if (!Array.isArray(instances)) return false;
    return instances.some(function (instance) {
      return instance && instance.id === instanceId && instance.status === "done" && !instance.deleted;
    });
  }

  function creditGardenXp(instanceId) {
    if (!instanceId || !instanceIsDone(instanceId)) return;

    var garden = loadGarden();
    garden.creditedHomeTaskIds = Array.isArray(garden.creditedHomeTaskIds) ? garden.creditedHomeTaskIds : [];
    if (garden.creditedHomeTaskIds.indexOf(instanceId) !== -1) return;

    garden.xp = Math.max(0, Number(garden.xp || 0) + XP_PER_HOME_TASK);
    garden.creditedHomeTaskIds.push(instanceId);
    saveGarden(garden);
  }

  document.addEventListener("click", function (event) {
    var doneButton = event.target.closest("[data-life-task-done]");
    if (!doneButton) return;

    var instanceId = doneButton.dataset.lifeTaskDone;
    window.setTimeout(function () {
      creditGardenXp(instanceId);
    }, 0);
  });
})();
