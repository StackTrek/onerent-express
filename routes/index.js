var express = require('express');
const mongoose = require('mongoose');
const wrap = require('co-express');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/properties', wrap(function* (req, res, next) {
  const Property = mongoose.model('Property');

  let properties = yield Property.find().exec();
  res.json({ data: properties});
}));

router.post('/api/properties', wrap(function* (req, res, next) {
  const Property = mongoose.model('Property');

  let newProp = new Property(req.body);
  let data = yield newProp.save();
  res.json({ data: newProp })
}));

module.exports = router;
