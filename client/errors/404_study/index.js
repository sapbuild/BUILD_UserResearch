'use strict';

module.exports = angular.module('UserResearch')
    .config(function ($stateProvider) {
        $stateProvider.state('404Study', {
            url: '/study_notfound',
            templateUrl: './resources/norman-user-research-client/errors/404_study/404.html'
        });
    });
