# トラブルシューティング索引

エラー文字列・症状から担当リファレンスへの逆引き。説明は各リファレンスが持つ。

```tsv
症状・エラー文字列	参照先
Error (AMBIGUOUS_MATCH): selector matched multiple elements（labelのみのselector）	references/focus-and-remote.md
Error (INVALID_ARGS): Flag --settle is not supported for command tv-remote.	references/focus-and-remote.md
is focusedが視覚的にフォーカス中の要素へfocused:falseを返す	references/focus-and-remote.md
tv-remote pressは成功と報告されたのにフォーカスが動いていない	references/focus-and-remote.md
The current screen is overwhelming the iOS accessibility capture（snapshot / --overlay-refs / is / find / gesture swipe）	references/visual-truth.md
runner.logの Failed to resolve query: Application com.apple.springboard is not running	references/visual-truth.md
wait timed out waiting for a stable UI（wait stable）	references/visual-truth.md
snapshot失敗（ランナー再起動）直後のpressが効いていない	references/visual-truth.md
wait timed out for text: に渡したはずの数値引数がテキストとして表示される	references/waits-and-values.md
Error (UNSUPPORTED_OPERATION): tap is supported on tvOS only when the requested point is inside the focused element	references/focus-and-remote.md
Error (AMBIGUOUS_MATCH): find matched N elements for any ...	references/waits-and-values.md
Error (UNSUPPORTED_OPERATION): pinch is not supported on this device	references/list-scanning.md
scroll downが成功報告なのに何も起きない	references/list-scanning.md
Error (XCTEST_RECORDED_FAILURE): XCTest recorded a failure while executing type	references/text-entry.md
Error (UNSUPPORTED_OPERATION): keyboard is not supported on this device	references/text-entry.md
Failed to write/read iOS simulator clipboard: Unable to connect to device pasteboard	references/text-entry.md
Error (COMMAND_FAILED): Simulator device failed to open <url>	references/url-and-deep-links.md
Error (COMMAND_FAILED): alert not found	references/alerts.md
Error (DEVICE_IN_USE): Device is already in use by session	references/sessions-and-diagnostics.md
Error (DEVICE_NOT_FOUND): No device named <udid>	references/prerequisites.md
session listにセッションが出ないのにDEVICE_IN_USEになる	references/sessions-and-diagnostics.md
押下の消失が頻発する・diffの結果が不可解（セッション劣化）	references/visual-truth.md
Batch step N has unknown legacy field(s) / wait input is invalid	references/scripting-flows.md
leaks cannot examine process（perf memory snapshot memgraph）	references/recording-and-perf.md
audio probe requires Screen Recording permission on macOS	references/recording-and-perf.md
No HTTP(s) entries were found（network dump）	references/logs-network-evidence.md
```
