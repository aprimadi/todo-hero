const React = require('react')

const Tabs = require('@material-ui/core/Tabs').default
const Tab = require('@material-ui/core/Tab').default

const { dispatch } = require('../lib/dispatcher')
const actions = require('../lib/actions').NAVS
const routes = require('../lib/routes')

class Nav extends React.Component {
  onChangeTab(e, url) {
    dispatch(actions.GO_TO_PAGE, url)
  }
  
  render() {
    const loc = this.props.state.location

    return (
      <div className='nav'>
        <Tabs 
          value={loc.url()}
          onChange={this.onChangeTab}
          variant="fullWidth"
          aria-label="Navbar"
        >
          <Tab value={routes.HOME} label="Todo List" />
          <Tab value={routes.REWARDS} label="Rewards" />
          <Tab value={routes.TAGS} label="Tags" />
        </Tabs>
      </div>
    )
  }
}

module.exports = Nav
