const express = require('express');
const router = express.Router({mergeParams: true});
const db = require('../models');



// create a new comment
router.route('/').post(async function(req, res, next) {

  console.log('comments/ POST route:', req.body, req.params);

  try {
    let comment = await db.Comment.create({
      text: req.body.comment,
      user: req.params.id,
      post: req.params.post_id
    });

    let foundUser = await db.User.findById(req.params.id);
    foundUser.comments.push(comment.id);
    await foundUser.save();

    let foundPost = await db.Post.findById(req.params.post_id);
    foundPost.comments.push(comment.id);
    await foundPost.save();
    
    let foundComment = await db.Comment.findById(comment._id)
      .populate('user', {
        username: true,
        profileImageUrl: true
      });

    return res.status(200).json(foundComment);

  } catch (err) {
    return next(err);
  }
});

// get a specific comment
router.route('/:comment_id').get(async function(req, res, next) {
  try {
    let comment = await db.Comment.findById(req.params.comment_id);
    return res.status(200).json(comment);
  } catch (err) {
    return next(err);
  }
});

// // update a comment
router.route('/:comment_id').put(async function(req, res, next) {
  try {
    let comment = await db.Comment.findOneAndUpdate({_id: req.params.comment_id}, {text: req.body.text});
    console.log('UPDATE comment route:', comment, req.body);

    return res.status(200).json(comment);
  } catch (err) {
    return next(err);
  }
});

// // delete a comment
router.route('/:comment_id').delete(async function(req, res, next) {
  try {
    let foundComment = await db.Comment.findById(req.params.comment_id);

    console.log('DELETE comment route:', foundComment);

    await foundComment.remove();
    return res.status(200).json(foundComment);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;