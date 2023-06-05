const database = require('../models/connection_db');
const appointmentModel = require('../models/schedule_model');
const utils = require('../../utils');

const bookAppointment = (req, res, next) => {

    let psychologistId = req.body.psychologist_id;
    let patientId = req.body.patient_id;
    let reservedDate = req.body.reserved_date;
    let reservedTime = req.body.reserved_time;

    if (!utils.checkMandatoryFields([psychologistId, patientId, reservedDate, reservedTime])) { // checks if there are empty or null fields
        res.status(404).json({
            successful: false,
            message: "A field is not defined."
        });
        return;
    }

    if (!utils.isSameId(psychologistId, patientId)) { // checks if the same id is entered in psychologistId and patientId
        res.status(400).json({
            successful: false,
            message: "The same ID is entered in both psychologist and patient fields."
        });
        return;
    }

    if (!utils.isString([reservedDate, reservedTime])) { // checks if the reserved date and time are not in string data type
        res.status(400).json({
            successful: false,
            message: "Incorrect reservation detail(s) data type."
        });
        return;
    }

    if (!utils.checkDate(reservedDate)) { // validates the input and format of the reserved date
        res.status(400).json({
            successful: false,
            message: "Incorrect reserved date input or format. Format must be YYYY-MM-DD."
        });
        return;
    } 

    if (!utils.checkTime(reservedTime)) { // validates the input and format of the reserved time
        res.status(400).json({
            successful: false,
            message: "Incorrect reserved time input or format. Format must either be in HH:MM:SS or HH:MM with minutes and seconds in 00."
        });
    } 
    
    else {

        let reservedAt = `${reservedDate} ${reservedTime}`;

        let scheduleSelectQuery = `SELECT psychologist_id, patient_id, reserved_at, status_id FROM schedules WHERE psychologist_id = ${psychologistId} AND patient_id = ${patientId} AND reserved_at = '${reservedAt}' AND status_id = 2`;

        database.db.query(scheduleSelectQuery, (selectErr, selectRows, selectResult) => {
            if (selectErr) {
                res.status(500).json({
                    sucessful: false,
                    message: selectErr
                });
            }
            else {
                if (selectRows.length > 0) { // validates if the appointment/schedule already exists in the DB
                    res.status(400).json({
                        sucessful: false,
                        message: "Schedule already exists."
                    });
                }
                else {

                    let psychRoleSelectQuery = `SELECT u.role FROM users u JOIN schedules s ON u.id = s.id WHERE u.id = ${psychologistId}`;

                    database.db.query(psychRoleSelectQuery, (psychRoleErr, psychRoleRows, psychRoleResult) => {
                        if (psychRoleErr) {
                            res.status(500).json({
                                sucessful: false,
                                message: psychRoleErr
                            });
                        }
                        else if (psychRoleRows.length == 0) { // validates if the psychologist id does not exists in the DB
                            res.status(400).json({
                                sucessful: false,
                                message: "Psychologist id does not exist."
                            });
                        }
                        else if (psychRoleRows[0].role != 0) { // validates if the role psychologist id is not 0
                            res.status(400).json({
                                sucessful: false,
                                message: "The id entered is not a psychologist."
                            });
                        }
                        else {

                            let patientRoleSelectQuery = `SELECT u.role FROM users u JOIN schedules s ON u.id = s.id WHERE u.id = ${patientId}`;

                            database.db.query(patientRoleSelectQuery, (patientRoleErr, patientRoleRows, patientRoleResult) => {
                                if (patientRoleErr) {
                                    res.status(500).json({
                                        sucessful: false,
                                        message: patientRoleErr
                                    });
                                }
                                else if (patientRoleRows.length == 0) { // validates if the patient id does not exists in the DB
                                    res.status(400).json({
                                        sucessful: false,
                                        message: "Patient id does not exist."
                                    });
                                }
                                else if (patientRoleRows[0].role != 0) { // validates if the role patient id is not 1
                                    res.status(400).json({
                                        sucessful: false,
                                        message: "The id entered is not a patient."
                                    });
                                }
                                else {
                                    let psychologistAvailabilitySelQuery = `SELECT pa.psychologist_id FROM psychologist_availabilities pa WHERE psychologist_id = ${psychologistId} AND day_id = dayofweek('${reservedAt}')`;

                                    database.db.query(psychologistAvailabilitySelQuery, (selErr, selRows, selResult) => {
                                        if (selErr) {
                                            res.status(500).json({
                                                sucessful: false,
                                                message: selErr
                                            });
                                        }
                                        else if (selRows.length == 0) { // checks if the psychologist is not available on the day based on the reservation date
                                            res.status(400).json({
                                                sucessful: false,
                                                message: "The psychologist you selected is not available on that day."
                                            });
                                        }
                                        else {

                                            let specificPsychSchedSelQuery = `SELECT s.id FROM schedules s WHERE psychologist_id = ${psychologistId} AND reserved_at = '${reservedAt}' AND status_id = 1`;

                                            database.db.query(specificPsychSchedSelQuery, (psychSchedErr, psychSchedRows, psychSchedResult) => {
                                                if (psychSchedErr) {
                                                    res.status(500).json({
                                                        sucessful: false,
                                                        message: psychSchedErr
                                                    });
                                                }
                                                else if (psychSchedRows.length > 0) { // checks if the psychologist already has an existing reservation based on the given date and time
                                                    res.status(400).json({
                                                        sucessful: false,
                                                        message: "The psychologist you selected already has an appointment set on that date and time."
                                                    });
                                                }
                                                else {

                                                    let specificPatientSchedSelQuery = `SELECT s.id FROM schedules s WHERE patient_id = ${patientId} AND reserved_at = '${reservedAt}' AND status_id = 1`;

                                                    database.db.query(specificPatientSchedSelQuery, (patientSchedErr, patientSchedRows, patientSchedResult) => {
                                                        if (patientSchedErr) {
                                                            res.status(500).json({
                                                                sucessful: false,
                                                                message: psychSchedErr
                                                            });
                                                        }
                                                        else if (patientSchedRows.length > 0) { // checks if the patient already has an existing appointment based on the given date and time
                                                            res.status(400).json({
                                                                sucessful: false,
                                                                message: "You already have a scheduled appointment at that date and time."
                                                            });
                                                        }
                                                        else {

                                                            let statusId = 2;

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
                                                                    res.status(200).json({ // response if the schedule was booked and the reservation was successful
                                                                        successful: true,
                                                                        message: "Successfully booked a schedule."
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
                            });
                        }
                    });
                }
            }
        });
    }
}

// checks if there are no appointments in the DB or the DB table is empty

const viewPsychologistAppointments = (req, res, next) => { // separate view all appointments for patient and psych Question: paanong separate? => RESOLVED
    let userId = req.params.id;

    let appointmentSelectQuery = `SELECT CONCAT(first_name, ' ', last_name) AS psychologist, (SELECT CONCAT(first_name, ' ', last_name) AS Patient FROM users u WHERE u.id = s.patient_id) AS patient, DATE_FORMAT(reserved_at, '%Y-%m-%d') AS 'appointment_date', TIME_FORMAT(reserved_at, '%H:%i') AS 'appointment_time', st.name AS status FROM schedules s
    JOIN users u ON s.psychologist_id = u.id
    JOIN statuses st ON s.status_id = st.id
    WHERE u.id = ${userId}`;

    database.db.query(appointmentSelectQuery, (selectErr, selectRows, selectResult) => {

        if (selectErr) {
            res.status(500).json({
                successful: false,
                message: selectErr
            });
        }
        else if (selectRows.length == 0) { // checks if there are no appointments in the DB or the DB table is empty
            res.status(200).json({
                successful: true,
                message:"The psychologist has no appointment available in the database."
            });
        }
        else {
            res.status(200).json({ // response if fetching the psychologist's appointment/s was successful
                successful: true,
                message: "Successfully got all the appointments",
                data: selectRows
            });
        }
    });

}


const viewPatientAppointments = (req, res, next) => { // separate view all appointments for patient and psych Question: paanong separate? => RESOLVED
    let userId = req.params.id;

    let appointmentSelectQuery = `SELECT CONCAT(first_name, ' ', last_name) AS patient, (SELECT CONCAT(first_name, ' ', last_name) AS Psychologist FROM users u WHERE u.id = s.psychologist_id) AS psychologist, DATE_FORMAT(reserved_at, '%Y-%m-%d') AS 'appointment_date', TIME_FORMAT(reserved_at, '%H:%i') AS 'appointment_time', st.name AS status FROM schedules s
    JOIN users u ON s.patient_id = u.id
    JOIN statuses st ON s.status_id = st.id
    WHERE u.id = ${userId}`;

    database.db.query(appointmentSelectQuery, (selectErr, selectRows, selectResult) => {

        if (selectErr) {
            res.status(500).json({
                successful: false,
                message: selectErr
            });
        }
        else if (selectRows.length == 0) { // checks if there are no appointments in the DB or the DB table is empty
            res.status(200).json({
                successful: true,
                message:"No appointment available in the database."
            });
        }
        else {
            res.status(200).json({ // response if fetching the patient's appointment/s was successful
                successful: true,
                message: "Successfully got all appointments",
                data: selectRows
            });
        }
    });

}


const updateAppointment = (req, res, next) => { // can only update schedule (reserved_at); add schedule validaiton for both patient and psych => RESOLVEDj
    // update appointment to close => RESOLVED. Note: Once a consulation based on the appointment is added, the consultation status will automatically be updated to "Finished."
    let appointmentId = req.params.id;

    let reservedDate = req.body.reserved_date;
    let reservedTime = req.body.reserved_time;

    if (!utils.checkMandatoryFields([appointmentId, reservedDate, reservedTime])) { // checks if there are empty or null fields
        res.status(404).json({ 
            successful: false,
            message: "A field is not defined."
        });
        return;
    }

    if (!utils.isString([reservedDate, reservedTime])) { // checks if the reserved date and time are not in string data type
        res.status(400).json({
            successful: false,
            message: "Incorrect reservation detail(s) data type."
        });
        return;
    }

    if (!utils.checkDate(reservedDate)) { // validates the input and format of the reserved date
        res.status(400).json({
            successful: false,
            message: "Incorrect reserved date input or format. Format must be YYYY-MM-DD."
        });
        return;
    } 

    if (!utils.checkTime(reservedTime)) { // validates the input and format of the reserved time
        res.status(400).json({
            successful: false,
            message: "Incorrect reserved time input or format. Format must either be in HH:MM:SS or HH:MM with minutes and seconds in 00."
        });
    } 

    else {

        let reservedAt = `${reservedDate} ${reservedTime}`;

        let appointmentSelectAllQuery = `SELECT s.psychologist_id, s.patient_id, DATE_FORMAT(s.reserved_at, '%Y-%m-%d %H:%i:%s') AS reserved_at, s.status_id FROM schedules s WHERE s.id = ${appointmentId}`;

        database.db.query(appointmentSelectAllQuery, (selectErr, selectRows, selectResult) => {
            if (selectErr) {
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else {

                if (selectRows.length > 0) {

                    if (selectRows[0].status_id == 4) { // checks if the appointment was cancelled
                        res.status(400).json({
                            successful: false,
                            message: "The appointment was already cancelled. It is no longer valid."
                        });
                    }
                    else if (selectRows[0].status_id == 5) { // checks if the appointment was already finish
                        res.status(400).json({
                            successful: false,
                            message: "The appointment was already finish. It can no longer be updated."
                        });
                    }
                    else if (reservedAt == selectRows[0].reserved_at) { // checks if no changes were made in the existing appointment
                        res.status(200).json({
                            successful: true,
                            message: "No changes were made, same schedule details are entered."
                        });
                    }
                    else {

                        let psychologistAvailabilitySelQuery = `SELECT pa.psychologist_id FROM psychologist_availabilities pa WHERE psychologist_id = (SELECT psychologist_id FROM schedules WHERE id = ${appointmentId}) AND day_id = dayofweek('${reservedAt}')`;

                        database.db.query(psychologistAvailabilitySelQuery, (selErr, selRows, selResult) => {
                            if (selErr) {
                                res.status(500).json({
                                    sucessful: false,
                                    message: selErr
                                });
                            }
                            else if (selRows.length == 0) { // checks if the psychologist is not available on the day based on the reservation date
                                res.status(400).json({
                                    sucessful: false,
                                    message: "The psychologist you selected is not available on that day."
                                });
                            }
                            else {
                                let specificPsychSchedSelQuery = `SELECT s.id FROM schedules s WHERE psychologist_id = (SELECT psychologist_id FROM schedules WHERE id = ${appointmentId}) AND reserved_at = '${reservedAt}' AND status_id = 1`;

                                database.db.query(specificPsychSchedSelQuery, (psychSchedErr, psychSchedRows, psychSchedResult) => {
                                    if (psychSchedErr) {
                                        res.status(500).json({
                                            sucessful: false,
                                            message: psychSchedErr
                                        });
                                    }
                                    else if (psychSchedRows.length > 0) { // checks if the psychologist already has an existing reservation based on the given date and time
                                        res.status(400).json({
                                            sucessful: false,
                                            message: "The psychologist you selected already has an appointment set on that date and time."
                                        });
                                    }
                                    else {
                                        let specificPatientSchedSelQuery = `SELECT s.id FROM schedules s WHERE patient_id = (SELECT patient_id FROM schedules WHERE id = ${appointmentId}) AND reserved_at = '${reservedAt}' AND status_id = 1`;

                                        database.db.query(specificPatientSchedSelQuery, (patientSchedErr, patientSchedRows, patientSchedResult) => {
                                            if (patientSchedErr) {
                                                res.status(500).json({
                                                    sucessful: false,
                                                    message: psychSchedErr
                                                });
                                            }
                                            else if (patientSchedRows.length > 0) { // checks if the patient already has an existing appointment based on the given date and time
                                                res.status(400).json({
                                                    sucessful: false,
                                                    message: "You already have a scheduled appointment at that date and time."
                                                });
                                            }
                                            else {
                                                
                                                let appointmentUpdateQuery = `UPDATE schedules SET reserved_at = '${reservedAt}', updated_at = NOW() WHERE id = ${appointmentId}`;

                                                database.db.query(appointmentUpdateQuery, (updateErr, updateRows, updateResult) => {
                                                    if (updateErr) {
                                                        res.status(500).json({
                                                            successful: false,
                                                            message: updateErr
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json({ // response if the existing scheduled appointment was successfully updated
                                                            successful: true,
                                                            message: "Successfully updated the scheduled appointment."
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
                else {
                    res.status(400).json({ // response if the schedule, based on the appointment id, does not exist
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

    let reasonForCancellation = req.body.reason_for_cancellation;

    if (!utils.checkMandatoryField(appointmentId, reasonForCancellation)) { // checks if there are empty or null fields
        res.status(404).json({
            successful: false,
            message: "A field is not defined."
        });
        return;
    }

    if (!utils.isString([reasonForCancellation])) { // checks if the reasonForCancellation is not in string data type
        res.status(400).json({
            successful: false,
            message: "Incorrect reason for cancellation data type."
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
                    if (selectRows[0].status_id == 4) { // checks if the appointment was already cancelled
                        res.status(200).json({
                            successful: true,
                            message: "No changes were made, status was already updated."
                        });
                    }
                    else if (selectRows[0].status_id == 5) { // checks if the appointment was already finish
                        res.status(400).json({
                            successful: false,
                            message: "The appointment was already finish. It can no longer be cancelled."
                        });
                    }
                    else {
                        let appointmentStatusUpdateQuery = `UPDATE schedules SET status_id = 4, updated_at = NOW(), reason_for_cancellation = '${reasonForCancellation}' WHERE id = ${appointmentId}`;

                        database.db.query(appointmentStatusUpdateQuery, (updateErr, updateRows, updateResult) => {
                            if (updateErr) {
                                res.status(500).json({
                                    successful: false,
                                    message: updateErr
                                });
                            }
                            else {
                                res.status(200).json({ // response if the appointment was successfully cancelled
                                    successful: true,
                                    message: "Successfully cancelled the appointment."
                                });
                            }
                        });
                    }
                }
                else {
                    res.status(400).json({ // response if the schedule, based on the appointment id, does not exist
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

    if (!utils.checkMandatoryField(appointmentId)) { // checks if there are empty or null fields
        res.status(404).json({
            successful: false,
            message: "A field is not defined."
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

                    if (selectRows[0].status_id == 4) { // checks if the appointment was cancelled
                        res.status(400).json({
                            successful: false,
                            message: "The appointment was already cancelled. It is no longer valid."
                        });
                    }
                    else if (selectRows[0].status_id == 5) { // checks if the appointment was already finish
                        res.status(400).json({
                            successful: false,
                            message: "The appointment was already finish. It can no longer be accepted."
                        });
                    }
                    else if (selectRows[0].status_id == 1) { // checks if the appointment was already accepted
                        res.status(200).json({
                            successful: true,
                            message: "No changes were made, status was already updated."
                        });
                    }
                    else {
                        let appointmentStatusUpdateQuery = `UPDATE schedules SET status_id = 1, updated_at = NOW() WHERE id = ${appointmentId}`;

                        database.db.query(appointmentStatusUpdateQuery, (updateErr, updateRows, updateResult) => {
                            if (updateErr) {
                                res.status(500).json({
                                    successful: false,
                                    message: updateErr
                                });
                            }
                            else {
                                res.status(200).json({ // response if the appointment was successfully accepted
                                    successful: true,
                                    message: "Successfully accepted the appointment."
                                });
                            }
                        });
                    }
                }
                else {
                    res.status(400).json({ // response if the schedule, based on the appointment id, does not exist
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
    viewPsychologistAppointments,
    viewPatientAppointments,
    updateAppointment,
    cancelAppointment,
    acceptAppointment
}