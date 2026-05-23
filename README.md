# dd-map

銚子の観光スポットを地図上で表示するオープンデータ公開システム。

## 構成

```
dd-map/
├── data.csv            観光スポットの実データ（GAS から自動push）
├── app/                Next.js 製の公開マップアプリ
└── .github/workflows/  GitHub Actions（Pagesへ自動デプロイ）
```

- 公開URL: <https://ichikakomiya.github.io/dd-map/>
- データ管理側: <https://github.com/IchikaKomiya/dd-map-gas>（別リポジトリのGAS）

## 開発

```sh
cd app
pnpm install
pnpm dev
```

詳細は [`app/README.md`](app/README.md) を参照。

## データ更新フロー

1. GASスプレッドシートで入力 → 取得 → 承認用へ追加
2. 承認用シートで承認チェック → 「公開マスタへ反映」
3. 「GitHub へ data.csv を push」 → ここに `data.csv` が更新される
4. GitHub Actions が自動でビルド・デプロイ
