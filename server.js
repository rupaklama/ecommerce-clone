/* Server related */
const mongoose = require('mongoose');

const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('uncaught exception...shutting down');

  console.log(err.name, ':', err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const db = process.env.DATABASE;

mongoose.connect(db, {}).then(() => {
  console.log('DB connection successful!');
});

const app = require('./app');

const port = process.env.PORT || 4000;

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`App running on port ${port}`);
});

// note - Unhandled Rejections are related to Promises
// Uncaught Exceptions are bugs related to Synchronous Code
process.on('unhandledRejection', (err) => {
  console.log('unhandled rejection...shutting down');

  console.log(err.name, ':', err.message);

  // shutting down the server gracefully
  server.close(() => {
    process.exit(1);
  });
});
