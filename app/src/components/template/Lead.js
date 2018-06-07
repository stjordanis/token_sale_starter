import React from 'react'
import PropTypes from 'prop-types'

import Label  from 'grommet/components/Label'

const Lead = (props) => (
  <Label>
    { props.text }
  </Label>
)

Lead.propTypes = {
  text: PropTypes.string
}

export default Lead
