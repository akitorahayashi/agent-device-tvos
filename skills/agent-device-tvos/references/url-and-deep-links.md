# URLオープンとディープリンク

- `open <bundle-id>` はアプリ起動・フォアグラウンド復帰に使う（コアループ）。`open <url>` はURLのハンドラアプリに委ねられる。
- tvOSにはブラウザが無いため、httpsのURLは開けない: `Error (COMMAND_FAILED): Simulator device failed to open https://... .`（sim実測）。iOSのようにSafariへ逃がす経路は存在しない。
- ハンドラ未登録のカスタムスキームも同じ形で失敗する: `Error (COMMAND_FAILED): Simulator device failed to open <scheme>://... .`（sim実測）。
- 対象アプリが自前のURLスキームを登録している場合の画面直行は未検証。試すときは `open "<scheme>://<path>"` → `wait text` / screenshot で着地画面を検証する。
