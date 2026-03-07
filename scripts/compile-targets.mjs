import { OfflineCompiler } from 'mind-ar/src/image-target/offline-compiler.js';
import { writeFile, readFile } from 'fs/promises';
import { createCanvas, loadImage } from '@napi-rs/canvas';

// Patch globalThis for mind-ar (expects browser globals)
globalThis.document = { createElement: (tag) => {
  if (tag === 'canvas') return createCanvas(1, 1);
}};
globalThis.window = globalThis;

const pages = Array.from({ length: 11 }, (_, i) => i + 1);
const imagePaths = pages.map(n =>
  `static/targets/source-images/target-${String(n - 1).padStart(2, '0')}.png`
);

async function run() {
  console.log('Loading images...');
  const images = [];
  for (const p of imagePaths) {
    console.log(`  Loading ${p}`);
    const img = await loadImage(await readFile(p));
    images.push(img);
  }

  console.log(`\nCompiling ${images.length} targets...`);
  const compiler = new OfflineCompiler();
  await compiler.compileImageTargets(images, (progress) => {
    console.log(`  Progress: ${Math.round(progress)}%`);
  });

  console.log('\nExporting .mind file...');
  const buffer = compiler.exportData();
  const outputPath = 'static/targets/storybook.mind';
  await writeFile(outputPath, Buffer.from(buffer));
  console.log(`Done! Saved to ${outputPath} (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
}

run().catch(err => {
  console.error('Compilation failed:', err);
  process.exit(1);
});
