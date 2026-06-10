(function () {
  const KEY = "esslay-study-cave-simple-v1";

  const arr = v => Array.isArray(v) ? v.filter(Boolean) : [];
  const clean = (v, n = 500) => String(v || "").replace(/\s+/g, " ").trim().slice(0, n);
  const uid = () => "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  const esc = v => String(v ?? "").replace(/[&<>"]/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[c]));

  function now() {
    try {
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return new Date().toISOString();
    }
  }

  function load() {
    let state = null;
    try { state = JSON.parse(localStorage.getItem(KEY)); } catch { state = null; }
    if (!state || typeof state !== "object") state = {};

    state.completed = arr(state.completed);
    state.unlocked = arr(state.unlocked);
    state.routeRooms = state.routeRooms && typeof state.routeRooms === "object" ? state.routeRooms : {};

    state.routeRooms["draft-route"] =
      state.routeRooms["draft-route"] && typeof state.routeRooms["draft-route"] === "object"
        ? state.routeRooms["draft-route"]
        : {};

    state.routeRooms["draft-route"].markers = arr(state.routeRooms["draft-route"].markers);

    state.routeRooms["paragraph-forge"] =
      state.routeRooms["paragraph-forge"] && typeof state.routeRooms["paragraph-forge"] === "object"
        ? state.routeRooms["paragraph-forge"]
        : {};

    state.routeRooms["paragraph-forge"].started = true;
    state.routeRooms["paragraph-forge"].paragraphs = arr(state.routeRooms["paragraph-forge"].paragraphs);

    state.lastSavedAt = state.lastSavedAt || "Not saved yet";
    state.lastAction = state.lastAction || "Ready";

    return state;
  }

  function save(state, message) {
    state.lastSavedAt = now();
    state.lastAction = message || "Saved locally";
    localStorage.setItem(KEY, JSON.stringify(state));

    document.querySelectorAll("[data-flow-progress]").forEach(node => {
      node.textContent = arr(state.completed).length + " / 7";
    });
  }

  function stage() {
    return document.getElementById("stage-scene");
  }

  function forge(state) {
    return state.routeRooms["paragraph-forge"];
  }

  function markers(state) {
    return arr(state.routeRooms["draft-route"].markers)
      .slice()
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  }

  function paragraphs(state) {
    return arr(forge(state).paragraphs)
      .slice()
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  }

  function markerById(state, id) {
    return markers(state).find(marker => marker.id === id) || null;
  }

  function paragraphForMarker(state, markerId) {
    return paragraphs(state).find(paragraph => paragraph.markerId === markerId) || null;
  }

  function saveInfo(state) {
    return `<p class="save-status"><strong>Browser save:</strong> ${esc(state.lastSavedAt)} · ${esc(state.lastAction)}</p>`;
  }

  function styles() {
    return `
      <style data-paragraph-forge-v1>
        .paragraph-forge-room {
          background-image:
            linear-gradient(180deg, rgba(5,4,8,.18), rgba(5,4,8,.36)),
            url("assets/study-cave/paragraph-forge-placeholder-v01.png"),
            url("assets/study-cave/draft-route-placeholder-v01.png"),
            linear-gradient(135deg,#201114,#4d2814) !important;
        }

        .paragraph-forge-card {
          width: min(620px, 50vw) !important;
          max-height: calc(100% - 92px) !important;
          overflow: auto !important;
          padding: 14px !important;
        }

        .forge-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 8px 0 10px;
        }

        .forge-tabs button {
          border: 1px solid rgba(236,215,170,.75);
          border-radius: 999px;
          padding: 6px 9px;
          background: rgba(25,16,10,.88);
          color: #fff7df;
          font-weight: 900;
          cursor: pointer;
        }

        .forge-tabs button[aria-current="true"] {
          background: rgba(255,231,171,.92);
          color: #2f2118;
        }

        .forge-marker,
        .forge-paragraph {
          padding: 9px;
          border-radius: 14px;
          border: 1px solid rgba(255,231,171,.38);
          background: rgba(7,10,18,.72);
          margin: 8px 0;
        }

        .forge-chip {
          display: inline-block;
          padding: 3px 7px;
          border-radius: 999px;
          background: rgba(255,231,171,.9);
          color: #2f2118;
          font-weight: 900;
          font-size: .78rem;
          margin: 2px;
        }

        .forge-card-text {
          max-height: 90px;
          overflow: auto;
          padding: 7px;
          border-radius: 10px;
          background: rgba(255,255,255,.08);
          font-size: .88rem;
        }

        .paragraph-forge-card textarea,
        .paragraph-forge-card input {
          width: 100%;
          box-sizing: border-box;
          margin-top: 4px;
          padding: 8px;
          border-radius: 10px;
          border: 1px solid rgba(236,215,170,.36);
          font: inherit;
        }

        .paragraph-forge-card label {
          display: block;
          margin: 8px 0;
          font-weight: 900;
        }

        @media(max-width:920px) {
          .paragraph-forge-card {
            width: calc(100% - 28px) !important;
          }
        }
      </style>`;
  }

  function tabs(active) {
    return `
      <nav class="forge-tabs">
        <button type="button" data-action="forge-tab" data-tab="forge" aria-current="${active === "forge"}">Forge Paragraph</button>
        <button type="button" data-action="forge-tab" data-tab="markers" aria-current="${active === "markers"}">Route Markers</button>
        <button type="button" data-action="forge-tab" data-tab="saved" aria-current="${active === "saved"}">Saved Paragraphs</button>
        <button type="button" data-action="forge-tab" data-tab="missing" aria-current="${active === "missing"}">Missing</button>
      </nav>`;
  }

  function markerSummary(marker) {
    return `
      <strong>${esc(marker.title || marker.focus || marker.bucket || "Route marker")}</strong><br>
      <span class="forge-chip">${esc(marker.bucket || "bucket")}</span>
      <span class="forge-chip">${esc(marker.citationLabel || "source")}</span>
      <div class="forge-card-text">${esc(marker.detail || marker.evidence || "")}</div>
      ${marker.note || marker.purpose ? `<p><em>${esc(marker.note || marker.purpose)}</em></p>` : ""}`;
  }

  function roughStarter(marker) {
    const bucket = clean(marker.bucket || marker.focus || "this point", 80);
    const evidence = clean(marker.detail || marker.evidence || "", 300);
    const source = clean(marker.citationLabel || "the source", 100);

    return `This paragraph explains ${bucket}. ${evidence} This matters because it helps answer the task rather than just listing information. Source: ${source}.`;
  }

  function forgePanel(state) {
    const routeMarkers = markers(state);

    if (!routeMarkers.length) {
      return `
        <h3>Forge Paragraph</h3>
        <p>No Draft Route markers found yet. Build a route marker in Draft Route first.</p>
        <div class="simple-actions"><button type="button" data-action="open-draft-route">Draft Route</button></div>`;
    }

    const activeId = forge(state).activeMarkerId || routeMarkers[0].id;
    const marker = markerById(state, activeId) || routeMarkers[0];
    forge(state).activeMarkerId = marker.id;

    return `
      <h3>Forge Paragraph</h3>
      <section class="forge-marker">${markerSummary(marker)}</section>

      <form data-forge-form data-marker-id="${esc(marker.id)}">
        <label>Paragraph focus
          <input name="focus" value="${esc(marker.title || marker.focus || marker.bucket || "")}">
        </label>

        <label>Rough paragraph
          <textarea name="paragraph" rows="7">${esc(roughStarter(marker))}</textarea>
        </label>

        <label>What it still needs
          <textarea name="needs" rows="3" placeholder="What should be checked later?"></textarea>
        </label>

        <div class="simple-actions">
          <button type="button" data-action="forge-save-paragraph">Save rough paragraph</button>
          <button type="button" data-action="forge-tab" data-tab="markers">Choose another marker</button>
        </div>
      </form>`;
  }

  function markersPanel(state) {
    const routeMarkers = markers(state);

    if (!routeMarkers.length) {
      return `
        <h3>Route Markers</h3>
        <p>No route markers yet.</p>
        <button type="button" data-action="open-draft-route">Draft Route</button>`;
    }

    return `
      <h3>Route Markers</h3>
      ${routeMarkers.map(marker => {
        const done = paragraphForMarker(state, marker.id);

        return `
          <section class="forge-marker">
            ${markerSummary(marker)}
            <div class="simple-actions">
              ${
                done
                  ? `<button type="button" disabled>Paragraph saved</button>`
                  : `<button type="button" data-action="forge-select-marker" data-marker-id="${esc(marker.id)}">Forge this paragraph</button>`
              }
            </div>
          </section>`;
      }).join("")}`;
  }

  function savedPanel(state) {
    const saved = paragraphs(state);

    if (!saved.length) {
      return `
        <h3>Saved Paragraphs</h3>
        <p>No rough paragraphs saved yet.</p>`;
    }

    return `
      <h3>Saved Paragraphs</h3>
      <ol>
        ${saved.map(paragraph => `
          <li class="forge-paragraph">
            <strong>${esc(paragraph.focus || "Rough paragraph")}</strong><br>
            <span class="forge-chip">${esc(paragraph.bucket || "bucket")}</span>
            <span class="forge-chip">${esc(paragraph.citationLabel || "source")}</span>
            <div class="forge-card-text">${esc(paragraph.paragraph || "")}</div>
            <em>${esc(paragraph.needs || "")}</em>
          </li>`).join("")}
      </ol>

      <div class="simple-actions">
        <button type="button" data-action="route-next" data-room="paragraph-forge">Continue to Bridge Hall</button>
      </div>`;
  }

  function missingPanel(state) {
    const missing = markers(state).filter(marker => !paragraphForMarker(state, marker.id));

    return `
      <h3>Missing</h3>
      <p><strong>Route markers without rough paragraphs:</strong> ${missing.length}</p>
      ${
        missing.length
          ? `<ul>${missing.map(marker => `<li>${esc(marker.title || marker.bucket || "Route marker")}</li>`).join("")}</ul>`
          : `<p>None.</p>`
      }`;
  }

  function body(state, active) {
    if (active === "markers") return markersPanel(state);
    if (active === "saved") return savedPanel(state);
    if (active === "missing") return missingPanel(state);
    return forgePanel(state);
  }

  function render(tab, message) {
    const state = load();
    const node = stage();

    if (!node) return;

    document.querySelectorAll("details[open]").forEach(details => {
      details.open = false;
    });

    node.hidden = false;

    state.current = "paragraph-forge";

    if (!state.unlocked.includes("paragraph-forge")) {
      state.unlocked.push("paragraph-forge");
    }

    forge(state).started = true;
    forge(state).activeTab = tab || forge(state).activeTab || "forge";

    save(state, message || "Paragraph Forge opened");

    node.innerHTML = `
      ${styles()}
      <section class="simple-room paragraph-forge-room">
        <p class="scene-label">Paragraph Forge</p>

        <article class="stage-card simple-card paragraph-forge-card">
          <h2>Paragraph Forge</h2>
          <p>Turn Draft Route markers into rough body paragraphs.</p>
          <p><strong>Route markers:</strong> ${markers(state).length} · <strong>Rough paragraphs:</strong> ${paragraphs(state).length}</p>

          ${saveInfo(state)}
          ${tabs(forge(state).activeTab)}
          ${body(state, forge(state).activeTab)}

          <div class="simple-actions">
            <button type="button" data-action="open-draft-route">Draft Route</button>
            <button type="button" data-action="open-task-map">Task Map</button>
          </div>
        </article>
      </section>`;
  }

  function selectMarker(markerId) {
    const state = load();

    forge(state).activeMarkerId = markerId;
    forge(state).activeTab = "forge";

    save(state, "Selected route marker");
    render("forge", "Selected route marker");
  }

  function saveParagraph() {
    const form = document.querySelector("[data-forge-form]");

    if (!form) return render("forge", "Paragraph form missing");

    const state = load();
    const marker = markerById(state, form.dataset.markerId);

    if (!marker) return render("markers", "Route marker missing");

    const data = new FormData(form);
    const existing = paragraphForMarker(state, marker.id);

    const paragraph = {
      id: existing ? existing.id : uid(),
      order: existing ? existing.order : paragraphs(state).length + 1,
      markerId: marker.id,
      bucket: clean(marker.bucket, 80),
      citationLabel: marker.citationLabel || "source",
      focus: clean(data.get("focus"), 180) || clean(marker.title || marker.bucket, 180),
      paragraph: clean(data.get("paragraph"), 2500),
      evidence: clean(marker.detail || marker.evidence, 1600),
      needs: clean(data.get("needs"), 900),
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    forge(state).paragraphs = paragraphs(state).filter(item => item.markerId !== marker.id);
    forge(state).paragraphs.push(paragraph);

    if (!state.unlocked.includes("bridge-hall")) {
      state.unlocked.push("bridge-hall");
    }

    save(state, "Rough paragraph saved; Bridge Hall unlocked");
    render("saved", "Rough paragraph saved; Bridge Hall unlocked");
  }

  document.addEventListener("click", function (event) {
    const button = event.target.closest("button, a");
    if (!button) return;

    const action = button.dataset.action || "";

    if (action === "open-paragraph-forge" || (action === "route-next" && button.dataset.room === "draft-route")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render("forge", "Paragraph Forge opened");
    }

    if (action === "forge-tab") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render(button.dataset.tab || "forge", "Opened Paragraph Forge");
    }

    if (action === "forge-select-marker") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return selectMarker(button.dataset.markerId || "");
    }

    if (action === "forge-save-paragraph") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveParagraph();
    }
  }, true);

  function forgeContinueToBridgeHall() {
    const state = load();

    if (!state.completed.includes("paragraph-forge")) {
      state.completed.push("paragraph-forge");
    }

    if (!state.unlocked.includes("bridge-hall")) {
      state.unlocked.push("bridge-hall");
    }

    state.current = "bridge-hall";
    save(state, "Paragraph Forge complete; Bridge Hall unlocked");

    const button = document.createElement("button");
    button.type = "button";
    button.hidden = true;
    button.dataset.action = "route-next";
    button.dataset.room = "paragraph-forge";
    button.dataset.forceLegacyRoute = "1";
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  document.addEventListener("click", function (event) {
    const button = event.target.closest("button, a");
    if (!button) return;

    const action = button.dataset.action || "";
    const room = button.dataset.room || "";

    if (room !== "paragraph-forge") return;
    if (button.dataset.forceLegacyRoute) return;

    if (action === "route-begin" || action === "route-open-work" || action === "route-close-panel") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render("forge", "Paragraph Forge opened");
    }

    if (action === "route-review") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render("saved", "Opened Saved Paragraphs");
    }

    if (action === "route-gap") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render("missing", "Opened Missing");
    }

    if (action === "route-next") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return forgeContinueToBridgeHall();
    }
  }, true);

})();