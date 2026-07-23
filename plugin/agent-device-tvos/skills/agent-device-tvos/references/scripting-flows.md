# batchフロー

`batch [--steps <json> | --steps-file <path>] [--on-error stop] [--max-steps <n>]` は複数コマンドを1つのdaemonリクエストで実行する。tv-remoteのステップもそのまま乗る（実測: simは1ステップ200ms台。実機も2ステップ目以降は300ms台だが、初回ステップはランナーのウォームアップで約18秒かかった）。

## ステップ書式

正書式は `{"command": "<name>", "input": {...}}`:

```json
[
  {"command": "tv-remote", "input": {"button": "down"}},
  {"command": "wait", "input": {"durationMs": 800}},
  {"command": "screenshot", "input": {"path": "device-runs/<purpose>/step.png"}},
  {"command": "tv-remote", "input": {"button": "select"}}
]
```

- tv-remoteのinputは `button`（必須。up|down|left|right|select|menu|home|back）と `durationMs`（任意）。
- waitのinputは durationMs / text / ref / selector / stable のちょうど1つ。違反はバリデーションが正確に案内する: `Error (INVALID_ARGS): Batch step N wait input is invalid: wait command requires exactly one of durationMs, text, ref, selector, or stable.`（sim実測）
- `positionals` / `flags` 形式も動くがdeprecated: `Warning: batch steps using positionals/flags are deprecated and will be removed in the next major version. Use {"command":"...","input":{...}} steps instead.`。`args` フィールドは受理されない: `Error (INVALID_ARGS): Batch step N has unknown legacy field(s): args.`（sim実測）
- 出力は `Batch completed: N/N steps in <ms>` とステップ別の OK/所要ms。`--on-error stop` で失敗時に停止する。

## 運用

- フローは `/tmp` ではなく `device-runs/<purpose>/flow.json` に置き、screenshotステップの出力も同じディレクトリへ向ける（レシピと成果物の同居）。
- batch内のtv-remoteステップにも押下消失リスクはある前提で（visual-truth.md）、要所にscreenshotステップを挟み、実行後に検証できる形にする。
- replay（.adリプレイファイル）はtvOSでは未検証。フローの再現はbatchを既定にする。
