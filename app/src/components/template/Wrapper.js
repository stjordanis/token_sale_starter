import React from 'react'

import '../../../node_modules/grommet-css'
import App from 'grommet/components/App'

const Wrapper = (props) => (
  <App>
    { props.children }
  </App>
)

export default Wrapper
