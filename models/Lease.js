const mongoose = require('mongoose');

const LeaseSchema = mongoose.Schema({
	id: { type: mongoose.Schema.Types.ObjectId, required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, required: true },
});

mongoose.model('Lease', LeaseSchema);