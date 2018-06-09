import React from 'react'
import PropTypes from 'prop-types'

import List from 'grommet/components/List'
import ListItem  from 'grommet/components/ListItem'

const Ls = (props) => (
  <List>
    { props.data.map((el) => <ListItem key={el.id}>{ el.data }</ListItem>) }
  </List>
)

Ls.propTypes = {
  data: PropTypes.array
}

export default Ls
