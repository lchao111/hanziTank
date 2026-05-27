const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

assert.match(source, /function escapeHtml\(value\)/, "Game UI should define a shared HTML escaping helper.");
assert.match(source, /#\$\{index \+ 1\} \$\{escapeHtml\(record\.name\)\}/, "Leaderboard profile names must be escaped before innerHTML rendering.");
assert.match(source, /\$\{escapeHtml\(word\.hanzi\)\}/, "Mastered-word Hanzi must be escaped before innerHTML rendering.");
assert.match(source, /\$\{escapeHtml\(word\.phrase \|\| word\.meaning \|\| "mastered"\)\}/, "Mastered-word metadata must be escaped before innerHTML rendering.");
assert.match(source, /\.map\(escapeHtml\)\.join\(" · "\)/, "War archive upgrade labels must be escaped before innerHTML rendering.");

console.log("security regression tests passed");
