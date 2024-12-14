const express = require('express');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');
require('dotenv').config();

const healthCheck = require('./src/Routes/HealthCheck');
const userRoutes = require('./src/Routes/UserRoutes');
const groupsRoutes = require('./src/Routes/GroupRoutes');
const standingsRoutes = require('./src/Routes/StandingRoutes');
const matchRoutes = require('./src/Routes/MatchRoutes');
const knockoutsRoutes = require('./src/Routes/KnockoutRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

/** Swagger */
const swaggerDefinition = {
  openapi: '3.0.0', // Specify OpenAPI version
  info: {
    title: 'oncolympics_api', // API title
    version: '1.0.0', // API version
    description: 'Description of your API', // Description
  },
  servers: [
    {
      url: `http://localhost:${PORT}`, // Your API base URL
      description: 'Local server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/Routes/*.js'],
};
const swaggerDocs = swaggerJsDoc(options)

/** Routes */
app.use('/', healthCheck);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api/knockouts', knockoutsRoutes);
app.use('/api/match', matchRoutes);

// Swagger Doc
app.use('/swagger',swaggerUi.serve,swaggerUi.setup(swaggerFile))

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on Port: http://localhost:${PORT}/`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
