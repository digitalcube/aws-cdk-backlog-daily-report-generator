# 日報自動生成ツール（Daily Reports Generator）

このプロジェクトは、Backlogのアクティビティを自動的に分析し、AI（Amazon Bedrock）を活用して日報を生成するツールです。平日の日本時間午後7時に自動実行され、指定されたメンバーのその日の活動を要約した日報チケットを作成します。

## プロジェクト概要

- **目的**: 開発者の日々の活動を自動的に追跡し、構造化された日報を生成する
- **技術スタック**: AWS CDK (TypeScript)、AWS Lambda、Amazon Bedrock、Backlog API
- **実行頻度**: 平日の日本時間午後7時（UTC午前10時）に自動実行
- **対象**: 汎用的なBacklogプロジェクトで利用可能

## 主な機能

- Backlog APIを使用してユーザーの活動を取得
- 無意味なアクティビティをフィルタリングして実際の作業内容を抽出
- Amazon Bedrock（Nova Pro）を利用して活動内容を分析し、構造化された日報を生成
- 生成した日報をBacklogのチケットとして自動登録
- 以下の項目に整理した日報を生成:
  - 業務内容 (Fact)
  - 改善したこと・解決したこと (Keep)
  - 問題点・課題 (Problem)
  - 次のアクション (Try)

## セットアップ手順

### 前提条件

- [Node.js](https://nodejs.org/) (v14以上)
- [AWS CLI](https://aws.amazon.com/cli/)（認証済み）
- [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html)
- BacklogのAPIキー

### インストール

```bash
# リポジトリをクローン
git clone <リポジトリURL>
cd daily-reports

# 依存関係をインストール
npm install
```

### 設定ファイルの準備

1. `lambda/config.ts`を編集して、あなたのBacklogプロジェクトに合わせて設定を変更:
   - `dailyReports.projectId`: BacklogプロジェクトID
   - `dailyReports.members`: 日報を生成するメンバーの情報
   - `excludedProjectKeys`: 日報生成から除外するプロジェクトキー

2. AWS Systems Manager Parameter Storeに以下のパラメータを作成:
   - キー: `/backlog-api-key`
   - 値: JSON形式 `{"API_KEY": "あなたのBacklogAPIキー", "HOST": "あなたのBacklogホスト"}`
   - タイプ: SecureString

3. CDKをデプロイ:
```bash
npm run build
npx cdk deploy
```

## ローカル開発

### ビルドとテスト

```bash
# TypeScriptのコンパイル
npm run build

# 継続的なコンパイル（開発中）
npm run watch

# テスト実行
npm run test
```

### デプロイと更新

```bash
# スタックのデプロイ
npx cdk deploy

# デプロイされたスタックと現在の状態の比較
npx cdk diff

# CloudFormationテンプレートの出力
npx cdk synth
```

## プルリクエストの作成方法

1. 新しいブランチを作成:
```bash
git checkout -b feature/新機能の名前
```

2. 変更を実装し、コミット:
```bash
git add .
git commit -m "機能の説明"
```

3. 変更をプッシュし、プルリクエストを作成:
```bash
git push origin feature/新機能の名前
```

4. GitHubリポジトリ上でプルリクエストを作成

## カスタマイズ

- 対象メンバーや設定の変更: `lambda/config.ts`の`APP_CONFIG`オブジェクトを編集
- 日報フォーマットの変更: `lambda/backlog-daily-report.ts`のBedrockプロンプト（`system`パラメータ）を編集
- フィルターやレポート生成ロジックの変更: `lambda/daily-report-generator`ディレクトリ内のコードを修正

## 設定ファイル（config.ts）の詳細

`lambda/config.ts`では以下の設定が可能です：

- `dailyReports.projectId`: 日報チケットを作成するBacklogプロジェクトのID
- `dailyReports.members`: 日報を生成するメンバーの配列
  - `id`: BacklogユーザーID
  - `name`: 表示名
  - `parentIssueId`: 親チケットID（オプション）
  - `issueTypeId`: チケットタイプID
- `excludedProjectKeys`: 日報生成から除外するプロジェクトキーの配列
