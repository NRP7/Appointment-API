const database = require('../models/connection_db');
const userModel = require('../models/user_model');
const utils = require('../../utils');
const bcrypt = require('bcrypt');


const addUser = (req, res, next) => {

    let role = req.body.role;
    let username =  req.body.username;
    let password = req.body.password;
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    let birthdate = req.body.birthdate;
    let gender = utils.toSentenceCase(req.body.gender);
    let address = req.body.address;
    let email = req.body.email;
    let contactNumber = req.body.contact_number;


    if (!utils.checkMandatoryFields([role, username, password, firstName, lastName, birthdate, gender, address, email, contactNumber])) { // checks if there are empty or null fields
        res.status(404).json({
            successful: false,
            message: "A field is not defined."
        });
        return;
    }

    if (!utils.isNumber([role])) { // checks if the role is not in number data type
        res.status(400).json({
            successful: false,
            message: "Incorrect role data type."
        });
        return;
    }

    if (![0, 1].includes(role)) { // validates the role number input of the user
        res.status(400).json({
            successful: false,
            message: "Incorrect role input."
        });
        return;
    }

    if (!utils.isString([username, password, firstName, lastName, birthdate, gender, address, email, contactNumber])) { // checks if a field is not in string data type
        res.status(400).json({
            successful: false,
            message: "Incorrect user detail(s) data type."
        });
        return;
    }

    if (!utils.checkUsername(username)) { // validates the input and format of the username
        res.status(400).json({
            successful: false,
            message: "Incorrect username format. Username must be: At least 6 characters long, Must not contain any spaces, and Only accept certain special characters."
        });
        return;
    } 

    if (!utils.checkPassword(password)) { // validates the input and format of the password
        res.status(400).json({
            successful: false,
            message: "Incorrect password format. Password must be: At least 8 characters long, Contains alphanumeric upper and lower case letter(s), and Contains special character(s)."
        });
        return;
    }

    if (!utils.checkDate(birthdate)) { // validates the input and format of the birthdate
        res.status(400).json({
            successful: false,
            message: "Incorrect birthdate input or format. Format must be YYYY-MM-DD."
        });
        return;
    }

    if (!["Male", "Female"].includes(gender)) { // validates the input and format of the gender
        res.status(400).json({
            successful: false,
            message: "Incorrect gender input or format."
        });
        return;
    }

    if (!utils.checkEmail(email)) { // validates the input and format of the email
        res.status(400).json({
            successful: false,
            message: "Incorrect email format."
        });
        return;
    }

    if (!utils.checkContactNumber(contactNumber)) { // validates the input and format of the contact number
        res.status(400).json({
            successful: false,
            message: "Incorrect contact number format."
        });
    }

    else {

        let usernameSelectQuery = `SELECT username FROM users WHERE username = '${username}'`;

        database.db.query(usernameSelectQuery, (usernameSelErr,  usernameSelRows, usernameSelResult) => {
            if (usernameSelErr) {
                res.status(500).json({
                    sucessful: false,
                    message: usernameSelErr
                });
            }
            else {
                if (usernameSelRows.length > 0) { // checks if the username already exists in the DB
                    res.status(400).json({
                        sucessful: false,
                        message: "Username already exists."
                    });
                }
                else {

                    let emailSelectQuery = `SELECT email FROM users WHERE email = '${email}'`;

                    database.db.query(emailSelectQuery, (emailSelErr,  emailSelRows, emailSelResult) => {
                        if (emailSelErr) {
                            res.status(500).json({
                                sucessful: false,
                                message: emailSelErr
                            });
                        }
                        else {
                            if (emailSelRows.length > 0) { // checks if the email already exists in the DB
                                res.status(400).json({
                                    sucessful: false,
                                    message: "Email already exists."
                                });
                            }
                            else {

                                let contactNumSelectQuery = `SELECT contact_number FROM users WHERE contact_number = '${contactNumber}'`;

                                database.db.query(contactNumSelectQuery, (contactNumSelErr,  contactNumSelRows, contactNumSelResult) => {
                                    if (contactNumSelErr) {
                                        res.status(500).json({
                                            sucessful: false,
                                            message: contactNumSelErr
                                        });
                                    }
                                    else {
                                        if (contactNumSelRows.length > 0) { // checks if the contact number already exists in the DB
                                            res.status(400).json({
                                                sucessful: false,
                                                message: "Contact number already exists."
                                            });
                                        }
                                        else {

                                            const saltRounds = 10;

                                            const salt = bcrypt.genSaltSync(saltRounds);
                                            const userpass = bcrypt.hashSync(password, salt);

                                            let userInsertQuery = `INSERT INTO users SET ?`;
                                            let userObj = userModel.user_model(role, username, userpass, firstName, lastName, birthdate, gender, address, email, contactNumber);

                                            database.db.query(userInsertQuery, userObj, (insertErr, insertRows, insertResult) => {
                                                if (insertErr) {
                                                    res.status(500).json({
                                                        successful: false,
                                                        message: insertErr
                                                    });
                                                }
                                                else {
                                                    res.status(200).json({ // response if the user account was successfully created and added to the DB
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
                    });
                }
            }
        });
    }
}


const viewAllUsers = (req, res, next) => { // Remove Id and Password - DB fields, as is. => RESOLVED
    let usersSelectQuery = `SELECT username, first_name, last_name, role, contact_number, email FROM users`;
    
    database.db.query(usersSelectQuery, (selectErr, selectRows, selectResult) => {

        if (selectErr) {
            res.status(500).json({
                successful: false,
                message: selectErr
            });
        }
        else if (selectRows.length == 0) {
            res.status(200).json({ // checks if there are no users in the DB or the DB table is empty
                successful: true,
                message:"No users available in the database."
            });
        }
        else {

            for (let i in selectRows) {

                if (selectRows[i].role == 0) {
                    selectRows[i].role = "Psychologist";
                }
                else {
                    selectRows[i].role = "Patient";
                }
            }

            res.status(200).json({ // response if fetching all users was successful
                successful: true,
                message: "Successfully got all users",
                data: selectRows
            });
        }
    });
}


const viewUserDetails = (req, res, next) => {
    let userId = req.params.id;

    if (!utils.checkMandatoryField(userId)) { // checks if there are empty or null fields
        res.status(404).json({
            successful: false,
            message: "User id is missing."
        });
    }
    else { // Remove Id and Password. => RESOLVED
        let userSelectQuery = `SELECT role, username, first_name, last_name, DATE_FORMAT(birthdate, '%Y-%m-%d') AS birthdate, gender, address, email, contact_number, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at FROM users u WHERE u.id = ${userId}`;
    
        database.db.query(userSelectQuery, (selectErr, selectRows, selectResult) => {

            if (selectErr) {
                res.status(500).json({
                    successful: false,
                    message: selectErr
                });
            }
            else if (selectRows.length == 0) { // checks if the user does not exist in the DB
                res.status(400).json({
                    successful: false,
                    message:"User does not exists."
                });
            }
            else {

                for (let i in selectRows) {

                    if (selectRows[i].role == 0) {
                        selectRows[i].role = "Psychologist";
                    }
                    else {
                        selectRows[i].role = "Patient";
                    }
                }

                res.status(200).json({ // response if fetching a user's details was successful
                    successful: true,
                    message: "Successfully got the user details",
                    data: selectRows
                });
            }
        });
    }
}


const updateUserDetails = (req, res, next) => { // separate username and password update functionality => RESOLVED

    let userId = req.params.id;

    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    let birthdate = req.body.birthdate;
    let gender = req.body.gender;
    let address = req.body.address;
    let email = req.body.email;
    let contactNumber = req.body.contact_number;

    if (!utils.checkMandatoryFields([userId, firstName, lastName, birthdate, gender, address, email, contactNumber])) { // checks if there are empty or null fields
        res.status(404).json({
            successful: false,
            message: "A field is not defined."
        });
        return;
    }

    if (!utils.isString([firstName, lastName, birthdate, gender, address, email, contactNumber])) { // checks if a field is not in string data type
        res.status(400).json({
            successful: false,
            message: "Incorrect user detail(s) data type."
        });
        return;
    }

    if (!utils.checkDate(birthdate)) { // validates the input and format of the birthdate
        res.status(400).json({
            successful: false,
            message: "Incorrect birthdate input or format. Format must be YYYY-MM-DD."
        });
        return;
    }

    if (!["Male", "Female"].includes(gender)) { // validates the input and format of the gender
        res.status(400).json({
            successful: false,
            message: "Incorrect gender input or format."
        });
        return;
    }

    if (!utils.checkEmail(email)) { // validates the input and format of the email
        res.status(400).json({
            successful: false,
            message: "Incorrect email format."
        });
        return;
    }

    if (!utils.checkContactNumber(contactNumber)) { // validates the input and format of the contact number
        res.status(400).json({
            successful: false,
            message: "Incorrect contact number format."
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
                        else if (firstName == selRows[0].first_name && lastName == selRows[0].last_name && birthdate == selRows[0].birthdate && gender == selRows[0].gender && address == selRows[0].address && email == selRows[0].email && contactNumber == selRows[0].contact_number) { // checks if no changes were made in the existing user
                            res.status(200).json({ 
                                successful: true,
                                message: "No changes were made, same user details are entered."
                            });
                        }
                        else {

                            let emailSelectQuery = `SELECT id, email FROM users WHERE email = '${email}'`;

                            database.db.query(emailSelectQuery, (emailSelErr,  emailSelRows, emailSelResult) => {
                                if (emailSelErr) {
                                    res.status(500).json({
                                        sucessful: false,
                                        message: emailSelErr
                                    });
                                }
                                else {
                                    if (emailSelRows.length > 0 && userId != emailSelRows[0].id) { // checks if the email already exists in the DB from a different user
                                        res.status(400).json({
                                            sucessful: false,
                                            message: "Email already exists."
                                        });
                                    }
                                    else {

                                        let contactNumSelectQuery = `SELECT contact_number FROM users WHERE contact_number = '${contactNumber}'`;

                                        database.db.query(contactNumSelectQuery, (contactNumSelErr,  contactNumSelRows, contactNumSelResult) => {
                                            if (contactNumSelErr) {
                                                res.status(500).json({
                                                    sucessful: false,
                                                    message: contactNumSelErr
                                                });
                                            }
                                            else {
                                                if (contactNumSelRows.length > 0 && userId != contactNumSelRows[0].id) { // checks if the contact number already exists in the DB from a different user
                                                    res.status(400).json({
                                                        sucessful: false,
                                                        message: "Contact number already exists."
                                                    });
                                                }
                                                else {

                                                    //ALLOW THE UPDATING OF USER DETAILS
                                                    let userUpdateQuery = `UPDATE users SET first_name = '${firstName}', last_name = '${lastName}', birthdate = '${birthdate}', gender = '${gender}', address = '${address}', email = '${email}', contact_number = '${contactNumber}', updated_at = NOW() WHERE id = '${userId}'`;

                                                    database.db.query(userUpdateQuery, (updateErr, updateRows, updateResult) => {
                                                        if (updateErr) {
                                                            res.status(500).json({
                                                                successful: false,
                                                                message: updateErr
                                                            });
                                                        }
                                                        else {
                                                            res.status(200).json({ // response if the existing user account was successfully updated
                                                                successful: true,
                                                                message: "Successfully updated user detail(s)."
                                                            });
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
                else {
                    res.status(400).json({ // response if the user, based on the user id, does not exist
                        successful: false,
                        message: "User does not exists."
                    });
                }
            }
        });
    }
}


const updateUsername = (req, res, next) => {

    let userId = req.params.id;

    let username = req.body.username;

    if (!utils.checkMandatoryFields([userId, username])) { // checks if there are empty or null fields
        res.status(404).json({
            successful: false,
            message: "A field is not defined."
        });
        return;
    }

    if (!utils.isString([username])) { // checks if a field is not in string data type
        res.status(400).json({
            successful: false,
            message: "Incorrect username credential data type."
        });
        return;
    }

    if (!utils.checkUsername(username)) { // validates the input and format of the username
        res.status(400).json({
            successful: false,
            message: "Incorrect username format. Username must be: At least 6 characters long, Must not contain any spaces, and Only accept certain special characters."
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

                    if (username == selectRows[0].username) { // checks if no changes were made in the existing username
                        res.status(200).json({
                                successful: true,
                                message: "No changes were made, same username is entered."
                            });
                    }
                    else {

                        let usernameUpdateQuery = `UPDATE users SET username = '${username}', updated_at = NOW() WHERE id = ${userId}`;

                        database.db.query(usernameUpdateQuery, (updateErr, updateRows, updateResult) => {
                            if (updateErr) {
                                res.status(500).json({
                                    successful: false,
                                    message: updateErr
                                });
                            }
                            else {
                                res.status(200).json({ // response if the username was successfully updated
                                    successful: true,
                                    message: "Successfully updated username."
                                });
                            }
                        });
                    }
                }
                else {
                    res.status(400).json({ // response if the user, based on the user id, does not exist
                        successful: false,
                        message: "Username does not exists."
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

    if (!utils.checkMandatoryFields([username, currPassword, newPassword])) { // checks if there are empty or null fields
        res.status(404).json({
            successful: false,
            message: "A field is not defined."
        });
        return;
    }

    if (!utils.isString([username, currPassword, newPassword])) { // checks if a field is not in string data type
        res.status(400).json({
            successful: false,
            message: "Incorrect user credential data type."
        });
        return;
    }

    if (!utils.checkUsername(username)) { // validates the input and format of the username
        res.status(400).json({
            successful: false,
            message: "Incorrect username format. Username must be: At least 6 characters long, Must not contain any spaces, and Only accept certain special characters."
        });
        return;
    } 

    if (!utils.checkPassword(currPassword)) { // validates the input and format of the password
        res.status(400).json({
            successful: false,
            message: "Incorrect password format. Password must be: At least 8 characters long, Contains alphanumeric upper and lower case letter(s), and Contains special character(s)."
        });
        return;
    }

    if (!utils.checkPassword(newPassword)) { // validates the input and format of the password
        res.status(400).json({
            successful: false,
            message: "Incorrect password format. Password must be: At least 8 characters long, Contains alphanumeric upper and lower case letter(s), and Contains special character(s)."
        });
        return;
    }

    if (currPassword == newPassword) { // checks if the current password is the same with the new password entered
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

                    if (!bcrypt.compareSync(currPassword, searchRows[0].userpass)) { // checks if the current password entered does not match the password stored in the DB 
                        res.status(400).json({
                            successful: false,
                            message: "Current password entered is incorrect."
                        });
                    }
                    else {
                        const saltRounds = 10;

                        const salt = bcrypt.genSaltSync(saltRounds);
                        const userpass = bcrypt.hashSync(newPassword, salt);

                        
                        let userPasswordUpdateQuery = `UPDATE users SET userpass = '${userpass}', updated_at = NOW() WHERE username = '${username}'`;

                        database.db.query(userPasswordUpdateQuery, (updateErr, updateRows, updateResult) => {
                            if (updateErr) {
                                res.status(500).json({
                                    successful: false,
                                    message: updateErr
                                });
                            }
                            else {
                                res.status(200).json({ // response if the password was successfully updated
                                    successful: true,
                                    message: "Successfully updated user password."
                                });
                            }
                        });
                    }
                }
                else {
                    res.status(400).json({ // response if the user, based on the username, does not exist
                        successful: false,
                        message: "User does not exists."
                    });
                }
            }
        });
    }
}


const deleteUser = (req, res, next) => {
    const userId = req.params.id;

    if (!utils.checkMandatoryField(userId)) { // checks if there are empty or null fields
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
                            res.status(200).json({ // response if the user was successfully deleted
                                successful: true,
                                message: "Successfully deleted a user."
                            });
                        }
                    });
                }
                else {
                    res.status(400).json({ // response if the user, based on the user id, does not exist
                        successful: false,
                        message: "User Id does not exists."
                    });
                }
            }
        });
    }
}


const login = (req, res, next) => { // to edit once bcrypt tutorial video is provided. => RESOLVED
    let username = req.body.username;
    let password = req.body.password;

    if (!utils.checkMandatoryFields([username, password])) { // checks if there are empty or null fields
        res.status(404).json({
            successful: false,
            message: "A user credential is missing."
        });
        return;
    }

    if (!utils.isString([username, password])) { // checks if a field is not in string data type
        res.status(400).json({
            successful: false,
            message: "Incorrect user credential data type."
        });
        return;
    }

    if (!utils.checkUsername(username)) { // validates the input and format of the username
        res.status(400).json({
            successful: false,
            message: "Incorrect username format. Username must be: At least 6 characters long, Must not contain any spaces, and Only accept certain special characters."
        });
        return;
    }

    if (!utils.checkPassword(password)) { // validates the input and format of the password
        res.status(400).json({
            successful: false,
            message: "Incorrect password format. Password must be: At least 8 characters long, Contains alphanumeric upper and lower case letter(s), and Contains special character(s)."
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

                    if (!bcrypt.compareSync(password, searchRows[0].userpass)) { // checks if the password entered does not match the password stored in the DB 
                        res.status(400).json({
                            successful: false,
                            message: "Password is incorrect."
                        });
                        return;
                    }

                    res.status(200).json({ // response if the login is successful and the login credentials were accepted
                        successful: true,
                        message: "Login Accepted!"
                    }); 

                }
                else {
                    res.status(400).json({ // response if the user, based on the username, does not exist
                        successful: false,
                        message: "User does not exists."
                    });
                }
            }
        });
    }
}
    

module.exports = {
    addUser,
    viewAllUsers,
    viewUserDetails,
    updateUsername,
    updateUserDetails,
    updateUserPassword,
    deleteUser,
    login
}