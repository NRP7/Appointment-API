const express = require('express');
const consultationController = require('../controllers/consultation_controller');

const consultationRouter = express.Router();

consultationRouter.post('/add-consultation', consultationController.addConsultation);

module.exports = consultationRouter;