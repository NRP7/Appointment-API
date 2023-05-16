function checkMandatoryFields(fieldsArr){
    let result = false;

    for (let i = 0; i < fieldsArr.length; i++){

        if (fieldsArr[i] == null) {
            return result;
        }

        if ((fieldsArr[i] == "" && (typeof(fieldsArr[i]) == "string")) || (fieldsArr[i] == 0 && (typeof(fieldsArr[i]) == "number"))){
            return result;
        }
    }
    
    result = true;
    return result

}

function isSameId(psychologist_id, patient_id){

    result = false;

    if(psychologist_id === patient_id){
        return result;
    }
    
    result = true;
    return result;

}

module.exports = {
    checkMandatoryFields,
    isSameId
}