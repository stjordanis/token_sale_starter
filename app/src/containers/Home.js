import React from 'react'

import Async from 'components/Async'
const Address = Async(() => import('components/users/Address'))
const Balance = Async(() => import('components/users/Balance'))

const Home = () => (
  <div>
    <Address />
    <Balance />
  </div>
)

export default Home
