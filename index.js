require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const db = require("./models");
const errorHandler = require('./handlers/error');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const commentsRoutes = require('./routes/comments');
const friendsRoutes = require('./routes/friends');
const { loginRequired, ensureCorrectUser } = require('./middleware/auth');
const { getFriends } = require('./middleware/friends');

const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);

// posts routes to create, update, and delete posts
app.use('/api/users/:id/posts',
  loginRequired,
  ensureCorrectUser,
  postsRoutes
);

// comments routes to create, update, and delete posts
app.use('/api/users/:id/posts/:post_id/comments',
  loginRequired,
  ensureCorrectUser,
  commentsRoutes
);

// friendssRoutes to display friend info and add/removefriends
app.use('/api/users/:id/profile', loginRequired, friendsRoutes);

// GET scroll route that displays friends' posts
app.get('/api/scroll', loginRequired, getFriends, async function(req, res, next) {
  try {
    console.log('friends:', res.locals.friends);
    // let posts = await db.Post.find({ user: { $in: res.locals.friends }})
    let posts = await db.Post.find()
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


app.use(function(req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(errorHandler);

app.listen(PORT, function() {
  console.log(`Server is running on port ${PORT}`);
});