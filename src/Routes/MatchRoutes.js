const express = require('express');
const router = express.Router();
const matchController = require('../Controllers/MatchController');
const teamAuth = require('../middleware/teamAuth');
const adminAuth = require('../middleware/adminAuth');
const userExist = require('../middleware/userExist');

// Admin
router.get('/moderatormatch', adminAuth, matchController.getNextMatchModerator);
router.get('/startmatch', adminAuth, matchController.startMatch)
router.get('/nextquestion', adminAuth, matchController.nextquestion)
router.get('/endmatch', adminAuth, matchController.endMatch)
router.get('/stopanswer', adminAuth, matchController.stopAnswer)
router.get('/resetmatch', adminAuth, matchController.resetMatch)
router.post('/reward', adminAuth, matchController.rewardTeam)
router.post('/penalty', adminAuth, matchController.penalTeam)
router.get('/questionanswers', adminAuth, matchController.getCurrentQuestionAnswers)


// Team Player
router.get('/playermatch', teamAuth, matchController.getNextMatchPlayer);
router.post('/answer', teamAuth, matchController.setAnswer);

// Both
router.get('/matchscores', userExist, matchController.matchScores)


module.exports = router;
