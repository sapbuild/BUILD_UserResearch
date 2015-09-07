'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * Filter to display all comments grouped by context in Smart template mode
 * Move all comments from the current context to the top of that list
 */

// @ngInject
module.exports = function () {

    /**
     * Returns the filtered list of annotations for the specified prototype.
     *
     * @param annotations the list of annotations to be filtered.
     * @param context the current context to filter against.
     * @param prototypeLang the language associated with the prototype.
     * @param showAll indicates if all annotations are to be displayed and no filter applied.
     * @param showAllAnnotationsForContextAndData indicates if the annotations are to be filtered by both context and data.
     */
    return function (annotations, context, prototypeLang, showAll, showAllAnnotationsForContextAndData) {


        // if there is no context, or we are showing all annotations, or the prototype language isn't UI5, then
        // no need to filter the annotations.
        if (_.isNull(context) || showAll || prototypeLang !== 'UI5') {
            return annotations;
        }

        var annotationArray = [];
        var filteredAnnotationArray = [];

        Object.keys(annotations).forEach(function (key) {
            annotationArray.push(annotations[key]);
        });

        _.forEach(annotationArray, function (annotation) {
            if (!showAllAnnotationsForContextAndData) {
                if (annotation.context.entity === context.entity) {
                    filteredAnnotationArray.push(annotation);
                }
                // check if the context entity or view matches the annotaions entity or view (which ever is defined)
            } else if (((typeof context.entity !== 'undefined' && annotation.context.entity === context.entity) &&
                (typeof context.view !== 'undefined' && annotation.context.view === context.view)) && annotation.context.data === context.data) {
                filteredAnnotationArray.push(annotation);
            }
        });

        // Sort the items to ensure those with context data matching the current context are displayed first.
        return _.sortBy(filteredAnnotationArray, function (annotation) {
            return annotation.context.entity === context.entity && annotation.context.data === context.data ? -1 : 1;
        });
    };
};
