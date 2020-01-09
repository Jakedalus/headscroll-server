const express = require('express');
const router = express.Router({mergeParams: true});
const db = require('../models');
const jwt = require('jsonwebtoken');

// GET profile of a friend
router.route('/').get(async function(req, res, next) {
  try {
    // console.log('params:', req.params);

    let user = await db.User.findById(req.params.id); // the user you are looking at

    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, async function(err, decoded) {
      if (decoded) {
        
        let you = await db.User.findById(decoded.id); // you
        // console.log('req.params.id === you._id',req.params.id, you._id, req.params.id == you._id);
        // if you are friends with them, or you're on your own profile, you see the whole profile
        if (user.friends.includes(you._id) || req.params.id == you._id) {
          const picked = (({ _id, email, username, posts, friends, profileImage, isFriend=true }) => ({
             _id, email, username, profileImage, posts, friends, isFriend  
          }))(user);


          let friends = [];
          for (let friend of picked.friends) {
            // console.log('Looking up friend:', friend);
            let pal = await db.User.findById(friend);
            const pickedPal = (({ 
              _id, 
              email, 
              username,
              profileImage
            }) => ({ 
              _id, email, username, profileImage
            }))(pal);
            friends.push(pickedPal);
          }

          picked.friends = friends;

          // console.log('friends route, GET, user, is friends:', picked);

          return res.status(200).json(picked);
        // not friends with the user
        } else {
          const picked = (({ 
            _id, 
            email, 
            username, 
            profileImage,
            youRequestedAlready=user.requests.includes(you._id), 
            theyRequestedAlready=you.requests.includes(user._id),
            isFriend=false 
          }) => ({ 
            _id, email, username, profileImage, youRequestedAlready, theyRequestedAlready, isFriend  
          }))(user);

          // console.log('friends route, GET, user, is not friends:', picked);

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

// Send or Accept a freind request
router.route('/').post(async function(req, res, next) {
  try {
    console.log('params:', req.params);

    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, async function(err, decoded) {
      if (decoded) {
        let you = await db.User.findById(decoded.id); // you
        let them = await db.User.findById(req.params.id); // them

        const theirId = (({ _id }) => ({ _id }))(them);
        const yourId = (({ _id }) => ({ _id }))(you);

        // console.log('friends route, POST, user, _id:', theirId, yourId);

        // if the other user has already requested you as a friend
        if (you.requests.includes(theirId._id)) {
          you.requests.splice(you.requests.indexOf(theirId._id), 1);
          them.friends.push(yourId._id);
          you.friends.push(theirId._id);
          await them.save(); 
          await you.save(); 
        } else {
          // if you have not already sent a request or are not already friends, send a request to the user
          if (!them.requests.includes(yourId._id) && !them.friends.includes(yourId._id)) {
            them.requests.push(yourId._id);
            await them.save(); 
          }
        }

        

        return res.status(200).json(them);
        
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

// Delete a friend or Reject a friend request
router.route('/').delete(async function(req, res, next) {
  try {
    console.log('params:', req.params);

    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, async function(err, decoded) {
      if (decoded) {
        let requestingUser = await db.User.findById(decoded.id);
        let requestedUser = await db.User.findById(req.params.id);

        const pickedRequestedUser = (({ _id }) => ({ _id }))(requestedUser);
        const pickedRequestingUser = (({ _id }) => ({ _id }))(requestingUser);

        // console.log('friends route, POST, user, _id:', pickedRequestedUser, pickedRequestingUser);

        // if the other user has already requested you as a friend
        if (requestingUser.requests.includes(pickedRequestedUser._id)) {
          // delete, i.e. Decline, the request
          requestingUser.requests.splice(requestingUser.requests.indexOf(pickedRequestedUser._id), 1);
          await requestingUser.save(); 
        // if you have requested their friendship already
        } else if (requestedUser.requests.includes(pickedRequestingUser._id)){
          // delete, i.e. Cancel, friend request
          requestedUser.requests.splice(requestedUser.requests.indexOf(pickedRequestingUser._id), 1);
          await requestedUser.save(); 
        // if you are already friends with the user
        } else if (requestedUser.friends.includes(pickedRequestingUser._id)){
          // remove yourself from their friends list
          requestedUser.friends.splice(requestedUser.friends.indexOf(pickedRequestingUser._id), 1);
          // remove them from their friends list
          requestingUser.friends.splice(requestingUser.friends.indexOf(pickedRequestedUser._id), 1);
          await requestedUser.save(); 
          await requestingUser.save(); 
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