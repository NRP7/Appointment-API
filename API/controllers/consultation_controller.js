const database = require('../models/connection_db');
const consultationModel = require('../models/diagnosis_model');
const utils = require('../../utils');

const addConsultation = (req, res, next) => {

    let psychologist_id = req.body.psychologist_id;
    let patient_id = req.body.patient_id;
    let illness_id = req.body.illness_id;
    let diagnosed_at = req.body.diagnosed_at;
    let note = req.body.note;

    if(!utils.checkMandatoryFields([psychologist_id, patient_id, illness_id, diagnosed_at, note])){
        res.status(404).json({
            successful: false,
            message: "A consultation credential is not defined."
        });
    }

    if(!utils.isSameId(psychologist_id, patient_id)){
        res.status(400).json({
            successful: false,
            message: "The same ID is entered in both psychologist and patient fields."
        });
    }
    
    else{
        let diagnosisSelectQuery = `SELECT psychologist_id, patient_id, illness_id, diagnosed_at FROM diagnoses WHERE psychologist_id = ${psychologist_id} AND patient_id = ${patient_id} AND illness_id = ${illness_id} AND diagnosed_at = '${diagnosed_at}'`;
        

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
                    let diagnosisObj = consultationModel.diagnosis_model(psychologist_id, patient_id, illness_id, diagnosed_at, note);

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
    const consultationId = req.params.id;

    if(!utils.checkMandatoryField(consultationId)){
        res.status(404).json({
            successful: false,
            message: "Consultation id is missing."
        });
    }
    else{
        let consultationViewQuery = `SELECT u.name AS Psychologist, (SELECT name AS Patient FROM users u WHERE u.id = d.patient_id) AS Patient, i.name AS Illness, d.diagnosed_at AS 'Date and Time', d.note AS Note FROM users u
        JOIN diagnoses d ON u.id = d.psychologist_id
        JOIN illnesses i ON d.illness_id = i.id
        WHERE d.id = ${consultationId}`;

        database.db.query(consultationViewQuery, (viewErr, viewRows, viewResult) => {

            if(viewErr){
                res.status(500).json({
                    successful: false,
                    message: viewErr
                });
            }
            else if(viewRows.length == 0){
                res.status(400).json({
                    successful: true,
                    message: "Consultation id does not exist."
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