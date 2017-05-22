var express = require('express');
const mongoose = require('mongoose');
const wrap = require('co-express');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/properties', wrap(function* (req, res, next) {
  let filters = req.query;
  let limit = parseInt(filters['limit']) || 20;
  let page = parseInt(filters['page']) || 1;
  const Property = mongoose.model('Property');

  let query = Property.find({});

  // filter by rent amount
  if (filters['minRent']) {
    query.where('rent').gte(filters['minRent']);
  }

  if (filters['maxRent']) {
    query.where('rent').lte(filters['maxRent']);
  }

  // filter by bed count
  if (filters['bed'] && filters['bed'].length) {
    let bedFilter = [];

    for (let count of filters['bed']) {
      if (count == '5+') {
        bedFilter.push({'bed': {'$gte': 5}});
        continue;
      }

      bedFilter.push({'bed': parseInt(count)});
    }

    query.or(bedFilter);
  }

  // filter by bathRoom count
  if (filters['bathRoom'] && filters['bathRoom'].length) {
    let bathRoomFilter = [];
    for (let count of filters['bathRoom']) {
      if (count == '4+') {
        bathRoomFilter.push({'bathRoom': {'$gte': 4}});
        continue;
      }
      bathRoomFilter.push({'bathRoom': parseInt(count)});
    }
    query.or(bathRoomFilter);
  }

  if (filters['petsAllowed'] && filters['petsAllowed'].length) {
    query.where('allowedPets').in(filters['petsAllowed']);
  }

  if (parseInt(filters['instantViewing'])) {
    query.where('instantViewing', filters['instantViewing']);
  }

  // pagination
  query.skip((page-1) * limit)
    .limit(limit);

  let count = yield Property.find(query.getQuery()).count();

  res.json({
    data: yield query.exec(),
    count,
    pageCount: Math.ceil(count / limit)
  });
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
