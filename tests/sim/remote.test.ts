// auto tier / リモコン入力ドメイン: focus-move, back-home, settle-absence,
// press-efficacy, list-scan, no-touch, orientation。
// フォーカス実効は AX ではなく screenshot diff で機械判定する（tvOS の AX は不安定）。
// アプリを退出させる home の検証は連鎖失敗を避けるためファイル末尾に置く。
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ad, SESSION } from '../cli';
import { FIXTURE, gotoRoot, gotoScreen, openFixture } from '../fixture';

let workDir: string;

beforeAll(async () => {
  workDir = mkdtempSync(path.join(tmpdir(), 'adtv-remote-'));
  await ad(['close', '--session', SESSION]);
  await openFixture();
});

afterAll(async () => {
  await ad(['close', '--session', SESSION]);
  rmSync(workDir, { recursive: true, force: true });
});

describe('focus-move / settle-absence', () => {
  it('focus-move: press は方向名を含む成功マーカーを返す', async () => {
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

  it('settle-absence: --settle は INVALID_ARGS で拒否される', async () => {
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

describe('press-efficacy / list-scan（diff による実効判定）', () => {
  it('press-efficacy: 壁際の press は無変化（match）、有効な press は変化（differ）', async () => {
    await gotoRoot();
    const wall = path.join(workDir, 'wall.png');
    await ad(['screenshot', wall, '--session', SESSION]);
    await ad(['tv-remote', 'press', 'up', '--session', SESSION]); // 先頭で上は壁
    const matched = await ad([
      'diff',
      'screenshot',
      '--baseline',
      wall,
      '--session',
      SESSION,
    ]);
    expect(matched.out).toContain('Screenshots match');

    const base = path.join(workDir, 'move.png');
    await ad(['screenshot', base, '--session', SESSION]);
    await ad(['tv-remote', 'press', 'down', '--session', SESSION]); // フォーカスが動く
    const changed = await ad([
      'diff',
      'screenshot',
      '--baseline',
      base,
      '--session',
      SESSION,
    ]);
    expect(changed.out).toContain('pixels differ');
  });

  it('list-scan: 長リストで press down が focus を動かし diff が検出する', async () => {
    await gotoScreen('list');
    const base = path.join(workDir, 'list.png');
    await ad(['screenshot', base, '--session', SESSION]);
    await ad(['tv-remote', 'press', 'down', '--session', SESSION]);
    const changed = await ad([
      'diff',
      'screenshot',
      '--baseline',
      base,
      '--session',
      SESSION,
    ]);
    expect(changed.out).toContain('pixels differ');
    await gotoRoot();
  });
});

describe('no-touch / orientation', () => {
  it('no-touch: pinch はタッチ非対応で拒否される', async () => {
    const { code, out } = await ad([
      'gesture',
      'pinch',
      '0.5',
      '--session',
      SESSION,
    ]);
    expect(code).not.toBe(0);
    expect(out).toContain('pinch is not supported on this device');
  });

  it('no-touch: scroll down は下位互換として成功報告する', async () => {
    const { out } = await ad(['scroll', 'down', '--session', SESSION]);
    expect(out).toContain('Scrolled down');
  });

  it('no-touch: 未知の gesture 種別は INVALID_ARGS を案内する', async () => {
    const { code, out } = await ad([
      'gesture',
      'swipe-up',
      '--session',
      SESSION,
    ]);
    expect(code).not.toBe(0);
    expect(out).toContain(
      'gesture requires pan, fling, swipe, pinch, rotate, or transform',
    );
  });

  it('orientation: rotate は tvOS で非対応の原文を返す', async () => {
    const { code, out } = await ad([
      'rotate',
      'portrait',
      '--session',
      SESSION,
    ]);
    expect(code).not.toBe(0);
    expect(out).toContain('rotate is not supported on this device');
  });
});

describe('back-home（アプリ退出を伴うため最後に実行）', () => {
  it('back-home: 画面を push した後の back は root へ戻る（可視で確認）', async () => {
    await gotoScreen('list');
    const back = await ad(['tv-remote', 'press', 'back', '--session', SESSION]);
    expect(back.out).toContain('Pressed TV remote back');
    const atRoot = await ad(['wait', FIXTURE.rootTitle, '--session', SESSION]);
    expect(atRoot.code).toBe(0);
  });

  it('back-home: home で退出しても open で前面復帰できる', async () => {
    const home = await ad(['tv-remote', 'press', 'home', '--session', SESSION]);
    expect(home.out).toContain('Pressed TV remote home');
    await openFixture();
    const atRoot = await ad(['wait', FIXTURE.rootTitle, '--session', SESSION]);
    expect(atRoot.code).toBe(0);
  });
});
