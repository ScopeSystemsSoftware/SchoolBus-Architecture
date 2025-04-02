const { logger } = require('../utils/logger');
const { AsyncLocalStorage } = require('async_hooks');

// Stocare tenant context folosind AsyncLocalStorage pentru a fi isolat per request
const tenantStorage = new AsyncLocalStorage();

/**
 * Middleware pentru extragerea și gestionarea tenant-ului în contextul requestului
 */
const tenantMiddleware = (req, res, next) => {
  // Cercare tenant din header-ul HTTP
  let tenantId = req.headers['x-tenant-id'];
  
  // Dacă nu există în header, încearcă să extragă din path
  if (!tenantId) {
    tenantId = extractTenantFromPath(req.path);
  }
  
  // Dacă încă nu există, folosește valoarea default
  if (!tenantId) {
    tenantId = process.env.DEFAULT_TENANT || 'default';
    logger.debug(`Niciun tenant detectat, folosind default: ${tenantId}`);
  } else {
    logger.debug(`Tenant detectat: ${tenantId}`);
  }
  
  // Adaugă tenantul la request pentru acces facil în alte middleware-uri
  req.tenantId = tenantId;
  
  // Adaugă tenantul în header-ul de răspuns pentru debugging
  res.set('x-tenant-id', tenantId);
  
  // Rulează următorul middleware în contextul tenant-ului
  tenantStorage.run(tenantId, next);
};

/**
 * Extrage tenant-ul din path în formatul /api/{tenantId}/...
 */
const extractTenantFromPath = (path) => {
  if (!path || !path.startsWith('/api/')) {
    return null;
  }
  
  const segments = path.split('/');
  if (segments.length >= 3) {
    return segments[2];
  }
  
  return null;
};

/**
 * Obține tenant-ul curent din context
 */
const getCurrentTenant = () => {
  return tenantStorage.getStore();
};

module.exports = {
  tenantMiddleware,
  getCurrentTenant
}; 