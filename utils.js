
function checkMandatoryFields(fieldsArr) {
    let result = false;

    for (let i = 0; i < fieldsArr.length; i++) {

        if (fieldsArr[i] == null) {
            return result;
        }

        if ((fieldsArr[i] == "" && (typeof(fieldsArr[i]) == "string"))) {
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

    if ((field == "" && (typeof(field) == "string")) || (field == 0 && (typeof(field) == "number"))) {
        return result;
    }
    
    result = true;
    return result

}

function isSameId(psychologist_id, patient_id) {
    let result = false;

    if(psychologist_id === patient_id) {
        return result;
    }
    
    result = true;
    return result;

}

function isString(fieldsArr) {
    let result = false;

    for(let i in fieldsArr){
        if(typeof(fieldsArr[i]) != "string") {
            return result;
        }
    }

    result = true;
    return result;

}

function isNumber(fieldsArr) {
    let result = false;

    for(let i in fieldsArr){
        if(typeof(fieldsArr[i]) != "number") {
            return result;
        }
    }

    result = true;
    return result;

}

function checkUsername(field) {
    
    const regex = /^[a-zA-Z0-9.\-_$@*!]{6,}$/;
    return regex.test(field);

}

function checkPassword(password) {

    const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return regex.test(password);

}

function checkDate(date) {

    let result = false;

    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(date)){
        return result;
    }

    let parts = date.split('-');
    //let year = parseInt(parts[0], 10);
    let month = ( parts[1][0] === '0') ? parseInt(parts[1][1], 10) : parseInt(parts[1], 10);
    let day = ( parts[2][0] === '0') ? parseInt(parts[2][1], 10) : parseInt(parts[2], 10);
    
    if (month < 1 || month > 12) {
        return result;
    }

    if (day < 1 || day > 31) {
        return result;
    }

    result = true;
    return result;
}

function checkTime(time) {

    let result = false;
    let hrs;
    let mins;
    let secs;

    const regex = /^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/;

    const timeSlot = ["08", "09", "10", "11", "13", "14", "15", "16", "17"];

    if (!regex.test(time)) {
        return result;
    }

    let parts = checkTimeFormat(time).split(':');

    hrs = parts[0];
    mins = parts[1];
    secs = parts[2];

    if (!timeSlot.includes(hrs)) {
        return result;
    }

    if (mins != '00' || secs != '00') {
        return result;
    }

    result = true;
    return result;
    
}

function checkTimeFormat(time) {

    if (time.length == 5) {
       time = `${time}:00`;
    }

    return time;

}

function checkEmail(email) {

    const regex = /^[0-9a-z]+(?:\.[0-9a-z]+)*@[a-z0-9]{2,}(?:\.[a-z]{2,})+$/;
    return regex.test(email);

}

function toSentenceCase(str) {

    return str.toLowerCase().charAt(0).toUpperCase() + str.slice(1);

}

function checkContactNumber(contactNum) {

    const regex = /^\(?(\d{4})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
    return regex.test(contactNum);

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
    isString,
    isNumber,
    checkUsername,
    checkEmail,
    checkPassword,
    toSentenceCase,
    checkContactNumber,
    checkDate,
    checkTime,
    checkTimeFormat
}