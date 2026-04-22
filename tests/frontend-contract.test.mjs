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

test("site runtime exposes server-session helpers instead of localStorage auth flags", () => {
  const runtime = readRepoFile("frontend/js/site-runtime.js");
  const shell = readRepoFile("frontend/js/site.js");

  assert.match(runtime, /getSession\s*:/);
  assert.match(runtime, /refreshSession\s*:/);
  assert.match(runtime, /setSession\s*:/);
  assert.match(runtime, /clearSession\s*:/);
  assert.doesNotMatch(shell, /localStorage\.getItem\(['"]isLoggedIn['"]\)/);
});

test("exercise and pricing pages are wired to backend APIs", () => {
  const exercises = readRepoFile("frontend/js/exercises.js");
  const pricing = readRepoFile("frontend/js/pricing.js");

  assert.match(exercises, /requestJson\(['"]exercises['"]/);
  assert.match(pricing, /requestJson\(['"]pricing['"]/);
  assert.match(pricing, /requestJson\(['"]subscribe['"]/);
});

test("connect and onboarding flows avoid legacy auth and storage traps", () => {
  const connect = readRepoFile("frontend/js/connect.js");
  const onboarding = readRepoFile("frontend/js/onboarding.js");
  const onboardingPage = readRepoFile("frontend/pages/onboarding.html");
  const profilePage = readRepoFile("frontend/pages/profile.html");
  const profileEditPage = readRepoFile("frontend/pages/profile-edit.html");

  assert.doesNotMatch(connect, /requestJson\(['"]profile['"]/);
  assert.doesNotMatch(onboarding, /userOnboardingData/);
  assert.match(onboarding, /requestSubmit\(\)/);
  assert.match(onboardingPage, /accept="image\/png,image\/jpeg,image\/webp,image\/gif,image\/svg\+xml"/);
  assert.match(profilePage, /accept="image\/png,image\/jpeg,image\/webp,image\/gif,image\/svg\+xml"/);
  assert.match(profileEditPage, /accept="image\/png,image\/jpeg,image\/webp,image\/gif,image\/svg\+xml"/);
});

test("connect page defers auth gating to the shared session runtime", () => {
  const connectPage = readRepoFile("frontend/pages/connect.html");
  const connectScript = readRepoFile("frontend/js/connect.js");

  assert.match(connectScript, /getSession/);
  assert.doesNotMatch(connectPage, /localStorage\.getItem\(['"]isLoggedIn['"]\)/);
});

test("login flow includes integrated remember-me support", () => {
  const loginPage = readRepoFile("frontend/pages/login.html");
  const loginScript = readRepoFile("frontend/js/login.js");

  assert.match(loginPage, /remember/i);
  assert.match(loginScript, /remember_me/);
});
