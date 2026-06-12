(function () {
  var PLANNER_KEY = "focus-week-planner-v2";
  var OLD_PLANNER_KEY = "focus-week-planner-v1";
  var HOUSE_KEY = "esslay-house-state-v4";
  var WEEK_ROOM = {
    Study: "Desk",
    Admin: "Desk",
    "Life Planning": "Desk",
    "Daily Reset": "Bathroom / Kitchen",
    Cleaning: "Kitchen / Storage",
    "Room Setup": "Living Room",
    Shopping: "Front Door",
    Clothes: "Wardrobe",
    Creative: "Creative Nook",
    Rest: "Bedroom"
  };
  var STARTER = [
    ["Brush teeth", "Daily Reset", "low", "High", 5, "Go to the bathroom sink"],
    ["Water bottle", "Daily Reset", "low", "High", 5, "Fill one bottle"],
    ["Food check", "Daily Reset", "low", "High", 10, "Choose one easy food option"],
    ["Take out crockery", "Daily Reset", "low", "High", 10, "Collect cups/plates"],
    ["Reply to messages", "Admin", "low", "High", 10, "Reply to the easiest one"],
    ["Make shopping list", "Shopping", "low", "High", 15, "Add missing essentials"],
    ["Clothes reset", "Clothes", "medium", "Medium", 20, "Pick up five clothes"],
    ["Room reset", "Cleaning", "medium", "Medium", 20, "Clear one visible surface"],
    ["Creative tiny step", "Creative", "medium", "Medium", 20, "Open one reference image"],
    ["Rest block", "Rest", "low", "Low", 30, "Choose a stopping point first"]
  ];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char];
    });
  }

  function makeId() {
    return crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
  }

  function todayKey() {
    var now = new Date();
    return now.toISOString().slice(0, 10);
  }

  function weekStart(date) {
    var d = new Date(date || new Date());
    d.setHours(0, 0, 0, 0);
    var mondayOffset = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - mondayOffset);
    return d;
  }

  function weekKey(date) {
    var d = weekStart(date || new Date());
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  }

  function defaultPlanner() {
    return { tasks: [], weeks: {}, settings: { calmMode: false, hideDone: false, reminders: false, awakeStart: 6, awakeEnd: 23, slotMinutes: 30 } };
  }

  function loadPlanner() {
    var raw = localStorage.getItem(PLANNER_KEY) || localStorage.getItem(OLD_PLANNER_KEY);
    var planner;
    try { planner = raw ? JSON.parse(raw) : defaultPlanner(); } catch (error) { planner = defaultPlanner(); }
    planner.tasks = Array.isArray(planner.tasks) ? planner.tasks : [];
    planner.weeks = planner.weeks && typeof planner.weeks === "object" ? planner.weeks : {};
    planner.settings = planner.settings && typeof planner.settings === "object" ? planner.settings : defaultPlanner().settings;
    planner.weeks[weekKey()] = planner.weeks[weekKey()] || { instances: [] };
    planner.weeks[weekKey()].instances = Array.isArray(planner.weeks[weekKey()].instances) ? planner.weeks[weekKey()].instances : [];
    return planner;
  }

  function savePlanner(planner) {
    localStorage.setItem(PLANNER_KEY, JSON.stringify(planner));
  }

  function loadHouse() {
    try { return JSON.parse(localStorage.getItem(HOUSE_KEY)) || {}; } catch (error) { return {}; }
  }

  function saveHouse(house) {
    localStorage.setItem(HOUSE_KEY, JSON.stringify(house));
  }

  function ensureStarter(planner) {
    var added = 0;
    STARTER.forEach(function (item) {
      var exists = planner.tasks.some(function (task) { return String(task.name || "").toLowerCase() === item[0].toLowerCase() && !task.archived; });
      if (exists) return;
      planner.tasks.push({
        id: makeId(),
        name: item[0],
        frequency: 1,
        duration: item[4],
        energy: item[2],
        type: item[1],
        priority: item[3],
        category: item[1],
        step: item[5],
        details: "Added from Esslay Home Base.",
        archived: false,
        createdAt: new Date().toISOString()
      });
      added += 1;
    });
    ensureWeekInstances(planner);
    savePlanner(planner);
    return added;
  }

  function ensureWeekInstances(planner) {
    var key = weekKey();
    var week = planner.weeks[key] || { instances: [] };
    planner.weeks[key] = week;
    week.instances = Array.isArray(week.instances) ? week.instances : [];
    planner.tasks.filter(function (task) { return !task.archived; }).forEach(function (task) {
      var existing = week.instances.filter(function (instance) { return instance.taskId === task.id && !instance.deleted; });
      for (var i = existing.length; i < Number(task.frequency || 1); i += 1) {
        week.instances.push({
          id: makeId(),
          source: "recurring",
          taskId: task.id,
          sequence: i + 1,
          weekKey: key,
          scheduledAt: null,
          duration: task.duration,
          status: "unscheduled",
          note: "",
          notified: false,
          createdAt: new Date().toISOString()
        });
      }
    });
    savePlanner(planner);
  }

  function taskFor(planner, taskId) {
    return planner.tasks.find(function (task) { return task.id === taskId; });
  }

  function model(planner, instance) {
    var task = instance.taskId ? taskFor(planner, instance.taskId) : null;
    var isOneOff = instance.source === "one-off" || !instance.taskId;
    return {
      id: instance.id,
      title: isOneOff ? instance.title : ((task && task.name) || "Missing task") + " " + (instance.sequence || 1) + "/" + ((task && task.frequency) || 1),
      baseTitle: isOneOff ? instance.title : (task && task.name) || "Missing task",
      duration: instance.duration || (task && task.duration) || 30,
      energy: instance.energy || (task && task.energy) || "medium",
      type: instance.type || (task && task.type) || "Admin",
      priority: instance.priority || (task && task.priority) || "Medium",
      category: instance.category || (task && task.category) || "",
      step: instance.step || (task && task.step) || "",
      details: instance.details || (task && task.details) || "",
      status: instance.status || (instance.scheduledAt ? "scheduled" : "unscheduled"),
      scheduledAt: instance.scheduledAt || null,
      room: WEEK_ROOM[instance.type || (task && task.type)] || WEEK_ROOM[(task && task.type)] || "Desk"
    };
  }

  function weekInstances(planner) {
    ensureWeekInstances(planner);
    return (planner.weeks[weekKey()].instances || []).filter(function (instance) { return !instance.deleted; });
  }

  function priorityRank(value) {
    return { Highest: 0, High: 1, Medium: 2, Low: 3 }[value] == null ? 2 : { Highest: 0, High: 1, Medium: 2, Low: 3 }[value];
  }

  function orderedModels(planner) {
    return weekInstances(planner).map(function (instance) { return { instance: instance, data: model(planner, instance) }; })
      .sort(function (a, b) { return priorityRank(a.data.priority) - priorityRank(b.data.priority) || a.data.baseTitle.localeCompare(b.data.baseTitle); });
  }

  function isTodayScheduled(iso) {
    if (!iso) return false;
    return new Date(iso).toISOString().slice(0, 10) === todayKey();
  }

  function visibleForTab(planner, tab) {
    var list = orderedModels(planner);
    if (tab === "done") return list.filter(function (item) { return item.data.status === "done" || item.data.status === "skipped"; });
    if (tab === "today") return list.filter(function (item) { return isTodayScheduled(item.data.scheduledAt) || (!item.data.scheduledAt && item.data.status === "unscheduled"); }).slice(0, 6);
    if (tab === "rooms") return list;
    return list.filter(function (item) { return item.data.status !== "done" && item.data.status !== "skipped"; });
  }

  function addGold(amount) {
    var house = loadHouse();
    house.gold = Number(house.gold || 75) + amount;
    saveHouse(house);
    var gold = document.querySelector("#gold-count");
    if (gold) gold.textContent = house.gold;
  }

  function setStatus(instance, status) {
    var planner = loadPlanner();
    var found = weekInstances(planner).find(function (item) { return item.id === instance; });
    if (!found) return;
    found.status = status;
    if (status === "unscheduled") found.scheduledAt = null;
    savePlanner(planner);
    if (status === "done") addGold(5);
    renderTaskPanel(currentTab(), status === "done" ? "Done. +5 gold." : "Task updated.");
  }

  function currentTab() {
    return document.querySelector("#life-task-panel")?.dataset.tab || "today";
  }

  function summary(planner) {
    var list = orderedModels(planner);
    var done = list.filter(function (item) { return item.data.status === "done"; }).length;
    var skipped = list.filter(function (item) { return item.data.status === "skipped"; }).length;
    var open = list.filter(function (item) { return item.data.status !== "done" && item.data.status !== "skipped"; }).length;
    return '<div class="life-task-summary"><span class="life-task-chip">Open ' + open + '</span><span class="life-task-chip">Done ' + done + '</span><span class="life-task-chip">Skipped ' + skipped + '</span><span class="life-task-chip">Week ' + esc(weekKey()) + '</span></div>';
  }

  function tabs(active) {
    var items = [["today", "Today’s 3"], ["week", "This Week"], ["rooms", "By Room"], ["done", "Done / Skipped"], ["reward", "Rewards"]];
    return '<nav class="life-task-tabs" aria-label="Home task tabs">' + items.map(function (item) {
      return '<button type="button" data-life-task-tab="' + item[0] + '" aria-current="' + (active === item[0] ? "true" : "false") + '">' + item[1] + '</button>';
    }).join("") + '</nav>';
  }

  function taskCard(item) {
    var data = item.data;
    return '<article class="life-task-card" data-status="' + esc(data.status) + '"><h3>' + esc(data.baseTitle) + '</h3>' +
      '<div class="life-task-meta"><span class="life-task-chip">' + esc(data.room) + '</span><span class="life-task-chip">' + esc(data.type) + '</span><span class="life-task-chip">' + esc(data.priority) + '</span><span class="life-task-chip">' + esc(data.energy) + '</span><span class="life-task-chip">' + esc(data.duration) + ' min</span></div>' +
      '<p class="life-task-first-step">First step: ' + esc(data.step || "Start tiny") + '</p>' +
      (data.details ? '<p>' + esc(data.details) + '</p>' : '') +
      '<div class="life-task-actions"><button type="button" data-life-task-done="' + esc(item.instance.id) + '">Done +5g</button><button type="button" data-life-task-skip="' + esc(item.instance.id) + '">Skip</button><button type="button" data-life-task-unplan="' + esc(item.instance.id) + '">Unplan</button></div></article>';
  }

  function listPanel(planner, tab) {
    var items = visibleForTab(planner, tab);
    if (tab === "today") items = items.slice(0, 3);
    if (!items.length) return '<p class="life-task-empty">Nothing here yet. Load starter tasks or open the full calendar planner.</p>';
    return '<section class="life-task-list">' + items.map(taskCard).join("") + '</section>';
  }

  function roomsPanel(planner) {
    var grouped = {};
    orderedModels(planner).filter(function (item) { return item.data.status !== "done" && item.data.status !== "skipped"; }).forEach(function (item) {
      grouped[item.data.room] = grouped[item.data.room] || [];
      grouped[item.data.room].push(item);
    });
    var keys = Object.keys(grouped);
    if (!keys.length) return '<p class="life-task-empty">No open room tasks.</p>';
    return '<section class="life-task-room-list">' + keys.map(function (room) {
      return '<article class="life-task-room-block"><h3>' + esc(room) + '<span class="life-task-room-chip">' + grouped[room].length + '</span></h3>' + grouped[room].slice(0, 4).map(taskCard).join("") + '</article>';
    }).join("") + '</section>';
  }

  function rewardPanel(planner) {
    var done = orderedModels(planner).filter(function (item) { return item.data.status === "done"; }).length;
    var house = loadHouse();
    return '<article class="life-task-reward-card"><h3>Reward Chest</h3><p><strong>' + done + '</strong> done tasks this week.</p><p><strong>' + (house.gold || 75) + '</strong> gold in wallet.</p><p>Each Home task marked done gives +5 gold for now.</p></article>';
  }

  function contentFor(planner, tab) {
    if (tab === "rooms") return roomsPanel(planner);
    if (tab === "reward") return rewardPanel(planner);
    return listPanel(planner, tab);
  }

  function renderTaskPanel(tab, message) {
    var panel = document.querySelector("#life-task-panel");
    if (!panel) return;
    var planner = loadPlanner();
    var active = tab || "today";
    panel.dataset.tab = active;
    panel.innerHTML = '<div class="life-task-header"><div><p class="eyebrow">Focus Week × Home Base</p><h2>House Task Board</h2><p>' + esc(message || "Turn planner chores into room quests.") + '</p></div><button type="button" class="life-task-close" data-life-task-close>Close</button></div>' +
      summary(planner) + tabs(active) +
      '<div class="life-task-actions"><button type="button" data-life-task-starter>Load starter tasks</button><a href="https://izdrewz.github.io/calendar/planner.html" target="_blank" rel="noopener">Open full calendar</a></div>' +
      contentFor(planner, active);
  }

  function openTaskPanel(tab) {
    var panel = document.querySelector("#life-task-panel");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "life-task-panel";
      panel.className = "life-task-panel";
      panel.setAttribute("aria-live", "polite");
      document.body.appendChild(panel);
    }
    panel.classList.add("open");
    renderTaskPanel(tab || "today");
  }

  function closeTaskPanel() {
    document.querySelector("#life-task-panel")?.classList.remove("open");
  }

  function addTaskButton() {
    var nav = document.querySelector(".house-nav");
    if (nav && !nav.querySelector("[data-open-life-task-board]")) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "life-task-nav-button";
      button.dataset.openLifeTaskBoard = "true";
      button.textContent = "Tasks";
      nav.insertBefore(button, nav.firstChild);
    }
    var stage = document.querySelector("#room-stage");
    if (stage && !stage.querySelector(".life-task-room-hotspot")) {
      var hot = document.createElement("button");
      hot.type = "button";
      hot.className = "room-hotspot life-task-room-hotspot";
      hot.dataset.openLifeTaskBoard = "true";
      hot.textContent = "Tasks";
      stage.appendChild(hot);
    }
    var status = document.querySelector(".house-status .layer-note");
    if (status && !status.querySelector("[data-open-life-task-board]")) {
      var small = document.createElement("button");
      small.type = "button";
      small.className = "life-task-status-button";
      small.dataset.openLifeTaskBoard = "true";
      small.textContent = "Today’s tasks";
      status.appendChild(small);
    }
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-open-life-task-board]")) {
      event.preventDefault();
      openTaskPanel("today");
      return;
    }
    if (event.target.closest("[data-life-task-close]")) {
      event.preventDefault();
      closeTaskPanel();
      return;
    }
    var tab = event.target.closest("[data-life-task-tab]");
    if (tab) {
      event.preventDefault();
      renderTaskPanel(tab.dataset.lifeTaskTab);
      return;
    }
    var starter = event.target.closest("[data-life-task-starter]");
    if (starter) {
      event.preventDefault();
      var planner = loadPlanner();
      var added = ensureStarter(planner);
      renderTaskPanel(currentTab(), added ? "Starter tasks added." : "Starter tasks already loaded.");
      return;
    }
    var done = event.target.closest("[data-life-task-done]");
    if (done) {
      event.preventDefault();
      setStatus(done.dataset.lifeTaskDone, "done");
      return;
    }
    var skip = event.target.closest("[data-life-task-skip]");
    if (skip) {
      event.preventDefault();
      setStatus(skip.dataset.lifeTaskSkip, "skipped");
      return;
    }
    var unplan = event.target.closest("[data-life-task-unplan]");
    if (unplan) {
      event.preventDefault();
      setStatus(unplan.dataset.lifeTaskUnplan, "unscheduled");
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeTaskPanel();
  });

  addTaskButton();
})();