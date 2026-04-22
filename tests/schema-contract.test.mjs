import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("database scripts identify the canonical schema and the legacy model", () => {
  const schema = readRepoFile("database/schema.sql");
  const legacy = readRepoFile("database/db.sql");

  assert.match(schema, /canonical schema/i);
  assert.match(schema, /profile_photo\s+MEDIUMTEXT\s+COMMENT\s+'Stores an app-relative upload path; legacy rows may still contain data URLs\.'/i);
  assert.match(legacy, /legacy reference only/i);
  assert.doesNotMatch(legacy, /CREATE DATABASE IF NOT EXISTS muscle_map/i);
});
