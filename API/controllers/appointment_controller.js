const database = require('../models/connection_db');
const appointmentModel = require('../models/schedule_model');
const utils = require('../../utils');

const bookAppointment = (req, res, next) => {

    let psychologistId = req.body.psychologist_id;
    let patientId = req.body.patient_id;
    let reservedAt = req.body.reserved_at;

    if (!utils.checkMandatoryFields([psychologistId, patientId, reservedAt])) {
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
                let statusId = 2;
                
                let scheduleSelectQuery = `SELECT psychologist_id, patient_id, reserved_at, status_id FROM schedules WHERE psychologist_id = ${psychologistId} AND patient_id = ${patientId} AND reserved_at = '${reservedAt}' AND status_id = ${statusId}`;

                database.db.query(scheduleSelectQuery, (selectErr, selectRows, selectResult) => {
                    if (selectErr) {
                        res.status(500).json({
                            sucessful: false,
                            message: selectErr
                        });
                        console.log(selectRows[0].status_id);
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

    let appointmentSelectQuery = `SELECT s.id AS Id, CONCAT(first_name, ' ', last_name) AS Psychologist, (SELECT CONCAT(first_name, ' ', last_name) AS Patient FROM users u WHERE u.id = s.patient_id) AS Patient, DATE_FORMAT(reserved_at, '%Y-%m-%d') AS Date, TIME(reserved_at) AS Time, st.name AS Status FROM schedules s
    JOIN users u ON s.psychologist_id = u.id
    JOIN statuses st ON s.status_id = st.id
    ORDER BY s.id ASC`;

    database.db.query(appointmentSelectQuery, (selectErr, selectRows, selectResult) => {

        if (selectErr) {
            res.status(500).json({
                successful: false,
                message: selectErr
            });
        }
        else if (selectRows.length == 0) {
            res.status(400).json({
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
    //let statusId = req.body.status_id;

    if (!utils.checkMandatoryFields([appointmentId, psychologistId, patientId, reservedAt])) {
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
        let appointmentSelectAllQuery = `SELECT id, s.psychologist_id, s.patient_id, DATE_FORMAT(s.reserved_at, '%Y-%m-%d %k:%i:%s') AS reserved_at, s.status_id FROM schedules s WHERE s.id = ${appointmentId}`;
        
        database.db.query(appointmentSelectAllQuery, (selectErr, selectRows, selectResult) => {
            if (selectErr) {
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else {
                if (selectRows.length > 0) {

                    if (psychologistId == selectRows[0].psychologist_id && patientId == selectRows[0].patient_id && reservedAt == selectRows[0].reserved_at) {
                        res.status(400).json({
                            successful: false,
                            message: "No changes were made, same schedule details are entered."
                        }); 
                    }
                    else {
                        let appointmentUpdateQuery = `UPDATE schedules SET psychologist_id = ${psychologistId}, patient_id = ${patientId}, reserved_at = '${reservedAt}' WHERE id = ${appointmentId}`;

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


const cancelAppointment = (req, res, next) => {
    let appointmentId = req.params.id;

    if (!utils.checkMandatoryField(appointmentId)) {
        res.status(404).json({
            successful: false,
            message: "Appointment credential is missing."
        });
    }

    else {
        let appointmentIdSelectQuery = `SELECT id, status_id FROM schedules WHERE id = ${appointmentId}`;

        database.db.query(appointmentIdSelectQuery, (selectErr, selectRows, selectResult) => {
            if (selectErr) {
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else {
                if (selectRows.length > 0) {
                    if (selectRows[0].status_id == 4) {
                        res.status(400).json({
                            successful: false,
                            message: "No changes were made, status was already updated."
                        });
                    }
                    else {
                        let appointmentStatusUpdateQuery = `UPDATE schedules SET status_id = 4 WHERE id = ${appointmentId}`;

                        database.db.query(appointmentStatusUpdateQuery, (updateErr, updateRows, updateResult) => {
                            if (updateErr) {
                                res.status(500).json({
                                    successful: false,
                                    message: updateErr
                                });
                            }
                            else {
                                res.status(200).json({
                                    successful: true,
                                    message: "Successfully cancelled the appointment."
                                });
                            }
                        });
                    }
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

const acceptAppointment = (req, res, next) => {
    let appointmentId = req.params.id;

    if (!utils.checkMandatoryField(appointmentId)) {
        res.status(404).json({
            successful: false,
            message: "Appointment credential is missing."
        });
    }

    else {
        let appointmentIdSelectQuery = `SELECT id, status_id FROM schedules WHERE id = ${appointmentId}`;

        database.db.query(appointmentIdSelectQuery, (selectErr, selectRows, selectResult) => {
            if (selectErr) {
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else {
                if (selectRows.length > 0) {
                    if (selectRows[0].status_id == 1) {
                        res.status(400).json({
                            successful: false,
                            message: "No changes were made, status was already updated."
                        });
                    }
                    else {
                        let appointmentStatusUpdateQuery = `UPDATE schedules SET status_id = 1 WHERE id = ${appointmentId}`;

                        database.db.query(appointmentStatusUpdateQuery, (updateErr, updateRows, updateResult) => {
                            if (updateErr) {
                                res.status(500).json({
                                    successful: false,
                                    message: updateErr
                                });
                            }
                            else {
                                res.status(200).json({
                                    successful: true,
                                    message: "Successfully accepted the appointment."
                                });
                            }
                        });
                    }
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
    updateAppointment,
    cancelAppointment,
    acceptAppointment
}