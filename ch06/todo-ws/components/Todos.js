import { useEffect, useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
// import io from 'socket.io-client'

// 各ページに関する情報の定義
const pages = {
  index: { title: 'すべてのToDo' },
  active: { title: '未完了のToDo', completed: false },
  completed: { title: '完了したToDo', completed: true }
}
// CSRでページを切り替えるためのリンク
const pageLinks = Object.keys(pages).map((page, index) =>
  <Link href={`/${page === 'index' ? '' : page}`} key={index}>
    <a style={{ marginRight: 10 }}>{pages[page].title}</a>
  </Link>
)

export default function Todos(props) {
  const { title, completed } = pages[props.page]
  const [todos, setTodos] = useState([])

  // socketをstateとして保持
  const [socket, setSocket] = useState()

  useEffect(() => {
    // socketの生成
    // const socket = io('/todos')
    const socket = new WebSocket('ws://localhost:3000')
    // socket.on('todos', todos => {
    socket.addEventListener('message', message => {
      const todos = JSON.parse(message.data)
      setTodos(
        typeof completed === 'undefined'
          ? todos
          : todos.filter(todo => todo.completed === completed)
      )
    })
    setSocket(socket)
    // コンポーネントのクリーンアップ時にsocketをクローズ
    return () => socket.close()
  }, [props.page])

  // JSX
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <h1>{title}</h1>
      <label>
        新しいTodoを入力
        <input onKeyPress={e => {
          if (socket.readyState !== WebSocket.OPEN) {
            return
          }
          // Enterキーが押されたらToDoを登録する
          const title = e.target.value
          if (e.key !== 'Enter' || !title) {
            return
          }
          e.target.value = ''
          socket.send(JSON.stringify({ type: 'createTodo', data: title }))
        }}/>
      </label>
      {/* ToDo一覧 */}
      <ul>
        {todos.map(({ id, title, completed }) =>
          <li key={id}>
            <label style={completed ? { textDecoration: 'line-through' } : {}}>
              <input
                type="checkbox"
                checked={completed}
                onChange={e =>
                  socket.readyState === WebSocket.OPEN &&
                  socket.send(JSON.stringify({
                    type: 'updateCompleted',
                    data: { id, completed: e.target.checked }
                  }))
                }
              />
              {title}
            </label>
            <button onClick={() =>
              socket.readyState === WebSocket.OPEN &&
              socket.send(JSON.stringify({ type: 'deleteTodo', data: id }))}
            >削除</button>
          </li>
        )}
      </ul>
      <div>{pageLinks}</div>
    </>
  )
}