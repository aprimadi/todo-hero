const nanoid = require('nanoid').nanoid

const actions = require('../lib/actions')
const { dispatch, dispatcher } = require('../lib/dispatcher')

module.exports = class TodoListController {
  constructor(state) {
    this.state = state
  }

  addTodo(name, tagId) {
    const todo = {
      id: nanoid(), 
      name: name, 
      tagId: tagId,
      done: false
    }
    this.state.saved.todos.unshift(todo)
    dispatch(actions.STATE_SAVE)
    dispatcher(actions.UPDATE)
  }

  updateTodo(id, name, tagId) {
    const todo = this.state.saved.todos.find((t) => t.id == id)
    todo.name = name
    todo.tagId = tagId
    dispatch(actions.STATE_SAVE)
    dispatcher(actions.UPDATE)
  }

  toggleTodo(id) {
    const todo = this.state.saved.todos.find((t) => t.id == id)
    todo.done = !todo.done
    dispatch(actions.STATE_SAVE)
    dispatcher(actions.UPDATE)
  }

  deleteTodo(id) {
    this.state.saved.todos = this.state.saved.todos.filter((t) => t.id != id)
    dispatch(actions.STATE_SAVE)
    dispatcher(actions.UPDATE)
  }
}
