require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const errorHandler = require('./handlers/error');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const { loginRequired, ensureCorrectUser } = require('./middleware/auth');

const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);

app.use('/api/users/:id/messages',
  loginRequired,
  ensureCorrectUser,
  postsRoutes
);



app.use(function(req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(errorHandler);

app.listen(PORT, function() {
  console.log(`Server is running on port ${PORT}`);
});