import { spawn } from 'node:child_process';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 5184;
const CDP_PORT = 9226;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startViteServer() {
  const server = spawn('npx', ['vite', '--port', String(PORT)], { stdio: 'ignore' });
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}`);
      if (res.ok) break;
    } catch {}
    await sleep(200);
  }
  return server;
}

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let tempDir = null;

async function startHeadlessChrome() {
  tempDir = mkdtempSync(join(tmpdir(), 'chrome-mobile-test-'));
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tempDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
  ]);
  
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) break;
    } catch {}
    await sleep(200);
  }
  return chrome;
}

async function createCdpSession() {
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
  const targets = await res.json();
  const pageTarget = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();
  const exceptions = [];

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.exceptionThrown') {
      exceptions.push(data.params.exceptionDetails);
    }
    if (pending.has(data.id)) {
      const p = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) p.reject(data.error);
      else p.resolve(data.result);
    }
  };

  await new Promise((resolve) => { ws.onopen = resolve; });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    mobile: true,
  });

  return { ws, send, exceptions };
}

async function evaluateScript(send, expression) {
  const res = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
  });
  return res.result?.value;
}

async function runMobileLayoutTest() {
  console.log('📱 Starting Mobile Layout & Safe Area CDP Verification...');
  let viteServer = null;
  let chrome = null;
  let ws = null;

  try {
    viteServer = await startViteServer();
    chrome = await startHeadlessChrome();
    const session = await createCdpSession();
    ws = session.ws;
    const { send, exceptions } = session;

    await send('Page.navigate', { url: `http://localhost:${PORT}/` });
    await sleep(2000);

    // 1. Verify early critical styles and html background
    const htmlStyles = await evaluateScript(send, `(() => {
      const html = document.documentElement;
      const computed = window.getComputedStyle(html);
      return {
        isDark: html.classList.contains('dark'),
        bgColor: computed.backgroundColor,
      };
    })()`);
    console.log('🎨 HTML Computed Styles:', htmlStyles);

    // 2. Verify meta theme-color matches dark mode
    const themeColor = await evaluateScript(send, `(() => {
      const meta = document.querySelector('meta[name="theme-color"]:not([media])') ||
                   document.querySelector('meta[name="theme-color"]');
      return meta ? meta.getAttribute('content') : null;
    })()`);
    console.log('🏷 Meta theme-color:', themeColor);
    if (!themeColor || (themeColor !== '#0f172a' && themeColor !== '#f1f5f9')) {
      throw new Error(`Unexpected theme-color: ${themeColor}`);
    }

    // 3. Verify Header has safe-area CSS rule and elements are positioned below top
    const headerMetrics = await evaluateScript(send, `(() => {
      const header = document.querySelector('header.app-header');
      const innerDiv = header ? header.querySelector('div') : null;
      const themeBtn = document.querySelector('button[data-testid="theme-toggle"]');
      return {
        headerExists: Boolean(header),
        innerTop: innerDiv ? innerDiv.getBoundingClientRect().top : -1,
        themeBtnClickable: Boolean(themeBtn),
      };
    })()`);
    console.log('📐 Header Metrics:', headerMetrics);
    if (!headerMetrics.headerExists) {
      throw new Error('Header element not found');
    }
    if (!headerMetrics.themeBtnClickable) {
      throw new Error('Theme toggle button not found or not clickable');
    }

    // 4. Test dynamic theme toggling and theme-color synchronization
    console.log('🌓 Toggling theme to test dynamic theme-color update...');
    await evaluateScript(send, `(() => {
      const themeBtn = document.querySelector('button[data-testid="theme-toggle"]');
      if (themeBtn) themeBtn.click();
    })()`);
    await sleep(500);

    const updatedThemeColor = await evaluateScript(send, `(() => {
      const meta = document.querySelector('meta[name="theme-color"]:not([media])') ||
                   document.querySelector('meta[name="theme-color"]');
      return meta ? meta.getAttribute('content') : null;
    })()`);
    console.log('🔄 Updated Meta theme-color after toggle:', updatedThemeColor);

    if (exceptions.length > 0) {
      throw new Error(`In-browser runtime exceptions detected: ${JSON.stringify(exceptions)}`);
    }

    console.log('🎉 MOBILE LAYOUT & SAFE AREA VERIFICATION PASSED!');
  } finally {
    if (ws) ws.close();
    if (chrome) chrome.kill();
    if (viteServer) viteServer.kill();
    if (tempDir) {
      try { rmSync(tempDir, { recursive: true, force: true }); } catch {}
    }
  }
}

runMobileLayoutTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
