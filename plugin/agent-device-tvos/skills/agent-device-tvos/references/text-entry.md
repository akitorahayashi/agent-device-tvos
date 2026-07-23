# テキスト入力（リニアキーボード）

tvOSのテキスト入力は、テキストフィールドをselectで開いて全画面のリニアキーボード画面に入ってから行う。フォーム上のフィールドに直接typeしても入らない。

## 手順（実測）

1. フォーカスをテキストフィールド／キーボードに合わせる。全画面リニアキーボードのアプリはフィールドを `tv-remote press select` で開く（sim実測）。検索画面等にキーボードがインライン表示されるアプリは、方向キーでキーボード行へフォーカスを入れるだけでよい（device実測）。
2. `type "<text>"` で入力する。出力は `Typed N chars`。表示中のキー配列（かな等）に関係なくラテン文字がそのまま入る。
3. 入力値の確認は `wait text` / `find "<入力した文字列>" exists`（表面読み）か screenshot。
4. `tv-remote press back` でキーボード画面を閉じてフォームへ戻る（入力値はフィールドに残る）。

- 実機では入力が成功していても `Error (TEXT_ENTRY_MISMATCH): text entry verification failed: expected "<プレースホルダ+入力値>", observed "<入力値>"` が返ることがある（device実測: フィールドのAX値にプレースホルダ文言が混入して自動検証が誤判定する。実際には `find "<入力値>" exists` → `Found: true`）——このエラーは表面読みで実入力を確認してから判断する。
- フォーカスがフィールド／キーボード上にない状態で `type` すると `Error (XCTEST_RECORDED_FAILURE): XCTest recorded a failure while executing type; the action may not have been performed.` になり入力されない（実測: sim・device同一原文）。このエラーはランナー再起動を伴うため、直後の押下は消失しうる（visual-truth.md）。
- `fill` の挙動はtvOSで一貫しない。セレクタ形式 `fill '<selector>' "<text>"` はAXツリー解決に依存し、simではsnapshotと同じ「overwhelming」エラー、または一致しないセレクタで `Error (NO_MATCH): selector did not match an element` になる（sim実測）。AXが生きている実機でも実在の検索フィールドに対して `Error (COMMAND_FAILED): Ref @eN is off-screen and not safe to fill` で拒否された（device実測）。座標形式 `fill <x> <y> "<text>"` はフィールド上の点で `Filled N chars` を返すが（sim実測）、実効の可視確認が非決定的で証跡にならない。入力は フォーカス→type の経路に統一し、fillは使わない。

## keyboard / clipboard コマンド（tvOSでは使えない）

- `keyboard status` / `keyboard get` / `keyboard dismiss` はすべて `Error (UNSUPPORTED_OPERATION): keyboard is not supported on this device`（実測: sim・device同一原文。capabilitiesのkeyboard=falseと一致）。キーボードの開閉はselect（開く）とback（閉じる）で行う。
- `clipboard write` / `clipboard read` はtvOSでは両環境とも使えないが、失敗面が割れる: simは `Error (COMMAND_FAILED): Failed to write iOS simulator clipboard: Unable to connect to device pasteboard.`（実測）、実機は `Error (UNSUPPORTED_OPERATION): clipboard is not supported on this device`（実測）。クリップボード経由の入力戦術は使えない——typeで直接入力する。
