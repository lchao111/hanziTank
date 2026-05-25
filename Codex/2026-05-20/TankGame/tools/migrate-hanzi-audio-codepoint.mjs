import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import manifest from '../src/data/hanzi-audio-manifest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const audioDir = path.join(projectRoot, 'assets', 'audio', 'hanzi');

const legacyFiles = new Map([
  ['雨', 'yu.mp3'],
  ['风', 'feng.mp3'],
  ['云', 'yun.mp3'],
  ['天', 'tian.mp3'],
  ['地', 'di.mp3'],
  ['日', 'ri.mp3'],
  ['月', 'yue.mp3'],
  ['星', 'xing.mp3'],
  ['山', 'shan.mp3'],
  ['水', 'shui.mp3'],
  ['火', 'huo.mp3'],
  ['石', 'shi.mp3'],
  ['田', 'tian-field.mp3'],
  ['土', 'tu.mp3'],
  ['人', 'ren.mp3'],
  ['口', 'kou.mp3'],
  ['耳', 'er.mp3'],
  ['目', 'mu.mp3'],
  ['手', 'shou.mp3'],
  ['足', 'zu.mp3'],
  ['心', 'xin.mp3'],
  ['头', 'tou.mp3'],
  ['生', 'sheng.mp3'],
  ['走', 'zou.mp3'],
  ['跑', 'pao.mp3'],
  ['出', 'chu.mp3'],
  ['入', 'ru.mp3'],
  ['坐', 'zuo.mp3'],
  ['立', 'li.mp3'],
  ['鸟', 'niao.mp3'],
  ['马', 'ma.mp3'],
  ['牛', 'niu.mp3'],
  ['羊', 'yang.mp3'],
  ['虫', 'chong.mp3'],
  ['鱼', 'yu-fish.mp3'],
  ['草', 'cao.mp3'],
  ['花', 'hua.mp3'],
  ['木', 'mu-wood.mp3'],
  ['林', 'lin.mp3'],
  ['一', 'yi.mp3'],
  ['二', 'er-two.mp3'],
  ['三', 'san.mp3'],
  ['上', 'shang.mp3'],
  ['下', 'xia.mp3'],
  ['左', 'zuo-left.mp3'],
  ['右', 'you.mp3'],
  ['东', 'dong.mp3'],
  ['西', 'xi.mp3'],
  ['南', 'nan.mp3'],
  ['北', 'bei.mp3'],
  ['大', 'da.mp3'],
  ['小', 'xiao.mp3'],
  ['多', 'duo.mp3'],
  ['少', 'shao.mp3'],
  ['文', 'wen.mp3'],
  ['字', 'zi.mp3'],
  ['书', 'shu.mp3'],
  ['学', 'xue.mp3'],
  ['工', 'gong.mp3'],
  ['厂', 'chang.mp3']
]);

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

let moved = 0;
let skipped = 0;

for (const item of manifest.hanziAudioPrompts) {
  const legacyFile = legacyFiles.get(item.hanzi);
  if (!legacyFile) throw new Error(`Missing legacy mapping for ${item.hanzi}`);
  const legacyPath = path.join(audioDir, legacyFile);
  const targetPath = path.join(audioDir, item.file);
  if (await exists(targetPath)) {
    skipped += 1;
    continue;
  }
  if (!(await exists(legacyPath))) {
    console.warn(`missing ${item.hanzi}: ${path.relative(projectRoot, legacyPath)}`);
    continue;
  }
  await fs.rename(legacyPath, targetPath);
  moved += 1;
  console.log(`renamed ${item.hanzi}: ${legacyFile} -> ${item.file}`);
}

console.log(`Migration complete. renamed=${moved}, skipped=${skipped}`);
