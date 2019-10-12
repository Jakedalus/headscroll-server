const mongoose = require('mongoose');
const User = require('./user');

const postSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  }, 
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, {
  timestamps: true
});

postSchema.pre('remove', async function(next) {
  try {
    let user = await User.findById(this.user);
    user.posts.remove(this.id);
    await user.save();
    return next();
  } catch (err) {
    return next(err);
  }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;