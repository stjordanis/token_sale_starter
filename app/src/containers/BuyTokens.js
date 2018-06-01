import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import Web3Utils from 'web3-utils'

import Toast from 'grommet/components/Toast'
import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import TextInput from 'grommet/components/TextInput'
import Button from 'grommet/components/Button'
import List from 'grommet/components/List'
import ListItem  from 'grommet/components/ListItem'
import Label  from 'grommet/components/Label'
import Form  from 'grommet/components/Form'

import env from '../env'

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

    this.props.Crowdsale.deployed().then(async (crowdsale) => {
      if (this.state.amountEth > env.MINIMUM_CONTRIBUTION && Web3Utils.isAddress(this.props.account)) {
        const _gas = await this.props.web3.web3.eth.estimateGas({
          from: this.props.account,
          to: crowdsale.address,
          value: this.props.web3.web3.toWei(this.state.amountEth, 'ether')
        }, (err, receipt) => {
          if (err) {
            this.setState({
              modalOpen: true,
              failure: `Error occurred: ${err.message}`
            })
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
            this.setState({
              modalOpen: true,
              success: `Success! Your tx: ${receipt}`
            })
          } else {
            if (err.message.indexOf('User denied') !== -1) {
              this.setState({
                modalOpen: true,
                failure: 'Tx cancelled.'
              })
            } else {
              this.setState({
                modalOpen: true,
                failure: `Error occurred: ${err.message}`
              })
            }
          }
        })
      } else {
        this.setState({
          modalOpen: true,
          failure: `Minimum contribution is ${env.MINIMUM_CONTRIBUTION} ETH`
        })
      }
    })

  }

  render() {
    return (
      <Box>
        <Heading>Buy {env.TOKEN_NAME} Tokens</Heading>
        <List>
          <ListItem>1 ETH = { this.state.priceEth } USD</ListItem>
          <ListItem>1 PWP = { (1 / env.RATE).toFixed(6) } ETH</ListItem>
          <ListItem>1 PWP = $US { (this.state.priceEth / env.RATE).toFixed(2) }</ListItem>
          <ListItem>1 PWP = $US { (this.state.priceEth / env.BONUS_RATE).toFixed(2) } (bonus rate)</ListItem>
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
                placeHolder='Amount to buy' />
              <Label>
                { this.state.amountEth > 0 ? `${this.state.amountEth} ETH = ` : '' }
                { this.state.amountTokens > 0 ? `${this.state.amountTokens} PWP` : '' }
              </Label>
            </Box>
            <Box pad='small' align='center'>
              <Button primary={true} type='submit' label='Buy tokens' />
            </Box>
          </Form>
        </Box>
          { this.state.modalOpen && <Toast
            status={this.state.success ? 'ok' : 'critical' }>
              <p>{ this.state.success ? this.state.success : null }</p>
              <p>{ this.state.failure ? this.state.failure : null }</p>
            </Toast>
          }
      </Box>
    )
  }
}

function mapStateToProps(state) {
  return {
    Crowdsale: state.Crowdsale,
    account: state.account,
    web3: state.web3,
    gasPrice: state.gasPrice
  }
}

export default connect(mapStateToProps)(BuyIcoTokens)
