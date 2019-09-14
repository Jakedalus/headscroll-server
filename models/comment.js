const mongoose = require('mongoose');
const User = require('./user');
const Post = require('./post');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  }, 
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post', 
    required: true
  }
}, {
  timeStamps: true
});

commentSchema.pre('remove', async function(next) {
  try {
    // console.log('pre remove comment:', this);
    let user = await User.findById(this.user);
    user.comments.remove(this.id);
    // console.log('user', user);
    await user.save();

    let post = await Post.findById(this.post);
    post.comments.remove(this.id);
    // console.log('post', post);
    await post.save();

    return next();
  } catch (err) {
    return next(err);
  }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;