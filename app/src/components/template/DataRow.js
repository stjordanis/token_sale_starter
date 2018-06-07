import React from 'react'
import PropTypes from 'prop-types'

import TableRow from 'grommet/components/TableRow'

const DataRow = (props) => (
  <TableRow>
    { props.children }
  </TableRow>
)

DataRow.propTypes = {
  children: PropTypes.object
}

export default DataRow
