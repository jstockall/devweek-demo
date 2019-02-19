/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// ChangePipeline specifc classes
const UserStory = require('./story.js');
const StoryList = require('./storylist.js');

/**
 * A custom context provides easy access to list of all commercial stories
 */
class UserStoryContext extends Context {

    constructor() {
        super();
        // All stories are held in a list of stories
        this.storyList = new StoryList(this);
    }

}

/**
 * Define user story smart contract by extending Fabric Contract class
 *
 */
class UserStoryContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('com.embotics.devweek.userstory');
    }

    /**
     * Define a custom context for user story
    */
    createContext() {
        return new UserStoryContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * Assign a user story to a sprint
     *
     * @param {Context} ctx the transaction context
     * @param {String} storyType user story type
     * @param {Integer} storyNumber number for this story
     * @param {Integer} storyName number for this story
     * @param {String} sprintName the sprint the story was assigned to
    */
    async assign(ctx, storyType, storyNumber, storyName, sprintName) {

        console.log(`Assign ${storyType}${storyNumber} [${storyName}] to ${sprintName}`);

        // create an instance of the story
        let story = UserStory.createInstance(storyType, storyNumber, storyName, sprintName);

        // Move the story to assigned in the contract as it's part of a sprint
        story.setAssigned();

        // Add the story to the list of all user stories in the ledger world state
        await ctx.storyList.addStory(story);

        // Must return a serialized story to caller of smart contract
        return story.toBuffer();
    }

    /**
     * Take a user story from the sprint backlog and begin designing it
     *
     * @param {Context} ctx the transaction context
     * @param {String} storyType user story type
     * @param {Integer} storyNumber number for this story
     * @param {Integer} sprintName The name of the active sprint
     * @param {String} designerName new owner of story
    */
    async design(ctx, storyType, storyNumber, sprintName, designerName) {

        console.log(`Design ${storyType}${storyNumber} started by [${designerName}] in ${sprintName}`);

        // Retrieve the story using key fields provided
        let story = await ctx.storyList.getStory(UserStory.makeKey([storyType, storyNumber]));

        // Confirm that the story is in the appropriate state
        if (! story.isAssigned()) {
            throw new Error(`Unable to begin design, ${storyType}${storyNumber} is in state ${story.getCurrentState()}`);
        }
        // Confirm the story is in the correct sprint
        if (story.getSprintName() !== sprintName) {
            throw new Error(`Unable to begin design, ${storyType}${storyNumber} is not in sprint ${sprintName}`);
        }

        // Moves state from ASSIGNED to DESIGNING
        story.setDesigning();
        story.setDesignerName(designerName);
        // Update the story
        await ctx.storyList.updateStory(story);
        // return a serialized copy
        return story.toBuffer();
    }

    /**
     * Handoff from a desinger to a developer
     *
     * @param {Context} ctx the transaction context
     * @param {String} storyType user story type
     * @param {Integer} storyNumber number for this story
     * @param {String} designerName new owner of story
     * @param {String} developerName new owner of story
    */
    async develop(ctx, storyType, storyNumber, sprintName, designerName, developerName) {

        // Retrieve the story using key fields provided
        let storyKey = UserStory.makeKey([storyType, storyNumber]);
        let story = await ctx.storyList.getStory(storyKey);

        // Confirm that the story is in the appropriate state
        if (! story.isDesigning()) {
            throw new Error(`Unable to begin developement, story ${storyType}${storyNumber} is in state ${story.getCurrentState()}`);
        }

        // Confirm the story is in the correct sprint
        if (story.getSprintName() !== sprintName) {
            throw new Error(`Unable to begin developement, story ${storyType}${storyNumber} is not in sprint ${sprintName}`);
        }

        // Confirm the story is being handed off by the correct designer
        if (story.getDesignerName() !== designerName) {
            throw new Error(`Unable to begin developement, story ${storyType}${storyNumber} is owned by ${story.getDesignerName()}`);
        }

        // Moves state from DESIGNING to DEVELOPING
        story.setDeveloping();
        story.setDeveloperName(developerName);

        // Update the story
        await ctx.storyList.updateStory(story);

        // return a serialized copy
        return story.toBuffer();
    }

    /**
     * Triggered by a developer commit to version control
     *
     * @param {Context} ctx the transaction context
     * @param {String} storyType user story type
     * @param {Integer} storyNumber number for this story
     * @param {String} developerName new owner of story
     * @param {String} commitHash identifier of the commit
    */
    async verify(ctx, storyType, storyNumber, developerName, commitHash) {

        // Retrieve the story using key fields provided
        let storyKey = UserStory.makeKey([storyType, storyNumber]);
        let story = await ctx.storyList.getStory(storyKey);

        // Confirm that the story is in the appropriate state
        if (! story.isDeveloping()) {
            throw new Error(`Unable to begin verification, story ${storyType}${storyNumber} is in state ${story.getCurrentState()}`);
        }

        // Confirm the story is owned by the developer who made the commit
        if (story.getDeveloperName() !== developerName) {
            throw new Error(`Unable to begin verification, story ${storyType}${storyNumber} is owned by ${story.getDeveloperName()}`);
        }

        // Moves state from DEVELOPING to VERIFYING
        story.setVerifying();
        story.setCommitHash(commitHash);

        // Update the story
        await ctx.storyList.updateStory(story);

        // return a serialized copy
        return story.toBuffer();
    } 

    /**
     * Triggered by a developer commit to version control
     *
     * @param {Context} ctx the transaction context
     * @param {String} storyType user story type
     * @param {Integer} storyNumber number for this story
     * @param {String} commitHash identifier of the commit
     * @param {String} testExecution results of the verification
    */
    async package(ctx, storyType, storyNumber, commitHash, testExecution) {

        // Retrieve the story using key fields provided
        let storyKey = UserStory.makeKey([storyType, storyNumber]);
        let story = await ctx.storyList.getStory(storyKey);

        // Confirm that the story is in the appropriate state
        if (! story.isVerifying()) {
            throw new Error(`Unable to begin packaging, story ${storyType}${storyNumber} is in state ${story.getCurrentState()}`);
        }

        // Confirm the story has the commit hash that was verified
        if (story.getCommitHash() !== commitHash) {
            throw new Error(`Unable to begin packaging, story ${storyType}${storyNumber} matches ${story.getCommitHash()}`);
        }

        // Confirm the story is owned by the developer who made the commit
        if (testExecution !== 'Passed') {
            throw new Error(`Unable to begin packaging, story ${storyType}${storyNumber} did not pass verification`);
        }

        // Moves state from VERIFYING to PACKAGING
        story.setPackaging();
        story.setTestExecution(testExecution);

        // Update the story
        await ctx.storyList.updateStory(story);

        // return a serialized copy
        return story.toBuffer();
    } 

    /**
     * Triggered when a packaged artifact was uploaded to the artifact repo
     *
     * @param {Context} ctx the transaction context
     * @param {String} storyType user story type
     * @param {Integer} storyNumber number for this story
     * @param {String} commitHash identifier of the commit
     * @param {String} imageName name of the packaged artifact
     * @param {String} version version of the packaged artifact
    */
   async deploy(ctx, storyType, storyNumber, commitHash, imageName, version) {

        // Retrieve the story using key fields provided
        let storyKey = UserStory.makeKey([storyType, storyNumber]);
        let story = await ctx.storyList.getStory(storyKey);

        // Confirm that the story is in the appropriate state
        if (! story.isPackaging()) {
            throw new Error(`Unable to begin deploying, story ${storyType}${storyNumber} is in state ${story.getCurrentState()}`);
        }

        // Confirm the story has the commit hash that was packaged
        if (story.getCommitHash() !== commitHash) {
            throw new Error(`Unable to begin deploying, story ${storyType}${storyNumber} matches ${story.getCommitHash()}`);
        }

        // Moves state from PACKAGING to DEPLOYING
        story.setDeploying();
        story.setImageName(imageName);
        story.setVersion(version);

        // Update the story
        await ctx.storyList.updateStory(story);

        // return a serialized copy
        return story.toBuffer();
    } 


    /**
     * Transaction to move a story to running (end state)
     *
     * @param {Context} ctx the transaction context
     * @param {String} storyType user story type
     * @param {Integer} storyNumber number for this story
     * @param {String} imageName name of the packaged artifact
     * @param {String} version version of the packaged artifact
     * @param {String} server address fo the server where the code is running
    */
    async run(ctx, storyType, storyNumber, imageName, version, server) {

        // Retrieve the story using key fields provided
        let storyKey = UserStory.makeKey([storyType, storyNumber]);
        let story = await ctx.storyList.getStory(storyKey);

        // Confirm that story is in the design phase
        if (! story.isDeploying()) {
            throw new Error(`Unable to complete, story ${storyType}${storyNumber} is in state ${story.getCurrentState()}`);
        }

        // Confirm the story has image name and version that was deployed
        if (story.getImageName() !== imageName) {
            throw new Error(`Unable to run, story ${storyType}${storyNumber} hase image name ${story.getImageName()}`);
        }
        if (story.getVersion() !== version) {
            throw new Error(`Unable to run, story ${storyType}${storyNumber} hase image version ${story.getVersion()}`);
        }

        // Moves state from DEPLOYING to RUNNING
        story.setDeploying();
        story.setServer(server);

        // Update the story
        await ctx.storyList.updateStory(story);

        // return a serialized copy
        return story.toBuffer();
    }

    /**
     * Query to retrieve all the stories
     *
     * @param {Context} ctx the transaction context
    */
    async queryAll(ctx) {
        const iterator = await ctx.stub.getQueryResult('{"selector": { "class": "com.embotics.devweek.userstory" }}');

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    /**
     * Query to retrieve all the history for a given story
     *
     * @param {Context} ctx the transaction context
     * @param {String} storyType user story type
     * @param {Integer} storyNumber number for this story
    */
    async historyFor(ctx, storyType, storyNumber) {

        let storyKey = `\u0000com.embotics.devweek.userstorylist\u0000"${storyType}"\u0000"${storyNumber}"\u0000`;

        console.log(storyKey);

        const iterator = await ctx.stub.getHistoryForKey(storyKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));
                let jsonRes = {};
                jsonRes.TxId = res.value.tx_id;
                jsonRes.Timestamp = new Date(res.value.timestamp.seconds.low * 1000);
                jsonRes.IsDelete = res.value.is_delete.toString();
                try {
                  jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                  console.log(err);
                  jsonRes.Value = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }
}

module.exports = UserStoryContract;
