'use strict';
var _ = require('norman-client-tp').lodash;

// @ngInject
module.exports = function ($timeout, $state, $stateParams, Questions, QuestionValidator, uiError, urUtil) {
    return {
        restrict: 'E',
        scope: {
            study: '=',
            questionId: '=',
            questionDocumentId: '=',
            questionDocumentVersion: '=',
            questionOrdinal: '='
        },
        templateUrl: 'resources/norman-user-research-client/questions/directives/questionEdit/template.html',
        link: function (scope) {
            scope.maxQuestion = 6;
            scope.warningLevel = 30;

            // Triggered whenever the question ID changes
            scope.$watch('questionId', function () {
                if (scope.questionId) {
                    initQuestions();
                }
            });

            scope.updateTextCount = function (question) {
                var comment = question.text || '';
                var text = urUtil.textCountValidation(comment, 500);
                scope.remainingCharacters = text.remaining;
                scope.maxlength = text.max;
            };

            scope.$watch('tabSelected', function (newVal, oldVal) {
                // on tab switch, check if the old tab has a valid question before switching.
                if (oldVal) {
                    var questionToValidate = getQuestionForTab(oldVal);
                    if (!QuestionValidator.isValid(questionToValidate)) {
                        // Don't switch tabs if the current question isn't valid.
                        scope.tabSelected = oldVal;
                        scope.updateTextCount(questionToValidate);
                    }
                    else {
                        var newQuestion = getQuestionForTab(newVal);
                        scope.$emit('current-question', newQuestion);
                        scope.updateTextCount(newQuestion);
                    }
                }
            });

            if (!scope.study.$promise) {
                initQuestions();
            }
            else {
                scope.study.$promise.then(initQuestions);
            }

            /**
             * Update the scope with the question group, filtered by ordinal
             */
            function initQuestions(selected) {
                selected = (typeof selected !== 'number') ? selected = 0 : --selected;

                // Step 1.  Filter existing questions for study
                scope.questions = _.sortBy(_.filter(scope.study.questions, function (question) {
                    return question.ordinal === scope.questionOrdinal;
                }), 'subOrdinal');

                if (scope.questions && !_.isEmpty(scope.questions)) {
                    // Step 2. Set current question, these settings will be shared for all questions in the group
                    scope.currentQuestion = scope.questions[selected];
                    scope.currentUrl = scope.currentQuestion.url;
                    scope.currentDocumentId = scope.questionDocumentId;
                    scope.currentDocumentVersion = scope.questionDocumentVersion;
                    scope.currentOrdinal = scope.questionOrdinal;

                    // Step 3. Set text count
                    scope.updateTextCount(scope.currentQuestion);

                    $timeout(function () {
                        if (!selected) scope.tabSelected = 'tab-0';
                    });
                }
            }

            /**
             * Retrieves the question that is associated with the specified tab, for the current document.
             * @param tab the id of the tab whose question is to be retrieved.
             * @returns {*} the question associated with the supplied tab.
             */
            function getQuestionForTab(tab) {
                return scope.questions[parseFloat(tab.substring(tab.indexOf('tab-') + 4))];
            }

            scope.nb_annotations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            scope.change = function (question) {
                question.changed = true;
                scope.updateTextCount(question);
            };

            scope.update = function (question) {
                if (question.changed) {

                    if (question.type !== 'MultipleChoice' || (question.answerOptions.length > 1 && question.answerOptions[0] !== '' && question.answerOptions[1] !== '')) {
                        delete question.changed;
                        if ((question.type !== 'Annotation' && question.answerIsLimited) || (question.type === 'Annotation' && !question.answerIsLimited)) {
                            question.answerIsLimited = false;
                            question.answerLimit = null;
                        }
                        if (question.type === 'Annotation' && question.answerIsLimited && !question.answerLimit) {
                             question.answerLimit = 1;
                        }

                        if (question.type !== 'MultipleChoice') {
                            question.answerOptions = [];
                        }
                        if (question.$promise) {
                            question.$promise.then(function () {
                                question.$update();
                            });
                        }
                        else {
                            question = Questions.update(question);
                        }
                    }
                }
            };

            // multiple choice
            scope.addChoice = function (question) {
                if (question.answerOptions.length < 9) {
                    question.answerOptions.push('');
                    question.changed = true;
                    scope.update(question);
                }
                else {
                    uiError.create({
                        content: 'Multiple choice questions have a maximum of 9 options.',
                        dismissOnTimeout: true,
                        timeout: 3000,
                        dismissButton: true
                    });
                }
            };

            scope.deleteChoice = function (question, index) {
                question.answerOptions.splice(index, 1);
                question.changed = true;
                scope.update(question);
            };

        }
    };
};
