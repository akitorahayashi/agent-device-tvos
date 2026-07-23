// tvOS シミュレータに対する auto tier: 画面内容に依存しない CLI 表面の主張だけを検証する。
// ホストアプリ（設定）は「何かが前面にある」ための足場で、その画面構造にはアサートしない（fixture 導入後に置き換える）。

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ad, SESSION, simulatorName } from './cli';

const HOST_APP = 'com.apple.TVSettings';
let workDir: string;

beforeAll(async () => {
  workDir = mkdtempSync(path.join(tmpdir(), 'adtv-verify-'));
  await ad(['close', '--session', SESSION]); // 残置セッションの掃除（存在しなければ失敗してよい）
  const device = await simulatorName();
  const opened = await ad(
    [
      'open',
      HOST_APP,
      '--platform',
      'ios',
      '--target',
      'tv',
      '--device',
      device,
      '--session',
      SESSION,
    ],
    300_000,
  );
  expect(opened.out).toContain(`Opened: ${HOST_APP}`);
});

afterAll(async () => {
  await ad(['close', '--session', SESSION]);
  rmSync(workDir, { recursive: true, force: true });
});

describe('tv-remote（focus-move / settle-absence）', () => {
  it('press は成功報告マーカーを返す（実効の証明にはならない）', async () => {
    const { code, out } = await ad([
      'tv-remote',
      'press',
      'up',
      '--session',
      SESSION,
    ]);
    expect(code).toBe(0);
    expect(out).toContain('Pressed TV remote up');
  });

  it('--settle は INVALID_ARGS で拒否される', async () => {
    const { code, out } = await ad([
      'tv-remote',
      'press',
      'up',
      '--settle',
      '--session',
      SESSION,
    ]);
    expect(code).not.toBe(0);
    expect(out).toContain(
      'Flag --settle is not supported for command tv-remote.',
    );
  });
});

describe('keyboard / clipboard（keyboard-clipboard）', () => {
  it('keyboard は非対応の原文を返す', async () => {
    const { code, out } = await ad([
      'keyboard',
      'dismiss',
      '--session',
      SESSION,
    ]);
    expect(code).not.toBe(0);
    expect(out).toContain('keyboard is not supported on this device');
  });

  it('clipboard は sim では pasteboard 接続に失敗する', async () => {
    const { code, out } = await ad(['clipboard', 'read', '--session', SESSION]);
    expect(code).not.toBe(0);
    expect(out).toContain('Unable to connect to device pasteboard');
  });
});

describe('screenshot（screenshot / screenshot-density）', () => {
  it('sim は 1920x1080 固定で非零の png を返す', async () => {
    const file = path.join(workDir, 'shot.png');
    const { code, out } = await ad(['screenshot', file, '--session', SESSION]);
    expect(code).toBe(0);
    expect(out).toContain('1920x1080');
    expect(statSync(file).size).toBeGreaterThan(0);
  });

  it('--pixel-density 2 は sim では 3840x2160 になる', async () => {
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

describe('待機と前面状態（surface-read / app-lifecycle）', () => {
  it('wait <ms> は常に動く', async () => {
    const { code } = await ad(['wait', '100', '--session', SESSION]);
    expect(code).toBe(0);
  });

  it('appstate はホストアプリを前面として報告する', async () => {
    const { code, out } = await ad([
      'appstate',
      HOST_APP,
      '--session',
      SESSION,
    ]);
    expect(code).toBe(0);
    expect(out).toContain('Foreground app:');
  });
});
