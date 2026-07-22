# デバイスの発見と指定

- agent-device >= 0.19.1 が必要（`agent-device --version`）。
- tvOSデバイスの一覧は `agent-device devices --platform ios --target tv`。出力は1行1デバイス:

```
Apple TV (ios simulator target=tv) booted=true
dev02 (ios device target=tv) booted=true
```

- `ios simulator` / `ios device` の別と `booted` がここで読める。シミュレータはXcodeのシミュレータランタイム、実機はネットワーク/USB接続のApple TVが載る。
- セッション開設（最初の `open`）では `--platform ios --target tv --device <名前>` を全て明示する。実機とシミュレータが同時に見える環境では、`--device` を省くと意図しないデバイスに繋がりうる。
- `--device` はデバイス名のみを受ける。UDIDは `Error (DEVICE_NOT_FOUND): No device named <udid>` になる（sim実測）。
- シミュレータは署名envなしで動く（sim実測）。実機で必要になるランナー署名・端末信頼は runner-signing.md / device-trust.md（実機検証後に執筆）。
- デバイスが見つからない・unavailableのときは `doctor` でデバイス在庫（`✓ device: N Apple tv devices available; M booted.`）とツールチェーンを確認する（sessions-and-diagnostics.md）。
