// All request to the Express server are initialy processed here.
var passport = require('passport');
require('./app_server/straight-as-api/api/models/db');
require('./app_server/straight-as-api/api/configuration/passport');
require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var formidable = require('express-formidable');
var bodyParser = require('body-parser');

var indexApi = require('./app_server/straight-as-api/api/routes/index');
var indexRouter = require('./app_server/routes/index');
var usersRouter = require('./app_server/routes/users');

// Set up Swagger user interface
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./app_server/straight-as-api/apidoc.json');

var app = express();

// Middleware to handle certain security flaws.
app.use(function(req, res, next) {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
    res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
    res.setHeader("Expires", "0"); // Proxies.
    next();
});

// Set up path for API documentation
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// setup logger
app.use(logger('dev'));

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(formidable());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());

// forward all request beginning with /api to indexAPI router
app.use(indexApi);

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
