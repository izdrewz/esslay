# Brief Fog background transition issue — 2026-06-22

Status: logged for later isolated fix

## Observed behaviour

When moving into the current Brief Fog / Quest Scroll flow, an old background image briefly appears before the intended Brief Fog background is shown.

## Scope

- Do not change the current functional PDF/source-import test to address this.
- Do not alter Cave Base, Task Map, Cave entrance, or the active Source Mine handoff while fixing it later.
- Treat it as a separate asset-loading / scene-transition issue.

## Later investigation

Check the order in which the Brief Fog scene background classes, image URLs, and route-render functions are applied. The final room background should be selected before the stage becomes visible, or the prior room background should be retained until the intended background image has loaded.
