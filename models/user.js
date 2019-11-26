const mongoose = require('mongoose');
const bycrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  }, 
  username: {
    type: String, 
    required: true,
    unique: true
  }, 
  password: {
    type: String, 
    required: true
  }, 
  profileImage: {
    type: Buffer
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    let hashedPassword = await bycrypt.hash(this.password, 10);
    this.password = hashedPassword;
    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword, next) {
  try {
    let isMatch = await bycrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (err) {
    return next(err);
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;