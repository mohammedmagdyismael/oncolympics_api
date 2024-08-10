const express = require('express');
const cors = require('cors');
require('dotenv').config();

const healthCheck = require('./Routes/HealthCheck');
const userRoutes = require('./Routes/UserRoutes');
const groupsRoutes = require('./Routes/GroupRoutes');
const standingsRoutes = require('./Routes/StandingRoutes');
const matchRoutes = require('./Routes/MatchRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

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

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT}`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
