const express = require('express');
const router = express.Router({mergeParams: true});
const db = require('../models');

// create a new post
router.route('/').post(async function(req, res, next) {
  console.log('/routes/posts, POST new post:', req.body);
  try {
    let post = await db.Post.create({
      text: req.body.text,
      user: req.params.id
    });

    let foundUser = await db.User.findById(req.params.id);
    foundUser.posts.push(post.id);
    await foundUser.save();

    let foundPost = await db.Post.findById(post._id).populate('user', {
      username: true,
      profileImageUrl: true
    });

    return res.status(200).json(foundPost);

  } catch (err) {
    return next(err);
  }
});

// get a specific post
// router.route('/:post_id').get(async function(req, res, next) {
//   try {
//     let post = await db.Post.findById(req.params.post_id);
//     let comments = await db.Comment.find({post: req.params.post_id});
//     console.log('GET /:post_id', post, comments);
//     return res.status(200).json(post);
//   } catch (err) {
//     return next(err);
//   }
// });

// update a post
router.route('/:post_id').put(async function(req, res, next) {
  try {
    let post = await db.Post.findOneAndUpdate({_id: req.params.post_id}, {text: req.body.text});
    console.log('update post route:', post, req.body);

    return res.status(200).json(post);
  } catch (err) {
    return next(err);
  }
});

// delete a post
router.route('/:post_id').delete(async function(req, res, next) {
  try {
    let foundPost = await db.Post.findById(req.params.post_id);
    await foundPost.remove();
    return res.status(200).json(foundPost);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;