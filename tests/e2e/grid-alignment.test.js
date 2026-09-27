// Page grid check: every desktop band keeps its blocks on one top (and, when stretched, one bottom)
// edge and spans the page column; below 1024 px bands dissolve into the stream; no screen scrolls sideways.
// Run: CHROME_PATH=/path/to/chrome npm run test:e2e:grid
import { launch, sleep } from './cdpHarness.js';

const PORT = 5186;
const WIDTHS = [1440, 1920, 390];
const TOLERANCE = 1;

// Buttons are found by their visible text, in English or Russian.
const clickByText = (pattern) => `(() => {
  const re = new RegExp(${JSON.stringify(pattern)});
  const button = [...document.querySelectorAll('button')].find((b) => b.offsetParent && re.test(b.textContent.trim()));
  if (!button) return false;
  button.click();
  return true;
})()`;

const SCREENS = [
  { name: 'student-lesen', steps: [] },
  { name: 'student-schreiben', steps: ['^Schreiben'] },
  { name: 'teacher', steps: ['^(Teacher|Преподаватель)$'], desktopOnly: true },
  { name: 'history', steps: ['^(History|История)$'] },
];

const MEASURE = `(() => {
  const problems = [];
  const desktop = window.innerWidth >= 1024;
  if (document.documentElement.scrollWidth > window.innerWidth + ${TOLERANCE}) {
    problems.push('horizontal scroll: ' + document.documentElement.scrollWidth + ' > ' + window.innerWidth);
  }
  const bands = [...document.querySelectorAll('[data-band]')];
  bands.forEach((band, index) => {
    const label = 'band ' + index + ' (' + band.dataset.band + ')';
    const display = getComputedStyle(band).display;
    if (!desktop) {
      if (display !== 'contents') problems.push(label + ' is ' + display + ' below 1024 px');
      return;
    }
    const box = band.getBoundingClientRect();
    const blocks = [...band.children].map((c) => c.getBoundingClientRect()).filter((r) => r.width > 0);
    if (blocks.length === 0) return;
    const off = (a, b) => Math.abs(a - b) > ${TOLERANCE};
    if (blocks.some((r) => off(r.top, blocks[0].top))) problems.push(label + ': tops differ');
    if (band.dataset.band === 'stretch' && blocks.some((r) => off(r.bottom, blocks[0].bottom))) problems.push(label + ': bottoms differ');
    if (off(Math.min(...blocks.map((r) => r.left)), box.left)) problems.push(label + ': first block leaves the left grid edge');
    if (off(Math.max(...blocks.map((r) => r.right)), box.right)) problems.push(label + ': last block leaves the right grid edge');
  });
  return { bands: bands.length, problems };
})()`;

async function checkScreen(browser, width, screen) {
  // Each screen starts from a clean browser: the role and the module are remembered in storage.
  await browser.send('Page.navigate', { url: `http://localhost:${PORT}/` });
  await sleep(800);
  await browser.evaluate('localStorage.clear(); sessionStorage.clear(); location.reload(); true');
  await sleep(1500);
  for (const step of screen.steps) {
    if (!(await browser.evaluate(clickByText(step)))) throw new Error(`${screen.name}@${width}: no button /${step}/`);
    await sleep(700);
  }
  if (process.env.GRID_BREAK) await browser.evaluate(`document.querySelector('[data-band] > *')?.style.setProperty('margin-top', '12px'); true`);
  return browser.evaluate(MEASURE);
}

async function run() {
  const browser = await launch({ port: PORT, cdpPort: 9227 });
  const failures = [];
  try {
    for (const width of WIDTHS) {
      await browser.send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 640 });
      for (const screen of SCREENS) {
        if (screen.desktopOnly && width < 1024) continue;
        const { bands, problems } = await checkScreen(browser, width, screen);
        console.log(`${problems.length ? '✗' : '✓'} ${screen.name} @ ${width}: ${bands} band(s)`);
        problems.forEach((problem) => failures.push(`${screen.name} @ ${width}: ${problem}`));
      }
    }
  } finally {
    browser.close();
  }
  if (failures.length) throw new Error(failures.join('\n'));
  console.log('Grid alignment passed.');
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
