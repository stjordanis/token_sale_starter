import React from 'react'
import { connect } from 'react-redux'

const Status = (props) => {
  return (
    <div>
      { !props.web3 || props.account == null
        ? <div>
          <p><strong>Warning!</strong> This application will not work without Metamask extension enabled. 
            Downlaod extension for <a href='https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en' 
            target='_blank' rel='noopener noreferrer'>Chrome</a> and <a href='https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/' 
            target='_blank' rel='noopener noreferrer'>Firefox</a>. Once enabled, refresh the page.</p>
          <p>If you use mobile, you can also install <a href="https://trustwalletapp.com/">Trust wallet</a>.</p>
        </div>
        : null
      }

      { props.account === 'empty' && props.web3.web3Initiated
        ? <div>
          <p><strong>Warning!</strong> Seems like you have Metamask ready but your account is locked.
            Please unlock it before using the app.</p>
        </div>
        : null
      }

      { props.account && props.web3.web3Initiated && !props.deployed
        ? <div>
          <p><strong>Warning!</strong> The selected network is not supported.</p>
        </div>
        : null
      }
    </div>
  )
}

function mapStateToProps(state) {
  return {
    web3: state.web3,
    account: state.account
  }
}

export default connect(mapStateToProps)(Status)
