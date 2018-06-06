import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import List from 'grommet/components/List'
import Label from 'grommet/components/Label'
import ListItem  from 'grommet/components/ListItem'

import Async from 'components/Async'
import env from 'env'
import { icoMap } from 'utils/maps'
const RecentTransactions = Async(() => import('components/events/RecentTransactions'))
const Title = Async(() => import('components/Title'))
const Container = Async(() => import('components/Container'))

class CoinStats extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      supply: null,
      network: null,
      crowdsaleAddress: null,
      owner: null,
      status: null,
      weiRaised: null,
      name: null,
      symbol: null,
      decimals: null,
      rate: null,
      bonusRate: null
    }

    this.mounted = false

    this.getSymbol = this.getSymbol.bind(this)
    this.getName = this.getName.bind(this)
    this.getDecimals = this.getDecimals.bind(this)
    this.getTotalSupply = this.getTotalSupply.bind(this)
    this.getAddress = this.getAddress.bind(this)
    this.getHasClosed = this.getHasClosed.bind(this)
    this.getRaised = this.getRaised.bind(this)
    this.getNetwork = this.getNetwork.bind(this)
    this.getRate = this.getRate.bind(this)
    this.getOwner = this.getOwner.bind(this)
  }

  async componentDidMount() {
    this.getSymbol()
    this.getName()
    this.getDecimals()
    this.getTotalSupply()
    this.getAddress()
    this.getHasClosed()
    this.getRaised()
    this.getNetwork()
    this.getRate()
    this.getOwner()
  }

  componentWillMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
  }

  getTotalSupply() {
    this.props.Token.deployed().then(async (crowdsale) => {
      crowdsale._totalSupply().then((supply) => {
        console.log('supply')
        console.log(supply.toNumber())
        this.setState({
          supply: supply ? supply.toNumber() : 'N/A'
        })
      })
    })

    setTimeout(() => {
      this.getTotalSupply()
    }, 2000)
  }

  getOwner() {
    this.props.Token.deployed().then(async (crowdsale) => {
      crowdsale.owner().then((res) => {
        if (this.mounted) {
          this.setState({
            owner: res
          })
        }
      })
    })

    setTimeout(() => {
      this.getOwner()
    }, 2000)
  }

  getAddress() {
    this.props.Token.deployed().then(async (crowdsale) => {
      if (this.mounted) {
        this.setState({
          crowdsaleAddress: crowdsale.address
        })
      }
    })

    setTimeout(() => {
      this.getAddress()
    }, 2000)
  }

  getHasClosed() {
    this.props.Token.deployed().then((crowdsale) => {
      crowdsale.icoState.call().then(async (res) => {
        if (this.mounted) {
          this.setState({
            status: res ? await icoMap(res) : ''
          })
        }
      })
    })

    setTimeout(() => {
      this.getHasClosed()
    }, 2000)
  }

  getRaised() {
    this.props.Token.deployed().then(async (crowdsale) => {
      crowdsale.weiRaised.call().then((res) => {
        if (this.mounted) {
          this.setState({
            weiRaised: res ? res.toNumber() : 'N/A'
          })
        }
      })
    })

    setTimeout(() => {
      this.getRaised()
    }, 2000)
  }

  getSymbol() {
    this.props.Token.deployed().then(async (crowdsale) => {
      crowdsale.symbol.call().then((res) => {
        if (this.mounted) {
          this.setState({
            symbol: this.props.web3.web3.toUtf8(res)
          })
        }
      })
    })

    setTimeout(() => {
      this.getSymbol()
    }, 2000)
  }

  getName() {
    this.props.Token.deployed().then(async (crowdsale) => {
      crowdsale.tokenName.call().then((res) => {
        if (this.mounted) {
          this.setState({
            name: this.props.web3.web3.toUtf8(res)
          })
        }
      })
    })

    setTimeout(() => {
      this.getName()
    }, 2000)
  }

  getDecimals() {
    this.props.Token.deployed().then(async (crowdsale) => {
      crowdsale.decimals.call().then((res) => {
        if (this.mounted) {
          this.setState({
            decimals: res ? res.toNumber() : 'N/A'
          })
        }
      })
    })

    setTimeout(() => {
      this.getDecimals()
    }, 2000)
  }

  getRate() {
    this.props.Token.deployed().then(async (crowdsale) => {
      crowdsale.rate.call().then((res) => {
        if (this.mounted) {
          this.setState({
            rate: res ? res.toNumber() : 'N/A'
          })
        }
      })
    })

    setTimeout(() => {
      this.getRate()
    }, 2000)
  }

  getNetwork() {
    this.props.web3.web3.version.getNetwork(async (net) => {
      let network
      switch (net) {
        case '1':
          network = 'MainNet'
          break
        case '2':
          network = 'Morden (deprecated)'
          break
        case '3':
          network = 'Ropsten Test Network'
          break
        case '4':
          network = 'Rinkeby Test Network'
          break
        case '42':
          network = 'Kovan Test Network'
          break
        default:
          network = 'Local network'
      }

      this.setState({
        network: network
      })
    })

    setTimeout(() => {
      this.getNetwork()
    }, 2000)
  }

  render() {
    return (
      <Container>
        <Title title='Market Info' />
        <Label></Label>
        <List>
          <ListItem>Symbol: {this.state.symbol}</ListItem>
          <ListItem>Token Name: {this.state.name ? this.state.name : ''}</ListItem>
          <ListItem>Decimals: {this.state.decimals}</ListItem>
          <ListItem>Network: {this.state.network}</ListItem>
        </List>
        <Label>ICO</Label>
        <List>
          <ListItem>Rate: {this.state.rate}</ListItem>
          <ListItem>Crowdsale Address: {this.state.crowdsaleAddress}</ListItem>
          <ListItem>Owner: {this.state.owner}</ListItem>
          <ListItem>Tokens in Circulation: { this.state.supply ? (this.state.supply / 10 ** this.state.decimals) : 0} {env.TOKEN_NAME}</ListItem>
        </List>
        <Label>ICO status</Label>
        <List>
          <ListItem>Status: { this.state.status }</ListItem>
          <ListItem>ETH Raised: { this.props.web3.web3.fromWei(this.state.weiRaised, 'ether') } ETH</ListItem>
        </List>
        <RecentTransactions />
      </Container>
    )
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3,
    Token: state.Token
  }
}

export default connect(mapStateToProps)(CoinStats)
