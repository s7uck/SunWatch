var express = require('express');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var createError = require('http-errors');
var i18n = require('i18n-express');

var indexRouter = require('./routes/index');

var app = express();

site = require('./config.js');
app.locals.site = site;
const LOGFILE = process.env.LOGFILE || '/tmp/sunwatch_access.log';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// logging
app.use(require('./logging')(logger, LOGFILE));

// get variable handling
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

// static files
app.use(express.static(path.join(__dirname, 'public')));

// localization
app.use(i18n(
  {
    translationsPath: path.join(__dirname, 'lang'),
    siteLangs: ['en', 'it'],
    textsVarName: 'locale',
    defaultLang: 'en',
    browserEnable: true,
    paramLangName: 'lang'
  }
))

// index page
app.use('/', indexRouter);
// other pages
var pagesRouter = require('./routes/pages')();

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
