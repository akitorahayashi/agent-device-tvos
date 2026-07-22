# 画面外目標へのフォーカス走査

tvOSにはタッチ入力が無く、画面外の目標へは方向キーの有限ループで近づく。

## 到達判定つき走査ループ

1. 目標の存在確認: `wait text "<目標>"`（部分一致・bare）。表面読みは画面外へスクロールアウトした項目にもマッチした実測がある（sim実測: 設定の長リスト）——成功すれば走査する価値がある。遅延生成のリストで画面外まで含むかは未検証。
2. `screenshot <base.png>` → `tv-remote press down` → `diff screenshot --baseline <base.png>` を繰り返す（最大N回で打ち切る有限ループ）。
   - `✗ N% pixels differ`: フォーカスが動いた。明暗バンド領域のy座標がフォーカス行の現在地を示す。
   - `✓ Screenshots match.`: 端に到達（もう動かない）。ただしAX系コマンドの直後は押下消失の可能性があるため、1回だけ再押下して再判定する（visual-truth.md）。
3. 目標行への到達は、diffのbrighterバンドが目標行の位置に現れたこと、またはscreenshotの目視で確認する。

- グレーアウト（無効）行はフォーカスがスキップする（sim実測: 設定リスト）。押下回数を行数から見積もらない。

## スクロール系コマンドを使わない理由

- `scroll down` はスクロール可能なリストではフォーカスを1行動かす（down押下と同等の変化をdiffで実測）。スクロール不能な画面では成功報告のまま何も起きない（sim実測）——press downの下位互換であり、走査はtv-remoteに統一する。
- 二指ジェスチャは非対応: `Error (UNSUPPORTED_OPERATION): pinch is not supported on this device`（Hint原文: `tvOS has no touch input — this gesture is supported on Android and the iOS simulator only.`）（sim実測）。
- `gesture swipe` はAXスナップショット経路に入り、AXが取れない局面では「overwhelming the iOS accessibility capture」で失敗した（sim実測）。タッチ合成が無い前提（ソース由来: `src/contracts/apple-multitouch-support.ts`）と合わせ、swipeに走査を頼らない。
