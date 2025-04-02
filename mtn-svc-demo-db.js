const mongoose = require('mongoose');
const { logger } = require('./logger');
const { getCurrentTenant } = require('../middleware/tenant');

// Cacheare conexiuni per tenant
const tenantConnections = {};

/**
 * Obține conexiunea la baza de date pentru tenant-ul curent
 */
const getConnection = async () => {
  const tenantId = getCurrentTenant();
  
  if (!tenantId) {
    throw new Error('Niciun tenant detectat în context la conectarea la baza de date');
  }
  
  // Verificare conexiune existentă pentru tenant
  if (tenantConnections[tenantId]) {
    return tenantConnections[tenantId];
  }
  
  // Configurare conexiune bazată pe tenant
  const dbConfig = getDbConfigForTenant(tenantId);
  
  logger.info(`Inițializare conexiune la baza de date pentru tenant: ${tenantId}`);
  
  try {
    // Creare conexiune nouă pentru tenant
    const connection = await mongoose.createConnection(dbConfig.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbConfig.dbName
    });
    
    // Cacheare conexiune
    tenantConnections[tenantId] = connection;
    
    logger.info(`Conexiune la baza de date stabilită pentru tenant: ${tenantId}`);
    
    return connection;
  } catch (error) {
    logger.error(`Eroare la conectarea la baza de date pentru tenant ${tenantId}: ${error.message}`);
    throw error;
  }
};

/**
 * Obține configurația de bază de date pentru un tenant specific
 */
const getDbConfigForTenant = (tenantId) => {
  // În mediul real, aceste configurații ar putea veni dintr-un serviciu de configurare
  // sau dintr-o bază de date de management tenant
  const baseUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  
  return {
    uri: baseUri,
    dbName: `schoolbus_${tenantId}`
  };
};

module.exports = {
  getConnection
}; 