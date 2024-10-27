/*
 * Title: Uptime Monitoring Application
 * Description: A RESTful API to monitor up or down time of users define links
 * Author: Mohammed Kofil
 * Date: 15-10-2024
 */

// Import dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handeleReqRes');
const environment = require('./helpers/environment');
const data = require('./lib/data');

// App object - module scaffolding
const app = {};

// testing file system
// @TODO - delete later
// data.create('test', 'newFile', { name: 'test', value: 'test with node' }, (err) => {
//     console.log('err was ', err);
// });

// data.read('test', 'newFile', (err, result) => {
//     console.log(result, err);
// });

// data.update('test', 'newFile', { name: 'test', value: 'test with Kofil' }, (err) => {
//     console.log('err was ', err);
// });

// data.delete('test', 'newFile', (err) => {
//     console.log('err was ', err);
// });
// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(environment.port, () => {
        console.log(`Listening to port ${environment.port}`);
    });
};

// handle Request Response
app.handleReqRes = handleReqRes;

// start server
app.createServer();
