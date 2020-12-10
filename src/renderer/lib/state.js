const appConfig = require('application-config')('TodoHero')
const { EventEmitter } = require('events')

const config = require('../../config')

const debounce = require('debounce')

const SAVE_DEBOUNCE_INTERVAL = 1000

const State = module.exports = Object.assign(new EventEmitter(), {
  load,
  // state.save() calls are rate-limited. Use state.saveImmediate() to skip limit.
  save: function() {
    // Perf optimization: Lazy-require debounce (and it's dependencies)
    const debounce = require('debounce')

    // After first State.save() invocation, future calls go straight to the
    // debounced function
    State.save = debounce(saveImmediate, SAVE_DEBOUNCE_INTERVAL)
    State.save(...arguments)
  },
  saveImmediate
})

function getDefaultState() {
  const LocationHistory = require('location-history')

  return {
    /*
     * Temporary state disappears once the program exits.
     */
    location: new LocationHistory(),
    window: {
      size: { width: 800, height: 600 }, /* { width, height } */
      isFocused: true,
      isFullScreen: false,
      title: config.APP_WINDOW_TITLE
    },
    pointTypes: ['bronze', 'silver', 'gold'],
    confirmationDialog: {
      show: false,
      text: "",
      onConfirm: () => {}, 
      onCancel: () => {},
    },

    /*
     * Saved state is read from and written to a file every time the app runs.
     * It should be simple and minimal and must be JSON.
     * It must never contain absolute paths since we have a portable app.
     *
     * Config path:
     *
     * Mac                  ~/Library/Application Support/TodoHero/config.json
     * Linux (XDG)          $XDG_CONFIG_HOME/TodoHero/config.json
     * Linux (Legacy)       ~/.config/TodoHero/config.json
     * Windows (> Vista)    %LOCALAPPDATA%/TodoHero/config.json
     * Windows (XP, 2000)   %USERPROFILE%/Local Settings/Application Data/TodoHero/config.json
     *
     * Also accessible via `require('application-config')('TodoHero').filePath`
     */
    saved: {},
  }
}

/* If the saved state file doesn't exist yet, here's what we use isntead */
function setupStateSaved() {
  const saved = {
    todos: [],
    rewards: [],
    tags: [],
  }

  return saved
}

async function load(cb) {
  let saved = await appConfig.read()

  if (!saved || !saved.version) {
    console.log('Missing config file: Creating new one')
    try {
      saved = setupStateSaved()
    } catch (err) {
      onSavedState(err)
      return
    }
  }

  onSavedState(null, saved)

  function onSavedState(err, saved) {
    if (err) return cb(err)
    const state = getDefaultState()
    state.saved = saved

    if (process.type == 'renderer') {
      // Perf optimization: Save require() calls in the main process
      const migrations = require('./migrations')
      migrations.run(state)
    }

    cb(null, state)
  }
}

// Write state.saved to the JSON state file
async function saveImmediate(state, cb) {
  console.log('Saving state to ' + appConfig.filePath)

  // Clean up, so that we're not saving any pending state
  const copy = Object.assign({}, state.saved)
  
  try {
    await appConfig.write(copy)
    State.emit('stateSaved')
  } catch (err) {
    console.error(err)
  }
}
