(function () {
  const KEY = "esslay-study-cave-simple-v1";

  const arr = value => Array.isArray(value) ? value.filter(Boolean) : [];
  const clean = (value, limit = 500) => String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
  const uid = () => "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  const esc = value => String(value ?? "").replace(/[&<>"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[char]));

  function timeNow() {
    try {
      return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return new Date().toISOString();
    }
  }

  function loadState() {
    let state = null;

    try {
      state = JSON.parse(localStorage.getItem(KEY));
    } catch {
      state = null;
    }

    if (!state || typeof state !== "object") state = {};

    state.completed = arr(state.completed);
    state.unlocked = arr(state.unlocked);

    state.briefFog = state.briefFog && typeof state.briefFog === "object" ? state.briefFog : {};

    state.sourceMine = state.sourceMine && typeof state.sourceMine === "object" ? state.sourceMine : {};
    state.sourceMine.evidenceGems = arr(state.sourceMine.evidenceGems);

    state.routeRooms = state.routeRooms && typeof state.routeRooms === "object" ? state.routeRooms : {};
    state.routeRooms["draft-route"] =
      state.routeRooms["draft-route"] && typeof state.routeRooms["draft-route"] === "object"
        ? state.routeRooms["draft-route"]
        : {};

    state.routeRooms["draft-route"].started = true;
    state.routeRooms["draft-route"].markers = arr(state.routeRooms["draft-route"].markers);

    state.lastSavedAt = state.lastSavedAt || "Not saved yet";
    state.lastAction = state.lastAction || "Ready";

    return state;
  }

  function saveState(state, message) {
    state.lastSavedAt = timeNow();
    state.lastAction = message || "Saved locally";

    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}

    document.querySelectorAll("[data-flow-progress]").forEach(node => {
      node.textContent = arr(state.completed).length + " / 7";
    });
  }

  function getStage() {
    return document.getElementById("stage-scene");
  }

  function routeState(state) {
    return state.routeRooms["draft-route"];
  }

  function evidenceGems(state) {
    return arr(state.sourceMine.evidenceGems);
  }

  function routeMarkers(state) {
    return arr(routeState(state).markers).sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  }

  function sourceLabel(gem) {
    return clean(gem.citationLabel || gem.sourceTitle || "source", 120);
  }

  function getBuckets(state) {
    let buckets =
      state.briefFog.taskMap && arr(state.briefFog.taskMap.buckets).length
        ? state.briefFog.taskMap.buckets
        : evidenceGems(state).map(gem => clean(gem.bucket, 80)).filter(Boolean);

    if (!buckets.length) {
      buckets = ["planning", "source notes", "drafting", "proofreading", "referencing habits"];
    }

    const seen = {};
    return buckets.map(bucket => clean(bucket, 80)).filter(bucket => {
      const key = bucket.toLowerCase();
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function gemsForBucket(state, bucket) {
    return evidenceGems(state).filter(gem => {
      return clean(gem.bucket, 80).toLowerCase() === bucket.toLowerCase();
    });
  }

  function saveInfo(state) {
    return `
      <p class="save-status">
        <strong>Browser save:</strong> ${esc(state.lastSavedAt)} · ${esc(state.lastAction)}
      </p>`;
  }

  function styles() {
    return `
      <style data-draft-route-v1>
        .draft-route-room {
          background-image:
            linear-gradient(180deg, rgba(5,4,8,.18), rgba(5,4,8,.38)),
            url("assets/study-cave/draft-route-placeholder-v01.png"),
            url("assets/study-cave/source-mine-placeholder-v01.png"),
            linear-gradient(135deg,#17111d,#463721) !important;
        }

        .draft-route-card {
          width: min(580px, 48vw) !important;
          max-height: calc(100% - 92px) !important;
          overflow: auto !important;
          padding: 14px !important;
        }

        .draft-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 8px 0 10px;
        }

        .draft-tabs button {
          border: 1px solid rgba(236,215,170,.75);
          border-radius: 999px;
          padding: 6px 9px;
          background: rgba(25,16,10,.88);
          color: #fff7df;
          font-weight: 900;
          cursor: pointer;
        }

        .draft-tabs button[aria-current="true"] {
          background: rgba(255,231,171,.92);
          color: #2f2118;
        }

        .draft-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .draft-box,
        .draft-gem {
          padding: 9px;
          border-radius: 14px;
          border: 1px solid rgba(255,231,171,.38);
          background: rgba(7,10,18,.72);
        }

        .draft-chip {
          display: inline-block;
          padding: 3px 7px;
          border-radius: 999px;
          background: rgba(255,231,171,.9);
          color: #2f2118;
          font-weight: 900;
          font-size: .78rem;
          margin: 2px;
        }

        .draft-card-text {
          max-height: 80px;
          overflow: auto;
          padding: 7px;
          border-radius: 10px;
          background: rgba(255,255,255,.08);
          font-size: .88rem;
        }

        .draft-list li {
          margin: 6px 0;
        }

        @media(max-width:920px) {
          .draft-route-card {
            width: calc(100% - 28px) !important;
          }

          .draft-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>`;
  }

  function tabs(activeTab) {
    return `
      <nav class="draft-tabs">
        <button type="button" data-action="draft-tab" data-tab="planner" aria-current="${activeTab === "planner"}">Route Planner</button>
        <button type="button" data-action="draft-tab" data-tab="evidence" aria-current="${activeTab === "evidence"}">Evidence Cart</button>
        <button type="button" data-action="draft-tab" data-tab="review" aria-current="${activeTab === "review"}">Review Route</button>
        <button type="button" data-action="draft-tab" data-tab="missing" aria-current="${activeTab === "missing"}">Missing</button>
      </nav>`;
  }

  function routeList(state) {
    const markers = routeMarkers(state);

    if (!markers.length) {
      return "<p>No route markers saved yet.</p>";
    }

    return `
      <ol class="draft-list">
        ${markers.map(marker => `
          <li>
            <strong>${esc(marker.title || marker.focus || marker.bucket)}</strong><br>
            <span>${esc(marker.bucket || "")} · ${esc(marker.citationLabel || "source")}</span>
            <div class="draft-card-text">${esc(marker.detail || marker.evidence || "")}</div>
            <em>${esc(marker.note || marker.purpose || "")}</em>
          </li>
        `).join("")}
      </ol>`;
  }

  function paragraphForgeButton(state) {
    return routeMarkers(state).length
      ? '<div class="simple-actions"><button type="button" data-action="route-next" data-room="draft-route">Continue to Paragraph Forge</button></div>'
      : '';
  }

  function plannerPanel(state) {
    return `
      <h3>Route Planner</h3>
      <p>Turn Source Mine evidence gems into paragraph route markers.</p>
      <p><strong>Evidence gems:</strong> ${evidenceGems(state).length} · <strong>Route markers:</strong> ${routeMarkers(state).length}</p>

      <div class="draft-grid">
        ${getBuckets(state).map(bucket => {
          const gemCount = gemsForBucket(state, bucket).length;
          const markerCount = routeMarkers(state).filter(marker => {
            return clean(marker.bucket, 80).toLowerCase() === bucket.toLowerCase();
          }).length;

          return `
            <article class="draft-box">
              <strong>${esc(bucket)}</strong><br>
              <span class="draft-chip">${gemCount} gem${gemCount === 1 ? "" : "s"}</span>
              <span class="draft-chip">${markerCount} marker${markerCount === 1 ? "" : "s"}</span>
            </article>`;
        }).join("")}
      </div>

      <div class="simple-actions">
        <button type="button" data-action="draft-build-route">Build route from evidence gems</button>
        <button type="button" data-action="draft-tab" data-tab="evidence">Choose gems manually</button>
      </div>

      <h3>Current route</h3>
      ${routeList(state)}
      ${paragraphForgeButton(state)}`;
  }

  function evidencePanel(state) {
    const gems = evidenceGems(state);

    if (!gems.length) {
      return `
        <h3>Evidence Cart</h3>
        <p>No Source Mine evidence gems yet. Go back and save at least one evidence gem first.</p>
        <button type="button" data-action="open-source-mine">Source Mine</button>`;
    }

    return `
      <h3>Evidence Cart</h3>
      ${gems.map(gem => {
        const used = routeMarkers(state).some(marker => marker.evidenceGemId === gem.id);

        return `
          <article class="draft-gem">
            <strong>${esc(gem.bucket || "bucket")}</strong>
            <span class="draft-chip">${esc(sourceLabel(gem))}</span>
            <div class="draft-card-text">${esc(gem.evidence || "")}</div>
            <div class="simple-actions">
              ${
                used
                  ? `<button type="button" disabled>Already on route</button>`
                  : `<button type="button" data-action="draft-add-gem" data-gem-id="${esc(gem.id)}">Add marker</button>`
              }
            </div>
          </article>`;
      }).join("")}`;
  }

  function missingPanel(state) {
    const missing = getBuckets(state).filter(bucket => !gemsForBucket(state, bucket).length);

    const weak = getBuckets(state).filter(bucket => {
      return gemsForBucket(state, bucket).length &&
        !routeMarkers(state).some(marker => clean(marker.bucket, 80).toLowerCase() === bucket.toLowerCase());
    });

    return `
      <h3>Missing</h3>
      <p><strong>No evidence gems:</strong> ${missing.length ? missing.map(esc).join(", ") : "none"}</p>
      <p><strong>Evidence exists but no route marker:</strong> ${weak.length ? weak.map(esc).join(", ") : "none"}</p>`;
  }

  function panelBody(state, activeTab) {
    if (activeTab === "evidence") return evidencePanel(state);

    if (activeTab === "review") {
      return `
        <h3>Review Route</h3>
        ${routeList(state)}
        ${paragraphForgeButton(state)}`;
    }

    if (activeTab === "missing") return missingPanel(state);

    return plannerPanel(state);
  }

  function renderDraftRoute(tab, message) {
    const state = loadState();
    const node = getStage();

    if (!node) return;

    document.querySelectorAll("details[open]").forEach(details => {
      details.open = false;
    });

    node.hidden = false;

    state.current = "draft-route";

    if (!state.unlocked.includes("draft-route")) {
      state.unlocked.push("draft-route");
    }

    routeState(state).started = true;
    routeState(state).activeTab = tab || routeState(state).activeTab || "planner";

    saveState(state, message || "Opened Draft Route");

    node.innerHTML = `
      ${styles()}
      <section class="simple-room draft-route-room">
        <p class="scene-label">Draft Route</p>
        <article class="stage-card simple-card draft-route-card">
          <h2>Draft Route</h2>
          <p>Choose the order your evidence will travel in before Paragraph Forge.</p>
          ${saveInfo(state)}
          ${tabs(routeState(state).activeTab)}
          ${panelBody(state, routeState(state).activeTab)}
          <div class="simple-actions">
            <button type="button" data-action="open-source-mine">Source Mine</button>
            <button type="button" data-action="open-task-map">Task Map</button>
          </div>
        </article>
      </section>`;
  }

  function buildRoute() {
    const state = loadState();
    const existingGemIds = new Set(routeMarkers(state).map(marker => marker.evidenceGemId));
    const newGems = evidenceGems(state).filter(gem => !existingGemIds.has(gem.id));

    if (!newGems.length) {
      return renderDraftRoute("planner", "No new gems to add");
    }

    newGems.forEach(gem => addMarkerForGem(state, gem));

    saveState(state, `Built ${newGems.length} route marker(s)`);
    renderDraftRoute("planner", `Built ${newGems.length} route marker(s)`);
  }

  function addMarkerForGem(state, gem) {
    const marker = {
      id: uid(),
      order: routeMarkers(state).length + 1,
      bucket: clean(gem.bucket, 80) || "uncategorised",
      title: clean(gem.bucket || "Paragraph point", 120),
      focus: clean(gem.bucket || "Paragraph point", 120),
      evidenceGemId: gem.id,
      citationLabel: sourceLabel(gem),
      detail: clean(gem.evidence, 1600),
      evidence: clean(gem.evidence, 1600),
      note: clean(gem.note || gem.link || gem.purpose, 600),
      purpose: clean(gem.note || gem.link || gem.purpose, 600),
      createdAt: new Date().toISOString()
    };

    routeState(state).markers.push(marker);

    if (!state.unlocked.includes("paragraph-forge")) {
      state.unlocked.push("paragraph-forge");
    }
  }

  function addGem(gemId) {
    const state = loadState();
    const gem = evidenceGems(state).find(item => item.id === gemId);

    if (!gem) return renderDraftRoute("evidence", "Evidence gem not found");

    if (routeMarkers(state).some(marker => marker.evidenceGemId === gem.id)) {
      return renderDraftRoute("evidence", "Evidence gem already on route");
    }

    addMarkerForGem(state, gem);
    saveState(state, "Added evidence gem to route");
    renderDraftRoute("review", "Added evidence gem to route");
  }

  document.addEventListener("click", function (event) {
    const button = event.target.closest("button, a");
    if (!button) return;

    const action = button.dataset.action || "";

    if (action === "open-draft-route" || action === "source-draft-route") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return renderDraftRoute("planner", "Opened Draft Route");
    }

    if (action === "draft-tab") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return renderDraftRoute(button.dataset.tab || "planner", "Opened Draft Route");
    }

    if (action === "draft-build-route") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return buildRoute();
    }

    if (action === "draft-add-gem") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return addGem(button.dataset.gemId || "");
    }
  }, true);
})();