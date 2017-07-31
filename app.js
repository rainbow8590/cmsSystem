var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

var cookieParser = require('cookie-parser');
var session = require('express-session');

var bodyParser = require('body-parser');

var index = require('./routes/index');
var admin = require('./routes/admin');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// //配置sesasion
// app.set('trust proxy', 1) // trust first proxy 
app.use(session({
  secret: 'hello',//加密用的秘钥
  resave: true,//新增
  saveUninitialized: true,//新增
  cookie: { 
    secure: false,
    maxAge:1000*60*6  //有效期
   }
}))

app.use(function(req,res,next){
    res.locals.user = req.session.user;
    next();
})

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use('/', index);
app.use('/admin', admin);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
