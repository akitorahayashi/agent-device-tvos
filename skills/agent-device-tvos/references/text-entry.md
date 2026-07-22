# テキスト入力（リニアキーボード）

tvOSのテキスト入力は、テキストフィールドをselectで開いて全画面のリニアキーボード画面に入ってから行う。フォーム上のフィールドに直接typeしても入らない。

## 手順（sim実測）

1. フォーカスをテキストフィールドに合わせ、`tv-remote press select` でキーボード画面を開く（画面全体がキーボードUIに切り替わる）。
2. `type "<text>"` で入力する。出力は `Typed N chars`。表示中のキー配列（かな等）に関係なくラテン文字がそのまま入る。
3. 入力値の確認は `wait text "<入力した文字列>"`（表面読み）か screenshot。
4. `tv-remote press back` でキーボード画面を閉じてフォームへ戻る（入力値はフィールドに残る）。

- フォーム画面のフォーカス済みフィールドへ直接 `type` すると `Error (XCTEST_RECORDED_FAILURE): XCTest recorded a failure while executing type; the action may not have been performed.` になり入力されない（sim実測）。このエラーはランナー再起動を伴うため、直後の押下は消失しうる（visual-truth.md）。
- `fill '<selector>' "<text>"` はセレクタ解決（AXツリー）を要するため、AXが不安定な場面ではsnapshotと同じ「overwhelming」エラーで失敗する（sim実測。動作可否は未確定）。入力は select→type の経路に統一するのが安全。

## keyboard / clipboard コマンド（tvOSでは使えない）

- `keyboard status` / `keyboard get` / `keyboard dismiss` はすべて `Error (UNSUPPORTED_OPERATION): keyboard is not supported on this device`（sim実測。capabilitiesのkeyboard=falseと一致）。キーボードの開閉はselect（開く）とback（閉じる）で行う。
- `clipboard write` / `clipboard read` はtvOS simで `Error (COMMAND_FAILED): Failed to write iOS simulator clipboard: Unable to connect to device pasteboard.` になる（sim実測。capabilitiesには載っているが実際は接続に失敗する）。クリップボード経由の入力戦術は使えない——typeで直接入力する。実機での挙動は未検証。
