import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import Web3Utils from 'web3-utils'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import List from 'grommet/components/List'
import ListItem  from 'grommet/components/ListItem'
import Label  from 'grommet/components/Label'
import Form  from 'grommet/components/Form'

import Async from 'components/Async'
import env from 'env'
const Submit = Async(() => import('components/Submit'))
const Popup = Async(() => import('components/Popup'))
const Input = Async(() => import('components/Input'))

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
      modalOpen: false,
      decimals: null
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getRate = this.getRate.bind(this)
    this.getDecimals = this.getDecimals.bind(this)
  }

  async componentDidMount() {
    axios.all([
      axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
    ]).then(axios.spread((eth) => {
      this.setState({
        priceEth: eth.data.USD
      })
    })).catch((error) => {
      this.msg(0, error)
    })
    await this.getRate()
    await this.getDecimals()
  }

  handleChange(event) {
    this.setState({
      amountEth: event.target.value,
      amountTokens: (this.state.rate && this.state.decimals) ? (event.target.value * this.state.rate) : 0
    })
  }

  handleSubmit(event) {
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
          gas: _gas,
          gasPrice: this.props.gasPrice,
          data: '0x00'
        }, (err, receipt) => {
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
    return (
      <Box>
        <Heading>Get { env.TOKEN_NAME } Tokens</Heading>
        <List>
          <ListItem>1 ETH = { this.state.priceEth } USD</ListItem>
          <ListItem>1 { env.TOKEN_NAME } = { this.state.rate ? (1 / this.state.rate).toFixed(6) : 'N/A' } ETH</ListItem>
          <ListItem>1 { env.TOKEN_NAME } = $US { this.state.rate ? (this.state.priceEth / this.state.rate).toFixed(2) : 'N/A' }</ListItem>
        </List>
        <Box align='center'>
          <Form onSubmit={this.handleSubmit}>
            <Input id='amountEth' req={true} label='Ethers' handleChange={this.handleChange} />
            <Label>
              { this.state.amountEth > 0 ? `${this.state.amountEth} ETH = ` : '' }
              { this.state.amountTokens > 0 ? `${this.state.amountTokens} ${env.TOKEN_NAME}` : '' }
            </Label>
            <Submit loading={this.state.loading} label='Get' />
          </Form>
        </Box>
        <Popup modalOpen={this.state.modalOpen} success={this.state.success} failure={this.state.failure} />
      </Box>
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
