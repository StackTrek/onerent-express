const mongoose = require('mongoose');

const LeaseSchema = mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
});

mongoose.model('Lease', LeaseSchema);