import React, { Component } from 'react'
import { connect } from 'react-redux'

import Async from 'components/Async'
const Title = Async(() => import('components/template/Title'))
const Lead = Async(() => import('components/template/Lead'))
const Container = Async(() => import('components/template/Container'))

class Admin extends Component {
  render() {
    return (
      <Container>
        <Title title="Admin Area" />
        <Lead text="This area is admins'." />
      </Container>
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
