import React, { Component } from 'react'
import { connect } from 'react-redux'
import web3utils from 'web3-utils'

import Async from 'components/Async'
import env from 'env'
const Submit = Async(() => import('components/template/Submit'))
const Popup = Async(() => import('components/template/Popup'))
const Input = Async(() => import('components/template/Input'))
const Title = Async(() => import('components/template/Title'))
const Lead = Async(() => import('components/template/Lead'))
const Container = Async(() => import('components/template/Container'))

class RemoveFromWhitelist extends Component {
  constructor() {
    super()
    this.state = {
      modalOpen: null,
      success: '',
      failure: '',
      toWhitelist: '',
      status: true,
      loading: false
    }

    this.mounted = false

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.getWhitelistStatus = this.getWhitelistStatus.bind(this)
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  handleChange = (event) => {
    const { target } = event
    const value = target.type === 'checkbox' ? target.checked : target.value
    const { name } = target

    this.setState({
      [name]: value,
      loading: true
    })

    this.getWhitelistStatus()
  }

  getWhitelistStatus = () => {
    if (web3utils.isAddress(this.state.toWhitelist)) {
      this.props.Token.deployed().then((token) => {
        token.getWhitelistStatus(this.state.toWhitelist, { from: this.props.account }).then((res) => {
          this.setState({
            status: res,
            loading: false
          })
        })
      })
      .catch((error) => {
        console.log('Whitelist query', error)
      })
    }

    setTimeout(() => {
        this.getWhitelistStatus()
    }, 2000)
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

  handleSubmit = (event) => {
    event.preventDefault()

    this.props.Token.deployed().then(async (token) => {
      if (web3utils.isAddress(this.state.toWhitelist)) {
        const _gas = await token.removeFromWhitelist.estimateGas(this.state.toWhitelist)
        token.removeFromWhitelist(this.state.toWhitelist, {
          from: this.props.account,
          gas: _gas > env.MINIMUM_GAS ? _gas : env.MINIMUM_GAS,
          gasPrice: this.props.gasPrice
        }).then((receipt) => {
          this.msg(1, receipt)
        }).catch((error) => {
          this.msg(0, error)
        })
      } else {
        this.msg(0, { message: 'Form has errors' })
      }
    })
  }

  render() {
    return (
      <Container>
        <Title title='Remove from whitelist' />
        { this.state.status ? <form onSubmit={this.handleSubmit}>
          <Input id='toWhitelist' req={true} label='Address' handleChange={this.handleChange} />
          <Submit loading={this.state.loading} label='Set' />
        </form>
        : <Lead text="This user isn't on whitelist, nothing to do" />
        }
        <Popup modalOpen={this.state.modalOpen} success={this.state.success} failure={this.state.failure} />
      </Container>
    )
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3,
    Token: state.Token,
    account: state.account,
    gasPrice: state.gasPrice
  }
}

export default connect(mapStateToProps)(RemoveFromWhitelist)
