const database = require('../models/connection_db');
const consultationModel = require('../models/diagnosis_model');
const utils = require('../../utils');


const addConsultation = (req, res, next) => {

    let psychologistId = req.body.psychologist_id;
    let patientId = req.body.patient_id;
    let illnessId = req.body.illness_id;
    let diagnosedAt = req.body.diagnosed_at;
    let note = req.body.note;

    if (!utils.checkMandatoryFields([psychologistId, patientId, illnessId, diagnosedAt, note])) {
        res.status(404).json({
            successful: false,
            message: "A consultation credential is not defined."
        });
        return;
    }

    if (!utils.isSameId(psychologistId, patientId)) {
        res.status(400).json({
            successful: false,
            message: "The same ID is entered in both psychologist and patient fields."
        });
    }
    
    else {
        
        let diagnosisSelectQuery = `SELECT psychologist_id, patient_id, illness_id, diagnosed_at FROM diagnoses WHERE psychologist_id = ${psychologistId} AND patient_id = ${patientId} AND illness_id = ${illnessId} AND diagnosed_at = '${diagnosedAt}'`;
        

        database.db.query(diagnosisSelectQuery, (selectErr, selectRows, selectResult) => {
            if (selectErr) {
                res.status(500).json({
                    sucessful: false,
                    message: selectErr
                });
            }
            else {
                if (selectRows.length > 0) {
                    res.status(400).json({
                        sucessful: false,
                        message: "Consultation already exists."
                    });
                }
                else {
                    
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
                            res.status(200).json({
                                successful: true,
                                message: "Successfully added new diagnosis."
                            });
                        }
                    });
                }
            }
        });
    }
}


const viewConsultationResult = (req, res, next) => {
    const consultationId = req.params.id;
    // const psychologistId = req.params.psychologist_id;
    // const patientId = req.params.patient_id;
    // const psychologistUserName = req.params.psychologist_username;
    // const patientUserName = req.params.patient_username;

    if (!utils.checkMandatoryField(consultationId)) {
        res.status(404).json({
            successful: false,
            message: "Consultation Id is missing."
        });
    }

    // if(!utils.isSameId(psychologistUserName, patientUserName)){
    //     res.status(400).json({
    //         successful: false,
    //         message: "The same username is entered in both psychologist and patient fields."
    //     });
    // }

    else {

        let consultationViewQuery = `SELECT d.id AS Id, CONCAT(first_name, ' ', last_name) AS Psychologist, (SELECT CONCAT(first_name, ' ', last_name) AS Patient FROM users u WHERE u.id = d.patient_id) AS Patient, i.name AS Illness, DATE_FORMAT(diagnosed_at, '%Y-%m-%d') AS Date, TIME(diagnosed_at) AS Time, d.note AS Note FROM users u
        JOIN diagnoses d ON u.id = d.psychologist_id
        JOIN illnesses i ON d.illness_id = i.id
        WHERE d.id = ${consultationId}`;
        // WHERE d.id = ${consultationId}`;
        // // let consultationViewQuery = `SELECT CONCAT(first_name, ' ', last_name) AS Psychologist, (SELECT CONCAT(first_name, ' ', last_name) AS Patient FROM users u WHERE d.patient_id = u.id) AS Patient, i.name AS Illness, DATE_FORMAT(diagnosed_at, '%Y-%m-%d') AS Date, TIME(diagnosed_at) AS Time, d.note AS Note FROM users u
        // JOIN diagnoses d ON u.id = d.psychologist_id
        // JOIN illnesses i ON d.illness_id = i.id
        // WHERE d.psychologist_id = u.id AND u.username = '${psychologistUserName}' AND d.patient_id = (SELECT id FROM users WHERE username = '${patientUserName}')`;

        database.db.query(consultationViewQuery, (viewErr, viewRows, viewResult) => {

            if (viewErr) {
                res.status(500).json({
                    successful: false,
                    message: viewErr
                });
            }
            else if (viewRows.length == 0) {
                res.status(400).json({
                    successful: false,
                    message: "Consultation Id does not exist."
                });
            }
            else {
                res.status(200).json({
                    successful: true,
                    message: "Successfully got the consultation details",
                    data: viewRows
                });
            }
        });
    }
}


const updateConsultation = (req, res, next) => {
    let consultationId = req.params.id;

    let psychologistId = req.body.psychologist_id;
    let patientId = req.body.patient_id;
    let illnessId = req.body.illness_id;
    let diagnosedAt = req.body.diagnosed_at;
    let note = req.body.note;

    if (!utils.checkMandatoryFields([consultationId, psychologistId, patientId, illnessId, diagnosedAt, note])) {
        res.status(404).json({
            successful: false,
            message: "A consultation credential is not defined."
        });
        return;
    }

    if (!utils.isSameId(psychologistId, patientId)) {
        res.status(400).json({
            successful: false,
            message: "The same ID is entered in both psychologist and patient fields."
        });
        return;
    }

    if (!utils.isString([diagnosedAt, note])) {
        res.status(400).json({
            successful: false,
            message: "Incorrect consultation credential format."
        });
    }

    else {

        let diagnosisSelectAllQuery = `SELECT d.id, d.psychologist_id, d.patient_id, d.illness_id, DATE_FORMAT(d.diagnosed_at, '%Y-%m-%d %k:%i:%s') AS diagnosed_at, d.note FROM diagnoses d WHERE d.id = ${consultationId}`;

        database.db.query(diagnosisSelectAllQuery, (selectErr, selectRows, selectResult) => {
            if (selectErr) {
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else {
                if (selectRows.length > 0) {

                    if (psychologistId == selectRows[0].psychologist_id && patientId == selectRows[0].patient_id && illnessId == selectRows[0].illness_id && diagnosedAt == selectRows[0].diagnosed_at && note == selectRows[0].note) {
                        res.status(400).json({
                            successful: false,
                            message: "No changes were made, same diagnosis details are entered."
                        }); 
                        // console.log(selRows[0].diagnosed_at);
                    }
                    else {

                        let diagnosisUpdateQuery = `UPDATE diagnoses SET psychologist_id = ${psychologistId}, patient_id = ${patientId}, illness_id = ${illnessId}, diagnosed_at = '${diagnosedAt}', note = '${note}' WHERE id = ${consultationId}`;

                        database.db.query(diagnosisUpdateQuery, (updateErr, updateRows, updateResult) => {
                            if (updateErr) {
                                res.status(500).json({
                                    successful: false,
                                    message: updateErr
                                });
                            }
                            else {
                                res.status(200).json({
                                    successful: true,
                                    message: "Successfully updated consultation detail(s)."
                                });
                            }
                        });
                    }
                } 
                else {
                    res.status(400).json({
                        successful: false,
                        message: "Consultation Id does not exist."
                    });
                }
            }
        });
    }
}


const archiveConsultation = (req, res, next) => {

    const consultationId = req.params.id;

    if (!utils.checkMandatoryField(consultationId)) {
        res.status(404).json({
            successful: false,
            message: "A consultation credential is not defined."
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
                    SELECT * FROM diagnoses WHERE id = ${consultationId}`;
    
                    database.db.query(diagnosisSelectAllQuery, (selErr, selRows, selResult) => {
                        if (selErr) {
                            res.status(500).json({
                                successful: false,
                                message: insertErr
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
                                    res.status(200).json({
                                        successful: true,
                                        message: "Successfully archived a diagnosis."
                                    });
                                }
                            });
                        }
                    });
                }
                else {
                    res.status(400).json({
                        successful: false,
                        message: "Consultation Id does not exist."
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