const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

assert.match(source, /function escapeHtml\(value\)/, "Game UI should define a shared HTML escaping helper.");
assert.match(source, /#\$\{index \+ 1\} \$\{escapeHtml\(record\.name\)\}/, "Leaderboard profile names must be escaped before innerHTML rendering.");
assert.match(source, /\$\{escapeHtml\(word\.hanzi\)\}/, "Mastered-word Hanzi must be escaped before innerHTML rendering.");
assert.match(source, /\$\{escapeHtml\(word\.phrase \|\| word\.meaning \|\| "mastered"\)\}/, "Mastered-word metadata must be escaped before innerHTML rendering.");
assert.match(source, /\.map\(escapeHtml\)\.join\(" · "\)/, "War archive upgrade labels must be escaped before innerHTML rendering.");
assert.match(source, /<button class="primary" id="debugButton" type="button" hidden>Debug Mode<\/button>/, "Debug mode button should be hidden until an authorized profile enters.");
assert.match(source, /const debugProfileId = "chao"/, "Debug mode should be reserved for the Chao profile id.");
assert.match(source, /function canUseDebugMode\(\)[\s\S]*activeProfileId === debugProfileId/, "Debug mode access should depend on the active Chao profile.");
assert.match(source, /function openDebugMode\(\)[\s\S]*if \(!canUseDebugMode\(\)\)/, "Opening debug mode should be guarded by the Chao profile check.");
assert.match(source, /function startDebugBattle\(stage\)[\s\S]*if \(!canUseDebugMode\(\)\)/, "Starting a debug battle should be guarded by the Chao profile check.");

console.log("security regression tests passed");
