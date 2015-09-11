'use strict';

// @ngInject
module.exports = function ($window, $rootScope, StudiesParticipate, uiError, $location) {
    $rootScope.baseUrl = $location.absUrl();
    var that = this;
    that.participates = [];
    that.showAllStudies = false;
    that.numOfHidden = 0;
    that.loading = true;
    that.baseUrl = $location.protocol() + '://' + $location.host() +
        ($location.port() ? ':' + $location.port() : '');
    that.newStudiesCount = 0;


    that.updateNewStudiesCounter = function () {
        that.newStudiesCount = that.participates.filter(function (study) {
            return study.hasInvited;
        }).length;
    };


    that.openStudy = function (projectId, studyId) {
        var link = that.baseUrl + '/norman/projects/' + projectId + '/research/participant/' + studyId;

        // mark as not-new when clicked
        that.participates.forEach(function (study) {
            if (studyId === study._id) study.hasInvited = false;
        });

        that.updateNewStudiesCounter();

        $window.open(link);
    };


    StudiesParticipate.query().$promise
        .then(function (res) {
            that.participates = that.participates.concat(res);
            that.updateNewStudiesCounter();
            that.loading = false;
        })
        .catch(function error(res) {
            that.loading = false;
            uiError.create({
                content: res.data.error,
                dismissOnTimeout: false
            });
        });
};
