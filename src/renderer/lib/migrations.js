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
