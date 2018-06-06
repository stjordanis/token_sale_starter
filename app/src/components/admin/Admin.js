import React, { Component } from 'react'
import { connect } from 'react-redux'

import Async from 'components/Async'
const Title = Async(() => import('components/Title'))
const Lead = Async(() => import('components/Lead'))

class Admin extends Component {
  render() {
    return (
      <div>
        <Title title="Admin Area" />
        <Lead text="This area is admins'." />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    account: state.account,
    web3: state.web3
  }
}

export default connect(mapStateToProps)(Admin)
