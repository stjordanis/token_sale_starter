import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import Async from 'components/Async'
import Meta from 'components/Meta'
import env from 'env'
import { icoMap } from 'utils/maps'
const RecentTransactions = Async(() => import('components/events/RecentTransactions'))
const Title = Async(() => import('components/template/Title'))
const Lead = Async(() => import('components/template/Lead'))
const Container = Async(() => import('components/template/Container'))
const Ls = Async(() => import('components/template/Ls'))

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
    this.getStatus = this.getStatus.bind(this)
    this.getRaised = this.getRaised.bind(this)
    this.getNetwork = this.getNetwork.bind(this)
    this.getRate = this.getRate.bind(this)
    this.getOwner = this.getOwner.bind(this)
  }

  componentDidMount = async () => {
    await this.getSymbol()
    await this.getName()
    await this.getDecimals()
    await this.getTotalSupply()
    await this.getAddress()
    await this.getStatus()
    await this.getRaised()
    await this.getNetwork()
    await this.getRate()
    await this.getOwner()
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  getTotalSupply = async () => {
    this.props.Token.deployed().then(async (crowdsale) => {
      crowdsale._totalSupply().then((supply) => {
        this.setState({
          supply: supply ? supply.toNumber() : 'N/A'
        })
      })
    })

    setTimeout(() => {
      this.getTotalSupply()
    }, 2000)
  }

  getOwner = async () => {
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

  getAddress = async () => {
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

  getStatus = async () => {
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
      this.getStatus()
    }, 2000)
  }

  getRaised = async () => {
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

  getSymbol = async () => {
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

  getName = async () => {
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

  getDecimals = async () => {
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

  getRate = async () => {
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

  getNetwork = async () => {
    this.props.web3.web3.version.getNetwork(async (net) => {
      let network
      switch (net) {
        case 1:
          network = 'MainNet'
          break
        case 2:
          network = 'Morden (deprecated)'
          break
        case 3:
          network = 'Ropsten Test Network'
          break
        case 4:
          network = 'Rinkeby Test Network'
          break
        case 42:
          network = 'Kovan Test Network'
          break
        case null:
          network = ''
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
        <Meta title='Market Information' />
        <Title title='Market Info' />
        <Ls data={[
          { id: 0, data: `Symbol: ${this.state.symbol}` },
          { id: 1, data: `Token Name: ${this.state.name ? this.state.name : ''}` },
          { id: 2, data: `Decimals: ${this.state.decimals}` },
          { id: 3, data: `Network: ${this.state.network}` }
        ]} />
        <Lead text="ICO" />
        <Ls data={[
          { id: 0, data: `Rate: ${this.state.rate}` },
          { id: 1, data: `Crowdsale Address: ${this.state.crowdsaleAddress}` },
          { id: 2, data: `Owner: ${this.state.owner}` },
          { id: 3, data: `Tokens in Circulation: ${this.state.supply ? (this.state.supply / 10 ** this.state.decimals) : 0} ${env.TOKEN_NAME}` }
        ]} />
        <Lead text="ICO status" />
        <Ls data={[
          { id: 0, data: `Status: ${this.state.status}` },
          { id: 1, data: `ETH Raised: ${this.props.web3.web3.fromWei(this.state.weiRaised, 'ether') } ETH` }
        ]} />
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
