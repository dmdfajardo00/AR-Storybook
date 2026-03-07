import { chromium } from 'playwright';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';

const OUTPUT = resolve('static/targets/storybook.mind');

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: false,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl'],
  });
  const page = await browser.newPage();

  // Listen to browser console
  page.on('console', msg => {
    if (msg.type() === 'log') console.log('  [browser]', msg.text());
  });

  // Navigate to dev server (serves the images + MindAR via importmap)
  console.log('Loading dev server...');
  await page.goto('http://localhost:6175/');
  await page.waitForTimeout(2000);

  // Inject a module script that imports MindAR and compiles
  console.log('Starting MindAR compilation (this may take several minutes)...');

  await page.evaluate(() => {
    return new Promise((resolveOuter) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = `
        import 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image.prod.js';
        window.__mindarReady = true;
      `;
      script.onload = () => setTimeout(resolveOuter, 1000);
      document.head.appendChild(script);
      // Fallback resolve after timeout
      setTimeout(resolveOuter, 5000);
    });
  });

  // Wait for MINDAR to be available
  await page.waitForFunction(() => window.MINDAR?.IMAGE?.Compiler, { timeout: 15000 });
  console.log('MindAR compiler loaded.');

  const result = await page.evaluate(async () => {
    function loadImage(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load: ' + url));
        img.src = url;
      });
    }

    // Load all 11 page images
    const images = [];
    for (let i = 0; i < 11; i++) {
      const url = `/targets/source-images/target-${String(i).padStart(2, '0')}.png`;
      console.log('Loading ' + url);
      const img = await loadImage(url);
      images.push(img);
    }
    console.log('All ' + images.length + ' images loaded. Compiling targets...');

    // Compile
    const compiler = new window.MINDAR.IMAGE.Compiler();
    await compiler.compileImageTargets(images, (progress) => {
      console.log('Progress: ' + Math.round(progress * 100) + '%');
    });

    // Export
    console.log('Exporting .mind file...');
    const buffer = await compiler.exportData();
    const bytes = new Uint8Array(buffer);

    // Convert to base64 in chunks to avoid call stack issues
    const CHUNK = 32768;
    let b64 = '';
    for (let i = 0; i < bytes.length; i += CHUNK) {
      b64 += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return { base64: btoa(b64), size: bytes.length };
  });

  console.log(`\nCompilation complete! File size: ${(result.size / 1024).toFixed(0)} KB`);

  // Write the .mind file
  const buffer = Buffer.from(result.base64, 'base64');
  await writeFile(OUTPUT, buffer);
  console.log(`Saved to ${OUTPUT}`);

  await browser.close();
}

run().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
