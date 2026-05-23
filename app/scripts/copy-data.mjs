// root の data.csv を public/data.csv へコピー（Next.js が dev/build時に配信できるように）
// 単一の真実: リポジトリ root の data.csv（GASがpushする本番ファイル）

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

// app/ がCWDなので、root の data.csv は ../data.csv
const src = "../data.csv";
const dst = "public/data.csv";

if (!existsSync(src)) {
  console.warn(`[copy-data] ${src} が見つかりません。スキップします。`);
  process.exit(0);
}

mkdirSync(dirname(dst), { recursive: true });
copyFileSync(src, dst);
console.log(`[copy-data] ${src} -> ${dst}`);
