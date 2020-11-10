const path = require('path')

const APP_NAME = 'TodoHero'
const APP_TEAM = 'TodoHero, LLC'
const APP_VERSION = require('../package.json').version

module.exports = {
  APP_COPYRIGHT: `Copyright © 2020-${new Date().getFullYear()} ${APP_TEAM}`,
  APP_ICON: path.join(__dirname, '..', 'static', 'todo-hero'),
  APP_NAME,
  APP_TEAM,
  APP_VERSION,
  APP_WINDOW_TITLE: APP_NAME,

  ROOT_PATH: path.join(__dirname, '..'),
  STATIC_PATH: path.join(__dirname, '..', 'static'),

  WINDOW_MAIN: 'file://' + path.join(__dirname, '..', 'static', 'main.html')
}
