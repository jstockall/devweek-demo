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

    if (process.argv.length != 5) {
        console.log("Expected node deploy.js commitHash version /path/to/git/repo");
        process.exit(-2);
    }
    let commitHash = process.argv[2];
    let version = process.argv[3].toString();
    let number = 0;

    const { exec } = require('child_process');
    exec(`git show  -s --format=%B ${commitHash}`, { cwd: process.argv[4] }, (err, stdout, stderr) => {
        if (err) {
            console.log("Unable to execute git show");
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            process.exit(2);
        }

        let matches = stdout.match(/Fix #(\d)/i);
        if (matches != null) {
            number = matches[1];
        } else {
            console.log("Unable to obtain issue number from commit message");
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            process.exit(3);
        }
    });

    // Create a client to communicate with the Hyperledger network
    const client = new Client('../gateway/networkConnection.yaml', '../identity/user/isabella/wallet');

    // Main try/catch block
    try {
        // Connect to the network
        await client.connect();

        console.log(`Marking Issue ${number} as in deploying state with name [${imageName}] version [${version}]`);
        await client.deploy('Issue', number.toString(), commitHash, imageName, version);

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

    console.log('Deploy program complete.');

}).catch((e) => {

    console.log('Deploy program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
