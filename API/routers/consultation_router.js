const express = require('express');
const consultationController = require('../controllers/consultation_controller');

const consultationRouter = express.Router();

// POST Method(s)
consultationRouter.post('/add-consultation', consultationController.addConsultation);
consultationRouter.post('/archive-consultation-result/:id', consultationController.archiveConsultation);

// GET Method(s)
consultationRouter.get('/view-consultation-result/:id', consultationController.viewConsultationResult);

// PUT Method(s)
consultationRouter.put('/update-consultation-result/:id', consultationController.updateConsultation);


module.exports = consultationRouter;