const express = require('express');
const router = express.Router();
const matchController = require('../Controllers/MatchController');

// Define the route to get groups with teams ordered by Pts
 // Admin / Team (Get next match if there's no matches or get current match)

// Admin
router.get('/moderatormatch', matchController.getNextMatchModerator);
router.get('/startmatch', matchController.startMatch)
router.get('/nextquestion', matchController.nextquestion)
router.get('/endmatch', matchController.endMatch)
router.get('/stopanswer', matchController.stopAnswer) // Not Implemented


// Team Player
router.get('/playermatch', matchController.getNextMatchPlayer);
router.post('/answer', matchController.setAnswer);

// Both
router.get('/matchscores', matchController.matchScores)


module.exports = router;
