const nanoid = require('nanoid').nanoid

const actions = require('../lib/actions')
const { dispatch, dispatcher } = require('../lib/dispatcher')

module.exports = class RewardsController {
  constructor(state) {
    this.state = state
  }

  addReward(name, point, pointType) {
    const reward = {
      id: nanoid(),
      name: name,
      point: point,
      pointType: pointType,
      collected: false
    }
    this.state.saved.rewards.unshift(reward)
    dispatch(actions.STATE_SAVE)
    dispatcher(actions.UPDATE)
  }

  updateReward(id, name, point, pointType) {
    const reward = this._findReward(id)
    reward.name = name
    reward.point = point
    reward.pointType = pointType
    dispatch(actions.STATE_SAVE)
    dispatcher(actions.UPDATE)
  }

  toggleReward(id) {
    const reward = this._findReward(id)
    reward.collected = !reward.collected
    dispatch(actions.STATE_SAVE)
    dispatcher(actions.UPDATE)
  }

  _findReward(id) {
    return this.state.saved.rewards.find((r) => r.id == id)
  }
}
