require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
var _ = require('lodash');
const jwt = require('jsonwebtoken');

const db = require("./models");
const errorHandler = require('./handlers/error');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const commentsRoutes = require('./routes/comments');
const friendsRoutes = require('./routes/friends');
const { loginRequired, ensureCorrectUser } = require('./middleware/auth');
const { getFriends } = require('./middleware/friends');

const PORT = process.env.PORT || 5051;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);

// get user data again if signed in
app.get('/user/:id', loginRequired, ensureCorrectUser, async function(req, res, next) {
  try {
    let user = await db.User.findById(req.params.id)
      .populate('requests', {
        username: true,
        id: true
      });

    const pickedUser = _.pick(user, ['username', 'email', 'id', 'friends', 'posts', 'requests']);

    let { id, username, profileImageUrl, friends, posts, requests } = pickedUser;

    let token = jwt.sign({
      id,
      username,
      profileImageUrl,
      friends,
      posts,
      requests
    }, process.env.SECRET_KEY);

    pickedUser.token = token;

    console.log('--->> /user/:id route:', req.params, user, pickedUser);

    return res.status(200).json(pickedUser);

  } catch (err) {
    return next({
      status: 401,
      message: 'Please log in first'
    });
  }
});


// comments routes to create, update, and delete comments
app.use('/api/users/:id/posts/:post_id/comments',
  loginRequired,
  ensureCorrectUser,
  commentsRoutes
);

// GET specific post 
app.get('/api/users/:id/posts/:post_id/', loginRequired, getFriends, async function(req, res, next) {
  console.log('GET /api/users/:id/posts/:post_id/');
  try {
    let post = await db.Post.findById(req.params.post_id);
    let comments = await db.Comment.find({post: req.params.post_id})
      .sort({createdAt: 'asc'})
      .populate('user', {
        username: true,
        profileImageUrl: true
      });
    console.log('GET /:post_id', post, comments);
    return res.status(200).json({post, comments});
  } catch (err) {
    return next(err);
  }
});

// other posts routes to create, update, and delete posts: all require ensureCorrectUser
app.use('/api/users/:id/posts',
  loginRequired,
  ensureCorrectUser,
  postsRoutes
);



// get comments on a post
// app.get('/api/users/:id/posts/:post_id/comments', loginRequired, getFriends, async function(req, res, next) {
//   console.log('!!comments get route!');
//   try {
//     // console.log('friends:', res.locals.friends);
//     // let posts = await db.Post.find({ user: { $in: res.locals.friends }})
//     console.log('routes/comments, get "/", req:', req);
//     // let posts = await db.Comment.find({post: })
//     //   .sort({createdAt: 'desc'})
//     //   .populate('user', {
//     //     username: true,
//     //     profileImageUrl: true
//     //   });
//     // return res.status(200).json(posts);
//   } catch (err) {
//     return next(err);
//   }
// });



// friendssRoutes to display friend info and add/removefriends
app.use('/api/users/:id/profile', loginRequired, friendsRoutes);



// GET scroll route that displays friends' posts
app.get('/api/scroll', loginRequired, getFriends, async function(req, res, next) {
  try {
    console.log('/api/scroll, res.locals:', res.locals);
    let posts = await db.Post.find({ $or: [{ user: { $in: res.locals.friends }}, { user: res.locals.you }] })
    // let posts = await db.Post.find({ user: { $in: res.locals.friends }})
      .sort({createdAt: 'desc'})
      .populate('user', {
        username: true,
        profileImageUrl: true
      });
    
    return res.status(200).json(posts);
  } catch (err) {
    return next(err);
  }
});

// GET search route for finding users to friend
app.post('/api/search', loginRequired, async function(req, res, next) {
  try {
    console.log('/api/search route:', req.body, req.query);

    let foundUser = null;
    let pickedUser = null;

    // search via username
    // {'$regex': req.body.query, $options:'i'} makes the search case-insensitive
    foundUser = await db.User.findOne({username: {'$regex': req.body.query, $options:'i'}});
    console.log('...search via username:', foundUser);
    if (foundUser) {
      pickedUser = _.pick(foundUser, ['username', 'email', '_id']);
      console.log('...Found via username!',foundUser, pickedUser);
      return res.status(200).json({pickedUser});
    }

    // search via email
    foundUser = await db.User.findOne({email: {'$regex': req.body.query, $options:'i'}});
    console.log('...search via email:', foundUser);
    if (foundUser) {
      pickedUser = _.pick(foundUser, ['username', 'email', '_id']);
      console.log('...Found via email!',foundUser, pickedUser);
      return res.status(200).json({pickedUser});
    }

    return next({
      status: 404,
      message: 'User not found'
    });
    
  } catch (err) {
    return next(err);
  }
});


app.use(function(req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(errorHandler);

app.listen(PORT, function() {
  console.log(`Server is running on port ${PORT}`);
});