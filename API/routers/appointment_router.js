const express = require('express');
const appointmentController = require('../controllers/appointment_controller');

const appointmentRouter = express.Router();

appointmentRouter.post('/book-appointment', appointmentController.bookAppointment);
appointmentRouter.get('/view-all', appointmentController.viewAllAppointments);

module.exports = appointmentRouter;