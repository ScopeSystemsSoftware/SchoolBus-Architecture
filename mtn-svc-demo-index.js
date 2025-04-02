const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { logger, httpLogger } = require('./utils/logger');
const { tenantMiddleware } = require('./middleware/tenant');
const { errorHandler } = require('./middleware/errorHandler');
const schoolRoutes = require('./routes/school');
const studentRoutes = require('./routes/student');
const healthRoutes = require('./routes/health');
const swaggerDocs = require('./utils/swagger');

// Încărcare variabile de mediu
require('dotenv').config();

// Inițializarea aplicației Express
const app = express();
const port = process.env.PORT || 8080;

// Middleware de bază
app.use(helmet()); // Securitate de bază
app.use(cors()); // CORS pentru apeluri cross-origin
app.use(bodyParser.json()); // Parsare JSON
app.use(httpLogger); // Logging HTTP
app.use(tenantMiddleware); // Middleware pentru multi-tenant

// Rute aplicație
app.use('/api/schools', schoolRoutes);
app.use('/api/students', studentRoutes);
app.use('/health', healthRoutes);

// Documentație Swagger
swaggerDocs(app);

// Middleware pentru gestionarea erorilor
app.use(errorHandler);

// Pornire server
app.listen(port, () => {
  logger.info(`Microserviciu multi-tenant demo rulează pe portul ${port}`);
  logger.info(`Documentație API disponibilă la: http://localhost:${port}/api-docs`);
}); 