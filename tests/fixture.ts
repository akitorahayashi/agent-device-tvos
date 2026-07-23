// fixture アプリの定数と、deep link による画面遷移ヘルパ。
// ビルド・導入は .claude/skills/verification-setup が所有する（テストは導入済みを仮定する）。
import { ad, SESSION, simulatorName } from './cli';

export const FIXTURE = {
  bundleId: 'com.akitorahayashi.adtv-fixture',
  scheme: 'adtv-fixture',
  rootTitle: 'AdtvFixture Root',
} as const;

// 画面ごとの deep link ホストと、着地を判定するナビゲーションタイトル。
export const SCREENS = {
  list: 'Long List',
  text: 'Text Entry',
  alert: 'Alert',
  animation: 'Animation',
} as const;

export type FixtureScreen = keyof typeof SCREENS;

export async function openFixture(): Promise<void> {
  const device = await simulatorName();
  const opened = await ad(
    [
      'open',
      FIXTURE.bundleId,
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
  if (!opened.out.includes(`Opened: ${FIXTURE.bundleId}`))
    throw new Error(
      `fixture を open できない。verification-setup で導入すること:\n${opened.out}`,
    );
}

// 未知ホストの deep link は onOpenURL で screen=nil となり root に戻る。
export async function gotoRoot(): Promise<void> {
  await ad(['open', `${FIXTURE.scheme}://root`, '--session', SESSION]);
  await ad(['wait', FIXTURE.rootTitle, '--session', SESSION]);
}

// deep link で画面へ直接着地し、ナビゲーションタイトルで着地を確認する。
export async function gotoScreen(screen: FixtureScreen): Promise<void> {
  await ad(['open', `${FIXTURE.scheme}://${screen}`, '--session', SESSION]);
  await ad(['wait', SCREENS[screen], '--session', SESSION]);
}
