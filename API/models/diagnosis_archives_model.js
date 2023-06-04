const diagnosis_archive_model = (diagnosis_id, psychologist_id, patient_id, illness_id, diagnosed_at, note) => {

    let DiagnosisArchive = {
        diagnosis_id: diagnosis_id,
        psychologist_id: psychologist_id,
        patient_id: patient_id,
        illness_id: illness_id,
        diagnosed_at: diagnosed_at, 
        note: note
    }

    return DiagnosisArchive;

}

module.exports = {
    diagnosis_archive_model
}
