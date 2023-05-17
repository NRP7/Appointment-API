function checkMandatoryFields(fieldsArr){
    let result = false;

    for (let i = 0; i < fieldsArr.length; i++){

        if (fieldsArr[i] == null) {
            return result;
        }

        if ((fieldsArr[i] == "" && (typeof(fieldsArr[i]) == "string"))){
            return result;
        }
    }
    
    result = true;
    return result

}

function checkMandatoryField(field){
    let result = false;

    if (field == null) {
        return result;
    }

    if ((field == "" && (typeof(field) == "string")) || (field == 0 && (typeof(field) == "number"))){
        return result;
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
    checkMandatoryField,
    isSameId
}