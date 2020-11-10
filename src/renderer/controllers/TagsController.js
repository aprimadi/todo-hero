const nanoid = require('nanoid').nanoid

const actions = require('../lib/actions')
const { dispatch, dispatcher } = require('../lib/dispatcher')

module.exports = class TagsController {
  constructor(state) {
    this.state = state
  }

  addTag(name, point, pointType) {
    const tag = {
      id: nanoid(),
      name: name,
      point: point,
      pointType: pointType
    }
    this.state.saved.tags.unshift(tag)
    dispatch(actions.STATE_SAVE)
    dispatcher(actions.UPDATE)
  }

  updateTag(id, name, point, pointType) {
    const tag = this.state.saved.tags.find((t) => t.id == id)
    tag.name = name
    tag.point = point
    tag.pointType = pointType
    dispatch(actions.STATE_SAVE)
    dispatcher(actions.UPDATE)
  }
}
