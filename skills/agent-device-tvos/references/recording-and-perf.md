# 録画とパフォーマンス証跡

重い成果物（mp4・memgraph等）は中身をcontextに流し込まず、パスとサイズだけ扱う。

## 能力マトリクス

```tsv
コマンド	可否
screenshot	可（1920x1080 @1x 既定）
screenshot --pixel-density <n>	sim=可（--pixel-density 2 で 3840x2160 @2x。tvOS simも「iOS-family simulators」に含まれる）/ device=未検証
screenshot --max-size <px>	可（800 指定で 800x450）
record start/stop（画面録画）	可（press を挟まない区間で正常な QuickTime mp4 を確認）
perf metrics（memory/cpu/startup）	可（residentMemoryKb・usagePercent・open往復のstartup）
perf metrics / perf frames の fps	不可（available=false、reason: Apple frame-health sampling is currently available only on connected iOS devices.）
perf memory snapshot --kind memgraph	システムアプリでは不可（下記）。ユーザーアプリは未検証
audio probe	sim=可（ホスト音声capture。下記）/ device=未検証
```

いずれも sim実測（tvOS 26.2 シミュレータ）。実機Apple TVでは未検証。

## 録画の作法

- `record start <path> --scope app` → 操作 → `record stop`。録画は内蔵XCUITestランナー経由なので、録画区間には操作を挟まず画面の自己アニメーションを録るのが安全。押下を含む録画が必要なら区間を短く切り、`record stop` のexit codeと成果物の再生可否で実態を確認する。
- mp4はバイナリなので `device-runs/<purpose>/` に出力しても追跡しない（`.gitignore`が`*`）。

## perf の注意

- fpsはtvOS simでは最初から `available: false`（sim実測）。フレーム健全性の証跡はsimでは採れない。
- `perf memory snapshot --kind memgraph` はシステムアプリに対して失敗する: `Error (COMMAND_FAILED): Failed to capture Apple memgraph for <bundle-id>: leaks[...]: leaks cannot examine process ... try running with `sudo`.`（sim実測: 設定アプリ）。対象アプリ自身のプロセスがhostのleaksで検査可能なことが前提で、ユーザーアプリでの可否は未検証。

## audio probe（sim実測）

- `audio probe start [秒] [bucketMs]` → `stop` で dBFS バケット（`rmsDbfs`/`peakDbfs`）と `heard` を返す。無音は -90 dBFS。
- 計測対象はアプリ内部音声ではなく、macOSのScreenCaptureKit経由で拾うホストのシステム音声（`backend=macos-screencapturekit source=system-audio`）。他のホストアプリの音も混入する——アプリ固有音の証跡としては使えない。
- macOSの画面収録（Screen Recording）権限が必要。未許可だと `audio probe requires Screen Recording permission on macOS` で失敗する。
