# Assets

## Art direction

明るく読みやすい2Dランナー画面を基調とする。空色、ティール、草緑、アンバー、コーラルを用い、プレイヤー・障害物・収集物・パワーアップは背景から明確に分離される高コントラストのシルエットにする。遠景は青系、地面と前景は緑・土色、危険物はコーラル、収集物はアンバー、保護効果はシアンで表現する。

## Visual reference

| 種別 | ファイル | 用途 |
|---|---|---|
| プレイ画面の参照 | `design/expanded-runner-visual-reference.png` | 背景のレイヤー構成、配色、オブジェクトの相対サイズ、HUDの視認性を確認するための視覚基準 |

## Reference image prompt

> Create a polished in-game screenshot reference for a 2D side-scrolling endless runner intended for a modern browser game. Composition: 16:9 gameplay view. A cheerful minimal stick-figure runner in a bright teal jacket and amber sneakers runs at the left third of the screen, jumping above a small red triangular spike. Visible game objects: one wooden crate obstacle near center, one small round gold coin floating above the ground, one blue shield power-up orb farther right, a small friendly bird obstacle high in the sky. Environment: clean layered side-scrolling background with pale blue sky, soft rounded white clouds, distant navy-blue mountains, green pine silhouettes, grassy ground with a warm earth cross-section, and a few foreground flowers. HUD in the upper corners should only use simple abstract dark translucent panels and icon placeholders, with no readable text. Style: crisp high-quality 2D vector-inspired game art, strong readable silhouettes, accessible contrast, warm and optimistic palette of sky blue, teal, navy, grass green, amber, and coral. Clean sharp digital rendering, direct side-on camera, no device frame, no logo, no watermark, no photorealism, no dense text.

## Implementation note

GitHub Pages向けの静的Canvas実装を維持するため、プレイ中の主要要素は外部画像に依存せずCanvas図形として描画する。参照画像は配色・密度・シルエットの基準として用い、外部ホスティングやアセット読込失敗を起こさないようにする。
