const express = require('express');

const router = express.Router();

const User = require('../models/userModel');

// note: next func is getting executed in user modal & calling it here again will cause set header error
router.post('/users/signup', async (req, res, next) => {
  const { name, password, email } = req.body;

  try {
    const currentUser = await User.findOne({ email: req.body.email });
    if (currentUser) {
      req.flash('errors', 'Account with that email address already exists');
      return res.status(400).redirect('/users/signup');
    }

    const newUser = new User();
    newUser.profile.name = name;
    newUser.password = password;
    newUser.email = email;

    console.log(newUser);
    await newUser.save();

    // req.flash('info', 'Account created!');
    res.status(201).redirect('/');
  } catch (err) {
    console.log('signup:', err.message);
    return res.status(500).send({ message: 'Server error' });
  }
});

router.get('/users/signup', async (req, res) => {
  res.render('accounts/signup', {
    errors: req.flash('errors'),
  });
});

module.exports = router;
