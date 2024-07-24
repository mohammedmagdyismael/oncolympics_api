const express = require('express');
const userRoutes = require('./Routes/UserRoutes');
const healthCheck = require('./Routes/HealthCheck');
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware to parse JSON bodies
app.use(express.json());

/** Routes */
// Health Check
app.use('/api', healthCheck);
// Use the user routes
app.use('/api/users', userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
