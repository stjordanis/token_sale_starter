import React from 'react'
import PropTypes from 'prop-types'

import Box  from 'grommet/components/Box'

const Container = (props) => (
  <Box align='center'>
    { props.children }
  </Box>
)

Container.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ])
}

export default Container
