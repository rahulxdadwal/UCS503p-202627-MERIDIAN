import { chromium, expect, test } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';

test('URL Ingestion: Wikipedia URL capture extracts content and creates spatial card', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'meridian-url-'));
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
    ],
  });

  try {
    const background = context.serviceWorkers()[0]
      ?? await context.waitForEvent('serviceworker');
    const extensionId = new URL(background.url()).host;
    const page = await context.newPage();

    // Mock Wikipedia REST API route so test runs deterministically offline
    await page.route('**/api/rest_v1/page/html/**', async (route) => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head><title>Deputy Chief of the Army Staff (India) - Wikipedia</title></head>
        <body>
          <section data-mw-section-id="0">
            <h1>Deputy Chief of the Army Staff (India)</h1>
            <p>The <b>Deputy Chief of the Army Staff</b> (DCOAS) is a senior appointment in the Indian Army.</p>
          </section>
          <section data-mw-section-id="1">
            <h2>History and Role</h2>
            <p>The appointment was established to assist the Vice Chief of the Army Staff and Chief of the Army Staff in operational logistics and strategy.</p>
          </section>
        </body>
        </html>
      `;
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        headers: {
          'access-control-allow-origin': '*',
        },
        body: mockHtml,
      });
    });

    await page.goto(`chrome-extension://${extensionId}/index.html`);
    await expect(page.getByRole('heading', { name: 'Spatial Knowledge Engine' })).toBeVisible();

    // Paste Wikipedia URL into Ingestion Station input
    const targetUrl = 'https://en.wikipedia.org/wiki/Deputy_Chief_of_the_Army_Staff_(India)';
    const urlInput = page.getByPlaceholder('Paste webpage URL (e.g. https://en.wikipedia.org/...) or leave blank to capture active tab');
    await urlInput.fill(targetUrl);

    // Click "Capture from URL"
    const captureBtn = page.getByRole('button', { name: '🌐 Capture from URL' });
    await expect(captureBtn).toBeVisible();
    await captureBtn.click();

    // Verify status message confirms successful indexing
    const statusMsg = page.getByTestId('capture-status');
    await expect(statusMsg).toContainText('Successfully captured and indexed "Deputy Chief of the Army Staff (India)"', { timeout: 15_000 });

    // Verify card is added to Spatial Cards Library
    await expect(page.locator('.canvas-card').first()).toBeVisible();
    await expect(page.locator('.canvas-card h4').first()).toContainText('Deputy Chief of the Army Staff');

  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});

test('Tab Ingestion: Directly captures open browser tab DOM when URL field is blank', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'meridian-tab-'));
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
    ],
  });

  try {
    const background = context.serviceWorkers()[0]
      ?? await context.waitForEvent('serviceworker');
    const extensionId = new URL(background.url()).host;

    // Open simulated research webpage tab
    const articlePage = await context.newPage();
    await articlePage.route('https://en.wikipedia.org/wiki/Deputy_Chief_of_the_Army_Staff_(India)', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <!DOCTYPE html>
          <html>
            <head><title>Deputy Chief of the Army Staff (India) - Wikipedia</title></head>
            <body>
              <main id="content">
                <h1>Deputy Chief of the Army Staff (India)</h1>
                <p>The Deputy Chief of the Army Staff (DCOAS) coordinates military intelligence and operations.</p>
              </main>
            </body>
          </html>
        `,
      });
    });
    await articlePage.goto('https://en.wikipedia.org/wiki/Deputy_Chief_of_the_Army_Staff_(India)');

    // Open Meridian in second tab
    const meridianPage = await context.newPage();
    await meridianPage.goto(`chrome-extension://${extensionId}/index.html`);
    await expect(meridianPage.getByRole('heading', { name: 'Spatial Knowledge Engine' })).toBeVisible();

    // Click "Capture Active Browser Tab"
    const captureTabBtn = meridianPage.getByRole('button', { name: '🌐 Capture Active Browser Tab' });
    await expect(captureTabBtn).toBeVisible();
    await captureTabBtn.click();

    // Verify success
    const statusMsg = meridianPage.getByTestId('capture-status');
    await expect(statusMsg).toContainText('Successfully captured and indexed', { timeout: 15_000 });

  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});

