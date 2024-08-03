const express = require('express');
const router = express.Router();
const standingsController = require('../Controllers/StandingController');

// Route to get all matches
router.get('/all-matches', standingsController.getAllMatches);
router.get('/matchdetails', standingsController.matchdetails);

module.exports = router;
