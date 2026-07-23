---
name: verification-setup
description: agent-device-tvos の検証環境（tvOS シミュレータ + fixture アプリ）をユーザと確認しながらセットアップし、auto tier テストを実行する。「検証環境を作って」「fixture を入れて」「テストを回したい」で使う。
---

# 検証環境セットアップ

auto tier（bun run test）は「起動中の tvOS シミュレータに fixture アプリが導入済み」を前提とする。この前提づくりは環境依存（どのシミュレータを使うか、ツールが入っているか）なので、以下をユーザと確認しながら進める。テスト側は前提を仮定して失敗するだけで、探索や回復はしない。

## 1. 前提確認

- `agent-device --version` が items.md の検証済みバージョン以上であること。
- `mint version` が通ること（なければ `brew install mint` をユーザに提案）。
- `xcrun simctl list devices booted` で tvOS シミュレータが起動していること。起動していない、または複数の tvOS シミュレータがある場合は、どれを使うかユーザに確認してから起動する（勝手に選ばない）:

```bash
xcrun simctl boot <UDID>
open -a Simulator
```

## 2. fixture のビルドと導入

```bash
mint bootstrap
mint run xcodegen generate --spec fixture/project.yml --project fixture
xcodebuild -project fixture/AdtvFixture.xcodeproj -scheme AdtvFixture \
  -configuration Debug -destination 'generic/platform=tvOS Simulator' \
  -derivedDataPath fixture/.build build
xcrun simctl install <UDID> fixture/.build/Build/Products/Debug-appletvsimulator/AdtvFixture.app
```

`<UDID>` は手順1で確認した tvOS シミュレータのもの。booted が tvOS の1台だけなら `booted` リテラルでもよい（iPhone シミュレータ等が同時に起動していると `booted` は曖昧になるため UDID を使う）。

fixture のソースを変更した場合も同じ手順で再ビルド・再インストールする。

このシミュレータで初めて fixture の URL スキームを開くときだけ、OS の確認ダイアログ（"AdtvFixture" で開きますか?）が出る。一度だけ手動で承認する（フォーカス済みの「開く」を `tv-remote press select` で決定）。承認は再インストールをまたいで持続するため、以降のテスト実行では出ない:

```bash
agent-device open com.akitorahayashi.adtv-fixture --platform ios --target tv --device <名前> --session setup
agent-device open "adtv-fixture://root" --session setup
agent-device tv-remote press select --session setup   # ダイアログが出た場合のみ
agent-device close --session setup
```

## 3. テスト実行

```bash
bun install   # 初回のみ
bun run test  # auto tier（sim）
```

失敗した項目は「表面が変わった主張」を意味する。実測で references / SKILL.md を更新し、items.md の verified を更新する（.mx/policy.md のバージョンアップ運用に従う）。

## 4. manual tier（実機）

`bun run verify-device` がチェックリストを印字する。実機・署名・daemon まわりの項目はこのリストに沿ってユーザと消化し、結果を items.md と references に反映する。使用する実機はその場でユーザに確認する。
