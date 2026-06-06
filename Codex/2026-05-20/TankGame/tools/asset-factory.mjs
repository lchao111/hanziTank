#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const STRICT_SPEC = Object.freeze({
  columns: 6,
  rows: 5,
  cellWidth: 224,
  cellHeight: 144,
  width: 1344,
  height: 720,
  background: '#00FF00'
});

const COMMANDS = new Set(['prompt', 'imagegen', 'import', 'qc', 'process', 'comfy']);
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function printUsage() {
  console.log(`TankGame Asset Factory

Usage:
  node tools/asset-factory.mjs prompt <enemy-id>
  node tools/asset-factory.mjs imagegen <enemy-id>
  node tools/asset-factory.mjs import <enemy-id> --input <png>
  node tools/asset-factory.mjs qc <enemy-id>
  node tools/asset-factory.mjs process <enemy-id>
  node tools/asset-factory.mjs comfy <enemy-id> [--url <comfy-url>]

Environment:
  COMFYUI_URL  ComfyUI endpoint, defaults to http://127.0.0.1:8188
`);
}

function fail(message, details = []) {
  console.error(message);
  details.forEach((detail) => console.error(`  - ${detail}`));
  process.exit(1);
}

function normalizeEnemyId(enemyId) {
  const normalized = String(enemyId || '').trim();
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(normalized)) {
    throw new Error(`Invalid enemy id: ${enemyId}`);
  }
  return normalized;
}

function toKebabCase(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

function getGeneratedDir(enemyId) {
  return path.join(projectRoot, 'assets', 'source', 'generated', 'enemies', enemyId);
}

function getRawPath(enemyId) {
  return path.join(getGeneratedDir(enemyId), 'raw.png');
}

function getPromptPath(enemyId) {
  const slug = toKebabCase(enemyId);
  const candidates = [
    path.join(projectRoot, 'assets', 'source', 'enemy-candidates', `${slug}-spritesheet.prompt.md`),
    path.join(projectRoot, 'assets', 'source', 'enemy-candidates', `${enemyId}-spritesheet.prompt.md`)
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

function parseArgs(argv) {
  const [command, enemyId, ...rest] = argv;
  const options = {};
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token === '--input') options.input = rest[index += 1];
    else if (token === '--url') options.url = rest[index += 1];
    else if (token) options._ = [...(options._ || []), token];
  }
  return { command, enemyId, options };
}

function readPng(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error(`Not a PNG file: ${filePath}`);
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const data = buffer.subarray(dataStart, dataEnd);
    offset = dataEnd + 4;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data.readUInt8(8);
      colorType = data.readUInt8(9);
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  if (bitDepth !== 8 || ![2, 6].includes(colorType)) {
    throw new Error(`Unsupported PNG format. Expected 8-bit RGB/RGBA, got bitDepth=${bitDepth} colorType=${colorType}`);
  }

  const bytesPerPixel = colorType === 6 ? 4 : 3;
  const inflated = zlib.inflateSync(Buffer.concat(idatChunks));
  const stride = width * bytesPerPixel;
  const rgba = Buffer.alloc(width * height * 4);
  let inputOffset = 0;
  let previous = Buffer.alloc(stride);

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[inputOffset++];
    const scanline = Buffer.from(inflated.subarray(inputOffset, inputOffset + stride));
    inputOffset += stride;

    for (let x = 0; x < stride; x += 1) {
      const left = x >= bytesPerPixel ? scanline[x - bytesPerPixel] : 0;
      const up = previous[x] || 0;
      const upLeft = x >= bytesPerPixel ? previous[x - bytesPerPixel] : 0;
      if (filter === 1) scanline[x] = (scanline[x] + left) & 0xff;
      else if (filter === 2) scanline[x] = (scanline[x] + up) & 0xff;
      else if (filter === 3) scanline[x] = (scanline[x] + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) scanline[x] = (scanline[x] + paeth(left, up, upLeft)) & 0xff;
      else if (filter !== 0) throw new Error(`Unsupported PNG filter: ${filter}`);
    }

    for (let x = 0; x < width; x += 1) {
      const source = x * bytesPerPixel;
      const target = ((y * width) + x) * 4;
      rgba[target] = scanline[source];
      rgba[target + 1] = scanline[source + 1];
      rgba[target + 2] = scanline[source + 2];
      rgba[target + 3] = colorType === 6 ? scanline[source + 3] : 255;
    }
    previous = scanline;
  }

  return { width, height, rgba };
}

function paeth(left, up, upLeft) {
  const estimate = left + up - upLeft;
  const distanceLeft = Math.abs(estimate - left);
  const distanceUp = Math.abs(estimate - up);
  const distanceUpLeft = Math.abs(estimate - upLeft);
  if (distanceLeft <= distanceUp && distanceLeft <= distanceUpLeft) return left;
  if (distanceUp <= distanceUpLeft) return up;
  return upLeft;
}

function makeChunk(type, data = Buffer.alloc(0)) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  typeBuffer.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return chunk;
}

const CRC_TABLE = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
  }
  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writePng(filePath, width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  let outputOffset = 0;
  for (let y = 0; y < height; y += 1) {
    raw[outputOffset++] = 0;
    rgba.copy(raw, outputOffset, y * width * 4, (y + 1) * width * 4);
    outputOffset += width * 4;
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(6, 9);
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const png = Buffer.concat([
    PNG_SIGNATURE,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', zlib.deflateSync(raw)),
    makeChunk('IEND')
  ]);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, png);
}

function isGreenPixel(r, g, b, tolerance = 34) {
  return r <= tolerance && g >= 255 - tolerance && b <= tolerance;
}

function isTransparentGreenPixel(r, g, b) {
  return g >= 150 && g > r * 1.45 && g > b * 1.45;
}

function getPixel(image, x, y) {
  const offset = ((y * image.width) + x) * 4;
  return [image.rgba[offset], image.rgba[offset + 1], image.rgba[offset + 2], image.rgba[offset + 3]];
}

function validateStrictSheet(image) {
  const issues = [];
  if (image.width !== STRICT_SPEC.width) issues.push(`width ${image.width} != ${STRICT_SPEC.width}`);
  if (image.height !== STRICT_SPEC.height) issues.push(`height ${image.height} != ${STRICT_SPEC.height}`);
  if (image.width % STRICT_SPEC.columns !== 0 || image.height % STRICT_SPEC.rows !== 0) {
    issues.push(`dimensions do not divide into ${STRICT_SPEC.columns}x${STRICT_SPEC.rows}`);
  }
  if (image.width / STRICT_SPEC.columns !== STRICT_SPEC.cellWidth) issues.push(`cell width is not ${STRICT_SPEC.cellWidth}`);
  if (image.height / STRICT_SPEC.rows !== STRICT_SPEC.cellHeight) issues.push(`cell height is not ${STRICT_SPEC.cellHeight}`);

  if (issues.length > 0) return issues;

  const boundarySamples = [];
  for (let x = 0; x < image.width; x += 1) {
    boundarySamples.push([x, 0], [x, image.height - 1]);
  }
  for (let y = 0; y < image.height; y += 1) {
    boundarySamples.push([0, y], [image.width - 1, y]);
  }
  for (let column = 1; column < STRICT_SPEC.columns; column += 1) {
    const x = column * STRICT_SPEC.cellWidth;
    for (let y = 0; y < image.height; y += 1) boundarySamples.push([x, y], [x - 1, y]);
  }
  for (let row = 1; row < STRICT_SPEC.rows; row += 1) {
    const y = row * STRICT_SPEC.cellHeight;
    for (let x = 0; x < image.width; x += 1) boundarySamples.push([x, y], [x, y - 1]);
  }

  let nonGreen = 0;
  for (const [x, y] of boundarySamples) {
    const [r, g, b] = getPixel(image, x, y);
    if (!isGreenPixel(r, g, b)) nonGreen += 1;
  }
  const ratio = nonGreen / Math.max(1, boundarySamples.length);
  if (ratio > 0.01) {
    issues.push(`cell/outer boundaries are not clean #00FF00 (${(ratio * 100).toFixed(2)}% non-green samples)`);
  }

  return issues;
}

function readMetadata(metaPath) {
  if (!fs.existsSync(metaPath)) return {};
  return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
}

function writeMetadata(enemyId, patch) {
  const outputDir = getGeneratedDir(enemyId);
  const metaPath = path.join(outputDir, 'pipeline-meta.json');
  const current = readMetadata(metaPath);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(metaPath, JSON.stringify({ ...current, ...patch }, null, 2));
}

function commandPrompt(enemyId) {
  const promptPath = getPromptPath(enemyId);
  if (!fs.existsSync(promptPath)) fail(`Prompt spec not found for ${enemyId}`, [promptPath]);
  console.log(`Prompt spec: ${path.relative(projectRoot, promptPath)}`);
  console.log('---');
  console.log(fs.readFileSync(promptPath, 'utf8'));
}

function commandImagegen(enemyId) {
  const promptPath = getPromptPath(enemyId);
  if (!fs.existsSync(promptPath)) fail(`Prompt spec not found for ${enemyId}`, [promptPath]);
  const prompt = fs.readFileSync(promptPath, 'utf8');
  console.log(`Codex/Game Studio imagegen packet for ${enemyId}`);
  console.log(`Prompt spec: ${path.relative(projectRoot, promptPath)}`);
  console.log('---');
  console.log('Use Codex/Game Studio imagegen to generate exactly one PNG spritesheet with this contract:');
  console.log(`- Canvas: ${STRICT_SPEC.width} x ${STRICT_SPEC.height}`);
  console.log(`- Grid: ${STRICT_SPEC.columns} columns x ${STRICT_SPEC.rows} rows`);
  console.log(`- Cell: ${STRICT_SPEC.cellWidth} x ${STRICT_SPEC.cellHeight}`);
  console.log(`- Background: ${STRICT_SPEC.background}`);
  console.log('- No checkerboard, transparency preview, grid lines, gutters, borders, labels, or frame numbers.');
  console.log('- All bodies and FX must stay inside their own cells.');
  console.log('--- PROMPT START ---');
  console.log(prompt);
  console.log('--- PROMPT END ---');
  console.log('After imagegen saves/downloads the PNG, run:');
  console.log(`npm run asset -- import ${enemyId} -- --input "<path-to-generated-png>"`);
  console.log(`npm run asset -- qc ${enemyId}`);
  console.log(`npm run asset -- process ${enemyId}`);
}

function commandImport(enemyId, options) {
  if (!options.input) fail('Missing required --input <png>');
  const inputPath = path.resolve(options.input);
  if (!fs.existsSync(inputPath)) fail('Input PNG not found', [inputPath]);
  const image = readPng(inputPath);
  const outputDir = getGeneratedDir(enemyId);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.copyFileSync(inputPath, getRawPath(enemyId));
  const promptPath = getPromptPath(enemyId);
  writeMetadata(enemyId, {
    enemyId,
    importedAt: new Date().toISOString(),
    provider: 'manual-import',
    sourcePath: inputPath,
    rawPath: path.relative(projectRoot, getRawPath(enemyId)).replace(/\\/g, '/'),
    promptSpecPath: fs.existsSync(promptPath) ? path.relative(projectRoot, promptPath).replace(/\\/g, '/') : null,
    strictSpec: STRICT_SPEC,
    rawImage: { width: image.width, height: image.height }
  });
  console.log(`Imported ${enemyId}: ${path.relative(projectRoot, getRawPath(enemyId))}`);
}

function commandQc(enemyId) {
  const rawPath = getRawPath(enemyId);
  if (!fs.existsSync(rawPath)) fail(`Raw sheet not found for ${enemyId}`, [path.relative(projectRoot, rawPath)]);
  const image = readPng(rawPath);
  const issues = validateStrictSheet(image);
  writeMetadata(enemyId, {
    lastQcAt: new Date().toISOString(),
    lastQc: { pass: issues.length === 0, issues }
  });
  if (issues.length > 0) fail(`QC FAIL: ${enemyId}`, issues);
  console.log(`QC PASS: ${enemyId}`);
}

function commandProcess(enemyId) {
  const rawPath = getRawPath(enemyId);
  if (!fs.existsSync(rawPath)) fail(`Raw sheet not found for ${enemyId}`, [path.relative(projectRoot, rawPath)]);
  const image = readPng(rawPath);
  const issues = validateStrictSheet(image);
  if (issues.length > 0) fail(`Refusing to process ${enemyId}; QC failed`, issues);

  const transparent = Buffer.from(image.rgba);
  for (let index = 0; index < transparent.length; index += 4) {
    if (isTransparentGreenPixel(transparent[index], transparent[index + 1], transparent[index + 2])) {
      transparent[index + 3] = 0;
      transparent[index + 1] = Math.min(transparent[index + 1], Math.max(transparent[index], transparent[index + 2]) + 8);
    }
  }

  const outputDir = getGeneratedDir(enemyId);
  const framesDir = path.join(outputDir, 'frames');
  const transparentPath = path.join(outputDir, 'transparent.png');
  fs.mkdirSync(framesDir, { recursive: true });
  writePng(transparentPath, image.width, image.height, transparent);

  const frames = [];
  for (let row = 0; row < STRICT_SPEC.rows; row += 1) {
    for (let column = 0; column < STRICT_SPEC.columns; column += 1) {
      const frameIndex = row * STRICT_SPEC.columns + column;
      const frame = Buffer.alloc(STRICT_SPEC.cellWidth * STRICT_SPEC.cellHeight * 4);
      for (let y = 0; y < STRICT_SPEC.cellHeight; y += 1) {
        const sourceStart = (((row * STRICT_SPEC.cellHeight + y) * image.width) + column * STRICT_SPEC.cellWidth) * 4;
        const sourceEnd = sourceStart + STRICT_SPEC.cellWidth * 4;
        transparent.copy(frame, y * STRICT_SPEC.cellWidth * 4, sourceStart, sourceEnd);
      }
      const framePath = path.join(framesDir, `frame-${String(frameIndex).padStart(2, '0')}.png`);
      writePng(framePath, STRICT_SPEC.cellWidth, STRICT_SPEC.cellHeight, frame);
      frames.push(path.relative(projectRoot, framePath).replace(/\\/g, '/'));
    }
  }

  writeMetadata(enemyId, {
    processedAt: new Date().toISOString(),
    transparentPath: path.relative(projectRoot, transparentPath).replace(/\\/g, '/'),
    frames
  });
  console.log(`Processed ${enemyId}: ${path.relative(projectRoot, transparentPath)}`);
  console.log(`Frames: ${frames.length}`);
}

async function commandComfy(enemyId, options) {
  const url = String(options.url || process.env.COMFYUI_URL || 'http://127.0.0.1:8188').replace(/\/$/, '');
  const workflowPath = path.join(projectRoot, 'assets', 'source', 'comfy-workflows', 'enemy-strict-6x5.json');
  let available = false;
  try {
    const response = await fetch(`${url}/system_stats`, { signal: AbortSignal.timeout(3000) });
    available = response.ok;
  } catch {
    available = false;
  }
  if (!available) {
    fail(`ComfyUI is not reachable at ${url}`, [
      'Start local ComfyUI first; local ComfyUI does not require an API key.',
      'Set COMFYUI_URL if you use a non-default host or port.'
    ]);
  }
  if (!fs.existsSync(workflowPath)) {
    fail('ComfyUI is reachable, but the enemy workflow JSON is missing', [
      path.relative(projectRoot, workflowPath),
      'Export a strict 6x5 spritesheet workflow from ComfyUI to that path.',
      `Then rerun: node tools/asset-factory.mjs comfy ${enemyId}`
    ]);
  }
  console.log(`ComfyUI reachable: ${url}`);
  console.log(`Workflow ready: ${path.relative(projectRoot, workflowPath)}`);
  console.log('MVP stops before queue submission; use manual import for generated PNGs until workflow node mapping is configured.');
}

async function main() {
  const { command, enemyId, options } = parseArgs(process.argv.slice(2));
  if (!COMMANDS.has(command) || !enemyId) {
    printUsage();
    process.exit(command ? 1 : 0);
  }
  const normalizedEnemyId = normalizeEnemyId(enemyId);
  if (command === 'prompt') commandPrompt(normalizedEnemyId);
  else if (command === 'imagegen') commandImagegen(normalizedEnemyId);
  else if (command === 'import') commandImport(normalizedEnemyId, options);
  else if (command === 'qc') commandQc(normalizedEnemyId);
  else if (command === 'process') commandProcess(normalizedEnemyId);
  else if (command === 'comfy') await commandComfy(normalizedEnemyId, options);
}

main().catch((error) => fail(`Asset factory error: ${error.message}`));
