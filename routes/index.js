var express = require('express');
const mongoose = require('mongoose');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	
  const Property = mongoose.model('Property');
  let properties = Property.find().exec();
  console.log(properties);

  res.render('index', { title: 'Express' });
});

module.exports = router;
