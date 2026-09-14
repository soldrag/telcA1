import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { createSessionTelemetryTracker } from '../src/services/telemetry/sessionTelemetryTracker.js';

describe('Session Telemetry Tracker', () => {
  test('tracks timestamps and tab switches', async () => {
    const tracker = createSessionTelemetryTracker();
    tracker.start();

    // Simulate tab switches
    tracker.recordTabSwitch();
    tracker.recordTabSwitch();

    // Small delay to ensure wall clock seconds >= 0
    await new Promise((resolve) => setTimeout(resolve, 50));
    tracker.stop();

    const summary = tracker.getSummary();
    assert.ok(summary.startedAt);
    assert.ok(summary.completedAt);
    assert.equal(summary.tabSwitches, 2);
    assert.ok(typeof summary.wallClockSeconds === 'number');
  });

  test('respects initial startedAt for resumed sessions', () => {
    const pastDate = new Date(Date.now() - 60000).toISOString();
    const tracker = createSessionTelemetryTracker({ initialStartedAt: pastDate });
    tracker.stop();

    const summary = tracker.getSummary();
    assert.equal(summary.startedAt, pastDate);
    assert.ok(summary.wallClockSeconds >= 59);
  });
});
