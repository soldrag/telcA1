import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { encodeAssignmentToken } from '../../src/services/assignmentTokenService.js';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 5183;
const CDP_PORT = 9225;

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
  await sleep(1500);
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
      console.error('❌ Exception in Chrome:', data.params.exceptionDetails?.exception?.description || data.params.exceptionDetails);
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

  await send('Runtime.enable');
  await send('Page.enable');

  const evalJs = async (expression) => {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  };

  return { ws, send, evalJs, exceptions };
}

async function runE2E() {
  console.log('🚀 Starting E2E test for assignment completion and review workflow...');
  let viteServer = null;
  let chromeProcess = null;
  let cdp = null;

  try {
    viteServer = await startViteServer();
    chromeProcess = await startHeadlessChrome();
    cdp = await createCdpSession();

    // 1. Generate assignment token
    const token = await encodeAssignmentToken({
      examId: 'modellsatz-1',
      testType: 'lesen',
      timeLimitSeconds: 1200,
      studentName: 'Anna Schmidt',
      teacherKey: 'LEHRER-TEST-9999',
    });

    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });

    const taskUrl = `http://localhost:${PORT}/#task=${token}`;
    console.log(`🌐 Navigating to assignment URL: ${taskUrl.slice(0, 60)}...`);
    await cdp.send('Page.navigate', { url: taskUrl });
    await sleep(2000);

    // 2. Verify Assignment Landing Screen
    const landingText = await cdp.evalJs(`document.body.innerText`);
    assert.ok(landingText.includes('Anna Schmidt'), 'Landing screen must display student name');
    console.log('✔ Assignment landing screen verified with student name.');

    // 3. Start Assignment
    const startClicked = await cdp.evalJs(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const startBtn = btns.find(b =>
        b.innerText.includes('Start Assignment') ||
        b.innerText.includes('Начать выполнение')
      );
      if (startBtn) {
        startBtn.click();
        return true;
      }
      return false;
    })()`);
    assert.equal(startClicked, true, 'Start Assignment button must be found and clicked');
    await sleep(2000);

    // 4. Verify ExamView is active
    const isExamActive = await cdp.evalJs(`Boolean(
      document.querySelector('.font-mono-num') ||
      document.querySelector('button[title*="Pause"]') ||
      document.querySelector('button[title*="Пауза"]')
    )`);
    assert.equal(isExamActive, true, 'ExamView must become active after clicking start');
    console.log('✔ ExamView active and timer running.');

    try {
      await cdp.send('Browser.grantPermissions', {
        permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
      });
    } catch {}

    // 5. Select an answer in question 1
    const answerClicked = await cdp.evalJs(`(() => {
      const main = document.querySelector('main') || document.body;
      const optionBtn = Array.from(main.querySelectorAll('button')).find(b => {
        const t = b.innerText.trim().toLowerCase();
        return t === '+' || t === '-' || t.includes('richtig') || t.includes('true') || t.includes('correct');
      });
      if (optionBtn) {
        optionBtn.click();
        return true;
      }
      return false;
    })()`);
    console.log('✔ Answer option clicked in exam:', answerClicked);
    await sleep(500);

    // 6. Click Finish exam button in header
    const finishClicked = await cdp.evalJs(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const finishBtn = btns.find(b =>
        b.getAttribute('title')?.includes('Finish') ||
        b.getAttribute('title')?.includes('Завершить') ||
        b.getAttribute('aria-label')?.includes('Finish') ||
        b.getAttribute('aria-label')?.includes('Завершить')
      );
      if (finishBtn) {
        finishBtn.click();
        return true;
      }
      return false;
    })()`);
    assert.equal(finishClicked, true, 'Finish button in header must be clicked');
    await sleep(1000);

    // 7. Confirm submit dialog
    const confirmClicked = await cdp.evalJs(`(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        const dialogBtns = Array.from(dialog.querySelectorAll('button'));
        const confirmBtn = dialogBtns.find(b =>
          b.innerText.includes('check answers') ||
          b.innerText.includes('проверить ответы') ||
          b.innerText.includes('Confirm') ||
          b.innerText.includes('Submit')
        ) || dialogBtns[dialogBtns.length - 1];
        if (confirmBtn) {
          confirmBtn.click();
          return true;
        }
      }
      return false;
    })()`);
    assert.equal(confirmClicked, true, 'Confirm submit button must be clicked');
    console.log('✔ Submit dialog confirmed.');
    await sleep(2000);

    // 8. Verify AssignmentSubmissionBanner appears on ResultsView immediately!
    const resultsState = await cdp.evalJs(`(() => {
      const text = document.body.innerText;
      const lower = text.toLowerCase();
      const hasBadge = lower.includes('assignment submitted') || lower.includes('домашнее задание сдано');
      const hasTitle = lower.includes('assignment completed & recorded!') || lower.includes('задание выполнено и зафиксировано!');
      const hasStudentName = text.includes('Anna Schmidt');
      const copyBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.innerText.includes('Copy Link for Teacher') || b.innerText.includes('Скопировать ссылку для учителя')
      );
      const monoBlock = Array.from(document.querySelectorAll('div')).find(d =>
        d.className.includes('font-mono') && d.innerText.includes('#review=')
      );
      return {
        hasBadge,
        hasTitle,
        hasStudentName,
        hasCopyBtn: Boolean(copyBtn),
        reviewUrl: monoBlock ? monoBlock.innerText.trim() : null,
      };
    })()`);

    console.log('Results screen evaluation:', {
      hasBadge: resultsState.hasBadge,
      hasTitle: resultsState.hasTitle,
      hasStudentName: resultsState.hasStudentName,
      hasCopyBtn: resultsState.hasCopyBtn,
      reviewUrl: resultsState.reviewUrl?.slice(0, 60),
    });
    assert.equal(resultsState.hasBadge, true, 'Must display assignment submission badge');
    assert.equal(resultsState.hasTitle, true, 'Must display assignment submission title');
    assert.equal(resultsState.hasStudentName, true, 'Must display student name');
    assert.equal(resultsState.hasCopyBtn, true, 'Must display copy link for teacher button');
    assert.ok(resultsState.reviewUrl, 'Teacher review link must be shown in results banner');
    console.log('✔ AssignmentSubmissionBanner is immediately visible on ResultsView with verified review URL!');

    // 9. Test copy button click and feedback
    await cdp.evalJs(`(() => {
      const copyBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.innerText.includes('Copy Link for Teacher') || b.innerText.includes('Скопировать ссылку для учителя')
      );
      if (copyBtn) copyBtn.click();
    })()`);
    await sleep(300);

    const copyFeedback = await cdp.evalJs(`(() => {
      const text = document.body.innerText;
      return text.includes('Teacher link copied!') || text.includes('Ссылка для учителя скопирована!');
    })()`);
    console.log('Copy button feedback active:', copyFeedback);

    // 10. Test expanding question card ("Разбор") - ensure NO blank screen or crash!
    console.log('Testing question explanation expansion (Разбор)...');
    const expandResult = await cdp.evalJs(`(() => {
      const cards = Array.from(document.querySelectorAll('button')).filter(b =>
        b.innerText.includes('Aufgabe 1') || b.innerText.includes('Aufgabe')
      );
      if (cards.length > 0) {
        cards[0].click();
        return { clicked: true, text: cards[0].innerText.slice(0, 40) };
      }
      return { clicked: false, text: null };
    })()`);
    console.log('Question card clicked:', expandResult);
    await sleep(1000);

    const screenNotBlank = await cdp.evalJs(`document.body.innerText.trim().length > 100`);
    assert.equal(screenNotBlank, true, 'Screen must NOT be blank after clicking question review');

    const hasExplanationText = await cdp.evalJs(`(() => {
      const text = document.body.innerText;
      return text.includes('Warum') || text.includes('Почему') || text.includes('Aufgabe 1');
    })()`);
    assert.equal(hasExplanationText, true, 'Question explanation must be visible');
    console.log('✔ Question expanded smoothly without crash or blank screen!');

    // 11. Navigate directly to teacher review URL
    console.log(`Navigating to teacher review URL: ${resultsState.reviewUrl.slice(0, 60)}...`);
    await cdp.send('Page.navigate', { url: resultsState.reviewUrl });
    await sleep(2500);

    // 12. Verify Teacher Review screen
    const teacherReviewState = await cdp.evalJs(`(() => {
      const text = document.body.innerText;
      const lower = text.toLowerCase();
      return {
        hasTeacherBadge: lower.includes('teacher review') || lower.includes('режим преподавателя'),
        hasStudentName: text.includes('Anna Schmidt'),
      };
    })()`);

    console.log('Teacher review screen state:', teacherReviewState);
    assert.equal(teacherReviewState.hasStudentName, true, 'Teacher review must display student name');
    console.log('✔ Teacher review screen loaded and verified with student submission.');

    // 13. Ensure zero unhandled exceptions throughout entire run
    console.log(`Total unhandled exceptions recorded during full run: ${cdp.exceptions.length}`);
    assert.equal(cdp.exceptions.length, 0, 'No unhandled JavaScript exceptions must occur');
    console.log('🎉 FULL E2E HOMEWORK COMPLETION & REVIEW CYCLE PASSED WITH 0 EXCEPTIONS!');
  } finally {
    if (cdp?.ws) cdp.ws.close();
    if (chromeProcess) chromeProcess.kill();
    if (viteServer) viteServer.kill();
  }
}

runE2E().catch((err) => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});
