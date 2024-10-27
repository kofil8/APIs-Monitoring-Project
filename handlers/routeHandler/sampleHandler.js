/*
 * Title: SampleHandler
 * Description: A RESTful API to monitor up or down time of users define links
 * Author: Mohammed Kofil
 * Date: 18-10-2024
 */

// module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
    console.log(requestProperties);
    callback(200, {
        message: 'This is sample url',
        from: 'sampleHandler',
    });
};

module.exports = handler;
