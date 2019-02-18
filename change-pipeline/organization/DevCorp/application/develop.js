/*
SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access ChangePipeline network
 * 4. Construct request to take story from the design state and in to the develop state
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

  try {

    // Load connection profile; will be used to locate a gateway
    let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/networkConnection.yaml', 'utf8'));
    // Set connection options; identity and wallet
    let connectionOptions = {
      identity: 'User1@org1.example.com',
      wallet: wallet,
      discovery: { enabled:false, asLocalhost: true }
    };

    // Connect to gateway using application specified parameters

    await gateway.connect(connectionProfile, connectionOptions);
    // Get the channel
    const network = await gateway.getNetwork('mychannel');
    // Get the contract (chaincode)
    const contract = await network.getContract('userstory', 'com.embotics.devweek.userstory');

    // Submit a transaction to beging developing a story
    const response = await contract.submitTransaction('develop', 'BackLog', '003', 'SP2', 'Linda', "Prachant");

    // process response
    let story = UserStory.fromBuffer(response);
    console.log(`${story.storyType} story : ${story.storyNumber} successfully entered development phase by ${story.developerName}`);

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

  console.log('Develop program complete.');

}).catch((e) => {

  console.log('Develop program exception.');
  console.log(e);
  console.log(e.stack);
  process.exit(-1);

});