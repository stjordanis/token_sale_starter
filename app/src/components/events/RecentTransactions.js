import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import Table from 'grommet/components/Table'
import TableHeader from 'grommet/components/TableHeader'
import TableRow from 'grommet/components/TableRow'

import env from '../../env'

/*
@TODO highlight own address
*/
class RecentTransactions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      transactions: [],
      sortAsc: false
    }

    this.fetchTransactions = this.fetchTransactions.bind(this)
  }

  async componentDidMount() {
    this.fetchTransactions()
  }

  fetchTransactions() {
    this.props.web3.web3.eth.getBlockNumber((latestBlock) => {
      this.props.Crowdsale.deployed().then((crowdsale) => {
        crowdsale.allEvents({ fromBlock: 0, toBlock: 'latest' })
          .watch((error, event) => {
            if (error) {
              console.log('Recent tx', error)
            } else if (
              (event.event === 'Transfer') && //  || event.event === 'BuyDirectEvent'
              _.findIndex(this.state.transactions, { hash: event.transactionHash }) === -1) {
              let updatedTransactions = this.state.transactions.slice()
              updatedTransactions.push({
                blockNumber: event.blockNumber,
                hash: event.transactionHash,
                from: event.args.from,
                to: event.args.to,
                amount: event.event === 'Transfer' ? event.args.value.toNumber() / 10 ** env.DECIMALS : '',
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
      <TableRow key={transaction.hash}>
        <td>{transaction.blockNumber}</td>
        <td>{transaction.hash.substring(0, 24)+'...'}</td>
        <td>{transaction.from === this.props.account ? `${transaction.from.substring(0, 20)}...` : `${transaction.from.substring(0, 20)}...`}</td>
        <td>{transaction.to === this.props.account ? `${transaction.to.substring(0, 20)}...` : `${transaction.to.substring(0, 20)}...`}</td>
        <td>{transaction.amount}</td>
        <td>{transaction.type}</td>
      </TableRow>
    ))

    return (
      <Box>
        <Heading>Recent Network Transactions</Heading>

        { transactions.length
          ? <Table responsive={true}>
              <TableHeader
                labels={['Block', 'Tx Hash', 'From', 'To', `Amount, ${env.TOKEN_NAME}`, 'Type']}
                sortIndex={0}
                sortAscending={this.state.sortAsc} />
              <tbody>
                {transactions}
              </tbody>
          </Table>
          : <Label>No recent transactions</Label>
        }
      </Box>
    )
  }
}

function mapStateToProps(state) {
  return {
    Crowdsale: state.Crowdsale,
    web3: state.web3,
    account: state.account
  }
}

export default connect(mapStateToProps)(RecentTransactions)
