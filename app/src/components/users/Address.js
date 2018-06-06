import React from 'react'
import { connect } from 'react-redux'

import List from 'grommet/components/List'
import ListItem  from 'grommet/components/ListItem'

import Async from 'components/Async'
const Title = Async(() => import('components/Title'))

const Address = (props) => (
  <div>
    <Title title='Your Address' />
    <List>
      <ListItem>{ props.account }</ListItem>
    </List>
  </div>
)

function mapStateToProps(state) {
  return {
    web3: state.web3,
    account: state.account
  }
}

export default connect(mapStateToProps)(Address)
