const mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/headscroll', {
  keepAlive: true
});

module.exports.User = require('./user');
module.exports.Post = require('./post');
module.exports.Comment = require('./comment');