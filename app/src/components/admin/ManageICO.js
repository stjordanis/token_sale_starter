import React, { Component } from 'react'
import { connect } from 'react-redux'

import Async from 'components/Async'
import env from 'env'
const Submit = Async(() => import('components/template/Submit'))
const Popup = Async(() => import('components/template/Popup'))
const Title = Async(() => import('components/template/Title'))
const Container = Async(() => import('components/template/Container'))
const SelectInput = Async(() => import('components/template/SelectInput'))

class ManageICO extends Component {
  constructor(props) {
    super(props)

    this.state = {
      to: '',
      success: '',
      failure: '',
      loading: false,
      modalOpen: false,
      action: ''
    }

    this.mounted = false

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  handleChange = (event) => {
    const { target, option } = event
    const { value, name } = target

    if (this.mounted) {
      (option) ? this.setState({
        [name]: option.value ? option.value : ''
      }) : this.setState({
        [name]: value
      })
    }
  }

  handleSubmit = (event) => {
    event.preventDefault()
    this.setState({ loading: true })

    this.props.Token.deployed().then(async (token) => {
      const _gas = await token[this.state.action].estimateGas({ from: this.props.account })
      token[this.state.action]({
        from: this.props.account,
        gas: _gas > env.MINIMUM_GAS ? _gas : env.MINIMUM_GAS,
        gasPrice: this.props.gasPrice
      }).then((receipt) => {
        this.msg(1, receipt)
      }).catch((error) => {
        this.msg(0, error)
      })
    })
  }

  resetToast = () => {
    setTimeout(() => {
      if (this.state.modalOpen) {
        this.setState({
          modalOpen: false,
          loading: false,
          success: '',
          failure: ''
        })
      }
    }, 5000)
  }

  resetToast = () => {
    setTimeout(() => {
      if (this.state.modalOpen) {
        this.setState({
          modalOpen: false,
          loading: false,
          success: '',
          failure: ''
        })
      }
    }, 5000)
  }

  msg = (type, msg) => {
    
    this.setState({ modalOpen: true })
    switch (type) {
      case 0:
        if (msg.message.indexOf('User denied') !== -1) {
          this.setState({ failure: 'Tx rejected.' })
        } else {
          this.setState({ failure: `Error occurred: ${msg.message}` })
        }
        this.resetToast()
        return
      case 1:
        this.setState({ success: `Success! Your tx: ${msg.tx}` })
        this.resetToast()
        return
      case 3:
        this.setState({ failure: 'Form has errors!' })
        this.resetToast()
        return
      default:
        this.resetToast()
    }
  }

  render() {
    const funcs = [
      { value: 'startIco', label: 'Start ICO' },
      { value: 'pauseIco', label: 'Pause ICO' },
      { value: 'finishIco', label: 'Finish ICO' },
      { value: 'allowTransfers', label: 'Allow transfers' },
      { value: 'disableTransfers', label: 'Disable transfers' },
      { value: 'setWhitelisting', label: 'Enable whitelsiitng requirement' },
      { value: 'unsetWhitelisting', label: 'Disable whitelisting requirement' }
    ]

    return (
      <Container>
        <Title title='Manage ICO' />
        <Container>
          <form onSubmit={this.handleSubmit}>
            <SelectInput id='action' action={this.state.action} label='Action' data={funcs} handleChange={this.handleChange} />
            <Submit loading={this.state.loading} label='Set' />
          </form>
        </Container>
        <Popup modalOpen={this.state.modalOpen} success={this.state.success} failure={this.state.failure} />
      </Container>
    )
  }
}

function mapStateToProps(state) {
  return {
    Token: state.Token,
    account: state.account,
    web3: state.web3,
    gasPrice: state.gasPrice
  }
}

export default connect(mapStateToProps)(ManageICO)
