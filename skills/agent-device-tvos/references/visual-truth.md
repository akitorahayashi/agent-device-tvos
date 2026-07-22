# 視覚真実による状態把握（screenshot / diff）

tvOSではAXスナップショットが画面依存で失敗するため、screenshotとそのピクセル比較が状態把握の既定ルートになる。

## screenshot

- `screenshot <path>` はAXの生死に関係なく動く（sim実測: 1920x1080 @1x）。
- `open` 直後は起動遷移中の無内容フレームになりうる（sim実測）。1枚目が真っ黒・無内容なら撮り直す。

## AXスナップショットの生死

- `snapshot -i` は不安定で、頻繁に失敗する（sim実測）。傾向として要素数の少ないカスタムモーダルでは安定して成功（7ノード）し、リスト画面・ホーム画面では失敗が多い。ただし決定的ではない——同一画面・同種のAXコマンドが失敗した後に成功へ転じた実測がある。手順はAXに依存させずに組み、取れたら補助として使う。実機での挙動は未検証。
- 成功時もキャプチャは激遅（p95約17秒。sim実測）。`wait stable` はこの停滞で `wait timed out waiting for a stable UI` になり実用にならない。
- エラー表面は「The current screen is overwhelming the iOS accessibility capture」だが、エラー出力の `Diagnostics Log:`（runner.log）末尾にある真因は `Failed to resolve query: Application com.apple.springboard is not running`——ランナーがsnapshotのたびに `com.apple.springboard` をOS分岐なしで照会するが、tvOSにspringboardは存在しない（sim実測＋ソース由来）。
- 失敗はランナー再起動を伴い、即時リトライは再失敗しやすい（Hint原文: Re-running the same command immediately will likely wedge again）。

## 押下の消失とセッション劣化

- `tv-remote press` は成功報告のまま実効が失われることがある（sim実測で多数回）。観測された状況: AX系コマンドの失敗（ランナー再起動）直後、成功したAX系コマンドの直後、画面遷移のアニメーション中、wait textタイムアウトの直後。
- 対策: 押下→`diff screenshot` の検証をワンセットにし、`✓ Screenshots match.`（空振り）なら1秒待って1回だけ再pressする。画面遷移後は `wait <ms>` を挟んでから押す。
- 消失が頻発し、diffの結果まで不可解になったら（劣化セッション）、`close --session <name>` → `open` でセッションを張り直す。張り直し後は同じ経路の押下が全て一発で通るようになった（sim実測）。
- `screenshot --overlay-refs` はAXが取れる画面でだけ動く（`Annotated N refs`。矩形を持つ要素にref番号と枠を描画する。sim実測）。AX死画面ではsnapshotと同じエラーで失敗する——素の `screenshot` を使う。
- AXが取れた画面では `diff snapshot -i` も動くが、フォーカス移動はツリー差分に現れない（focusedメタデータ非公開のアプリでは `0 additions, 0 removals`。sim実測）——フォーカスの検証には次のピクセルdiffを使う。

## ピクセルdiffでフォーカス移動を検証する（settled diff代替）

```
agent-device screenshot <baseline.png> --session <name>
agent-device tv-remote press <direction> --session <name>
agent-device diff screenshot --baseline <baseline.png> --out <diff.png> --session <name>
```

- 空振り: `✓ Screenshots match.`（画面が変わっていない＝フォーカスが動いていない）
- 差分あり: `✗ N% pixels differ` に続き、変化領域の位置・サイズ・形状・輝度変化が構造化テキストで印字される。フォーカス移動は「darker（消灯した行）とbrighter（点灯した行）の水平バンド2領域」として現れ、diff画像を開かなくても移動元→移動先が読める（sim実測）。
- 一致・差分ありのどちらもexit 0。判定は `✓` / `✗` の出力テキストで行う（sim実測）。
- 誤爆の検知にも使える: 期待した領域以外の変化（意図しない画面遷移・付随テキストの変化）もリージョンとして列挙される。
