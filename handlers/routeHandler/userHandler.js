/*
 * Title: UserHandler
 * Description: Route handler for user related routes
 * Author: Mohammed Kofil
 * Date: 20-10-2024
 */

// Dependencies
const { hash, parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const data = require('../../lib/data');

// Module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._user[requestProperties.method](requestProperties, callback);
    } else {
        callback(405, {
            message: 'Method not allowed',
        });
    }
};

handler._user = {};

handler._user.get = (requestProperties, callback) => {
    const { phone } = requestProperties.queryStringObject;
    const isPhoneValid = typeof phone === 'string' && phone.trim().length === 11;

    if (isPhoneValid) {
        const token =
            typeof requestProperties.headersObject.token === 'string'
                ? requestProperties.headersObject.token
                : false;

        tokenHandler._token.verify(token, phone, (isTokenValid) => {
            if (isTokenValid) {
                data.read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        const user = { ...parseJSON(userData) };
                        delete user.password;
                        callback(200, user);
                    } else {
                        callback(404, { message: 'User not found' });
                    }
                });
            } else {
                callback(403, { message: 'Authentication failed' });
            }
        });
    } else {
        callback(400, { message: 'Phone number is not valid' });
    }
};

handler._user.post = (requestProperties, callback) => {
    const {
 firstName, lastName, phone, password, termsOfAgreement 
} = requestProperties.body;

    const firstNameIsValid = typeof firstName === 'string' && firstName.trim().length > 0;
    const lastNameIsValid = typeof lastName === 'string' && lastName.trim().length > 0;
    const phoneIsValid = typeof phone === 'string' && phone.trim().length === 11;
    const passwordIsValid = typeof password === 'string' && password.trim().length > 0;
    const termsOfAgreementIsValid = typeof termsOfAgreement === 'boolean';

    if (
        firstNameIsValid &&
        lastNameIsValid &&
        phoneIsValid &&
        passwordIsValid &&
        termsOfAgreementIsValid
    ) {
        // Make sure that user doesn't already exist
        data.read('users', phone, (err, userData) => {
            if (err) {
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    termsOfAgreement,
                };
                // Store the user
                data.create('users', phone, userObject, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: 'User was created successfully',
                        });
                    } else {
                        callback(500, {
                            message: 'There was a problem in the server side',
                        });
                    }
                });
            } else {
                callback(400, {
                    message: 'User already exists',
                });
            }
        });
    } else {
        callback(400, {
            message: 'You have a problem in your request',
        });
    }
};

handler._user.put = (requestProperties, callback) => {
    const {
        body: {
 firstName: newFirstName, lastName: newLastName, phone, password: newPassword 
},
    } = requestProperties;

    const isPhoneNumberValid = typeof phone === 'string' && phone.trim().length === 11;
    const isNewFirstNameValid = typeof newFirstName === 'string' && newFirstName.trim().length > 0;
    const isNewLastNameValid = typeof newLastName === 'string' && newLastName.trim().length > 0;
    const isNewPasswordValid = typeof newPassword === 'string' && newPassword.trim().length > 0;

    if (!isPhoneNumberValid) {
        callback(400, { message: 'Invalid phone number' });
        return;
    }

    if (!(isNewFirstNameValid || isNewLastNameValid || isNewPasswordValid)) {
        callback(400, { message: 'You have a problem in your request' });
        return;
    }

    const { token } = requestProperties.headersObject;

    tokenHandler._token.verify(token, phone, (isTokenValid) => {
        if (!isTokenValid) {
            callback(403, { message: 'Authentication failed' });
            return;
        }

        data.read('users', phone, (readErr, userData) => {
            if (readErr || !userData) {
                callback(400, { message: 'There was a problem in the server side' });
                return;
            }

            const userObject = parseJSON(userData);

            if (isNewFirstNameValid) userObject.firstName = newFirstName;
            if (isNewLastNameValid) userObject.lastName = newLastName;
            if (isNewPasswordValid) userObject.password = hash(newPassword);

            const stringData = JSON.stringify(userObject);

            data.update('users', phone, stringData, (updateErr) => {
                if (updateErr) {
                    callback(500, { message: 'There was a problem in the server side' });
                } else {
                    callback(200, { message: 'User was updated successfully' });
                }
            });
        });
    });
};

// @TODO Authentication before delete method
handler._user.delete = (requestProperties, callback) => {
    const {
        queryStringObject: { phone: phoneNumber },
    } = requestProperties;

    if (phoneNumber) {
        data.read('users', phoneNumber, (err, userData) => {
            if (!err && userData) {
                data.delete('users', phoneNumber, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: 'User was deleted successfully',
                        });
                    } else {
                        callback(500, {
                            message: 'There was a problem in the server side',
                        });
                    }
                });
            } else {
                callback(400, {
                    message: 'There was a problem in the server side',
                });
            }
        });
    } else {
        callback(400, {
            message: 'Invalid phone number',
        });
    }
};

module.exports = handler;
