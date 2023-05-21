const express = require('express');
const userController = require('../controllers/user_controller');

const userRouter = express.Router();

// POST Method(s)
userRouter.post('/add-user', userController.addUser);
userRouter.post('/login-user', userController.login);

// GET Method(s)
//userRouter.get('/view-user/:id', userController.viewUser);
userRouter.get('/view-all', userController.viewAllUsers);
userRouter.get('/view-user/:id', userController.viewUser);

// PUT Method(s)
userRouter.put('/update-user-detail/:id', userController.updateUserDetail);

// DELETE Method(s)
userRouter.delete('/delete-user/:id', userController.deleteUser);

module.exports = userRouter;

