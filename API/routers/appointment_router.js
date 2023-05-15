const express = require('express');
const appointmentController = require('../controllers/appointment_controller');

const appointmentRouter = express.Router();

appointmentRouter.post('/book-appointment', appointmentController.bookAppointment);

module.exports = appointmentRouter;