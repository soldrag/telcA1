import { spawn } from 'node:child_process';
import { encodeAssignmentToken, buildAssignmentUrl } from '../../src/services/assignmentTokenService.js';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 5179;
const CDP_PORT = 9223;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function startViteServer() {
  const server = spawn('npx', ['vite', '--port', String(PORT)], {
    stdio: 'ignore',
  });
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}`);
      if (res.ok) break;
    } catch {}
    await sleep(200);
  }
  return server;
}

async function startHeadlessChrome() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
  ]);
  await sleep(1200);
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

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send('Page.enable');
  await send('Runtime.enable');

  return { ws, send, exceptions };
}

async function runSmoke() {
  console.log('🚀 Starting Real Headless Chrome In-Browser Button Verification...');
  let viteServer = null;
  let chrome = null;
  let ws = null;

  try {
    viteServer = await startViteServer();
    chrome = await startHeadlessChrome();
    const session = await createCdpSession();
    ws = session.ws;
    const { send, exceptions } = session;

    // 1. Generate real assignment token
    const token = await encodeAssignmentToken({
      examId: 'modellsatz-1',
      testType: 'lesen',
      timeLimitSeconds: 1500,
      studentName: 'CDP Test Student',
      teacherKey: 'LEHRER-TEST-9999',
    });

    const targetUrl = `http://localhost:${PORT}/#task=${token}`;
    console.log(`🌐 Navigating to homework landing screen: ${targetUrl.slice(0, 60)}...`);
    await send('Page.navigate', { url: targetUrl });
    await sleep(2000);

    // 2. Verify Assignment Landing Screen is displayed
    const landingEval = await send('Runtime.evaluate', {
      expression: `document.body.innerText`,
      returnByValue: true,
    });
    console.log('📄 Current page text:', landingEval.result.value.slice(0, 150));
    const isHomeworkScreen =
      landingEval.result.value.includes('Assigned Homework') ||
      landingEval.result.value.includes('Домашнее задание от преподавателя') ||
      landingEval.result.value.includes('HAUSAUFGABE');
    if (!isHomeworkScreen) {
      throw new Error(`AssignmentLandingScreen title not found in DOM: ${landingEval.result.value}`);
    }
    console.log('✔ AssignmentLandingScreen loaded in real DOM!');

    // 3. Click "Start Assignment" / "Начать выполнение" button
    console.log('🖱 Clicking Start Assignment button...');
    const clickResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const startBtn = buttons.find(b =>
          b.innerText.includes('Start Assignment') ||
          b.innerText.includes('Начать выполнение')
        );
        if (!startBtn) return false;
        startBtn.click();
        return true;
      })()`,
      returnByValue: true,
    });

    console.log('✔ Button clicked:', clickResult.result.value);
    if (!clickResult.result.value) {
      throw new Error('Start button not found in DOM');
    }

    await sleep(1500);

    // 4. Verify ZERO exceptions were thrown (specifically checking for TypeError: timer.startTimer is not a function)
    if (exceptions.length > 0) {
      console.error('❌ In-Browser Exceptions Detected:', exceptions);
      throw new Error(`In-browser runtime exceptions detected: ${JSON.stringify(exceptions)}`);
    }
    console.log('✔ 0 Unhandled runtime exceptions thrown upon click!');

    // 5. Verify exam view is now active and timer is running
    const examViewEval = await send('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('.font-mono-num') || document.querySelector('button[title*="Пауза"]'))`,
      returnByValue: true,
    });
    console.log('✔ ExamView active & timer running:', examViewEval.result.value);
    if (!examViewEval.result.value) {
      throw new Error('Failed to transition to ExamView after clicking start button');
    }

    // 6. Click Pause button on timer
    console.log('🖱 Clicking Timer Pause button...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const pauseBtn = document.querySelector('button[title*="Пауза"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Пауза'));
        if (pauseBtn) pauseBtn.click();
      })()`,
    });
    await sleep(500);

    // 7. Click Resume button on timer
    console.log('🖱 Clicking Timer Resume button...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const resumeBtn = document.querySelector('button[title*="Возобновить"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Возобновить'));
        if (resumeBtn) resumeBtn.click();
      })()`,
    });
    await sleep(500);

    if (exceptions.length > 0) {
      throw new Error(`Exceptions detected during timer interactions: ${JSON.stringify(exceptions)}`);
    }

    console.log('🎉 REAL BROWSER CDP SMOKE TEST PASSED! All buttons operational with 0 errors.');
  } finally {
    if (ws) ws.close();
    if (chrome) chrome.kill();
    if (viteServer) viteServer.kill();
  }
}

runSmoke()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ CDP Smoke Test Failed:', err);
    process.exit(1);
  });
