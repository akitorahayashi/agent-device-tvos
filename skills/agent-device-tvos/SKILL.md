---
name: agent-device-tvos
description: Apple TV（実機・シミュレータ）でagent-deviceを使ってtvOSアプリをデバッグする（起動・フォーカス操作・screenshot・証跡採取）。tvOSはフォーカスエンジン駆動でtv-remoteにより操作し、座標タップは存在しない。tvOSアプリをデバイス上で駆動したいとき、およびtvOSでsnapshotが「overwhelming the iOS accessibility capture」で失敗するときに使用する。
---

# tvOSでのagent-device運用（実機・シミュレータ）

tvOSはSiri Remoteのフォーカスエンジンで駆動する。座標タップ・タッチジェスチャは存在しない。デバイス指定は `--platform ios --target tv`。実機Apple TVとシミュレータが同時に見えることがあるため、`--device <name>` を常に明示する。シミュレータは署名envなしで動く（sim実測。実機のセットアップは未検証・構築中）。

agent-device >= 0.19.1 が必要（`agent-device --version`）。

## コアループ

```
agent-device open <bundle-id> --platform ios --target tv --device <device> --session <name>
agent-device screenshot device-runs/<purpose>/<name>.png --session <name>       # 状態把握（視覚真実が既定）
agent-device tv-remote press <up|down|left|right> --session <name>              # フォーカス移動
agent-device diff screenshot --baseline <直前のpng> --out <diff.png> --session <name>   # 実効確認（✓=空振り / ✗=変化領域が印字される）
agent-device tv-remote press select --session <name>                            # 決定
agent-device close --session <name>
```

- セッション確立後は各コマンドに `--session <name>` を付けるだけでよい（platform/target/deviceのバインドは保持される。sim実測）。
- 検証の既定は視覚真実: `diff screenshot --baseline` が空振り（`✓ Screenshots match.`）とフォーカス移動（darker/brighterの2領域）を機械可読で判定する（visual-truth.md）。`Pressed TV remote <button>` の成功報告は実効の証明にならない（フォーカスが動かない方向への押下も成功と報告される）。
- `tv-remote` に `--settle` は無い。settled diff相当の自動検証は無い前提で、押下→キャプチャで進める（focus-and-remote.md）。
- `snapshot -i` などAXツリー系（get / is / --overlay-refs / diff snapshot）は不安定（sim実測: 失敗が頻繁だが、同一画面で成功に転じることもある。実機は未検証）。コアループはAXに依存させず、テキストの確認はAX死でも動く表面読みの `wait text` / `find "<text>" exists` を使う（waits-and-values.md）。
- `open` 直後のscreenshotは起動遷移中の無内容フレームになりうる（sim実測）。1枚目が真っ黒・無内容なら撮り直す。
- アプリのルート画面で `back`/`menu` を押すとホーム画面へ出る。復帰は `open <bundle-id>`（画面・フォーカス状態は保持される）。
- `select` は決定＝不可逆になりうる。押す前にフォーカス位置を直前のdiff/screenshotで確認してから押す（押下は消失もするため、位置未確認の連打は別要素を押す事故につながる）。
- 押下の消失が頻発しdiffの結果まで不可解になったら、`close` → `open` でセッションを張り直す（visual-truth.md）。

## デバイス実行（device-runs）とその成果物

1回の実行のレシピとキャプチャは、リポジトリルート直下ではなく `device-runs/<purpose>/` に一緒に置く。`device-runs/.gitignore` は `*` のみで、配下は既定で全てignoreされる。残す価値があるレシピだけ一度force-addする。バイナリのキャプチャは追跡しない。

- purpose（目的）ごとに1ディレクトリ。その実行が答える問いをkebab-caseで表す。1回の会話のキャプチャは通常1つのpurposeディレクトリを共有する。
- 1つの観測につき1ファイル。ファイル名には観測を区別する軸をエンコードし、その軸はディレクトリ内で一貫させる（順序付きフローなら `NN-<step>.png`）。

## リファレンスを読むタイミング

以下のトリガーに合致する時だけリファレンスを読む。先読みや全部読みはしない。表には執筆済みのリファレンスのみ載せる（実機検証後にセットアップ系が増える）。

セットアップ:

```tsv
reference	read_when
references/prerequisites.md	デバイスが見つからない・unavailable・DEVICE_NOT_FOUNDのとき、またはtvOSデバイスの指定方法（--target tv / --device）を確認するとき
references/app-install.md	アプリの配置・インストール状況の確認（apps / install / reinstall）を行うとき
```

操作:

```tsv
reference	read_when
references/focus-and-remote.md	tv-remoteのボタン仕様（longpress・--duration-ms・エイリアス、back/menu/homeの実挙動）が必要なとき、フォーカスの現在地をAXで検証したいとき（is focusedの制約）、またはpressの成功報告と実効の乖離を疑うとき
references/visual-truth.md	snapshotが「overwhelming the iOS accessibility capture」で失敗するとき、フォーカス移動をピクセルdiffで検証するとき、押下の消失・セッション劣化を疑うとき、または--overlay-refs/diff snapshotの可否と読み方が必要なとき
references/waits-and-values.md	表示テキスト・属性値の確認や非同期の待機を行うとき、wait/find/get/isのどれが今の画面で使えるか判断したいとき、またはwait textに渡したtimeoutがテキスト扱いされるとき
references/list-scanning.md	目標が画面外にある・長いリスト/グリッドを走査するとき、またはscroll/swipe/pinchが効かない・UNSUPPORTED_OPERATIONのとき
references/text-entry.md	テキストを入力するとき（リニアキーボードの開き方とtype）、またはtype/fill/keyboard/clipboardが失敗するとき
references/url-and-deep-links.md	URL/ディープリンクで画面へ直行しようとするとき、またはopen <url>が「Simulator device failed to open」で失敗するとき
references/alerts.md	ダイアログ・アラートに応答するとき、またはalertコマンドが「alert not found」を返すとき
```

証跡:

```tsv
reference	read_when
references/logs-network-evidence.md	アプリログ・HTTP通信・コマンド履歴を証跡として採取するとき（logs start/mark、network dump、events）
references/recording-and-perf.md	画面録画・perfメトリクス・audio probe・screenshotの解像度指定を行うとき、またはperf/memgraph/audioが失敗・空データになるとき
```

自動化・運用:

```tsv
reference	read_when
references/scripting-flows.md	batchフローを書く・デバッグするとき、またはステップのvalidationエラー（unknown legacy field等）が出るとき
references/sessions-and-diagnostics.md	DEVICE_IN_USEになる・session listにセッションが出ないとき、capabilities/doctor/prepareを使うとき、またはエラーのHintと実挙動が食い違い仕様か不具合か切り分けたいとき
```

索引:

```tsv
reference	read_when
references/troubleshooting.md	エラーが発生したが担当リファレンスが不明なとき（症状→リファレンスの索引）
```

## スキル構造のルール

- 毎回の操作で使う知識（コアループ）はこのファイルに置く。特定の局面でのみ使う知識は `references/` 直下フラットに1本。
- 読むトリガーが異なるものごとに1リファレンス。既存リファレンスが扱うトピックに並行ドキュメントを追加せず、そのリファレンスを拡張する。
- トリガーはルーティング表にのみ記載し、リファレンス本文内には繰り返さない。執筆済みのリファレンスだけを表に載せる。
- 書式は固定しない。知識は状況駆動で自由に書く。加える規律は2つだけ:
  1. 否定的事実（非対応・誤動作）は状況に繋留する。単独の不可事項の羅列を作らず、手順の中の選択理由の一文か、エラー文字列起点でtroubleshooting.mdに置く。
  2. 実機とシミュレータで挙動が割れる能力・事実にだけ、成立する環境（sim / device）と検証状態（実測 / ソース由来 / 未検証）を添える。差がないものに注記しない。
- プロジェクト固有の値（bundle id・画面名）を本文にハードコードしない。

## CLIヘルプ

バージョンに一致し、正確なフラグの根拠となる:

```
agent-device help tv           # フォーカス駆動TV操作の正典
agent-device help workflow     # アプリ駆動の全体リファレンス
agent-device help manual-qa    # スクリプトQAループ
agent-device help debugging    # ログ・ネットワーク・アラート・クラッシュ
```
