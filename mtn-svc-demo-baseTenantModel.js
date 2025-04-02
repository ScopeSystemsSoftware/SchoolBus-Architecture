const mongoose = require('mongoose');
const { getCurrentTenant } = require('../middleware/tenant');
const { getConnection } = require('../utils/db');

/**
 * Crează un model multi-tenant bazat pe schema specificată
 * @param {string} modelName Numele modelului
 * @param {mongoose.Schema} schema Schema mongoose
 * @returns {Function} O funcție care returnează modelul pentru tenant-ul curent
 */
const createTenantModel = (modelName, schema) => {
  // Adaugă câmpul tenantId la schema
  schema.add({
    tenantId: {
      type: String,
      required: true,
      index: true
    }
  });
  
  // Adaugă hook pre-save pentru a seta automat tenantId
  schema.pre('save', function(next) {
    if (!this.tenantId) {
      const tenantId = getCurrentTenant();
      if (!tenantId) {
        return next(new Error('Niciun tenant detectat în context la salvarea entității'));
      }
      this.tenantId = tenantId;
    }
    next();
  });
  
  // Implementează middleware pentru filtrare tenant automată
  schema.pre(/^find/, function(next) {
    const tenantId = getCurrentTenant();
    if (!tenantId) {
      return next(new Error('Niciun tenant detectat în context la interogarea entităților'));
    }
    // Adaugă filtru pentru tenantId la toate interogările
    this.where({ tenantId });
    next();
  });
  
  // Returnează o funcție care obține modelul pentru tenant-ul curent
  return async () => {
    const connection = await getConnection();
    return connection.model(modelName, schema);
  };
};

module.exports = {
  createTenantModel
}; 