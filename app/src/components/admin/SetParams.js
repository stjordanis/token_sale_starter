import React, { Component } from 'react'
import { connect } from 'react-redux'

import Async from 'components/Async'
import env from 'env'
const Submit = Async(() => import('components/template/Submit'))
const Popup = Async(() => import('components/template/Popup'))
const Input = Async(() => import('components/template/Input'))
const Title = Async(() => import('components/template/Title'))
const Container = Async(() => import('components/template/Container'))

class SetParams extends Component {
  constructor() {
    super()
    this.state = {
      modalOpen: null,
      success: '',
      failure: '',
      loading: false,
      newRate: '',
      symbol: '',
      name: '',
      decimals: '',
      rate: ''
    }

    this.mounted = false

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
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
      [name]: value
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

  getRate = async () => {
    this.props.Token.deployed().then(async (crowdsale) => {
      crowdsale.rate.call().then((res) => {
        if (this.mounted) {
          this.setState({
            rate: res ? res.toNumber() : 'N/A'
          })
        }
      })
    })

    setTimeout(() => {
      this.getRate()
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

  handleSubmit = (event) => {
    event.preventDefault()
    this.setState({ loading: true })

    this.props.Token.deployed().then(async (token) => {
      if (this.state.decimals > 0 && this.state.rate > 0 && this.state.symbol !== '' && this.state.name !== '') {
        const _gas = await token.setParams.estimateGas(this.state.symbol, this.state.name, this.state.decimals, this.state.rate, { from: this.props.account })
        token.setParams(this.state.symbol, this.state.name, this.state.decimals, this.state.rate, {
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
        <Title title='Set ICO Parameters' />
        <form onSubmit={this.handleSubmit}>
          <Input id='symbol' req={true} label='Symbol' handleChange={this.handleChange} />
          <Input id='name' req={true} label='Name' handleChange={this.handleChange} />
          <Input id='decimals' req={true} label='Decimals' handleChange={this.handleChange} />
          <Input id='rate' req={true} label='Rate' handleChange={this.handleChange} />
          <Submit loading={this.state.loading} label='Set' />
        </form>
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

export default connect(mapStateToProps)(SetParams)
