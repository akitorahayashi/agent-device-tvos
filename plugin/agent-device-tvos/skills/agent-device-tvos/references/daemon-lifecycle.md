# daemon のライフサイクルと署名 env の継承

agent-device の CLI はコマンド実行時に daemon を暗黙にスポーンし、以後のコマンドはこの daemon に接続する。実機ランナーのビルド（署名）は daemon プロセス内で走るため、署名 env は daemon がスポーン時に継承したものだけが効く。CLI から実行中の daemon への env 転送は存在しない（ソース由来: `runner-artifact.ts` がビルド時に `process.env` を参照）。

- daemon の実体は `~/.agent-device/daemon.json` で確認できる（pid・起動時刻・port）。`ps -p <pid>` で生死、`ps eww -p <pid>` で保持 env を確認できる（device 実測）。

## 症状: env を前置しても既定チームに戻る

`AGENT_DEVICE_IOS_TEAM_ID` を前置したのに runner.log が `No Account for Team "2S799L9W4M"`（ハードコード既定）のままなら、env なしでスポーンされた daemon が生きている。シミュレータ作業は署名 env 不要なので、sim 作業中に立った daemon がそのまま実機ビルドを担うとこの状態になる（device 実測）。

## アイドル失効と、それがブロックされる条件

daemon はアイドル約5分で自動終了する（ソース由来: `daemon-idle-reap.ts`、既定 5 分。`AGENT_DEVICE_DAEMON_IDLE_TIMEOUT_MS` で変更可・0 で無効）。ただし開いているセッションが1つでもあると失効はブロックされ、daemon は生き続ける（ソース由来＋実測: 別デバイスのセッションが開いたまま約18時間生存）。「約5分で env キャッシュが落ちる」ように見える現象の実体は、この daemon プロセス自体の失効と再スポーンである。

## 復旧手順（device 実測）

1. 全セッションを close する（`agent-device close --session <name>` を各セッションに。別作業のセッションが残っていないか注意）。
2. 5分待つ。この間 agent-device コマンドを一切打たない——どのコマンドもアイドルタイマーをリセットする。
3. `~/.agent-device/daemon.json` の消滅、または `ps -p <旧pid>` の失敗で失効を確認する。
4. 署名 env を前置して再 `open` する。このコマンドがスポーンする新 daemon が env を継承し、以後のビルドに効く。

daemon プロセスの kill は破壊的で、安全分類器にも拒否されうる。アイドル失効を使う。

## 過去の正常値の復元

一度でも成功したビルドの設定は `~/.agent-device/apple-runner/derived/*/cache-*/.agent-device-runner-cache.json` に残る。`runnerSigningBuildSettings`（`DEVELOPMENT_TEAM=...`）と `runnerBundleBuildSettings`（bundle id）から、当時通った値を復元できる（device 実測）。
