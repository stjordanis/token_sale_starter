import React from 'react'
import { connect } from 'react-redux'

import Async from 'components/Async'
import Meta from 'components/Meta'
const Title = Async(() => import('components/template/Title'))
const Lead = Async(() => import('components/template/Lead'))

const NoMatch = (props) => (
  <div>
  <Meta title='Not Found' />
    <Title title='Not Found' />
    <Lead text="Sorry, this page doesn't exist." />
  </div>
)

function mapStateToProps(state) {
  return {
    web3: state.web3,
    account: state.account
  }
}

export default connect(mapStateToProps)(NoMatch)
