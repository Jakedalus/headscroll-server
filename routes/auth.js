const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../models');

router.post('/signin', async function(req, res, next) {
  console.log('/signin', req, res);
  try {
    let user = await db.User.findOne({
      email: req.body.email
    });
    let { id, username, profileImageUrl } = user;
    let isMatch = await user.comparePassword(req.body.password);

    if (isMatch) {
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
    } else {
      return next({
        status: 400,
        message: 'Invalid Email/Password'
      });
    }
  } catch (err) {
    return next({
      status: 400,
      message: 'Invalid email/password'
    });
  }
});

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

module.exports = router;