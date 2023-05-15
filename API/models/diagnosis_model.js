const diagnosis_model = (psychologist_id, patient_id, illness_id, diagnosed_at, note) => {

    let Diagnosis = {
        psychologist_id: psychologist_id,
        patient_id: patient_id,
        illness_id: illness_id,
        diagnosed_at: diagnosed_at, 
        note: note
    }

    return Diagnosis;

}

module.exports ={
    diagnosis_model
}
