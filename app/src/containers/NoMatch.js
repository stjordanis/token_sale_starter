import React from 'react'
import { connect } from 'react-redux'

import Label from 'grommet/components/Label'

import Async from 'components/Async'
const Title = Async(() => import('components/Title'))

const NoMatch = (props) => (
  <div>
    <Title title='Not Found' />
    <Label>
        Sorry, this page doesn't exist.
    </Label>    
  </div>
)

function mapStateToProps(state) {
  return {
    web3: state.web3,
    account: state.account
  }
}

export default connect(mapStateToProps)(NoMatch)
