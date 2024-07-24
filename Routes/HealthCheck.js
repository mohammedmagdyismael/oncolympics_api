const express = require('express');
const router = express.Router();

// Define the health check route
router.get('/hc', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
