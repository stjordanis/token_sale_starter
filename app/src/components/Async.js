import React, { Component } from 'react'

import Box  from 'grommet/components/Box'
import Spinning  from 'grommet/components/icons/Spinning'

export default function Async(imported) {
  class Async extends Component {
    constructor(props) {
      super(props)

      this.state = {
        component: null,
        loading: true
      }
    }

    async componentDidMount() {
      const { default: component } = await imported()

      this.setState({
        component: component,
        loading: false
      })
    }

    render() {
      const C = this.state.component

      return C ? <C {...this.props} /> : <Box align='center'><Spinning size='medium' /></Box>
    }
  }

  return Async

}
