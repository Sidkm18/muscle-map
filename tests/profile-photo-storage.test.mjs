import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const tinyPngDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg==";

function runPhp(code) {
  const result = spawnSync("php", ["-d", "display_errors=1", "-r", code], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `PHP exited with code ${result.status}`);
  }

  return JSON.parse(result.stdout.trim());
}

test("profile photo storage writes data URLs to public uploads and returns a path for the DB", () => {
  const sandboxRoot = fs.mkdtempSync(path.join(os.tmpdir(), "musclemap-profile-photo-"));

  const payload = runPhp(`
    chdir(${JSON.stringify(path.join(repoRoot, "backend"))});
    require 'vendor/autoload.php';

    $storage = new App\\Support\\ProfilePhotoStorage(${JSON.stringify(sandboxRoot)}, '/muscle-map');
    $result = $storage->prepare(42, ${JSON.stringify(tinyPngDataUrl)}, null);
    $absolutePath = ${JSON.stringify(sandboxRoot)} . preg_replace('#^/muscle-map#', '', $result['stored_value']);

    echo json_encode([
      'stored_value' => $result['stored_value'],
      'created_value' => $result['created_value'],
      'obsolete_value' => $result['obsolete_value'],
      'file_exists' => file_exists($absolutePath),
      'file_size' => file_exists($absolutePath) ? filesize($absolutePath) : 0,
    ]);
  `);

  assert.match(payload.stored_value, /^\/muscle-map\/uploads\/profile-photos\/user-42\/.+\.png$/);
  assert.equal(payload.created_value, payload.stored_value);
  assert.equal(payload.obsolete_value, null);
  assert.equal(payload.file_exists, true);
  assert.ok(payload.file_size > 0);
});
