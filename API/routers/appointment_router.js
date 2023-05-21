const express = require('express');
const appointmentController = require('../controllers/appointment_controller');

const appointmentRouter = express.Router();

// POST Method(s)
appointmentRouter.post('/book-appointment', appointmentController.bookAppointment);

// GET Method(s)
appointmentRouter.get('/view-all', appointmentController.viewAllAppointments);

// PUT Method(s)
appointmentRouter.put('/update-appointment/:id', appointmentController.updateAppointment);
appointmentRouter.put('/cancel-appointment/:id', appointmentController.cancelAppointment);

module.exports = appointmentRouter;