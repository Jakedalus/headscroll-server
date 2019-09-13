require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require("../models");

exports.getFriends = function(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, async function(err, decoded) {
      if (decoded) {
        let user = await db.User.findById(decoded.id);
        let friends = user.friends;
        console.log('getFriends: ', decoded, user);
        console.log();
        // return res.send({friends});
        req.friends = friends;
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