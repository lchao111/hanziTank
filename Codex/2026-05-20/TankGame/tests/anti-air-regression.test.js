const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function bodyOf(name) {
  const start = source.indexOf(`function ${name}`);
  assert.notStrictEqual(start, -1, `Missing function ${name}.`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }
  throw new Error(`Could not parse function ${name}.`);
}

['antiAirModeButton', 'antiAirLayer', 'antiAirPlanes', 'antiAirTank', 'antiAirHearts', 'antiAirCrosshair'].forEach((id) => {
  assert.match(source, new RegExp(`id="${id}"`), `Missing anti-air DOM id ${id}.`);
  assert.match(source, new RegExp(`document\\.querySelector\\("#${id}"\\)`), `Missing cached selector for ${id}.`);
});

[
  'startAntiAirMode',
  'resetAntiAirRun',
  'renderAntiAirWave',
  'getAntiAirPlaneVisualAngle',
  'chooseAntiAirPlane',
  'updateAntiAirCrosshair',
  'aimAntiAirTankAt',
  'getAntiAirPlanesInCrosshair',
  'shootAntiAirCrosshair',
  'spawnAntiAirCasings',
  'spawnAntiAirDebris',
  'missAntiAirPlane',
  'handleAntiAirWaveComplete',
  'startAntiAirMissReinforcement',
  'dropAntiAirBomb',
  'playBombDropSound',
  'renderAntiAirHearts',
  'clearAntiAirMode'
].forEach((name) => bodyOf(name));

assert.match(source, /antiAirModeButton\.addEventListener\("click", startAntiAirMode\)/, 'Mode gate should launch anti-air mode.');
assert.match(source, /createQuestionAntiAirWave\(\{/, 'Anti-air mode should create waves through question-core logic.');
assert.match(source, /planes\.forEach\(\(plane\)/, 'Anti-air mode should render every plane in the core wave.');
assert.match(source, /button\.innerHTML = `<span class="anti-air-plane-art" aria-hidden="true"><\/span><span class="anti-air-hanzi">\$\{escapeHtml\(plane\.word\.hanzi\)\}<\/span>`/, 'Each plane should show raster art plus its Hanzi inside the large click target.');
assert.match(source, /\.anti-air-crosshair\s*\{[\s\S]*width:\s*150px;[\s\S]*height:\s*150px;/, 'Anti-air mode should use a large crosshair target.');
assert.match(source, /\.anti-air-crosshair\s*\{[\s\S]*border:\s*6px solid #ef0000;/, 'Anti-air crosshair should be a bold red sniper-scope ring.');
assert.match(source, /\.anti-air-crosshair\s*\{[\s\S]*radial-gradient\(circle at center, #ef0000 0 13px, transparent 14px\)/, 'Anti-air crosshair should show a red center dot.');
assert.match(source, /\.anti-air-crosshair::before[\s\S]*repeating-linear-gradient/, 'Anti-air crosshair should include vertical sniper tick marks.');
assert.match(source, /\.anti-air-crosshair::after[\s\S]*repeating-linear-gradient/, 'Anti-air crosshair should include horizontal sniper tick marks.');
assert.match(source, /\.battlefield\.anti-air-mode \.anti-air-layer\s*\{[\s\S]*cursor:\s*none;/, 'Anti-air mode should hide the default pointer behind the crosshair.');
assert.match(source, /antiAirLayer\.addEventListener\("pointermove", updateAntiAirCrosshair\)/, 'Moving the pointer should move the anti-air crosshair.');
assert.match(source, /antiAirLayer\.addEventListener\("click", shootAntiAirCrosshair\)/, 'Clicking the battlefield should fire through the crosshair, not require clicking the plane.');
assert.match(bodyOf('getAntiAirPlanesInCrosshair'), /antiAirCrosshairRadius/, 'Crosshair hit detection should use a forgiving radius.');
assert.match(bodyOf('shootAntiAirCrosshair'), /getAntiAirPlanesInCrosshair\(/, 'Crosshair fire should resolve planes inside the crosshair.');
assert.match(bodyOf('shootAntiAirCrosshair'), /chooseAntiAirPlane\(planeEl\)/, 'Planes inside the crosshair should be hit through existing anti-air answer logic.');
assert.match(bodyOf('launchAntiAirShell'), /spawnAntiAirCasings\(\)/, 'Anti-air shots should eject visible shell casings/magazine splash.');
assert.match(bodyOf('spawnAntiAirCasings'), /anti-air-casing/, 'Anti-air casing effect should create casing particles.');
assert.match(bodyOf('finishAntiAirPlane'), /spawnAntiAirDebris\(planeEl\)/, 'Destroyed anti-air planes should spawn debris from their current position.');
assert.match(bodyOf('spawnAntiAirDebris'), /anti-air-debris/, 'Plane destruction should create debris fragments.');
assert.match(bodyOf('spawnAntiAirDebris'), /anti-air-debris-wing/, 'Plane destruction should include wing debris.');
assert.match(bodyOf('spawnAntiAirDebris'), /anti-air-debris-smoke/, 'Plane destruction should include smoke debris.');
assert.match(bodyOf('spawnAntiAirDebris'), /anti-air-plane-blast/, 'Plane destruction should include a large visible blast.');
assert.match(bodyOf('finishAntiAirPlane'), /playExplosionSound\(\)/, 'Destroyed planes should have an obvious explosion sound.');
assert.match(bodyOf('renderAntiAirWave'), /speakWord\(spokenTarget, \{/, 'Anti-air prompts should use guarded Hanzi plus phrase TTS.');
assert.match(bodyOf('renderAntiAirWave'), /const spokenWaveId = antiAirState\.waveId/, 'Anti-air speech should capture the current wave id.');
assert.match(bodyOf('renderAntiAirWave'), /stopPrevious:\s*true/, 'Anti-air speech should stop stale Hanzi audio from previous waves.');
assert.match(bodyOf('renderAntiAirWave'), /shouldSpeak:[\s\S]*antiAirState\.waveId === spokenWaveId/, 'Anti-air speech should not play stale prompts after a new wave renders.');
assert.match(bodyOf('renderAntiAirWave'), /waveNumber: antiAirWaveNumber/, 'Anti-air wave rendering should scale difficulty by wave number.');
assert.match(bodyOf('renderAntiAirWave'), /antiAirWaveNumber \+= 1/, 'Anti-air mode should advance its wave counter after each rendered wave.');
assert.match(bodyOf('chooseAntiAirPlane'), /recordCorrectBank\(plane\.word\)/, 'Correct anti-air clicks should count toward Hanzi learning.');
assert.match(bodyOf('chooseAntiAirPlane'), /score \+= 1/, 'Correct anti-air clicks should add one point.');
assert.match(bodyOf('buildWarSummary'), /antiAirScore: isAntiAirSummary \? score : 0/, 'Anti-air game over summaries should preserve the final anti-air score for leaderboards.');
assert.match(bodyOf('showGameOver'), /buildWarSummary\(\{ mode: wasAntiAirActive \? "antiAir" : "battle" \}\)/, 'Game over should tag anti-air runs before saving the war summary.');
assert.match(bodyOf('missAntiAirPlane'), /if \(!plane\.isTarget\)/, 'Fake planes should be allowed to fly away without bombing the tank.');
assert.match(bodyOf('missAntiAirPlane'), /applyQuestionAntiAirMiss\(lives\)/, 'Missing the real plane should use core miss damage.');
assert.match(bodyOf('missAntiAirPlane'), /dropAntiAirBomb\(plane\)/, 'Only the missed real plane should drop a bomb.');
assert.match(source, /missedTarget:\s*null/, 'Anti-air state should track whether the real target plane was missed.');
assert.match(bodyOf('missAntiAirPlane'), /antiAirState\.missedTarget\s*=\s*plane/, 'Missing the real plane should defer reinforcement by recording the missed target.');
assert.match(bodyOf('finishAntiAirPlane'), /handleAntiAirWaveComplete/, 'Wave completion should route through the reinforcement gate after all planes clear.');
assert.match(bodyOf('finishAntiAirPlane'), /setTimeout\(handleAntiAirWaveComplete, 0\)/, 'Wave completion should wait for miss bookkeeping so a last-plane target miss can reinforce.');
assert.match(bodyOf('handleAntiAirWaveComplete'), /antiAirState\.pending > 0/, 'Reinforcement should wait until every plane has finished flying.');
assert.match(bodyOf('handleAntiAirWaveComplete'), /startAntiAirMissReinforcement\(antiAirState\.missedTarget\)/, 'Missed real planes should trigger reinforcement before the next wave.');
assert.match(bodyOf('handleAntiAirWaveComplete'), /setTimeout\(renderAntiAirWave, 620\)/, 'Clean waves should continue directly into the next anti-air wave.');
assert.match(bodyOf('chooseAntiAirPlane'), /antiAirState\.missedTarget\s*=\s*null/, 'Shooting the correct plane should prevent delayed miss reinforcement.');
assert.match(bodyOf('startAntiAirMissReinforcement'), /anti-air-plane anti-air-reinforcement-plane/, 'Reinforcement should create a close-up plane carrying the missed Hanzi.');
assert.match(bodyOf('startAntiAirMissReinforcement'), /dropAntiAirBomb\(plane, \{\s*large:\s*true/, 'Reinforcement should drop a huge bomb after the close-up.');
assert.match(bodyOf('startAntiAirMissReinforcement'), /speakWord\(plane\.word, \{[\s\S]*stopPrevious:\s*true/, 'Reinforcement should pronounce the missed Hanzi.');
assert.match(bodyOf('startAntiAirMissReinforcement'), /shouldSpeak:[\s\S]*antiAirState\.waveId === reinforcementWaveId/, 'Reinforcement speech should be guarded against stale waves.');
assert.match(source, /\.anti-air-reinforcement-plane\s*\{[\s\S]*animation:\s*anti-air-reinforcement-closeup/, 'Miss reinforcement should visibly close up the Hanzi plane.');
assert.match(source, /\.anti-air-bomb\.large\s*\{[\s\S]*width:\s*72px;[\s\S]*height:\s*108px;/, 'Miss reinforcement should use a huge bomb visual.');
assert.match(bodyOf('chooseAntiAirPlane'), /finishAntiAirPlane\(plane, "hit"\)/, 'Shooting down the real plane should resolve it before any miss bomb can trigger.');
assert.match(bodyOf('resetAntiAirRun'), /lives = antiAirMaxLives/, 'Anti-air tank should start with 10 HP.');
assert.match(bodyOf('syncHud'), /antiAirActive \? antiAirMaxLives : getMaxLives\(\)/, 'HUD should show the anti-air 10 HP max while in anti-air mode.');
assert.match(bodyOf('renderAntiAirHearts'), /antiAirMaxLives/, 'Anti-air hearts should render one slot for each of the 10 tank HP.');
assert.match(bodyOf('renderAntiAirHearts'), /anti-air-heart/, 'Anti-air hearts should use red heart UI elements.');
assert.match(bodyOf('syncHud'), /renderAntiAirHearts\(\)/, 'HUD sync should keep the tank-under hearts current.');
assert.match(source, /\.anti-air-plane\s*\{[\s\S]*width:\s*112px;[\s\S]*height:\s*74px;/, 'Anti-air planes should be large enough for young players to click easily.');
['fly', 'dropBomb', 'explode'].forEach((state) => {
  assert.match(source, new RegExp(`antiAirBomberAssets\\.${state}\\s*=\\s*"assets/sprites/anti-air/bomber-${state}\\.png"`), `Anti-air ${state} state should use the raster bomber PNG.`);
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', 'sprites', 'anti-air', `bomber-${state}.png`)), `Missing raster bomber ${state} asset.`);
});
assert.match(source, /\.anti-air-plane-art\s*\{[\s\S]*background-image:\s*var\(--bomber-image\);/, 'Anti-air plane art should render the bomber PNG through a dedicated art layer.');
assert.doesNotMatch(source, /\.anti-air-plane::before,[\s\S]*\.anti-air-plane::after\s*\{[\s\S]*background:\s*linear-gradient/, 'Anti-air plane body should not be CSS-drawn pseudo-element art.');
assert.match(bodyOf('renderAntiAirWave'), /anti-air-plane-art/, 'Wave planes should include the raster bomber art layer.');
assert.match(bodyOf('finishAntiAirPlane'), /antiAirBomberAssets\.explode/, 'Destroyed planes should switch to the raster explosion bomber state.');
assert.match(bodyOf('startAntiAirMissReinforcement'), /antiAirBomberAssets\.dropBomb/, 'Miss reinforcement close-up should use the raster drop-bomb bomber state.');
assert.match(source, /\.anti-air-plane \.anti-air-hanzi\s*\{[\s\S]*pointer-events:\s*none;/, 'Clicking the Hanzi label should still hit the whole plane button.');
assert.match(source, /\.anti-air-plane \.anti-air-hanzi\s*\{[\s\S]*transform:\s*rotate\(var\(--hanzi-angle/, 'Hanzi labels should counter-rotate so they stay upright on rotated planes.');
assert.match(source, /\.topbar,[\s\S]*\.prompt,[\s\S]*\.anti-air-status\s*\{[\s\S]*user-select:\s*none;/, 'Top game prompt text should be non-selectable during anti-air clicking.');
assert.match(source, /\.anti-air-shell\s*\{[\s\S]*width:\s*22px;[\s\S]*height:\s*52px;/, 'Anti-air projectile should be a larger cannon shell.');
assert.match(source, /\.anti-air-plane-blast\s*\{[\s\S]*width:\s*132px;[\s\S]*height:\s*132px;/, 'Plane explosion should be large and obvious.');
assert.match(bodyOf('renderAntiAirWave'), /anti-air-plane-art[\s\S]*anti-air-hanzi/, 'Plane Hanzi should stay inside the same clickable raster-art plane button.');
assert.match(bodyOf('renderAntiAirWave'), /--start-y/, 'Anti-air planes should use per-plane start Y positions.');
assert.match(bodyOf('renderAntiAirWave'), /--end-x/, 'Anti-air planes should use per-plane end X positions.');
assert.match(bodyOf('renderAntiAirWave'), /--end-y/, 'Anti-air planes should use per-plane end Y positions.');
assert.match(bodyOf('renderAntiAirWave'), /--plane-angle/, 'Anti-air planes should rotate their nose toward their flight heading.');
assert.match(bodyOf('renderAntiAirWave'), /--hanzi-angle/, 'Anti-air rendering should counter-rotate Hanzi labels against plane rotation.');
assert.match(bodyOf('getAntiAirPlaneVisualAngle'), /headingDeg \+ 180/, 'Current anti-air plane art should be flipped 180 degrees so its nose faces the flight direction.');
assert.match(bodyOf('renderAntiAirWave'), /getAntiAirPlaneVisualAngle\(plane\.headingDeg\)/, 'Anti-air rendering should use the visual plane angle correction.');
assert.match(source, /\.anti-air-plane-art\s*\{[\s\S]*background-size:\s*contain;/, 'Anti-air raster plane art should preserve the bomber silhouette.');
assert.match(source, /@keyframes anti-air-flight[\s\S]*rotate\(var\(--plane-angle/, 'Anti-air flight animation should preserve the plane heading angle.');
assert.match(source, /\.anti-air-plane\.hit\s*\{[\s\S]*animation:\s*anti-air-plane-hit-fall/, 'Destroyed anti-air planes should fall instead of freezing in the air.');
assert.match(source, /@keyframes anti-air-plane-hit-fall[\s\S]*--fall-distance/, 'Destroyed anti-air planes should animate downward with a fall distance variable.');
assert.match(bodyOf('spawnAntiAirDebris'), /--fall-distance/, 'Plane explosion debris should receive a downward fall distance from the battlefield height.');
assert.match(source, /\.anti-air-tank::before[\s\S]*rotate\(var\(--barrel-angle/, 'Anti-air tank barrel should rotate toward the aiming direction.');
assert.match(bodyOf('updateAntiAirCrosshair'), /aimAntiAirTankAt\(x, y\)/, 'Moving the crosshair should aim the anti-air tank barrel.');
assert.match(bodyOf('aimAntiAirTankAt'), /--barrel-angle/, 'Tank aiming should update the barrel angle CSS variable.');
['normal', 'weakened', 'bombed', 'firing', 'destroyed'].forEach((state) => {
  assert.match(source, new RegExp(`antiAirTankAssets\\.${state}\\s*=\\s*"assets/sprites/anti-air/tank-${state}\\.png"`), `Anti-air tank ${state} state should use the raster tank PNG.`);
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', 'sprites', 'anti-air', `tank-${state}.png`)), `Missing raster tank ${state} asset.`);
});
assert.match(source, /\.anti-air-tank\s*\{[\s\S]*background-image:\s*var\(--tank-image\);/, 'Anti-air tank should render the raster tank art on the tank element.');
assert.match(source, /\.anti-air-tank\s*\{[\s\S]*--tank-facing-rotation:\s*-90deg;/, 'Anti-air tank raster art should rotate from right-facing source art to the 12 o clock direction.');
assert.match(source, /@keyframes anti-air-tank-recoil[\s\S]*rotate\(var\(--tank-facing-rotation/, 'Anti-air tank recoil should preserve the 12 o clock facing rotation.');
assert.match(bodyOf('updateAntiAirTankVisual'), /antiAirTankAssets\.bombed/, 'Bomb impacts should briefly switch the tank to the raster bombed state.');
assert.match(bodyOf('updateAntiAirTankVisual'), /antiAirTankAssets\.weakened/, 'Low anti-air HP should switch the tank to the weakened raster state.');
assert.match(bodyOf('triggerAntiAirTankFiring'), /antiAirTankAssets\.firing/, 'Firing should briefly switch the tank to the firing raster state.');
assert.match(bodyOf('missAntiAirPlane'), /updateAntiAirTankVisual\(\{\s*impact:\s*true\s*\}\)/, 'A missed target bomb should trigger the tank bombed state.');
assert.match(bodyOf('dropAntiAirBomb'), /playBombDropSound\(\)/, 'Dropping a bomb should play a distinct falling bomb sound.');
assert.match(bodyOf('playBombDropSound'), /endFrequency/, 'Bomb drop sound should use a falling pitch cue.');

console.log('anti-air regression tests passed');
