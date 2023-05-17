const database = require('../models/connection_db');
const userModel = require('../models/user_model');
const utils = require('../../utils');

const addUser = (req, res, next) => {

    let roleNum = req.body.role_num;
    let name =  req.body.name;
    let birthDate = req.body.birthdate;
    let gender = req.body.gender;
    let address = req.body.address;
    let email = req.body.email;
    let contactNumber = req.body.contact_number;


    if(!utils.checkMandatoryFields([roleNum, name, birthDate, gender, address, email, contactNumber])) {
        res.status(404).json({
            successful: false,
            message: "A user credential is not defined."
        });
    }
    else {
        let userSelectQuery = `SELECT name FROM users WHERE name = '${name}'`;

        database.db.query(userSelectQuery, (selectErr,  selectRows, selectResult) => {
            if(selectErr){
                res.status(500).json({
                    sucessful: false,
                    message: selectErr
                });
            }
            else{
                if(selectRows.length > 0) {
                    res.status(400).json({
                        sucessful: false,
                        message: "User Name already exists."
                    });
                }
                else{
                    let userInsertQuery = `INSERT INTO users SET ?`;
                    let userObj = userModel.user_model(roleNum, name, birthDate, gender, address, email, contactNumber);

                    database.db.query(userInsertQuery, userObj, (insertErr, insertRows, insertResult) => {
                        if(insertErr){
                            res.status(500).json({
                                successful: false,
                                message: insertErr
                            });
                        }
                        else{
                            res.status(200).json({
                                successful: true,
                                message: "Successfully added new user."
                            });
                        }
                    });
                }
            }

        });
    }

}

const viewAllUsers = (req, res, next) => {
    let usersSelectQuery = `SELECT role_num AS Status, name AS Name, birthdate AS 'Birth Date', gender AS Gender, address AS Address, email AS Email, contact_number AS 'Contact Number' FROM users`;
    
    database.db.query(usersSelectQuery, (selectErr, selectRows, selectResult) => {

        if(selectErr){
            res.status(500).json({
                successful: false,
                message: selectErr
            });
        }
        else if(selectRows.length == 0){
            res.status(200).json({
                successful: true,
                message:"No users available in the database."
            });
        }
        else{

            for(let i in selectRows){

                if(selectRows[i].Status == 0){
                    selectRows[i].Status = "Psychologist";
                }
                else {
                    selectRows[i].Status = "Patient";
                }
            }

            res.status(200).json({
                successful: true,
                message: "Successfully got all users",
                data: selectRows
            });
        }
    });
}

const viewUser = (req, res, next) => {
    const userId = req.params.id;

    if(!utils.checkMandatoryField(userId)){
        res.status(404).json({
            successful: false,
            message: "User id is missing."
        });
    }
    else {
        let userSelectQuery = `SELECT role_num AS Status, name AS Name, birthdate AS 'Birth Date', gender AS Gender, address AS Address, email AS Email, contact_number AS 'Contact Number' 
        FROM users u 
        WHERE u.id = ${userId}`;
    
        database.db.query(userSelectQuery, (selectErr, selectRows, selectResult) => {

            if(selectErr){
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else if(selectRows.length == 0){
                res.status(200).json({
                    successful: true,
                    message:"User id does not exist."
                });
            }
            else{

                for(let i in selectRows){

                    if(selectRows[i].Status == 0){
                        selectRows[i].Status = "Psychologist";
                    }
                    else {
                        selectRows[i].Status = "Patient";
                    }
                }

                res.status(200).json({
                    successful: true,
                    message: "Successfully got all users",
                    data: selectRows
                });
            }
        });
    }
}
    

module.exports = {
    addUser,
    viewAllUsers,
    viewUser
}