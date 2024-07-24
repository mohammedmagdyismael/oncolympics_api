const express = require('express');
const router = express.Router();
const userController = require('../Controllers/UserControllers');

// Define the login route
router.post('/login', userController.login);

module.exports = router;
