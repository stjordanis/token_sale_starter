import React from 'react'
import PropTypes from 'prop-types'

import Heading from 'grommet/components/Heading'

const Title = (props) => (
  <Heading align="center">
    { props.title }
  </Heading>
)

Title.propTypes = {
  title: PropTypes.string
}

export default Title
