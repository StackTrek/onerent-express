const mongoose = require('mongoose');

const TenantSchema = mongoose.Schema({
	id: mongoose.Schema.Types.ObjectId,
    leaseId: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    phone: String
});

mongoose.model('Tenant', TenantSchema);