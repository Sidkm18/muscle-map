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

function runPhpSnippet(source) {
  const result = spawnSync("php", ["-d", "display_errors=0", "-r", source], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || `PHP snippet failed with code ${result.status}`);
  }

  return JSON.parse(result.stdout.trim());
}

test("onboarding page contains an underage notice with the eligible-date placeholder", () => {
  const html = readRepoFile("frontend/pages/onboarding.html");
  const script = readRepoFile("frontend/js/onboarding.js");
  const apiHandler = readRepoFile("backend/src/api/onboarding.php");

  assert.match(html, /id="ageGateScreen"/);
  assert.match(html, /Sorry, you are not old enough to register\./);
  assert.match(html, /id="eligibleDate"/);
  assert.match(script, /MINIMUM_ONBOARDING_AGE\s*=\s*13/);
  assert.match(apiHandler, /'min_age'\s*=>\s*13/);
});

test("validation middleware rejects users younger than 13 and allows users who are 13 today", () => {
  const source = `
    chdir(${JSON.stringify(repoRoot)});
    require 'backend/vendor/autoload.php';

    $schema = [
      'dob' => [
        'type' => 'date',
        'required' => true,
        'allow_empty' => false,
        'not_in_future' => true,
        'min_age' => 13,
      ],
    ];

    $underageDob = (new DateTime('today'))->modify('-12 years')->format('Y-m-d');
    $eligibleDob = (new DateTime('today'))->modify('-13 years')->format('Y-m-d');

    try {
      \\App\\Middleware\\ValidationMiddleware::filterPayload(['dob' => $underageDob], $schema);
      $underage = ['valid' => true];
    } catch (\\App\\Middleware\\ValidationException $exception) {
      $underage = ['valid' => false, 'errors' => $exception->getErrors()];
    }

    try {
      $validated = \\App\\Middleware\\ValidationMiddleware::filterPayload(['dob' => $eligibleDob], $schema);
      $eligible = ['valid' => true, 'dob' => $validated['dob']];
    } catch (\\App\\Middleware\\ValidationException $exception) {
      $eligible = ['valid' => false, 'errors' => $exception->getErrors()];
    }

    echo json_encode(['underage' => $underage, 'eligible' => $eligible]);
  `;

  const payload = runPhpSnippet(source);

  assert.equal(payload.underage.valid, false);
  assert.equal(payload.underage.errors.dob, "You must be at least 13 years old.");
  assert.equal(payload.eligible.valid, true);
  assert.match(payload.eligible.dob, /^\d{4}-\d{2}-\d{2}$/);
});
