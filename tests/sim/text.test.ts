// auto tier / 文字入力ドメイン: keyboard-clipboard。
// type・fill の実入力は tvOS のキーボードフォーカス経路が不安定なため manual に置く（items.md 参照）。
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { ad, SESSION } from '../cli';
import { openFixture } from '../fixture';

beforeAll(async () => {
  await ad(['close', '--session', SESSION]);
  await openFixture();
});

afterAll(async () => {
  await ad(['close', '--session', SESSION]);
});

describe('keyboard-clipboard', () => {
  it('keyboard dismiss は非対応の原文を返す', async () => {
    const { code, out } = await ad([
      'keyboard',
      'dismiss',
      '--session',
      SESSION,
    ]);
    expect(code).not.toBe(0);
    expect(out).toContain('keyboard is not supported on this device');
  });

  it('clipboard read は sim では pasteboard 接続に失敗する', async () => {
    const { code, out } = await ad(['clipboard', 'read', '--session', SESSION]);
    expect(code).not.toBe(0);
    expect(out).toContain('Unable to connect to device pasteboard');
  });
});
