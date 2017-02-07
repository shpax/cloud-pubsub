const express = require('express');
const RestController = require('./controller');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(RestController.auth);

app.post('/emit', RestController.emit);