import React, { Component } from 'react'
import { connect } from 'react-redux'
import Toast from 'grommet/components/Toast'
import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import TextInput from 'grommet/components/TextInput'
import Button from 'grommet/components/Button'
import Label  from 'grommet/components/Label'
import Form  from 'grommet/components/Form'

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

  handleSubmit(event) {
    event.preventDefault()

    this.setState({
      success: '',
      failure: ''
    })

    this.props.Crowdsale.deployed().then(async (crowdsale) => {
      if (this.state.to != null) {
        const _gas = await crowdsale.transferOwnership.estimateGas(this.state.to)
        crowdsale.transferOwnership(this.state.to, { from: this.props.account, gas: _gas, gasPrice: this.props.gasPrice })
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
          failure: `If you want to transfer ownership, you need to fill the form.`
        })
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
            <Box pad='small' align='center'>
              <Button primary={true} type='submit' label='Do it' />
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

export default connect(mapStateToProps)(TransferOwnership)
