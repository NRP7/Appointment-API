const database = require('../models/connection_db');
const userModel = require('../models/user_model');
const utils = require('../../utils');
const bcrypt = require('bcrypt');


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
        return;
    }

    if (utils.containsWhitespace(username)){
        res.status(400).json({
            successful: false,
            message: "Username must not contain any spaces."
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
                        message: "Username already exists."
                    });
                }
                else {
                    const saltRounds = 10;

                    const salt = bcrypt.genSaltSync(saltRounds);
                    const userpass = bcrypt.hashSync(password, salt);

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


const viewAllUsers = (req, res, next) => { // Remove Id and Password - DB fields, as is. => RESOLVED
    let usersSelectQuery = `SELECT role_num AS Status, username AS Username, first_name AS 'First Name', last_name AS 'Last Name', DATE_FORMAT(birthdate, '%Y-%m-%d') AS Birthdate, gender AS Gender, address AS Address, email AS Email, contact_number AS 'Contact Number' FROM users`;
    
    database.db.query(usersSelectQuery, (selectErr, selectRows, selectResult) => {

        if (selectErr) {
            res.status(500).json({
                successful: false,
                message: selectErr
            });
        }
        else if (selectRows.length == 0) {
            res.status(200).json({ // question: 400 but true? or 400 but false? or 200 but true? or 200 but false?  answer: res.status(200) and true
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

    if (!utils.checkMandatoryField(userId)) {
        res.status(404).json({
            successful: false,
            message: "User id is missing."
        });
    }
    else { // Remove Id and Password. => RESOLVED
        let userSelectQuery = `SELECT role_num AS Status, username AS Username, first_name AS 'First Name', last_name AS 'Last Name', DATE_FORMAT(birthdate, '%Y-%m-%d') AS 'Birth Date', gender AS Gender, address AS Address, email AS Email, contact_number AS 'Contact Number' FROM users u WHERE u.id = ${userId}`;
    
        database.db.query(userSelectQuery, (selectErr, selectRows, selectResult) => {

            if (selectErr) {
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else if (selectRows.length == 0) {
                res.status(400).json({
                    successful: false,
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
                    message: "Successfully got the user details",
                    data: selectRows
                });
            }
        });
    }
}


const updateUserDetail = (req, res, next) => { // separate username and password update functionality => RESOLVED

    let userId = req.params.id;

    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    let birthdate = req.body.birthdate;
    let gender = req.body.gender;
    let address = req.body.address;
    let email = req.body.email;
    let contactNumber = req.body.contact_number;

    if (!utils.checkMandatoryFields([userId, firstName, lastName, birthdate, gender, address, email, contactNumber])) {
        res.status(404).json({
            successful: false,
            message: "A field is not defined."
        });
        return;
    }

    if (!utils.isString([firstName, lastName, birthdate, gender, address, email, contactNumber])) {
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

                    let userSelectAllQuery = `SELECT u.first_name, u.last_name, DATE_FORMAT(u.birthdate, '%Y-%m-%d') AS birthdate, u.gender, u.address, u.email, u.contact_number FROM users u WHERE u.id = ${userId}`;

                    database.db.query(userSelectAllQuery, (selErr, selRows, selResult) => {
                        if (selErr) {
                            res.status(500).json({
                                successful: false,
                                message: selErr
                            }); 
                        }
                        else if (firstName == selRows[0].first_name && lastName == selRows[0].last_name && birthdate == selRows[0].birthdate && gender == selRows[0].gender && address == selRows[0].address && email == selRows[0].email && contactNumber == selRows[0].contact_number) {
                            res.status(200).json({
                                successful: true,
                                message: "No changes were made, same user details are entered."
                            });
                        }
                        else {

                            //ALLOW THE UPDATING OF USER DETAILS
                            let userUpdateQuery = `UPDATE users SET first_name = '${firstName}', last_name = '${lastName}', birthdate = '${birthdate}', gender = '${gender}', address = '${address}', email = '${email}', contact_number = '${contactNumber}' WHERE id = '${userId}'`;

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


const updateUsername = (req, res, next) => {

    let userId = req.params.id;

    let username = req.body.username;

    if (!utils.checkMandatoryFields([userId, username])) {
        res.status(404).json({
            successful: false,
            message: "A field is not defined."
        });
        return;
    }

    if (!utils.isString([username])) {
        res.status(400).json({
            successful: false,
            message: "Incorrect username credential format."
        });
        return;
    }

    if (utils.containsWhitespace(username)){
        res.status(400).json({
            successful: false,
            message: "Username must not contain any spaces."
        });
    } 

    else {

        let usernameSelectQuery = `SELECT username FROM users WHERE id = ${userId}`;

        database.db.query(usernameSelectQuery, (selectErr, selectRows, selectResult) => {
            if (selectErr) {
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else {
                if (selectRows.length > 0) {

                    if (username == selectRows[0].username) {
                        res.status(200).json({
                                successful: true,
                                message: "No changes were made, same username is entered."
                            });
                    }
                    else {

                        let usernameUpdateQuery = `UPDATE users SET username = '${username}' WHERE id = ${userId}`;

                        database.db.query(usernameUpdateQuery, (updateErr, updateRows, updateResult) => {
                            if (updateErr) {
                                res.status(500).json({
                                    successful: false,
                                    message: updateErr
                                });
                            }
                            else {
                                res.status(200).json({
                                    successful: true,
                                    message: "Successfully updated username."
                                });
                            }
                        });
                    }
                }
                else {
                    res.status(400).json({
                        successful: false,
                        message: "Username does not exist."
                    });
                }
            }
        });
    }
}


const updateUserPassword = (req, res, next) => {

    let username = req.body.username;
    let currPassword = req.body.current_password;
    let newPassword = req.body.new_password;

    if (!utils.checkMandatoryFields([username, currPassword, newPassword])) {
        res.status(404).json({
            successful: false,
            message: "A field is not defined."
        });
        return;
    }

    if (!utils.isString([username, currPassword, newPassword])) {
        res.status(400).json({
            successful: false,
            message: "Incorrect user credential format."
        });
        return;
    }

    if (currPassword == newPassword) {
        res.status(400).json({
            successful: false,
            message: "The current password is the same with the new password entered."
        });
    }

    else {
        let searchCredentials = `SELECT username, userpass FROM users WHERE username = '${username}'`;

        database.db.query(searchCredentials, (searchErr, searchRows, searchResult) => {
            if (searchErr) {
                res.status(500).json({
                    successful: false,
                    message: searchErr
                });
            }
            else {
                if (searchRows.length > 0) {

                    if (!bcrypt.compareSync(currPassword, searchRows[0].userpass)) {
                        res.status(400).json({
                            successful: false,
                            message: "Current password entered is incorrect."
                        });
                    }
                    else {
                        const saltRounds = 10;

                        const salt = bcrypt.genSaltSync(saltRounds);
                        const userpass = bcrypt.hashSync(newPassword, salt);

                        
                        let userPasswordUpdateQuery = `UPDATE users SET userpass = '${userpass}' WHERE username = '${username}'`;

                        database.db.query(userPasswordUpdateQuery, (updateErr, updateRows, updateResult) => {
                            if (updateErr) {
                                res.status(500).json({
                                    successful: false,
                                    message: updateErr
                                });
                            }
                            else {
                                res.status(200).json({
                                    successful: true,
                                    message: "Successfully updated user password."
                                });
                            }
                        });
                    }
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


const login = (req, res, next) => { // to edit once bcrypt tutorial video is provided. => RESOLVED
    let username = req.body.username;
    let password = req.body.password;

    if (!utils.checkMandatoryFields([username, password])) {
        res.status(404).json({
            successful: false,
            message: "A user credential is missing."
        });
        return;
    }

    if (!utils.isString([username, password])) {
        res.status(400).json({
            successful: false,
            message: "Incorrect user credential format."
        });
    }

    else {

        let searchCredentials = `SELECT username, userpass FROM users WHERE username = '${username}'`;

        database.db.query(searchCredentials, (searchErr, searchRows, searchResult) => {
            if (searchErr) {
                res.status(500).json({
                    successful: false,
                    message: searchErr
                });
            }

            else {
                if (searchRows.length > 0) {

                    if (!bcrypt.compareSync(password, searchRows[0].userpass)) {
                        res.status(400).json({
                            successful: false,
                            message: "Password is incorrect."
                        });
                        return;
                    }

                    res.status(200).json({
                        successful: true,
                        message: "Login Accepted!"
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
    

module.exports = {
    addUser,
    viewAllUsers,
    viewUser,
    updateUsername,
    updateUserDetail,
    updateUserPassword,
    deleteUser,
    login
}