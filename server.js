const express = require('express');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const healthCheck = require('./src/Routes/HealthCheck');
const userRoutes = require('./src/Routes/UserRoutes');
const groupsRoutes = require('./src/Routes/GroupRoutes');
const standingsRoutes = require('./src/Routes/StandingRoutes');
const matchRoutes = require('./src/Routes/MatchRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

/** Swagger */
const swaggerOptions = {
  swaggerDefinition:{
      info:{
          title: 'Oncolympics APIs',
          description: 'Oncolympics APIs',
          contact: {
              name: 'm.magdy.isl@gmail.com'
          },
          servers:[`https://localhost:${PORT}`]
      }
  },
  apis: [
      'server.js',
      'Routes/UserRoutes.js'
  ]
}
const swaggerDocs = swaggerJsDoc(swaggerOptions)

/** Routes */
// Health Check
app.use('/', healthCheck);
// Use the user routes
app.use('/api/users', userRoutes);
// Use the groups routes
app.use('/api/groups', groupsRoutes);
// Use the standings routes
app.use('/api/standings', standingsRoutes);
// Use the match routes
app.use('/api/match', matchRoutes);

// Swagger Doc
app.use('/api/docs',swaggerUi.serve,swaggerUi.setup(swaggerDocs))

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT}`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
