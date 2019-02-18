/*
SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application connects to the Hyperledger Fabric and assigns a story to a sprint
 */

'use strict';

const Client = require('./client.js');

async function main() {

  // Check the command line arguments
  if (process.argv.length != 5) {
    console.log('Expected node assign-story.js StoryNumber StoryName SprintName')
    process.exit(-2);
  }

  // Create a client to communicate with the Hyperledger network
  const client = new Client('../gateway/networkConnection.yaml', '../identity/user/isabella/wallet');

  try {
    // Connect to the network
    await client.connect();

    // assign the story
    await client.assign('BackLog', process.argv[2], process.argv[3], process.argv[4]);

  } catch (error) {
    console.log(`Error processing transaction. ${error}`);
    console.log(error.stack);
  } finally {
    client.disconnect();
  }
}

// Logging
main().then(() => {

  console.log('Assign program complete.');

}).catch((e) => {

  console.log('Assign program exception.');
  console.log(e);
  console.log(e.stack);
  process.exit(-1);

});