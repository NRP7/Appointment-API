const database = require('../models/connection_db');
const userModel = require('../models/user_model');
const utils = require('../../utils');
const cryptoJS = require('crypto-js');


const addUser = (req, res, next) => {

    let roleNum = req.body.role_num;
    let username =  req.body.username;
    let password = req.body.password;
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    let birthdate = req.body.birthdate;
    let gender = req.body.gender;
    let address = req.body.address;
    let email = req.body.email;
    let contactNumber = req.body.contact_number;


    if (!utils.checkMandatoryFields([roleNum, username, password, firstName, lastName, birthdate, gender, address, email, contactNumber])) {
        res.status(404).json({
            successful: false,
            message: "A field is not defined."
        });
    }
    else {
        let userSelectQuery = `SELECT username FROM users WHERE username = '${username}'`;

        database.db.query(userSelectQuery, (selectErr,  selectRows, selectResult) => {
            if (selectErr) {
                res.status(500).json({
                    sucessful: false,
                    message: selectErr
                });
            }
            else {
                if (selectRows.length > 0) {
                    res.status(400).json({
                        sucessful: false,
                        message: "User already exists."
                    });
                }
                else {
                    const userpass = cryptoJS.SHA1(password); // SHA1 Encryption is used.
                    //const userpass = cryptoJS.AES.encrypt(password, key);

                    let userInsertQuery = `INSERT INTO users SET ?`;
                    let userObj = userModel.user_model(roleNum, username, userpass, firstName, lastName, birthdate, gender, address, email, contactNumber);

                    database.db.query(userInsertQuery, userObj, (insertErr, insertRows, insertResult) => {
                        if (insertErr) {
                            res.status(500).json({
                                successful: false,
                                message: insertErr
                            });
                        }
                        else {
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
    let usersSelectQuery = `SELECT id AS Id, role_num AS Status, username AS Username, userpass AS Password, first_name AS 'First Name', last_name AS 'Last Name', DATE_FORMAT(birthdate, '%Y-%m-%d') AS Birthdate, gender AS Gender, address AS Address, email AS Email, contact_number AS 'Contact Number' FROM users`;
    
    database.db.query(usersSelectQuery, (selectErr, selectRows, selectResult) => {

        if (selectErr) {
            res.status(500).json({
                successful: false,
                message: selectErr
            });
        }
        else if (selectRows.length == 0) {
            res.status(200).json({
                successful: true,
                message:"No users available in the database."
            });
        }
        else {

            for (let i in selectRows) {

                if (selectRows[i].Status == 0) {
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
    let userId = req.params.id;

    //const username = req.params.username;

    if (!utils.checkMandatoryField(userId)) {
        res.status(404).json({
            successful: false,
            //message: "User Name is missing."
            message: "User id is missing."
        });
    }
    else {
        let userSelectQuery = `SELECT id AS Id, role_num AS Status, username AS Name, userpass AS Password, first_name AS 'First Name', last_name AS 'Last Name', DATE_FORMAT(birthdate, '%Y-%m-%d') AS 'Birth Date', gender AS Gender, address AS Address, email AS Email, contact_number AS 'Contact Number' FROM users u WHERE u.id = ${userId}`;

        // let userSelectQuery = `SELECT role_num AS Status, username AS Username, userpass AS Password, first_name AS 'First Name', last_name AS 'Last Name', DATE_FORMAT(birthdate, '%Y-%m-%d') AS Birthdate, gender AS Gender, address AS Address, email AS Email, contact_number AS 'Contact Number' 
        // FROM users u 
        // WHERE u.username LIKE '%${username}%'`;
    
        database.db.query(userSelectQuery, (selectErr, selectRows, selectResult) => {

            if (selectErr) {
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else if (selectRows.length == 0) {
                res.status(200).json({
                    successful: true,
                    //message:"User Name does not exist."
                    message:"User Id does not exist."
                });
            }
            else {

                for (let i in selectRows) {

                    if (selectRows[i].Status == 0) {
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


const updateUserDetail = (req, res, next) => { // not done yet

    let userId = req.params.id;

    let username = req.body.username;
    let password = req.body.password;
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    let birthdate = req.body.birthdate;
    let gender = req.body.gender;
    let address = req.body.address;
    let email = req.body.email;
    let contactNumber = req.body.contact_number;

    if (!utils.checkMandatoryFields([userId, username, password, firstName, lastName, birthdate, gender, address, email, contactNumber])) {
        res.status(404).json({
            successful: false,
            message: "A field is not defined."
        });
        return;
    }

    if (!utils.isString([username, password, firstName, lastName, birthdate, gender, address, email, contactNumber])) {
        res.status(400).json({
            successful: false,
            message: "Incorrect user credential format."
        });
    }
    else {
        let userSelectQuery = `SELECT id FROM users WHERE id = '${userId}'`;
        database.db.query(userSelectQuery, (selectErr, selectRows, selectResult) => {
            if (selectErr) {
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else {
                if (selectRows.length > 0) {

                    const userpass = cryptoJS.SHA1(password);
                    //ALLOW THE UPDATING OF USER DETAILS
                    let userUpdateQuery = `UPDATE users SET username = '${username}', userpass = '${userpass}', first_name = '${firstName}', last_name = '${lastName}', birthdate = '${birthdate}', gender = '${gender}', address = '${address}', email = '${email}', contact_number = '${contactNumber}' WHERE id = '${userId}'`;

                    database.db.query(userUpdateQuery, (updateErr, updateRows, updateResult) => {
                        if (updateErr) {
                            res.status(500).json({
                                successful: false,
                                message: updateErr
                            });
                        }
                        else {
                            res.status(200).json({
                                successful: true,
                                message: "Successfully updated user detail(s)."
                            });
                        }
                    });
                }
                else {
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
    const userId = req.params.id;

    if (!utils.checkMandatoryField(userId)) {
        res.status(404).json({
            successful: false,
            message: "User Id is missing."
        });
    }
    else {
        let userSelectQuery = `SELECT id FROM users WHERE id = '${userId}'`;

        database.db.query(userSelectQuery, (selectErr, selectRows, selectResult) => {
            if (selectErr) {
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else {
                if (selectRows.length > 0) {
                    let userDeleteQuery = `DELETE FROM users WHERE id = '${userId}'`;

                    database.db.query(userDeleteQuery, (deleteErr, deleteRows, deleteResult) => {
                        if (deleteErr) {
                            res.status(500).json({
                                successful: false,
                                message: deleteErr
                            });
                        }
                        else {
                            res.status(200).json({
                                successful: true,
                                message: "Successfully deleted a user."
                            });
                        }
                    });
                }
                else {
                    res.status(400).json({
                        successful: false,
                        message: "User Id does not exist."
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