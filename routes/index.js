var express = require('express');
const mongoose = require('mongoose');
const wrap = require('co-express');
const http = require('http');
const countries = require('country-data').countries;
const currencies = require('country-data').currencies;

var router = express.Router();

function getIpDetails(ip, cb) {
  http.get('http://ipinfo.io/' + ip, (res) => {
    let { statusCode } = res;

    let error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` +
        `Status Code: ${statusCode}`);
    }

    if (error) {
      return cb(null, error);
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        return cb(JSON.parse(rawData));
      } catch (e) {
        return cb(null, e);
      }
    });
  }).on('error', (e) => {
    cb(null, e);
  });
}

function convertCurrency(from, to, value, cb) {
  value = value || 1;
  http.get('http://api.fixer.io/latest?base=' + from, (res) => {
    let { statusCode } = res;

    let error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` +
        `Status Code: ${statusCode}`);
    }

    if (error) {
      return cb(null, error);
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        let parseData = JSON.parse(rawData);
        return cb(parseData['rates'][to] * value);
      } catch (e) {
        return cb(null, e);
      }
    });
  }).on('error', (e) => {
    cb(null, e);
  });
}

/* GET home page. */
router.get('/', function (req, res, next) {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  getIpDetails(ip, (data, err) => {
    if (err) {
      return console.log(err.message);
    }

    if (!data['country']) {
      return res.render('index', {
        title: 'Express',
        currency: {
          symbol: '$',
          rate: 1,
        },
      });
    }

    data['currencies'] = countries[data['country']]['currencies'];
    convertCurrency('USD', data['currencies'][0], 1, (rate, err) => {
      if (err) {
        return console.log(err);
      }

      if (!data['currencies'][0]) {
        return res.render('index', {
          title: 'Express',
          currency: {
            symbol: '$',
            rate: 1,
          },
        });
      }

      return res.render('index', {
        title: 'Express',
        currency: {
          symbol: currencies[data['currencies'][0]]['symbol'],
          rate: rate,
        },
      });
    });
  });
});

router.get('/api/properties', wrap(function* (req, res, next) {
  let filters = req.query;
  let limit = parseInt(filters['limit']) || 10;
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

  let data;
  let error;
  let newProp = new Property(req.body);
  try {
    data = yield newProp.save();
  } catch (e) {
    error = e;
    res.status(400);
  }

  res.json({ data, error });
}));

router.post('/api/leases', wrap(function* (req, res, next) {
  const Lease = mongoose.model('Lease');

  let data;
  let error;
  let newLease = new Lease(req.body);
  try {
    data = yield newLease.save();
  } catch (e) {
    error = e;
    res.status(400);
  }

  res.json({ data, error });
}));

router.post('/api/tenants', wrap(function* (req, res, next) {
  const Tenant = mongoose.model('Tenant');

  let data;
  let error;
  let newTenant = new Tenant(req.body);
  try {
    data = yield newTenant.save();
  } catch (e) {
    error = e;
    res.status(400);
  }

  res.json({ data, error });
}))


module.exports = router;
