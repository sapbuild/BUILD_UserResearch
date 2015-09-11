'use strict';

var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var api = require('./api');
var controller = require('./api/study/controller');

module.exports = {
    initialize: function () {
    },
    onInitialized: function () {
        api.initialize();

        // to remove studies included in projects
        var projectService = registry.getModule('ProjectService');
        projectService.registerProjectDeletionHandlers(controller.onProjectDeleted);

		// to remove comments included in studies annotations
		var userService = registry.getModule('UserService');
		userService.registerUserGlobalChangeHandlers(controller.onUserGlobalChange);
    },
    checkSchema: function (done) {
        api.checkSchema(done);
    },
    shutdown: function () {
        api.shutdown();
    },
    getSchemaInfo: function () {
        return {name: 'UserResearch', version: '0.0.0'};
    },
    getHandlers: function () {
        return api.getHandlers();
    }
};
