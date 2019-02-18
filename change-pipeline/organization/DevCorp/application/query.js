/*
SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access ChangePipeline network
 * 4. Construct request to query for stories
 * 5. Submit transaction
 * 6. Process response
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const UserStory = require('../../../contract/lib/story.js');

// A wallet stores a collection of identities for use
//const wallet = new FileSystemWallet('../user/isabella/wallet');
const wallet = new FileSystemWallet('../identity/user/isabella/wallet');

// Main program function
async function main() {

  // A gateway defines the peers used to access Fabric networks
  const gateway = new Gateway();

  // Main try/catch block
  try {

    // Specify userName for network access
    // const userName = 'isabella.issuer@magnetocorp.com';
    const userName = 'User1@org1.example.com';

    // Load connection profile; will be used to locate a gateway
    let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/networkConnection.yaml', 'utf8'));

    // Set connection options; identity and wallet
    let connectionOptions = {
      identity: userName,
      wallet: wallet,
      discovery: { enabled:false, asLocalhost: true }
    };

    // Connect to gateway using application specified parameters
    console.log('Connect to Fabric gateway.');

    await gateway.connect(connectionProfile, connectionOptions);

    // Access PaperNet network
    console.log('Use network channel: mychannel.');

    const network = await gateway.getNetwork('mychannel');

    // Get addressability to user story contract
    console.log('Use com.embotics.devweek.userstory smart contract.');

    const contract = await network.getContract('userstory', 'com.embotics.devweek.userstory');

    // Assign a story to a sprint
    console.log('Assign Story transaction.');

    const queryResponse = await contract.evaluateTransaction('queryAll');
    //const queryResponse = await contract.evaluateTransaction('historyFor', 'BackLog', '001');

    // process response
    console.log('Process query transaction response.');

    // unmarshall our response
    let response = JSON.parse(JSON.parse(queryResponse.toString('utf8')));
    console.log(response);

    console.log('Query complete.');

  } catch (error) {

    console.log(`Error processing transaction. ${error}`);
    console.log(error.stack);

  } finally {

    // Disconnect from the gateway
    console.log('Disconnect from Fabric gateway.')
    gateway.disconnect();

  }
}
main().then(() => {

  console.log('Query program complete.');

}).catch((e) => {

  console.log('Query program exception.');
  console.log(e);
  console.log(e.stack);
  process.exit(-1);

});