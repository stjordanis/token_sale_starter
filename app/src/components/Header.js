import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'

import Box from 'grommet/components/Box'
import Tabs  from 'grommet/components/Tabs'
import Tab  from 'grommet/components/Tab'

class Header extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      isOwner: false,
      redirect: true
    }

    this.validateAdmin = this.validateAdmin.bind(this)
  }

  componentDidMount = async () => {
    this.validateAdmin()
  }

  validateAdmin() {
    this.props.Token.deployed().then(async (crowdsale) => {
      crowdsale.validate({ from: this.props.account }).then((res) => {
        this.setState({
          isOwner: res
        })
      })
    })

    setTimeout(() => {
      this.validateAdmin()
    }, 2000)
  }

  redirect(path) {
    if (this.state.redirect) {
      this.setState({
        redirect: false
      })

      return <Redirect push to={path} />
    } else {
      return ''
    }
  }

  render() {
    return (
        <Box align='center' responsive={true} pad='medium'>
        { this.state.isOwner
          ? <Box>
              <Tabs responsive={true} justify='center' onActive={() => { this.setState({ redirect: true }) }}>
                <Tab title='Home'>
                  { this.redirect('/admin') }
                </Tab>
                <Tab title='Parameters'>
                  { this.redirect('/params') }
                </Tab>
                <Tab title='Manage'>
                  { this.redirect('/manage') }
                </Tab>
                <Tab title='Rate'>
                  { this.redirect('/rate') }
                </Tab>
                <Tab title='Transfer ownership'>
                  { this.redirect('/transfer_ownership') }
                </Tab>
                <Tab title='Wh. add'>
                  { this.redirect('/whitelist_add') }
                </Tab>
                <Tab title='Wh. remove'>
                  { this.redirect('/whitelist_remove') }
                </Tab>
              </Tabs>
            </Box>
          : <Box>
            <Tabs responsive={true} justify='center' onActive={() => { this.setState({ redirect: true }) }}>
              <Tab title='Home'>
                { this.redirect('/') }
              </Tab>
              <Tab title='Market Info'>
                { this.redirect('/market_info') }
              </Tab>
              <Tab title='Get tokens'>
                { this.redirect('/get') }
                </Tab>
              <Tab title='Send tokens'>
                { this.redirect('/transfer') }
              </Tab>
            </Tabs>
          </Box>
        }
      </Box>
    )
  }
}

function mapStateToProps(state) {
  return {
    Token: state.Token,
    account: state.account
  }
}

export default connect(mapStateToProps)(Header)
