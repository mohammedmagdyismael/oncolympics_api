const express = require('express');
const userRoutes = require('./Routes/UserRoutes');
const healthCheck = require('./Routes/HealthCheck');
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware to parse JSON bodies
app.use(express.json());
app.get("/", (req, res) => res.send("Oncolymbics"));

/** Routes */
// Health Check
app.use('/api', healthCheck);
// Use the user routes
app.use('/api/users', userRoutes);

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT}`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
