'use strict';
module.exports = {
    options: {
        paths: [ 'client' ]
    },
    dev: {
        options: { compress: false },
        files: {
            'dev/assets/style.css': [
                'node_modules/norman-client-tp/node_modules/angular-sap-ui-elements/styles/*base.less',
                'node_modules/norman-client-tp/node_modules/angular-sap-ui-elements/ui-elements/**/*.less',

                'client/**/*.less',

                'node_modules/norman-*/!(node_modules)/**/*.less'
            ]
        }
    }
};
