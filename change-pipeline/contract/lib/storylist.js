/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('../ledger-api/statelist.js');

const UserStory = require('./story.js');

class StoryList extends StateList {

    constructor(ctx) {
        super(ctx, 'com.embotics.devweek.userstorylist');
        this.use(UserStory);
    }

    async addStory(story) {
        return this.addState(story);
    }

    async getStory(storyKey) {
        return this.getState(storyKey);
    }

    async updateStory(story) {
        return this.updateState(story);
    }
}


module.exports = StoryList;