import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

import Async from 'components/Async'
import env from 'env'
const Title = Async(() => import('components/template/Title'))
const Lead = Async(() => import('components/template/Lead'))
const Data = Async(() => import('components/template/Data'))
const DataRow = Async(() => import('components/template/DataRow'))

class RecentTransactions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      transactions: [],
      decimals: null
    }

    this.mounted = false

    this.fetchTransactions = this.fetchTransactions.bind(this)
    this.getDecimals = this.getDecimals.bind(this)
  }

  componentDidMount = async () => {
    await this.fetchTransactions()
    await this.getDecimals()
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
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

  fetchTransactions = async () => {
    this.props.web3.web3.eth.getBlockNumber((latestBlock) => {
      this.props.Token.deployed().then((crowdsale) => {
        crowdsale.allEvents({ fromBlock: 0, toBlock: 'latest' }).watch((error, event) => {
          if (error) {
            // console.log('Recent tx', error)
          } else if (
            (event.event === 'Transfer') && //  || event.event === 'BuyDirectEvent'
            _.findIndex(this.state.transactions, { hash: event.transactionHash }) === -1) {
            let updatedTransactions = this.state.transactions.slice()
            updatedTransactions.push({
              blockNumber: event.blockNumber,
              hash: event.transactionHash,
              from: event.args.from,
              to: event.args.to,
              amount: event.event === 'Transfer' ? event.args.value.toNumber() / 10 ** this.state.decimals : '',
              type: event.type
              // time: moment.unix(event.args._timestamp.toNumber()).fromNow(),
              // unix: event.args._timestamp.toNumber(),
            })
            updatedTransactions = _.sortBy(updatedTransactions, 'blockNumber', 'desc')

            this.setState({
              transactions: updatedTransactions
            })
          }
        })
      })
    })
  }

  render() {
    const transactions = this.state.transactions.map(transaction => (
      <DataRow key={transaction.hash}>
        <td>{transaction.blockNumber}</td>
        <td>{transaction.hash.substring(0, 24)+'...'}</td>
        <td>{transaction.from === this.props.account ? `${transaction.from.substring(0, 20)}...` : `${transaction.from.substring(0, 20)}...`}</td>
        <td>{transaction.to === this.props.account ? `${transaction.to.substring(0, 20)}...` : `${transaction.to.substring(0, 20)}...`}</td>
        <td>{transaction.amount }</td>
        <td>{transaction.type}</td>
      </DataRow>
    ))

    return (
      <div>
        <Title title='Recent Network Transactions' />
        { transactions.length ? 
        <Data data={transactions} labels={['Block', 'Tx Hash', 'From', 'To', `Amount, ${env.TOKEN_NAME}`, 'Type']} />
          : <Lead text="No recent transactions" />
        }
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    Token: state.Token,
    web3: state.web3,
    account: state.account
  }
}

export default connect(mapStateToProps)(RecentTransactions)
