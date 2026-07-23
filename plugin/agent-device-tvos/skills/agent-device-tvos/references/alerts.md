# ダイアログ・アラートへの応答

- tvOSのダイアログはフォーカス駆動のUIとして出る。応答の既定は tv-remote: 方向キーでボタンへフォーカスを移し `select` で決定、`back` でキャンセル相当（アプリの実装による）。検証は diff screenshot（visual-truth.md）。
- `alert [get|accept|dismiss|wait] [timeout]` コマンドはtvOSでも受理される。アラートが出ていないときは `Error (COMMAND_FAILED): alert not found`（sim実測）。実際のアラートに対する get / accept / dismiss の動作は未検証——エラーHint（`If the permission sheet is visible in snapshot or screenshot but alert reports no alert, take a scoped snapshot around the visible button label and use press @ref.`）はtapがフォーカス済み要素内限定のtvOSではそのまま使えないことに注意し、tv-remoteでの応答を既定にする。
