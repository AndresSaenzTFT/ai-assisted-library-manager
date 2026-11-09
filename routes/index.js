var express = require('express');
var router = express.Router();

// Render the library manager landing page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Library Manager' });
});

module.exports = router;
