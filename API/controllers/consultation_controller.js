const database = require('../models/connection_db');
const consultationModel = require('../models/diagnosis_model');
const utils = require('../../utils');

const addConsultation = (req, res, next) => {

    let psychologistId = req.body.psychologist_id;
    let patientId = req.body.patient_id;
    let illnessId = req.body.illness_id;
    let diagnosedAt = req.body.diagnosed_at;
    let note = req.body.note;

    if(!utils.checkMandatoryFields([psychologistId, patientId, illnessId, diagnosedAt, note])){
        res.status(404).json({
            successful: false,
            message: "A consultation credential is not defined."
        });
        return;
    }

    if(!utils.isSameId(psychologistId, patientId)){
        res.status(400).json({
            successful: false,
            message: "The same ID is entered in both psychologist and patient fields."
        });
    }
    
    else{
        let diagnosisSelectQuery = `SELECT psychologist_id, patient_id, illness_id, diagnosed_at FROM diagnoses WHERE psychologist_id = ${psychologistId} AND patient_id = ${patientId} AND illness_id = ${illnessId} AND diagnosed_at = '${diagnosedAt}'`;
        

        database.db.query(diagnosisSelectQuery, (selectErr, selectRows, selectResult) => {
            if(selectErr){
                res.status(500).json({
                    sucessful: false,
                    message: selectErr
                });
            }
            else{
                if(selectRows.length > 0) {
                    res.status(400).json({
                        sucessful: false,
                        message: "Diagnosis already exists."
                    });
                }
                else{
                    let diagnosisInsertQuery = `INSERT INTO diagnoses SET ?`;
                    let diagnosisObj = consultationModel.diagnosis_model(psychologistId, patientId, illnessId, diagnosedAt, note);

                    database.db.query(diagnosisInsertQuery, diagnosisObj, (insertErr, insertRows, insertResult) => {
                        if(insertErr){
                            res.status(500).json({
                                successful: false,
                                message: insertErr
                            });
                        }
                        else{
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
    //const consultationId = req.params.id;
    // const psychologistId = req.params.psychologist_id;
    // const patientId = req.params.patient_id;
    const psychologistUserName = req.params.psychologist_username;
    const patientUserName = req.params.patient_username;

    if(!utils.checkMandatoryField([psychologistUserName, patientUserName])){
        res.status(404).json({
            successful: false,
            message: "Consultation username is missing."
        });
        return;
    }

    if(!utils.isSameId(psychologistUserName, patientUserName)){
        res.status(400).json({
            successful: false,
            message: "The same username is entered in both psychologist and patient fields."
        });
    }

    else{
        // let consultationViewQuery = `SELECT CONCAT(first_name, ' ', last_name) AS Psychologist, (SELECT CONCAT(first_name, ' ', last_name) AS Patient FROM users u WHERE u.id = d.patient_id) AS Patient, i.name AS Illness, DATE_FORMAT(diagnosed_at, '%Y-%m-%d') AS Date, TIME(diagnosed_at) AS Time, d.note AS Note FROM users u
        // JOIN diagnoses d ON u.id = d.psychologist_id
        // JOIN illnesses i ON d.illness_id = i.id
        // WHERE d.psychologist_id = ${psychologistId} AND d.patient_id = ${patientId}`;
        //WHERE d.id = ${consultationId}`;
        let consultationViewQuery = `SELECT CONCAT(first_name, ' ', last_name) AS Psychologist, (SELECT CONCAT(first_name, ' ', last_name) AS Patient FROM users u WHERE d.patient_id = u.id) AS Patient, i.name AS Illness, DATE_FORMAT(diagnosed_at, '%Y-%m-%d') AS Date, TIME(diagnosed_at) AS Time, d.note AS Note FROM users u
        JOIN diagnoses d ON u.id = d.psychologist_id
        JOIN illnesses i ON d.illness_id = i.id
        WHERE d.psychologist_id = u.id AND u.username = '${psychologistUserName}' AND d.patient_id = (SELECT id FROM users WHERE username = '${patientUserName}')`;

        database.db.query(consultationViewQuery, (viewErr, viewRows, viewResult) => {

            if(viewErr){
                res.status(500).json({
                    successful: false,
                    message: viewErr
                });
            }
            else if(viewRows.length == 0){
                res.status(400).json({
                    successful: false,
                    message: "Consultation username does not exist."
                });
            }
            else{
                res.status(200).json({
                    successful: true,
                    message: "Successfully got the consultation details",
                    data: viewRows
                });
            }
            
        });
    }


}

module.exports = {
    addConsultation,
    viewConsultationResult
}