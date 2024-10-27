/*
 * Title: NotFoundHandler
 * Description: A RESTful API to monitor up or down time of users define links
 * Author: Mohammed Kofil
 * Date: 18-10-2024
 */

// module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
    callback(404, {
        message: 'Your requested URL was Not Found',
        from: 'notFoundHandler',
    });
};

module.exports = handler;
