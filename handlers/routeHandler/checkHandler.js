/**
 * Title: CheckHandler
 * Description: Check handler for monitoring up or down time of users
 * Author: Mohammed Kofil
 * Date: 26-10-2024
 */

// Dependencies
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const { maxChecks } = require('../../helpers/environment');
const tokenHandler = require('../routeHandler/tokenHandler');
const data = require('../../lib/data');

// Module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405, {
            message: 'Method not allowed',
        });
    }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    const {
        protocol,
        url: checkUrl,
        method: checkMethod,
        successCodes,
        timeoutSeconds: checkTimeout,
    } = requestProperties.body;

    const isValidProtocol = ['http', 'https'].includes(protocol);
    const isValidUrl = typeof checkUrl === 'string' && checkUrl.trim().length > 0;
    const isValidMethod = ['GET', 'POST', 'PUT', 'DELETE'].includes(checkMethod);
    const isValidSuccessCodes = Array.isArray(successCodes) && successCodes.length > 0;
    const isValidTimeout = Number.isInteger(checkTimeout) && checkTimeout >= 1 && checkTimeout <= 5;

    if (isValidProtocol && isValidUrl && isValidMethod && isValidSuccessCodes && isValidTimeout) {
        const { token } = requestProperties.headersObject;

        data.read('tokens', token, (tokenError, tokenData) => {
            if (!tokenError && tokenData) {
                const userPhone = parseJSON(tokenData).phone;

                data.read('users', userPhone, (userError, userData) => {
                    if (!userError && userData) {
                        const user = parseJSON(userData);
                        const userChecks = Array.isArray(user.checks) ? user.checks : [];

                        if (userChecks.length < maxChecks) {
                            const checkId = createRandomString(20);
                            const checkObject = {
                                id: checkId,
                                userPhone,
                                protocol,
                                url: checkUrl,
                                method: checkMethod,
                                successCodes,
                                timeoutSeconds: checkTimeout,
                            };

                            data.create('checks', checkId, checkObject, (createError) => {
                                if (!createError) {
                                    // add check id to user object
                                    user.checks = userChecks;
                                    user.checks.push(checkId);

                                    // save user
                                    data.update('users', userPhone, user, (updateError) => {
                                        if (!updateError) {
                                            callback(200, checkObject);
                                        } else {
                                            callback(500, {
                                                message: 'There was a server side error',
                                            });
                                        }
                                    });
                                } else {
                                    callback(500, { message: 'There was a server side error' });
                                }
                            });
                        } else {
                            callback(400, { message: 'User has too many checks' });
                        }
                    } else {
                        callback(403, { message: 'Authentication failed' });
                    }
                });
            } else {
                callback(403, { message: 'Authentication failed' });
            }
        });
    } else {
        callback(400, { message: 'There was a problem with your request' });
    }
};

handler._check.get = (requestProperties, callback) => {
    const { id: checkId } = requestProperties.queryStringObject;

    const isCheckIdValid = typeof checkId === 'string' && checkId.trim().length === 20;

    if (isCheckIdValid) {
        data.read('checks', checkId, (error, checkData) => {
            if (!error && checkData) {
                const token = requestProperties.headersObject.token;

                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (isTokenValid) => {
                    if (isTokenValid) {
                        const checkObject = { ...parseJSON(checkData) };

                        callback(200, checkObject);
                    } else {
                        callback(403, { message: 'Authentication failed' });
                    }
                });
            } else {
                callback(404, { message: 'Check not found' });
            }
        });
    } else {
        callback(400, { message: 'Invalid check ID' });
    }
};

handler._check.put = (requestProperties, callback) => {
    const { id: checkId } = requestProperties.body;
    const { protocol, url, method, successCodes, timeoutSeconds } = requestProperties.body;

    const isProtocolValid = ['http', 'https'].indexOf(protocol) > -1;
    const isUrlValid = typeof url === 'string' && url.trim().length > 0;
    const isMethodValid = ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) > -1;
    const isSuccessCodesValid = successCodes instanceof Array && successCodes.length > 0;
    const isTimeoutSecondsValid = typeof timeoutSeconds === 'number' && timeoutSeconds % 1 === 0 && timeoutSeconds > 0;

    if (checkId) {
        if (isProtocolValid || isUrlValid || isMethodValid || isSuccessCodesValid || isTimeoutSecondsValid) {
            data.read('checks', checkId, (err, checkData) => {
                if (!err && checkData) {
                    const checkObject = parseJSON(checkData);
                    const token =
                        typeof requestProperties.headersObject.token === 'string'
                            ? requestProperties.headersObject.token
                            : false;
                    
                    tokenHandler._token.verify(token, checkObject.userPhone, (isTokenValid) => {
                        if (isTokenValid) {
                            if (isProtocolValid) {
                                checkObject.protocol = protocol;
                            }
                            if (isUrlValid) {
                                checkObject.url = url;
                            }
                            if (isMethodValid) {
                                checkObject.method = method;
                            }
                            if (isSuccessCodesValid) {
                                checkObject.successCodes = successCodes;
                            }
                            if (isTimeoutSecondsValid) {
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }
                            // update the check
                            data.update('checks', checkId, checkObject, (updateError) => {
                                if (!updateError) {
                                    callback(200, checkObject);
                                } else {
                                    callback(500, { message: 'There was a server side error' });
                                }
                            });
                        } else {
                            callback(403, { message: 'Authentication failed' });
                        }
                    });
                } else {
                    callback(400, { message: 'There was a problem in the server side' });
                }
            });
    } else {
        callback(400, { message: 'There was a problem with your request' });
    }
    } else {
        callback(400, { message: 'There was a problem with your request' });
    }
};

handler._check.delete = (requestProperties, callback) => {
  const checkId = requestProperties.queryStringObject.id;

  if (typeof checkId === 'string' && checkId.trim().length === 20) {
    data.read('checks', checkId, (error, checkData) => {
      if (!error && checkData) {
        const token = requestProperties.headersObject.token;

        tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (isTokenValid) => {
          if (isTokenValid) {
            data.delete('checks', checkId, (deleteError) => {
              if (!deleteError) {
                data.read('users', parseJSON(checkData).userPhone, (readError, userData) => {
                  if (!readError && userData) {
                    const userObject = { ...parseJSON(userData) };
                    const userChecks = userObject.checks instanceof Array ? userObject.checks : [];
                    const checkPosition = userChecks.indexOf(checkId);

                    if (checkPosition > -1) {
                      userChecks.splice(checkPosition, 1);
                      userObject.checks = userChecks;
                      data.update('users', parseJSON(checkData).userPhone, userObject, (updateError) => {
                        if (!updateError) {
                          callback(200, {
                            message: 'Check deleted successfully',
                          });
                        } else {
                          callback(500, {
                            message: 'There was a server side error',
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        message: 'There was a server side error',
                      });
                    }
                  } else {
                    callback(404, {
                      message: 'Check not found',
                    });
                  }
                });
              } else {
                callback(500, {
                  message: 'There was a server side error',
                });
              }
            });
          } else {
            callback(403, {
              message: 'Authentication failed',
            });
          }
        });
      } else {
        callback(404, {
          message: 'Check not found',
        });
      }
    });
  } else {
    callback(400, {
      message: 'Invalid check ID',
    });
  }
};
module.exports = handler;
