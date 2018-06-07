import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import Web3Utils from 'web3-utils'

import Async from 'components/Async'
import Meta from 'components/Meta'
import env from 'env'
const Submit = Async(() => import('components/template/Submit'))
const Popup = Async(() => import('components/template/Popup'))
const Input = Async(() => import('components/template/Input'))
const Title = Async(() => import('components/template/Title'))
const Lead = Async(() => import('components/template/Lead'))
const Container = Async(() => import('components/template/Container'))

class TransferTokens extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      to: '',
      amountTokens: '',
      success: '',
      failure: '',
      decimals: null,
      status: false,
      modalOpen: false
    }

    this.mounted = false

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getDecimals = this.getDecimals.bind(this)
    this.getStatus = this.getStatus.bind(this)
  }

  componentDidMount = async () => {
    await this.getStatus()
    await this.getDecimals()
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

  getStatus = async () => {
    this.props.Token.deployed().then((crowdsale) => {
      crowdsale.transfersAllowed.call().then(async (res) => {
        this.setState({
          status: res
        })
      })
    })

    setTimeout(() => {
      this.getStatus()
    }, 2000)
  }

  getDecimals = async () => {
    this.props.Token.deployed().then(async (crowdsale) => {
      crowdsale.decimals.call().then((res) => {
        if (this.mounted) {
          this.setState({
            decimals: res ? res.toNumber() : 'N/A'
          })
        }
      })
    })

    setTimeout(() => {
      this.getDecimals()
    }, 2000)
  }

  handleSubmit = (event) => {
    event.preventDefault()
    this.setState({ loading: true })

    this.props.Token.deployed().then(async (crowdsale) => {
      if (this.state.amountTokens > 0 && Web3Utils.isAddress(this.state.to)) {
        const _gas = await crowdsale.transfer.estimateGas(this.state.to, this.state.amountTokens * 10 ** this.state.decimals, { from: this.props.account })
        crowdsale.transfer(this.state.to, this.state.amountTokens * 10 ** this.state.decimals, {
          from: this.props.account,
          gas: _gas > env.MINIMUM_GAS ? _gas : env.MINIMUM_GAS,
          gasPrice: this.props.gasPrice
        }).then((receipt) => {
          this.msg(1, receipt)
        }).catch((err) => {
          this.msg(0, err)
        })
      } else {
        this.msg(0, { message: `Amount shoulnd't be empty` })
      }
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

  render() {
    return (
      <Container>
        <Meta title='Token Transfer' />
        <Title title={ `Send ${env.TOKEN_NAME} Tokens` } />
        { this.state.status ?
        <form onSubmit={this.handleSubmit}>
          <Input id='to' req={true} label='Recipient address' handleChange={this.handleChange} />
          <Input id='amountTokens' req={true} label='Tokens to send' handleChange={this.handleChange} />
          <Submit loading={this.state.loading} label='Send' />
        </form>
        : <Lead text='Transfers are disabled currently' />
        }
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

export default connect(mapStateToProps)(TransferTokens)
