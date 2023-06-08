const express = require('express');
const userController = require('../controllers/user_controller');

const userRouter = express.Router();

// POST Method(s)
userRouter.post('/add-user', userController.addUser);
userRouter.post('/login-user', userController.login);

// GET Method(s)
userRouter.get('/view-all', userController.viewAllUsers);
userRouter.get('/view-user-details/:id', userController.viewUserDetails);

// PUT Method(s)
userRouter.put('/update-user-details/:id', userController.updateUserDetails);
userRouter.put('/update-user-password', userController.updateUserPassword);
userRouter.put('/update-user-username/:id', userController.updateUsername);

// DELETE Method(s)
userRouter.delete('/delete-user/:id', userController.deleteUser);


module.exports = userRouter;

