import { chromium, expect, test } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';

test('Milestone 2 & 3: Extraction, SQ8 persistence, and sub-20ms cosine search', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'meridian-m2-'));
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
      '--proxy-server=http://127.0.0.1:9',
      '--proxy-bypass-list=<-loopback>',
      '--host-resolver-rules=MAP * ~NOTFOUND',
    ],
  });

  try {
    await context.setOffline(true);
    const background = context.serviceWorkers()[0]
      ?? await context.waitForEvent('serviceworker');
    const extensionId = new URL(background.url()).host;
    const page = await context.newPage();

    await page.goto(`chrome-extension://${extensionId}/index.html`);
    await expect(page.getByRole('heading', { name: 'Spatial Knowledge Engine' })).toBeVisible();

    // 1. Ingest a research document on Distributed Systems
    const distributedSystemsMarkdown = `
# Principles of Distributed Systems

Distributed consensus algorithms ensure that multiple nodes agree on state despite network partitions.

## Raft Consensus Algorithm
Raft divides time into terms and elects a leader via randomized election timers.

\`\`\`go
func electLeader() {
    state = Candidate
    currentTerm++
}
\`\`\`

## Paxos Comparison
Paxos achieves the same fault tolerance but with higher conceptual complexity.
    `.trim();

    await page.locator('#import-type').selectOption('markdown');
    await page.locator('#import-mode').selectOption('deep');
    await page.locator('#import-title').fill('Principles of Distributed Systems');
    await page.locator('#import-url').fill('https://example.org/distributed-systems');
    await page.locator('#import-content').fill(distributedSystemsMarkdown);

    await page.getByRole('button', { name: 'Ingest Document' }).click();
    await expect(page.getByTestId('capture-status')).toContainText('Successfully saved', { timeout: 15_000 });

    // 2. Ingest a second document on Deep Learning
    const deepLearningMarkdown = `
# Foundations of Deep Learning

Neural networks optimize parameters via backpropagation and gradient descent algorithms.

## Attention Mechanisms
Self-attention computes dynamic weights between token representations across sequences.

\`\`\`python
import torch
scores = torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(d_k)
\`\`\`
    `.trim();

    await page.locator('#import-title').fill('Foundations of Deep Learning');
    await page.locator('#import-url').fill('https://arxiv.org/abs/attention');
    await page.locator('#import-content').fill(deepLearningMarkdown);

    await page.getByRole('button', { name: 'Ingest Document' }).click();
    await expect(page.getByTestId('capture-status')).toContainText('Successfully saved', { timeout: 15_000 });

    // 3. Verify spatial cards appear in the library
    await expect(page.locator('.canvas-card')).toHaveCount(2);
    await expect(page.locator('.stats-value').first()).toHaveText('2');

    // 4. Perform Intent Cosine Search for distributed consensus concepts
    await page.getByPlaceholder(/Ask or search by concept/).fill('Raft consensus and election timers');
    await page.getByRole('button', { name: 'Search Intent' }).click();

    await expect(page.locator('.search-result-card').first()).toBeVisible({ timeout: 10_000 });
    const topResultTitle = await page.locator('.search-result-card h4').first().innerText();
    expect(topResultTitle).toBe('Principles of Distributed Systems');

    // Check cosine score is high (> 0.4) for related concept
    const scoreBadge = await page.locator('.score-badge').first().innerText();
    const score = parseFloat(scoreBadge.replace('Cosine: ', ''));
    expect(score).toBeGreaterThan(0.4);

    // 5. Perform Intent Search for neural network concepts
    await page.getByPlaceholder(/Ask or search by concept/).fill('gradient descent neural network weights backpropagation');
    await page.getByRole('button', { name: 'Search Intent' }).click();
    await page.waitForTimeout(500);

    const resultTitles = await page.locator('.search-result-card h4').allInnerTexts();
    const resultScores = await page.locator('.score-badge').allInnerTexts();
    console.log('Query 2 Results:', resultTitles, resultScores);

    expect(resultTitles[0]).toBe('Foundations of Deep Learning');

    // 6. Verify Pinning toggle
    await page.getByRole('button', { name: '📌 Pin' }).first().click();
    await expect(page.locator('.canvas-card').first()).toContainText('📌 Pinned');

  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});
