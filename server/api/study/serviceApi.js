'use strict';

var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;
var tp = require('norman-server-tp');
var _ = tp.lodash;
var registry = commonServer.registry;
var Study = require('./model').getModel();
var Promise = commonServer.Promise;
var serviceLogger = commonServer.logging.createLogger('study-service-api');
var QuestionApi = require('../question/serviceApi');
var snapshotService;

/**
 * gets the Relevant MetaData (url, thumbnailUrl, snapshotUILang and snapshotVersion) for a Study prototype
 *
 * @param study
 * @param task
 * @returns Promise
 */
function getSnapShotThumbnailAndUrl(study, task) {
    serviceLogger.info({
        study: study,
        task: task
    }, '>> getSnapShotThumbnailAndUrl()');

    var deferred = Promise.defer();
    if (!task) {
        var error = new NormanError('requires a Question');
        serviceLogger.warn('<< getSnapShotThumbnailAndUrl(), returning error', error);
        deferred.reject(error);
    }
    else if (task.type !== 'Task') {
        serviceLogger.info('<< getSnapShotThumbnailAndUrl(), Not a Task');
        deferred.resolve(task);
    }
    else if (!task.url || !task.thumbnail) {
        snapshotService = registry.lookupModule('SnapshotService');
        if (snapshotService !== undefined) {
            snapshotService.getSnapshots(study.projectId, task.snapshotVersion)
                .then(function (snapshots) {

                    if (snapshots && snapshots[0]) {
                        serviceLogger.info('getUrlsInSnapshot(), returning deeplinks for the snapshot');

                        task.url = snapshots[0].deepLinks[0].pageUrl;
                        task.thumbnail = snapshots[0].deepLinks[0].thumbnail;
                        task.snapshotUILang = snapshots[0].snapshotUILang;
                        if (snapshots[0].isSmartApp) {
                            task.isTargetable = false;
                        }

                        deferred.resolve(task);
                    }
                    else {
                        serviceLogger.info('<< getSnapShotThumbnailAndUrl(), Prototype service not installed');
                        deferred.reject();
                    }
                });
        }
        else {
            serviceLogger.info('<< getSnapShotThumbnailAndUrl(), Prototype service not installed');
            deferred.reject();
        }

    }
    else {
        serviceLogger.info('<< getSnapShotThumbnailAndUrl(), Task has url and Thumbnail');
        deferred.resolve(task);
    }

    return deferred.promise;
}

/**
 * Create a new Study
 *
 * @param userId
 * @param projectId
 * @param study
 * @returns Promise
 */
function create(userId, projectId, study) {
    serviceLogger.info({
        userId: userId,
        study: study,
        projectId: projectId
    }, '>> create()');
    var deferred = Promise.defer();

    if (!userId || !projectId || !study) {
        var error = new NormanError('invalid arguments');
        serviceLogger.warn('<< create(), returning error', error);
        deferred.reject(error);
    }
    else {

        study._id = commonServer.utils.shardkey();
        study.createBy = userId;
        study.projectId = projectId;

        Study
            .create(study, function (err, stud) {
                if (err) {
                    serviceLogger.warn('<< create(), returning error', err);
                    deferred.reject(err);
                }
                serviceLogger.info({
                    study: stud
                }, '<< create()');
                deferred.resolve(stud);
            });
    }
    return deferred.promise;

}

/**
 * Create a new Study with a Question or Task
 *
 * @param userId
 * @param projectId
 * @param study
 * @param question
 * @returns Promise
 */
function createWithQuestion(userId, projectId, study, question) {
    serviceLogger.info({
        userId: userId,
        projectId: projectId,
        study: study,
        question: question
    }, '>> createWithQuestion()');


    var deferred = Promise.defer();

    if (!userId || !projectId || !study || !question) {
        var error = new NormanError('invalid arguments');
        serviceLogger.warn('<< createWithQuestion(), returning error', error);
        deferred.reject(error);
    }
    else {
        var newStudy;
        create(userId, projectId, study)
            .then(function (stud) {
                newStudy = stud;
                if (!question.type) {
                    question.type = 'Task';
                }
                if (!question.name && question.type === 'Task') {
                    question.name = 'Task 1';
                }
                else if (!question.name) {
                    question.name = 'Question 1';
                }
                question.interactive = true;
                question.ordinal = question.ordinal || 0;
                serviceLogger.info('<< serviceApi createWithQuestion()');
                return getSnapShotThumbnailAndUrl(stud, question);
            })
            .then(function (quest) {
                serviceLogger.info('<< serviceApi createWithQuestion()');
                return QuestionApi.createQuestions(newStudy._id, quest);
            })
            .then(function (questions) {
                newStudy.questions.push(questions);
                serviceLogger.info({
                    questions: questions
                }, '<< createWithQuestion() QuestionApi.createQuestions');
                deferred.resolve(newStudy);

            })
            .catch(function (err) {

                serviceLogger.warn('<< createWithQuestion(), returning error', err);
                deferred.reject(err);
            });
    }

    return deferred.promise;

}

/**
 * Get all studies for a project
 *
 * @param userId
 * @param projectId
 * @returns Promise
 */
function getStudiesForProject(userId, projectId) {
    serviceLogger.info({
        userId: userId,
        projectId: projectId
    }, '>> getStudiesForProject()');

    var deferred = Promise.defer();

    if (!userId || !projectId) {
        var error = new NormanError('invalid arguments');
        serviceLogger.warn('<< getStudiesForProject(), returning error', error);
        deferred.reject(error);
    }
    else {
        Study
            .find({
                projectId: projectId,
                deleted: false
            })
            .sort({publishTime: -1, updateTime: -1})
            .lean()
            .select('name description snapshotId createBy projectId createTime questions annotations answers participants status publishTime updateTime')
            .exec(function (err, studies) {

                if (err) {
                    serviceLogger.warn('<< getStudiesForProject(), returning error', err);
                    deferred.reject(err);
                }
                else if (!studies) {
                    serviceLogger.info('<< getStudiesForProject(), studies not found');
                    deferred.reject(null);
                }
                else {
                    studies.map(function (study) {
                        study.comments = study.annotations.filter(function (annotation) {
                            return !_.isEmpty(annotation.comment);
                        }).length;
                        study.annotations = study.annotations.length;
                        study.participants = study.participants.length;
                        return study;
                    });

                    serviceLogger.info({
                        studies: studies
                    }, '<< getStudiesForProject()');

                    deferred.resolve(studies);
                }
            });
    }
    return deferred.promise;
}

exports.create = create;
exports.createWithQuestion = createWithQuestion;
exports.getStudiesForProject = getStudiesForProject;
