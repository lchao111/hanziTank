const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const skillsRoot = path.join(root, '.github', 'skills');

const expectedSkills = [
  {
    name: 'tankgame-core-module-extraction',
    triggers: ['core module', 'pure logic', 'UMD'],
    references: ['DEVELOPMENT_GUIDELINES.md', 'src/core/', 'tests/']
  },
  {
    name: 'tankgame-asset-factory',
    triggers: ['asset factory', 'spritesheet', 'QC'],
    references: ['docs/ASSET_FACTORY.md', 'npm run asset', 'ART_STYLE_GUIDE.md']
  },
  {
    name: 'tankgame-boss-enemy-creation',
    triggers: ['boss', 'enemy', 'elite'],
    references: ['src/data/enemies.js', 'ENEMY_DESIGN_LOG.md', 'tests/enemy-elites-regression.test.js']
  },
  {
    name: 'tankgame-hanzi-audio',
    triggers: ['Hanzi audio', 'edge-tts', 'download queue'],
    references: ['tools/generate-hanzi-audio.mjs', 'assets/audio/README.md', 'tests/hanzi-audio-manifest.test.js']
  },
  {
    name: 'tankgame-war-prep-assets',
    triggers: ['War Prep', 'tank preview', 'ammo'],
    references: ['IMAGE_GENERATION_WORK_LOG.md', 'tests/war-prep-ui-regression.test.js', 'assets/sprites/tanks/war-prep/']
  },
  {
    name: 'tankgame-phaser-vfx',
    triggers: ['Phaser', 'VFX', 'browser validation'],
    references: ['PROJECT_STATE.md', 'tests/phaser-vfx-regression.test.js', 'index.html']
  },
  {
    name: 'tankgame-release-checkpoint',
    triggers: ['release', 'deploy', 'build'],
    references: ['AGENT_HANDOFF.md', 'DEPLOYMENT.md', 'npm test']
  },
  {
    name: 'tankgame-pm-agent-coordination',
    triggers: ['PM role', 'dispatch agents', 'agent status'],
    references: ['AGENT_HANDOFF.md', '.github/hooks/agent-complete-tts.json', '任务完成']
  }
];

function readSkill(skillName) {
  const filePath = path.join(skillsRoot, skillName, 'SKILL.md');
  assert.ok(fs.existsSync(filePath), `${skillName} should have a SKILL.md file`);
  return fs.readFileSync(filePath, 'utf8');
}

function parseFrontmatter(source, skillName) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
  assert.ok(match, `${skillName} should start with YAML frontmatter`);
  const fields = Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(':');
        assert.notStrictEqual(separator, -1, `${skillName} frontmatter line should contain a colon: ${line}`);
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')];
      })
  );
  assert.strictEqual(fields.name, skillName, `${skillName} frontmatter name should match its folder`);
  assert.ok(fields.description, `${skillName} should have a description`);
  assert.match(fields.description, /^Use when\b/, `${skillName} description should start with "Use when"`);
  assert.ok(fields.description.length <= 500, `${skillName} description should stay concise for discovery`);
  return fields;
}

assert.ok(fs.existsSync(skillsRoot), '.github/skills should exist for project-level TankGame skills');

for (const skill of expectedSkills) {
  const source = readSkill(skill.name);
  const frontmatter = parseFrontmatter(source, skill.name);
  for (const trigger of skill.triggers) {
    assert.ok(
      frontmatter.description.includes(trigger) || source.includes(trigger),
      `${skill.name} should include trigger phrase ${trigger}`
    );
  }
  for (const reference of skill.references) {
    assert.ok(source.includes(reference), `${skill.name} should reference ${reference}`);
  }
  assert.match(source, /## When to Use/, `${skill.name} should include a When to Use section`);
  assert.match(source, /## Workflow/, `${skill.name} should include a Workflow section`);
  assert.match(source, /## Verification/, `${skill.name} should include a Verification section`);
}

console.log('TankGame skill files regression tests passed');