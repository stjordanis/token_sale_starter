import React from 'react'
import PropTypes from 'prop-types'

import Paragraph from 'grommet/components/Paragraph'
import Toast from 'grommet/components/Toast'

const Popup = (props) => (
  <div>
    { props.modalOpen && <Toast
      status={props.success ? 'ok' : 'critical' }>
      <Paragraph>{ props.success ? props.success : null }</Paragraph>
      <Paragraph>{ props.failure ? props.failure : null }</Paragraph>
    </Toast>
    }
  </div>
)

Popup.propTypes = {
  success: PropTypes.string,
  failure: PropTypes.string
}

export default Popup
