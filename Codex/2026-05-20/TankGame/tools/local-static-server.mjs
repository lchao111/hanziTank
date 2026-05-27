import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const portArg = process.argv.find((arg) => /^--port=\d+$/.test(arg));
const port = Number(process.env.PORT || portArg?.split("=")[1] || 5173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

function getSafeFilePath(requestUrl) {
  const url = new URL(requestUrl, `http://127.0.0.1:${port}`);
  const decodedPath = decodeURIComponent(url.pathname);
  const relativePath = normalize(decodedPath).replace(/^([/\\])+/, "");
  const filePath = resolve(join(rootDir, relativePath || "index.html"));

  if (filePath !== rootDir && !filePath.startsWith(`${rootDir}${sep}`)) {
    return null;
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    return join(filePath, "index.html");
  }

  return filePath;
}

const server = createServer((request, response) => {
  if (!request.url || request.method !== "GET") {
    response.writeHead(405, { Allow: "GET" });
    response.end("Method not allowed");
    return;
  }

  const filePath = getSafeFilePath(request.url);
  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Hanzi Tank local server: http://127.0.0.1:${port}/index.html`);
  console.log("Tip: browser localStorage is scoped by URL origin, so file:// and localhost saves are separate.");
});