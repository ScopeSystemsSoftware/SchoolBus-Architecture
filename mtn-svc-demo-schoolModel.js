const mongoose = require('mongoose');
const { createTenantModel } = require('./baseTenantModel');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  phone: String,
  email: String,
  principal: String,
  type: {
    type: String,
    enum: ['PRIMARY', 'MIDDLE', 'HIGH', 'COLLEGE'],
    default: 'PRIMARY'
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Creare indecși pentru performanță
schoolSchema.index({ name: 1, tenantId: 1 }, { unique: true });
schoolSchema.index({ 'address.city': 1, tenantId: 1 });
schoolSchema.index({ type: 1, tenantId: 1 });

// Export model multi-tenant
module.exports = createTenantModel('School', schoolSchema); 