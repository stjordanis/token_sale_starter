import React from 'react'
import { connect } from 'react-redux'

import Box from 'grommet/components/Box'
import Paragraph from 'grommet/components/Paragraph'

const Footer = () => (
  <Box align='center'>
    <Paragraph>&copy; 2018, <a href="https://identiForm.com">identiForm</a></Paragraph>
  </Box>
)

function mapStateToProps(state) {
  return {
    web3: state.web3,
    Crowdsale: state.Crowdsale,
    account: state.account
  }
}

export default connect(mapStateToProps)(Footer)
