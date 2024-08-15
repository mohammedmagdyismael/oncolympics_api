const express = require('express');
const router = express.Router();
const groupsController = require('../Controllers/GroupController');

// Define the route to get groups with teams ordered by Pts
router.get('/', groupsController.getGroups);
router.get('/aggregator', groupsController.groupsAggregator);

module.exports = router;
