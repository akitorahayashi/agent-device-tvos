# アプリの配置（インストール／確認）

- インストール済みアプリの確認は `agent-device apps --session <name>`。既定はユーザーインストールのアプリのみで、`--all` でシステムアプリも含む（実測）。ランナー（`...uitests.xctrunner`）と対象アプリのbundle idをここで確認できる（実機ではランナーもユーザーインストール扱いで一覧に載る。device実測）。
- インストールは `install <path>`（または `install <app> <path>`）、再インストールは `reinstall <app> <path>`。tvOS向け.appの実際のインストールは未検証（シミュレータへの配置はXcodeビルドで行われるのが通常のため）。
- 起動は `open <bundle-id>`（コアループ）。起動直後は無内容フレームになりうるので、キャプチャ前に `wait` を挟む（visual-truth.md）。
