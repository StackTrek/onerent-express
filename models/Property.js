const mongoose = require('mongoose');

const PropertySchema = mongoose.Schema({
  images: [String],
  street: String,
  city: String,
  state: String,
  zip: String,
  rent: { type: Number, required: true }
});

mongoose.model('Property', PropertySchema);