const React = require('react')

const Dialog = require('@material-ui/core/Dialog').default
const DialogContent = require('@material-ui/core/DialogContent').default
const DialogActions = require('@material-ui/core/DialogActions').default
const Button = require('@material-ui/core/Button').default

const actions = require('../lib/actions')
const { dispatch } = require('../lib/dispatcher')

class ConfirmationDialog extends React.Component {
  render() {
    const state = this.props.state

    return (
      <Dialog className='confirmation-dialog' open={state.confirmationDialog.show}>
        <DialogContent>{state.confirmationDialog.text}</DialogContent>
        <DialogActions>
          <Button autoFocus onClick={this.onClickCancel} color='primary'>Cancel</Button>
          <Button onClick={this.onClickConfirm} color='primary'>Confirm</Button>
        </DialogActions>
      </Dialog>
    )
  }

  onClickCancel() {
    dispatch(actions.CONFIRMATION.HIDE)
  }

  onClickConfirm() {
    dispatch(actions.CONFIRMATION.CONFIRM)
  }
}

module.exports = ConfirmationDialog

