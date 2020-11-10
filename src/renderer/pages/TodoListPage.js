
const React = require('react')

const TodoList = require('../components/TodoList')

module.exports = class TodoListPage extends React.Component {
  render() {
    const state = this.props.state

    return (
      <div key='todo-list-page' className='todo-list-page page'>
        <TodoList state={state} />
      </div>
    )
  }
}
