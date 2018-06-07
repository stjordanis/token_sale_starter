import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import Async from 'components/Async'
import env from 'env'
const Title = Async(() => import('components/template/Title'))
const Ls = Async(() => import('components/template/Ls'))

class Balance extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      tokenBalance: null,
      balance: null,
      decimals: null
    }

    this.mounted = false

    this.getBalance = this.getBalance.bind(this)
    this.getEthBalance = this.getEthBalance.bind(this)
    this.getDecimals = this.getDecimals.bind(this)
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentDidMount = async () => {
    await this.getBalance()
    await this.getDecimals()
    await this.getEthBalance()
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

  getEthBalance = async () => {
    if(this.props.account != null) {
      this.props.web3.web3.eth.getBalance(this.props.account, function(err, balance) {
        if (!err) {
          this.setState({
            balance: this.props.web3.web3.fromWei(balance.toNumber())
          })
        }
      }.bind(this))
    }

    setTimeout(() => {
      this.getEthBalance()
    }, 2000)
  }

  getBalance = async () => {
    this.props.Token.deployed().then((crowdsale) => {
      if(this.props.account != null) {
        crowdsale.balanceOf(this.props.account).then((tokenBalance) => {
          this.setState({
            tokenBalance: tokenBalance ? tokenBalance.toNumber() : 'loading'
          })
        })
      }
    })

    setTimeout(() => {
      this.getBalance()
    }, 2000)
  }

  render() {
    const tokenBalance = `${this.state.tokenBalance / (10 ** this.state.decimals)} ${env.TOKEN_NAME}`
    const balance = `${this.state.balance} ETH`

    return (
      <div>
        { this.state.tokenBalance !== null ? <div>
          <Title title={`Your ${env.TOKEN_NAME} Tokens`} />
          <Ls data={[{ id: 0, data: tokenBalance }]} />
          </div>
          :
          '' }
        { this.state.balance !== null ? <div>
          <Title title='Your ETH' />
          <Ls data={[{ id: 1, data: balance }]} />
          </div>
          :
          ''
        }
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3,
    Token: state.Token,
    account: state.account
  }
}

export default connect(mapStateToProps)(Balance)
