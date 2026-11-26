// Render chosen moments as PNG stills (bundle once, render many).
// Usage: node tools/stills.mjs <outdir> <seconds...>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [outDir, ...secs] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const inputProps = {showSafeArea: process.env.SAFE === '1', handle: ''};
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'CliffHouseReel', inputProps, browserExecutable});
for (const s of secs) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * 30));
  const output = path.join(outDir, `t${String(s).padStart(5, '0')}.png`);
  await renderStill({serveUrl, composition, frame, output, scale: 0.5, inputProps, browserExecutable});
  console.log('rendered', output);
}
