const express = require('express');
const userController = require('../controllers/user_controller');

const userRouter = express.Router();

// POST Method(s)
userRouter.post('/add-user', userController.addUser);

// GET Method(s)
//userRouter.get('/view-user/:id', userController.viewUser);
userRouter.get('/view-all', userController.viewAllUsers);
userRouter.get('/view-user/:username', userController.viewUser);

// PUT Method(s)
userRouter.put('/update-user-detail/:username', userController.updateUserDetail);

// DELETE Method(s)
userRouter.delete('/delete-user/:username', userController.deleteUser);

module.exports = userRouter;

