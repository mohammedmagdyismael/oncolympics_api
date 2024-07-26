const express = require('express');
const router = express.Router();
const matchController = require('../Controllers/MatchController');

// Define the route to get groups with teams ordered by Pts
router.get('/next-match', matchController.getNextMatch);
router.post('/update-match-status', matchController.updateMatchStatus);

module.exports = router;
