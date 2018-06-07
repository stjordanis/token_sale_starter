import React from 'react'

import Async from 'components/Async'
const Container = Async(() => import('components/template/Container'))
const P = Async(() => import('components/template/P'))

const Footer = () => (
  <Container>
    <P>&copy; 2018, <a href="https://identiForm.com">identiForm</a> </P>
  </Container>
)

export default Footer
