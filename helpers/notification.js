/*
 * Title: Notification
 * Description: Important utilies functions to notify users
 * Author: Mohammed Kofil
 * Date: 27-10-2024
 */

// dependencies
const https = require('https');
const querystring = require('querystring');
const { twilio } = require('./environment');

// module scaffolding
const notification = {};

// send notifications by sms
notification.sendTwilioSms = (phone, msg, callback) => {
    // validate inputs
    const userPhone =
        typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : false;
    const userMsg =
        typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600
            ? msg.trim()
            : false;
    if (userPhone && userMsg) {
        // configure the request payload
        const payload = {
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        };

        // stringify the payload
        const stringPayload = querystring.stringify(payload);

        // configure the request details
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            
        }

    } else {
        callback(400, {
            error: 'Phone and message are required',
        })
    }
};

// export the module
module.exports = notification;
