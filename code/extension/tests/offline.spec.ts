import { chromium, expect, test } from '@playwright/test';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';

test('fresh MV3 extension generates real 384D WASM embeddings with external networking disabled', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'meridian-offline-'));
  const extensionPath = resolve('dist');
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--disable-background-networking',
      '--disable-component-update',
      '--no-first-run',
      // Blackhole browser-process network access too, including service workers.
      '--proxy-server=http://127.0.0.1:9',
      '--proxy-bypass-list=<-loopback>',
      '--host-resolver-rules=MAP * ~NOTFOUND',
    ],
  });
  try {
    await context.setOffline(true);
    const requests: string[] = [];
    context.on('request', (request) => requests.push(request.url()));
    const background = context.serviceWorkers()[0]
      ?? await context.waitForEvent('serviceworker');
    const extensionId = new URL(background.url()).host;
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`chrome-extension://${extensionId}/index.html`);
    await expect(page.getByRole('heading', { name: 'Embedding diagnostic' })).toBeVisible();
    const vectors: number[][] = [];
    const elapsed: number[] = [];
    for (const text of [
      'A cat is sleeping on a warm windowsill.',
      'A kitten is resting beside the sunny window.',
      'Database transactions provide atomicity and isolation.',
    ]) {
      await page.getByLabel('Text to embed').fill(text);
      await page.getByRole('button', { name: 'Generate embedding', exact: true }).click();
      await expect(page.getByTestId('dimensions')).toHaveText('384');
      const vector: number[] = JSON.parse(await page.getByTestId('vector').textContent() ?? '[]');
      expect(vector).toHaveLength(384);
      expect(vector.every(Number.isFinite)).toBe(true);
      expect(Math.hypot(...vector)).toBeCloseTo(1, 4);
      expect(new Set(vector).size).toBeGreaterThan(300);
      vectors.push(vector);
      elapsed.push(Number((await page.locator('dd').nth(2).innerText()).replace(' ms', '')));
    }
    const cosine = (a: number[], b: number[]) => a.reduce((sum, value, i) => sum + value * b[i], 0);
    const related = cosine(vectors[0], vectors[1]);
    const unrelated = cosine(vectors[0], vectors[2]);
    expect(related).toBeGreaterThan(unrelated + 0.15);
    expect(vectors[0]).not.toEqual(vectors[2]);
    expect(errors).toEqual([]);
    expect(requests.filter((url) => /^https?:|^wss?:/.test(url))).toEqual([]);
    expect(requests.some((url) => url.endsWith('/onnx/model_quantized.onnx'))).toBe(true);
    expect(requests.some((url) => url.endsWith('/wasm/ort-wasm-simd-threaded.jsep.wasm'))).toBe(true);
    const embeddingRequests = [...requests];

    // Negative control: the same browser cannot access an external origin.
    const probe = await context.newPage();
    let networkBlocked = false;
    try { await probe.goto('https://example.com', { timeout: 10_000 }); }
    catch { networkBlocked = true; }
    expect(networkBlocked).toBe(true);

    await page.screenshot({ path: 'test-results/foundation.png', fullPage: true });
    const report = {
      passed: true, browser: context.browser()?.version(),
      model: 'Xenova/all-MiniLM-L6-v2', backend: 'wasm', dimensions: 384,
      freshProfile: true, offline: true, proxyBlackhole: true,
      externalProbeBlocked: networkBlocked,
      relatedCosine: related, unrelatedCosine: unrelated, elapsedMs: elapsed,
      embeddingRequests,
    };
    await mkdir('test-results', { recursive: true });
    await writeFile('test-results/offline-verification.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});
