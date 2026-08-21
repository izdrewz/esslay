import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("keeps the Esslay metadata and development preview marker", async () => {
  const layout = await readFile(new URL("app/layout.tsx", root), "utf8");
  assert.match(layout, /title:\s*["']Esslay V2["']/);
  assert.match(layout, /["']codex-preview["']:\s*["']development["']/);
});

test("packages the required database and source-file bindings", async () => {
  const sourceManifest = JSON.parse(
    await readFile(new URL(".openai/hosting.json", root), "utf8"),
  );
  const builtManifest = JSON.parse(
    await readFile(new URL("dist/.openai/hosting.json", root), "utf8"),
  );
  assert.equal(sourceManifest.d1, "DB");
  assert.equal(sourceManifest.r2, "BUCKET");
  assert.deepEqual(builtManifest, sourceManifest);
});
