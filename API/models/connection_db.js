const mysql = require('mysql');

//Define the DATABASE DETAILS
//HOST, USER, DATABASE NAME/SCHEMA, PORT (OPTIONAL)

const db = mysql.createConnection({ // ineestablish pa lang yung connection
    host: "localhost",
    user: "root",
    database: "appointment_db"
});


const connectDatabase = () => { //coconnect ka na
    db.connect((error) => {
        if(error){
            console.log("Error connecting to database.");
        }
        else{
            console.log("Successfully connected to the database.");
        }

    });

}

module.exports = { // need ng {} because it is an object - list of variables or functions na need i-export
    db,
    connectDatabase
}