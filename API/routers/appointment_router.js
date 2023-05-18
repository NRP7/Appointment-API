const express = require('express');
const appointmentController = require('../controllers/appointment_controller');

const appointmentRouter = express.Router();

// POST Method(s)
appointmentRouter.post('/book-appointment', appointmentController.bookAppointment);

// GET Method(s)
appointmentRouter.get('/view-all', appointmentController.viewAllAppointments);

module.exports = appointmentRouter;