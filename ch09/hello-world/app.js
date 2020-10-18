'use strict'
require('express')()
  .get('/', (req, res) => res.send('Hello world'))
  // 環境変数で指定されたポート（指定されなかった場合は3000）でlisten
  .listen(process.env.PORT || 3000)