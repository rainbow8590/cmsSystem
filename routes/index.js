var express = require('express');
var router = express.Router();
var app = express();

var bodyParser = require('body-parser');

var mongoClient = require('mongodb').mongoClient;
var dbUrl = 'mongodb://localhost:27017/system08';

//model
var Model = require('../model/model.js');
var userDB = new Model('user')
var subjectDB = new Model('subject');

router.get('/',function(req,res,next){
    res.send('home')
})

module.exports = router
