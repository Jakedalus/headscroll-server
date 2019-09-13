const express = require('express');
const router = express.Router({mergeParams: true});
const db = require('../models');
const jwt = require('jsonwebtoken');

router.route('/').get(async function(req, res, next) {
  try {
    console.log('params:', req.params);

    let user = await db.User.findById(req.params.id);

    const picked = (({ _id, email, posts, friends }) => ({ _id, email, posts, friends  }))(user);

    console.log('users route, GET, user:', picked);

    return res.status(200).json(picked);

  } catch (err) {
    return next(err);
  }
});

router.route('/').post(async function(req, res, next) {
  try {
    console.log('params:', req.params);

    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, async function(err, decoded) {
      if (decoded) {
        let requestingUser = await db.User.findById(decoded.id);
        let requestedUser = await db.User.findById(req.params.id);

        const pickedRequestedUser = (({ _id }) => ({ _id }))(requestedUser);
        const pickedRequestingUser = (({ _id }) => ({ _id }))(requestingUser);

        console.log('users route, POST, user, _id:', pickedRequestedUser, pickedRequestingUser);

        requestedUser.requests.push(pickedRequestingUser._id);
        await requestedUser.save();

        return res.status(200).json(pickedRequestedUser);
        
      } else {
        return next({
          status: 401,
          message: 'Please log in first'
        });
      }
    });
    

  } catch (err) {
    return next(err);
  }
});

module.exports = router;