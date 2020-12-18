const semver = require('semver')
const config = require('../../config')

module.exports = {
  run
}

// Change `state.saved` (which will be saved back to config.json on exit) as
// needed, for example to deal with config.json format changes across versions
function run(state) {
  if (!semver.valid(state.saved.version)) {
    state.saved.version = '0.0.0'
  }

  const version = state.saved.version
  const saved = state.saved
  
  // Run migrations if any
  if (semver.lt(version, '0.0.3')) migrate_0_0_3(saved)
  if (semver.lt(version, '0.0.4')) migrate_0_0_4(saved)

  // Config is now on the new version
  state.saved.version = config.APP_VERSION
}

function migrate_0_0_3(saved) {
  // Reserve 0-index slot
  saved.tags.unshift(null)

  // Assign a different id
  const map = {}
  for (let i = 1; i < saved.tags.length; i++) {
    const tag = saved.tags[i]
    map[tag.id] = i
    tag.id = i
  }

  // Re-assign todo tagId
  for (let todo of saved.todos) {
    if (todo && map[todo.tagId]) {
      todo.tagId = map[todo.tagId]
    }
  }
}

function migrate_0_0_4(saved) {
  const keyFromTimestamp = function(timestamp) {
    const d = new Date(timestamp)
    const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d)
    const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d)
    const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d)
    return `${ye}-${mo}-${da}`
  }

  const findTag = function(tagId) {
    const tag = saved.tags[tagId]
    return tag
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

  const addIndexEntry = function(todo) {
    let key = "incomplete"
    if (todo.completedAt) {
      key = keyFromTimestamp(todo.completedAt)
    }

    const todosIndex = saved.todosIndex
    todosIndex[key] = todosIndex[key] || []

    const tag = findTag(todo.tagId)
    let idx = 0
    if (tag) {
      // Find insert index
      while (idx < todosIndex[key].length) {
        const _id = todosIndex[key][idx]
        const _todo = saved.todos[_id]
        const _tag = findTag(_todo.tagId)
        if (before(tag, _tag)) {
          break
        }
        idx++
      }
    }
    todosIndex[key].splice(idx, 0, todo.id)
  }

  // Reserve 0-index slot
  saved.todos.unshift(null)

  // Assign each todo item a different id
  for (let i = 1; i < saved.todos.length; i++) {
    const todo = saved.todos[i]
    if (todo) {
      todo.id = i

      if (todo.done) {
        todo.completedAt = + new Date()
      }
    }
  }

  // Build index
  saved.todosIndex = { "incomplete": [] }
  for (let i = 1; i < saved.todos.length; i++) {
    const todo = saved.todos[i]
    if (todo) {
      addIndexEntry(todo)
    }
  }
}

