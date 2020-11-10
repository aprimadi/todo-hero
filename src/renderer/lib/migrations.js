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
  
  // Run migrations if any

  // Config is now on the new version
  state.saved.version = config.APP_VERSION
}
