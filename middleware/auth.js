require('dotenv').config();
const jwt = require('jsonwebtoken');

exports.loginRequired = function(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
      if (decoded) {
        return next();
      } else {
        return next({
          status: 401,
          message: 'Please log in first'
        });
      }
    });
  } catch (err) {
    return next({
      status: 401,
      message: 'Please log in first'
    });
  }
};

exports.ensureCorrectUser = function(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
      console.log('ensureCorrectUser:', decoded, req.params);
      if (decoded && decoded.id === req.params.id) {
        return next();
      } else {
        return next({
          status: 401,
          message: 'Unathorized'
        });
      }
    });
  } catch (err) {
    return next({
      status: 401,
      message: 'Unauthorized'
    });
  }
};