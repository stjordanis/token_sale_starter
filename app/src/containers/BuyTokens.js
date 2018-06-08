import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import Web3Utils from 'web3-utils'

import Async from 'components/Async'
import Meta from 'components/Meta'
import env from 'env'
import { icoMap } from 'utils/maps'
const Submit = Async(() => import('components/template/Submit'))
const Popup = Async(() => import('components/template/Popup'))
const Input = Async(() => import('components/template/Input'))
const Title = Async(() => import('components/template/Title'))
const Lead = Async(() => import('components/template/Lead'))
const Container = Async(() => import('components/template/Container'))
const Ls = Async(() => import('components/template/Ls'))
const P = Async(() => import('components/template/P'))

class BuyIcoTokens extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      amountEth: '',
      amountTokens: null,
      priceEth: null,
      success: '',
      failure: '',
      rate: null,
      status: null,
      modalOpen: false,
      decimals: null
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getRate = this.getRate.bind(this)
    this.getDecimals = this.getDecimals.bind(this)
    this.getStatus = this.getStatus.bind(this)
  }

  componentDidMount = async () => {
    axios.all([
      axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
    ]).then(axios.spread((eth) => {
      this.setState({
        priceEth: eth.data.USD
      })
    })).catch((error) => {
      this.msg(0, error)
    })

    await this.getStatus()
    await this.getRate()
    await this.getDecimals()
  }

  getStatus = async () => {
    this.props.Token.deployed().then((crowdsale) => {
      crowdsale.icoState.call().then(async (res) => {
        this.setState({
          status: res ? await icoMap(res) : ''
        })
      })
    })

    setTimeout(() => {
      this.getStatus()
    }, 2000)
  }

  handleChange = (event) => {
    this.setState({
      amountEth: event.target.value,
      amountTokens: (this.state.rate && this.state.decimals) ? (event.target.value * this.state.rate) : 0
    })
  }

  handleSubmit = (event) => {
    event.preventDefault()

    this.props.Token.deployed().then(async (crowdsale) => {
      if (this.state.amountEth > env.MINIMUM_CONTRIBUTION && Web3Utils.isAddress(this.props.account)) {
        const _gas = await this.props.web3.web3.eth.estimateGas({
          from: this.props.account,
          to: crowdsale.address,
          value: this.props.web3.web3.toWei(this.state.amountEth, 'ether')
        }, (err, receipt) => {
          if (err) {
            this.msg(0, err)
          }
        })

        this.props.web3.web3.eth.sendTransaction({
          from: this.props.account,
          to: crowdsale.address,
          value:  this.props.web3.web3.toWei(this.state.amountEth, 'ether'),
          gas: _gas > env.MINIMUM_GAS ? _gas : env.MINIMUM_GAS,
          gasPrice: this.props.gasPrice,
          data: '0x00'
        }, (err, receipt) => {
          console.log('receipt')
          console.log(receipt)
          if (!err) {
            this.msg(1, receipt)
          } else {
            this.msg(0, err)
          }
        })
      } else {
        this.msg(0, { message: `Minimum contribution is ${env.MINIMUM_CONTRIBUTION} ETH` })
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
        this.setState({ success: `Success! Your tx: ${msg.tx || msg}` })
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

  getRate = async () => {
    this.props.Token.deployed().then(async (crowdsale) => {
      crowdsale.rate.call().then((res) => {
        this.setState({
          rate: res.toNumber()
        })
      })
    })

    setTimeout(() => {
      this.getRate()
    }, 2000)
  }

  getDecimals = async () => {
    this.props.Token.deployed().then(async (crowdsale) => {
      crowdsale.decimals.call().then((res) => {
        this.setState({
          decimals: res.toNumber()
        })
      })
    })

    setTimeout(() => {
      this.getDecimals()
    }, 2000)
  }

  render() {
    const changeRate = (
      <div>
        { this.state.amountEth > 0 ? `${this.state.amountEth} ETH = ` : '' }
        { this.state.amountTokens > 0 ? `${this.state.amountTokens} ${env.TOKEN_NAME}` : '' }
      </div>
    )

    return (
      <Container>
        <Meta title='Get Tokens' />
        <Title title={`Get ${env.TOKEN_NAME} Tokens`} />
        <Lead text="ETH" />
        <Ls data={[
          { id: 0, data: `1 ETH = ${this.state.priceEth} USD` },
          { id: 1, data: `1 ${env.TOKEN_NAME} = ${this.state.rate ? (1 / this.state.rate).toFixed(6) : 'N/A'} ETH` },
          { id: 2, data: `1 ${env.TOKEN_NAME} = $US ${this.state.rate ? (this.state.priceEth / this.state.rate).toFixed(2) : 'N/A' }` }
        ]} />
        <Container>
          { this.state.status === 'Running' ?
          <form onSubmit={this.handleSubmit}>
            <Input id='amountEth' req={true} label='Ethers' handleChange={this.handleChange} />
            <Lead text={changeRate} />
            <Submit loading={this.state.loading} label='Get' />
          </form>
          : <Lead text={`Sale is currently ${this.state.status}`} />
          }
        </Container>
        <Lead text="BTC" />
        <P>Send your contributions in BTC to the following address:</P>
        <P>{ env.BTC_CONTRIBUTION_ADDRESS }</P>
        <Lead text="LTC" />
        <P>Send your contributions in LTC to the following address:</P>
        <P>{ env.LTC_CONTRIBUTION_ADDRESS }</P>
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

export default connect(mapStateToProps)(BuyIcoTokens)
