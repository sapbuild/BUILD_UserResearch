/**
 * Study
 * @module /api/studies
 */
/**
 * Using Rails-like standard naming convention for endpoints.
 * <pre>
 * GET     /studies              ->  index
 * GET     /studies/participate  ->  participate
 * POST    /studies              ->  create
 * GET     /studies/:id          ->  show
 * PUT     /studies/:id          ->  update
 * DELETE  /studies/:id          ->  destroy
 * </pre>
 */

'use strict';

var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;
var tp = require('norman-server-tp');
var _ = tp.lodash;
var model = require('./model');
var Study = model.getModel();
var Question = require('../question/model').getModel();
var validate = require('./validate');
var sendError = require('../../utils').sendError;
var update = require('../../utils').update;
var orderListByOrdinal = require('../../utils').orderListByOrdinal;
var serviceLogger = commonServer.logging.createLogger('study-ctrl');
var anonymousService = require('../tracking/anonymous.service');
var StudyApi = require('./serviceApi');
var MailUtil = require('../../MailUtility');
var mailer = commonServer.Mailer;
var mailOptions = MailUtil.mailOptions;
var path = require('path');
var registry = commonServer.registry;
/**
 * Get list of studies
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.index = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> index() ');

    StudyApi.getStudiesForProject(req.user._id, req.urlParams.projectId)
        .then(function (studies) {
            if (!studies) {
                serviceLogger.error('<< index(), studies not found');
                return res.status(404).json();
            }
            serviceLogger.info('<< index(), returning studies');
            return res.status(200).json(studies);
        });
};


/**
 * Get a single study
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.show = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> show() ');

    Study
        .findById(req.params.id)
        .lean()
        .exec(function (err, study) {
            if (err) {
                serviceLogger.error('<< show(), error getting study');
                return sendError(res, err);
            }

            if (!study || study.deleted) {
                serviceLogger.error('<< show(), study not found');
                return res.status(404).json();
            }

            anonymousService.anonymousUsers(study)
                .then(function (avatars) {
                    study.participants = avatars;
                    study.questions = _.sortByAll(study.questions, ['ordinal', 'subOrdinal'], [true, true]);
                    serviceLogger.info('<< show(), returning study');
                    return res.status(200).json(study);
                })
                .catch(function (er) {
                    serviceLogger.error('<< show(), error getting user details for study, ' + er);
                    return res.status(500).json(er);
                });
        });
};


/**
 * Create a new study in the DB
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.create = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> create() ');

    var newStudy = new Study(req.body);
    newStudy.createBy = req.user._id;
    newStudy.projectId = req.urlParams.projectId;

    //  validate module
    newStudy.validate(function (err) {
        if (err) {
            serviceLogger.warn('<< create() returning validation error', err);
            return sendError(res, 400, err);
        }
    });


    StudyApi
        .create(req.user._id, req.urlParams.projectId, newStudy)
        .then(function (study) {
            return res.status(201).json(study);
        })
        .catch(function (err) {
            serviceLogger.warn('<< create(), returning error', err);
            return sendError(res, err);
        });
};


/**
 *  creates a Study with a task/question by passing a study name,
 *  description , a task type and a snapshotVersion. Question type
 *  defaults to task, question name defaults to 'Task 1' for type task
 *  and 'Question 1' for any other type
 *
 *  Question/Task Thumbnail and Url (which is the start Url for a task) is
 *  obtained from the first page of the appMetaData retrieved using the PrototypeService
 *
 *  Example of Post Data Require :
 *  {
 *      name: 'study name',
 *      description: 'some description',
 *      snapshotVersion: 1, // this is used to retrieve the AppMetaData
 *      type: 'Task', // optional -> is 'Task' by default
 *      questionName : 'question name', //optional 'Task 1' or 'Question 1' by Default depending on type
 *      url: 'some/url', // optional - > this is the start url for the task, if not present it is the 1st page retrieved from the AppMetaData,
 *      thumbnailUrl : 'some/pic/url' // optional ->  if not present it is the retrieved from the 1st page in the AppMetaData
 *  }
 *
 * @param req
 * @param res
 */
exports.createWithQuestion = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> createWithQuestion() ');

    if (!req.body.snapshotVersion) {
        var errMsg = 'A snapshotVersion is required';
        serviceLogger.warn('<< createWithQuestion() returning validation error on study', errMsg);
        return sendError(res, 400, errMsg);
    }
    var study = new Study();
    study.projectId = req.urlParams.projectId;
    study.name = req.body.name;
    study.description = req.body.description;

    var task = {
        url: req.body.url,
        name: req.body.questionName,
        snapshotVersion: req.body.snapshotVersion,
        type: 'Task',
        interactive: true
    };

    //  validate module
    study.validate(function (err) {
        if (err) {
            serviceLogger.warn('<< createWithQuestion() returning validation error on study', err);
            return sendError(res, 400, err);
        }
    });

    StudyApi
        .createWithQuestion(req.user._id, req.urlParams.projectId, study, task)
        .then(function (stud) {
            var newTask = Question(task);
            newTask.validate(function (err) {
                if (err) {
                    serviceLogger.warn('<< createWithQuestion() returning validation error on question', err);
                    return sendError(res, 400, err);
                }
            });
            serviceLogger.info('<< createWithQuestion(), Success');
            return res.status(201).json(stud);
        })
        .catch(function (err) {
            serviceLogger.warn('<< create(), returning error', err);
            return sendError(res, err);
        });
};

/**
 * Update an existing study in the DB
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.update = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> update() ');

    if (req.body._id) {
        delete req.body._id;
    }
    Study
        .findById(req.params.id, function (err, study) {
            if (err) {
                serviceLogger.warn('<< update(), returning error', err);
                return sendError(res, err);
            }
            if (!study) {
                serviceLogger.warn('<< update(), study not found');
                return res.status(404).json();
            }

            if (req.body.status === 'published' && study.status !== 'published') {
                // user wants to publish the study, need to update the published date
                study.publishTime = new Date();
            }

            // Old studies without publishTime need to be updated
            // Check that study is published and there is no publishTime
            // In this case use updateTime as publishTime.
            if (study.status === 'published' && !study.publishTime) {
                study.publishTime = study.updateTime;
            }


            // validate and send back result after updating the study
            var valid = validate.isValid(study, req.body);
            if (valid !== true) {
                serviceLogger.warn('update(), errors found, ' + valid);
                return res.status(400).json(valid); // send errors list
            }

            // set the update stats for the study
            study.updateTime = new Date();
            study.updateBy = req.user._id;

            update(study, req.body, 'name description status');
            // fix the stored order of the questions once published
            if (req.body.status === 'published') {
                study.questions = orderListByOrdinal(study.questions);
            }
            study.save(function (er) {
                if (er) {
                    return sendError(res, er);
                }
                serviceLogger.info('<< update(), returning study');
                return res.status(200).json(study);
            });
        });
};

/**
 * Deletes a study from the DB
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.destroy = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> destroy() ');

    Study
        .findById(req.params.id, function (err, study) {
            if (err) return sendError(res, err);
            if (!study) return res.status(404).json();

            study.deleted = true;
            study.save(function (er) {
                if (er) {
                    return sendError(res, er);
                }
                serviceLogger.info('<< destroy(), returning 204');
                return res.status(204).json();
            });
        });
};


/**
 * Handler for project deletion - Delete all project related studies
 * @param {String} projectId
 * @returns The number of deleted studies
 */
exports.onProjectDeleted = function (projectId) {
    serviceLogger.debug({
        projectId: projectId
    }, '>> onProjectDeleted()');
    return Promise.resolve(Study.remove({
        projectId: projectId
    }).exec())
        .then(function (nbStudies) {
            serviceLogger.info('<< onProjectDeleted(), study deleted');
            return nbStudies;
        })
        .catch(function (error) {
            var normanError = new NormanError('Failed to delete studies for project ' + projectId, error);
            serviceLogger.error(normanError);
            throw normanError;
        });
};

/**
 * Handler for changes on user
 *
 * @param {String} userId
 * @param {Object} changeInfo
 * @returns {*}
 */
exports.onUserGlobalChange = function (userId, changeInfo) {

    serviceLogger.debug({
        userId: userId,
        changeInfo: changeInfo
    }, '>> onUserGlobalChange');

    // Nothing to do if the action is not 'delete'
    if (!changeInfo || !changeInfo.action || changeInfo.action !== 'delete') {
        serviceLogger.info('<< onUserGlobalChange(), nothing to be done');
        return Promise.resolve(userId);
    }

    // Ensure annotations exist, annotation an object and contains a comment field
    var queryParam = {
        'participants._id': userId,
        $and: [{annotations: {$type: 3, $exists: true}}, {'annotations.comment': {$type: 2, $exists: true}}]
    };

    // Find studies based on queryParam, restrict to only returning annotations
    return Promise.resolve(Study.find(queryParam, {_id: 1, annotations: 1}).exec())
        .then(function (studies) {
            var promises = [];
            studies.forEach(function (study) {

                // Reset comment per annotation
                _.forEach(study.annotations, function (annotation) {
                    if (annotation.createBy && annotation.createBy.toString() === userId.toString()) {
                        annotation.comment = '';
                    }
                });

                // Track changes
                study.updateBy = userId;
                study.updateTime = new Date();

                var savePromise = Promise.invoke(study, 'save')
                    .catch(function (error) {
                        var normanError = new NormanError('Failed to delete feed back from user ' + userId + ' in study ' + study._id, error);
                        serviceLogger.error(normanError);
                        throw normanError;
                    });
                promises.push(savePromise);
            });
            return Promise.waitAll(promises);
        })
        .then(function (results) {
            serviceLogger.info('<< onUserGlobalChange(), studies found and updated ' + (Array.isArray(results) && results.length) || 0);
            return userId;
        })
        .catch(function (error) {
            var normanError = new NormanError('Deleting feed back in studies for user ' + userId, error);
            serviceLogger.error('<< onUserGlobalChange() ', normanError);
            throw normanError;
        });
};

exports.checkSchema = function (done) {
    model.createIndexes(done);
};

/**
 * Invite user to the study.
 * Main purpose for this function is to invite user and send invitation email to the User for the Study.
 * First: Make API call to Access Service to save email address as white-list for self-registration process.
 * Each successful provisioned email will receive invitation email and added to the study invite_user list.
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.sendInvitee = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> sendInvitee() ');


    //  SAP ID call for emails white-list
    var inviteeEmailList = [];
    _.forEach(req.body.inviteList, function (email) {
        inviteeEmailList.push(email.email);
    });

    var newInvitee = [];
    var toInviteeEmails = '';
    var doSendEmail = false;
    var accessService = registry.getModule('AccessService');
    accessService.inviteUsers(inviteeEmailList, 'study', req.context)
        .then(function (apiResponse) {

            Study.findOne({_id: req.params.id}).populate('invite_list').exec(function (err, study) {
                if (err) {
                    serviceLogger.info('<< sendInvitee(), err found, ' + err);
                    return sendError(res, err);
                }
                if (!study) {
                    serviceLogger.info('<< sendInvitee(), study not found');
                    return res.status(404).json({message: 'Study not found.'});
                }

                if (!study.invite_list) study.invite_list = [];

                // Loop the response from api and separate , successfullyProvisioned and opt-out for further process
                _.forEach(apiResponse, function (email) {
                    if (email.successfullyProvisioned) {

                        if (!email.acceptNotification) {
                            newInvitee.push({email: email.emailAddress, status: 'opt-out'});

                        }
                        else {
                            // If has any invitee then send email
                            doSendEmail = true;
                            if (_.findIndex(study.invite_list, function (invitee) {
                                    return invitee.email === email.emailAddress;
                                }) === -1) {
                                newInvitee.push({email: email.emailAddress, status: 'sent'}); //   added to new invitee list so we can return only new invitee
                                study.invite_list.push({email: email.emailAddress, status: 'sent'});
                                toInviteeEmails += email.emailAddress + ';';
                            }
                            else {
                                newInvitee.push({email: email.emailAddress, status: 'rejected'});
                            }
                        }
                    }
                    else {
                        newInvitee.push({email: email.emailAddress, status: 'rejected'});
                    }
                });

                if (!doSendEmail) {
                    // Only save the study here don't need to send email
                    study.markModified('invite_list');
                    study.save(function (er) {
                        if (er) {
                            serviceLogger.info('<< sendInvitee(), err found, ' + er);
                            return sendError(res, er);
                        }
                        serviceLogger.info('<< sendInvitee(), returning 201');
                        return res.status(201).json({newInvitee: newInvitee});
                    });

                }
                else {
                    // Send email first and then save the study
                    var studyUrl = req.headers.origin + '/norman/projects/' + study.projectId + '/research/participant/' + study._id;
                    var emailTemplateData = {};
                    emailTemplateData.study_name = study.name;
                    emailTemplateData.study_description = study.description || 'No study description available';
                    emailTemplateData.study_url = studyUrl;
                    emailTemplateData.study_creator_name = req.context.user.name;
                    emailTemplateData.study_creator_email = req.context.user.email;

                    var _mailOptions = JSON.parse(JSON.stringify(mailOptions));
                    _mailOptions.bcc = toInviteeEmails;
                    var emailTempPath = path.resolve(__dirname, 'email_templates/' + 'study_invitation_email.tlp');
                    mailer.render(emailTempPath, {info: emailTemplateData})
                        .then(function (emailTemplate) {
                            _mailOptions.html = emailTemplate;
                            _mailOptions.subject = 'Invitation to Study';
                            _mailOptions.from = 'do.not.reply@example.com';

                            //  Send email
                            mailer.send(_mailOptions, function onError(err2) {
                                serviceLogger.error('<< sendInvitee(), unable to send invitation email', err2);
                                return res.status(500).json({message: 'We couldn&rsquo;t send any invitations because one or more addresses are invalid. Please delete any you aren’t sure of, and try again.'});
                            }, function onSuccess(info) {
                                serviceLogger.info('sendInvitee() mail sent', info);
                                // Some of email might rejected, we need to inform user
                                if (info.rejected) {
                                    _.forEach(info.rejected, function (rejectedEmail) {

                                        var i = _.findIndex(study.invite_list, function (studyInviteeList) {
                                            return studyInviteeList.email === rejectedEmail;
                                        });

                                        if (i > -1) {
                                            study.invite_list.splice(i, 1);
                                        }

                                        // Update status in newInvitee
                                        i = _.findIndex(newInvitee, function (studyInviteeList) {
                                            return studyInviteeList.email === rejectedEmail;
                                        });

                                        if (i > -1) {
                                            newInvitee.splice(i, 1, {email: rejectedEmail, status: 'rejected'});
                                        }
                                    });

                                }

                                study.markModified('invite_list');
                                study.save(function (er) {
                                    if (er) {
                                        serviceLogger.info('<< sendInvitee(), err found, ' + er);
                                        return sendError(res, er);
                                    }
                                    serviceLogger.info('<< sendInvitee(), returning 201');
                                    return res.status(201).json({newInvitee: newInvitee});
                                });
                            });

                        }).catch(function (err3) {
                            serviceLogger.error(new NormanError('<< sendInvitee(), failed to load email template', err3));
                            return sendError(res, err3);
                        });
                }
            });
        })
        .catch(function (apiErr) {
            serviceLogger.warn('<< sendInvitee(), error consuming accessService.inviteUsers api, ' + apiErr);
            return sendError(res, apiErr);
        });
};

