import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const lockPath = join(root, 'assets.lock.json');
const lock = JSON.parse(await readFile(lockPath, 'utf8'));
const verify = process.argv.includes('--verify');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

for (const [name, expected] of Object.entries(lock.files)) {
  const destination = join(root, 'public/models', lock.model, name);
  let bytes;
  try { bytes = await readFile(destination); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (bytes && expected && hash(bytes) === expected) continue;
  if (verify) throw new Error(`Missing or invalid ${name}. Run npm run assets:prepare first.`);
  if (!expected) throw new Error('Model integrity lock is incomplete.');
  console.log(`Downloading ${name} at ${lock.revision}…`);
  const response = await fetch(`https://huggingface.co/${lock.model}/resolve/${lock.revision}/${name}`, {
    signal: AbortSignal.timeout(180_000),
  });
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${name}`);
  bytes = Buffer.from(await response.arrayBuffer());
  if (expected && hash(bytes) !== expected) throw new Error(`Checksum mismatch: ${name}`);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(`${destination}.partial`, bytes);
  await rename(`${destination}.partial`, destination);
}

// Copy matching glue and binary from the exact ONNX Runtime version in package-lock.json.
// Transformers.js v3's browser bundle uses the JSEP runtime even with device: wasm.
for (const name of ['ort-wasm-simd-threaded.jsep.mjs', 'ort-wasm-simd-threaded.jsep.wasm']) {
  const source = join(root, 'node_modules/onnxruntime-web/dist', name);
  const destination = join(root, 'public/wasm', name);
  if (verify) {
    const [a, b] = await Promise.all([readFile(source), readFile(destination)]);
    if (hash(a) !== hash(b)) throw new Error(`Runtime mismatch: ${name}. Run npm run assets:prepare.`);
  } else {
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }
}
// Preserve attribution with redistributed artifacts.
const licenseSource = join(root, 'node_modules/@huggingface/transformers/LICENSE');
if (!verify) {
  await copyFile(licenseSource, join(root, 'public/models', lock.model, 'LICENSE'));
  await copyFile(join(root, 'licenses/onnxruntime-MIT.txt'), join(root, 'public/wasm/LICENSE'));
}
console.log(verify ? 'Packaged model checksums and WASM runtime verified.' : 'Local model and WASM assets prepared.');
