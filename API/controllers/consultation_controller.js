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


module.exports = {
    addConsultation
}