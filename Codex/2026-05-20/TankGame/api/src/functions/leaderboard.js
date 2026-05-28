const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

const databaseId = process.env.COSMOS_DATABASE || "hanziTank";
const containerId = process.env.COSMOS_LEADERBOARD_CONTAINER || "leaderboard";
const maxBodyBytes = Number(process.env.MAX_LEADERBOARD_BODY_BYTES || 4096);
const maxAccountsPerNetwork = Number(process.env.MAX_ACCOUNTS_PER_NETWORK || 10);
const writeRateLimit = Number(process.env.LEADERBOARD_WRITE_RATE_LIMIT || 30);
const readRateLimit = Number(process.env.LEADERBOARD_READ_RATE_LIMIT || 120);
const rateWindowMs = Number(process.env.LEADERBOARD_RATE_WINDOW_MS || 60000);
const syncCooldownMs = Number(process.env.LEADERBOARD_SYNC_COOLDOWN_MS || 300000);
const allowedOrigins = String(process.env.ALLOWED_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

let containerPromise;
const rateBuckets = new Map();
const syncCooldowns = new Map();

function getCorsOrigin(request) {
  const origin = request?.headers?.get?.("origin") || "";
  if (allowedOrigins.includes("*")) return "*";
  return allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "*";
}

function isOriginAllowed(request) {
  const origin = request?.headers?.get?.("origin") || "";
  return !origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin);
}

function json(request, status, body, extraHeaders = {}) {
  return {
    status,
    jsonBody: body,
    headers: {
      "Access-Control-Allow-Origin": getCorsOrigin(request),
      "Vary": "Origin",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
      ...extraHeaders
    }
  };
}

function cleanText(value, fallback, maxLength) {
  const text = String(value || fallback || "").replace(/[<>]/g, "").trim();
  return text.slice(0, maxLength) || fallback;
}

function cleanProfileId(value) {
  return cleanText(value, "player", 64)
    .toLowerCase()
    .replace(/[^a-z0-9 _.-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 64) || "player";
}

function cleanNumber(value, maxValue = 999999) {
  return Math.max(0, Math.min(maxValue, Math.floor(Number(value) || 0)));
}

function sanitizeRecord(input) {
  const record = input && typeof input === "object" ? input : {};
  const profileId = cleanProfileId(record.profileId);
  const now = new Date().toISOString();
  return {
    id: profileId,
    profileId,
    name: cleanText(record.name, "Player", 24),
    stage: cleanNumber(record.stage, 10000),
    score: cleanNumber(record.score),
    coins: cleanNumber(record.coins),
    masteredCount: cleanNumber(record.masteredCount, 3000),
    rankName: cleanText(record.rankName, "Recruit", 32),
    rankZh: cleanText(record.rankZh, "新兵", 12),
    date: cleanText(record.date, now, 40),
    updatedAt: now,
    source: "cloud"
  };
}

function getHeader(request, names) {
  for (const name of names) {
    const value = request?.headers?.get?.(name);
    if (value) return value;
  }
  return "";
}

function normalizeClientIp(value) {
  const first = String(value || "").split(",")[0].trim();
  if (!first) return "unknown";
  const withoutBrackets = first.replace(/^\[|\]$/g, "");
  const ipv4WithPort = withoutBrackets.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i)?.[1] || withoutBrackets;
  if (/^\d+\.\d+\.\d+\.\d+(?::\d+)?$/.test(ipv4WithPort)) {
    const parts = ipv4WithPort.replace(/:\d+$/, "").split(".").map(Number);
    if (parts.length === 4 && parts.every((part) => part >= 0 && part <= 255)) return parts.join(".");
  }
  if (/^[0-9a-f:]+$/i.test(withoutBrackets) && withoutBrackets.includes(":")) return withoutBrackets.toLowerCase();
  return "unknown";
}

function getClientNetwork(ip) {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return `${ip.split(".").slice(0, 3).join(".")}.0/24`;
  if (ip.includes(":")) return `${ip.split(":").slice(0, 4).join(":")}::/64`;
  return "unknown";
}

function getClientIdentity(request) {
  const ip = normalizeClientIp(getHeader(request, ["x-azure-clientip", "x-forwarded-for", "x-client-ip"]));
  return { ip, network: getClientNetwork(ip) };
}

function pruneRateBuckets(now = Date.now()) {
  for (const [key, bucket] of rateBuckets.entries()) {
    if (now - bucket.windowStartedAt > rateWindowMs * 2) rateBuckets.delete(key);
  }
}

function checkRateLimit(key, limit, now = Date.now()) {
  pruneRateBuckets(now);
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.windowStartedAt >= rateWindowMs) {
    rateBuckets.set(key, { count: 1, windowStartedAt: now });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

function pruneSyncCooldowns(now = Date.now()) {
  for (const [key, nextAllowedAt] of syncCooldowns.entries()) {
    if (nextAllowedAt <= now) syncCooldowns.delete(key);
  }
}

function getSyncCooldownKey(clientIdentity) {
  return `leaderboard-sync:${clientIdentity.ip}`;
}

function getSyncRetryAfterSeconds(clientIdentity, now = Date.now()) {
  pruneSyncCooldowns(now);
  const nextAllowedAt = syncCooldowns.get(getSyncCooldownKey(clientIdentity)) || 0;
  return Math.max(0, Math.ceil((nextAllowedAt - now) / 1000));
}

function markSyncCooldown(clientIdentity, now = Date.now()) {
  if (!clientIdentity?.ip || clientIdentity.ip === "unknown") return;
  syncCooldowns.set(getSyncCooldownKey(clientIdentity), now + syncCooldownMs);
}

function ensureRequestAllowed(request) {
  if (!isOriginAllowed(request)) {
    const error = new Error("Origin is not allowed.");
    error.status = 403;
    throw error;
  }
  const length = Number(request?.headers?.get?.("content-length") || 0);
  if (length > maxBodyBytes) {
    const error = new Error("Leaderboard payload is too large.");
    error.status = 413;
    throw error;
  }
}

function extractSubmittedRecord(body) {
  if (!body || typeof body !== "object" || Array.isArray(body) || Array.isArray(body.records)) {
    const error = new Error("Submit a single leaderboard record.");
    error.status = 400;
    throw error;
  }
  const record = body.record && typeof body.record === "object" && !Array.isArray(body.record) ? body.record : body;
  if (!record.profileId || !record.name) {
    const error = new Error("Leaderboard record requires profileId and name.");
    error.status = 400;
    throw error;
  }
  return record;
}

async function getContainer() {
  if (!process.env.COSMOS_CONNECTION_STRING) {
    throw new Error("COSMOS_CONNECTION_STRING is not configured.");
  }
  if (!containerPromise) {
    containerPromise = (async () => {
      const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
      const { database } = await client.databases.createIfNotExists({ id: databaseId });
      const { container } = await database.containers.createIfNotExists({
        id: containerId,
        partitionKey: { paths: ["/profileId"] }
      });
      return container;
    })();
  }
  return containerPromise;
}

async function readLeaderboard() {
  const container = await getContainer();
  const querySpec = {
    query: "SELECT TOP 200 c.profileId, c.name, c.stage, c.score, c.coins, c.masteredCount, c.rankName, c.rankZh, c.date, c.updatedAt, c.source FROM c WHERE c.stage > 0"
  };
  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources
    .map(sanitizeRecord)
    .sort((a, b) => b.stage - a.stage || b.score - a.score || b.masteredCount - a.masteredCount || a.name.localeCompare(b.name))
    .slice(0, 20);
}

async function saveLeaderboardRecord(record) {
  const container = await getContainer();
  const next = sanitizeRecord(record);
  if (!next.stage) return next;
  try {
    const { resource: current } = await container.item(next.id, next.profileId).read();
    if (current && (current.stage > next.stage || (current.stage === next.stage && current.score >= next.score))) {
      return sanitizeRecord(current);
    }
  } catch (error) {
    if (error.code !== 404) throw error;
  }
  await container.items.upsert(next);
  return next;
}

async function countAccountsForField(container, field, value) {
  if (!value || value === "unknown") return 0;
  const queryField = field === "clientIp" ? "c.clientIp" : "c.clientNetwork";
  const querySpec = {
    query: `SELECT VALUE COUNT(1) FROM c WHERE ${queryField} = @value`,
    parameters: [{ name: "@value", value }]
  };
  const { resources } = await container.items.query(querySpec).fetchAll();
  return Number(resources?.[0] || 0);
}

async function saveLeaderboardRecordForClient(record, clientIdentity) {
  const container = await getContainer();
  const next = sanitizeRecord(record);
  if (!next.stage) return next;
  try {
    const { resource: current } = await container.item(next.id, next.profileId).read();
    if (current && (current.stage > next.stage || (current.stage === next.stage && current.score >= next.score))) {
      return sanitizeRecord(current);
    }
    await container.items.upsert({ ...next, clientIp: clientIdentity.ip, clientNetwork: clientIdentity.network });
    return next;
  } catch (error) {
    if (error.code !== 404) throw error;
  }
  const ipAccounts = await countAccountsForField(container, "clientIp", clientIdentity.ip);
  const networkAccounts = await countAccountsForField(container, "clientNetwork", clientIdentity.network);
  if (ipAccounts >= maxAccountsPerNetwork || networkAccounts >= maxAccountsPerNetwork) {
    const error = new Error("Too many leaderboard accounts from this network.");
    error.status = 429;
    throw error;
  }
  await container.items.upsert({ ...next, clientIp: clientIdentity.ip, clientNetwork: clientIdentity.network });
  return next;
}

app.http("leaderboard", {
  route: "leaderboard",
  authLevel: "anonymous",
  methods: ["GET", "POST", "OPTIONS"],
  handler: async (request, context) => {
    if (request.method === "OPTIONS") return json(request, 204, {});
    try {
      ensureRequestAllowed(request);
      const clientIdentity = getClientIdentity(request);
      const methodLimit = request.method === "GET" ? readRateLimit : writeRateLimit;
      const methodKey = `leaderboard:${request.method}:${clientIdentity.ip}:${clientIdentity.network}`;
      if (!checkRateLimit(methodKey, methodLimit)) return json(request, 429, { error: "Too many leaderboard requests. Try again later." });
      if (request.method === "GET") {
        const records = await readLeaderboard();
        return json(request, 200, { records });
      }
      const retryAfterSeconds = getSyncRetryAfterSeconds(clientIdentity);
      if (retryAfterSeconds > 0) {
        return json(request, 429, { error: "Leaderboard sync is cooling down for this IP." }, { "Retry-After": String(retryAfterSeconds) });
      }
      const body = await request.json();
      const saved = await saveLeaderboardRecordForClient(extractSubmittedRecord(body), clientIdentity);
      markSyncCooldown(clientIdentity);
      context.log("leaderboard saved", saved.profileId, saved.stage, saved.score);
      return json(request, 200, { record: saved });
    } catch (error) {
      context.error(error);
      if (error.status) return json(request, error.status, { error: error.message });
      return json(request, 500, { error: "Leaderboard service unavailable." });
    }
  }
});