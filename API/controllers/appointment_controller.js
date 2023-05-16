const database = require('../models/connection_db');
const appointmentModel = require('../models/schedule_model');
const utils = require('../../utils');

const bookAppointment = (req, res, next) => {

    let psychologist_id = req.body.psychologist_id;
    let patient_id = req.body.patient_id;
    let reserved_at = req.body.reserved_at;

    if(!utils.checkMandatoryFields([psychologist_id, patient_id, reserved_at])) {
        res.status(404).json({
            successful: false,
            message: "An appointment credential is not defined."
        });
    }

    if(!utils.isSameId(psychologist_id, patient_id)){
        res.status(400).json({
            successful: false,
            message: "The same ID is entered in both psychologist and patient fields."
        });
    }
    
    else {
        let scheduleSelectQuery = `SELECT psychologist_id, patient_id, reserved_at FROM schedules WHERE psychologist_id = ${psychologist_id} AND patient_id = ${patient_id} AND reserved_at = '${reserved_at}'`;

        database.db.query(scheduleSelectQuery, (selectErr, selectRows, selectResult) => {
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
                        message: "Schedule already exists."
                    });
                    console.log(selectRows);
                }
                else{
                    let scheduleInsertQuery = `INSERT INTO schedules SET ?`;
                    let scheduleObj = appointmentModel.schedule_model(psychologist_id, patient_id, reserved_at);

                    database.db.query(scheduleInsertQuery, scheduleObj, (insertErr, insertRows, insertResult) => {
                        if(insertErr){
                            res.status(500).json({
                                successful: false,
                                message: insertErr
                            });
                        }
                        else{
                            res.status(200).json({
                                successful: true,
                                message: "Successfully booked a schedule."
                            });
                        }
                    });
                }
            }

        });
    }

}

module.exports = {
    bookAppointment
}