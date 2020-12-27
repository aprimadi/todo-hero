class TodoStore {
  constructor(state) {
    this.state = state
  }
  
  /**
   * @return todo items
   */
  items() {
    const todayKey = this._indexKeyFromTimestamp(+ new Date())
    let todayIds = this.state.saved.todosIndex[todayKey] || []
    let incomplete = []
    let complete = []
    // Add incomplete items
    for (let id of this.state.saved.todosIndex["incomplete"]) {
      incomplete.push(this.state.saved.todos[id])
    }
    // Add today items
    for (let id of todayIds) {
      complete.push(this.state.saved.todos[id])
    }
    return incomplete.concat(complete)
  }

  /**
   * @return todo item
   */
  find(id) {
    return this.state.saved.todos[id]
  }

  add(attrs) {
    const todo = Object.assign({ id: this.state.saved.todos.length }, attrs)
    this.state.saved.todos.push(todo)
    this._addIndexEntry(todo)
  }

  update(id, attrs) {
    const todo = this.find(id)
    const old = Object.assign({}, todo)
    Object.assign(todo, attrs)
    if (todo.completedAt != old.completedAt) {
      this._deleteIndexEntry(old)
      this._addIndexEntry(todo)
    }
  }

  toggle(id) {
    const todo = this.find(id)
    if (todo.done) {
      this.update(id, {
        done: false,
        completedAt: null,
      })
    } else {
      this.update(id, {
        done: true,
        completedAt: + new Date(),
      })
    }
  }

  remove(id) {
    const todo = this.state.saved.todos[id]
    this._deleteIndexEntry(todo)
    this.state.saved.todos[id] = null
  }

  _deleteIndexEntry(todo) {
    const indexKey = this._indexKey(todo)
    this.state.saved.todosIndex[indexKey] = this.state.saved.todosIndex[indexKey].filter((x) => x != todo.id)
  }

  _addIndexEntry(todo) {
    const indexKey = this._indexKey(todo)
    const todosIndex = this.state.saved.todosIndex
    const tag = findTag(this.state, todo.tagId)
    let idx = 0
    if (tag) {
      todosIndex[indexKey] = todosIndex[indexKey] || []
      // Find insert index
      while (idx < todosIndex[indexKey].length) {
        const _id = todosIndex[indexKey][idx]
        const _todo = this.state.saved.todos[_id]
        const _tag = findTag(this.state, _todo.tagId)
        if (before(tag, _tag)) {
          break
        }
        idx++
      }
    }
    todosIndex[indexKey].splice(idx, 0, todo.id)
  }

  _indexKey(todo) {
    const timestamp = todo.completedAt
    if (timestamp) {
      return this._indexKeyFromTimestamp(timestamp)
    } else {
      return "incomplete"
    }
  }

  _indexKeyFromTimestamp(timestamp) {
    const d = new Date(timestamp)
    const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d)
    const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d)
    const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d)
    return `${ye}-${mo}-${da}`
  }
}

const TAG_VALUE = {
  bronze: 1,
  silver: 2,
  gold: 3,
}
// Does tag a should come before b?
function before(a, b) {
  const tva = TAG_VALUE[a && a.pointType] || 4
  const tvb = TAG_VALUE[b && b.pointType] || 4
  return (tvb - tva <= 0)
}

function findTag(state, tagId) {
  const tag = state.saved.tags[tagId]
  return tag
}

module.exports = TodoStore
