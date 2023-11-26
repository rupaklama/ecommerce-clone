const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const { protectRoute } = require('../utils/protectRoute');

// NOTE: Always use 'user.save()' on authentication, not user.update
// as a good practice to avoid bugs and data issues

// generate jwt token with signing process & payloads
const generateToken = (id) =>
  // jwt.sign(payload, secretOrPrivateKey, [options, callback]) - create jwt
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// SIGN UP
router.post('/users/signup', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const currentUser = await User.findOne({ email: req.body.email });
    if (currentUser) {
      const err = new Error('Account with that email address already exists');
      err.status = 'fail';
      err.statusCode = 400;
      throw err;
    }

    const newUser = new User();

    newUser.profile.name = username;
    newUser.password = password;
    newUser.email = email;

    await newUser.save().then((user) => {
      // jwt.sign(payload, secretOrPrivateKey, [options, callback])
      const token = generateToken(user._id);

      // If everything is ok, send jwt token to client
      const cookieOptions = {
        // browser will delete the cookie after it expires in 7 days
        // Converting into milli secs
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),

        // Cookie to be only send in encrypted connection - https, only works in prod
        // secure: true,

        // Cookie cannot be access or modified anyway by Browser - meaning we cannot modify or delete it
        httpOnly: true,
      };

      if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

      // remove the password in the response object output
      user.password = undefined;

      // Sending jwt via Cookie & storing it in cookie at the same time
      res.cookie('jwt', token, cookieOptions);

      res.redirect('/');
    });
  } catch (err) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
});

router.get('/users/signup', async (req, res) => {
  res.render('accounts/signup', {
    errors: req.flash('errors'),
  });
});

// SIGN IN
router.post('/users/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // check if email & password exist
    if (!email || !password) {
      const err = new Error('Incorrect email or password');
      err.status = 'fail';
      err.statusCode = 400;
      throw err;
    }

    // check if user exists & password is correct
    // by default 'password' property is set to hidden on the response output
    // Selecting the password property to compare value in the User object since it is set to false by us
    const user = await User.findOne({ email }).select('+password');

    // check the password also if user exists
    if (!user || !(await user.correctPassword(password, user.password))) {
      const err = new Error('Incorrect email or password');
      err.status = 'fail';
      err.statusCode = 401;
      throw err;
    }

    // generate token
    const token = generateToken(user._id);

    // If everything is ok, send jwt token to client
    const cookieOptions = {
      // browser will delete the cookie after it expires in 7 days
      // Converting into milli secs
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),

      // Cookie to be only send in encrypted connection - https, only works in prod
      // secure: true,

      // Cookie cannot be access or modified anyway by Browser
      httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    // remove the password in the response object output
    user.password = undefined;

    // Sending jwt via Cookie & storing it in cookie at the same time
    res.cookie('jwt', token, cookieOptions);

    res.redirect('/users/profile');
  } catch (err) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
});

router.get('/users/signin', async (req, res) => {
  if (req.cookies.jwt) return res.redirect('/');

  res.render('accounts/signin');
});

// PROFILE
router.get('/users/profile', protectRoute, (req, res) => {
  res.render('accounts/profile', { user: req.user });
});

// SIGN OUT
router.get('/users/logout', protectRoute, (req, res) => {
  // note: since we set cookie as 'httpOnly: true' so that it cannot be modified or deleted
  // The solution is to send new cookie with exact same name but without a token which will override current cookie
  // Also, this cookie will have very short expiration time to fake like deleting a cookie.
  res.cookie('jwt', 'fakeTokenToDeleteCurrentCookie', {
    expires: new Date(Date.now() + 10 * 1000), // in 10 secs from now
    httpOnly: true,
  });

  res.redirect('/');
});

module.exports = router;
