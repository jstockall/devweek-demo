/*
SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access ChangePipeline network
 * 4. Construct request to take story from the backlog and in to the design state
 * 5. Submit transaction
 * 6. Process response
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const UserStory = require('../../../contract/lib/story.js');
const Client = require('./client.js');

// A wallet stores a collection of identities for use
//const wallet = new FileSystemWallet('../user/isabella/wallet');
//const wallet = new FileSystemWallet('../identity/user/isabella/wallet');

// Main program function
async function main() {

    // Create a client to communicate with the Hyperledger network
    const client = new Client('../gateway/networkConnection.yaml', '../identity/user/isabella/wallet');

    // Main try/catch block
    try {
        // Connect to the network
        await client.connect();

        if (process.argv.length != 5) {
            console.log("Expected node package.js storyNumber commitHash testExecution");
            process.exit(-2);
        }
        let number = process.argv[2];
        let commitHash = process.argv[3];
        let testExecution = process.argv[4];

        console.log(`Marking Issue ${number} as in packaing state with commit hash [${commitHash}] and test execution [${testExecution}]`);
        await client.package('Issue', number.toString(), commitHash, testExecution);

    } catch (error) {

        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);

    } finally {

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.')
        client.disconnect();

    }
}
main().then(() => {

    console.log('Design program complete.');

}).catch((e) => {

    console.log('Design program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});