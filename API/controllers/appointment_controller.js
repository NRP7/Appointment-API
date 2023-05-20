const database = require('../models/connection_db');
const appointmentModel = require('../models/schedule_model');
const utils = require('../../utils');

const bookAppointment = (req, res, next) => {

    let psychologistId = req.body.psychologist_id;
    let patientId = req.body.patient_id;
    let reservedAt = req.body.reserved_at;
    let statusId = req.body.status_id;

    if (!utils.checkMandatoryFields([psychologistId, patientId, reservedAt, statusId])) {
        res.status(404).json({
            successful: false,
            message: "An appointment credential is not defined."
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

        // let userRoleSelectQuery = `SELECT role_num FROM users WHERE id = ${psychologistId}`;

        // database.db.query(userRoleSelectQuery, (roleErr, roleRows, roleResult) => {
        //     if(roleErr){
        //         res.status(500).json({
        //             sucessful: false,
        //             message: roleErr
        //         });
        //     }

        //     if(roleRows[0].role_num == 1){
        //         res.status(400).json({
        //             sucessful: false,
        //             message: "Role is not valid."
        //         });
        //     }
        //     else{
                let scheduleSelectQuery = `SELECT psychologist_id, patient_id, reserved_at, status_id FROM schedules WHERE psychologist_id = ${psychologistId} AND patient_id = ${patientId} AND reserved_at = '${reservedAt}' AND status_id = ${statusId}`;

                database.db.query(scheduleSelectQuery, (selectErr, selectRows, selectResult) => {
                    if (selectErr) {
                        res.status(500).json({
                            sucessful: false,
                            message: selectErr
                        });
                    }
                    else{
                        if (selectRows.length > 0) {
                            res.status(400).json({
                                sucessful: false,
                                message: "Schedule already exists."
                            });
                        }
                        else {
                            let scheduleInsertQuery = `INSERT INTO schedules SET ?`;
                            let scheduleObj = appointmentModel.schedule_model(psychologistId, patientId, reservedAt, statusId);
        
                            database.db.query(scheduleInsertQuery, scheduleObj, (insertErr, insertRows, insertResult) => {
                                if (insertErr) {
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
//         });
//     }
}


const viewAllAppointments = (req, res, next) => {

    let appointmentSelectQuery = `SELECT s.id AS Id, CONCAT(first_name, ' ', last_name) AS Psychologist, (SELECT CONCAT(first_name, ' ', last_name) AS Patient FROM users u WHERE u.id = s.patient_id) AS Patient, DATE_FORMAT(reserved_at, '%Y-%m-%d') AS Date, TIME(reserved_at) AS Time, st.name AS Status FROM users u
    JOIN schedules s ON u.id = s.psychologist_id
    JOIN statuses st ON s.status_id = st.id`;

    database.db.query(appointmentSelectQuery, (selectErr, selectRows, selectResult) => {

        if (selectErr) {
            res.status(500).json({
                successful: false,
                message: selectErr
            });
        }
        else if (selectRows.length == 0) {
            res.status(200).json({
                successful: true,
                message:"No appointment available in the database."
            });
        }
        else {
            res.status(200).json({
                successful: true,
                message: "Successfully got all appointments",
                data: selectRows
            });
        }
    });

}


const updateAppointment = (req, res, next) => {
    let appointmentId = req.params.id;

    let psychologistId = req.body.psychologist_id;
    let patientId = req.body.patient_id;
    let reservedAt = req.body.reserved_at;
    let statusId = req.body.status_id;

    if (!utils.checkMandatoryFields([appointmentId, psychologistId, patientId, reservedAt, statusId])) {
        res.status(404).json({
            successful: false,
            message: "An appointment credential is not defined."
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

    if (!utils.isString([reservedAt])) {
        res.status(400).json({
            successful: false,
            message: "Incorrect reservation credential format."
        });
    }

    else {
        let appointmentSelectQuery = `SELECT id FROM schedules WHERE id = ${appointmentId}`;
        
        database.db.query(appointmentSelectQuery, (selectErr, selectRows, selectResult) => {
            if (selectErr) {
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else {
                if (selectRows.length > 0) {

                    let appointmentSelectAllQuery = `SELECT s.psychologist_id, s.patient_id, DATE_FORMAT(s.reserved_at, '%Y-%m-%d %k:%i:%s') AS reserved_at, s.status_id FROM schedules s WHERE s.id = ${appointmentId}`;

                    database.db.query(appointmentSelectAllQuery, (selErr, selRows, selResult) => {
                        if (selErr) {
                            res.status(500).json({
                                successful: false,
                                message: selErr
                            }); 
                        }
                        else if (psychologistId == selRows[0].psychologist_id && patientId == selRows[0].patient_id && reservedAt == selRows[0].reserved_at && statusId == selRows[0].status_id) {
                            res.status(400).json({
                                successful: false,
                                message: "No changes were made, same schedule details are entered."
                            }); 
                        }
                        else {
                            let appointmentUpdateQuery = `UPDATE schedules SET psychologist_id = ${psychologistId}, patient_id = ${patientId}, reserved_at = '${reservedAt}', status_id = ${statusId} WHERE id = ${appointmentId}`;

                            database.db.query(appointmentUpdateQuery, (updateErr, updateRows, updateResult) => {
                                if (updateErr) {
                                    res.status(500).json({
                                        successful: false,
                                        message: updateErr
                                    });
                                }
                                else {
                                    res.status(200).json({
                                        successful: true,
                                        message: "Successfully updated schedule detail(s)."
                                    });
                                }
                            });
                        }
                    });
                } 
                else {
                    res.status(400).json({
                        successful: false,
                        message: "Schedule does not exist."
                    });
                }
            }
        });
    }
}


module.exports = {
    bookAppointment,
    viewAllAppointments,
    updateAppointment
}