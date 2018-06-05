import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import Web3Utils from 'web3-utils'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import TextInput from 'grommet/components/TextInput'
import Label  from 'grommet/components/Label'
import Form  from 'grommet/components/Form'

import Async from 'components/Async'
import env from 'env'
const Submit = Async(() => import('components/Submit'))
const Popup = Async(() => import('components/Popup'))

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

    this.props.Token.deployed().then(async (crowdsale) => {
      if (this.state.amountTokens > 0 && Web3Utils.isAddress(this.state.to)) {
        crowdsale.transfer(this.state.to, this.state.amountTokens * 10 ** env.DECIMALS, { from: this.props.account })
          .then((receipt) => {
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
    web3: state.web3
  }
}

export default connect(mapStateToProps)(TransferTokens)
