# フォーカス移動と決定（tv-remote）

tvOSはSiri Remoteのフォーカスエンジンで駆動する。座標タップは存在しない。方向キーでフォーカスを動かし、selectで決定する。

## ボタンと構文

```
tv-remote [press|longpress] <up|down|left|right|select|menu|home|back> [--duration-ms <ms>]
```

- 出力は `Pressed TV remote <button>`。`ok` / `center` / `enter` はselectの入力エイリアスで、出力も `Pressed TV remote select` と報告される（実測）。
- `longpress` は500msホールドの糖衣で、`--duration-ms` が上書きする。出力は通常のpressと区別されず、効果はアプリ依存（設定アプリではlongpress selectは通常selectと同じ遷移だった。sim実測）。
- `back` と `menu` は同じMenuリモートボタンに対応する。アプリ内では1階層戻り（モーダルの閉鎖を含む）で、戻り先のフォーカス位置は保持される。アプリのルート画面で押すとアプリを出てホーム画面へ着く（実測）。
- `home` は階層に関係なくホーム画面へ退出する（実測）。
- ホームへ出た後の復帰は `open <bundle-id>`。アプリの画面とフォーカス状態は保持されたまま前面へ戻る（実測）。

## 押下の検証

- 成功報告 `Pressed TV remote <button>` は実効の証明にならない。フォーカスが動かない方向への押下（単一列リストでの水平方向など）も同じ成功を返す。押下後の検証はscreenshotのフォーカスリング視認が既定（visual-truth.md）。
- `tv-remote` に `--settle` は無い: `Error (INVALID_ARGS): Flag --settle is not supported for command tv-remote.`（実測: CLI層の制約でsim・device同一）。settled diffによる自動検証は無い前提で、押下→キャプチャの手順を組む。
- セレクタ・座標での押下（press / findのtap）はフォーカス済み要素の内側の点に限り可能（実測: 成功時は `Tapped <selector> (x, y)`）。それ以外への押下の失敗面は環境で割れる: simは `Error (UNSUPPORTED_OPERATION): tap is supported on tvOS only when the requested point is inside the focused element`、実機はランナー再起動を伴う `iOS runner was already restarted during this request and "tap" still failed` になり再起動コストを払う（実測）。フォーカス済み要素への押下は `tv-remote press select` で足りるため、押下はtv-remoteに統一する。

## AXによるフォーカス検証（使える条件を先に確かめる）

- `is focused '<selector>'` は、AXが応答する画面ではセレクタ解決まで動く。labelのみのselectorは要素と内部テキストの重複一致で `Error (AMBIGUOUS_MATCH): selector matched multiple elements` になりやすい——`role=button label="..."` の形で絞る（sim実測）。
- focused属性はアプリがAXへ出しているとは限らず、同じアプリでも環境で割れる。設定アプリはsimでは視覚的にフォーカス中のボタンに対しても `actual={"visible":true,"editable":false,"selected":false,"focused":false}` を返したが、実機では正しく判定する（device実測: フォーカス中の要素に `Passed: is focused`、非フォーカス要素に `focused:false` の失敗）。snapshotにも実機では `[focused]` マーカーが載る。`is focused` に頼る前に、フォーカス中と分かっている要素で1回試し、`focused:true` が返る環境・アプリかを確かめる。falseのままの場合はscreenshotのフォーカスリングで検証する。
- `is` の失敗出力の `actual={...}` はvisible / editable / selected / focusedの実値を印字する——属性の読み出しとして流用できる。
- `wait 'label="..." focused=true' <quietMs> <timeoutMs>` の形はセレクタとして解釈されずtext待ちに落ちる: `wait timed out for text: label="..." focused=true ...`（sim実測）。フォーカス到達の待機には使わない。
