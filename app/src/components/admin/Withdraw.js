import React, { Component } from 'react'
import { connect } from 'react-redux'

import Async from 'components/Async'
const Popup = Async(() => import('components/template/Popup'))
const Submit = Async(() => import('components/template/Submit'))
const Title = Async(() => import('components/template/Title'))
const Lead = Async(() => import('components/template/Lead'))
const Container = Async(() => import('components/template/Container'))
const Check = Async(() => import('components/template/Check'))

class Withdraw extends Component {
  constructor() {
    super()

    this.mounted = false

    this.state = {
      modalOpen: null,
      success: '',
      failure: '',
      ok: false,
      balance: 0
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.getBalance = this.getBalance.bind(this)
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentDidMount = async () => {
    this.getBalance()
  }

  getBalance = () => {
    this.props.Token.deployed().then(async (token) => {
      const addr = await token.address
      this.props.web3.web3.eth.getBalance(addr, async (err, res) => {
        if (!err && this.mounted) {
          this.setState({
            balance: res ? res.toNumber() / 10 ** 18 : 'N/A'
          })
        }
      })
    })

    setTimeout(() => {
      this.getBalance()
    }, 2000)
  }

  handleCheck = (e) => {
    this.setState({
      ok: e.target.checked
    })
  }

  handleSubmit = (event) => {
    event.preventDefault()

    if (this.state.ok && this.mounted) {
      this.props.Token.deployed().then(async (token) => {
        this.setState({ loading: true })

        const _gas = await token.withdraw.estimateGas({ from: this.props.account })
        token.withdraw({ from: this.props.account, gas: _gas, gasPrice: this.props.gasprice }).then((res) => {
          if (res) {
            this.msg(1, res)
          } else {
            this.msg(0, { messsage: 'Unknown error.' })
          }
        }).catch((error) => {
          this.msg(0, error)
        })
      })
    } else {
      this.msg(0, { message: 'Nothing to do here.' })
    }
  }

  resetToast = () => {
    setTimeout(() => {
      if (this.state.modalOpen) {
        this.setState({
          modalOpen: false,
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
        <Title title="Withdraw to owner's account" />
        <Lead text={`Balance is ${this.state.balance} ethers.`} />
        <form onSubmit={this.handleSubmit}>
          <Check q="Are you sure?" label="Yes, I'm sure" handleCheck={this.handleCheck} />
          <Submit loading={this.state.loading} label='Withdraw' />
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

export default connect(mapStateToProps)(Withdraw)
