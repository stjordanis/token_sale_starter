import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'

import env from 'env'

const Meta = (props) => (
  <Helmet>
    <meta charSet="utf-8" />
    <title>{ props.title } | { env.SITE_TITLE }</title>
  </Helmet>
)

Meta.propTypes = {
  title: PropTypes.string
}

export default Meta
