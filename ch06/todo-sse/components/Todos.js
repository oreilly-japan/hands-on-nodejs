import { useEffect, useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'

// EventSource非対応ブラウザ向けポリフィル
import 'eventsource/lib/eventsource-polyfill'

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

// Reactコンポーネントの実装
export default function Todos(props) {
  const { title, completed } = pages[props.page]

  // コンポーネントの状態の初期化と、propsの値に応じた更新
  const [todos, setTodos] = useState([])
  useEffect(() => {
    // EventSourceを使った実装に置き換え
    const eventSource = new EventSource('/api/todos/events')
    // SSE受信時の処理
    eventSource.addEventListener('foo', console.log)
    eventSource.addEventListener('message', e => {
      console.log(e)
      if (!e.data) {
        return console.log('empty event')
      }
      const todos = JSON.parse(e.data)
      setTodos(
        typeof completed === 'undefined'
          ? todos
          : todos.filter(todo => todo.completed === completed)
      )
    })
    // エラーハンドリング
    eventSource.onerror = e => console.log('SSEエラー', e)
    // useEffectで関数を返すとコンポーネントのクリーンアップ時に実行される
    // ここでは、EventSourceインスタンスをクローズする
    return () => eventSource.close()
  }, [props.page])

  // このコンポーネントが描画するUIをJSX構文で記述して返す
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <h1>{title}</h1>
      {/* ToDo一覧の表示 */}
      <ul>
        {todos.map(({ id, title, completed }) =>
          <li key={id}>
            <span style={completed ? { textDecoration:  'line-through' } : {}}>
              {title}
            </span>
          </li>
        )}
      </ul>
      <div>{pageLinks}</div>
    </>
  )
}