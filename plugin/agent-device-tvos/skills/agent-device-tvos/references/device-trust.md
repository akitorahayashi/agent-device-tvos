# Apple TV 上の開発者信頼

実機でランナーを動かす前提は、Mac と Apple TV のペアリングが確立していること。`xcrun devicectl list devices` で対象が `available (paired)` と出ていればペアリング済み（device 実測）。unavailable の実機には接続できない。

検証済みの経路（tvOS 26.5・自動署名・`-allowProvisioningUpdates`、チームの開発証明書で署名したランナー）では、Apple TV 側での信頼操作は一度も要求されず、初回ビルド後にランナーがそのまま起動した（device 実測）。iOS 実機で知られる「Developer App Certificate is not trusted」の信頼ダイアログ・設定操作は、この経路の tvOS では再現していない。

ランナー起動が信頼・接続起因で失敗する場合、エラー表面には次の Hint が出る（ソース由来: `devicectl.ts` / `runner-contract.ts`）:

```
Ensure the iOS device is unlocked, trusted, and available in Xcode > Devices, then retry.
Target iOS device is still connecting. Keep it unlocked, wait for device trust/connection to settle, then retry.
```

このときの確認順:

1. `agent-device devices --platform ios --target tv` で対象が見えているか（見えない場合は references/prerequisites.md）。
2. `xcrun devicectl list devices` で `available (paired)` か。unavailable なら Xcode > Window > Devices and Simulators でペアリングし直す（Apple TV 側は 設定 > リモコンとデバイス からペアリング画面に入る）。
3. それでも失敗するなら runner.log（エラー出力の Diagnostics Log）末尾の `error:` 行で真因を確定する。証明書の信頼エラーが tvOS 実機で実際に出た場合の画面操作経路は未検証——エラー原文とともにこのファイルに追記する。
