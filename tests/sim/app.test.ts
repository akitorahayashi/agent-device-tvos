// auto tier / アプリ・セッションドメイン: device-discovery, app-lifecycle,
// surface-read, deep-link, logs-evidence, batch, session-diagnostics。
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { ad, SESSION, simulatorName } from '../cli';
import { FIXTURE, gotoRoot, openFixture, SCREENS } from '../fixture';

beforeAll(async () => {
  await ad(['close', '--session', SESSION]);
  await openFixture();
});

afterAll(async () => {
  await ad(['close', '--session', SESSION]);
});

describe('device-discovery / app-lifecycle / surface-read', () => {
  it('device-discovery: tvOS シミュレータを列挙し名前で解決できる', async () => {
    const name = await simulatorName();
    expect(name.length).toBeGreaterThan(0);
  });

  it('app-lifecycle: appstate は fixture を前面として報告する', async () => {
    const { code, out } = await ad([
      'appstate',
      FIXTURE.bundleId,
      '--session',
      SESSION,
    ]);
    expect(code).toBe(0);
    expect(out).toContain('Foreground app:');
  });

  it('surface-read: wait <ms> は常に動く', async () => {
    const { code } = await ad(['wait', '100', '--session', SESSION]);
    expect(code).toBe(0);
  });
});

describe('deep-link', () => {
  it('deep-link: 登録スキームで画面へ着地しタイトルで確認できる', async () => {
    const opened = await ad([
      'open',
      `${FIXTURE.scheme}://alert`,
      '--session',
      SESSION,
    ]);
    expect(opened.out).toContain(`Opened: ${FIXTURE.scheme}://alert`);
    const landed = await ad(['wait', SCREENS.alert, '--session', SESSION]);
    expect(landed.code).toBe(0);
    await gotoRoot();
  });
});

describe('logs-evidence', () => {
  it('logs-evidence: start / mark / stop がライフサイクルを報告し path を返す', async () => {
    const started = await ad(['logs', 'start', '--session', SESSION]);
    expect(started.out).toContain('started=true');
    const marked = await ad(['logs', 'mark', 'probe', '--session', SESSION]);
    expect(marked.out).toContain('marked=true');
    const stopped = await ad(['logs', 'stop', '--session', SESSION]);
    expect(stopped.out).toContain('stopped=true');
    const where = await ad(['logs', 'path', '--session', SESSION]);
    expect(where.out).toContain('app.log');
  });

  it('logs-evidence: events はセッションのタイムラインを返す', async () => {
    const { code, out } = await ad(['events', '--session', SESSION]);
    expect(code).toBe(0);
    expect(out.length).toBeGreaterThan(0);
  });
});

describe('batch / session-diagnostics', () => {
  it('batch: 正書式のステップ列は完了報告を返す', async () => {
    const { out } = await ad([
      'batch',
      '--steps',
      '[{"command":"wait","input":{"durationMs":120}}]',
      '--session',
      SESSION,
    ]);
    expect(out).toContain('Batch completed:');
  });

  it('batch: 旧 args フィールドは受理されない', async () => {
    const { code, out } = await ad([
      'batch',
      '--steps',
      '[{"command":"wait","args":["120"]}]',
      '--session',
      SESSION,
    ]);
    expect(code).not.toBe(0);
    expect(out).toContain('unknown legacy field(s): args');
  });

  it('session-diagnostics: doctor はバージョンとセッションを報告する', async () => {
    const { out } = await ad(['doctor', '--session', SESSION]);
    expect(out).toContain('agent-device 0.19.3');
  });

  it('session-diagnostics: session list は JSON を返す', async () => {
    const { out } = await ad(['session', 'list', '--session', SESSION]);
    expect(out).toContain('sessions');
  });
});
