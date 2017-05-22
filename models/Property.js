const mongoose = require('mongoose');

const PropertySchema = mongoose.Schema({
	id: mongoose.Schema.Types.ObjectId,
    name: String,
    images: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    rent: Number
});

mongoose.model('Property', PropertySchema);