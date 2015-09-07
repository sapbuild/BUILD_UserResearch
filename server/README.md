[norman-user-research-server](https://github.wdf.sap.corp/Norman/UserResearch)
============
This module allows users to obtain feedbacks on their app.

### Include as a module

1. Configure [Norman NPM registry](https://jam4.sapjam.com/wiki/show/kvLVqwLEg5DQorc6zsGIUh) - for installing norman modules with `npm`

2. Install the npm module:
    ```sh
    npm install norman-user-research-server
    ```

3. Include it in the server app: edit `server/requires.js`:
    ```js
    require('norman-user-research-server')(app);
    ```
