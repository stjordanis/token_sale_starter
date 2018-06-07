import React from 'react'

import List from 'grommet/components/List'
import ListItem  from 'grommet/components/ListItem'

const Ls = (props) => (
  <List>
    { props.data.map((el) => <ListItem id={el.id}>{ el.data }</ListItem>) }
  </List>
)

export default Ls
