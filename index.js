const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(bodyParser.json());



app.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`);
});