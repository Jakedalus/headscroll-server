const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../models');

router.post('/signup', async function(req, res, next) {
  try {
    let user = await db.User.create(req.body);

    let { id, username, profileImageUrl } = user;
    let token = jwt.sign({
      id,
      username,
      profileImageUrl
    }, process.env.SECRET_KEY);

    return res.status(200).json({
      id,
      username,
      profileImageUrl,
      token
    });

  } catch (err) {
    if (err.code === 11000) {
      err.message = 'Sorry, that username and/or email is taken.'
    }

    return next({
      status: 400,
      message: err.message
    });
  }
});

router.post('/signin', async function(req, res, next) {
  try {
    let user = await db.User.findOne({
      email: req.body.email
    }).populate('requests', {  // populate friend requests with username and id when log in
      username: true,
      id: true
    });;

    let { id, username, profileImageUrl, friends, posts, requests } = user;
    let isMatch = await user.comparePassword(req.body.password);

    console.log('auth route, /signin, posts', posts);

    if (isMatch) {
      let token = jwt.sign({
        id,
        username,
        profileImageUrl,
        friends,
        posts,
        requests
      }, process.env.SECRET_KEY);

      return res.status(200).json({
        id,
        username,
        profileImageUrl,
        friends,
        posts,
        requests,
        token
      });
    } else {
      return next({
        status: 400,
        message: 'Invalid Email/Password, no match'
      });
    }
  } catch (err) {
    return next({
      status: 400,
      message: 'Invalid email/password, catch block'
    });
  }
});

module.exports = router;