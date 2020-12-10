const actions = require('../lib/actions')
const { dispatch, dispatcher } = require('../lib/dispatcher')

module.exports = class ConfirmationController {
  constructor(state) {
    this.state = state
  }

  show(text, onConfirm, onCancel) {
    if (!onCancel) {
      onCancel = () => dispatch(actions.CONFIRMATION.HIDE)
    }
    this.state.confirmationDialog = {
      show: true,
      text: text,
      onConfirm: onConfirm,
      onCancel: onCancel,
    }
    dispatch(actions.UPDATE)
  }

  hide() {
    this.state.confirmationDialog = {
      show: false,
      text: "",
      onConfirm: () => {},
      onCancel: () => {},
    }
    dispatch(actions.UPDATE)
  }

  confirm() {
    const onConfirm = this.state.confirmationDialog.onConfirm
    this.state.confirmationDialog = {
      show: false,
      text: "",
      onConfirm: () => {},
      onCancel: () => {},
    }
    onConfirm()
  }

  cancel() {
    this.state.confirmationDialog.onCancel()
  }
}
