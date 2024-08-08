const express = require('express');
const router = express.Router();
const userController = require('../Controllers/UserControllers');

// Todo: use auth middleware

// Define the login route
router.post('/login', userController.login);
router.get('/userInfo', userController.userInfo);

module.exports = router;
