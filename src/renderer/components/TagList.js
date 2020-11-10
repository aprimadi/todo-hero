const React = require('react')
const clsx = require('clsx')

const TextField = require('@material-ui/core/TextField').default
const Select = require('@material-ui/core/Select').default
const MenuItem = require('@material-ui/core/MenuItem').default

const actions = require('../lib/actions').TAGS
const { dispatch, dispatcher } = require('../lib/dispatcher')

class TagList extends React.Component {
  render() {
    const state = this.props.state

    const tagItems = []
    const tags = [...state.saved.tags]
    for (let tag of tags) {
      tagItems.push(this.renderTag(tag))
    }
    
    return (
      <div className='tag-list'>
        <div 
          className='add-tag-button main-button'
          onClick={dispatcher(actions.ADD_TAG, '', '', '')}
        >
          Add Tag
        </div>
        {tagItems} 
      </div>
    )
  }

  renderTag(tag) {
    const state = this.props.state

    const selectItems = []
    for (let pt of state.pointTypes) {
      selectItems.push(
        <MenuItem key={pt} value={pt}>{pt}</MenuItem>
      )
    }

    const tagClass = clsx('tag-item', 'holder-container', tag.pointType)

    return (
      <div className={tagClass}>
        <div className='ti-name holder'>
          <TextField
            fullWidth
            value={tag.name}
            placeholder={"Add description"}
            onChange={this.onChangeName.bind(this, tag)}
          />
        </div>
        <div className='ti-point holder point-holder'>
          <TextField
            fullWidth
            value={tag.point}
            placeholder={"0"}
            onChange={this.onChangePoint.bind(this, tag)}
          />
        </div>
        <div className='ti-point-type holder point-type-holder'>
          <Select
            fullWidth
            className='point-type-select'
            value={tag.pointType}
            onChange={this.onSelectPointType.bind(this, tag)}
          >
            {selectItems}
          </Select>
        </div>
      </div>
    )
  }

  onChangeName(tag, e) {
    dispatch(actions.UPDATE_TAG, tag.id, e.target.value, tag.point, tag.pointType)
  }

  onChangePoint(tag, e) {
    dispatch(actions.UPDATE_TAG, tag.id, tag.name, e.target.value, tag.pointType)
  }

  onSelectPointType(tag, e) {
    dispatch(actions.UPDATE_TAG, tag.id, tag.name, tag.point, e.target.value)
  }
}

module.exports = TagList
