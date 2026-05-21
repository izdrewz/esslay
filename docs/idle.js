const SAVE_KEY = "esslay-game-save-v2";
const seasonLabel = document.querySelector("#season-label");
const timeLabel = document.querySelector("#time-label");
const xpLabel = document.querySelector("#xp-label");
const home = document.querySelector("#home");
const homeTier = document.querySelector("#home-tier");
const homeNote = document.querySelector("#home-note");
const particleLayer = document.querySelector("#sky-particles");

function getSave() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
  } catch {
    return {};
  }
}

function getSeason(date = new Date()) {
  const month = date.getMonth() + 1;
  if ([3, 4, 5].includes(month)) return "spring";
  if ([6, 7, 8].includes(month)) return "summer";
  if ([9, 10, 11].includes(month)) return "autumn";
  return "winter";
}

function getTimePhase(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 6 && hour < 18) return "day";
  return "night";
}

function homeTierFromXp(xp) {
  if (xp >= 700) return 3;
  if (xp >= 250) return 2;
  return 1;
}

function applyScene() {
  const now = new Date();
  const save = getSave();
  const xp = Number(save.player?.xp || 0);
  const season = getSeason(now);
  const phase = getTimePhase(now);
  const tier = homeTierFromXp(xp);

  document.body.className = `${season} ${phase}`;
  seasonLabel.textContent = season[0].toUpperCase() + season.slice(1);
  timeLabel.textContent = phase === "day" ? "Day" : "Night";
  xpLabel.textContent = xp;

  home.classList.remove("tier-2", "tier-3");
  if (tier > 1) home.classList.add(`tier-${tier}`);

  if (tier === 1) {
    homeTier.textContent = "Peasant cottage";
    homeNote.textContent = "A small medieval home. Earn XP to make it warmer, richer, and more magical.";
  } else if (tier === 2) {
    homeTier.textContent = "Cosy adventurer cottage";
    homeNote.textContent = "Your home is improving: warmer walls, stronger roof, brighter windows.";
  } else {
    homeTier.textContent = "Whimsical scholar home";
    homeNote.textContent = "Your base now feels more enchanted, decorated, and lived-in.";
  }

  makeParticles(season);
}

function makeParticles(season) {
  const count = season === "summer" ? 18 : 34;
  particleLayer.innerHTML = "";

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${6 + Math.random() * 9}s`;
    particle.style.animationDelay = `${Math.random() * -10}s`;
    particle.style.setProperty("--drift", `${-120 + Math.random() * 240}px`);

    if (season === "summer") {
      const size = 4 + Math.random() * 8;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
    }

    particleLayer.appendChild(particle);
  }
}

applyScene();
setInterval(applyScene, 60000);
