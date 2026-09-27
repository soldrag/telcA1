// Vite + headless Chrome + a raw DevTools Protocol session, without a browser-automation dependency.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const DEFAULT_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(url) {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await sleep(200);
  }
  throw new Error(`Not reachable: ${url}`);
}

function openSession(wsUrl) {
  const ws = new WebSocket(wsUrl);
  const pending = new Map();
  let nextId = 1;
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const waiter = pending.get(data.id);
    if (!waiter) return;
    pending.delete(data.id);
    if (data.error) waiter.reject(new Error(data.error.message));
    else waiter.resolve(data.result);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  return new Promise((resolve) => { ws.onopen = () => resolve({ ws, send }); });
}

export async function launch({ port, cdpPort }) {
  const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort'], { stdio: 'ignore' });
  const profile = mkdtempSync(join(tmpdir(), 'chrome-e2e-'));
  const chrome = spawn(process.env.CHROME_PATH || DEFAULT_CHROME, [
    '--headless=new', `--remote-debugging-port=${cdpPort}`, `--user-data-dir=${profile}`,
    '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--no-sandbox',
  ], { stdio: 'ignore' });
  const close = (ws) => {
    ws?.close();
    chrome.kill();
    vite.kill();
    try { rmSync(profile, { recursive: true, force: true }); } catch {}
  };
  await waitFor(`http://localhost:${port}`);
  await waitFor(`http://127.0.0.1:${cdpPort}/json/version`);
  const targets = await (await fetch(`http://127.0.0.1:${cdpPort}/json`)).json();
  const session = await openSession(targets.find((target) => target.type === 'page').webSocketDebuggerUrl);
  await session.send('Page.enable');
  await session.send('Runtime.enable');
  const evaluate = async (expression) => {
    const res = await session.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description || 'evaluate failed');
    return res.result?.value;
  };
  return { ...session, evaluate, close: () => close(session.ws) };
}
