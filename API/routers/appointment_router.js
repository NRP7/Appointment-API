const express = require('express');
const appointmentController = require('../controllers/appointment_controller');

const appointmentRouter = express.Router();

// POST Method(s)
appointmentRouter.post('/book-appointment', appointmentController.bookAppointment);

// GET Method(s)
appointmentRouter.get('/view-psychologist-appointments/:id', appointmentController.viewPsychologistAppointments);
appointmentRouter.get('/view-patient-appointments/:id', appointmentController.viewPatientAppointments);

// PUT Method(s)
appointmentRouter.put('/update-appointment/:id', appointmentController.updateAppointment);
appointmentRouter.put('/cancel-appointment/:id', appointmentController.cancelAppointment);
appointmentRouter.put('/accept-appointment/:id', appointmentController.acceptAppointment);


module.exports = appointmentRouter;