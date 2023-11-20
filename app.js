/* Express related */

const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');

const ejs = require('ejs');
const ejsMate = require('ejs-mate');

const mainRouter = require('./routes/main');
const userRouter = require('./routes/user');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: true,
    saveUninitialized: false,
  }),
);

// to render a pop-up message whenever a user is redirected to a particular webpage
app.use(flash());

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ROUTES
app.use(mainRouter);
app.use(userRouter);

// unhandled routes
app.all('*', (req, res, next) => {
  // creating error object with msg & defining the status, statusCode
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;

  // note - when next() receives any argument, express will know automatically there is an error
  // it will skip all the middleware in the middleware stacks & send error into global error handling middleware
  next(err);
});

// NOTE - Global Operational Error handling middleware - handling all Operation Errors in one place
app.use((err, req, res, next) => {
  // stack trace are details where the error occurred
  console.log(err.stack);

  // default status code & status message
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'server error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
