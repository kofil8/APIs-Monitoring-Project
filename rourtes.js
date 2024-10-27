/*
 * Title: Routes
 * Description: A RESTful API to monitor up or down time of users define links
 * Author: Mohammed Kofil
 * Date: 18-10-2024
 */

// dependencies`
const { sampleHandler } = require('./handlers/routeHandler/sampleHandler');
const { userHandler } = require('./handlers/routeHandler/userHandler');
const { tokenHandler } = require('./handlers/routeHandler/tokenHandler');
const { checkHandler } = require('./handlers/routeHandler/checkHandler');

// module scaffolding
const routes = {
    sample: sampleHandler,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
};

module.exports = routes;
