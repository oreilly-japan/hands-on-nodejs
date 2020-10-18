'use strict'
module.exports = {
  // アプリケーションに関する設定
  // アプリケーションは複数管理できるため、配列になっている
  apps: [
    {
      // PM2で管理されるアプリケーション名
      name: 'APP',
      // 実行されるスクリプト
      script: 'app.js',
      // スクリプトに渡される引数
      args: 'one two',
      // インスタンス数
      instances: 0,
      // アプリケーション実行時の環境変数
      env: {
        NODE_ENV: 'development'
      },
      // "--env production"オプション付きでのアプリケーション起動時の環境変数
      env_production: {
        NODE_ENV: 'production'
      }
    },
    // 2つ目以降のアプリケーションの設定
  ],
  // デプロイに関する設定
  // 環境ごとに異なる設定を記述できるため、
  // 環境名をプロパティ名とするオブジェクトになっている
  deploy: {
    production: {
      // デプロイに使用するSSHユーザー名
      user: 'node',
      // デプロイ先ホスト（配列で複数のホストを指定することも可能）
      host: '212.83.163.1',
      // デプロイ対象のGitブランチ
      ref: 'origin/master',
      // デプロイ対象のGitリポジトリ
      repo: 'git@github.com:repo.git',
      // ソースコードをgit cloneするデプロイ先ホストのパス
      path: '/var/www/production',
      // デプロイ後にデプロイ先で実行するコマンド
      'post-deploy': 'npm install && ' +
        'pm2 reload ecosystem.config.js --env production'
    },
    // その他の環境へのデプロイの設定
  }
}