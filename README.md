# 家ッス！信州 モデルハウス来場分析

- `index.html` : 画面（固定）。`data.json` を読み込んで表示
- `data.json` : 個人情報（氏名・住所・連絡先）を除いた集計データ。毎朝6時(JST)にGitHub Actionsが更新
- `scripts/build_data.js` : スプレッドシートのCSV → data.json
