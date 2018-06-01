import React, { Component } from 'react'
import { connect } from 'react-redux'
import Toast from 'grommet/components/Toast'
import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import TextInput from 'grommet/components/TextInput'
import Button from 'grommet/components/Button'
import Label  from 'grommet/components/Label'
import Form  from 'grommet/components/Form'
import web3utils from 'web3-utils'

class AddToWhitelist extends Component {
  constructor() {
    super()
    this.state = {
      modalOpen: null,
      success: '',
      failure: '',
      toWhitelist: '',
      status: false,
      loading: false
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.getWhitelistStatus = this.getWhitelistStatus.bind(this)
  }

  handleChange(event) {
    const { target } = event
    const value = target.type === 'checkbox' ? target.checked : target.value
    const { name } = target

    this.setState({
      [name]: value,
      loading: true
    })

    this.getWhitelistStatus()
  }

  getWhitelistStatus() {
    if (web3utils.isAddress(this.state.toWhitelist)) {
      this.props.Crowdsale.deployed().then((token) => {
        token.getWhitelistStatus(this.state.toWhitelist, { from: this.props.account }).then((res) => {
          this.setState({
            status: res,
            loading: false
          })
        })
      })
      .catch((error) => {
        console.log('Whitelist query', error)
      })
    }

    setTimeout(() => {
        this.getWhitelistStatus()
    }, 2000)
  }

  handleSubmit(event) {
    event.preventDefault()

    this.props.Crowdsale.deployed().then(async (token) => {
      if (web3utils.isAddress(this.state.toWhitelist)) {
        const _gas = await token.addToWhitelist.estimateGas(this.state.toWhitelist)
        token.addToWhitelist(this.state.toWhitelist, {
          from: this.props.account,
          gas: _gas,
          gasPrice: this.props.gasPrice
        })
        .then((receipt) => {
          // console.log('Success: ', receipt)
          this.setState({
            modalOpen: true,
            success: `Success! Your tx: ${receipt.tx}`
          })
        })
        .catch((error) => {
          // console.log(error.message)
          this.setState({
            modalOpen: true,
            failure: `Error occurred: ${error.message}`
          })
        })
      } else {
        this.setState({
          modalOpen: true,
          failure: 'Please check the form.'
        })
      }
    })
  }

  render() {
    return (
      <Box align='center'>
        <Heading>Add to Whitelist</Heading>
        { !this.state.status ? <Form onSubmit={this.handleSubmit}>
          <Box pad='small' align='center'>
            <Label labelFor="whitelist">Whom to add:</Label>
          </Box>
          <Box pad='small' align='center'>
            <TextInput
              id='whitelist'
              type='text'
              onDOMChange={this.handleChange}
              value={this.state.toWhitelist}
              name='toWhitelist'
              placeHolder='Address'/>
          </Box>
          <Box pad='small' align='center'>
            {
              this.state.loading ? 'Loading...'
              : <Button primary={true} type='submit' label='Save' />
            }
          </Box>
        </Form>
        : <Label>This user is already whitelisted</Label>
        }
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
    web3: state.web3,
    Crowdsale: state.Crowdsale,
    account: state.account,
    gasPrice: state.gasPrice
  }
}

export default connect(mapStateToProps)(AddToWhitelist)
