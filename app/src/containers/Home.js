import React from 'react'

import Async from 'components/Async'
const Container = Async(() => import('components/template/Container'))
const Address = Async(() => import('components/users/Address'))
const Balance = Async(() => import('components/users/Balance'))

const Home = () => (
  <Container>
    <Address />
    <Balance />
  </Container>
)

export default Home
