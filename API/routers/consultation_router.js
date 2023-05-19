const express = require('express');
const consultationController = require('../controllers/consultation_controller');

const consultationRouter = express.Router();

// POST Method(s)
consultationRouter.post('/add-consultation', consultationController.addConsultation);

// GET Method(s)
//consultationRouter.get('/view-consultation-result/:id', consultationController.viewConsultationResult);
// consultationRouter.get('/view-consultation-result/:psychologist_id/:patient_id', consultationController.viewConsultationResult);
consultationRouter.get('/view-consultation-result/:psychologist_username/:patient_username', consultationController.viewConsultationResult);

module.exports = consultationRouter;