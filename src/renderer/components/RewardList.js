const React = require('react')
const clsx = require('clsx')

const TextField = require('@material-ui/core/TextField').default
const Select = require('@material-ui/core/Select').default
const MenuItem = require('@material-ui/core/MenuItem').default

const Checkbox = require('../components/Checkbox')
const actions = require('../lib/actions').REWARDS
const { dispatch, dispatcher } = require('../lib/dispatcher')

class RewardList extends React.Component {
  render() {
    const state = this.props.state

    const total = this.computeTotal()

    const rewardItems = []
    const rewards = [...state.saved.rewards]
    const uncollected = rewards.filter((r) => !r.collected)
    const collected = rewards.filter((r) => r.collected)
    for (let r of uncollected) {
      rewardItems.push(this.renderReward(r, total))
    }
    for (let r of collected) {
      rewardItems.push(this.renderReward(r, total))
    }

    return (
      <div className='reward-list'>
        {this.renderPointSummary(total)}
        <div
          className='add-reward-button main-button'
          onClick={dispatcher(actions.ADD_REWARD, '', '', '')}
        >
          Add Reward
        </div>
        {rewardItems}
      </div>
    )
  }

  computeTotal() {
    const total = {
      bronze: 0,
      silver: 0,
      gold: 0
    }

    // Add all points from completed todo
    const todos = [...state.saved.todos]
    for (let todo of todos) {
      if (todo && todo.tagId && todo.done) {
        let tag = this.findTag(todo.tagId)
        if (tag) {
          total[tag.pointType] = total[tag.pointType] + parseInt(tag.point)
        }
      }
    }

    // Subtract points from collected rewards
    const rewards = [...state.saved.rewards]
    for (let reward of rewards) {
      if (reward.collected && reward.pointType) {
        total[reward.pointType] = total[reward.pointType] - parseInt(reward.point)
      }
    }

    return total
  }

  renderPointSummary(total) {
    return (
      <div className='point-summary holder-container'>
        <div className='ps-bronze holder'>{total.bronze}</div>
        <div className='ps-silver holder'>{total.silver}</div>
        <div className='ps-gold holder'>{total.gold}</div>
      </div>
    )
  }

  renderReward(reward, total) {
    const state = this.props.state

    const selectItems = []
    for (let pt of state.pointTypes) {
      selectItems.push(
        <MenuItem key={pt} value={pt}>{pt}</MenuItem>
      )
    }

    const rewardClass = clsx('reward-item', 'holder-container', reward.pointType)

    return (
      <div className={rewardClass}>
        <div className='ri-collected holder checkbox-holder'>
          <Checkbox
            className='checkbox'
            checked={reward.collected}
            disabled={reward.point > total[reward.pointType]}
            onChange={this.onToggleReward.bind(this, reward)}
          />
        </div>
        <div className='ri-name holder'>
          <TextField
            fullWidth
            value={reward.name}
            placeholder={"Add description"}
            onChange={this.onChangeName.bind(this, reward)}
          />
        </div>
        <div className='ri-point holder point-holder'>
          <TextField
            fullWidth
            value={reward.point}
            placeholder={"0"}
            onChange={this.onChangePoint.bind(this, reward)}
          />
        </div>
        <div className='ri-point-type holder point-type-holder'>
          <Select
            fullWidth
            className='point-type-select'
            value={reward.pointType}
            onChange={this.onSelectPointType.bind(this, reward)}
          >
            {selectItems}
          </Select>
        </div>
      </div>
    )
  }

  findTag(tagId) {
    const state = this.props.state
    return state.saved.tags[tagId]
  }

  onToggleReward(reward) {
    dispatch(actions.TOGGLE_REWARD, reward.id)
  }

  onChangeName(reward, e) {
    dispatch(actions.UPDATE_REWARD, reward.id, e.target.value, reward.point, reward.pointType)
  }

  onChangePoint(reward, e) {
    dispatch(actions.UPDATE_REWARD, reward.id, reward.name, e.target.value, reward.pointType)
  }

  onSelectPointType(reward, e) {
    dispatch(actions.UPDATE_REWARD, reward.id, reward.name, reward.point, e.target.value)
  }
}

module.exports = RewardList

