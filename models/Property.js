const mongoose = require('mongoose');

const PropertySchema = mongoose.Schema({
  images: [String],
  street: String,
  city: String,
  state: String,
  zip: String,
  bed: Number,
  bathRoom: Number,
  instantViewing: Boolean,
  allowedPets: Array,
  totalArea: Number,
  credit: Number,
  location: {
	  long: {
	    type: Number, required: true
    },
    lat: {
      type: Number, required: true
    }
  },
  rent: { type: Number, required: true }
});

mongoose.model('Property', PropertySchema);