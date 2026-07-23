# URLオープンとディープリンク

- `open <bundle-id>` はアプリ起動・フォアグラウンド復帰に使う（コアループ）。`open <url>` はURLのハンドラアプリに委ねられる。
- tvOSにはブラウザが無いため、httpsのURLは開き先が無い。失敗面は環境で割れる: simは `Error (COMMAND_FAILED): Simulator device failed to open https://... .` で失敗し（実測）、実機は開けないURLでも `Opened: <url>` と成功報告して何も起きない（device実測: https・未登録カスタムスキームとも）。iOSのようにSafariへ逃がす経路は存在しない。
- したがって実機では `Opened: <url>` は遷移の証明にならない（tv-remote pressの成功報告と同型の罠）。ディープリンクの実効は必ず screenshot / `wait text` で着地画面を検証する。
- アプリ登録スキームのURLも同様に受理される（device実測: `Opened:` が返る）。着地の実効はアプリ側のパス・パラメータ解釈に依存し、受理されても可視遷移が起きないことがある（device実測）。
- 登録スキームの初回オープンではOSの確認ダイアログが挟まる（sim実測: `"<アプリ名>" で開きますか?` の開く/キャンセル）。フォーカス済みの「開く」を `tv-remote press select` で決定すると着地する。一度許可すると以降は再インストールをまたいでも直接着地する（sim実測）。着地の確認は着地画面のナビゲーションタイトルを `wait text` で待つのが安定（プレースホルダ文字列はAXに現れず待てない）。
