'use strict';

var path = require('path');
var NormanTestServer = require('norman-testing-server').server;
var NormanTestRequester = require('norman-testing-server').Requester;
var commonServer = require('norman-common-server');
var mongoose;
var resolver = require('./testerUtil').resolver;
var hasInitSchemaCalled = false;


function UserContext() {

}
/**
 * initialise the userContext
 *
 * @param user
 * @param password
 * @returns Promise
 */
UserContext.prototype.initialize = function (user, password) {
    var deferred = Promise.defer();
    var self = this;
    NormanTestServer.initialize(path.resolve(__dirname, '../../../sample/server/config.test.json'))
        .then(function (server) {
             if(!hasInitSchemaCalled) {
                NormanTestServer.appServer.initSchema();
                hasInitSchemaCalled = true;
            }

            self.registry = commonServer.registry;
            mongoose = commonServer.db.connection.getMongooseConnection({database: 'build-user-research-server-test'});

            self.normanTestRequester = new NormanTestRequester(server.app, user, password, resolver(deferred));
        });
    return deferred.promise;
};

/**
 * Gets the information for an initialised userContext
 * GET: '/api/users/me'
 *
 * @param httpCodeExpected
 * @returns Promise - response
 */
UserContext.prototype.me = function (httpCodeExpected){
    var deferred = Promise.defer();
    this.normanTestRequester.reqGet('/api/users/me', httpCodeExpected, resolver(deferred));
    return deferred.promise;
};


/**
 * Drops the Database
 *
 * @param callback
 */
UserContext.prototype.resetDB = function (callback) {

    mongoose.db.dropDatabase(function () {
      callback();
    });
};



module.exports = UserContext;
