require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../models');

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
    jwt.verify(token, process.env.SECRET_KEY, async function(err, decoded) {
      console.log('ensureCorrectUser:', decoded, req.method, req.params, req.path, req.body, req.originalUrl);
      // console.log('req.path, cleaned:', req.path.slice(1));
      // console.log('is a "comments" route?', req.originalUrl.includes('comments'));
      
      // if on /comments route: 
      if (req.originalUrl.includes('comments') && req.method === 'DELETE') {
        let foundComment = await db.Comment.findById(req.path.slice(1));
        // console.log('foundComment:', foundComment);
        // console.log('foundComment.user, decoded.id:', foundComment.user, decoded.id);
        // console.log('foundComment.user == decoded.id:', foundComment.user == decoded.id);

        // if the current user equals the user on the comment
        if (foundComment.user == decoded.id) {
          return next();
        }
      }

      // otherwise check that the params id and the current user match for other routes
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