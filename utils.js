const e = require("express");

function checkMandatoryFields(fieldsArr) {
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

function checkMandatoryField(field) {
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

function isSameId(psychologist_id, patient_id) {

    result = false;

    if(psychologist_id === patient_id){
        return result;
    }
    
    result = true;
    return result;

}

function isString(fieldsArr){
    let result = false;

    for(let i in fieldsArr){
        if(typeof(fieldsArr[i]) != "string"){
            return result;
        }
    }

    result = true;
    return result;

}

// let test = () => {

//     let obj = {
//         "birthdate": "324553",
//         "gender": 345
//     }

//     let birthDate = obj.birthdate;
    
//     let gender = obj.gender;

//     if(!isString([birthDate, gender])){
//         console.log("Is not string");
//     }
//     else{
//         console.log("Is string");
//     } // if gender value is not String, return TRUE
    
// //     console.log(isString(birthDate));


// }

// test();

module.exports = {
    checkMandatoryFields,
    checkMandatoryField,
    isSameId,
    isString
}