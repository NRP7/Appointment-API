const database = require('../models/connection_db');
const consultationModel = require('../models/diagnosis_model');
const utils = require('../../utils');


const addConsultation = (req, res, next) => { // get appointment id for patient and psych => RESOLVED; encoded_at DB field => RESOLVED; no need.

    let appointmentId = req.body.appointment_id;
    let illnessId = req.body.illness_id;
    //let diagnosedAt = req.body.diagnosed_at; // THIS SHOULD BE THE APPOINTMENT SCHEDULE - AUTOMATICALLY SET
    let note = req.body.note;

    if (!utils.checkMandatoryFields([appointmentId, illnessId, note])) { // checks if there are empty or null fields
        res.status(404).json({
            successful: false,
            message: "A field is not defined."
        });
        return;
    }

    if (!utils.isNumber([appointmentId, illnessId])) { // checks if the appointment or illness Id is not in number data type
        res.status(400).json({
            successful: false,
            message: "Incorrect appointment or illness Id data type."
        });
        return;
    }

    if (!utils.isString([note])) { // checks if the note is not in string data type
        res.status(400).json({
            successful: false,
            message: "Incorrect note data type."
        });
    }

    else {
        let illnessSelectQuery = `SELECT id, name FROM illnesses WHERE id = ${illnessId}`;

        database.db.query(illnessSelectQuery, (illnessSelErr, illnessSelRows, illnessSelResult) => {
            if (illnessSelErr) {
                res.status(500).json({
                    sucessful: false,
                    message: illnessSelErr
                });
            }
            else if (illnessSelRows.length == 0) { // checks if the illness id does not exist in the DB
                res.status(400).json({
                    sucessful: false,
                    message: "Illness Id does not exist."
                });
            }
            else {
                
                let diagnosisSelectQuery = `SELECT psychologist_id, patient_id, illness_id, diagnosed_at FROM diagnoses WHERE psychologist_id = (SELECT s.psychologist_id FROM schedules s WHERE s.id = ${appointmentId}) AND patient_id = (SELECT s.patient_id FROM schedules s WHERE s.id = ${appointmentId}) AND illness_id = ${illnessId} AND diagnosed_at = (SELECT reserved_at FROM schedules WHERE id = ${appointmentId})`;

                database.db.query(diagnosisSelectQuery, (selectErr, selectRows, selectResult) => {
                    if (selectErr) {
                        res.status(500).json({
                            sucessful: false,
                            message: selectErr
                        });
                    }
                    else {
                        if (selectRows.length > 0) { // checks if the consultation already exist
                            res.status(400).json({
                                sucessful: false,
                                message: "Consultation already exists."
                            });
                        }
                        else {

                            let appointmentUserIdSelectQuery = `SELECT s.psychologist_id, s.patient_id, s.status_id FROM schedules s WHERE s.id = ${appointmentId}`;

                            database.db.query(appointmentUserIdSelectQuery, (selErr, selRows, selResult) => {
                                if (selErr) {
                                    res.status(500).json({
                                        successful: false,
                                        message: selErr
                                    });
                                }
                                else if (selRows.length == 0) { // checks if the appointment, based on the appointment id, does not exist
                                    res.status(400).json({
                                        successful: false,
                                        message: "Appointment Id does not exists."
                                    });
                                }
                                else if (selRows[0].status_id == 2) { // checks if the appointment is still pending
                                    res.status(400).json({
                                        successful: false,
                                        message: "The appointment is still pending. Creating a consultation is not valid."
                                    });
                                }
                                else if (selRows[0].status_id == 4) { // checks if the appointment was cancelled
                                    res.status(400).json({
                                        successful: false,
                                        message: "The appointment was already cancelled. It is no longer valid."
                                    });
                                }
                                else {

                                    let appointmentSchedSelectQuery = `SELECT reserved_at FROM schedules WHERE id = ${appointmentId}`;

                                    database.db.query(appointmentSchedSelectQuery, (err, rows, result) => {
                                        if (err) {
                                            res.status(500).json({
                                                successful: false,
                                                message: err
                                            });
                                        }
                                        else {
                                            
                                            let psychologistId = selRows[0].psychologist_id;
                                            let patientId = selRows[0].patient_id;
                                            let diagnosedAt = rows[0].reserved_at;

                                            let diagnosisInsertQuery = `INSERT INTO diagnoses SET ?`;

                                            let diagnosisObj = consultationModel.diagnosis_model(psychologistId, patientId, illnessId, diagnosedAt, note);

                                            database.db.query(diagnosisInsertQuery, diagnosisObj, (insertErr, insertRows, insertResult) => {
                                                if (insertErr) {
                                                    res.status(500).json({
                                                        successful: false,
                                                        message: insertErr
                                                    });
                                                }
                                                else {

                                                    let updateStatusReservationQuery = `UPDATE schedules SET status_id = 5 WHERE id = ${appointmentId}`;

                                                    database.db.query(updateStatusReservationQuery, (updateErr, updateRows, updateResult) => { 
                                                        if (updateErr) {
                                                            res.status(500).json({
                                                                successful: false,
                                                                message: updateErr
                                                            });
                                                        }
                                                        else {
                                                            res.status(200).json({ // response if the consultation was successfully created and added to the DB
                                                                successful: true,
                                                                message: "Successfully added new diagnosis."
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });
    }
}


const viewConsultationResult = (req, res, next) => {
    const consultationId = req.params.id;

    if (!utils.checkMandatoryField(consultationId)) { // checks if there are empty or null fields
        res.status(404).json({
            successful: false,
            message: "Consultation Id is missing."
        });
    }
    else {//be specific with naming; add appointment detail => RESOLVED

        let consultationViewQuery = `SELECT CONCAT(first_name, ' ', last_name) AS psychologist, (SELECT CONCAT(first_name, ' ', last_name) AS Patient FROM users u WHERE u.id = d.patient_id) AS patient, i.name AS illness, DATE_FORMAT(diagnosed_at, '%Y-%m-%d') AS 'consultation_date', TIME(diagnosed_at) AS 'consultation_time', d.note AS note, DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') AS created_at, DATE_FORMAT(d.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at FROM users u
        JOIN diagnoses d ON u.id = d.psychologist_id
        JOIN illnesses i ON d.illness_id = i.id
        WHERE d.id = ${consultationId}`;

        database.db.query(consultationViewQuery, (viewErr, viewRows, viewResult) => {

            if (viewErr) {
                res.status(500).json({
                    successful: false,
                    message: viewErr
                });
            }
            else if (viewRows.length == 0) { // checks if there are no consultation in the DB or the DB table is empty 
                res.status(400).json({
                    successful: false,
                    message: "Consultation does not exists."
                });
            }
            else {
                res.status(200).json({ // response if fetching the consultation result was successful
                    successful: true,
                    message: "Successfully got the consultation details",
                    data: viewRows
                });
            }
        });
    }
}


const updateConsultation = (req, res, next) => { // can only change illnessId, diagnosedAt, and note => RESOLVED; UPDATE: Can only update note. => RESOLVED`
    let consultationId = req.params.id;

    let note = req.body.note;

    if (!utils.checkMandatoryFields([consultationId, note])) { // checks if there are empty or null fields
        res.status(404).json({
            successful: false,
            message: "A field is not defined."
        });
        return;
    }

    if (!utils.isString([note])) { // checks if the note is not in string data type
        res.status(400).json({
            successful: false,
            message: "Incorrect note format."
        });
    }
    else {

        let diagnosisSelectAllQuery = `SELECT d.note FROM diagnoses d WHERE d.id = ${consultationId}`;

        database.db.query(diagnosisSelectAllQuery, (selectErr, selectRows, selectResult) => {
            if (selectErr) {
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else {
                if (selectRows.length > 0) {

                    if (note == selectRows[0].note) { // checks if no changes were made in the existing consultation note
                        res.status(200).json({
                            successful: true,
                            message: "No changes were made, same diagnosis details are entered."
                        }); 
                    }
                    else {

                        let diagnosisUpdateQuery = `UPDATE diagnoses SET note = '${note}', updated_at = NOW() WHERE id = ${consultationId}`;

                        database.db.query(diagnosisUpdateQuery, (updateErr, updateRows, updateResult) => {
                            if (updateErr) {
                                res.status(500).json({
                                    successful: false,
                                    message: updateErr
                                });
                            }
                            else {
                                res.status(200).json({ // response if the existing consultation note was successfully updated
                                    successful: true,
                                    message: "Successfully updated consultation note detail(s)."
                                });
                            }
                        });
                    }
                } 
                else {
                    res.status(400).json({ // response if the consultation, based on the consultation id, does not exist
                        successful: false,
                        message: "Consultation Id does not exists."
                    });
                }
            }
        });
    }
}


const archiveConsultation = (req, res, next) => {

    const consultationId = req.params.id;

    if (!utils.checkMandatoryField(consultationId)) { // checks if there are empty or null fields
        res.status(404).json({
            successful: false,
            message: "Consultation Id is missing."
        });
    }
    
    else {

        let diagnosisSelectQuery = `SELECT id FROM diagnoses WHERE id = ${consultationId}`;

        database.db.query(diagnosisSelectQuery, (selectErr, selectRows, selectResult) => {
            if (selectErr) {
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else {
                if (selectRows.length > 0) {

                    let diagnosisSelectAllQuery = `INSERT INTO diagnosis_archives (diagnosis_id, psychologist_id, patient_id, illness_id, diagnosed_at, note)
                    SELECT id, psychologist_id, patient_id, illness_id, diagnosed_at, note FROM diagnoses WHERE id = ${consultationId}`;
    
                    database.db.query(diagnosisSelectAllQuery, (selErr, selRows, selResult) => {
                        if (selErr) {
                            res.status(500).json({
                                successful: false,
                                message: selErr
                            });
                        }
                        else {
    
                            let diagnosisDeleteAllQuery = `DELETE FROM diagnoses WHERE id = ${consultationId}`;

                            database.db.query(diagnosisDeleteAllQuery, (deleteErr, deleteRows, deleteResult) => {
                                if (deleteErr) {
                                    res.status(500).json({
                                        successful: false,
                                        message: deleteErr
                                    });
                                }
                                else {
                                    res.status(200).json({ // response if the existing consultation was successfully archived
                                        successful: true,
                                        message: "Successfully archived a diagnosis."
                                    });
                                }
                            });
                        }
                    });
                }
                else {
                    res.status(400).json({ // response if the consultation, based on the consultation id, does not exist
                        successful: false,
                        message: "Consultation Id does not exists."
                    });
                }
            }
        });
    }
}


module.exports = {
    addConsultation,
    viewConsultationResult,
    updateConsultation,
    archiveConsultation
}