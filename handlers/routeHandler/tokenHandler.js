/*
 * Title: TokenHandler
 * Description: Token Handler to handle token related routes
 * Author: Mohammed Kofil
 * Date: 24-10-2024
 */

// Dependencies
const {
  hash,
  parseJSON,
  createRandomString,
} = require('../../helpers/utilities');
const data = require('../../lib/data');

// Module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete'];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._token[requestProperties.method](requestProperties, callback);
  } else {
    callback(405, {
      message: 'Method not allowed',
    });
  }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
  const { phone, password } = requestProperties.body;

  const isValidId = typeof phone === 'string' && phone.trim().length === 11;
  const isValidPassword =
    typeof password === 'string' && password.trim().length > 0;

  if (isValidId && isValidPassword) {
    data.read('users', phone, (error, userData) => {
      if (!error && userData) {
        const user = parseJSON(userData);
        const hashedPassword = hash(password);

        if (hashedPassword === user.password) {
          const Id = createRandomString(20);
          const expiresAt = Date.now() + 60 * 60 * 1000;
          const tokenData = { phone, id: Id, expiresAt };

          data.create('tokens', Id, tokenData, (error2) => {
            if (!error2) {
              callback(200, tokenData);
            } else {
              callback(500, {
                message: 'There was a server side error',
              });
            }
          });
        } else {
          callback(400, {
            message: 'Password is not valid!',
          });
        }
      } else {
        callback(400, {
          message: 'There was a server side error',
        });
      }
    });
  } else {
    callback(400, {
      message: 'Bad request',
    });
  }
};

handler._token.get = (requestProperties, callback) => {
  const { id: tokenId } = requestProperties.queryStringObject;
  const isValidId = typeof tokenId === 'string' && tokenId.trim().length === 20;

  if (isValidId) {
    data.read('tokens', tokenId, (err, tokenData) => {
      if (!err && tokenData) {
        const token = { ...parseJSON(tokenData) };
        callback(200, token);
      } else {
        callback(404, {
          message: 'Requested token was not found',
        });
      }
    });
  } else {
    callback(404, {
      message: 'Token is not valid',
    });
  }
};

handler._token.put = (requestProperties, callback) => {
  const { id: tokenId, extend: isExtend } = requestProperties.body;
  const isValidId = typeof tokenId === 'string' && tokenId.trim().length === 20;
  const isBoolean = typeof isExtend === 'boolean';

  if (isValidId && isBoolean) {
    data.read('tokens', tokenId, (readErr, tokenData) => {
      if (!readErr && tokenData) {
        const token = { ...parseJSON(tokenData) };
        if (token.expiresAt > Date.now()) {
          token.expiresAt = Date.now() + 60 * 60 * 1000;
          data.update('tokens', tokenId, token, (updateErr) => {
            if (!updateErr) {
              callback(200, token);
            } else {
              callback(500, {
                message: 'There was a server side error',
              });
            }
          });
        } else {
          callback(400, {
            message: 'Token already expired',
          });
        }
      } else {
        callback(400, {
          message: 'There was a server side error',
        });
      }
    });
  } else {
    callback(400, {
      message: 'Token is not valid',
    });
  }
};

handler._token.delete = (requestProperties, callback) => {
  const { id: tokenId } = requestProperties.queryStringObject;

  const isValidTokenId =
    typeof tokenId === 'string' && tokenId.trim().length === 20;

  if (isValidTokenId) {
    data.read('tokens', tokenId, (readErr, tokenData) => {
      if (!readErr && tokenData) {
        data.delete('tokens', tokenId, (deleteErr) => {
          if (!deleteErr) {
            callback(200, {
              message: 'Token was deleted successfully',
            });
          } else {
            callback(500, {
              message: 'There was a server side error',
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
      message: 'Invalid token ID',
    });
  }
};

handler._token.verify = (id, phone, callback) => {
  data.read('tokens', id, (err, tokenData) => {
    const token = parseJSON(tokenData);

    if (!err && token) {
      callback(token.phone === phone && token.expiresAt > Date.now());
    } else {
      callback(false);
    }
  });
};

module.exports = handler;
