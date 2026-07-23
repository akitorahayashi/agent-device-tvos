# 実機ランナーの署名（tvOS デバイスビルド）

シミュレータは署名 env なしで動くが、実機 Apple TV では XCTest ランナーのビルドにコード署名が必要になる（device 実測: tvOS 26.5 / agent-device 0.19.3 / Xcode 26.3）。

## ビルドは遅延で走る

実機では `open <bundle-id>` はランナー不要で成功し、セッションも確立する。ランナービルド（`Building Apple runner...`）は最初の UI コマンド（screenshot 等）で初めて誘発される。`open` が通ったことは署名セットアップの完了を意味しない。

## 署名 env

env 名は IOS だが、tvOS デバイスビルドにも OS 分岐なしでそのまま適用される（ソース由来: `runner-cache-metadata.ts` の `resolveRunnerSigningBuildSettings`。device 実測: ビルド引数に `DEVELOPMENT_TEAM=<値>` と bundle id が反映される）。

```
AGENT_DEVICE_IOS_TEAM_ID=<TEAM_ID> \
AGENT_DEVICE_IOS_BUNDLE_ID=<com.yourname.agentdevice.runner> \
agent-device open <bundle-id> --platform ios --target tv --device <device> --session <name>
```

- `AGENT_DEVICE_IOS_BUNDLE_ID` は「Failed registering bundle identifier」を避けるためユニークな逆 DNS 値にする。テストランナー側は自動で `<値>.uitests` になる。
- 任意で `AGENT_DEVICE_IOS_SIGNING_IDENTITY` / `AGENT_DEVICE_IOS_PROVISIONING_PROFILE` も同経路で効く（ソース由来）。
- env はビルドを実行する daemon プロセスの環境から読まれる。env なしで daemon が既に生きていると、コマンドに env を前置しても効かない——この場合の復旧は references/daemon-lifecycle.md。
- 署名設定はランナーキャッシュキーに含まれる（device 実測: env を変えると `~/.agent-device/apple-runner/derived/tvos-device/cache-<hash>` が変わり再ビルドになる）。

## env なし・不達のときの失敗面

エラー表面は `Error (COMMAND_FAILED): xcodebuild build-for-testing failed`、Hint は「Install/select a valid iOS provisioning profile...」だが、真因は runner.log（エラー出力の Diagnostics Log）の `error:` 行にある:

```
error: No Account for Team "2S799L9W4M". Add a new account in Accounts settings or verify that your accounts have valid credentials.
error: No profiles for 'com.callstack.agentdevice.runner' were found: Xcode couldn't find any tvOS App Development provisioning profiles matching 'com.callstack.agentdevice.runner'.
```

`2S799L9W4M` と `com.callstack.agentdevice.runner` は agent-device のハードコード既定値。この2行が出ていたら署名 env がビルドに届いていない（未設定、または env なし daemon が生存）。runner.log の xcodebuild 起動行に `DEVELOPMENT_TEAM=` が含まれるかで env の到達を判定できる。

## チームに Apple TV が未登録のときの失敗面

env が届いていても、チームのデバイスリストに Apple TV が1台も無いとプロファイルを生成できない:

```
error: Communication with Apple failed: Your team has no devices from which to generate a provisioning profile. Connect a device to use or manually add device IDs
```

agent-device のビルドは `-destination generic/platform=tvOS` で走るため、接続中の実機を自動登録できない。復旧は、同じランナープロジェクトを実機を明示した destination で一度だけ直接ビルドする（device 実測: これでデバイス登録とプロファイル生成が通り、以後 agent-device 側のビルドが成功する）:

```
xcrun xctrace list devices   # 実機の UDID（00008110-... 形式）を取得
xcodebuild build-for-testing \
  -project <runner.log の xcodebuild 行にある AgentDeviceRunner.xcodeproj のパス> \
  -scheme AgentDeviceRunner \
  -destination "platform=tvOS,id=<UDID>" \
  -derivedDataPath <一時ディレクトリ> \
  -allowProvisioningUpdates CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=<TEAM_ID> \
  AGENT_DEVICE_IOS_RUNNER_APP_BUNDLE_ID=<bundle> \
  AGENT_DEVICE_IOS_RUNNER_TEST_BUNDLE_ID=<bundle>.uitests
```

`-derivedDataPath` は agent-device のキャッシュ（`~/.agent-device/apple-runner/derived/`）を汚さないよう使い捨ての場所にする。
