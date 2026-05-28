import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { minify } from "terser";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const sourceHtmlPath = join(rootDir, "index.html");
const outputDir = join(rootDir, ".deploy", "site");
const outputAssetsDir = join(outputDir, "assets");
const phaserSourcePath = join(rootDir, "node_modules", "phaser", "dist", "phaser.min.js");
const phaserOutputPath = "assets/vendor/phaser.min.js";
const leaderboardApiBase = process.env.HANZI_TANK_LEADERBOARD_API || "";

const localScriptPattern = /\n?\s*<script src="(src\/[^"]+\.js)"><\/script>/g;
const inlineScriptPattern = /\n?\s*<script>\s*([\s\S]*?)\s*<\/script>\s*\n<\/body>/;
const phaserCdnScriptPattern = /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/phaser@3\.80\.1\/dist\/phaser\.min\.js"><\/script>/;

function toPosixPath(path) {
  return path.split(sep).join("/");
}

function assertSafeLocalScript(scriptPath) {
  const resolvedPath = resolve(rootDir, scriptPath);
  if (!resolvedPath.startsWith(`${rootDir}${sep}`)) {
    throw new Error(`Refusing to bundle script outside project root: ${scriptPath}`);
  }
  return resolvedPath;
}

async function readLocalScripts(html) {
  const scripts = [];
  for (const match of html.matchAll(localScriptPattern)) {
    const scriptPath = match[1];
    const resolvedPath = assertSafeLocalScript(scriptPath);
    const code = await readFile(resolvedPath, "utf8");
    scripts.push({ scriptPath, code });
  }

  if (scripts.length === 0) {
    throw new Error("No local src/*.js scripts were found to bundle.");
  }

  return scripts;
}

function getInlineAppScript(html) {
  const match = html.match(inlineScriptPattern);
  if (!match) {
    throw new Error("Could not find the final inline app script in index.html.");
  }
  return match[1];
}

async function minifyJavaScript(bundle) {
  const result = await minify(bundle, {
    compress: {
      passes: 2,
      pure_getters: false
    },
    mangle: {
      toplevel: true
    },
    sourceMap: false,
    format: {
      comments: false
    }
  });

  if (!result.code) {
    throw new Error("Terser produced an empty bundle.");
  }

  return result.code;
}

function minifyHtml(html) {
  return html
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function copyRuntimeAssets() {
  await cp(join(rootDir, "assets"), outputAssetsDir, {
    recursive: true,
    filter(source) {
      const relativePath = toPosixPath(relative(rootDir, source));
      if (relativePath === "assets/source" || relativePath.startsWith("assets/source/")) return false;
      if (relativePath === "assets/audio/README.md") return false;
      return true;
    }
  });
  await rm(join(outputAssetsDir, "source"), { recursive: true, force: true });
  await rm(join(outputAssetsDir, "audio", "README.md"), { force: true });
}

async function copyPhaserRuntime() {
  await mkdir(dirname(join(outputDir, phaserOutputPath)), { recursive: true });
  await cp(phaserSourcePath, join(outputDir, phaserOutputPath));
}

async function build() {
  const sourceHtml = await readFile(sourceHtmlPath, "utf8");
  const localScripts = await readLocalScripts(sourceHtml);
  const inlineAppScript = getInlineAppScript(sourceHtml);
  const bundleParts = localScripts.map(({ scriptPath, code }) => `;\n/* ${scriptPath} */\n${code}`);
  bundleParts.push(`;\n/* index.html app */\n${inlineAppScript}`);

  const minifiedJs = await minifyJavaScript(bundleParts.join("\n"));
  const jsHash = createHash("sha256").update(minifiedJs).digest("hex").slice(0, 12);
  const appScriptPath = `assets/app.${jsHash}.js`;

  let productionHtml = sourceHtml.replace(localScriptPattern, "");
  productionHtml = productionHtml.replace(
    phaserCdnScriptPattern,
    `<script src="${phaserOutputPath}"></script>`
  );
  productionHtml = productionHtml.replace(
    /<meta name="hanzi-tank-leaderboard-api" content="[^"]*">/,
    `<meta name="hanzi-tank-leaderboard-api" content="${leaderboardApiBase.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">`
  );
  productionHtml = productionHtml.replace(
    inlineScriptPattern,
    `\n  <script src="${appScriptPath}"></script>\n</body>`
  );

  productionHtml = productionHtml.replace(
    "<title>汉字Tank - Multi Lane</title>",
    `<title>汉字Tank - Multi Lane</title>\n  <meta name="application-name" content="汉字Tank">\n  <meta name="hanzi-tank-build" content="${jsHash}">`
  );

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(dirname(join(outputDir, appScriptPath)), { recursive: true });
  await copyRuntimeAssets();
  await copyPhaserRuntime();
  await writeFile(join(outputDir, appScriptPath), minifiedJs, "utf8");
  await writeFile(join(outputDir, "index.html"), `${minifyHtml(productionHtml)}\n`, "utf8");
  await writeFile(join(outputDir, ".nojekyll"), "", "utf8");

  console.log(`Built ${toPosixPath(relative(rootDir, outputDir))}`);
  console.log(`Bundled ${localScripts.length} local scripts into ${appScriptPath}`);
  console.log(`Copied Phaser runtime to ${phaserOutputPath}`);
  console.log("Source maps are disabled for production output.");
}

build().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

