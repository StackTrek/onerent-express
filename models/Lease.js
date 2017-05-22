const mongoose = require('mongoose');

const LeaseSchema = mongoose.Schema({
	id: mongoose.Schema.Types.ObjectId,
    propertyId: mongoose.Schema.Types.ObjectId,
});

mongoose.model('Lease', LeaseSchema);