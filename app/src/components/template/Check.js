import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import CheckBox from 'grommet/components/CheckBox'
import Box  from 'grommet/components/Box'
import Label  from 'grommet/components/Label'

class Check extends PureComponent {
  constructor() {
    super()
  
    this.state = {
      ok: false
    }
  }

  render() {
    return (
      <div>
        <Box pad='small' align='center'>
          <Label labelFor='checked'>{this.props.q}</Label>
          </Box>
          <Box pad='small' align='center'>
          <CheckBox
            id='checked'
            name='ok'
            label={this.props.label}
            onChange={(e) => { this.setState({ ok: e.target.checked }); this.props.handleCheck(e) }}
            toggle={true} />
        </Box>
      </div>
    )
  }
}

Check.propTypes = {
  q: PropTypes.string,
  label: PropTypes.string,
  handleCheck: PropTypes.func
}

export default Check
