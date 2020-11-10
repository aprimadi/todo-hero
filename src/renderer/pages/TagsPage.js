const React = require('react')

const TagList = require('../components/TagList')

module.exports = class TagsPage extends React.Component {
  render() {
    const state = this.props.state

    return (
      <div key='tags-page' className='tags-page'>
        <TagList state={state} />
      </div>
    )
  }
}
