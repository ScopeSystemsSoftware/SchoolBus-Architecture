const express = require('express');
const router = express.Router();
const { getCurrentTenant } = require('../middleware/tenant');
const mongoose = require('mongoose');
const { getConnection } = require('../utils/db');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifică starea serviciului
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Serviciul funcționează corect
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: UP
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                 tenant:
 *                   type: string
 *                   nullable: true
 *                 checks:
 *                   type: object
 */
router.get('/', async (req, res) => {
  try {
    const tenantId = getCurrentTenant() || 'no-tenant';
    
    // Verifică conexiunea la baza de date dacă există un tenant
    let dbStatus = 'UNKNOWN';
    if (tenantId !== 'no-tenant') {
      try {
        const connection = await getConnection();
        dbStatus = connection.readyState === 1 ? 'UP' : 'DOWN';
      } catch (error) {
        dbStatus = 'DOWN';
      }
    }
    
    // Returnează starea serviciului
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      tenant: tenantId,
      checks: {
        database: dbStatus,
        memory: process.memoryUsage().heapUsed / 1024 / 1024 + 'MB'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * @swagger
 * /health/liveness:
 *   get:
 *     summary: Verifică dacă serviciul este în viață (folosit de Kubernetes)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Serviciul este în viață
 */
router.get('/liveness', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /health/readiness:
 *   get:
 *     summary: Verifică dacă serviciul este pregătit să proceseze cereri
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Serviciul este pregătit
 *       503:
 *         description: Serviciul nu este pregătit
 */
router.get('/readiness', async (req, res) => {
  try {
    // Verifică dacă serviciul este pregătit să proceseze cereri
    let isReady = true;
    let checks = {};
    
    // Verifică conexiunea la baza de date pentru tenant-ul default
    try {
      // Folosim un tenant hardcodat pentru verificare readiness
      // În producție, am putea folosi un tenant sistem special
      const connection = await mongoose.createConnection(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolbus_readiness_check', 
        { serverSelectionTimeoutMS: 2000 }
      );
      
      checks.database = connection.readyState === 1 ? 'UP' : 'DOWN';
      if (connection.readyState !== 1) {
        isReady = false;
      }
      
      // Închide conexiunea de test
      await connection.close();
    } catch (error) {
      checks.database = 'DOWN';
      isReady = false;
    }
    
    // Returnează status 200 sau 503 în funcție de starea serviciului
    if (isReady) {
      res.status(200).json({
        status: 'READY',
        timestamp: new Date().toISOString(),
        checks
      });
    } else {
      res.status(503).json({
        status: 'NOT_READY',
        timestamp: new Date().toISOString(),
        checks
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router; 