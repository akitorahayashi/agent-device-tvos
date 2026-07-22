# 値の読み取りと待機（wait / find / get / is）

tvOSでは読み取り系コマンドが2つの経路に分かれ、AXツリーが取れない局面での生死が異なる（sim実測）:

```tsv
経路	コマンド	AXツリーが取れない局面での挙動
表面読み（軽量）	wait text	全実測で動いた（snapshotが死ぬ画面でも成功）
中間	find	動くことが多いが、AX系と同じ「overwhelming」エラーで死んだ実測もある（不安定）
AXツリー	snapshot / get text / get attrs / is / --overlay-refs / diff snapshot	不安定（失敗しやすいが、同一画面で成功に転じることもある）
```

## wait

- `wait text "<text>"` はbareで使う。部分一致で、成功は無出力・exit 0。snapshotが死ぬ画面でも動く（sim実測）。
- マッチ範囲は可視領域に限らない: 画面外へスクロールアウトした項目にも成功した実測がある（sim実測: 設定の長リスト）。「見えている」の確認には使えない——可視・フォーカスの確認はscreenshot/diffで行う（visual-truth.md）。
- 数値の位置引数はテキストへ折り込まれる: `wait text "場所" 500 8000` は「場所 500」というテキストを探し `wait timed out for text: 場所 500` になる（sim実測）——quietMs/timeoutMsを位置引数で渡さない。
- タイムアウト出力に `Current surface: <画面ラベルの列挙>` が印字されることがある——今どの画面に居るかの当たり付けとして読める。ただし印字は毎回ではない（sim実測）——表面のダンプ手段として当てにしない。
- `wait <ms>`（純粋な待機）は常に動く。`wait stable` はAXキャプチャ停滞でタイムアウトするため使わない（visual-truth.md）。

## find

- `find <locator|text> <action> [--first|--last]` 形式。存在確認は `find "<text>" exists`（出力は `Found: true`）。snapshotが死ぬ画面で動いた実測もあるが、AX系と同じ「overwhelming」エラーで死んだ実測もある（不安定）——存在確認は `wait text` を第一候補にする。
- 複数一致は `Error (AMBIGUOUS_MATCH): find matched N elements for any "<text>"`。`--first` / `--last` で解消する。
- アクションを省略するとtapを試みる。tvOSのtapはフォーカス済み要素の内側限定のため `Error (UNSUPPORTED_OPERATION): tap is supported on tvOS only when the requested point is inside the focused element` になる（sim実測）——tvOSでfindを押下に使わない。読み取り用途では必ず `exists` 等のアクションを明示し、押下はtv-remoteで行う（focus-and-remote.md）。

## get / is（AXツリー系・不安定）

- `get text <selector>` はラベル文字列を返す。`get attrs <selector>` は rect（画面座標）・enabled・type・ref 等のJSONを返す——rectはフォーカス走査の当たり付けにも使える。
- `is <predicate> <selector>` の失敗出力 `actual={"visible":...,"editable":...,"selected":...,"focused":...}` は属性実値の読み出しに流用できる。focusedの信頼性は focus-and-remote.md。
- labelのみのselectorは `Error (AMBIGUOUS_MATCH): selector matched multiple elements` になりやすい。roleを付けて絞る。
- この系統の失敗はツールの非対応ではない: 同一画面・同一コマンドが「overwhelming the iOS accessibility capture」で失敗した後、成功に転じた実測がある。失敗時の真因確認とリトライ作法は visual-truth.md に従う。
