
module.exports = class NavsController {
  constructor(state) {
    this.state = state
  }

  goToPage(url) {
    this.state.location.go({
      url: url
    })
  }
}
