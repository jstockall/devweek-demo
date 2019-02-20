/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const UserStory = require('../../../contract/lib/story.js');

// Channel name defined in basic-network
const channel = "mychannel";

/**
 * Client for the Change Pipeline Ledger
 */
class Client {

    /**
     * @param {String} netConfig Path to yaml network confiration '../gateway/networkConnection.yaml'
     * @return {String} wallet Path to a FileSystemWallet with credentials to access the network
     */
    constructor(netConfig, wallet) {
        // A gateway defines the peers used to access Fabric networks
        this.gateway = new Gateway();
        this.netConfig = netConfig;
        this.walletPath = wallet;
    }

    /**
     * Connect to the Change Pipeline network and obtain the chaincode
     */
    async connect() {

        // Specify userName for network access
        const userName = 'User1@org1.example.com';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync(this.netConfig, 'utf8'));

        // A wallet stores a collection of identities for use
        const wallet = new FileSystemWallet(this.walletPath);

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled: false, asLocalhost: true }
        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');
        await this.gateway.connect(connectionProfile, connectionOptions);

        // Access ChangePipeline network
        console.log(`Use network channel: ${channel}.`);
        const network = await this.gateway.getNetwork(channel);

        // Get addressability to user story contract
        console.log('Use com.embotics.devweek.userstory smart contract.');
        this.contract = await network.getContract('userstory', 'com.embotics.devweek.userstory');
    }

    disconnect() {
        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.')
        this.gateway.disconnect();
    }

    /**
     * Assign a user story to a sprint
     *
     * @param {String} storyType user story type
     * @param {Integer} storyNumber number for this story
     * @param {String} storyName number for this story
     * @param {String} sprintName the sprint the story was assigned to
    */
    async assign(storyType, storyNumber, storyName, sprintName) {
        // Assign a story to a sprint
        console.log('Start ASSIGN transaction.');
        const assignResponse = await this.contract.submitTransaction('assign', storyType, storyNumber, storyName, sprintName);

        // process response
        let story = UserStory.fromBuffer(assignResponse);
        console.log(`${story.storyType}${story.storyNumber} [${story.storyName}] successfully assigned to [${story.sprintName}]`);
        console.log('End ASSIGN transaction.');
    }

    /**
     * Begin designing a story
     *
     * @param {String} storyType user story type
     * @param {Integer} storyNumber number for this story
     * @param {String} sprintName the sprint the story was assigned to
     * @param {String} designerName Name of the designer
    */
    async design(storyType, storyNumber, sprintName, designerName) {
        // Assign a story to a sprint
        console.log('Start DESIGN transaction.');
        const assignResponse = await this.contract.submitTransaction('design', storyType, storyNumber, sprintName, designerName);

        // process response
        let story = UserStory.fromBuffer(assignResponse);
        console.log(`${story.storyType}${story.storyNumber} in design state by [${story.designerName}]`);
        console.log('End DESIGN transaction.');
    }

    /**
     * Begin developing a story
     *
     * @param {String} storyType user story type
     * @param {Integer} storyNumber number for this story
     * @param {String} designerName Name of the designer
     * @param {String} developerName Name of the developer
    */
    async develop(storyType, storyNumber, sprintName, designerName, developerName) {
        // Assign a story to a sprint
        console.log('Start DEVELOP transaction.');
        const assignResponse = await this.contract.submitTransaction('develop', storyType, storyNumber, sprintName, designerName, developerName);

        // process response
        let story = UserStory.fromBuffer(assignResponse);
        console.log(`${story.storyType}${story.storyNumber} in develop state by [${story.developerName}]`);
        console.log('End DEVELOP transaction.');
    }

    /**
     * Begin testing a story
     *
     * @param {String} storyType user story type
     * @param {Integer} storyNumber number for this story
     * @param {String} developerName Name of the developer
     * @param {String} commitHash Git commit hash
    */
    async verify(storyType, storyNumber, developerName, commitHash) {
        // Assign a story to a sprint
        console.log('Start VERIFY transaction.');
        const assignResponse = await this.contract.submitTransaction('verify', storyType, storyNumber, developerName, commitHash);

        // process response
        let story = UserStory.fromBuffer(assignResponse);
        console.log(`${story.storyType}${story.storyNumber} is now in verify with commit hash [${story.commitHash}]`);
        console.log('End VERIFY transaction.');
    }


    /**
     * Begin packaging a story
     *
     * @param {String} storyType user story type
     * @param {Integer} storyNumber number for this story
     * @param {String} commitHash Git commit hash
     * @param {String} testExecution Name of the developer     
    */
   async package(storyType, storyNumber, commitHash, testExecution) {
    // Assign a story to a sprint
    console.log('Start PACKAGE transaction.');
    const assignResponse = await this.contract.submitTransaction('package', storyType, storyNumber, commitHash, testExecution);

    // process response
    let story = UserStory.fromBuffer(assignResponse);
    console.log(`${story.storyType}${story.storyNumber} in package with test execution [${story.testExecution}]`);
    console.log('End PACKAGE transaction.');
}    
};
module.exports = Client;