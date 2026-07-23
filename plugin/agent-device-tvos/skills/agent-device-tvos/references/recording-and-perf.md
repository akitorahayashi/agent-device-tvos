# 録画とパフォーマンス証跡

重い成果物（mp4・memgraph等）は中身をcontextに流し込まず、パスとサイズだけ扱う。

## 能力マトリクス

```tsv
コマンド	可否
screenshot	可（sim=1920x1080 @1x 固定 / device=1920x1080と3840x2160の間で揺れる。visual-truth.md）
screenshot --pixel-density <n>	sim=可（--pixel-density 2 で 3840x2160 @2x。tvOS simも「iOS-family simulators」に含まれる）/ device=不可（実測原文: Error (UNSUPPORTED_OPERATION): --pixel-density is currently supported only on iOS-family simulators）
screenshot --max-size <px>	可（800 指定で 800x450）
record start/stop（画面録画）	可（sim=press を挟まない区間で正常な QuickTime mp4 / device=press を挟んだ区間でも正常な mp4 を実測。4.3秒・3840x2160）
perf metrics（memory/cpu/startup）	sim=可（residentMemoryKb・usagePercent・open往復のstartup）/ device=perf metrics の出力はフレーム健全性のみで memory/cpu は現れなかった（実測1回）
perf metrics / perf frames の fps	sim=不可（available=false、reason: Apple frame-health sampling is currently available only on connected iOS devices.）/ device=可（実測原文: Frame health: dropped 0% (0/170 frames) window 21s）
perf memory snapshot --kind memgraph	sim=システムアプリでは不可（下記）・ユーザーアプリ未検証 / device=不可（原文: Memory artifact (memgraph): unavailable - Physical iOS device memgraph capture is not exposed through reliable local agent-device tooling. exit 0）
audio probe	sim=可（ホスト音声capture。下記）/ device=不可（原文: Error (UNSUPPORTED_OPERATION): audio is supported for web browser sessions, macOS sessions, iOS simulators, and Android emulators on macOS hosts）
```

特記なき行は sim実測（tvOS 26.2 シミュレータ）。device の結果は行内に明記する。

## 録画の作法

- `record start <path> --scope app` → 操作 → `record stop`。録画は内蔵XCUITestランナー経由なので、録画区間には操作を挟まず画面の自己アニメーションを録るのが安全（sim実測に基づく注意。実機ではpressを挟んだ区間でも正常なmp4が生成された）。押下を含む録画は区間を短く切り、`record stop` のexit codeと成果物の再生可否（duration・寸法）で実態を確認する。
- mp4はバイナリなので `device-runs/<purpose>/` に出力しても追跡しない（`.gitignore`が`*`）。

## perf の注意

- fps（フレーム健全性）は環境で割れる: tvOS simは最初から `available: false`（実測）で証跡が採れない。実機は `Frame health: dropped N% (n/m frames) window Ns` が返る（実測）——フレーム健全性の証跡が要るときだけ実機を使う。
- `perf memory snapshot --kind memgraph` はシステムアプリに対して失敗する: `Error (COMMAND_FAILED): Failed to capture Apple memgraph for <bundle-id>: leaks[...]: leaks cannot examine process ... try running with `sudo`.`（sim実測: 設定アプリ）。対象アプリ自身のプロセスがhostのleaksで検査可能なことが前提で、ユーザーアプリでの可否は未検証。

## audio probe（sim実測）

- `audio probe start [秒] [bucketMs]` → `stop` で dBFS バケット（`rmsDbfs`/`peakDbfs`）と `heard` を返す。無音は -90 dBFS。
- 計測対象はアプリ内部音声ではなく、macOSのScreenCaptureKit経由で拾うホストのシステム音声（`backend=macos-screencapturekit source=system-audio`）。他のホストアプリの音も混入する——アプリ固有音の証跡としては使えない。
- macOSの画面収録（Screen Recording）権限が必要。未許可だと `audio probe requires Screen Recording permission on macOS` で失敗する。

## 画面回転（rotate）

- tvOSは回転を持たない。`rotate <orientation>` は `Error (UNSUPPORTED_OPERATION): rotate is not supported on this device`（Hint: `This command is not available for the selected platform/device.`）で拒否される（sim実測）。
