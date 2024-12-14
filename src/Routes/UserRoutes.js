const express = require('express');
const router = express.Router();
const userController = require('../Controllers/UserControllers');
const userExist = require('../middleware/userExist');

// Define the login route

router.post('/login', userController.login);

router.get('/userInfo', userExist, userController.userInfo);

module.exports = router;
