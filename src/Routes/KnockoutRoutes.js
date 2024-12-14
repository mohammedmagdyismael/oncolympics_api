const express = require('express');
const router = express.Router();
const knockoutsController = require('../Controllers/KnockoutsController');

// Route to get all matches
router.get('/', knockoutsController.getAllMatches);
router.get('/knockoutsA', knockoutsController.getAllMatchesA); // 8 Teams
router.get('/knockoutsB', knockoutsController.getAllMatchesB); // 4 Teams
router.get('/knockoutsfinal', knockoutsController.getAllMatchesFinal); // 2 Teams
router.get('/matchdetails', knockoutsController.matchdetails);

module.exports = router;
