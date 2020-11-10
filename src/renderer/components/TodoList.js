const React = require('react')
const clsx = require('clsx')

const TextField = require('@material-ui/core/TextField').default
const Select = require('@material-ui/core/Select').default
const MenuItem = require('@material-ui/core/MenuItem').default

const Checkbox = require('../components/Checkbox')
const { dispatcher, dispatch } = require('../lib/dispatcher')
const actions = require('../lib/actions').TODO_LIST

class TodoList extends React.Component {
  render() {
    const state = this.props.state

    const todoItems = []
    var todos = [...state.saved.todos]
    let incomplete = todos.filter((t) => !t.done)
    let complete = todos.filter((t) => t.done)
    incomplete.sort(this.todoSortFn.bind(this))
    complete.sort(this.todoSortFn.bind(this))
    for (let todo of incomplete) {
      todoItems.push(this.renderTodo(todo))
    }
    for (let todo of complete) {
      todoItems.push(this.renderTodo(todo))
    }
    
    return (
      <div className='todo-list'>
        <div 
          className='add-todo-button main-button'
          onClick={dispatcher(actions.ADD_TODO, '', null)}
        >
          Add Todo
        </div>
        <div className='scrollable-content'>
          {todoItems}
        </div>
      </div>
    )
  }

  renderTodo(todo) {
    const tag = this.findTag(todo.tagId)
    const itemClass = clsx('todo-list-item', 'holder-container', tag && tag.pointType)
    return (
      <div key={todo.id} className={itemClass}>
        <div className='holder checkbox-holder'>
          <Checkbox 
            className='checkbox'
            checked={todo.done} 
            onChange={this.onToggleTodo.bind(this, todo.id)} 
          />
        </div>
        <div className='holder name-holder'>
          <TextField 
            fullWidth
            value={todo.name} 
            placeholder={"Add description"} 
            onChange={this.onChangeName.bind(this, todo.id)}
          />
        </div>
        {this.renderTodoTag(todo)}
      </div>
    )
  }

  renderTodoTag(todo) {
    const state = this.props.state

    const tags = state.saved.tags
    const tag = this.findTag(todo.tagId)
    let tagEls = []
    
    // Build select items
    let selectItems = []
    for (var t of tags) {
      selectItems.push(
        <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
      )
    }

    tagEls.push(
      <div className='holder tag-select-holder'>
        <Select
          fullWidth
          className='tag-select'
          value={tag && tag.id}
          onChange={this.onSelectTag.bind(this, todo.id)}
        >
          {selectItems} 
        </Select>
      </div>
    )

    if (tag) {
      tagEls.push(
        <div className='holder tag-point-holder'>
          <div className='tag-point'>{tag.point}</div>
        </div>
      )
    } else {
      tagEls.push(
        <div className='holder tag-point-holder'>
          <div className='tag-point'>&nbsp;</div>
        </div>
      )
    }

    return tagEls
  }

  todoSortFn(a, b) {
    const ta = this.findTag(a.tagId)
    const tb = this.findTag(b.tagId)
    const p = {
      bronze: 1,
      silver: 2,
      gold: 3
    }
    if (ta && tb) {
      return p[tb.pointType] - p[ta.pointType]
    } else {
      return 0
    }
  }

  findTodo(todoId) {
    const state = this.props.state
    const todo = state.saved.todos.find((t) => t.id == todoId)
    return todo
  }

  findTag(tagId) {
    const state = this.props.state
    const tag = state.saved.tags.find((t) => t.id == tagId)
    return tag
  }

  onSelectTag(todoId, e) {
    const todo = this.findTodo(todoId)
    dispatch(actions.UPDATE_TODO, todo.id, todo.name, e.target.value)
  }

  onChangeName(todoId, e) {
    const todo = this.findTodo(todoId)
    dispatch(actions.UPDATE_TODO, todo.id, e.target.value, todo.tagId)
  }

  onToggleTodo(todoId) {
    const todo = this.findTodo(todoId)
    dispatch(actions.TOGGLE_TODO, todo.id)
  }
}


module.exports = TodoList
