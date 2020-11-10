const State = require('./lib/state')
State.load(onState)

const React = require('react')
const ReactDOM = require('react-dom')
const createGetter = require('fn-getter')

const config = require('../config')

const App = require('./pages/App')

const actions = require('./lib/actions')

// Yo-yo pattern: state object lives here and percolates down thru all the views.
// Events come back up from the views via dispatch(...)
require('./lib/dispatcher').setDispatch(dispatch)

// From dispatch(...), events are sent to one of the controllers
let controllers = null

// All state lives in state.js, `state.saved` is read from and written to a file.
// All other state is ephemeral. First we load state.saved then initialize the app.
let state

// Root React component
let app

// Called once when the application loads. (Not once per window).
function onState(err, _state) {
  if (err) return onError(err)

  // Make available for easier debugging
  state = window.state = _state
  window.dispatch = dispatch
  
  controllers = {
    navs: createGetter(() => {
      const NavsController = require('./controllers/NavsController')
      return new NavsController(state)
    }),
    todoList: createGetter(() => {
      const TodoListController = require('./controllers/TodoListController')
      return new TodoListController(state)
    }),
    rewards: createGetter(() => {
      const RewardsController = require('./controllers/RewardsController')
      return new RewardsController(state)
    }),
    tags: createGetter(() => {
      const TagsController = require('./controllers/TagsController')
      return new TagsController(state)
    }),
  }

  // Add first page to location history
  state.location.go({
    url: 'home',
    setup: (cb) => {
      state.window.title = config.APP_WINDOW_TITLE
      cb(null)
    }
  })

  // Initialize ReactDOM
  app = ReactDOM.render(<App state={state} />, document.querySelector('#body'))

  const resizeFn = function() {
    state.window.size.width = window.innerWidth
    state.window.size.height = window.innerHeight
    dispatch(actions.UPDATE)
  }
  window.addEventListener('resize', resizeFn)
  resizeFn()
}

function onError(err) {
  console.error(err.stack || err)
  state.errors.push({
    time: new Date().getTime(),
    message: err.message || err
  })

  update()
}

// React loop:
// 1. update() - recompute the virtual DOM, diff, apply to the real DOM
// 2. event - might be a click or other DOM event, or something external
// 3. dispatch - the event handler calls dispatch(), main.js sends it to a controller
// 4. controller - the controller handles the event, changing the state object
function update() {
  app.setState(state)
  updateElectron()
}

// Some state changes can't be reflected in the DOM, instead we have to
// tell the main process to update the window or OS integrations
function updateElectron() {
}

const dispatchHandlers = {
  // navs
  [actions.NAVS.GO_TO_PAGE]: (url) => controllers.navs().goToPage(url),

  // todoList
  [actions.TODO_LIST.ADD_TODO]: (name, tagId) => controllers.todoList().addTodo(name, tagId),
  [actions.TODO_LIST.UPDATE_TODO]: (id, name, tagId) => controllers.todoList().updateTodo(id, name, tagId),
  [actions.TODO_LIST.TOGGLE_TODO]: (id) => controllers.todoList().toggleTodo(id),

  // tags
  [actions.TAGS.ADD_TAG]: (name, point, pointType) => controllers.tags().addTag(name, point, pointType),
  [actions.TAGS.UPDATE_TAG]: (id, name, point, pointType) => controllers.tags().updateTag(id, name, point, pointType),
  [actions.TAGS.DELETE_TAG]: (id) => controllers.tags().deleteTag(id),

  // rewards
  [actions.REWARDS.ADD_REWARD]: (name, point, pointType) => controllers.rewards().addReward(name, point, pointType),
  [actions.REWARDS.UPDATE_REWARD]: (id, name, point, pointType) => controllers.rewards().updateReward(id, name, point, pointType),
  [actions.REWARDS.TOGGLE_REWARD]: (id) => controllers.rewards().toggleReward(id),
  [actions.REWARDS.DELETE_REWARD]: (id) => controllers.rewards().deleteReward(id),

  [actions.STATE_SAVE]: () => State.save(state),
  [actions.STATE_SAVE_IMMEDIATE]: () => State.saveImmediate(state),

  [actions.UPDATE]: () => {}, // No-op, just trigger an update
}

function dispatch(action, ...args) {
  // Log dispatch calls, for debugging, but don't spam
  // if (![actions.UPDATE].includes(action)) {
    console.log('dispatch: %s %o', action, args)
  // }

  const handler = dispatchHandlers[action]
  if (handler) {
    handler(...args)
  } else {
    console.error('Missing dispatch handler: ' + action)
  }

  update()
}
