'use strict';

var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('user-research-util');
var hexadecimal = /^[0-9a-fA-F]+$/;
var _ = require('norman-server-tp').lodash;
var Study = require('./api/study/model').getModel();
var crossroads = require('crossroads');

var HASH_FORWARDSLASH = '#/';

exports.sendError = function (res) {
    try {
        if (arguments.length === 2) {
            if (isNaN(arguments[1])) {
                return res.status(500).json(arguments[1]);
            }
            return res.status(arguments[1]).json();
        }
        else if (arguments.length === 3) {
            if (isNaN(arguments[1])) {
                return res.status(arguments[2]).json(arguments[1]);
            }
            return res.status(arguments[1]).json(arguments[2]);
        }
        res.status(500).json();
    }
    catch (err) {
        serviceLogger.error('<< sendError(), error, ' + err);
    }
};

exports.getStudyAnswers = function (res, queryParams, filterParams) {
    serviceLogger.info({
        queryParams: queryParams,
        filterParams: filterParams
    }, '>> getStudyAnswers() ');

    Study.findOne(queryParams, filterParams)
        .lean(true)
        .select('answers')
        .exec(function (err, study) {
            if (err) {
                serviceLogger.warn('<< getStudyAnswers(), error returning answers', err);
                return exports.sendError(res, err);
            }

            if (!study) {
                serviceLogger.info('<< getStudyAnswers(), study not found returning 404');
                return res.status(404).json();
            }

            serviceLogger.info('<< getStudyAnswers(), returning study answers');
            return res.status(200).json(study.answers);
        });
};


exports.update = function (obj, body, props) {
    props = props.split(' ');
    props.forEach(function (prop) {
        if (typeof body[prop] !== 'undefined') obj[prop] = body[prop];
    });
};

exports.isSentimentValid = function (sentiment) {
    serviceLogger.info({
        sentiment: sentiment
    }, '>> isSentimentValid()');

    var first = 0;
    var last = 3;

    // Is the value a number?
    if (isNaN(sentiment)) {
        return false;
    }

    // Yes, is it between the correct range?
    if (sentiment >= first && sentiment <= last) {
        return true;
    }

    return false;
};

exports.isMongoId = function (str) {
    return hexadecimal.test(str) && str.length === 24;
};

/*
 Set order of questions if according to their ordinal so that they are saved in the correct order.
 */
exports.orderListByOrdinal = function (aQuestions) {
    if (_.isArray(aQuestions)) {
        return _.sortBy(aQuestions, 'ordinal');
    }
};

/**
 * Update the participant name to reflect the users status i.e. anonymous|deleted or active. Users who have specified
 * they want to be anonymous will be displayed as Participant N in the UI
 *
 * @param array1
 * @param array2
 * @param prop
 */
exports.setParticipantOrAnonymousNames = function (array1, array2, prop) {
    _.each(array1, function (arr1obj) {
        var arr2obj = _.find(array2, function (arr2o) {
            return arr1obj[prop].toString() === arr2o[prop].toString();
        });

        // If the object already exists extend it with the new values
        if (arr2obj) arr1obj.participant = arr2obj.name;
    });
};

exports.validateParams = function (action) {

    serviceLogger.info('<< validateParams(), params,', action.params);
    return function (req, res, next) {
        var isValid = true;
        _.forEach(action.params, function (_param) {
            if (!(req.param(_param))) {
                serviceLogger.error('<< validateParams(), error, cannot find param [' + _param + '] in req');
                isValid = false;
                return false;
            }
        });

        if (!isValid) {
            return res.status(400).json({message: 'request missing required parameters.'});
        }
        next();
    };
};

/**
 * Updates deepLinks for a UI5 snapshot to replace the names with the Entity's or html page &
 * save the original name in a new 'view' property
 *
 * @param deepLinks
 * @param snapshotUILang
 * @returns Array
 */
exports.updateSnapShotDeepLinks = function (deepLinks, snapshotUILang) {
    serviceLogger.info('>> updateSnapShotDeepLinks()');
    if (snapshotUILang === 'UI5') {
        serviceLogger.info('>> updateSnapShotDeepLinks() snapshotUILang UI5');
        for (var i = 0, len = deepLinks.length; i < len; i++) {
            var context = getContextFromUrl(deepLinks[i].pageUrl, {snapshotUILang: snapshotUILang});
            deepLinks[i].view = deepLinks[i].pageName;
            deepLinks[i].pageName = deepLinks.displayName;
            deepLinks[i].defaultContext = deepLinks[i].pageUrl;
            deepLinks[i].pageUrl = context.relativePath || deepLinks[i].pageUrl;
        }
    }
    serviceLogger.info('<< updateSnapShotDeepLinks()');
    return deepLinks;
};

exports.getContextFromUrl = getContextFromUrl;
/**
 * Gets the app templates context from a url
 *
 * @param {string} unparsedURI - e.g. /api/prototype/some/url/index.html#/SalesOrder('apples')
 * @param {object} task - the task object
 * @returns an Object containing a path
 *      (e.g. /api/prototype/some/url or http://domain.com:123/api/prototype/some/url if domain is contained in url)
 *      an index (or html page e.g. index.html),
 *      the entity (e.g. SalesOrder), and data (e.g. apples),
 *      and a relative path excluding the data (e.g. /api/prototype/some/url/index.html#/SalesOrder)
 */
function getContextFromUrl(unparsedURI, task) {
    var context = {
        entity: '',
        data: '',
        view: ''
    };
    if (unparsedURI !== undefined && task.snapshotUILang === 'UI5') {
        // This regex is used to separate urls of the form "/api/prototype/some/url/index.html#/SalesOrder('apples')" into:
        // groups[1] = path = "/api/prototype/some/url"
        // groups[2] = index = "index.html"
        // groups[1] = hash = "#/SalesOrder('apples')"
        var regex = /([\/\.:a-zA-Z0-9]{0,})\/([a-zA-Z0-9]{2,}[.]{1}[a-zA-Z0-9]{2,})(.*)/g;
        var groups = regex.exec(unparsedURI);
        if (groups && groups.length > 2) {
            context.path = groups[1];
            context.index = groups[2];
            var hash = groups[3];
            var temp = processHash(hash);
            context.data = temp.data;

            if (temp.view !== '' && temp.entity !== '') {
                context.entity = temp.view + '/' + temp.entity;
            }
            else if (temp.view !== '') {
                // context.entity here is not the same as the entity returned from processHash
                // It is a combination of view and entity
                context.entity = temp.view;
            }
            else {
                context.entity = temp.entity;
            }

            // manipulate hash in order to create crossroads route
            context.relativePath = context.path + '/' + context.index;
            if (context.entity && context.entity !== '') {
                context.relativePath = context.path + '/' + context.index + HASH_FORWARDSLASH + context.entity;
            }

        }
    }
    else {
        context.relativePath = unparsedURI;
    }
    return context;
}

 /**
* Process the url context using crossroads
* This should be the hash being passed in
*/
function processHash(hash) {
    if (!hash || typeof hash !== 'string') {
        return {
            data: '',
            entity: '',
            view: ''
        };
    }

    var hashSplit = hash.split('(');
    var hashSplitLength = hashSplit.length;
    var routeStart;
    var data = undefined;
    var entity = '';
    var view = '';

    // No split
    if (hashSplitLength === 1) {
        return {
            data: data,
            entity: entity,
            view: hash.split('/')[1]
        };
    }

    var hasView = function (hash) {
        var i = 2; // skip initial /
        while (i < hash.length) {
            if (hash[i] === '/') {
                return true;
            }
            else if (hash[i] === '(') {
                return false;
            }
            i = i + 1;
        }
        return false;
    }(hash);

    // pull out a view if necessary
    if (hasView) {
        view = hash.split('/')[1];
    }

    // now deal with entities if any
    if (hashSplitLength > 1) {
        // (1234)/whatever(1235)
        var startOfRoute = hashSplit[hashSplitLength - 2].split(')');
        if (startOfRoute.length > 1) {
            // we only take the last entity
            routeStart = startOfRoute[1]; // /whatever(1235)
            entity = routeStart.split('/')[1];
        }
        else {
            // has at least an enity and possible view
            routeStart = startOfRoute[0];
            entity = hasView ? routeStart.split('/')[2] : routeStart.split('/')[1];
        }

        // pattern to parse on
        var routePattern = '/:ignore*:' + routeStart + '({id})';

        // create a new crossroads router
        var crossroadsRouter = crossroads.create();
        // register the url being passed in as a route
        crossroadsRouter.addRoute(routePattern, function (urlStart, id) {
            // set the data object to be the object within the brackets (also removing the surrounding quotes)
            data = id.replace(/'/g, '');
        });
        // parse the route with the hash
        crossroadsRouter.parse(hash);
    }

    return {
        data: data,
        entity: entity,
        view: view
    };
}
