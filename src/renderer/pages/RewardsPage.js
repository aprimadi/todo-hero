const React = require('react')

const RewardList = require('../components/RewardList')

module.exports = class RewardsPage extends React.Component {
  render() {
    return (
      <div key='rewards-page' className='rewards-page'>
        <RewardList state={this.props.state} />
      </div>
    )
  }
}
