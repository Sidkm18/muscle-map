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

test("landing page uses the redesigned squad-journey structure", () => {
  const html = readRepoFile("frontend/index.html");

  const requiredSections = [
    'id="landing-hero"',
    'id="home-proof"',
    'id="home-feature-story"',
    'id="home-journey"',
    'id="home-tools"',
    'id="home-pricing"',
    'id="home-cta"'
  ];

  requiredSections.forEach((marker) => {
    assert.match(html, new RegExp(marker));
  });

  assert.match(html, /href="\.\/pages\/pricing\.html"[^>]*>Start Free Plan</);
  assert.match(html, /href="#home-feature-story"[^>]*>Explore The Flow</);
});

test("landing page loads landing-only CSS and homepage behavior scripts", () => {
  const html = readRepoFile("frontend/index.html");

  assert.match(html, /href="\.\/css\/home\.css/);
  assert.match(html, /src="\.\/js\/site\.js/);
  assert.match(html, /src="\.\/js\/home\.js/);
});

test("landing assets support reduced motion and theme-aware interaction state", () => {
  const css = readRepoFile("frontend/css/home.css");
  const js = readRepoFile("frontend/js/home.js");

  assert.match(css, /prefers-reduced-motion/);
  assert.match(js, /mm:themechange/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /matchMedia/);
});
