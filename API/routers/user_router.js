const express = require('express');
const userController = require('../controllers/user_controller');

const userRouter = express.Router();

userRouter.post('/add-user', userController.addUser);
userRouter.get('/view-all', userController.viewAllUsers);
userRouter.get('/view-user/:id', userController.viewUser);

module.exports = userRouter;

