# 🏃 Endless Runner - 2D Web Game

ブラウザで遊べる2Dエンドレスランナーゲームです。棒人間を操作して障害物を避けながら、できるだけ長く生き延びましょう!

## 🎮 ゲーム概要

横スクロールのエンドレスランナーゲームです。自動で走り続ける棒人間キャラクターを操作して、迫りくる障害物をジャンプで回避します。障害物に接触するとゲームオーバーです。

## ✨ 特徴

- **3つの難易度**: イージー、ノーマル、ハードから選択可能
- **シンプルな操作**: クリック/タップ/Enterキーでジャンプ
- **PC/スマホ対応**: レスポンシブデザインでどのデバイスでも快適にプレイ
- **軽量**: 外部ライブラリ不要、Canvas APIのみで実装

## 🕹️ 遊び方

### 操作方法

- **PC**: マウスクリック または Enterキー
- **スマホ/タブレット**: 画面タップ

### 難易度の違い

| 難易度 | 初期速度 | 障害物の頻度 | 加速率 |
|--------|----------|--------------|--------|
| イージー | 遅い | 低い | 緩やか |
| ノーマル | 標準 | 標準 | 標準 |
| ハード | 速い | 高い | 急激 |

### ゲームの流れ

1. タイトル画面で難易度を選択
2. ゲーム開始
3. ジャンプで障害物を回避
4. 障害物に接触するとゲームオーバー
5. リトライまたはタイトルへ戻る

## 🚀 プレイ方法

### オンラインでプレイ

GitHub Pagesで公開しています:
[https://[ユーザー名].github.io/endless-runner-game/](https://[ユーザー名].github.io/endless-runner-game/)

### ローカルで実行

1. リポジトリをクローン:
```bash
git clone https://github.com/[ユーザー名]/endless-runner-game.git
cd endless-runner-game
```

2. ローカルサーバーを起動:
```bash
# Python 3を使用する場合
python3 -m http.server 8000

# Node.jsを使用する場合
npx http-server
```

3. ブラウザで開く:
```
http://localhost:8000
```

## 📁 ファイル構成

```
endless-runner-game/
├── index.html      # メインHTMLファイル
├── styles.css      # スタイルシート
├── main.js         # ゲームロジック
└── README.md       # このファイル
```

## 🛠️ 技術スタック

- **HTML5**: Canvas API
- **CSS3**: レスポンシブデザイン
- **JavaScript**: バニラJS (ライブラリ不要)

## 📝 実装の詳細

### ゲームループ

`requestAnimationFrame`を使用した滑らかなゲームループを実装しています。

### 当たり判定

矩形の衝突判定を使用し、プレイヤーと障害物の接触を検出します。

### 難易度調整

難易度に応じて以下のパラメータが変化します:
- ゲーム速度
- 速度の加速率
- 障害物の出現頻度

## 🎨 カスタマイズ

`main.js`の`difficultySettings`オブジェクトを編集することで、難易度のパラメータを調整できます:

```javascript
const difficultySettings = {
    easy: {
        initialSpeed: 4,
        speedIncrement: 0.001,
        obstacleSpawnRate: 0.008,
        label: 'イージー'
    },
    // ...
};
```

## 🐛 既知の問題

現在、既知の問題はありません。バグを見つけた場合は、Issuesでお知らせください。

## 📄 ライセンス

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🤝 貢献

プルリクエストを歓迎します! 大きな変更の場合は、まずIssueを開いて変更内容を議論してください。

## 📧 お問い合わせ

質問や提案がある場合は、GitHubのIssuesでお知らせください。

---

**楽しんでプレイしてください! 🎮✨**
