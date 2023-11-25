const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../models/userModel');

exports.protectRoute = async (req, res, next) => {
  try {
    let token = '';

    // note: Two ways to Authenticate user
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      const err = new Error('You are not logged in! Please log in to get access.');
      err.status = 'fail';
      err.statusCode = 401;
      throw err;
    }

    // verify user jwt token
    let decoded = {};

    try {
      // jwt.verify is iife calling with pass arguments
      // const verify = promisify(jwt.verify);
      // verify(token, process.env.JWT_SECRET).then().catch();
      decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      // console.log(decoded); // token payload { id: 'adfdfdfd', iat: 1700862471, exp: 1701467271 }
    } catch (err) {
      // console.log(err);
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token. Please login in again!',
      });
    }

    // check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      const err = new Error('The user with the token does not exists.');
      err.status = 'fail';
      err.statusCode = 401;
      throw err;
    }

    // check if user changed password after token was issued
    // if (currentUser.changedPasswordAfter(decoded.iat)) {
    //   const err = new Error('User recently changed password! Please log in again.');
    //   err.status = 'fail';
    //   err.statusCode = 401;
    //   throw err;
    // }

    // note: for auth use cases - add User object in req body for user related operations
    req.user = currentUser;
  } catch (err) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // grant access to protected route
  next();
};
