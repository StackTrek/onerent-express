const mongoose = require('mongoose');

const PropertySchema = mongoose.Schema({
	id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  images: [String],
  street: String,
  city: String,
  state: String,
  zip: String,
  rent: { type: Number, required: true }
});

mongoose.model('Property', PropertySchema);