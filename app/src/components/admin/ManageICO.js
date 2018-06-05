import React, { Component } from 'react'
import { connect } from 'react-redux'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Select from 'grommet/components/Select'
import Label  from 'grommet/components/Label'
import Form  from 'grommet/components/Form'

import Async from 'components/Async'
const Submit = Async(() => import('components/Submit'))
const Popup = Async(() => import('components/Popup'))

class ManageICO extends Component {
  constructor(props) {
    super(props)

    this.state = {
      to: '',
      success: '',
      failure: '',
      loading: false,
      modalOpen: false,
      action: null
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange = (event) => {
    const { target, option } = event
    const { value, name } = target

    if (this.mounted) {
      (option) ? this.setState({
        [name]: option.value ? option.value : ''
      }) : this.setState({
        [name]: value
      })
    }
  }

  handleSubmit = (event) => {
    event.preventDefault()
    this.setState({ loading: true })

    this.props.Token.deployed().then(async (token) => {
      const _gas = await token[this.state.action].estimateGas({ from: this.props.account })
      token[this.state.action]({ from: this.props.account, gas: _gas, gasPrice: this.props.gasPrice }).then((receipt) => {
        this.msg(1, receipt)
      }).catch((error) => {
        this.msg(0, error)
      })
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
    const funcs = [
      { value: 'startIco', label: 'Start ICO' },
      { value: 'pauseIco', label: 'Pause ICO' },
      { value: 'finishIco', label: 'Finish ICO' },
      { value: 'allowTransfers', label: 'Allow transfers' },
      { value: 'disableTransfers', label: 'Disable transfers' },
      { value: 'setWhitelisting', label: 'Enable whitelsiitng requirement' },
      { value: 'unsetWhitelisting', label: 'Disable whitelisting requirement' }
    ]

    return (
      <Box align='center'>
        <Heading>Manage ICO</Heading>
        <Box align='center'>
          <Form onSubmit={this.handleSubmit}>
            <Box pad='small' align='center'>
              <Label labelFor="action">Action:</Label>
            </Box>
            <Box pad='small' align='center'>
            <Select id={this.state.action}
              name={this.state.action}
              onChange={this.handleChange}
              value={this.state.action}
              options={funcs}
              placeHolder='Select an action' />
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

export default connect(mapStateToProps)(ManageICO)
