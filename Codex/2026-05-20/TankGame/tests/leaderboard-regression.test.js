const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const buildSource = fs.readFileSync(path.join(root, "tools", "build-production.mjs"), "utf8");
const apiSource = fs.readFileSync(path.join(root, "api", "src", "functions", "leaderboard.js"), "utf8");

assert.match(indexSource, /<meta name="hanzi-tank-leaderboard-api" content="">/, "Frontend should expose only a public API URL config slot.");
assert.match(indexSource, /const leaderboardApiBase = String\(window\.HANZI_TANK_LEADERBOARD_API \|\| localStorage\.getItem\("hanziTankLeaderboardApi"\) \|\| leaderboardApiMeta/, "Frontend should read a public leaderboard API base URL.");
assert.match(indexSource, /const leaderboardSyncIntervalMs = 300000;/, "Frontend should wait five minutes between leaderboard sync attempts.");
assert.match(indexSource, /fetch\(`\$\{leaderboardApiBase\}\/leaderboard`/, "Frontend should call the leaderboard API instead of Cosmos DB directly.");
assert.match(indexSource, /function mergeLeaderboardRecords\(localRecords, cloudRecords\)/, "Leaderboard should merge local and cloud records for offline fallback.");
assert.match(indexSource, /leaderboardApiBase && cloudRecords\.length > 0 \? cloudRecords\.slice\(0, 20\) : localRecords\.slice\(0, 20\)/, "Shared leaderboard rendering should not mix local records into cloud records.");
assert.match(indexSource, /renderLeaderboardRecords\(records\.slice\(0, 20\), `Shared leaderboard updated:/, "Cloud refresh should render only cloud records when the shared leaderboard is available.");
assert.match(indexSource, /function queueLeaderboardSync\(\)/, "Saving progress should be able to submit best records to the shared leaderboard.");
assert.doesNotMatch(indexSource, /COSMOS_CONNECTION_STRING|AccountKey=|@azure\/cosmos|CosmosClient/, "Frontend must not contain Cosmos DB credentials or SDK access.");

assert.match(buildSource, /process\.env\.HANZI_TANK_LEADERBOARD_API/, "Production builds should inject only the public leaderboard API URL.");

assert.match(apiSource, /process\.env\.COSMOS_CONNECTION_STRING/, "Cosmos connection string should only be read by the server API.");
assert.match(apiSource, /authLevel: "anonymous"/, "Leaderboard read/write API should not require exposing a function key in the browser.");
assert.match(apiSource, /sanitizeRecord/, "Leaderboard API should sanitize submitted public records.");
assert.match(apiSource, /SELECT TOP 200/, "Leaderboard API should query a bounded candidate list.");
assert.match(apiSource, /\.slice\(0, 20\)/, "Leaderboard API should return only the public top 20.");
assert.match(apiSource, /maxBodyBytes = Number\(process\.env\.MAX_LEADERBOARD_BODY_BYTES \|\| 4096\)/, "Leaderboard API should reject oversized write payloads before parsing JSON.");
assert.match(apiSource, /writeRateLimit = Number\(process\.env\.LEADERBOARD_WRITE_RATE_LIMIT \|\| 30\)/, "Leaderboard API should rate-limit write traffic per client network.");
assert.match(apiSource, /readRateLimit = Number\(process\.env\.LEADERBOARD_READ_RATE_LIMIT \|\| 120\)/, "Leaderboard API should rate-limit read traffic per client network.");
assert.match(apiSource, /syncCooldownMs = Number\(process\.env\.LEADERBOARD_SYNC_COOLDOWN_MS \|\| 300000\)/, "Leaderboard API should enforce a five-minute per-IP sync cooldown.");
assert.match(apiSource, /maxAccountsPerNetwork = Number\(process\.env\.MAX_ACCOUNTS_PER_NETWORK \|\| 10\)/, "Leaderboard API should cap account creation per IP or network.");
assert.match(apiSource, /const syncCooldowns = new Map\(\)/, "Leaderboard API should track per-IP sync cooldowns in memory.");
assert.match(apiSource, /Array\.isArray\(body\.records\)/, "Leaderboard API should reject bulk record submissions.");
assert.match(apiSource, /countAccountsForField\(container, "clientIp", clientIdentity\.ip\)/, "Leaderboard API should count accounts created by a single IP.");
assert.match(apiSource, /countAccountsForField\(container, "clientNetwork", clientIdentity\.network\)/, "Leaderboard API should count accounts created by an IP range.");
assert.match(apiSource, /ipAccounts >= maxAccountsPerNetwork \|\| networkAccounts >= maxAccountsPerNetwork/, "Leaderboard API should reject account creation once either IP or network account cap is reached.");
assert.match(apiSource, /getSyncRetryAfterSeconds\(clientIdentity\)/, "Leaderboard API should check IP sync cooldown before accepting a write.");
assert.match(apiSource, /"Retry-After": String\(retryAfterSeconds\)/, "Leaderboard API should tell clients when the IP can sync again.");
assert.match(apiSource, /markSyncCooldown\(clientIdentity\)/, "Leaderboard API should start the five-minute IP cooldown after a sync completes.");

console.log("leaderboard regression tests passed");