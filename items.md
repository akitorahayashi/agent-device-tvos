# 検証項目インベントリ（agent-device-tvos）

tier の意味: auto=ハーネスで機械検証 / manual=実機・手動で維持（bun run verify-device がチェックリスト化） / judgment=散文でしか持てない判断 / out-of-scope=カバレッジ突合のための対象外宣言。

| id | capability | binding | env | tier | verified | reflected_in | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| device-discovery | 接続中のtvOSデバイス（sim・実機）を列挙し、名前で指定してセッションを開ける | devices --platform ios --target tv; open <bundle-id> --platform ios --target tv --device <名前> --session <名前> | sim+device | auto | 0.19.3（sim・device実測） | prerequisites.md, SKILL.md | UDID指定はDEVICE_NOT_FOUND |
| app-lifecycle | アプリの起動・前面復帰・終了・前面状態の取得ができる | open / close / apps / appstate | sim+device | auto | 0.19.3（sim・device実測） | SKILL.md, app-install.md | 実機のopenはランナー不要（ビルドは初回UIコマンドで遅延） |
| app-install | .appの配置・再インストールができる | install <path> / reinstall <app> <path> / install-from-source | sim+device | manual | 未検証 | app-install.md | 実インストールは両環境未検証 |
| focus-move | フォーカスを方向指定で動かし決定を送れる（成功報告は実効の証明にならない） | tv-remote press\|longpress <up\|down\|left\|right\|select\|menu\|home\|back> [--duration-ms] | sim+device | auto | 0.19.3（sim・device実測） | SKILL.md, focus-and-remote.md | エイリアスok/center/enter→select出力 |
| press-efficacy | 押下の実効をピクセルdiffで機械判定できる（settled diff代替） | screenshot → tv-remote press → diff screenshot --baseline | sim+device | auto | 0.19.3（sim・device実測） | visual-truth.md | baselineは押下直前に撮る（実機は解像度が揺れる） |
| back-home | 1階層戻り・ホーム退出・openによる状態保持復帰ができる | tv-remote press back / home → open <bundle-id>; back / home / app-switcher（単体コマンドは未検証） | sim+device | auto | 0.19.3（sim・device実測。単体コマンドは未検証） | focus-and-remote.md | 意味論の断定はfixtureの決定的画面で行う |
| settle-absence | tv-remoteに--settleは無い（拒否原文が安定している） | tv-remote press up --settle → Error (INVALID_ARGS) | sim+device | auto | 0.19.3（sim・device実測） | SKILL.md, focus-and-remote.md | CLI層の制約 |
| ax-snapshot | AXツリーを取得できる（生死は環境と画面に依存する） | snapshot -i | sim+device | manual | 0.19.3（sim=不安定・device=静的画面で8/8） | visual-truth.md | springboard照会はrunner.logで毎回失敗（致命になるのはsimのみ） |
| focused-verify | フォーカス位置をAXで検証できる（アプリ・環境依存） | is focused '<selector>' / snapshotの[focused]マーカー | sim+device | manual | 0.19.3（sim設定アプリ=false / device=正順） | focus-and-remote.md | fixtureでauto化予定 |
| selector-press | フォーカス済み要素に限りセレクタ・座標押下できる | press '<selector>' / click / longpress <target> / find <text> tap | sim+device | manual | 0.19.3（press実測。click・longpress単体は未検証） | focus-and-remote.md | 非フォーカス要素への失敗面は環境で割れる |
| surface-read | 表示テキストの存在確認・待機ができる（AX死でも動く） | wait text "<text>" / find "<text>" exists / wait <ms> | sim+device | auto | 0.19.3（sim・device実測） | waits-and-values.md | wait textの位置引数はテキストへ折り込まれる罠 |
| value-read | 要素の属性・テキストを読める（AX生存時） | get text / get attrs / is <predicate> | sim+device | auto | 0.19.3（sim・device実測） | waits-and-values.md |  |
| screenshot | 画面の視覚状態を取得できる | screenshot <path> / --max-size | sim+device | auto | 0.19.3（sim・device実測） | visual-truth.md, recording-and-perf.md | 実機は1920x1080↔3840x2160で揺れる |
| screenshot-density | 解像度指定はsimのみ（実機は拒否原文） | screenshot --pixel-density <n> | sim+device | auto | 0.19.3（sim・device実測） | recording-and-perf.md |  |
| overlay-refs | AX生存画面でref注釈付きスクショとツリーdiffが取れる | screenshot --overlay-refs / diff snapshot -i | sim+device | manual | 0.19.3（sim・device実測） | visual-truth.md | フォーカス移動はツリーdiffに現れない |
| list-scan | 画面外の目標へ有限ループで走査し端到達を判定できる | wait text → tv-remote press down → diff screenshot の反復 | sim+device | auto | 0.19.3（sim・device実測） | list-scanning.md | fixtureの長リストで決定的にする |
| no-touch | タッチ合成が存在しない（各コマンドの失敗面が文書どおり） | scroll / gesture <kind> / swipe / pinch / focus <x> <y> | sim+device | auto | 0.19.3（sim実測。device scrollはtimeout実測。focus・swipe単体は未検証） | list-scanning.md |  |
| text-entry | キーボードへフォーカスしてtypeで入力できる | tv-remote press select → type "<text>" → find exists | sim+device | manual | 0.19.3（sim・device実測） | text-entry.md | TEXT_ENTRY_MISMATCH誤判定あり。fixtureでauto化予定 |
| fill-unusable | fillはtvOSでは実用にならない（拒否・失敗原文） | fill '<selector>' "<text>" | sim+device | auto | 0.19.3（sim・device実測） | text-entry.md |  |
| keyboard-clipboard | keyboard・clipboardコマンドは使えない（原文は環境で割れる） | keyboard dismiss / clipboard read / clipboard write | sim+device | auto | 0.19.3（sim・device実測） | text-entry.md |  |
| deep-link | URLオープンの受理と着地の可視検証ができる（成功報告は遷移の証明にならない） | open "<scheme>://<path>" → screenshot / wait text | sim+device | manual | 0.19.3（sim・device実測。可視着地は未達） | url-and-deep-links.md | fixtureの登録スキームでauto化予定 |
| alerts | 実アラートに応答できる | alert [action] / tv-remote press | sim+device | manual | 未検証（コマンド受理のみ実測） | alerts.md | fixtureのアラートボタンで初めて検証可能 |
| logs-evidence | アプリログ・HTTP・コマンド履歴を証跡として採取できる | logs start\|mark\|stop\|clear --restart / network dump / events | sim+device | auto | 0.19.3（sim・device実測） | logs-network-evidence.md | deviceのHTTP可視性はアプリのUnified Logging出力依存 |
| recording | 画面録画を採取し成果物を検証できる | record start / record stop | sim+device | auto | 0.19.3（sim・device実測） | recording-and-perf.md | 成果物はduration・寸法で検証 |
| perf | perfメトリクスを採取できる（可否は環境で割れる） | perf metrics / perf frames / perf memory snapshot / trace start\|stop | sim+device | manual | 0.19.3（metrics・memgraph実測。traceは未検証） | recording-and-perf.md | フレーム健全性はdeviceのみ |
| audio | audio probeで音声レベルを観測できる（simのみ・ホスト音声） | audio probe start\|stop | sim | manual | 0.19.3（sim・device実測） | recording-and-perf.md | macOS画面収録権限に依存（CI不向き） |
| orientation | 画面回転は非対応（能力テーブル由来。拒否原文は未取得） | rotate <orientation> | sim+device | auto | ソース由来（capabilities.ts）・未実測 | - | 拒否原文の取得と反映が未了＝既知のカバレッジギャップ |
| batch | 複数コマンドを1リクエストで実行できる | batch --steps <json> | sim+device | auto | 0.19.3（sim・device実測） | scripting-flows.md | 実機の初回stepはランナーウォームアップで遅い |
| replay | 記録済みフローを再生できる | replay <path> / test <path> | sim+device | manual | 未検証（.adの生成経路が未確立） | scripting-flows.md | フロー再現はbatchを既定とする |
| session-diagnostics | 1デバイス1セッションの排他と診断ができる | session list / doctor / capabilities / prepare | sim+device | auto | 0.19.3（sim・device実測） | sessions-and-diagnostics.md | session listは空になりうる（doctorが正） |
| runner-signing | 実機ランナーの署名envがtvOSビルドに効く | AGENT_DEVICE_IOS_TEAM_ID / AGENT_DEVICE_IOS_BUNDLE_ID を前置 | device | manual | 0.19.3（device実測） | runner-signing.md | チーム未登録は明示destinationの直接ビルドで回復 |
| daemon-lifecycle | daemonのenv継承・アイドル失効・セッションによるブロックを運用できる | ~/.agent-device/daemon.json の確認 / close → 5分待機 → env前置 | device | manual | 0.19.3（device実測＋ソース由来） | daemon-lifecycle.md |  |
| device-trust | 実機のペアリング状態を確認できる | xcrun devicectl list devices（agent-device外のコマンド） | device | manual | 0.19.3（device実測） | device-trust.md | 信頼ダイアログはtvOS 26.5では不発生 |
| degraded-session | 押下消失・劣化セッションからの回復を判断できる | close --session <name> → open で張り直す | sim+device | judgment | sim実測に基づく散文（実機では消失未観測） | visual-truth.md |  |
| diagnostics-reading | エラー表面のHintと真因の乖離をrunner.logで切り分けられる | エラー出力のDiagnostics Log（runner.log）末尾のerror:行を読む | sim+device | judgment | - | sessions-and-diagnostics.md, visual-truth.md |  |
| oos-remote | クラウド・リモート運用はスキル対象外 | auth / connect / connection / disconnect / proxy / artifacts | - | out-of-scope | - | - | 必要になったら項目化 |
| oos-web | web自動化はスキル対象外 | web / viewport | - | out-of-scope | - | - |  |
| oos-react-native | React Native系はスキル対象外 | metro / react-native / react-devtools / cdp | - | out-of-scope | - | - | 対象アプリがRNのとき別途 |
| oos-mcp | MCPサーバ起動はスキル対象外 | mcp | - | out-of-scope | - | - |  |
| oos-crash-symbolication | クラッシュのシンボリケートは未整備 | debug | - | out-of-scope | - | - | 将来項目候補 |
| oos-device-power | デバイスの起動・停止は未整備（shutdownは破壊的でスキルが禁止） | boot / shutdown | - | out-of-scope | - | - |  |
| oos-os-settings | OS設定・権限変更は未整備 | settings | - | out-of-scope | - | - | 将来項目候補（キッズプロテクト検証等） |
| oos-push | push通知配送は未整備 | push | - | out-of-scope | - | - | 将来項目候補 |
| oos-app-events | アプリ定義イベントの起動は未整備 | trigger-app-event | - | out-of-scope | - | - |  |
