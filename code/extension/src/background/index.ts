import type { ExtensionMessage } from '../shared/contracts';

// Open or focus Meridian tab on extension toolbar action click
chrome.action.onClicked.addListener(async () => {
  const extensionUrl = chrome.runtime.getURL('index.html');
  const tabs = await chrome.tabs.query({ url: extensionUrl });
  if (tabs.length > 0 && tabs[0].id) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    if (tabs[0].windowId) await chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: extensionUrl });
  }
});

// Register Context Menu for quick 1-click capture from any webpage
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'meridian-capture-page',
    title: '🧭 Capture Page to Meridian',
    contexts: ['page', 'selection', 'link'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'meridian-capture-page' && tab && tab.id) {
    const extensionUrl = chrome.runtime.getURL('index.html');
    await chrome.tabs.create({ url: extensionUrl });
  }
});

// Robust message listener for tab capture orchestration and cross-origin fetch
chrome.runtime.onMessage.addListener((message: any, _sender, sendResponse) => {
  if (message.type === 'fetch-url' && typeof message.url === 'string') {
    const fetchTarget = async () => {
      // If it's a Wikipedia page, prefer the REST API endpoint for cleaner HTML
      const wikiMatch = message.url.match(/https?:\/\/([a-z0-9_-]+)\.wikipedia\.org\/wiki\/([^#?]+)/i);
      let targetUrl = message.url;
      if (wikiMatch) {
        const lang = wikiMatch[1];
        const pageTitle = wikiMatch[2];
        targetUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(decodeURIComponent(pageTitle))}`;
      }

      const res = await fetch(targetUrl, {
        headers: {
          'Api-User-Agent': 'MeridianCartographer/1.0 (local academic research; mailto:meridian@local.internal)'
        }
      });
      if (!res.ok) {
        if (targetUrl !== message.url) {
          const fallbackRes = await fetch(message.url);
          if (!fallbackRes.ok) throw new Error(`HTTP ${fallbackRes.status}: ${fallbackRes.statusText}`);
          return await fallbackRes.text();
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.text();
    };

    fetchTarget()
      .then((html) => sendResponse({ success: true, html }))
      .catch((err) => sendResponse({ success: false, error: err instanceof Error ? err.message : String(err) }));
    return true; // Keep async response channel open
  }

  if (message.type === 'capture-active-tab') {
    handleActiveTabCapture()
      .then((res) => {
        sendResponse({ type: 'capture-active-tab-result', success: true, ...res });
      })
      .catch((err) => {
        sendResponse({
          type: 'capture-active-tab-result',
          success: false,
          error: err instanceof Error ? err.message : String(err),
        });
      });
    return true; // Keep asynchronous response channel open
  }
});

async function handleActiveTabCapture(): Promise<{
  html: string;
  url: string;
  title: string;
  snapshotUrl?: string;
}> {
  const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
  let candidateTab: chrome.tabs.Tab | undefined = activeTabs[0];

  const isRestrictedUrl = (url?: string) => {
    if (!url) return false;
    return (
      url.startsWith('chrome://') ||
      url.startsWith('chrome-extension://') ||
      url.startsWith('edge://') ||
      url.startsWith('devtools://') ||
      url.startsWith('about:') ||
      url.startsWith('view-source:')
    );
  };

  // If currently on Meridian tab or restricted page, search other open web tabs
  if (!candidateTab || isRestrictedUrl(candidateTab.url)) {
    const currentTabId = candidateTab?.id;
    const currentWindowTabs = await chrome.tabs.query({ currentWindow: true });
    candidateTab = currentWindowTabs.find((t) => {
      if (currentTabId && t.id === currentTabId) return false;
      const u = t.url || t.pendingUrl;
      if (u && (isRestrictedUrl(u) || u.startsWith('chrome-extension://'))) return false;
      return true;
    });

    if (!candidateTab) {
      const allTabs = await chrome.tabs.query({});
      candidateTab = allTabs.find((t) => {
        if (currentTabId && t.id === currentTabId) return false;
        const u = t.url || t.pendingUrl;
        if (u && (isRestrictedUrl(u) || u.startsWith('chrome-extension://'))) return false;
        return true;
      });
    }
  }

  if (!candidateTab || !candidateTab.id) {
    throw new Error(
      'No accessible web page found to capture. Please open an article or webpage in another tab, or paste the URL directly into the field.'
    );
  }

  return executeCaptureOnTab(candidateTab);
}

async function executeCaptureOnTab(tab: chrome.tabs.Tab): Promise<{
  html: string;
  url: string;
  title: string;
  snapshotUrl?: string;
}> {
  const tabId = tab.id!;
  const tabUrl = tab.url || '';
  const tabTitle = tab.title || 'Untitled Web Page';

  let snapshotUrl: string | undefined;
  try {
    if (tab.windowId) {
      snapshotUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
    }
  } catch {
    // Non-fatal
  }

  try {
    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        return {
          html: document.documentElement.outerHTML,
          url: window.location.href,
          title: document.title,
        };
      },
    });

    const pageData = injectionResults[0]?.result;
    if (!pageData || !pageData.html) {
      throw new Error('Unable to extract DOM tree from target page.');
    }

    return {
      html: pageData.html,
      url: pageData.url || tabUrl,
      title: pageData.title || tabTitle,
      snapshotUrl,
    };
  } catch (err) {
    // If scripting is blocked, but tab has a valid http/https url, fetch it via service worker
    if (tabUrl && /^https?:\/\//i.test(tabUrl)) {
      const wikiMatch = tabUrl.match(/https?:\/\/([a-z0-9_-]+)\.wikipedia\.org\/wiki\/([^#?]+)/i);
      let fetchUrl = tabUrl;
      if (wikiMatch) {
        fetchUrl = `https://${wikiMatch[1]}.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(decodeURIComponent(wikiMatch[2]))}`;
      }
      const res = await fetch(fetchUrl, {
        headers: { 'Api-User-Agent': 'MeridianCartographer/1.0 (local academic research)' }
      });
      const html = await res.text();
      return {
        html,
        url: tabUrl,
        title: tabTitle,
        snapshotUrl,
      };
    }
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`DOM extraction failed: ${msg}`);
  }
}
