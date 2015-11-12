[![Build](https://img.shields.io/travis/sapbuild/UserResearch.svg?style=flat-square)](http://travis-ci.org/sapbuild/UserResearch)
[![Version](https://img.shields.io/npm/v/norman-user-research-client.svg?style=flat-square)](https://npmjs.org/package/norman-user-research-client)
[![Dependency Status](https://david-dm.org/sapbuild/UserResearch.svg)](https://david-dm.org/sapbuild/UserResearch)
[![devDependency Status](https://david-dm.org/sapbuild/UserResearch/dev-status.svg)](https://david-dm.org/sapbuild/UserResearch#info=devDependencies)
[![Coverage](https://img.shields.io/coveralls/sapbuild/UserResearch/master.svg?style=flat-square)](https://coveralls.io/r/sapbuild/UserResearch?branch=master)
User Research
============
This module allows users to obtain feedbacks on their app.


### Installation

1. Clone git repository
    ```sh
    git clone https://github.wdf.sap.corp/Norman/UserResearch.git
    ```

2. Install required node modules (dependencies):
    ```sh
    npm install
    ```

3. Build and run:
    ```sh
    grunt serve     // build dev + start express server + watch js & less for changes (all that is needed for local dev)
    grunt dev       // just build in development mode
    grunt dist      // build for production
    grunt test      // run the karma(frontend) and mocha(backend) tests
    grunt test:e2e  // run the protractor end-to-end tests
    grunt eslint    // run the eslint checks for both the UI and server
    
    cd to sample/server   run node app.js  // starts the server with all your changes and runs any existing UI, saves you having to bundle and copy the UI during DB work
    ```

### Include as a module

1. Configure [Norman NPM registry](https://jam4.sapjam.com/wiki/show/kvLVqwLEg5DQorc6zsGIUh) - for installing norman modules with `npm`

2. Install the npm module:
    ```sh
    npm install norman-user-research-client norman-user-research-server
    ```

3. Include it in the client app: edit `client/requires.js`:
    ```js
    require('norman-user-research-client');
    ```

4. Include it in the server app: edit `server/requires.js`:
    ```js
    require('norman-user-research-server')(app);
    ```
    
5. To update the version of User Research you have in your app, run
    ```sh
    npm update norman-user-research-client norman-user-research-server
    ```

# BUILD on GitHub

[Click here](https://github.com/SAP/BUILD) to visit the central BUILD project on GitHub, where you can find out more!

[Click here](https://github.com/SAP/BUILD/blob/master/Contributing.md) to view the BUILD Contribution Guidelines. 

