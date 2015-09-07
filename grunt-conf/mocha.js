'use strict';
module.exports = {

    options: {
        reporter: 'mocha-jenkins-reporter',
        coverageFolder: 'reports/coverage/server',
        mask: '**/*.spec.js',
        root: './server/',
        reportFormats: ['lcov'],
        check: {
            statements: 76,
            branches: 64,
            functions: 73,
            lines: 76
        }
    },

    src: [
    'test/int/server/*.spec.js'
    ]
};
