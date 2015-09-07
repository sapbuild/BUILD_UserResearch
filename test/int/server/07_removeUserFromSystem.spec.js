'use strict';

var expect = require('norman-testing-tp').chai.expect;
var TestUserContext = require('../api/TestUserContext');
var USER_ONE = new TestUserContext();
var USER_TWO = new TestUserContext();
var StudyRestApi = require('../api/StudyRestApi');
var QuestionRestApi = require('../api/QuestionRestApi');
var ParticipantRestApi = require('../api/ParticipantRestApi');
var ParticipantApi = new ParticipantRestApi();
var StudyApi = new StudyRestApi();
var QuestionApi = new QuestionRestApi();

describe('onGlobal Cleanup Tests', function () {
    this.timeout(30000);
    var USER_ONE_EMAIL = 'userOne_' + new Date().getTime() + '@sap.test';
    var USER_TWO_EMAIL = 'userTwo_' + new Date().getTime() + '@sap.test';
    var USER_TWO_ID;
    var PASSWORD = 'Minisap!1';
    var PROJECT_NAME = 'QuestionTasks Test ' + new Date().getTime();
    var projectId;
    var questionIdOne;
    var questionIdTwo;
    var questionIdThree;
    var annotationOne = {
        comment: 'annotation',
        absoluteX: 50,
        absoluteY: 60
    };
    var annotationTwo = {
        comment: 'annotation',
        absoluteX: 50,
        absoluteY: 60
    };
    var annotationThree = {
        comment: 'annotation',
        absoluteX: 50,
        absoluteY: 60
    };
    var studyName;
    var studyId;
    var question = {
        text: 'question',
        url: 'url',
        ordinal: 0,
        subOrdinal: 0,
        answerOptions: [],
        answerIsLimited: false,
        answerLimit: null,
        allowMultipleAnswers: false,
        targetURL: [],
        isTargetable: true
    };

    before('Initialize API users and set Up test data', function (done) {

        // Steps to setup and create data
        // Step 1. Create User one
        USER_ONE.initialize(USER_ONE_EMAIL, PASSWORD)
            .then(function () {
                return USER_ONE.me(200);
            })
            .then(function (res) {
                // Step 1. Create User two
                expect(res.body).not.to.be.empty;
                return USER_TWO.initialize(USER_TWO_EMAIL, PASSWORD);
            })
            .then(function () {
                return USER_TWO.me(200);
            })
            .then(function (res) {
                USER_TWO_ID = res.body._id;
                // Step 1. Create Project
                return StudyApi.createProject(USER_ONE, {name: PROJECT_NAME}, 201)
            })
            .then(function (res) {
                // Step 1. Create Study from project
                expect(res.body).to.not.be.empty;
                projectId = res.body._id;

                studyName = 'Annotation ' + new Date().getTime();
                return StudyApi.createStudy(USER_ONE, projectId, {
                    name: studyName,
                    description: 'description',
                    questions: [question]
                }, 201);
            })
            .then(function (res) {
                // Step 1. Confirm everything is ok
                expect(res.body).not.to.be.empty;
                expect(res.body.name).to.equal(studyName);
                expect(res.body.status).to.equal('draft');
                studyId = res.body._id;
                expect(studyId).not.to.be.empty;
            })
            .then(function () {
                // Step 1. Create Question One
                question.text = 'Question One';
                return QuestionApi.createQuestion(USER_ONE, projectId, studyId, question, 201)
            })
            .then(function (res) {
                // Step 1. Save question ID
                expect(res.body).not.to.be.empty;
                questionIdOne = res.body._id;
                annotationOne.questionId = questionIdOne;
                // Step 1. Create Question Two
                question.text = 'Question Two';
                return QuestionApi.createQuestion(USER_ONE, projectId, studyId, question, 201)
            })
            .then(function (res) {
                // Step 1. Save question ID
                expect(res.body).not.to.be.empty;
                questionIdTwo = res.body._id;
                annotationTwo.questionId = questionIdTwo;
                // Step 1. Create Question Three
                question.text = 'Question Three';
                return QuestionApi.createQuestion(USER_ONE, projectId, studyId, question, 201)
            })
            .then(function (res) {
                // Step 1. Save question ID
                expect(res.body).not.to.be.empty;
                questionIdThree = res.body._id;
                annotationThree.questionId = questionIdThree;
                // Step 1. Publish study, accepting default settings for questions
                return StudyApi.updateStudy(USER_ONE, projectId, studyId, {status: 'published'}, 200)
            })
            .then(function () {
                // Step 1. User One participates in the study
                return ParticipantApi.getStudyToParticipatedIn(USER_TWO, studyId, 200)
            })
            .then(function () {
                // Step 1. User Two participates in the study
                return ParticipantApi.getStudyToParticipatedIn(USER_TWO, studyId, 200)
            })
            .then(function () {
                // Step 1. User One adds a number of annotations - total of 3
                annotationOne.comment = 'user one comment - 1';
                ParticipantApi.addAnnotation(USER_ONE, studyId, annotationOne, 201);
                annotationTwo.comment = 'user one comment - 2';
                ParticipantApi.addAnnotation(USER_ONE, studyId, annotationTwo, 201);
                annotationThree.comment = 'user one comment - 3';
                return ParticipantApi.addAnnotation(USER_ONE, studyId, annotationThree, 201);
            })
            .then(function () {
                // Step 1. User Two adds a number of annotations - total of 3
                annotationOne.comment = 'user two comment - 1';
                ParticipantApi.addAnnotation(USER_TWO, studyId, annotationOne, 201);
                annotationTwo.comment = 'user two comment - 2';
                ParticipantApi.addAnnotation(USER_TWO, studyId, annotationTwo, 201);
                annotationThree.comment = 'user two comment - 3';
                return ParticipantApi.addAnnotation(USER_TWO, studyId, annotationThree, 201)
            })
            .then(function () {
                // Step 1. User Two participates in the study
                done();
            })
            .catch(done);
    });

    it('Ensure everything is setup', function (done) {
        StudyApi.getStudy(USER_ONE, projectId, studyId, 200)
            .then(function (res) {
                expect(res.body.annotations).to.be.an.instanceof(Array);
                expect(res.body.annotations.length).to.equal(6);
                expect(res.body.annotations[0].comment).to.equal('user one comment - 1');
                expect(res.body.annotations[1].comment).to.equal('user one comment - 2');
                expect(res.body.annotations[2].comment).to.equal('user one comment - 3');
                expect(res.body.annotations[3].comment).to.equal('user two comment - 1');
                expect(res.body.annotations[4].comment).to.equal('user two comment - 2');
                expect(res.body.annotations[5].comment).to.equal('user two comment - 3');
                expect(res.body.status).to.equal('published');
                done();
            })
            .catch(done);
    });

    it('Ensure onUserGlobalChange handles if context is not passed', function (done) {
        var studyCtrl = require('../../../server/api/study/controller');
        expect(studyCtrl).not.to.be.empty;
        studyCtrl.onUserGlobalChange(USER_TWO_ID, {action: 'wrong'})
            .then(function (user) {
                expect(user).to.equal(USER_TWO_ID);
                done();
            })
            .catch(done);
    });

    it('Delete user from the system and validate', function (done) {
        var studyCtrl = require('../../../server/api/study/controller');
        expect(studyCtrl).not.to.be.empty;
        studyCtrl.onUserGlobalChange(USER_TWO_ID, {action: 'delete'})
            .then(function () {
                return  StudyApi.getStudy(USER_ONE, projectId, studyId, 200);
            })
            .then(function (res) {
                expect(res.body.annotations).to.be.an.instanceof(Array);
                expect(res.body.annotations.length).to.equal(6);
                expect(res.body.annotations[0].comment).to.equal('user one comment - 1');
                expect(res.body.annotations[1].comment).to.equal('user one comment - 2');
                expect(res.body.annotations[2].comment).to.equal('user one comment - 3');
                expect(res.body.annotations[3].comment).to.equal('');
                expect(res.body.annotations[4].comment).to.equal('');
                expect(res.body.annotations[5].comment).to.equal('');
                expect(res.body.status).to.equal('published');
                expect(res.body.updateBy).to.equal(USER_TWO_ID);
                done();
            })
            .catch(done);
    });

});
