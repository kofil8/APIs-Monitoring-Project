/*
 * Title: Environment Variables
 * Description: A RESTful API to monitor up or down time of users define links
 * Author: Mohammed Kofil
 * Date: 18-10-2024
 */

// dependencies

// module scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    env: 'staging',
    screctKey: '|Voq@sqU;-c/u~ZI<[leoUnq>Z1q9x',
    maxChecks: 5,
    twilio: {
        fromPhone: '',
        accountSid: '',
        authToken: '',
    },
};

environments.production = {
    port: 8000,
    env: 'production',
    screctKey: '|Voq@sqU;-c/u~ZI<[leo0yhyert634>Z1q9x',
    maxChecks: 5,
    twilio: {
        fromPhone: '',
        accountSid: '',
        authToken: '',
    },
};

// determine which environment was passed
const currentEnvironment =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';
// export corresponding environment object
const environmentToExport =
    typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.staging;
// export module
module.exports = environmentToExport;
