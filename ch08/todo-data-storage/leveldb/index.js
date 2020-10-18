'use strict'
const level = require('level')
const { join } = require('path')
// 同じディレクトリ内のleveldbディレクトリにデータベースの状態を保存
const db = level(join(__dirname, 'leveldb'))
exports.fetchAll = async () => {
  const result = []
  for await (const v of db.createValueStream({ gt: 'todo:', lt: 'todo;' })) {
    result.push(JSON.parse(v))
  }
  return result
}
exports.fetchByCompleted = async completed => {
  const promises = []
  for await (const id of db.createValueStream({
    // 二次インデックスの検索
    gt: `todo-completed-${completed}:`,
    lt: `todo-completed-${completed};`
  })) {
    promises.push(
      db.get(`todo:${id}`).then(value => JSON.parse(value))
    )
  }
  return Promise.all(promises)
}
exports.create = todo => db.batch()
  // ToDoの保存
  .put(`todo:${todo.id}`, JSON.stringify(todo))
  // 二次インデックスの保存
  .put(`todo-completed-${todo.completed}:${todo.id}`, todo.id)
  .write()
exports.update = (id, update) =>
  db.get(`todo:${id}`).then(
    content => {
      const oldTodo = JSON.parse(content)
      const newTodo = {
        ...oldTodo,
        ...update
      }
      let batch = db.batch().put(`todo:${id}`, JSON.stringify(newTodo))
      // completedの値が変化した場合は、二次インデックスも操作する
      if (oldTodo.completed !== newTodo.completed) {
        batch = batch
          .del(`todo-completed-${oldTodo.completed}:${id}`)
          .put(`todo-completed-${newTodo.completed}:${id}`, id)
      }
      return batch.write().then(() => newTodo)
    },
    // ToDoが存在しない場合はnullを返し、それ以外はそのままエラーにする
    err => err.notFound ? null : Promise.reject(err)
  )
exports.remove = id =>
  db.get(`todo:${id}`).then(
    content => db.batch()
      .del(`todo:${id}`)
      .del(`todo-completed-true:${id}`)
      .del(`todo-completed-false:${id}`)
      .write()
      .then(() => id),
    // ToDoが存在しない場合はnullを返し、それ以外はそのままエラーにする
    err => err.notFound ? null : Promise.reject(err)
  )
