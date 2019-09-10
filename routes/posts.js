const express = require('express');
const router = express.Router({mergeParams: true});
const db = require('../models');

router.route('/').post(async function(req, res, next) {
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

router.route('/:post_id').get(async function(req, res, next) {
  try {
    let post = await db.Post.find(req.params.post._id);
    return res.status(200).json(post);
  } catch (err) {
    return next(err);
  }
});

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