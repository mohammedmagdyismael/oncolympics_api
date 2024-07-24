const express = require('express');
const db = require('./db'); // Import the database connection

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

/* // Define a test route
app.get('/', (req, res) => {
  res.send('Welcome to the Gaming Portal API!');
});

// Example route to fetch all teams
app.get('/teams', (req, res) => {
  db.query('SELECT * FROM Teams', (err, results) => {
    if (err) {
      console.error('Error fetching teams:', err);
      res.status(500).send('Server Error');
    } else {
      res.json(results);
    }
  });
}); */

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
