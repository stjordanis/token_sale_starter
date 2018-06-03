import React from 'react'

import Box  from 'grommet/components/Box'

import Async from 'components/Async'
const Address = Async(() => import('components/users/Address'))
const Balance = Async(() => import('components/users/Balance'))

const Home = () => (
  <Box>
    <Address />
    <Balance />
  </Box>
)

export default Home
