const database = require('../models/connection_db');
const userModel = require('../models/user_model');
const utils = require('../../utils');

const addUser = (req, res, next) => {

    let role_num = req.body.role_num;
    let name =  req.body.name;
    let birthDate = req.body.birthdate;
    let gender = req.body.gender;
    let address = req.body.address;
    let email = req.body.email;
    let contact_number = req.body.contact_number;


    if(!utils.checkMandatoryFields([role_num, name, birthDate, gender, address, email, contact_number])) {
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
                    let userObj = userModel.user_model(role_num, name, birthDate, gender, address, email, contact_number);

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
    let userSelectQuery = `SELECT role_num as role, name, birthdate, gender, address, email, contact_number FROM users`;
    
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
                message:"No users available in the database."
            });
        }
        else{

            for(let i in selectRows){

                if(selectRows[i].role == 0){
                    selectRows[i].role = "Psychologist";
                }
                else {
                    selectRows[i].role = "Patient";
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
    

module.exports = {
    addUser,
    viewAllUsers
}