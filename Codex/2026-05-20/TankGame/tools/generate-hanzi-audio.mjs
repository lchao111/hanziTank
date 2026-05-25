import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import manifest from '../src/data/hanzi-audio-manifest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'assets', 'audio', 'hanzi');
const pythonCommand = process.env.PYTHON || 'py';
const voice = process.env.EDGE_TTS_VOICE || 'zh-CN-XiaoxiaoNeural';
const rate = process.env.EDGE_TTS_RATE || '-8%';
const volume = process.env.EDGE_TTS_VOLUME || '+0%';
const pitch = process.env.EDGE_TTS_PITCH || '+0Hz';
const overwrite = process.env.HANZI_AUDIO_OVERWRITE === '1' || process.argv.includes('--overwrite');
const startAtArg = process.argv.find((arg) => arg.startsWith('--start-at='));
const startAt = Number.parseInt(process.env.HANZI_AUDIO_START_AT || startAtArg?.split('=')[1] || '1', 10);
const concurrencyArg = process.argv.find((arg) => arg.startsWith('--concurrency='));
const concurrency = Math.max(1, Number.parseInt(process.env.HANZI_AUDIO_CONCURRENCY || concurrencyArg?.split('=')[1] || '4', 10));

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function runEdgeTts(item, targetPath) {
  return new Promise((resolve, reject) => {
    const tempPath = `${targetPath}.tmp`;
    const child = spawn(pythonCommand, [
      '-m', 'edge_tts',
      '--voice', voice,
      '--rate', rate,
      '--volume', volume,
      '--pitch', pitch,
      '--text', item.text,
      '--write-media', tempPath
    ], {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', async (code) => {
      if (code !== 0) {
        await fs.rm(tempPath, { force: true }).catch(() => {});
        reject(new Error(`edge-tts failed for ${item.hanzi} (${code})\n${stdout}${stderr}`));
        return;
      }
      try {
        await fs.rename(tempPath, targetPath);
        resolve();
      } catch (error) {
        await fs.rm(tempPath, { force: true }).catch(() => {});
        reject(error);
      }
    });
  });
}

await fs.mkdir(outputDir, { recursive: true });

const itemsToGenerate = [];
for (const [index, item] of manifest.hanziAudioPrompts.entries()) {
  const position = index + 1;
  if (position < startAt) continue;
  const targetPath = path.join(outputDir, item.file);
  if (!overwrite && await exists(targetPath)) {
    console.log(`skip ${item.hanzi} -> ${path.relative(projectRoot, targetPath)} already exists`);
    continue;
  }
  itemsToGenerate.push({ item, targetPath, position });
}

if (itemsToGenerate.length === 0) {
  console.log('All Hanzi audio files already exist. Set HANZI_AUDIO_OVERWRITE=1 or pass --overwrite to replace them.');
  process.exit(0);
}

console.log(`Using Edge TTS voice ${voice} (rate ${rate}, pitch ${pitch}, volume ${volume})`);
console.log(`${overwrite ? 'Replacing' : 'Generating'} ${itemsToGenerate.length} Hanzi MP3 file${itemsToGenerate.length === 1 ? '' : 's'} with concurrency ${concurrency}...`);

let written = 0;
let nextIndex = 0;

async function generateNext() {
  while (nextIndex < itemsToGenerate.length) {
    const { item, targetPath, position } = itemsToGenerate[nextIndex];
    nextIndex += 1;
    await runEdgeTts(item, targetPath);
    const stats = await fs.stat(targetPath);
    written += 1;
    console.log(`wrote ${position}/${manifest.hanziAudioPrompts.length} ${item.hanzi} -> ${path.relative(projectRoot, targetPath)} (${stats.size} bytes)`);
  }
}

await Promise.all(Array.from({ length: Math.min(concurrency, itemsToGenerate.length) }, () => generateNext()));

console.log('Hanzi audio generation complete.');
