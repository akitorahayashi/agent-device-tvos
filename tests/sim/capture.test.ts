// auto tier / 成果物ドメイン: screenshot, screenshot-density, recording。
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ad, SESSION } from '../cli';
import { gotoRoot, openFixture } from '../fixture';

let workDir: string;

beforeAll(async () => {
  workDir = mkdtempSync(path.join(tmpdir(), 'adtv-capture-'));
  await ad(['close', '--session', SESSION]);
  await openFixture();
  await gotoRoot();
});

afterAll(async () => {
  // 録画中に中断されても host の録画ロックを残さないよう解放する（未録画なら失敗するが無視）。
  await ad(['record', 'stop', '--session', SESSION]);
  await ad(['close', '--session', SESSION]);
  rmSync(workDir, { recursive: true, force: true });
});

describe('screenshot / screenshot-density', () => {
  it('screenshot: sim は 1920x1080 固定で非零の png を返す', async () => {
    const file = path.join(workDir, 'shot.png');
    const { code, out } = await ad(['screenshot', file, '--session', SESSION]);
    expect(code).toBe(0);
    expect(out).toContain('1920x1080');
    expect(statSync(file).size).toBeGreaterThan(0);
  });

  it('screenshot-density: --pixel-density 2 は sim では 3840x2160 になる', async () => {
    const file = path.join(workDir, 'shot@2x.png');
    const { out } = await ad([
      'screenshot',
      file,
      '--pixel-density',
      '2',
      '--session',
      SESSION,
    ]);
    expect(out).toContain('3840x2160');
  });
});

describe('recording', () => {
  it('recording: record start→stop は ftyp ヘッダを持つ非零 mp4 を残す', async () => {
    const file = path.join(workDir, 'rec.mp4');
    const started = await ad(['record', 'start', file, '--session', SESSION]);
    expect(started.code).toBe(0);
    await ad(['wait', '1200', '--session', SESSION]);
    const stopped = await ad(['record', 'stop', '--session', SESSION]);
    expect(stopped.code).toBe(0);
    const bytes = readFileSync(file);
    expect(bytes.length).toBeGreaterThan(0);
    expect(bytes.subarray(0, 12).includes(Buffer.from('ftyp'))).toBe(true);
  });
});
