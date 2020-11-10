const React = require('react')
const createGetter = require('fn-getter')

const green = require('@material-ui/core/colors/green').default
const grey = require('@material-ui/core/colors/grey').default

const { createMuiTheme, ThemeProvider } = require('@material-ui/core/styles')

const Nav = require('../components/Nav')
const TodoListPage = require('./TodoListPage')
const RewardsPage = require('./RewardsPage')
const TagsPage = require('./TagsPage')
const routes = require('../lib/routes')

const Views = {
  [routes.HOME]: createGetter(() => TodoListPage),
  [routes.REWARDS]: createGetter(() => RewardsPage),
  [routes.TAGS]: createGetter(() => TagsPage),
}

const fontFamily = process.platform == 'win32'
  ? '"Segoe UI", sans-serif'
  : 'BlinkMacSystemFont, "Helvetica Neue", Helvetica, sans-serif'

// lightBaseTheme.palette.primary1Color = grey[0] 
// lightBaseTheme.palette.primary2Color = grey[0]
// lightBaseTheme.palette.primary3Color = grey[50]
// lightBaseTheme.palette.accent1Color = green[200]
// lightBaseTheme.palette.accent2Color = green[400]
// lightBaseTheme.palette.accent3Color = green[100]
// lightBaseTheme.palette.textColor = grey[600]
// lightBaseTheme.palette.secondaryTextColor = grey[600]
// lightBaseTheme.palette.alternateTextColor = grey[600]

const theme = createMuiTheme({
  palette: {
    primary: {
      light: grey[400],
      main: grey[600],
      dark: grey[800],
    },
    secondary: {
      light: green[200],
      main: green[400],
      dark: green[600],
    }
  }
})

class App extends React.Component {
  render() {
    const state = this.props.state

    const appStyle = {
      width: state.window.size.width,
      height: state.window.size.height,
    }

    return (
      <ThemeProvider theme={theme}>
        <div className='app' style={appStyle}>
          <Nav state={state} />
          <div key='content' className='content'>{this.getView()}</div>
        </div>
      </ThemeProvider>
    )
  }

  getView() {
    const state = this.props.state
    const View = Views[state.location.url()]()
    return (<View state={state} />)
  }
}

module.exports = App

