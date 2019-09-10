require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const errorHandler = require('./handlers/error');
const authRoutes = require('./routes/auth');

const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);


app.use(errorHandler);

app.listen(PORT, function() {
  console.log(`Server is running on port ${PORT}`);
});