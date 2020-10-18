'use strict'
const http = require('http')
const next = require('next')
const WebSocket = require('ws')

let todos = [
  { id: 1, title: 'ネーム', completed: false },
  { id: 2, title: '下書き', completed: true }
]

// IDの値を管理するための変数
let id = 2

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })

nextApp.prepare().then(
  () => {
    // Next.jsのリクエストハンドラを引数にhttp.createServer()を実行
    const server = http.createServer(nextApp.getRequestHandler()).listen(3000)
    // WebSocket.Serverインスタンスを生成
    const ws = new WebSocket.Server({ server })
    // 接続中の全クライアントに現在のToDo一覧を送信する関数
    function sendTodosToOpenClient() {
      ws.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(todos))
        }
      })
    }
    ws.on('connection', socket => {
      console.log('connected')
      // 接続したクライアントにToDo一覧を送信
      socket.send(JSON.stringify(todos))

      // 接続したクライアントからの各種イベントに対応
      socket.on('message', message => {
        const { type, data } = JSON.parse(message)
        switch(type) {
          // ToDo作成
          case 'createTodo': {
            const title = data
            if (typeof title !== 'string' || !title) {
              return
            }
            const todo = { id: id += 1, title, completed: false }
            todos.push(todo)
            return sendTodosToOpenClient()
          }
          // ToDoのcompletedの更新
          case 'updateCompleted': {
            const { id, completed } = data
            todos = todos.map(todo =>
              todo.id === id ? { ...todo, completed } : todo
            )
            return sendTodosToOpenClient()
          }
          // ToDo削除
          case 'deleteTodo': {
            const id = data
            todos = todos.filter(todo => todo.id !== id)
            return sendTodosToOpenClient()
          }
        }
      })
    })
  },
  err => {
    console.error(err)
    process.exit(1)
  }
)
