# ダイアログ・アラートへの応答

- tvOSのダイアログはフォーカス駆動のUIとして出る。応答の既定は tv-remote: 方向キーでボタンへフォーカスを移し `select` で決定、`back` でキャンセル相当（アプリの実装による）。検証は diff screenshot（visual-truth.md）。
- `alert [get|accept|dismiss|wait] [timeout]` コマンドはtvOSでも受理される。アラートが出ていないときは `Error (COMMAND_FAILED): alert not found`（sim実測）。アラート表示中の inspect は本文を返す（sim実測: SwiftUIの`.alert`で `Fixture Alert.`）。
- アラートを出すボタンの発火が非決定的（sim実測。fixtureで確認）: フォーカス済みでも `tv-remote press select` はSwiftUIのButtonアクションを発火しないことがあり、`click <x> <y>` はフォーカス済み要素の枠内でも `Error (UNSUPPORTED_OPERATION): tap is supported on tvOS only when the requested point is inside the focused element` で拒否されることがある（AXのフォーカス枠取得が不安定なため）。
- accept / dismiss はフォーカス依存: `Error (UNSUPPORTED_OPERATION): alert accept is supported on tvOS only when the requested element is focused`（sim実測）。tvOSでは応答対象ボタンへフォーカスを移してから操作する必要があり、この経路が非決定的なため実アラート応答は手動検証に置く。検証は diff screenshot（visual-truth.md）を併用する。
