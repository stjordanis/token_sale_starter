import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import Web3Utils from 'web3-utils'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import TextInput from 'grommet/components/TextInput'
import List from 'grommet/components/List'
import ListItem  from 'grommet/components/ListItem'
import Label  from 'grommet/components/Label'
import Form  from 'grommet/components/Form'

import Async from 'components/Async'
import env from 'env'
const Submit = Async(() => import('components/Submit'))
const Popup = Async(() => import('components/Popup'))

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
      modalOpen: false
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  async componentDidMount() {
    axios.all([
      axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
    ])
      .then(axios.spread((eth) => {
        this.setState({
          priceEth: eth.data.USD
        })
      }))
      .catch((error) => {
        console.log(error)
        this.setState({
          failure: error
        })
      })
  }

  handleChange(event) {
    this.setState({
      amountEth: event.target.value,
      amountTokens: (event.target.value * env.RATE).toFixed(env.DECIMALS)
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

  render() {
    return (
      <Box>
        <Heading>Get { env.TOKEN_NAME } Tokens</Heading>
        <List>
          <ListItem>1 ETH = { this.state.priceEth } USD</ListItem>
          <ListItem>1 { env.TOKEN_NAME } = { (1 / env.RATE).toFixed(6) } ETH</ListItem>
          <ListItem>1 { env.TOKEN_NAME } = $US { (this.state.priceEth / env.RATE).toFixed(2) }</ListItem>
        </List>
        <Box align='center'>
          <Form onSubmit={this.handleSubmit}>
            <Box pad='small' align='center'>
              <Label labelFor="amountInput">Your Contribution:</Label>
            </Box>
            <Box pad='small' align='center'>
              <TextInput id='amountInput'
                type='number'
                step='0.01'
                onDOMChange={this.handleChange}
                value={this.state.amountEth}
                placeHolder='Ethers' />
              <Label>
                { this.state.amountEth > 0 ? `${this.state.amountEth} ETH = ` : '' }
                { this.state.amountTokens > 0 ? `${this.state.amountTokens} PWP` : '' }
              </Label>
            </Box>
            <Submit loading={this.state.loading} label='Delete' />
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
