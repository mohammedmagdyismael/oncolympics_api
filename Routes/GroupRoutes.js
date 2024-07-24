const express = require('express');
const router = express.Router();
const groupsController = require('../Controllers/GroupController');

// Define the route to get groups with teams ordered by Pts
router.get('/', groupsController.getGroups);

module.exports = router;
