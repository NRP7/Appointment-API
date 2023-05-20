const schedule_model = (psychologist_id, patient_id, reserved_at, status_id) => {

    let Schedule = {
        psychologist_id: psychologist_id,
        patient_id: patient_id,
        reserved_at: reserved_at,
        status_id: status_id
    }

    return Schedule;

}

module.exports = {
    schedule_model
}