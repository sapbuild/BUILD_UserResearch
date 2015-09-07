'use strict';
var _ = require('norman-client-tp').lodash;
var crossroads = require('crossroads');

// @ngInject
module.exports = function ($location, $filter, uiError) {

    var parser;
    return {
        /* slashes are removed to stop false negatives on compare */
        compareURIs: function (uri1, uri2) {

            // Remove trailing '/'s and '#'s
            function cleanUrlEnd(url) {
                if (url.substr(-1) === '/' || url.substr(-1) === '#') {
                    return cleanUrlEnd(url.substr(0, url.length - 1));
                }
                return url;
            }

            uri1 = decodeURIComponent(uri1);
            uri2 = decodeURIComponent(uri2);

            return (cleanUrlEnd(uri1) === cleanUrlEnd(uri2));
        },

        getRelativeURI: function (unparsedURI, returnObject) {
            if (parser === null || parser === undefined) {
                parser = document.createElement('a');
            }
            parser.href = unparsedURI;
            if (returnObject) {
                return {
                    pathname: parser.pathname,
                    hash: parser.hash
                };
            }
            return parser.pathname + parser.hash;
        },

        /**
         * Process the url context using crossroads
         * This should be the hash being passed in
         */
        processContext: function (hash) {
            var hashSplit = hash.split('(');
            var hashSplitLength = hashSplit.length;
            var routeStart;
            var data = undefined;
            var entity = '';
            var view = '';

            // No split
            if (hashSplitLength === 1) {
                return {
                    data: '',
                    entity: '',
                    view: hash.split('/')[1]
                };
            }

            var hasView = function (hash) {
                var i = 1; // skip initial /
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
        },

        /**
         * gets the context for a ui5 app hash
         *
         * e.g. from '#/SalesOrder('pears')' or from '/api/some/url/index.html#/SalesOrder('pears')'
         * we will get the entity 'SalesOrder' & the data 'pears'
         *
         * e.g. from '#/S1/SalesOrder('12345')'
         * we will get the entity 'SalesOrder', the data '12345' and the view 'S1'
         *
         * @param unparsedURI
         * @returns {{entity: *, data: *, context_type: *, view: *}}
         */
        getContextFromUrl: function (unparsedURI, snapshotUILang) {

            if ((typeof unparsedURI !== 'undefined') && (unparsedURI.indexOf('#') > -1)) {

                var urlHash = unparsedURI.split('#')[1];

                var contextObject = this.processContext(urlHash);
                if (!contextObject.entity) contextObject.entity = '';
                if (!contextObject.view) contextObject.view = '';

                contextObject.context_type = snapshotUILang;
                return contextObject;

            }
            return {
                context_type: snapshotUILang,
                entity: '',
                data: '',
                view: ''
            };
        },

        /**
         * editUrlParameter
         * Update a url parameter given the url, a key and the new value
         *
         * @param currentUrl : the current full url being modified
         * @param key : the url property that prepends the value being cahnged (e.g. ../key/value)
         * @param value : the the value that will be placed in the url after the key
         * @param fullPath : (optional) - true            : return a full url path
         *                              - false (default) : return a relative url path
         * @returns returns the updated url path (or null if the function has failed)
         */
        editUrlParameter: function (currentUrl, key, value, fullPath) {
            // remove trailing characters
            var tempURL = currentUrl;
            tempURL = tempURL.split('/');

            // find the value to be change
            if (typeof key === 'string') {
                var keyIndex = tempURL.indexOf(key);
                if (keyIndex > -1) {
                    var index = keyIndex + 1;
                }
                else {
                    throw new Error('Cannot find parameter because the key is not present in the given URL');
                }
            }
            else {
                throw new Error('Cannot find parameter because the key is not a String');
            }
            // change the value in the url
            if (tempURL[index] !== undefined) {
                tempURL[index] = value;

                var newURL = tempURL.join('/');
                if (fullPath === undefined || fullPath === null || fullPath === false) {
                    return this.getRelativeURI(newURL);
                }
                return newURL;
            }
            throw new Error('Cannot replace \'value\' because the URL contained no initial value');
        },

        /**
         * verifyIframe
         * Ensures that a message from an iframe is from the iframe we created.
         *
         * @param iframeId : the id of the iframe we created
         * @param event : the message event we are verifying
         * @returns true if message is verified
         */
        verifyIframe: function (iframeId, event) {
            // Get the iframe
            var frame = document.getElementById(iframeId);
            // verify the origin of the iframe message
            return frame !== null &&
                ((event.origin === 'null' || event.origin === window.location.origin) &&
                event.source === frame.contentWindow);
        },

        /**
         * textCountValidation
         * Checks that given text doesn't exceed a given limit (safely)
         *
         * @param inputText : the text being checked
         * @param maxChars : the maximum number of characters allowed
         * @returns an object containing:
         *          max : the new maximum value for characters to allow for new lines
         *          remaining : the number of character that can still be added to the string within it's given limit
         */
        textCountValidation: function (inputText, maxChars) {
            if (inputText !== undefined) {
                // Fix for chrome/firefox counting carriage returns as two characters
                var maxLength = maxChars;
                var i = inputText.length;
                while (i--) {
                    if (inputText.charAt(i) === '\n') {
                        maxLength++;
                    }
                }
                var remainingCharacters = maxChars - inputText.length;
                return {
                    max: maxLength,
                    remaining: remainingCharacters
                };
            }
            return {
                max: maxChars,
                remaining: maxChars
            };
        },

        /**
         * shortenText
         * shortens given text to a given limit, to the last full word and adds an ellipses
         *
         * @param text : the text being shortened
         * @param limit : the maximum length of the shortened text
         * @returns returns the formatted text
         */
        shortenText: function (text, limit) {
            if (text.length > limit) {
                var limitedString = $filter('limitTo')(text, limit);
                // want the last full word
                var sliceEnd = 0;
                for (var i = limitedString.length; limitedString[i] !== ' ' && i >= 0; i--) {
                    sliceEnd = i;
                }
                if (sliceEnd > 0) {
                    limitedString = limitedString.slice(0, sliceEnd) + '...';
                }
                return limitedString;
            }
            return text;
        },

        /**
         * Broadcasts event to the file-upload control to clear the progress for the files specified.
         * @param aFiles List of the files that were uploaded - must have sequence numbers!
         */
        clearFileUploadProgress: function (scope, aFiles) {
            if (aFiles && aFiles.length) {
                var aSequenceNums = _.pluck(aFiles, 'sequence');
                scope.$broadcast('clear-file-upload-progress', aSequenceNums);
            }
        },

        /**
         * Creates an error message in the format of ' message : error '
         * dismiss on timeout and dismiss button set to true.
         *
         * @param {string} msg the text which should be displayed for this error
         * @param {*} [err] the error
         */
        showUiError: function (msg, err) {
            uiError.create({
                content: msg + (err ? ': ' + err : ''),
                dismissOnTimeout: true,
                dismissButton: true
            });
        }

    };

};
