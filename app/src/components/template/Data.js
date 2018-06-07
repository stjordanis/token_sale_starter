import React from 'react'

import Table from 'grommet/components/Table'
import TableHeader from 'grommet/components/TableHeader'

const Data = (props) => (
  <Table responsive={true}>
    <TableHeader labels={props.labels} sortIndex={0} />
    <tbody>
      { props.data }
    </tbody>
  </Table>
)

export default Data
