# フォーカス移動と決定（tv-remote）

tvOSはSiri Remoteのフォーカスエンジンで駆動する。座標タップは存在しない。方向キーでフォーカスを動かし、selectで決定する。

## ボタンと構文

```
tv-remote [press|longpress] <up|down|left|right|select|menu|home|back> [--duration-ms <ms>]
```

- 出力は `Pressed TV remote <button>`。`ok` / `center` / `enter` はselectの入力エイリアスで、出力も `Pressed TV remote select` と報告される（sim実測）。
- `longpress` は500msホールドの糖衣で、`--duration-ms` が上書きする。出力は通常のpressと区別されず、効果はアプリ依存（設定アプリではlongpress selectは通常selectと同じ遷移だった。sim実測）。
- `back` と `menu` は同じMenuリモートボタンに対応する。アプリ内では1階層戻り（モーダルの閉鎖を含む）で、戻り先のフォーカス位置は保持される。アプリのルート画面で押すとアプリを出てホーム画面へ着く（sim実測）。
- `home` は階層に関係なくホーム画面へ退出する（sim実測）。
- ホームへ出た後の復帰は `open <bundle-id>`。アプリの画面とフォーカス状態は保持されたまま前面へ戻る（sim実測）。

## 押下の検証

- 成功報告 `Pressed TV remote <button>` は実効の証明にならない。フォーカスが動かない方向への押下（単一列リストでの水平方向など）も同じ成功を返す。押下後の検証はscreenshotのフォーカスリング視認が既定（visual-truth.md）。
- `tv-remote` に `--settle` は無い: `Error (INVALID_ARGS): Flag --settle is not supported for command tv-remote.`（sim実測）。settled diffによる自動検証は無い前提で、押下→キャプチャの手順を組む。
- セレクタ・座標での押下（press / findのtap）はフォーカス済み要素の内側の点に限り可能で、それ以外は `Error (UNSUPPORTED_OPERATION): tap is supported on tvOS only when the requested point is inside the focused element` になる（sim実測）。フォーカス済み要素への押下は `tv-remote press select` で足りるため、押下はtv-remoteに統一する。

## AXによるフォーカス検証（使える条件を先に確かめる）

- `is focused '<selector>'` は、AXが応答する画面ではセレクタ解決まで動く。labelのみのselectorは要素と内部テキストの重複一致で `Error (AMBIGUOUS_MATCH): selector matched multiple elements` になりやすい——`role=button label="..."` の形で絞る（sim実測）。
- focused属性はアプリがAXへ出しているとは限らない。設定アプリ（sim）では、視覚的にフォーカス中のボタンに対しても `actual={"visible":true,"editable":false,"selected":false,"focused":false}` が返った。`is focused` に頼る前に、フォーカス中と分かっている要素で1回試し、`focused:true` が返るアプリかを確かめる。falseのままのアプリではscreenshotのフォーカスリングで検証する。
- `is` の失敗出力の `actual={...}` はvisible / editable / selected / focusedの実値を印字する——属性の読み出しとして流用できる。
- `wait 'label="..." focused=true' <quietMs> <timeoutMs>` の形はセレクタとして解釈されずtext待ちに落ちる: `wait timed out for text: label="..." focused=true ...`（sim実測）。フォーカス到達の待機には使わない。
