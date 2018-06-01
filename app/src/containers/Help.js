import React from 'react'
import Heading  from 'grommet/components/Heading'
import Box  from 'grommet/components/Box'
import Label  from 'grommet/components/Label'

const Help = () => (
  <Box>
    <Heading>Welcome to PowerPiper dApp [Demo]!</Heading>

    <Label>Instructions:</Label>

    <p>In order to use this application you need a Metamask
    account and being connected to 
    Rinkeby Test Network instead of Main ethereum net.
    </p>

    <Label>If yo're using mobile</Label>

    <p>If you're accessing this dapp from mobile, you can use any decentralized 
      apps browser like <a href="https://trustwalletapp.com/">Trust Wallet</a>.
    </p>

    <Label>How to get Metamask:</Label>

    <p><strong>1.</strong> Download and install <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">Metamask</a> extension.</p>

    <p><strong>2. </strong>Connect to Rinkeby Test Net by clicking the top right arrow and selecting <strong>Rinkeby Test Network.</strong></p>

    <p><strong>3. </strong>Now that you are connected to Rinkeby Test Network 
    you need some Rinkeby Ether. Fortunately, you can get it for free 
    just by completing a social network <a href="https://faucet.rinkeby.io/" target="_blank" rel="noopener noreferrer">challenge</a>.
    Now you are ready to use our Platform.
    </p>
    <Label>
      <a href="https://faucet.rinkeby.io/" target="_blank" rel="noopener noreferrer">Get Rinkeby Ether</a>
    </Label>
  </Box>
)

export default Help
