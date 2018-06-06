import React from 'react'
import { connect } from 'react-redux'

import Paragraph from 'grommet/components/Paragraph'

import Async from 'components/Async'
const Container = Async(() => import('components/Container'))

const Footer = () => (
  <Container>
    <Paragraph>&copy; 2018, <a href="https://identiForm.com">identiForm</a></Paragraph>
  </Container>
)

function mapStateToProps(state) {
  return {
    web3: state.web3,
    Crowdsale: state.Crowdsale,
    account: state.account
  }
}

export default connect(mapStateToProps)(Footer)
