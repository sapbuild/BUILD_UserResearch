
/*global chai, sinon, inject */
/*eslint no-unused-expressions:0 */
'use strict';
var expect = chai.expect;
var userResearchModule;

describe('User Research>> Dependencies test for ParticipantInvitationDirectiveCtrl', function () {
    before(function () {
        userResearchModule = angular.module('UserResearch');
    });

    it('User Research module should be registered', function () {
        expect(userResearchModule).not.to.equal(null);
    });


    it('should have a ParticipantInvitationDirectiveCtrl controller', function () {
        expect(userResearchModule.ParticipantInvitationDirectiveCtrl).not.to.equal(null);
    });

});


describe('Unit tests for ParticipantInvitationDirectiveCtrl', function () {
    var scope, uiErrorSpy,
        httpBackend,
        uiError = {
            create: function () {}
        },
    // Mock data
        stateParams = {
            questionId: 'questionId1',
            studyId: 'studyId',
            currentProject: 'projectId'
        },
        currentStudy = {
            name: 'test',
            description: 'test description',
            participants: [{_id: 'participant1', name: 'John Doe', avatar_url: 'http://api'}, {_id: 'participant2', name: 'John Two', avatar_url: 'http://api'}],
            status: 'draft',
            _id: stateParams.studyId,
            questions: [{
                _id: 'questionId1',
                text: 'url1 question1',
                ordinal: 0,
                url: 'url1'
            }, {
                _id: 'questionId2',
                text: 'url2 question1',
                ordinal: 1,
                url: 'url2'
            }]
        },
        approvedEmails = {
            newInvitee: [{
                email: 'a@a.com',
                status: 'sent'
            }, {
                email: 'a@b.com',
                status: 'sent'
            }]
        },
        failedEmails = {
            newInvitee: [{
                email: 'a@a.com',
                status: 'opt-out'
            }, {
                email: 'a@b.com',
                status: 'rejected'
            }]
        };

    beforeEach(module('UserResearch'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('shell.aside'));
    beforeEach(module('shell.dashboard'));
    beforeEach(module('shell.projectLandingPage'));

    beforeEach(module('ngResource'));
    beforeEach(module(function ($provide) {
        $provide.value('$stateParams', stateParams);
    }));

    beforeEach(inject(function ($injector, $rootScope, $timeout, $controller, $q, $httpBackend) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();

        $controller('ParticipantInvitationDirectiveCtrl', {
            $scope: scope,
            $stateParams: stateParams,
            uiError: uiError,
            Studies: {
                currentStudy: currentStudy,
                sendInvitee: function () {
                    var deferred = $q.defer();
                    if (scope.responseType === 'get successful fake response') {
                        deferred.resolve(approvedEmails);
                    }
                    else {
                        deferred.resolve(failedEmails);
                    }
                    return {$promise: deferred.promise};
                }
            }
        });

    }));

    /*** TESTS ************************************************************************************/
    it('should initialize variables', function () {
        expect(scope.countNewInvite).to.equal(0);
        expect(scope.inviteList.length).to.equal(scope.countNewInvite);
    });


    it('should have a properly working ParticipantInvitationDirectiveCtrl controller', function () {
        // new new email
        var email1 = 'a@a.com';
        var email2 = 'a@b.com';
        var emailToRemove = email2;

        scope.addInvitee(email1);
        expect(scope.inviteList.length).to.equal(1);
        expect(scope.countNewInvite).to.equal(1);

        scope.addInvitee(email2);
        expect(scope.inviteList.length).to.equal(2);
        expect(scope.countNewInvite).to.equal(2);

        scope.removeInvite(emailToRemove);
        expect(scope.inviteList.length).to.equal(1);
        expect(scope.countNewInvite).to.equal(1);

        scope.addInvitee(email2);
        expect(scope.inviteList.length).to.equal(2);
        expect(scope.countNewInvite).to.equal(2);

        uiErrorSpy = sinon.spy(uiError, 'create');

        scope.addInvitee(email1);
        expect(scope.inviteList.length).to.equal(2);
        expect(scope.countNewInvite).to.equal(2);
        uiErrorSpy.should.have.been.calledWith({ content: 'You’ve already added this email!' });

        // Regex Test
        var pattern = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])+/;

        var validEmail = 'validEmail@example.com';
        expect(pattern.test(validEmail)).to.be.true;

        validEmail = 'validEmail@example.co.uk';
        expect(pattern.test(validEmail)).to.be.true;

        // Negative Regex Test
        var invalidEmail = 'nvalidEmail@';
        expect(pattern.test(invalidEmail)).to.be.false;

        invalidEmail = '@.example.com';
        expect(pattern.test(invalidEmail)).to.be.false;

        invalidEmail = 'nvalidEmail@...com';
        expect(pattern.test(invalidEmail)).to.be.false;

        invalidEmail = 'nvalidEmail.example..com';
        expect(pattern.test(invalidEmail)).to.be.false;

        invalidEmail = 'nvalidEmail.example.com';
        expect(pattern.test(invalidEmail)).to.be.false;

        invalidEmail = 'nvalidEmail.example.c';
        expect(pattern.test(invalidEmail)).to.be.false;

    });

    it('should have a successful send functionality', function () {
        // new new email
        var email1 = 'a@a.com';
        var email2 = 'a@b.com';

        scope.addInvitee(email1);
        expect(scope.inviteList.length).to.equal(1);
        expect(scope.countNewInvite).to.equal(1);

        scope.addInvitee(email2);
        expect(scope.inviteList.length).to.equal(2);
        expect(scope.countNewInvite).to.equal(2);

        expect(scope.inviteList[0].status).to.equal('new');
        expect(scope.inviteList[1].status).to.equal('new');

        scope.responseType = 'get successful fake response';
        scope.sendInvitee();
        scope.$apply();
        expect(scope.inviteList[0].status).to.equal('sent');
        expect(scope.inviteList[1].status).to.equal('sent');
        expect(scope.countNewInvite).to.equal(0);

    });

    it('should have a opt-out and rejected users - send functionality', function () {
        var email1 = 'a@a.com';
        var email2 = 'a@b.com';

        scope.addInvitee(email1);
        expect(scope.inviteList.length).to.equal(1);
        expect(scope.countNewInvite).to.equal(1);

        scope.addInvitee(email2);
        expect(scope.inviteList.length).to.equal(2);
        expect(scope.countNewInvite).to.equal(2);

        expect(scope.inviteList[0].status).to.equal('new');
        expect(scope.inviteList[1].status).to.equal('new');

        scope.responseType = 'get unsuccessful fake response';
        scope.sendInvitee();
        scope.$apply();
        expect(scope.inviteList[0].status).to.equal('rejected');
        expect(scope.inviteList[1].status).to.equal('opt-out');
        expect(scope.countNewInvite).to.equal(0);
        uiErrorSpy.should.have.been.calledWith({
            content: [{ message: 'a@b.com', name: 'Email', value: 'a@b.com' }],
            title: 'These email addresses below can’t currently be added. If you’re sure they are valid, contact the Build Administrator.'
        });
        uiErrorSpy.should.have.been.calledWith({
            content: [{ message: 'a@a.com', name: 'Email', value: 'a@a.com' }],
            title: 'The owners of the following email addresses have told the Build team they don’t want to receive e-mail notifications, so they have not been invited to participate in your study:'
        });
    });



    /*** TESTS ************************************************************************************/

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });
});
