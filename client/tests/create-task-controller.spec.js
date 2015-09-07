'use strict';

describe('Unit tests for createTask controller', function () {
    var scope;

    /*** SETUP ************************************************************************************/
    beforeEach(module('UserResearch'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('common.utils'));
    beforeEach(module('UserResearch.utils'));
    beforeEach(module('shell.aside'));
    beforeEach(module('shell.dashboard'));
    beforeEach(module('shell.projectLandingPage'));
    beforeEach(module('ngResource'));
    beforeEach(module('zip'));


    beforeEach(module('ngResource'));

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        $controller('CreateTaskCtrl', {
            $scope: scope
        });
    }));

    /*** SETUP ************************************************************************************/



    /*** TESTS ************************************************************************************/


    // fix for cancelled processing of prototype preventing subsequent prototypes from being added
    it('should reset the uploadCancelled flag when a new upload starts', function () {
        scope.uploadCancelled = true;
        scope.fileInputChange({});
        expect(scope.uploadCancelled).to.be.false;
    });

});
