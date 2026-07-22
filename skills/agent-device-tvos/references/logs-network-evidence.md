# ログ・ネットワーク・イベント証跡

いずれも sim実測（backend=ios-simulator）。実機Apple TVでは未検証。

## アプリログ（logs）

- 既定は inactive（`sizeBytes=0`）。`logs start` でセッションの `app.log` へのストリーミングが始まり（`started=true` とファイルパスが印字される）、`logs stop` で止まる。数秒の操作でも数百KB級に育つ——中身はcatせず、印字されたパスをgrepする（コマンド出力自体が `grep -n "Error\|Exception" <path>` を案内する）。
- `logs mark "<文言>"`（`marked=true`）でログに任意マーカーを打てる。再現操作の直前・直後に打つと、該当区間をgrepで切り出せる（sim実測: マーカー文字列がapp.logに記録されることを確認）。
- `logs clear [--restart]` はログを消す。`--restart` は対象アプリを再起動するので、状態を保ったまま証跡だけ欲しいときは付けない。
- `logs path` はログファイルのパスを返す。`logs doctor` はログ経路の診断。

## HTTP通信（network dump）

- `network dump [limit] [summary|headers|body|all]` はセッションappログから解析したHTTP(s)通信を返す。ログのストリーミングが前提で、新鮮な通信が要るときは `logs clear --restart` → 再現 → `network dump` の順（コマンド出力自体がこの手順を案内する）。
- アプリがUnified LoggingへリクエストURL・status・timingを出さない場合は `No recent HTTP(s) entries found.` になる（sim実測: 設定アプリ）。その場合はアプリ側のURLSessionログ実装が無いということで、`logs path` のgrepか、アプリへのログ追加で対応する。

## イベントタイムライン（events）

- `agent-device events [limit] [cursor]` はdaemonが持つセッションのイベント履歴（コマンドの start / error / 所要ms）をページングで返す。`path=<events.ndjson> cursor=N nextCursor=M` に続き時系列行が印字される（sim実測）。
- 「いつ何のコマンドがどれだけかかって失敗したか」の振り返りに使える。生ファイルは `events.ndjson`。
