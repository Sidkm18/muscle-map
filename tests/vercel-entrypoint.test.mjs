import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

test("root PHP entrypoint does not hardcode the local XAMPP subdirectory", () => {
  const php = fs.readFileSync(path.join(repoRoot, "index.php"), "utf8");

  assert.doesNotMatch(php, /\/muscle-map\/frontend\/index\.html/);
  assert.match(php, /header\("Location:\s*frontend\/index\.html"\);/);
});
