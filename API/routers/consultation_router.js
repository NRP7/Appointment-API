const express = require('express');
const consultationController = require('../controllers/consultation_controller');

const consultationRouter = express.Router();

consultationRouter.post('/add-consultation', consultationController.addConsultation);
//consultationRouter.get('/view-consultation-result/:id', consultationController.viewConsultationResult);
consultationRouter.get('/view-consultation-result/:psychologist_id/:patient_id', consultationController.viewConsultationResult);

module.exports = consultationRouter;