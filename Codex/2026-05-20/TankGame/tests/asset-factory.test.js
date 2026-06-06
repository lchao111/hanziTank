const assert = require('assert');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execFileSync, spawnSync } = require('child_process');
const { imageSize } = require('image-size');

const root = path.join(__dirname, '..');
const toolPath = path.join(root, 'tools', 'asset-factory.mjs');
const tempDir = path.join(root, '.tmp', 'asset-factory-test');
const enemyId = 'asset-factory-test';
const generatedDir = path.join(root, 'assets', 'source', 'generated', 'enemies', enemyId);

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const CRC_TABLE = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
  }
  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
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

function writeSolidPng(filePath, width, height, color) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  let offset = 0;
  for (let y = 0; y < height; y += 1) {
    raw[offset++] = 0;
    for (let x = 0; x < width; x += 1) {
      raw[offset++] = color[0];
      raw[offset++] = color[1];
      raw[offset++] = color[2];
      raw[offset++] = color[3] ?? 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(6, 9);
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, Buffer.concat([
    PNG_SIGNATURE,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', zlib.deflateSync(raw)),
    makeChunk('IEND')
  ]));
}

function runAssetFactory(args, options = {}) {
  return spawnSync(process.execPath, [toolPath, ...args], {
    cwd: root,
    encoding: 'utf8',
    ...options
  });
}

fs.rmSync(tempDir, { recursive: true, force: true });
fs.rmSync(generatedDir, { recursive: true, force: true });
fs.mkdirSync(tempDir, { recursive: true });

assert.ok(fs.existsSync(toolPath), 'asset-factory CLI should exist');
const toolSource = fs.readFileSync(toolPath, 'utf8');
['prompt', 'imagegen', 'import', 'qc', 'process', 'comfy'].forEach((command) => {
  assert.match(toolSource, new RegExp(`['"]${command}['"]`), `asset-factory should expose ${command} command`);
});

{
  const result = runAssetFactory(['prompt', 'drone-swarm']);
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /drone-swarm-spritesheet\.prompt\.md/, 'prompt command should print existing prompt path');
  assert.match(result.stdout, /6 columns/i, 'prompt command should print prompt content');
}

{
  const result = runAssetFactory(['imagegen', 'drone-swarm']);
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /Codex\/Game Studio imagegen/i, 'imagegen command should name the built-in provider');
  assert.match(result.stdout, /1344 x 720/, 'imagegen command should repeat the strict canvas size');
  assert.match(result.stdout, /#00FF00/, 'imagegen command should repeat the strict background color');
  assert.match(result.stdout, /npm run asset -- import drone-swarm/, 'imagegen command should explain the import handoff');
}

const validFixture = path.join(tempDir, 'valid-green.png');
writeSolidPng(validFixture, 1344, 720, [0, 255, 0, 255]);

{
  const result = runAssetFactory(['import', enemyId, '--input', validFixture]);
  assert.strictEqual(result.status, 0, result.stderr);
  assert.ok(fs.existsSync(path.join(generatedDir, 'raw.png')), 'import should copy raw.png');
  const meta = JSON.parse(fs.readFileSync(path.join(generatedDir, 'pipeline-meta.json'), 'utf8'));
  assert.strictEqual(meta.enemyId, enemyId);
  assert.strictEqual(meta.strictSpec.width, 1344);
  assert.strictEqual(meta.strictSpec.cellWidth, 224);
}

{
  const result = runAssetFactory(['qc', enemyId]);
  assert.strictEqual(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /QC PASS/, 'qc should pass valid fixture');
}

{
  const result = runAssetFactory(['process', enemyId]);
  assert.strictEqual(result.status, 0, result.stderr || result.stdout);
  const transparentPath = path.join(generatedDir, 'transparent.png');
  assert.ok(fs.existsSync(transparentPath), 'process should write transparent.png');
  const transparentSize = imageSize(fs.readFileSync(transparentPath));
  assert.strictEqual(transparentSize.width, 1344);
  assert.strictEqual(transparentSize.height, 720);
  for (let index = 0; index < 30; index += 1) {
    const framePath = path.join(generatedDir, 'frames', `frame-${String(index).padStart(2, '0')}.png`);
    assert.ok(fs.existsSync(framePath), `frame ${index} should exist`);
    const frameSize = imageSize(fs.readFileSync(framePath));
    assert.strictEqual(frameSize.width, 224);
    assert.strictEqual(frameSize.height, 144);
  }
}

const wrongSizeId = 'asset-factory-wrong-size';
const wrongSizeDir = path.join(root, 'assets', 'source', 'generated', 'enemies', wrongSizeId);
const wrongSizeFixture = path.join(tempDir, 'wrong-size.png');
writeSolidPng(wrongSizeFixture, 640, 480, [0, 255, 0, 255]);
execFileSync(process.execPath, [toolPath, 'import', wrongSizeId, '--input', wrongSizeFixture], { cwd: root });
{
  const result = runAssetFactory(['qc', wrongSizeId]);
  assert.notStrictEqual(result.status, 0, 'qc should fail wrong dimensions');
  assert.match(result.stderr, /width 640 != 1344/, 'qc should explain wrong width');
}

const redBgId = 'asset-factory-red-bg';
const redBgDir = path.join(root, 'assets', 'source', 'generated', 'enemies', redBgId);
const redBgFixture = path.join(tempDir, 'red-bg.png');
writeSolidPng(redBgFixture, 1344, 720, [255, 0, 0, 255]);
execFileSync(process.execPath, [toolPath, 'import', redBgId, '--input', redBgFixture], { cwd: root });
{
  const result = runAssetFactory(['qc', redBgId]);
  assert.notStrictEqual(result.status, 0, 'qc should fail non-green background');
  assert.match(result.stderr, /boundaries are not clean #00FF00/, 'qc should explain non-green boundary samples');
}

fs.rmSync(generatedDir, { recursive: true, force: true });
fs.rmSync(wrongSizeDir, { recursive: true, force: true });
fs.rmSync(redBgDir, { recursive: true, force: true });
fs.rmSync(tempDir, { recursive: true, force: true });

console.log('asset factory tests passed');
