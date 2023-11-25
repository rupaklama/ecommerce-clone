// Extending built in Error Class
class AppError extends Error {
  constructor(message, statusCode) {
    // note - message is the only param built in Error Object accepts
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Problems that we can predict will happen at some point
    // eg. invalid path, invalid user input, server/db connection
    this.isOperational = true;

    // Bugs - programming errors that developer introduce
    // eg. reading property on undefined, promises etc

    // constructor function won't be call in the stack trace to not to pollute with more unneeded details
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
