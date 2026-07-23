# 視覚真実による状態把握（screenshot / diff）

tvOSではAXスナップショットが画面依存で失敗するため、screenshotとそのピクセル比較が状態把握の既定ルートになる。

## screenshot

- `screenshot <path>` はAXの生死に関係なく動く。解像度は環境で割れる: simは1920x1080 @1x固定（実測）、実機は1920x1080と3840x2160の間で揺れる（device実測: ランナー起動直後の1枚目が1920x1080、以後は3840x2160）。
- 実機の解像度の揺れは `diff screenshot` の比較不能（`✗ Screenshots have different dimensions: expected 1920x1080, got 3840x2160`）につながる——diffのbaselineは押下の直前に毎回撮り直し、古いキャプチャをbaselineに流用しない（device実測）。
- `open` 直後は起動遷移中の無内容フレームになりうる（sim実測）。1枚目が真っ黒・無内容なら撮り直す。

## AXスナップショットの生死

- `snapshot -i` の生死は環境と画面で割れる。simでは不安定で頻繁に失敗する（実測）: 傾向として要素数の少ないカスタムモーダルでは安定して成功（7ノード）し、リスト画面・ホーム画面では失敗が多い。ただし決定的ではない——同一画面・同種のAXコマンドが失敗した後に成功へ転じた実測がある。実機は静的画面なら安定して成功する（device実測: 49ノードのリスト画面・設定ルート含め8/8）が、動画マストヘッドがアニメーション中の画面では失敗する（device実測: runner.logの真因はアプリ要素照会 `Find the Application '<bundle-id>'` の約9秒での失敗。エラー表面はsimと同じ「overwhelming」で、`iOS runner was already restarted during this request and "snapshot" still failed` としてランナー再起動コストを払う）。手順はどちらでも成立するようAXに依存させずに組み、取れたら補助として使う。
- 成功時のキャプチャは遅い: simはp95約17秒、実機は1回7〜9秒（実測。「ios snapshots are slow in this run」の警告付き）。`wait stable` はこの停滞で `wait timed out waiting for a stable UI` になり実用にならない（sim実測）。
- simのエラー表面は「The current screen is overwhelming the iOS accessibility capture」だが、エラー出力の `Diagnostics Log:`（runner.log）末尾にある真因は `Failed to resolve query: Application com.apple.springboard is not running`——ランナーがsnapshotのたびに `com.apple.springboard` をOS分岐なしで照会するが、tvOSにspringboardは存在しない（sim実測＋ソース由来）。実機でもこの照会は毎回失敗してrunner.logに同じ行が残るが、キャプチャは巻き添えにならず成功する（device実測: 失敗が致命になるのはsimのみ）。
- simでの失敗はランナー再起動を伴い、即時リトライは再失敗しやすい（Hint原文: Re-running the same command immediately will likely wedge again）。
- snapshotが返すのはセッションアプリのツリーであり、画面の実態ではない。ホーム画面へ退出した直後でもバックグラウンドのアプリのツリーが成功で返る（device実測）——いま何が映っているかの判定は必ずscreenshotで行う。

## 押下の消失とセッション劣化

- `tv-remote press` は成功報告のまま実効が失われることがある（sim実測で多数回）。観測された状況: AX系コマンドの失敗（ランナー再起動）直後、成功したAX系コマンドの直後、画面遷移のアニメーション中、wait textタイムアウトの直後。実機では約20押下（ランナー再起動直後の押下3回以上を含む）で消失を一度も観測していない（device実測）——ただし検証をワンセットにする手順は実機でも変えない。
- 対策: 押下→`diff screenshot` の検証をワンセットにし、`✓ Screenshots match.`（空振り）なら1秒待って1回だけ再pressする。画面遷移後は `wait <ms>` を挟んでから押す。
- 消失が頻発し、diffの結果まで不可解になったら（劣化セッション）、`close --session <name>` → `open` でセッションを張り直す。張り直し後は同じ経路の押下が全て一発で通るようになった（sim実測）。
- `screenshot --overlay-refs` はAXが取れる画面でだけ動く（`Annotated N refs`。矩形を持つ要素にref番号と枠を描画する。実測）。AX死画面ではsnapshotと同じエラーで失敗する——素の `screenshot` を使う。
- AXが取れた画面では `diff snapshot -i` も動くが、フォーカス移動はツリー差分に現れない（`0 additions, 0 removals`。実測: focusedメタデータを公開する実機の設定アプリでも、[focused]マーカーの移動は差分として数えられない）——フォーカスの検証には次のピクセルdiffを使う。

## ピクセルdiffでフォーカス移動を検証する（settled diff代替）

```
agent-device screenshot <baseline.png> --session <name>
agent-device tv-remote press <direction> --session <name>
agent-device diff screenshot --baseline <baseline.png> --out <diff.png> --session <name>
```

- 空振り: `✓ Screenshots match.`（画面が変わっていない＝フォーカスが動いていない）
- 差分あり: `✗ N% pixels differ` に続き、変化領域の位置・サイズ・形状・輝度変化が構造化テキストで印字される。フォーカス移動は「darker（消灯した行）とbrighter（点灯した行）の水平バンド2領域」として現れ、diff画像を開かなくても移動元→移動先が読める（実測）。
- 一致・差分ありのどちらもexit 0。判定は `✓` / `✗` の出力テキストで行う（実測）。
- 自己アニメーションする画面（回転バナー・動画マストヘッド）では、フォーカスが動いていなくてもアニメーション領域が差分として列挙される（device実測）——期待領域以外の差分をフォーカス移動と誤読しない。
- 誤爆の検知にも使える: 期待した領域以外の変化（意図しない画面遷移・付随テキストの変化）もリージョンとして列挙される。
