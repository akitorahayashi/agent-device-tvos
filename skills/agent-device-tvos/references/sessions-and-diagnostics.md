# セッション運用と診断

## セッションモデル

- 1デバイス1セッション。使用中のデバイスに別名セッションで開こうとすると `Error (DEVICE_IN_USE): Device is already in use by session "<name>".` になる（Hintが `--session <name>` での相乗りか `close --session <name>` を案内する。sim実測）。
- セッション確立後は各コマンドに `--session <name>` を付けるだけで、platform / target / device のバインドが再利用される（sim実測）。
- 実機Apple TVとシミュレータがデバイス一覧に同時に並ぶため、セッション開設時は `--device <名前>` を必ず明示する。`--device` はデバイス名のみを受け、UDIDを渡すと `Error (DEVICE_NOT_FOUND): No device named <udid>` になる（sim実測）。

## セッションの実在確認は doctor で行う

- `session list` はアクティブなtvOSセッションを載せないことがある（sim実測: 明示名セッションが使用中でも一覧に出ず、同時に DEVICE_IN_USE はそのセッション名を報告した）。
- `doctor` は正しく報告する: `✓ session: Active session <name> targets <device>`。ほかにデバイス在庫・Appleツールチェーン・target-appの起動可否・ランナービルドキャッシュを診断し、ブロッカーが無ければ `Doctor: pass` / `No blockers found.`（sim実測）。

## capabilities はtvOSでは可否の根拠にならない

`capabilities` はtvOS simで41コマンドを列挙するが、実態と乖離する（sim実測）:

- タッチ系（click / swipe / pan / fling / focus / scroll）は一覧に載っていても、実際はフォーカス済み要素内限定（`tap is supported on tvOS only when ...`）か実質no-op（focus-and-remote.md / list-scanning.md）。
- `focus <x> <y>`（座標フォーカス）も同じtap制限エラーになる。
- keyboard は一覧に無く、実際に非対応。

コマンド単位の在覧すら当てにせず、実測とこのスキルの各リファレンスを根拠にする。

## prepare ios-runner

ランナーのビルド／health-checkを前払いする。ビルド済みなら `--json` で `cache=exact` / `artifact=valid` / `buildMs=0` が返り即座に完了する（sim実測）。初回snapshotのビルド待ちを先に済ませたいときに使う。

## エラー表面と真因の乖離・仕様か不具合かの切り分け

- `COMMAND_FAILED` の本文とHintは要約で、真因と食い違うことがある。エラー出力に印字される `Diagnostics Log:`（セッションの `runner.log`）末尾の `error:` 行が一次情報（実例: AX過負荷Hintの真因がspringboard照会失敗だった。visual-truth.md）。
- 仕様か不具合かの一次情報はOSSソース（github.com/callstack/agent-device）にある: `src/platforms/apple/capabilities.ts`（AppleOS別の公式能力テーブル。tvosはkeyboard/orientation非対応・ライフサイクル対応）、`src/contracts/apple-multitouch-support.ts`（タッチ合成ポリシー）、`src/contracts/interaction-guarantees.ts`（既知ギャップ台帳。ここに載っていない挙動不良は未把握の不具合の可能性が高い）。参照前にインストール済みCLIとソースのバージョン一致を確認する。
