import React from 'react'
import PropTypes from 'prop-types'

import '../../../node_modules/grommet-css'
import App from 'grommet/components/App'

const Wrapper = (props) => (
  <App>
    { props.children }
  </App>
)

Wrapper.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ])
}

export default Wrapper
