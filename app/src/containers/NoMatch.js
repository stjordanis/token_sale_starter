import React from 'react'
import { connect } from 'react-redux'

import Heading from 'grommet/components/Heading'
import Label from 'grommet/components/Label'
import Box  from 'grommet/components/Box'

const NoMatch = (props) => (
  <Box>
    <Heading>Not Found</Heading>
    <Label>
        Sorry, this page doesn't exist.
    </Label>    
  </Box>
)

function mapStateToProps(state) {
  return {
    web3: state.web3,
    account: state.account
  }
}

export default connect(mapStateToProps)(NoMatch)
