const express = require('express');
const router = express.Router({mergeParams: true});
const db = require('../models');
const jwt = require('jsonwebtoken');

router.route('/').get(async function(req, res, next) {
  try {
    console.log('params:', req.params);

    let user = await db.User.findById(req.params.id);

    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, async function(err, decoded) {
      if (decoded) {
        // if you are friends with them, you see the whole profile
        let requestingUser = await db.User.findById(decoded.id);
        if (user.friends.includes(requestingUser._id)) {
          const picked = (({ _id, email, username, posts, friends }) => ({ _id, email, username, posts, friends }))(user);

          console.log('users route, GET, user:', picked);

          return res.status(200).json(picked);
        // not friends with the user
        } else {
          const picked = (({ _id, email, username }) => ({ _id, email, username  }))(user);

          console.log('users route, GET, user:', picked);

          return res.status(200).json(picked);
        }
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

        // if the other user has already requested you as a friend
        if (requestingUser.requests.includes(pickedRequestedUser._id)) {
          requestingUser.requests.splice(requestingUser.requests.indexOf(pickedRequestedUser._id), 1);
          requestedUser.friends.push(pickedRequestingUser._id);
          requestingUser.friends.push(pickedRequestedUser._id);
          await requestedUser.save(); 
          await requestingUser.save(); 
        } else {
          // if you have not already sent a request or are not already friends, send a request to the user
          if (!requestedUser.requests.includes(pickedRequestingUser._id) && !requestedUser.friends.includes(pickedRequestingUser._id)) {
            requestedUser.requests.push(pickedRequestingUser._id);
            await requestedUser.save(); 
          }
        }

        

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