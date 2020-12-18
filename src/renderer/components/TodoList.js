const React = require('react')
const clsx = require('clsx')
const debounce = require('debounce')

const TextField = require('@material-ui/core/TextField').default
const Select = require('@material-ui/core/Select').default
const MenuItem = require('@material-ui/core/MenuItem').default
const DeleteIcon = require('@material-ui/icons/Delete').default

const Checkbox = require('../components/Checkbox')
const { dispatcher, dispatch } = require('../lib/dispatcher')
const actions = require('../lib/actions').TODO_LIST
const confirmationActions = require('../lib/actions').CONFIRMATION

class TodoItem extends React.Component {
  render() {
    const todo = this.props.todo
    const tag = findTag(this.props.state, todo.tagId)
    const itemClass = clsx('todo-list-item', 'holder-container', tag && tag.pointType)
    return (
      <div key={todo.id} className={itemClass}>
        <div className='holder checkbox-holder'>
          <Checkbox 
            className='checkbox'
            checked={todo.done} 
            onChange={this.onToggleTodo.bind(this, todo)} 
          />
        </div>
        <div className='holder name-holder'>
          <TextField 
            fullWidth
            value={todo.name} 
            placeholder={"Add description"} 
            onChange={this.onChangeName.bind(this, todo)}
          />
        </div>
        {this.renderTag(todo)}
        <div className='holder delete-action-holder'>
          <DeleteIcon onClick={this.onClickDeleteTodo.bind(this, todo)}></DeleteIcon>
        </div>
      </div>
    )
  }

  renderTag(todo) {
    const state = this.props.state

    const tags = state.saved.tags
    const tag = findTag(this.props.state, todo.tagId)
    let tagEls = []
    
    // Build select items
    let selectItems = []
    for (var t of tags) {
      if (t) {
        selectItems.push(
          <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
        )
      }
    }

    tagEls.push(
      <div className='holder tag-select-holder'>
        <Select
          fullWidth
          className='tag-select'
          value={tag && tag.id}
          onChange={this.onSelectTag.bind(this, todo)}
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

  onSelectTag(todo, e) {
    dispatch(actions.UPDATE_TODO, todo.id, todo.name, e.target.value)
  }

  onChangeName(todo, e) {
    dispatch(actions.UPDATE_TODO, todo.id, e.target.value, todo.tagId)
  }

  onToggleTodo(todo) {
    dispatch(actions.TOGGLE_TODO, todo.id)
  }

  onClickDeleteTodo(todo) {
    dispatch(confirmationActions.SHOW, 'Are you sure you want to delete this task?', () => dispatch(actions.DELETE_TODO, todo.id))
  }
}

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
      todoItems.push(<TodoItem state={state} todo={todo} />)
    }
    for (let todo of complete) {
      todoItems.push(<TodoItem state={state} todo={todo} />)
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

  todoSortFn(a, b) {
    const ta = findTag(this.props.state, a.tagId)
    const tb = findTag(this.props.state, b.tagId)
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
}

function findTag(state, tagId) {
  const tag = state.saved.tags[tagId]
  return tag
}

const updateTodoName = debounce((todo, e) => {
  dispatch(actions.UPDATE_TODO, todo.id, e.target.value, todo.tagId)
}, 1000)

module.exports = TodoList
