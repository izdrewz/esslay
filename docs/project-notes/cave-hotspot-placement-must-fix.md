# Cave hotspot placement — must fix

Status: active / must fix after route blocker test.

Flag from Izzy on 2026-06-03:

The cave click zones are not placed well enough. The clickable areas do not consistently match the visible objects or scene locations.

This applies across much of the cave, not only Brief Fog.

Issue:

- Clickable areas feel detached from the visual objects.
- Users cannot reliably know where to click from the scene art.
- Some important controls are too dependent on invisible hotspot rectangles.
- Brief Fog needs working controls first, but the placement mismatch must be fixed before the scene can feel usable.

Priority:

Must fix after the immediate click-blocker route test. This is not final art polish. It affects basic usability.

Affected areas:

- Study Cave entrance hotspots.
- Quest Board hotspot.
- Task Map / route entry hotspots.
- Cave Base hotspots.
- Brief Fog Task Brief / parchment hotspot.
- Brief Fog flag, missed loot, route-forward and fog patch interaction areas.

Required future direction:

- Match hotspot rectangles to visible objects or labels.
- Make important controls visible enough to be discoverable.
- Avoid relying only on invisible areas.
- Review on Izzy's screen because placement may feel different in the actual browser size.

Current blocker fix:

A click-safety override was added in `docs/study-cave-task-map-fallback.js` so Brief Fog controls remain clickable even during cutscene-active states. This does not solve placement; it only prevents controls becoming unclickable.
