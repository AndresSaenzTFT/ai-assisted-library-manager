var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var booksRouter = require('./routes/books');
var patronsRouter = require('./routes/patrons');
var sequelize = require('./models').sequelize;

// Initialize the database connection before the application serves requests.
(async function() {
  try {
    await sequelize.sync();
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

var app = express();

// Configure Pug templates and the request-processing middleware.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(function(req, res, next) {
  // Allow browser forms to submit updates using the PUT routes.
  if (req.method === 'POST' && req.body && req.body._method === 'PUT') {
    req.method = 'PUT';
  }
  next();
});
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Mount each feature's routes under its public URL prefix.
app.use('/', indexRouter);
app.use('/books', booksRouter);
app.use('/patrons', patronsRouter);
app.use('/users', usersRouter);

// Forward unmatched URLs to the shared error handler as 404 responses.
app.use(function(req, res, next) {
  var err = new Error('Sorry, the page you requested could not be found.');
  err.status = 404;
  next(err);
});

// Normalize and render errors consistently across the application.
app.use(function(err, req, res, next) {
  if (typeof err.status === 'undefined') {
    err.status = 500;
  }
  if (typeof err.message === 'undefined' || err.message === '') {
    err.message = 'Sorry, an unexpected error occurred.';
  }

  console.error(err.status, err.message);
  res.status(err.status);
  res.render('error', { err: err });
});

module.exports = app;
