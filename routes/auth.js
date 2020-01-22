const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../models');
const multer  = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/signup', upload.single('profileImage'), async function(req, res, next) {
  console.log('/signup route!');
  try {
    
    if (req.body.username === '' ||
        req.body.email === '' ||
        req.body.password === ''
    ) {
      return next({
        status: 400,
        message: 'Please include all necesarry information'
      });
    }

    console.log('/signup, req.body:', req.body);
    console.log('/signup, req.file:', req.file);

    let user = await db.User.create({
      ...req.body, 
      profileImage: req.file ? req.file.buffer : null
    });

    console.log('/signup, user:', user);

    let { id, username, profileImage } = user;
    let token = jwt.sign({
      id,
      username,
      // profileImage  // DON'T INCLUDE profileImage BECAUSE THE BINARY MAKES THE TOKEN HUGE
    }, process.env.SECRET_KEY);

    return res.status(200).json({
      id,
      username,
      profileImage,
      token
    });

  } catch (err) {
    if (err.code === 11000) {
      err.message = 'Sorry, that username and/or email is taken.'
    }

    console.log('/signup, err:', err);

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

    let { id, username, profileImage, friends, posts, requests } = user;
    let isMatch = await user.comparePassword(req.body.password);

    console.log('auth route, /signin, user', user);
    console.log('auth route, /signin, posts', posts);
    console.log('auth route, /signin, profileImage', profileImage);

    if (isMatch) {
      let token = jwt.sign({
        id,
        username,
        // profileImage,  // DON'T INCLUDE profileImage BECAUSE THE BINARY MAKES THE TOKEN HUGE
        friends,
        posts,
        requests
      }, process.env.SECRET_KEY);

      return res.status(200).json({
        id,
        username,
        profileImage,
        friends,
        posts,
        requests,
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

module.exports = router;