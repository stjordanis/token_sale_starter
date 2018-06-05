import React, { Component } from 'react'

import { GridLoader } from 'react-spinners'

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

      return C ? <C {...this.props} /> : <div align='center'><GridLoader color={'#123abc'} loading={this.state.loading} /></div>
    }
  }

  return Async

}
