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
  res.json({ data: yield newProp.save() })
}));

router.post('/api/leases', wrap(function* (req, res, next) {
  const Lease = mongoose.model('Lease');

  let newLease = new Lease(req.body);
  res.json({ data: yield newLease.save() });
}));

router.post('/api/tenants', wrap(function* (req, res, next) {
  const Tenant = mongoose.model('Tenant');

  let newTenant = new Tenant(req.body);
  res.json({ data: yield newTenant.save() })
}))


module.exports = router;
