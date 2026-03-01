# 🍳 レシピ管理アプリ

スマホ対応のレシピ管理Webアプリです。**データはすべてブラウザのlocalStorageに保存**されるため、サーバーやDBの設定不要です。

## 機能

| 機能 | 説明 |
|------|------|
| レシピ一覧 | カードグリッド（スマホ1列 / PC 2〜3列） |
| 横断検索 | 料理名・材料名・タグ・手順・メモをリアルタイム絞り込み |
| URLから取り込み | Claude AI がレシピページを自動解析して材料・手順を抽出 |
| 手動入力 | 料理名・人数・時間・タグ・材料・手順・メモ・写真 |
| 写真保存 | base64 に圧縮してlocalStorageに保存 |
| 倍量計算 | ×0.5 〜 ×4 で材料量をリアルタイム変換 |
| 削除 | 確認ダイアログ付き |

---

## セットアップ

### 1. 依存関係インストール

```bash
cd recipe-app
npm install
```

### 2. 環境変数の設定

`.env.local` を編集して Anthropic API キーを入力してください。

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

> `ANTHROPIC_API_KEY` はサーバーサイドの API ルートで使用されます。
> ブラウザには露出しません。

### 3. 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いて動作確認できます。

---

## データ保存について

| 項目 | 仕様 |
|------|------|
| 保存場所 | ブラウザ localStorage |
| データ形式 | JSON |
| 写真 | base64（JPEG 72%品質・最大幅900px に自動圧縮） |
| 容量制限 | ブラウザにより異なる（一般的に 5〜10 MB） |
| データ永続性 | ブラウザデータを消去するまで保持 |

### 注意
- ブラウザのキャッシュ・Cookie を全消去するとデータが失われます
- 端末間でのデータ共有は非対応です
- 写真を多数登録する場合は localStorage の容量に注意してください

---

## 検索仕様

検索バーに入力するとリアルタイムで絞り込みが行われます。
以下の項目を横断して検索します：

- 🍳 **料理名**
- 🥕 **材料名**（例：「キャベツ」で絞り込み可）
- 🏷️ **タグ**
- 📋 **手順テキスト**
- 📝 **メモ**

---

## URLからの取り込みについて

1. 「＋ 追加」→「URLから取り込む」タブでURLを入力
2. 「レシピを取り込む」をタップ
3. Claude AI（claude-sonnet-4-0）がページHTMLを解析
4. 抽出結果が「手動入力」タブに自動反映される
5. 内容を確認・修正して「レシピを保存」

> **ANTHROPIC_API_KEY** が未設定の場合、URLからの取り込みは使用できません。
> 手動入力タブは API キー不要で使用できます。

---

## 技術スタック

| 技術 | 用途 |
|------|------|
| Next.js 15 (App Router) | フレームワーク |
| TypeScript | 型安全 |
| Tailwind CSS v4 | スタイリング |
| localStorage | データ永続化 |
| Canvas API | 写真圧縮（base64） |
| Anthropic API | URLからのレシピ自動抽出 |
| Noto Serif JP | フォント |

---

## ディレクトリ構成

```
recipe-app/
├── app/
│   ├── layout.tsx              # ルートレイアウト・フォント設定
│   ├── globals.css             # グローバルCSS
│   ├── page.tsx                # レシピ一覧・検索
│   ├── recipes/[id]/page.tsx   # レシピ詳細・倍量スライダー
│   └── api/extract-recipe/     # Claude API ルート（サーバーサイド）
├── components/
│   ├── RecipeCard.tsx          # レシピカード
│   └── AddRecipeModal.tsx      # 追加モーダル（URL・手動入力）
├── lib/
│   ├── types.ts                # 型定義（Recipe, Ingredient）
│   └── storage.ts              # localStorage CRUD・検索・画像圧縮
└── .env.local                  # 環境変数（ANTHROPIC_API_KEY を設定）
```
