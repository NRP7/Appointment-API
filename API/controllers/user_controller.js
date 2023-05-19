const database = require('../models/connection_db');
const userModel = require('../models/user_model');
const utils = require('../../utils');

const addUser = (req, res, next) => {

    let roleNum = req.body.role_num;
    let username =  req.body.username;
    let userpass = req.body.userpass;
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    let birthdate = req.body.birthdate;
    let gender = req.body.gender;
    let address = req.body.address;
    let email = req.body.email;
    let contactNumber = req.body.contact_number;


    if(!utils.checkMandatoryFields([roleNum, username, userpass, firstName, lastName, birthdate, gender, address, email, contactNumber])) {
        res.status(404).json({
            successful: false,
            message: "A user credential is not defined."
        });
    }
    else {
        let userSelectQuery = `SELECT username FROM users WHERE username = '${username}'`;

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
                    let userObj = userModel.user_model(roleNum, username, userpass, firstName, lastName, birthdate, gender, address, email, contactNumber);

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
    let usersSelectQuery = `SELECT role_num AS Status, username AS Username, PASSWORD('userpass') AS Password, first_name AS 'First Name', last_name AS 'Last Name', DATE_FORMAT(birthdate, '%Y-%m-%d') AS Birthdate, gender AS Gender, address AS Address, email AS Email, contact_number AS 'Contact Number' FROM users`;
    
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
    //const userId = req.params.id;

    const username = req.params.username;

    if(!utils.checkMandatoryField(username)){
        res.status(404).json({
            successful: false,
            //message: "User id is missing."
            message: "User name is missing."
        });
    }
    else {
        // let userSelectQuery = `SELECT role_num AS Status, username AS Name, userpass AS Password, first_name AS 'First Name', last_name AS 'Last Name', birthdate AS 'Birth Date', gender AS Gender, address AS Address, email AS Email, contact_number AS 'Contact Number' FROM users u WHERE u.id = ${userId}`;

        let userSelectQuery = `SELECT role_num AS Status, username AS Username, userpass AS Password, first_name AS 'First Name', last_name AS 'Last Name', DATE_FORMAT(birthdate, '%Y-%m-%d') AS Birthdate, gender AS Gender, address AS Address, email AS Email, contact_number AS 'Contact Number' 
        FROM users u 
        WHERE u.username LIKE '%${username}%'`;
    
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
                    //message:"User id does not exist."
                    message:"User name does not exist."
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

const updateUserDetail = (req, res, next) => {

    const userUserName = req.params.username;

    let username = req.body.username;
    let userpass = req.body.userpass;
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    let birthdate = req.body.birthdate;
    let gender = req.body.gender;
    let address = req.body.address;
    let email = req.body.email;
    let contactNumber = req.body.contact_number;

    if(!utils.checkMandatoryFields([userUserName, username, userpass, firstName, lastName, birthdate, gender, address, email, contactNumber])){
        res.status(404).json({
            successful: false,
            message: "A user credential is not defined."
        });
    }

    if(!utils.isString([username, userpass, firstName, lastName, birthdate, gender, address, email, contactNumber])){
        res.status(400).json({
            successful: false,
            message: "Incorrect user credential format."
        });
    }
    else{
        let userSelectQuery = `SELECT username FROM users WHERE username = '${userUserName}'`;
        database.db.query(userSelectQuery, (selectErr, selectRows, selectResult) => {
            if(selectErr){
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else{
                if(selectRows.length > 0){
                    //ALLOW THE UPDATING OF USER DETAILS
                    let userUpdateQuery = `UPDATE users SET username = '${username}', userpass = '${userpass}', first_name = '${firstName}', last_name = '${lastName}', birthdate = '${birthdate}', gender = '${gender}', address = '${address}', email = '${email}', contact_number = '${contactNumber}' WHERE username = '${userUserName}'`;

                    database.db.query(userUpdateQuery, (updateErr, updateRows, updateResult) => {
                        if(updateErr){
                            res.status(500).json({
                                successful: false,
                                message: updateErr
                            });
                        }
                        else{
                            res.status(200).json({
                                successful: true,
                                message: "Successfully updated user detail(s)."
                            });

                        }

                    });

                }
                else{
                    res.status(400).json({
                        successful: false,
                        message: "User does not exist."
                    });

                }

            }
        });
    }
}

const deleteUser = (req, res, next) => {
    let userUserName = req.params.username;

    if(!utils.checkMandatoryField(userUserName)){
        res.status(404).json({
            successful: false,
            message: "User id is missing."
        });

    }
    else{
        let userSelectQuery = `SELECT username FROM users WHERE username = '${userUserName}'`;

        database.db.query(userSelectQuery, (selectErr, selectRows, selectResult) => {
            if(selectErr){
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else{
                if(selectRows.length > 0){
                    let userDeleteQuery = `DELETE FROM users WHERE username = '${userUserName}'`;

                    database.db.query(userDeleteQuery, (deleteErr, deleteRows, deleteResult) => {
                        if(deleteErr){
                            res.status(500).json({
                                successful: false,
                                message: deleteErr
                            });
                        }
                        else{
                            res.status(200).json({
                                successful: true,
                                message: "Successfully deleted a user."
                            });
                        }
                    });
                }
                else{
                    res.status(400).json({
                        successful: false,
                        message: "User id does not exist."
                    });
                }
            }
        });
    }
}
    

module.exports = {
    addUser,
    viewAllUsers,
    viewUser,
    updateUserDetail,
    deleteUser
}