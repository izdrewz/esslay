(function () {
  var ROOM_ASSET_ROOT = "assets/rooms/home-life-admin/";
  var rooms = [
    {
      id: "desk-focus-planner",
      title: "Desk / Focus Planner",
      image: "home-desk-focus-planner.webp",
      plannerTypes: ["Study", "Admin", "Life Planning"],
      tasks: ["Focus Week Planner", "emails", "forms", "money/admin", "study setup", "timers"],
      tinyStep: "Open the planner or one form only.",
      hotspots: ["noticeboard", "planner desk", "hourglass", "papers", "cave arch"],
      note: "Main bridge between the calendar repo and Esslay house. This should open Today’s 3 / This Week, not the full calendar grid."
    },
    {
      id: "bathroom",
      title: "Bathroom / Washroom",
      image: "home-bathroom-sink.webp",
      plannerTypes: ["Daily Reset"],
      tasks: ["brush teeth", "wash face", "shower", "skincare", "meds", "hair reset"],
      tinyStep: "Stand at sink and do teeth only.",
      hotspots: ["mirror", "stone basin", "towel shelf", "soap", "medicine shelf"],
      note: "Use this for hygiene tasks so the living room does not become unrealistic."
    },
    {
      id: "kitchen",
      title: "Kitchen / Hearth",
      image: "home-kitchen-hearth.webp",
      plannerTypes: ["Daily Reset", "Cleaning", "Shopping"],
      tasks: ["water", "food", "dishes", "meal prep", "empty cups", "shopping list"],
      tinyStep: "Fill one bottle or clear one plate.",
      hotspots: ["hearth", "prep table", "sink area", "jars", "shopping basket"],
      note: "Food/body-care room. It can also surface low-energy kitchen reset cards."
    },
    {
      id: "bedroom",
      title: "Bedroom / Recovery",
      image: "home-bedroom-moonlit.webp",
      plannerTypes: ["Rest", "Daily Reset"],
      tasks: ["sleep reset", "make bed", "change bedding", "rest", "low-energy recovery"],
      tinyStep: "Put one thing on the bed or set a rest timer.",
      hotspots: ["bed", "window", "bedside candle", "blanket", "chest"],
      note: "Low-stimulation room. Use for recovery tasks, not chores that need movement."
    },
    {
      id: "wardrobe-laundry",
      title: "Wardrobe / Laundry",
      image: "home-wardrobe-laundry.webp",
      plannerTypes: ["Clothes", "Cleaning", "Room Setup"],
      tasks: ["laundry", "outfit prep", "put clothes away", "repairs", "sell clothes", "photos"],
      tinyStep: "Pick up five clothes or choose tomorrow’s outfit.",
      hotspots: ["wardrobe", "mirror", "laundry basket", "boots", "sewing stool"],
      note: "Connect this to the existing mirror/wardrobe and the calendar repo clothes stock page later."
    },
    {
      id: "front-door",
      title: "Front Door / Errands",
      image: "home-front-door-entry.webp",
      plannerTypes: ["Shopping", "Admin", "Room Setup"],
      tasks: ["appointments", "shopping", "post", "returns", "outside errands", "pack bag"],
      tinyStep: "Put shoes/bag by the door.",
      hotspots: ["open door", "cloak hooks", "boots", "satchel", "errand board"],
      note: "Outside-world task gate. Good place for appointment reminders and shopping prep."
    },
    {
      id: "creative-nook",
      title: "Creative Nook / Asset Desk",
      image: "home-creative-nook.webp",
      plannerTypes: ["Creative"],
      tasks: ["game backgrounds", "sprite fixes", "pose references", "Canva/Figma planning", "asset sorting"],
      tinyStep: "Open one reference image or make one small edit.",
      hotspots: ["pinboard", "sketches", "paint jars", "crystal", "desk"],
      note: "This is where visual novel background and character/art tasks should live."
    },
    {
      id: "recovery-library",
      title: "Recovery Library / Reward Room",
      image: "home-recovery-library.webp",
      plannerTypes: ["Rest", "Creative"],
      tasks: ["reading", "reward break", "quiet reset", "weekly review", "soft planning"],
      tinyStep: "Sit down and choose one quiet task.",
      hotspots: ["armchair", "books", "crystals", "rug", "lantern"],
      note: "Optional later room. Beautiful but should not be used for hygiene/food chores."
    }
  ];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char];
    });
  }

  function roomById(id) {
    return rooms.find(function (room) { return room.id === id; }) || rooms[0];
  }

  function chips(items) {
    return items.map(function (item) {
      return '<span class="life-room-chip">' + esc(item) + '</span>';
    }).join("");
  }

  function renderPanel() {
    if (document.querySelector("#life-admin-room-panel")) return;
    var houseShell = document.querySelector(".house-shell") || document.body;
    var panel = document.createElement("section");
    panel.id = "life-admin-room-panel";
    panel.className = "life-admin-room-panel";
    panel.setAttribute("aria-labelledby", "life-admin-room-title");
    panel.innerHTML = '<div class="life-room-header"><div><p class="eyebrow">Home Base expansion</p><h2 id="life-admin-room-title">Life Admin Rooms</h2><p>Focus Week Planner tasks become realistic house rooms instead of all happening in the living room.</p></div><button type="button" data-life-room-close>Close</button></div><div class="life-room-grid">' +
      rooms.map(function (room) {
        return '<button type="button" class="life-room-card" data-life-room="' + esc(room.id) + '" style="--room-bg:url(' + ROOM_ASSET_ROOT + esc(room.image) + ')"><span>' + esc(room.title) + '</span><small>' + esc(room.tinyStep) + '</small></button>';
      }).join("") + '</div><div id="life-room-detail" class="life-room-detail" aria-live="polite"></div>';
    houseShell.appendChild(panel);
    renderDetail(rooms[0].id);
  }

  function renderDetail(id) {
    var target = document.querySelector("#life-room-detail");
    if (!target) return;
    var room = roomById(id);
    target.innerHTML = '<article class="life-room-detail-card" style="--room-bg:url(' + ROOM_ASSET_ROOT + esc(room.image) + ')">' +
      '<div class="life-room-preview" aria-hidden="true"></div>' +
      '<div class="life-room-copy"><h3>' + esc(room.title) + '</h3>' +
      '<p><strong>Use for:</strong></p><p>' + chips(room.tasks) + '</p>' +
      '<p><strong>Planner types:</strong></p><p>' + chips(room.plannerTypes) + '</p>' +
      '<p><strong>Tiny first step:</strong> ' + esc(room.tinyStep) + '</p>' +
      '<p><strong>Clickable objects:</strong></p><p>' + chips(room.hotspots) + '</p>' +
      '<p class="life-room-note">' + esc(room.note) + '</p>' +
      '</div></article>';
    document.querySelectorAll(".life-room-card").forEach(function (card) {
      card.setAttribute("aria-pressed", card.dataset.lifeRoom === id ? "true" : "false");
    });
  }

  function openPanel() {
    renderPanel();
    document.querySelector("#life-admin-room-panel")?.classList.add("open");
  }

  function closePanel() {
    document.querySelector("#life-admin-room-panel")?.classList.remove("open");
  }

  function addNavButton() {
    if (document.querySelector("[data-house-side-menu]")) return;
    var nav = document.querySelector(".house-nav");
    if (!nav || nav.querySelector("[data-open-life-admin-rooms]")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "life-admin-nav-button";
    button.dataset.openLifeAdminRooms = "true";
    button.textContent = "Life Admin Rooms";
    nav.insertBefore(button, nav.firstChild);
  }

  function addStatusButton() {
    if (document.querySelector("[data-house-side-menu]")) return;
    var status = document.querySelector(".house-status .layer-note");
    if (!status || status.querySelector("[data-open-life-admin-rooms]")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "life-admin-status-button";
    button.dataset.openLifeAdminRooms = "true";
    button.textContent = "Open room map";
    status.appendChild(button);
  }

  document.addEventListener("click", function (event) {
    var openButton = event.target.closest("[data-open-life-admin-rooms]");
    if (openButton) {
      event.preventDefault();
      openPanel();
      return;
    }
    var closeButton = event.target.closest("[data-life-room-close]");
    if (closeButton) {
      event.preventDefault();
      closePanel();
      return;
    }
    var card = event.target.closest("[data-life-room]");
    if (card) {
      event.preventDefault();
      renderDetail(card.dataset.lifeRoom);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closePanel();
  });

  addNavButton();
  addStatusButton();
})();
