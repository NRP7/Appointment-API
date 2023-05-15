const schedule_model = (psychologist_id, patient_id, reserved_at) => {

    let Schedule = {
        psychologist_id: psychologist_id,
        patient_id: patient_id,
        reserved_at: reserved_at
    }

    return Schedule;

}

module.exports = {
    schedule_model
}