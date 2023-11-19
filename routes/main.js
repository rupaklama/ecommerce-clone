const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).render('main/home');
});

router.get('/about', (req, res) => {
  res.render('main/about');
});

module.exports = router;
