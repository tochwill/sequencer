var express = require('express');
var path = require('path');
var cors = require('cors');

var app = express();
app.use(cors());
app.use(express.static('samples'));
app.listen(8000);