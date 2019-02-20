/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('../ledger-api/state.js');

// Enumerate user story state values
const storyState = {
    ASSIGNED: 1,
    DESIGNING: 2,
    DEVELOPING: 3,
    VERIFING: 4,
    PACKAGING: 5,
    DEPLOYING: 6,
    RUNNING: 7
};

/**
 * UserStory class extends State class
 * Class will be used by application and smart contract to define a user story (bug, story, enhancement, etc)
 */
class UserStory extends State {

    constructor(obj) {
        super(UserStory.getClass(), [obj.storyType, obj.storyNumber]);
        Object.assign(this, obj);
    }

    /**
     * Basic getters and setters
    */
    getStoryType() {
        return this.storyType;
    }

    setStoryType(newStoryType) {
        this.storyType = newStoryType;
    }

    getDesignerName() {
        return this.designerName;
    }

    setDesignerName(newDesignerName) {
        this.designerName = newDesignerName;
    }

    getDeveloperName() {
        return this.developerName;
    }

    setDeveloperName(newDeveloperName) {
        this.developerName = newDeveloperName;
    }

    getSprintName() {
        return this.sprintName;
    }

    setSprintName(newSprintName) {
        this.sprintName = newSprintName;
    }

    setVersion(newVersion) {
        this.version = newVersion;
    }

    getVersion() {
        return this.version;
    }

    setCommitHash(newCommitHash) {
        this.commitHash = newCommitHash;
    }

    getCommitHash() {
        return this.commitHash;
    }

    setTestExecution(newTestExecution) {
        this.testExecution = newTestExecution;
    }

    getTestExecution() {
        return this.testExecution;
    }

    setImageName(newImageName) {
        this.imageName = newImageName;
    }

    getImageName() {
        return this.imageName;
    }

    setServer(newServer) {
        this.server = newServer;
    }

    getServer() {
        return this.server;
    }

    /**
     * Useful methods to encapsulate software change states
     */
    setAssigned() {
        this.currentState = storyState.ASSIGNED;
    }

    setDesigning() {
        this.currentState = storyState.DESIGNING;
    }

    setDeveloping() {
        this.currentState = storyState.DEVELOPING;
    }

    setVerifying() {
        this.currentState = storyState.VERIFING;
    }

    setPackaging() {
        this.currentState = storyState.PACKAGING;
    }

    setDeploying() {
        this.currentState = storyState.DEPLOYING;
    }

    setRunning() {
        this.currentState = storyState.RUNNING;
    }

    isAssigned() {
        return this.currentState === storyState.ASSIGNED;
    }

    isDesigning() {
        return this.currentState === storyState.DESIGNING;
    }

    isDeveloping() {
        return this.currentState === storyState.DEVELOPING;
    }

    isVerifying() {
        return this.currentState === storyState.VERIFING;
    }

    isPackaging() {
        return this.currentState === storyState.PACKAGING;
    }

    isDeploying() {
        return this.currentState === storyState.DEPLOYING;
    }

    isRunning() {
        return this.currentState === storyState.RUNNING;
    }

    static fromBuffer(buffer) {
        return UserStory.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to user story
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, UserStory);
    }

    /**
     * Factory method to create a user story object
     */
    static createInstance(storyType, storyNumber, storyName, sprintName) {
        return new UserStory({ storyType, storyNumber, storyName, sprintName });
    }

    static getClass() {
        return 'com.embotics.devweek.userstory';
    }
}

module.exports = UserStory;
