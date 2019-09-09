const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../models');

router.post('/signup', async function(req, res, next) {
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

router.post('/signin', async function(req, res, next) {

});

module.exports = router;