const express = require('express');
const userRoutes = require('./Routes/UserRoutes'); // Import the user routes

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Use the user routes
app.use('/api/users', userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
