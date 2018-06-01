import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'

import Box from 'grommet/components/Box'
import Label  from 'grommet/components/Label'
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

  async componentDidMount() {
    this.validateAdmin()
  }

  validateAdmin() {
    this.props.Crowdsale.deployed().then(async (crowdsale) => {
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
              <Label align='center'>Crowdsale:</Label>
              <Tabs responsive={true} justify='center' onActive={() => { this.setState({ redirect: true }) }}>
                <Tab title='Home'>
                  { this.redirect('/admin') }
                </Tab>
                <Tab title='Ownership'>
                  { this.redirect('/transfer-ownership') }
                </Tab>
                <Tab title='Reclaim'>
                  { this.redirect('/reclaim-tokens') }
                </Tab>
                <Tab title='Approval'>
                  { this.redirect('/approve') }
                </Tab>
                <Tab title='Wh. add'>
                  { this.redirect('/whitelist-add') }
                </Tab>
                <Tab title='Wh. remove'>
                  { this.redirect('/whitelist-remove') }
                </Tab>
              </Tabs>
              <Label align='center'>Token:</Label>
              <Tabs responsive={true} justify='center' onActive={() => { this.setState({ redirect: true }) }}>
                <Tab title='Markup'>
                  { this.redirect('/markup') }
                </Tab>
                <Tab title='Fee'>
                  { this.redirect('/fee') }
                </Tab>
                <Tab title='Mint'>
                  { this.redirect('/mint') }
                </Tab>
                <Tab title='Finish mint'>
                  { this.redirect('/finish-mint') }
                </Tab>
                <Tab title='Users'>
                  { this.redirect('/users-admin') }
                </Tab>
                <Tab title='Get User'>
                  { this.redirect('/get-user') }
                </Tab>
              </Tabs>
              { /*
              <Redeems />
              <Certificates />
              <TokenAvailability />
              */ }
            </Box>
          : <Box>
            <Tabs responsive={true} justify='center' onActive={() => { this.setState({ redirect: true }) }}>
              <Tab title='Home'>
                { this.redirect('/help') }
              </Tab>
              <Tab title='Market Info'>
                { this.redirect('/market-info') }
              </Tab>
              <Tab title='Register'>
                { this.redirect('/register') }
              </Tab>
              <Tab title='Buy tokens'>
                { this.redirect('/ico') }
                </Tab>
              <Tab title='Exchange'>
                { this.redirect('/exchange') }
              </Tab>
              <Tab title='Send'>
                { this.redirect('/transfer') }
              </Tab>
              <Tab title='My account'>
                { this.redirect('/account') }
              </Tab>
              <Tab title='Users'>
                { this.redirect('/users') }
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
    Crowdsale: state.Crowdsale,
    account: state.account
  }
}

export default connect(mapStateToProps)(Header)
