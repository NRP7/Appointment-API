const express = require('express');
const userController = require('../controllers/user_controller');

const userRouter = express.Router();

userRouter.post('/add-user', userController.addUser);

module.exports = userRouter;

