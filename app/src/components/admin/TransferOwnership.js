import React, { Component } from 'react'
import { connect } from 'react-redux'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import TextInput from 'grommet/components/TextInput'
import Label  from 'grommet/components/Label'
import Form  from 'grommet/components/Form'

import Async from 'components/Async'
const Submit = Async(() => import('components/Submit'))
const Popup = Async(() => import('components/Popup'))

class TransferOwnership extends Component {
  constructor(props) {
    super(props)

    this.state = {
      to: '',
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

  handleSubmit(event) {
    event.preventDefault()

    this.setState({
      success: '',
      failure: ''
    })

    this.props.Token.deployed().then(async (crowdsale) => {
      if (this.state.to != null) {
        const _gas = await crowdsale.transferOwnership.estimateGas(this.state.to)
        crowdsale.transferOwnership(this.state.to, {
          from: this.props.account, gas: _gas, gasPrice: this.props.gasPrice
        }).then((receipt) => {
          this.msg(1, receipt)
        }).catch((err) => {
          this.msg(0, err)
        })
      } else {
        this.msg(0, { message: 'Form has errors' })
      }
    })
  }

  render() {
    return (
      <Box align='center'>
        <Heading>Transfer Ownership</Heading>
        <Box align='center'>
          <Form onSubmit={this.handleSubmit}>
            <Box pad='small' align='center'>
              <Label labelFor="toInput">Who is the new owner:</Label>
            </Box>
            <Box pad='small' align='center'>
              <TextInput id='toInput'
                type='text'
                name='to'
                onDOMChange={this.handleChange}
                value={this.state.to}
                placeHolder='New owner address' />
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

export default connect(mapStateToProps)(TransferOwnership)
