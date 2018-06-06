import React from 'react'

import Async from 'components/Async'
const Address = Async(() => import('components/users/Address'))
const Balance = Async(() => import('components/users/Balance'))
const Container = Async(() => import('components/Container'))

const Home = () => (
  <Container>
    <Address />
    <Balance />
  </Container>
)

export default Home
