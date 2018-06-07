import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import ReactGA from 'react-ga'

import * as actions from 'actions'
import Async from 'components/Async'
import env from 'env'
ReactGA.initialize(env.GA)
const supportsHistory = 'pushState' in window.history
const Home = Async(() => import('containers/Home'))
const Header = Async(() => import('components/Header'))
const Footer = Async(() => import('components/Footer'))
const MarketInfo = Async(() => import('containers/MarketInfo'))
const TransferTokens = Async(() => import('containers/TransferTokens'))
const BuyTokens = Async(() => import('containers/BuyTokens'))
const Status = Async(() => import('components/Status'))
const RemoveFromWhitelist = Async(() => import('components/admin/RemoveFromWhitelist'))
const AddToWhitelist = Async(() => import('components/admin/AddToWhitelist'))
const Admin = Async(() => import('components/admin/Admin'))
const TransferOwnership = Async(() => import('components/admin/TransferOwnership'))
const SetParams = Async(() => import('components/admin/SetParams'))
const ManageICO = Async(() => import('components/admin/ManageICO'))
const SetRate = Async(() => import('components/admin/SetRate'))
const Wrapper = Async(() => import('components/template/Wrapper'))
const Container = Async(() => import('components/template/Container'))

class dApp extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      initiated: false,
      deployed: true
    }
  }

  componentDidMount = async () => {
    this.props.initWeb3()

    this.setState({
      initiated: true
    })

    setInterval(() => {
      this.props.fetchAccount(this.props.web3)
      this.props.fetchGasPrice(this.props.web3)
    }, 2000)
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.web3 !== nextProps.web3) {
      this.props.fetchAccount(this.props.web3)

      if (nextProps.web3.web3Initiated) {
        this.props.initToken(nextProps.web3)
        this.props.fetchGasPrice(this.props.web3)
      }
    }

    if (this.props.account !== nextProps.account && typeof nextProps.account === 'string') {
      this.setState({
        initiated: true
      })
    }
  }

  pageviewTracking = () => {
    ReactGA.pageview(window.location.pathName)
  }

  render() {
    return (
      <Wrapper>
        <div>
          <BrowserRouter onUpdate={this.pageviewTracking} forceRefresh={!supportsHistory}>
            <div>
              <Container>
                <Status
                  account={this.props.account}
                  metamask={this.props.web3}
                  initiated={this.state.initiated}
                  deployed={this.state.deployed} {...this.props} />

                { this.state.deployed && typeof this.props.account === 'string' && this.props.account !== 'empty'
                  ? <div>
                      <Header />
                      <Switch>
                      <Route exact strict sensitive path='/' component={Home} />
                      <Route exact strict sensitive path='/get' component={BuyTokens} />
                      <Route exact strict sensitive path='/market_info' component={MarketInfo} />
                      <Route exact strict sensitive path='/transfer' component={TransferTokens} />
                      <Route exact strict sensitive path='/admin' component={Admin} />
                      <Route exact strict sensitive path='/params' component={SetParams} />
                      <Route exact strict sensitive path='/manage' component={ManageICO} />
                      <Route exact strict sensitive path='/rate' component={SetRate} />
                      <Route exact strict sensitive path='/transfer_ownership' component={TransferOwnership} />
                      <Route exact strict sensitive path='/whitelist_remove' component={RemoveFromWhitelist} />
                      <Route exact strict sensitive path='/whitelist_add' component={AddToWhitelist} />
                      </Switch>
                    </div>
                  : null
                }
              </Container>
              <Footer />
            </div>
          </BrowserRouter>
        </div>
      </Wrapper>
    )
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3,
    Token: state.Token,
    account: state.account
  }
}

export default connect(mapStateToProps, actions)(dApp)
