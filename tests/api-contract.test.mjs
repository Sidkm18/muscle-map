import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function runPhpRequest({ method = "GET", uri = "/api" } = {}) {
  const phpSource = `
    chdir(${JSON.stringify(repoRoot)});
    $_SERVER['REQUEST_METHOD'] = ${JSON.stringify(method)};
    $_SERVER['REQUEST_URI'] = ${JSON.stringify(uri)};
    $_SERVER['HTTP_HOST'] = 'localhost';
    $_SERVER['HTTPS'] = 'off';
    require 'backend/public/index.php';
  `;

  const result = spawnSync("php", ["-d", "display_errors=0", "-r", phpSource], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || `PHP request failed with code ${result.status}`);
  }

  return JSON.parse(result.stdout.trim());
}

test("api root advertises the centralized public contract", () => {
  const payload = runPhpRequest({ uri: "/api" });

  assert.equal(payload.status, "ok");
  assert.ok(Array.isArray(payload.endpoints));
  assert.ok(payload.endpoints.includes("GET /api/pricing"));
  assert.ok(payload.endpoints.includes("GET /api/me"));
  assert.ok(payload.endpoints.includes("POST /api/subscribe"));
});

test("/api/me reports anonymous session state without throwing auth errors", () => {
  const payload = runPhpRequest({ uri: "/api/me" });

  assert.equal(payload.authenticated, false);
  assert.equal(payload.user, null);
});

test("auth backend exposes remember-cookie helpers in bootstrap and login flow", () => {
  const bootstrap = readRepoFile("backend/src/bootstrap.php");
  const loginApi = readRepoFile("backend/src/api/login.php");
  const logoutApi = readRepoFile("backend/src/api/logout.php");

  assert.match(bootstrap, /remember/i);
  assert.match(loginApi, /remember_me/);
  assert.match(loginApi, /mm_issue_remember_me_cookie/);
  assert.match(logoutApi, /mm_clear_remember_me_cookie/);
});
