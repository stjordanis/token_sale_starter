import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import Web3Utils from 'web3-utils'

import Toast from 'grommet/components/Toast'
import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import TextInput from 'grommet/components/TextInput'
import Button from 'grommet/components/Button'
import Label  from 'grommet/components/Label'
import Form  from 'grommet/components/Form'

import env from '../env'

class TransferTokens extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      to: '',
      amountTokens: '',
      success: '',
      failure: '',
      modalOpen: false
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event) {
    const { target } = event
    const { name } = target

    this.setState({
      [name]: target.value
    })
  }

  handleSubmit(event) {
    event.preventDefault()

    this.setState({
      success: '',
      failure: ''
    })

    this.props.Crowdsale.deployed().then(async (crowdsale) => {
      if (this.state.amountTokens > 0 && Web3Utils.isAddress(this.state.to)) {
        crowdsale.transfer(this.state.to, this.state.amountTokens * 10 ** env.DECIMALS, { from: this.props.account })
          .then((receipt) => {
            // console.log(receipt)
            this.setState({
              modalOpen: true,
              success: `Success! Your tx: ${receipt.tx}`
            })
        })
        .catch((err) => {
          // console.log(err)
          this.setState({
            modalOpen: true,
            failure: `Error occurred: ${err.message}`
          })
        })
      } else {
        this.setState({
          modalOpen: true,
          failure: `Amount shoulnd't be empty`
        })
      }
    })
  }

  render() {
    return (
      <Box>
        <Heading>Send {env.TOKEN_NAME} Tokens</Heading>
        <Box align='center'>
          <Form onSubmit={this.handleSubmit}>
            <Box pad='small' align='center'>
              <Label labelFor="toInput">Whom to send:</Label>
            </Box>
            <Box pad='small' align='center'>
              <TextInput id='toInput'
                type='text'
                name='to'
                onDOMChange={this.handleChange}
                value={this.state.to}
                placeHolder='Recipient address' />
            </Box>
            <Box pad='small' align='center'>
              <Label labelFor="amountInput">Amount:</Label>
            </Box>
            <Box pad='small' align='center'>
              <TextInput id='amountInput'
                type='number'
                step='0.01'
                name='amountTokens'
                onDOMChange={this.handleChange}
                value={this.state.amountTokens}
                placeHolder='Tokens to send' />
            </Box>
            <Box pad='small' align='center'>
              <Button primary={true} type='submit' label='Send' />
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
    // Token: state.Token,
    Crowdsale: state.Crowdsale,
    account: state.account,
    web3: state.web3
  }
}

export default connect(mapStateToProps)(TransferTokens)
