var express = require('express');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var createError = require('http-errors');

var indexRouter = require('./routes/index');

var app = express();

site_data = fs.readFileSync('site.data', { encoding: 'utf-8', flag: 'r' });
var site = JSON.parse(site_data);

app.locals.site = site;
const LOGFILE = process.env.LOGFILE || '/tmp/sunwatch_access.log';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// logging stuff
app.use(require('./logging')(logger, LOGFILE));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// index page
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = err;
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
