import React, { Component } from 'react'
import { connect } from 'react-redux'

import Async from 'components/Async'
import env from 'env'
const Submit = Async(() => import('components/template/Submit'))
const Popup = Async(() => import('components/template/Popup'))
const Input = Async(() => import('components/template/Input'))
const Title = Async(() => import('components/template/Title'))
const Container = Async(() => import('components/template/Container'))

class TransferOwnership extends Component {
  constructor(props) {
    super(props)

    this.state = {
      to: '',
      success: '',
      failure: '',
      modalOpen: false
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
    const { target } = event
    const { name } = target

    this.setState({
      [name]: target.value
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

  handleSubmit = (event) => {
    event.preventDefault()

    this.setState({
      success: '',
      failure: ''
    })

    this.props.Token.deployed().then(async (crowdsale) => {
      if (this.state.to != null) {
        const _gas = await crowdsale.transferOwnership.estimateGas(this.state.to)
        crowdsale.transferOwnership(this.state.to, {
          from: this.props.account,
          gas: _gas > env.MINIMUM_GAS ? _gas : env.MINIMUM_GAS,
          gasPrice: this.props.gasPrice
        }).then((receipt) => {
          this.msg(1, receipt)
        }).catch((err) => {
          this.msg(0, err)
        })
      } else {
        this.msg(0, { message: 'Form has errors' })
      }
    })
  }

  render() {
    return (
      <Container>
        <Title title='Transfer Ownership' />
        <Container>
          <form onSubmit={this.handleSubmit}>
            <Input id='to' req={true} label='New owner address' handleChange={this.handleChange} />
            <Submit loading={this.state.loading} label='Transfer' />
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

export default connect(mapStateToProps)(TransferOwnership)
