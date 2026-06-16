(function () {
  var GARDEN_KEY = "esslay-garden-state-v1";
  var LEGACY_KEYS = ["esslay-garden-xp-v1"];

  var STAGES = [
    {
      minXp: 0,
      label: "Stage 1 — Newly planted",
      note: "A tiny sapling marks the start of long-term progress.",
      image: "assets/rooms/garden/xp-garden-stage-01-newly-planted.jpg?v=1",
      alt: "Cliffside XP Garden terrace with a newly planted magical sapling"
    },
    {
      minXp: 10,
      label: "Stage 2 — First growth",
      note: "The sapling has started responding to steady work.",
      image: "assets/rooms/garden/xp-garden-stage-02-first-growth.jpg?v=1",
      alt: "Cliffside XP Garden terrace with a young magical sapling"
    },
    {
      minXp: 25,
      label: "Stage 3 — Established",
      note: "The tree is rooted and visibly developing.",
      image: "assets/rooms/garden/xp-garden-stage-03-established.jpg?v=1",
      alt: "Cliffside XP Garden terrace with an established young magical tree"
    },
    {
      minXp: 45,
      label: "Stage 4 — Strong growth",
      note: "The XP tree is now strong enough to change the feel of the garden.",
      image: "assets/rooms/garden/xp-garden-stage-04-strong-growth.jpg?v=1",
      alt: "Cliffside XP Garden terrace with a stronger growing magical tree"
    },
    {
      minXp: 70,
      label: "Stage 5 — Mature",
      note: "The main growth arc is complete and the tree is fully formed.",
      image: "assets/rooms/garden/xp-garden-stage-05-mature.jpg?v=1",
      alt: "Cliffside XP Garden terrace with a mature leafy magical tree"
    },
    {
      minXp: 100,
      label: "Stage 6 — Bloom milestone",
      note: "A major progress milestone turns the tree into bloom.",
      image: "assets/rooms/garden/xp-garden-stage-06-bloom-milestone.jpg?v=1",
      alt: "Cliffside XP Garden terrace with a blossoming magical milestone tree"
    },
    {
      minXp: 135,
      label: "Stage 7 — Fruiting",
      note: "High progress is now producing visible results.",
      image: "assets/rooms/garden/xp-garden-stage-07-fruiting.jpg?v=1",
      alt: "Cliffside XP Garden terrace with a fruiting magical tree"
    },
    {
      minXp: 175,
      label: "Stage 8 — Harvest / mastery",
      note: "The tree has reached its harvest state for this progression set.",
      image: "assets/rooms/garden/xp-garden-stage-08-harvest-mastery.jpg?v=1",
      alt: "Cliffside XP Garden terrace with a ripe harvest magical tree"
    }
  ];

  function loadGarden() {
    var parsed;
    try {
      parsed = JSON.parse(localStorage.getItem(GARDEN_KEY));
    } catch (error) {
      parsed = null;
    }

    if (!parsed || typeof parsed !== "object") {
      parsed = { xp: 0, creditedHomeTaskIds: [] };
    }

    if (!Array.isArray(parsed.creditedHomeTaskIds)) {
      parsed.creditedHomeTaskIds = [];
    }

    parsed.xp = Number(parsed.xp || 0);
    return parsed;
  }

  function saveGarden(garden) {
    localStorage.setItem(GARDEN_KEY, JSON.stringify(garden));
  }

  function migrateLegacyXp(garden) {
    LEGACY_KEYS.forEach(function (key) {
      var legacy = Number(localStorage.getItem(key));
      if (legacy > garden.xp) {
        garden.xp = legacy;
        saveGarden(garden);
      }
    });
  }

  function stageForXp(xp) {
    return STAGES.reduce(function (current, stage) {
      return xp >= stage.minXp ? stage : current;
    }, STAGES[0]);
  }

  function renderGarden() {
    var garden = loadGarden();
    migrateLegacyXp(garden);

    var xp = Math.max(0, Number(garden.xp || 0));
    var stage = stageForXp(xp);
    var image = document.querySelector("#garden-room-image");
    var label = document.querySelector("#garden-stage-label");
    var xpValue = document.querySelector("#garden-xp-value");
    var note = document.querySelector("#garden-stage-note");

    if (image) {
      image.src = stage.image;
      image.alt = stage.alt;
    }

    if (label) label.textContent = stage.label;
    if (xpValue) xpValue.textContent = xp;
    if (note) note.textContent = stage.note;
  }

  window.esslayGardenAddXp = function (amount) {
    var garden = loadGarden();
    garden.xp = Math.max(0, Number(garden.xp || 0) + Number(amount || 0));
    saveGarden(garden);
    renderGarden();
    return garden.xp;
  };

  window.esslayGardenSetXp = function (xp) {
    var garden = loadGarden();
    garden.xp = Math.max(0, Number(xp || 0));
    saveGarden(garden);
    renderGarden();
    return garden.xp;
  };

  window.esslayGardenStages = STAGES.slice();

  renderGarden();
})();
