const mongoose = require('mongoose');

const TenantSchema = mongoose.Schema({
  leaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lease', required: true },
  name: { type: String, required: true },
  email: {
  	type: String,
    validate: {
      validator: function(v) {
        return /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(v);
      },
      message: '{VALUE} is not a valid email!'
    },
    required: [true, 'Tenant email required']
  },
  phone: {
  	type: String,
    validate: {
      validator: function(v) {
        return /\d{3}-\d{3}-\d{4}/.test(v);
      },
      message: '{VALUE} is not a valid phone number!'
    },
    required: [true, 'Tenant phone number required']
  }
});

mongoose.model('Tenant', TenantSchema);