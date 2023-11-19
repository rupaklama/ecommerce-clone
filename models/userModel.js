const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  profile: {
    name: {
      type: String,
      default: '',
    },
    picture: {
      type: String,
      default: '',
    },
  },

  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    minLength: 8,
    // note:  not to send this property value in the response
    select: false,
  },

  address: String,

  history: [
    {
      data: Date,
      paid: { type: Number, default: 0 },
    },
  ],
});

// note: using mongoose 'pre save' document middleware to take some action before saving it to DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // auto hashing/encrypt & salting password with cost or rounds of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

// note - creating mongoose 'instance' methods for extra functionalities
userSchema.methods.correctPassword = async function (inputPassword, userPassword) {
  return await bcrypt.compare(inputPassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
