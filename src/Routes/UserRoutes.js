const express = require('express');
const router = express.Router();
const userController = require('../Controllers/UserControllers');
const userExist = require('../middleware/userExist');

// Define the login route

/**
 * @swagger
 * /api/users:
 *  get:
 *      description: Use to retreive user profile
 *      responses:
 *          '200':
 *              description: successful
 */
router.post('/login', userController.login);
router.get('/userInfo', userExist, userController.userInfo);

module.exports = router;
