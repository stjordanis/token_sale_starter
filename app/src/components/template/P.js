import React from 'react'
import PropTypes from 'prop-types'

import Paragraph from 'grommet/components/Paragraph'

const P = (props) => (
  <Paragraph>
    { props.children }
  </Paragraph>
)

P.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ])
}

export default P
