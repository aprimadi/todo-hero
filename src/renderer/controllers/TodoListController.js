const actions = require('../lib/actions')
const { dispatch, dispatcher } = require('../lib/dispatcher')

module.exports = class TodoListController {
  constructor(state) {
    this.state = state
  }

  addTodo(name, tagId) {
    this.state.todoStore.add({
      name: name, 
      tagId: tagId, 
      done: false,
      completedAt: null,
    })
    dispatch(actions.STATE_SAVE)
    dispatcher(actions.UPDATE)
  }

  updateTodo(id, name, tagId) {
    this.state.todoStore.update(id, {
      name: name,
      tagId: tagId,
    })
    dispatch(actions.STATE_SAVE)
    dispatcher(actions.UPDATE)
  }

  toggleTodo(id) {
    this.state.todoStore.toggle(id)
    dispatch(actions.STATE_SAVE)
    dispatcher(actions.UPDATE)
  }

  deleteTodo(id) {
    this.state.todoStore.remove(id)
    dispatch(actions.STATE_SAVE)
    dispatcher(actions.UPDATE)
  }
}
